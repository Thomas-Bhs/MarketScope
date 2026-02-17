import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

export async function GET(req: Request) {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: 'FINNHUB_API_KEY missing' },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const symbol = url.searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'symbol missing' },
      { status: 400 }
    );
  }

  const res = await fetch(
    `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
      symbol
    )}&token=${FINNHUB_API_KEY}`
  );

  if (!res.ok) {
    const details = await res.text();
    return NextResponse.json(
      { error: 'Finnhub error', details },
      { status: res.status }
    );
  }

  const data = await res.json();

  
  const profile = {
    name: data.name ?? '',
    ticker: data.ticker ?? symbol,
    logo: data.logo ?? '',
    industry: data.finnhubIndustry ?? '',
    website: data.weburl ?? '',
    marketCap: typeof data.marketCapitalization === 'number' ? Math.round(data.marketCapitalization) : null,
    country: data.country ?? '',
    exchange: data.exchange ?? '',
  };

  return NextResponse.json(profile);
}