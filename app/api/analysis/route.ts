import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { InferenceClient } from '@huggingface/inference';
import type { NewsItem } from '@/domain/news';
import type { Analysis } from '@/domain/analysis';
import { getJsonFromHF } from '@/app/utils/ai/hfJsonCompletion';
import { applyBusinessRules } from '@/app/utils/ai/scoreRules';
import { buildAnalysisPrompt } from '@/app/utils/ai/prompts';
import { fetchNewsForCompany } from '@/lib/news';

type AnalysisPayload = { analysis: Analysis; news: NewsItem[]; asOf?: string };

const client = new InferenceClient(process.env.HF_API_KEY ?? '');
const AI_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`HF timeout after ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

async function computeAnalysis(companyId: number): Promise<AnalysisPayload> {
  const news = await fetchNewsForCompany(companyId);

  const asOf = news
    .map((n) => n.date)
    .filter(Boolean)
    .sort()
    .at(-1);

  const newsText = news.map((n) => n.title).join(' | ');

  if (!newsText.trim()) {
    return {
      analysis: { score: 0, recommendation: 'HOLD', summary: 'No news available for this company.' },
      news,
      asOf,
    };
  }

  if ((process.env.AI_ENABLED ?? 'true') !== 'true') {
    return {
      analysis: { score: 72, recommendation: 'HOLD', summary: 'AI disabled via environment configuration.' },
      news,
      asOf,
    };
  }

  let analysis: Analysis;

  try {
    const { text, json } = await withTimeout(getJsonFromHF({
      client,
      model: 'openai/gpt-oss-20b:ovhcloud',
      fallbackModel: 'openai/gpt-oss-20b:ovhcloud', // même modèle = pas de 3e tentative sur un provider différent
      prompt: buildAnalysisPrompt(newsText),
      max_tokens: 250,
      temperature: 0,
    }), AI_TIMEOUT_MS);

    console.log('AI response:', text, json);

    if (!json) {
      analysis = { score: 50, recommendation: 'HOLD', summary: newsText.slice(0, 200) };
    } else {
      try {
        analysis = JSON.parse(json) as Analysis;
      } catch {
        analysis = { score: 50, recommendation: 'HOLD', summary: newsText.slice(0, 200) };
      }
    }

    analysis = applyBusinessRules(analysis, newsText);
    console.log('Analysis after rules:', analysis);
  } catch (err) {
    console.error('HF provider error — returning fallback:', err instanceof Error ? err.message : err);
    analysis = {
      score: 50,
      recommendation: 'HOLD',
      summary: 'AI analysis temporarily unavailable. Please try again later.',
    };
  }

  return { analysis, news, asOf };
}

const getCachedAnalysis = unstable_cache(computeAnalysis, ['analysis'], { revalidate: 3600 });

export async function GET(req: Request) {
  if (!process.env.HF_API_KEY) {
    return NextResponse.json({ error: 'HF_API_KEY missing' }, { status: 500 });
  }
  if (!process.env.MARKETAUX_API_TOKEN) {
    return NextResponse.json({ error: 'MARKETAUX_API_TOKEN missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  const companyIdStr = url.searchParams.get('companyId');
  if (!companyIdStr) {
    return NextResponse.json({ error: 'companyId missing' }, { status: 400 });
  }

  try {
    const payload = await getCachedAnalysis(Number(companyIdStr));
    return NextResponse.json(payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Analysis error', details: msg }, { status: 500 });
  }
}
