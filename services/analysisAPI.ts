import { Analysis } from '../domain/analysis';
import type { NewsItem } from '../domain/news';

//can return 2 types of response
export type AnalysisResponse = Analysis | { analysis: Analysis; news: NewsItem[]; asOf?: string };

export async function getAnalysis(companyId: number): Promise<AnalysisResponse> {
  const res = await fetch(`/api/analysis?companyId=${companyId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    let details = '';
    try {
      const data = await res.json();
      details = JSON.stringify(data);
    } catch {
      try {
        details = await res.text();
      } catch {
        details = '';
      }
    }

    throw new Error(`Failed to fetch analysis (${res.status}): ${details}`);
  }

  return res.json();
}
