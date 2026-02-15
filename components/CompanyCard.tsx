'use client';

import { ScoreChart } from './ScoreChart';
import { useEffect, useState } from 'react';
import { getAnalysis, type AnalysisPayload } from '@/services/analysisAPI';
import type { NewsItem } from '@/domain/news';
import type { Company } from '@/domain/company';


type Props = {
  company: Company;
};

export function CompanyCard({ company }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisPayload['analysis'] | null>(null);

  //fecth the AI analysis (news is fetched inside)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const payload = await getAnalysis(company.id);

        const result = (await getAnalysis(company.id)) as AnalysisResponse;

        // ignore results if we navigated away before the fetch completed
        if (cancelled) return;

        setAnalysis(payload.analysis);
        setNews(payload.news ?? []);
      } catch (error) {
        if (!cancelled) console.error('Error fetching analysis:', error);
      }
    })();

    //cleanup function to prevent state if we navigate away before the fetch completes
    return () => {
      cancelled = true;
    };
  }, [company.id]);

  return (
    <div className='border p-4 rounded shadow hover:shadow-lg transition'>
      <h3 className='font-bold text-lg'>{company.name}</h3>
      <p className='text-sm text-gray-500'>{company.sector}</p>

      {analysis && (
        <>
          <p className='mt-2'>Score IA: {analysis.score}</p>
          <p className='mt-1 font-semibold'>Recommendation: {analysis.recommendation}</p>
          <p className='mt-1 text-gray-600'>Summary: {analysis.summary}</p>

          {/*ScoreChart update with AI analysis */}
          <div className='mt-3'>
            <ScoreChart
              scores={[
                {
                  date: new Date().toISOString().split('T')[0], //today
                  score: analysis.score,
                },
              ]}
            />
          </div>
        </>
      )}

      {news.length > 0 && (
        <div className='mt-3'>
          <h4 className='font-semibold'>News:</h4>
          <ul className='text-sm list-disc list-inside'>
            {news.map((n) => (
              <li key={`${n.date}-${n.source}-${n.title}`}>
                {n.title} ({n.source}, {n.date})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
