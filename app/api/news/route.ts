import { NextResponse } from 'next/server';
import type { NewsItem } from '@/domain/news';

const MARKETAUX_API_TOKEN = process.env.MARKETAUX_API_TOKEN ?? '';

const companyIdToSymbol: Record<number, string> = {
  1: 'AAPL',
  2: 'MSFT', // exemple
};

export async function GET(req: Request) {
  if (!MARKETAUX_API_TOKEN) {
    return NextResponse.json({ error: 'MARKETAUX_API_TOKEN missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  
  const companyId = Number(url.searchParams.get('companyId') ?? '1');
  //transform the companyId into a stock symbol
  const symbol = companyIdToSymbol[companyId];

  if (!symbol) {
    return NextResponse.json([], { status: 200 });
  }

  const params = new URLSearchParams({
    api_token: MARKETAUX_API_TOKEN,
    symbols: symbol,
    language: 'en',
    limit: '10',
    filter_entities: 'true',
    must_have_entities: 'true',
  });

  const res = await fetch(`https://api.marketaux.com/v1/news/all?${params.toString()}`);


  if (!res.ok) {
    const details = await res.text();
    return NextResponse.json({ error: 'Marketaux error', details }, { status: res.status });
  }

  const data = await res.json();

  const newsData: NewsItem[] = (data?.data ?? []).map((a: any) => ({
    companyId,
    title: a.title ?? '',
    source: a.source ?? a.domain ?? 'Marketaux',
    date: (a.published_at ?? '').slice(0, 10),
  }));

  return NextResponse.json(newsData);
}
