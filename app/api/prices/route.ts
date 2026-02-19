import { NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY ?? '';

//cache for prices to avoid API limits and improve performance
const pricesCache = new Map<string, { value: any; expiresAt: number }>();

const inFlightRequests = new Map<string, Promise<Array<{ date: string; close: number }>>>(); // deduplicate concurrent requests

const CACHE_DURATION = 60 * 1000 * 10;

//convert range string to number of points
function rangeToPoints(range: string) {
  switch (range) {
    case '7d':
      return 7;
    case '1m':
      return 30;
    case '6m':
      return 180;
    default:
      return 30;
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

  const cacheKey = `${symbol}_${range}`; //unique key for symbol+range
  const cached = pricesCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.value);
  }

  // If a request is in flight wait for result
  if (inFlightRequests.has(cacheKey)) {
    const data = await inFlightRequests.get(cacheKey);
    return NextResponse.json(data);
  }

  const points = rangeToPoints(range);

  const outputsize = range === '6m' ? 'full' : 'compact';

  const alphaVantageUrl =
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY` +
    `&symbol=${encodeURIComponent(symbol)}` +
    `&outputsize=${outputsize}` +
    `&apikey=${encodeURIComponent(ALPHA_VANTAGE_API_KEY)}`;

  const requestPromise = (async () => {
    const res = await fetch(alphaVantageUrl, { cache: 'no-store' });

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      throw new Error(`Alpha Vantage API error: ${res.status} ${res.statusText} - ${details}`);
    }

    const data = await res.json();

        // Alpha Vantage sometimes returns throttling/info messages when rate-limited
    if (data?.Note || data?.Information || data?.Error_Message) {
      return NextResponse.json(
        {
          error: 'Alpha Vantage response error',
          details: data?.Note ?? data?.Information ?? data?.Error_Message ?? '',
        },
        { status: 429 } //too many requests
      );
    }

    const series = data?.['Time Series (Daily)'];
    if (!series || typeof series !== 'object') {
      throw new Error('Missing time series in response');
    }

    // Take latest N points
    const dates = Object.keys(series).sort().slice(-points);

    const result = dates.map((d) => ({
      date: d,
      close: Number(series[d]?.['4. close'] ?? series[d]?.['5. adjusted close'] ?? 0),
    })); //4. is close price, 5. is adjusted close (after dividends/splits)

    pricesCache.set(cacheKey, {
      value: result,
      expiresAt: Date.now() + CACHE_DURATION,
    });

    return result;
  })();

  inFlightRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return NextResponse.json(result);
  } catch (error: any) {
        // If we have stale cache, serve it instead of failing
        if (cached?.value) {
          return NextResponse.json(cached.value);
        }

    return NextResponse.json(
      { error: 'Alpha Vantage response error', details: error?.message ?? String(error) },
      { status: 500 }
    );
  } finally {
    inFlightRequests.delete(cacheKey);//delete in-flight when the resquest is in cache or failed
  }
}
