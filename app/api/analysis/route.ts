import { NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';
import type { NewsItem } from '@/domain/news';
import type { Analysis } from '@/domain/analysis';
import { getJsonFromHF } from '@/app/utils/ai/hfJsonCompletion';
import { applyBusinessRules } from '@/app/utils/ai/scoreRules';
import { buildAnalysisPrompt } from '@/app/utils/ai/prompts';

const HF_API_KEY = process.env.HF_API_KEY ?? '';
const client = new InferenceClient(HF_API_KEY);
const cacheDuration = 1000 * 60 * 60;

type AnalysisPayload = { analysis: Analysis; news: NewsItem[]; asOf?: string };
const analysisCache = new Map<string, { value: AnalysisPayload; expiresAt: number }>();

export async function GET(req: Request) {
  if (!HF_API_KEY) return NextResponse.json({ error: 'HF_API_KEY missing' }, { status: 500 });

  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId missing' }, { status: 400 });

  //fetch news from API route
  const newsRes = await fetch(`${url.origin}/api/news?companyId=${encodeURIComponent(companyId)}`, {
    cache: 'no-store',
  });

  if (!newsRes.ok) {
    const details = await newsRes.text();
    return NextResponse.json({ error: 'News API error', details }, { status: newsRes.status });
  }

  // prepare the text for the AI prompt
  const news: NewsItem[] = await newsRes.json();

  //determine the most recent news date
  const asOf = news
    .map((n) => n.date)
    .filter(Boolean)
    .sort()
    .at(-1);

  const newsText = news.map((n) => n.title).join(' | '); //concatenate news titles for the AI prompt

  if (!newsText.trim()) {
    const analysis: Analysis = {
      score: 0,
      recommendation: 'HOLD',
      summary: 'No news available for this company.',
    };
    return NextResponse.json({ analysis, news, asOf });
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
    const { text, json } = await getJsonFromHF({
      client,
      model: 'openai/gpt-oss-20b:ovhcloud',
      prompt,
      max_tokens: 250,
      temperature: 0,
    });

    console.log('AI response:', text, json);

    let analysis: Analysis;

    if (!json) {
      analysis = {
        score: 50,
        recommendation: 'HOLD',
        summary: newsText.slice(0, 200),
      };
    } else {
      try {
        analysis = JSON.parse(json);
      } catch {
        analysis = {
          score: 50,
          recommendation: 'HOLD',
          summary: newsText.slice(0, 200),
        };
      }
    }

    analysis = applyBusinessRules(analysis, newsText);

    console.log('Analysis after rules', analysis);

    const payload: AnalysisPayload = { analysis, news, asOf };

    analysisCache.set(cacheKey, { value: payload, expiresAt: Date.now() + cacheDuration });

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: 'HF API error', details: err }, { status: 500 });
  }
}
