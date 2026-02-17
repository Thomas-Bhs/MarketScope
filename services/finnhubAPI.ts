import type { CompanyProfile } from '@/domain/profile';
import type { FinnhubSearchResult } from '@/domain/finnhubSearch';

//get company profile by symbol
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const res = await fetch(`/api/finnhub/profile?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error('Failed to fetch finnhub profile');
  return res.json();
}

// search company by name
export async function searchCompanies(q: string): Promise<FinnhubSearchResult[]> {
  const res = await fetch(`/api/finnhub/search?q=${encodeURIComponent(q)}`);

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to search companies (${res.status}): ${details}`);
  }

  return res.json();
}
