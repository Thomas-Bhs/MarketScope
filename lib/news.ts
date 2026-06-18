import type { NewsItem } from '@/domain/news';
import { companies } from '@/data/companies';

const companyById: Record<number, (typeof companies)[number]> = Object.fromEntries(
  companies.map((c) => [c.id, c])
);

export async function fetchNewsForCompany(companyId: number): Promise<NewsItem[]> {
  const token = process.env.MARKETAUX_API_TOKEN;
  if (!token) throw new Error('MARKETAUX_API_TOKEN missing');

  const company = companyById[companyId];
  if (!company?.symbol) return [];

  const { symbol, name } = company;
  const search = name ? `"${name}" | ${symbol}` : symbol;

  const params = new URLSearchParams({
    api_token: token,
    symbols: symbol,
    search,
    language: 'en',
    limit: '10',
    sort: 'published_at',
    group_similar: 'true',
    filter_entities: 'true',
    must_have_entities: 'true',
  });

  const res = await fetch(`https://api.marketaux.com/v1/news/all?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Marketaux error (${res.status}): ${details}`);
  }

  const data = await res.json();

  return (data?.data ?? []).map((a: Record<string, unknown>) => ({
    companyId,
    title: String(a.title ?? ''),
    source: String(a.source ?? a.domain ?? 'Marketaux'),
    date: String(a.published_at ?? '').slice(0, 10),
    url: typeof a.url === 'string' ? a.url : undefined,
  }));
}
