import { NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

export async function GET(req: Request) {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY missing' }, { status: 500 });
  }

  const url = new URL(req.url);//local url
  const q = (url.searchParams.get('q') ?? '').trim();//query de recherche, ex: "Apple"

  if (!q) {
    return NextResponse.json({ error: 'q missing' }, { status: 400 });
  }

  const res = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${FINNHUB_API_KEY}`
  );

  if (!res.ok) {
    const details = await res.text();
    return NextResponse.json({ error: 'Finnhub error', details }, { status: res.status });
  }

  const data = await res.json();

  // Normalisation: on garde seulement les champs utiles
  const results = (data?.result ?? []).map((r: any) => ({
    symbol: r.symbol ?? '',
    description: r.description ?? '',
    type: r.type ?? '',
  }));

  return NextResponse.json(results);
}