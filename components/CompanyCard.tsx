'use client';

import { ScoreChart } from './ScoreChart';
import { useEffect, useState } from 'react';
import { getAnalysis, type AnalysisPayload } from '@/services/analysisAPI';
import { getCompanyProfile, searchCompanies } from '@/services/finnhubAPI';
import type { NewsItem } from '@/domain/news';
import type { Company } from '@/domain/company';
import type { CompanyProfile } from '@/domain/profile';
import { getPrices } from '@/services/pricesAPI';
import type { PricePoint, PriceRange } from '@/domain/pricePoint';
import { recommendationBadgeClass, formatMarketCapMillions } from '@/app/utils/ui/card';

type Props = {
  company: Company;
};

export function CompanyCard({ company }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisPayload['analysis'] | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [range, setRange] = useState<PriceRange>('7d');

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

  useEffect(() => {
    const symbol = profile?.ticker;
    if (!symbol) {
      setPrices([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await getPrices(symbol, range);
        if (!cancelled) setPrices(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) console.error('Error fetching prices:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile?.ticker, range]);

  return (
    <div className='rounded-2xl bg-[#111111] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-5 transition'>
      <div className='flex items-center gap-4'>
        {profile?.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo}
            alt={`${company.name} logo`}
            className='h-10 w-10 rounded-xl bg-white/5 p-1 object-contain'
          />
        ) : null}

        <div>
          <h3 className='font-semibold text-lg tracking-tight text-white'>
            {profile?.name || company.name}
          </h3>
          <p className='text-sm text-white/60'>{profile?.industry || company.sector}</p>
        </div>
      </div>

      {profile?.website ? (
        <a
          className='mt-3 inline-block text-sm text-white/70 hover:text-white transition'
          href={profile.website}
          target='_blank'
          rel='noreferrer'
        >
          Website
        </a>
      ) : null}

      {typeof profile?.marketCap === 'number' ? (
        <p className='mt-2 text-xs text-white/50 font-mono'>
          Market cap: {formatMarketCapMillions(profile.marketCap)}
        </p>
      ) : null}

      {analysis && (
        <>
          <p className='mt-4 text-sm text-white/60'>AI Score</p>
          <p className='text-2xl font-mono font-semibold'>{analysis.score}</p>
          <div className='mt-3 flex items-center gap-2'>
            <span className='text-sm text-white/60'>Recommendation</span>
            <span
              className={[
                'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                recommendationBadgeClass(analysis.recommendation),
              ].join(' ')}
            >
              {analysis.recommendation}
            </span>
          </div>

          <p className='mt-3 text-sm text-white/60 leading-relaxed'>{analysis.summary}</p>

          {/*ScoreChart update with AI analysis */}
          {prices.length > 0 && (
            <div className='mt-3'>
              <ScoreChart scores={prices.map((p) => ({ date: p.date, score: p.close }))} />
            </div>
          )}
        </>
      )}

      {news.length > 0 && (
        <div className='mt-3'>
          <h4 className='font-semibold text-white'>News:</h4>
          <ul className='mt-2 text-sm text-white/60 space-y-2'>
            {news.map((n) => (
              <li key={`${n.date}-${n.source}-${n.title}`}>
                <span className='block'>{n.title}</span>
                <span className='block text-xs text-white/40'>
                  {n.source} • {n.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
