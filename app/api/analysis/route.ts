import { NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';
import type { NewsItem } from '@/domain/news';
import { Analysis } from '@/domain/analysis';
import { extractJson } from '@/app/utils/ai/extractJson';
import { applyBusinessRules } from '@/app/utils/ai/scoreRules';
import { buildAnalysisPrompt } from '@/app/utils/ai/prompts';

const HF_API_KEY = process.env.HF_API_KEY ?? '';
const client = new InferenceClient(HF_API_KEY);
const cacheDuration = 1000 * 60 * 60;
const analysisCache = new Map<string, { value: Analysis; expiresAt: number }>();

export async function GET(req: Request) {
  if (!HF_API_KEY) return NextResponse.json({ error: 'HF_API_KEY missing' }, { status: 500 });

  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId missing' }, { status: 400 });

  // Mock news remplace by API
  const news: NewsItem[] = [
    { companyId: 1, title: 'Apple Q1 up benefecis', source: 'Bloomberg', date: '2026-02-04' },
    {
      companyId: 1,
      title: 'Apple launch a new product',
      source: 'Yahooz Finance',
      date: '2026-02-05',
    },
  ];

  // prepare the text for the AI prompt
  const newsText = news
    .filter((n) => n.companyId === Number(companyId))
    .map((n) => n.title)
    .join(' | '); //concatenate news titles for the AI prompt

  if (!newsText.trim()) {
    return NextResponse.json({
      score: 0,
      recommendation: 'HOLD',
      summary: 'No news available for this company.',
    });
  }

  const cacheKey = `${companyId}:${newsText}`;
  const cached = analysisCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.value);
  }
  if (cached) analysisCache.delete(cacheKey);

  const prompt = buildAnalysisPrompt(newsText);

  try {
    // call HF for analysis
    const chatCompletion = await client.chatCompletion({
      model: 'openai/gpt-oss-20b:ovhcloud',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
      temperature: 0,
    });

    const text = chatCompletion.choices?.[0]?.message?.content ?? '';

    console.log('AI response:', text);

    let analysis: Analysis;
    const json = extractJson(text);

    try {
      analysis = JSON.parse(json ?? text); //convert the AI response to objet as defined in Analysis type
    } catch {
      //if parsing fails, return a default analysis with 50
      analysis = {
        score: 50,
        recommendation: 'HOLD',
        summary: text.slice(0, 200),
      };
    }

    analysis = applyBusinessRules(analysis, newsText);

    console.log('Analysis after rules', analysis);

    //cache the analysis result for future requests
    analysisCache.set(cacheKey, { value: analysis, expiresAt: Date.now() + cacheDuration });

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json({ error: 'HF API error', details: err }, { status: 500 });
  }
}
