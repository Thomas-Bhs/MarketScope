import { NextResponse } from 'next/server';
import type { CompanyProfile } from '@/domain/profile';

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
      `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 6 * 3600 } } // 6 h — profil stable, géré par Next.js Data Cache
    );

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'Finnhub error', details: `${res.status} - ${details}` },
        { status: res.status }
      );
    }

    const data: Record<string, unknown> = await res.json();

    const profile: CompanyProfile = {
      name: String(data.name ?? ''),
      ticker: String(data.ticker ?? symbol),
      logo: String(data.logo ?? ''),
      industry: String(data.finnhubIndustry ?? ''),
      website: String(data.weburl ?? ''),
      marketCap:
        typeof data.marketCapitalization === 'number'
          ? Math.round(data.marketCapitalization)
          : null,
      country: String(data.country ?? ''),
      exchange: String(data.exchange ?? ''),
    };

    return NextResponse.json(profile);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Finnhub error', details: msg }, { status: 500 });
  }
}
