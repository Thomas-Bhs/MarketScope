import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

const CACHE_MS = 60 * 1000; // 60s
const quoteCache = new Map<string, { value: any; expiresAt: number }>();
const inFlight = new Map<string, Promise<any>>();

export async function GET(req: Request) {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') ?? '').trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'symbol missing' }, { status: 400 });
  }

  const cached = quoteCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.value);
  }

  if (inFlight.has(symbol)) {
    const data = await inFlight.get(symbol);
    return NextResponse.json(data);
  }

  const requestPromise = (async () => {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(
        FINNHUB_API_KEY
      )}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      throw new Error(`Finnhub quote error: ${res.status} ${res.statusText} - ${details}`);
    }

    const data = await res.json();

    // Finnhub quote fields: c (current), d (change), dp (percent), pc (prev close), t (timestamp)
    const payload = {
      symbol,
      price: Number(data?.c ?? 0),
      change: Number(data?.d ?? 0),
      changePct: Number(data?.dp ?? 0),
      prevClose: Number(data?.pc ?? 0),
      updatedAt: data?.t ? new Date(Number(data.t) * 1000).toISOString() : new Date().toISOString(),
    };

    quoteCache.set(symbol, { value: payload, expiresAt: Date.now() + CACHE_MS });
    return payload;
  })();

  inFlight.set(symbol, requestPromise);

  try {
    const result = await requestPromise;
    return NextResponse.json(result);
  } catch (err: any) {
    if (cached?.value) return NextResponse.json(cached.value);
    return NextResponse.json(
      { error: 'Finnhub quote error', details: err?.message ?? String(err) },
      { status: 500 }
    );
  } finally {
    inFlight.delete(symbol);
  }
}