'use client';

import { ScoreChart } from './ScoreChart';
import { useEffect, useState } from 'react';
import { getNewsByCompany } from '@/services/newsAPI';
import {getAnalysis} from '@/services/analysisAPI';
import type { NewsItem } from '@/domain/news';
import type { Company } from '@/domain/company';
import type { Analysis} from '@/domain/analysis';

type Props = {
  company: Company;
};

export function CompanyCard({ company }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
 

  //fecth the news
  useEffect(() => {
    getNewsByCompany(company.id).then(setNews);
  }, [company.id]);

  //fecth the AI analysis
  useEffect(() => {
    getAnalysis(company.id).then(setAnalysis).catch(console.error);
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
              <li key={n.title}>
                {n.title} ({n.source}, {n.date})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
