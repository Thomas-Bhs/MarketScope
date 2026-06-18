import { NextResponse } from 'next/server';
import type { FinnhubSearchResult } from '@/domain/finnhubSearch';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

export async function GET(req: Request) {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();

  if (!q) {
    return NextResponse.json({ error: 'q missing' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'Finnhub search error', details: `${res.status} - ${details}` },
        { status: res.status }
      );
    }

    const data: { result?: Record<string, unknown>[] } = await res.json();

    const results: FinnhubSearchResult[] = (data?.result ?? []).map((r) => ({
      symbol: String(r.symbol ?? ''),
      description: String(r.description ?? ''),
      type: String(r.type ?? ''),
    }));

    return NextResponse.json(results);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Finnhub search error', details: msg }, { status: 500 });
  }
}
