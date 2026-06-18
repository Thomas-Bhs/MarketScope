import { NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY ?? '';

function rangeToPoints(range: string): number {
  switch (range) {
    case '7d': return 7;
    case '6m': return 100;
    default:   return 30;
  }
}

export async function GET(req: Request) {
  if (!ALPHA_VANTAGE_API_KEY) {
    return NextResponse.json({ error: 'ALPHA_VANTAGE_API_KEY missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') ?? '').trim().toUpperCase();
  const range = (url.searchParams.get('range') ?? '1m').trim();

  if (!symbol) {
    return NextResponse.json({ error: 'symbol missing' }, { status: 400 });
  }

  const points = rangeToPoints(range);

  const alphaVantageUrl =
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY` +
    `&symbol=${encodeURIComponent(symbol)}` +
    `&apikey=${encodeURIComponent(ALPHA_VANTAGE_API_KEY)}`;

  try {
    const res = await fetch(alphaVantageUrl, {
      next: { revalidate: 600 }, // 10 min — cache géré par Next.js Data Cache (survit aux cold starts Vercel)
    });

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'Alpha Vantage API error', details: `${res.status} - ${details}` },
        { status: res.status }
      );
    }

    const data: Record<string, unknown> = await res.json();

    if (data?.Note || data?.Information || data?.Error_Message) {
      const msg = String(data?.Note ?? data?.Information ?? data?.Error_Message ?? '');
      return NextResponse.json({ error: 'Alpha Vantage rate limit', details: msg }, { status: 429 });
    }

    const series = data?.['Time Series (Daily)'];
    if (!series || typeof series !== 'object') {
      return NextResponse.json({ error: 'Missing time series in response' }, { status: 502 });
    }

    const typedSeries = series as Record<string, Record<string, string>>;
    const dates = Object.keys(typedSeries).sort().slice(-points);

    const result: Array<{ date: string; close: number }> = dates.map((d) => ({
      date: d,
      close: Number(typedSeries[d]?.['4. close'] ?? typedSeries[d]?.['5. adjusted close'] ?? 0),
    }));

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Alpha Vantage response error', details: msg }, { status: 500 });
  }
}
