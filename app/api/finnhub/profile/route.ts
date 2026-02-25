import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

const CACHE_MS = 6 * 60 * 60 * 1000; // 6 h
const profileCache = new Map<string, { value: any; expiresAt: number }>();

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

  //check cache first
  const cached = profileCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.value);
  }

  if (inFlight.has(symbol)) {
    const data = await inFlight.get(symbol);
    return NextResponse.json(data);
  }

  const requestPromise = (async () => {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
        symbol
      )}&token=${FINNHUB_API_KEY}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      throw new Error(`Finnhub error: ${res.status} ${res.statusText} - ${details}`);
    }

    const data = await res.json();

    const profile = {
      name: data.name ?? '',
      ticker: data.ticker ?? symbol,
      logo: data.logo ?? '',
      industry: data.finnhubIndustry ?? '',
      website: data.weburl ?? '',
      marketCap:
        typeof data.marketCapitalization === 'number'
          ? Math.round(data.marketCapitalization)
          : null,
      country: data.country ?? '',
      exchange: data.exchange ?? '',
    };

    //save in cache
    profileCache.set(symbol, {
      value: profile,
      expiresAt: Date.now() + CACHE_MS,
    });

    return profile;
  })();

  // Save in-flight request
  inFlight.set(symbol, requestPromise);

  try {
    const profile = await requestPromise;
    return NextResponse.json(profile);
  } catch (err: any) {
    if (cached?.value) {
      return NextResponse.json(cached.value);
    }

    return NextResponse.json(
      { error: 'Finnhub error', details: err?.message ?? String(err) },
      { status: 500 }
    );
  } finally {
    inFlight.delete(symbol);
  }
}
