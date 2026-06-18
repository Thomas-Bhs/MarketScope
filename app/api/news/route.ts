import { NextResponse } from 'next/server';
import { fetchNewsForCompany } from '@/lib/news';

export async function GET(req: Request) {
  if (!process.env.MARKETAUX_API_TOKEN) {
    return NextResponse.json({ error: 'MARKETAUX_API_TOKEN missing' }, { status: 500 });
  }

  const url = new URL(req.url);
  const companyId = Number(url.searchParams.get('companyId') ?? '1');

  try {
    const news = await fetchNewsForCompany(companyId);
    return NextResponse.json(news);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Failed to fetch news', details: msg }, { status: 500 });
  }
}
