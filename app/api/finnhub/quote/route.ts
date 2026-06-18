import { NextResponse } from 'next/server';
import type { FinnhubQuote } from '@/domain/finnhubQuote';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

export async function GET(req: Request) {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') ?? '').trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'symbol missing' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(FINNHUB_API_KEY)}`,
      { next: { revalidate: 60 } } // 60 s — prix en quasi-temps-réel, géré par Next.js Data Cache
    );

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'Finnhub quote error', details: `${res.status} - ${details}` },
        { status: res.status }
      );
    }

    const data: Record<string, unknown> = await res.json();

    const payload: FinnhubQuote = {
      symbol,
      price: Number(data?.c ?? 0),
      change: Number(data?.d ?? 0),
      changePct: Number(data?.dp ?? 0),
      prevClose: Number(data?.pc ?? 0),
      updatedAt: data?.t ? new Date(Number(data.t) * 1000).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Finnhub quote error', details: msg }, { status: 500 });
  }
}
