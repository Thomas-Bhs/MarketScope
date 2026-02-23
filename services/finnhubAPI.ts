import type { CompanyProfile } from '@/domain/profile';
import type { FinnhubSearchResult } from '@/domain/finnhubSearch';
import type { FinnhubQuote } from '@/domain/finnhubQuote';

//get company profile by symbol
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const res = await fetch(`/api/finnhub/profile?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to fetch finnhub profile' (${res.status}): ${details}`);
  }
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

//catch quote (current price & varation) by symbol
export async function getQuote(symbol: string): Promise<FinnhubQuote> {
  const res = await fetch(`/api/finnhub/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to fetch quote (${res.status}): ${details}`);
  }
  return res.json();
}
