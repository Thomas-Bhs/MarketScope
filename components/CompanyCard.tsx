'use client';

import { ScoreChart } from './ScoreChart';
import { useEffect, useRef, useState } from 'react';
import { getAnalysis, type AnalysisResponse } from '@/services/analysisAPI';
import type { Analysis } from '@/domain/analysis';
import { getCompanyProfile, searchCompanies } from '@/services/finnhubAPI';
import type { NewsItem } from '@/domain/news';
import type { Company } from '@/domain/company';
import type { CompanyProfile } from '@/domain/profile';
import { getPrices } from '@/services/pricesAPI';
import type { PricePoint, PriceRange } from '@/domain/pricePoint';
import { recommendationBadgeClass, formatMarketCapMillions } from '@/app/utils/ui/card';

type Props = {
  company: Company;
  onClose?: () => void;
  onReady?: () => void;
};

export function CompanyCard({ company, onClose, onReady }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [range, setRange] = useState<PriceRange>('7d');

  const priceCacheRef = useRef(new Map<string, PricePoint[]>());

  //fecth the AI analysis (news is fetched inside)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const payload: AnalysisResponse = await getAnalysis(company.id);

        if (cancelled) return;

        // `getAnalysis` can return either `Analysis` or `{ analysis, news }`.
        if ('analysis' in payload) {
          setAnalysis(payload.analysis);
          setNews(payload.news ?? []);
        } else {
          setAnalysis(payload);
          setNews([]);
        }

        onReady?.();
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching analysis:', error);
          onReady?.(); // stop loader even if analysis fails
        }
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

    const cacheKey = `${symbol}:${range}`;
    const cached = priceCacheRef.current.get(cacheKey);
    if (cached) {
      setPrices(cached);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await getPrices(symbol, range);
        const next = Array.isArray(data) ? data : [];
        if (cancelled) return;
        // Save to cache and update state
        priceCacheRef.current.set(cacheKey, next);
        setPrices(next);
      } catch (error) {
        if (!cancelled) console.error('Error fetching prices:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile?.ticker, range]);

  return (
    <div className='relative rounded-2xl bg-[#111111] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-5 transition'>
      {onClose ? (
        <button
          type='button'
          aria-label='Close analysis'
          onClick={onClose}
          className='
          absolute right-4 top-4
          h-9 w-9 rounded-full
          bg-white/5 hover:bg-white/10
          border border-white/10
          flex items-center justify-center
          text-white/70 hover:text-white
          transition
        '
        >
          <span className='text-lg leading-none'>×</span>
        </button>
      ) : null}
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
          <p className='text-2xl font-mono font-semibold text-white'>{analysis.score}</p>
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

          {/* Price chart */}
          <div className='mt-4'>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-sm text-white/60'>Price</p>

              {/* Range selector */}
              <div className='inline-flex rounded-xl border border-white/10 bg-white/5 p-1'>
                {(['7d', '1m', '6m'] as const).map((r) => {
                  const active = r === range;
                  return (
                    <button
                      key={r}
                      type='button'
                      onClick={() => setRange(r)}
                      className={[
                        'px-3 py-1.5 text-xs font-semibold rounded-lg transition',
                        active
                          ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                          : 'text-white/70 hover:text-white hover:bg-white/10',
                      ].join(' ')}
                    >
                      {r.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {prices.length > 0 ? (
              <div className='mt-3'>
                <ScoreChart scores={prices.map((p) => ({ date: p.date, score: p.close }))} />
              </div>
            ) : (
              <p className='mt-3 text-sm text-white/50'>No price data available for this range.</p>
            )}
          </div>
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

      {profile?.ticker ? (
        <div className='mt-6 flex justify-center'>
          <a
            className={[
              'h-10',
              'w-[75%]',
              'inline-flex items-center justify-center',
              'rounded-2xl',
              'bg-gradient-to-b from-zinc-300/40 via-zinc-700/80 to-zinc-900/90',
              'hover:from-zinc-200/60 hover:via-zinc-600/85 hover:to-zinc-900/95',
              'border border-zinc-400/30',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_28px_rgba(0,0,0,0.55)]',
              'active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_14px_rgba(0,0,0,0.6)]',
              'text-xs tracking-wide font-semibold text-white',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/40',
              'transition-all duration-200',
            ].join(' ')}
            href={`https://www.traderepublic.com/en-de?instrument=${encodeURIComponent(
              profile.ticker
            )}`}
            target='_blank'
            rel='noreferrer'
            aria-label={`Open ${profile.ticker} on Trade Republic`}
          >
            Trade on Trade Republic
            <span className='ml-3 text-xs text-white/50 font-mono'>{profile.ticker}</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
