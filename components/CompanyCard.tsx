'use client';

import { ScoreChart } from './ScoreChart';
import { useEffect, useState } from 'react';
import { getAnalysis, type AnalysisPayload } from '@/services/analysisAPI';
import { getCompanyProfile, searchCompanies } from '@/services/finnhubAPI';
import type { NewsItem } from '@/domain/news';
import type { Company } from '@/domain/company';
import type { CompanyProfile } from '@/domain/profile';

type Props = {
  company: Company;
};

export function CompanyCard({ company }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisPayload['analysis'] | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  //fecth the AI analysis (news is fetched inside)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const payload = await getAnalysis(company.id);

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const results = await searchCompanies(company.name);

        if (cancelled) return;

        // pick the best result
        const best =
          results.find((r) => r.type === 'Common Stock' && !r.symbol.includes('.')) ?? results[0];

        if (!best?.symbol) {
          setProfile(null);
          return;
        }

        const p = await getCompanyProfile(best.symbol);

        if (!cancelled) setProfile(p);
      } catch (error) {
        if (!cancelled) console.error('Error fetching profile:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [company.id, company.name]);

  return (
    <div className='border p-4 rounded shadow hover:shadow-lg transition'>
      <div className='flex items-center gap-3'>
        {profile?.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logo} alt={`${company.name} logo`} className='h-8 w-8 rounded' />
        ) : null}

        <div>
          <h3 className='font-bold text-lg'>{profile?.name || company.name}</h3>
          <p className='text-sm text-gray-500'>{profile?.industry || company.sector}</p>
        </div>
      </div>

      {profile?.website ? (
        <a
          className='mt-2 inline-block text-sm text-blue-600 hover:underline'
          href={profile.website}
          target='_blank'
          rel='noreferrer'
        >
          Website
        </a>
      ) : null}

      {typeof profile?.marketCap === 'number' ? (
        <p className='mt-1 text-xs text-gray-500'>
          Market cap: {Math.round(profile.marketCap).toLocaleString()}M
        </p>
      ) : null}

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
