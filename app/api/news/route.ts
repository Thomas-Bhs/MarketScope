import { NextResponse } from 'next/server';
import type { NewsItem } from '@/domain/news';
import { companies } from '@/data/companies';

const MARKETAUX_API_TOKEN = process.env.MARKETAUX_API_TOKEN ?? '';

// transform array to object
const companyById: Record<number, (typeof companies)[number]> = Object.fromEntries(
  companies.map((c) => [c.id, c])
);

export async function GET(req: Request) {
  if (!MARKETAUX_API_TOKEN) {
    return NextResponse.json({ error: 'MARKETAUX_API_TOKEN missing' }, { status: 500 });
  }

  const url = new URL(req.url);

  const companyId = Number(url.searchParams.get('companyId') ?? '1');

  const company = companyById[companyId];
  const symbol = company?.symbol;
  const companyName = company?.name;

  if (!symbol) {
    return NextResponse.json([], { status: 200 });
  }

  const search = companyName ? `"${companyName}" | ${symbol}` : symbol;

  const params = new URLSearchParams({
    api_token: MARKETAUX_API_TOKEN,
    symbols: symbol,
    search,
    language: 'en',
    limit: '10',
    sort: 'published_at',
    group_similar: 'true',
    filter_entities: 'true',
    must_have_entities: 'true',
  });

  const res = await fetch(`https://api.marketaux.com/v1/news/all?${params.toString()}`, {
    next: { revalidate: 3600 }, // refrais le cache toutes les heures
  });

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
