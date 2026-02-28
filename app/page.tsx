'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { CompanyCard } from '@/components/CompanyCard';
import { CompanyCarousel } from '@/components/CompanyCarousel';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { Footer } from '@/components/Footer';
import { getCompanies } from '@/services/companyAPI';
import { getCompanyProfile, getQuote } from '@/services/finnhubAPI';
import { mapWithConcurrency } from '@/app/utils/api/mapWithConcurrency';
import { buildMiniCompanyItem } from '@/domain/miniCompany.mapper';

import type { Company } from '@/domain/company';
import type { MiniCompanyItem } from '@/domain/miniCompanyItem';

// Component for home page
export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [miniItems, setMiniItems] = useState<MiniCompanyItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const analysisRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const [heroEntered, setHeroEntered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await getCompanies();

      if (cancelled) return;

      setCompanies(data);
      setSelectedCompanyId((prev) => prev ?? (data?.length ? data[0].id : null));

      const buildCard = await mapWithConcurrency(data, 6, async (company) => {
        const symbol = (company.symbol ?? '').trim().toUpperCase(); // normalize the symbol

        try {
          const [profile, quote] = await Promise.all([getCompanyProfile(symbol), getQuote(symbol)]);

          return buildMiniCompanyItem(company, {
            ticker: profile.ticker ?? symbol,
            logo: profile.logo ? profile.logo : null,
            marketCap: profile.marketCap ?? null,
            price: Number.isFinite(quote.price) ? quote.price : null,
            change: Number.isFinite(quote.change) ? quote.change : null,
            changePct: Number.isFinite(quote.changePct) ? quote.changePct : null,
          });
        } catch {
          return buildMiniCompanyItem(company);
        }
      });

      if (cancelled) return;
      setMiniItems(buildCard);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHeroEntered(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const filteredMiniItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return miniItems;

    return miniItems.filter((it) => {
      return it.name.toLowerCase().includes(q);
    });
  }, [miniItems, query]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) ?? companies[0] ?? null;

  const handleAnalyze = useCallback((id: number) => {
    setSelectedCompanyId(id);
    setAnalysisLoading(true);
    setShowAnalysis(true);

    /*Simulate loading delay (replace later )
    setTimeout(() => {
      setAnalysisLoading(false);
    }, 5000);*/
  }, []);

  const handleLogoClick = useCallback(() => {
    setQuery('');
    setShowAnalysis(false);
    setAnalysisLoading(false);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (!showAnalysis) return;
    // wait for the analysis section to be rendered
    const t = setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => clearTimeout(t);
  }, [showAnalysis, selectedCompanyId]);

  useEffect(() => {
    setShowAnalysis(false);
  }, [query]);

  return (
    <>
      <header
        className=' sticky top-0 z-50
  px-6 pt-6 pb-4
  flex items-center justify-between
 bg-[#101012] border-b border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
      >
        <div className='flex items-start gap-1'>
          <button
            type='button'
            onClick={handleLogoClick}
            aria-label='Back to top'
            className='relative w-[30vw] h-[20vh] max-w-[520px] min-w-[240px] max-h-[140px] min-h-[72px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 rounded-md'
          >
            <Image
              src='/logo_marketscope.png'
              alt='MarketScope'
              fill
              priority
              className='object-cover object-left'
            />
          </button>
        </div>

        <div className='flex-1 max-w-[640px] pt-2'>
          <input
            type='text'
            placeholder='Search'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='
        w-full
        rounded-xl
        bg-white/5
        border border-white/10
        px-4 py-3
        text-white
        placeholder:text-white/40
        focus:outline-none
        focus:ring-2
        focus:ring-white/40
      '
          />
        </div>
      </header>

      <main className='px-4 pb-10'>
        {/* Hero */}
        <section
          className={[
            'mx-auto w-full max-w-[1100px] px-2 pt-10 pb-10',
            'transition-all duration-700 ease-out',
            heroEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ].join(' ')}
        >
          <div className='text-center'>
            <h2 className='text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white'>
              Read the market
            </h2>
            <h3 className='mt-2 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white/60'>
              Act with confidence
            </h3>

            <p className='mt-5 mx-auto max-w-[720px] text-sm sm:text-base text-white/60'>
              A simpler way to explore market data and company insights
            </p>

            <div className='mt-7 flex justify-center'>
              <div className='h-[1px] w-24 bg-white/15' />
            </div>
          </div>
        </section>

        {/* Carousel */}
        <div ref={carouselRef} className='mb-6 scroll-mt-[140px]'>
          <CompanyCarousel
            items={filteredMiniItems}
            selectedId={selectedCompanyId}
            onSelect={(id) => setSelectedCompanyId(id)}
            onAnalyze={handleAnalyze}
          />
        </div>

        {showAnalysis ? (
          <section
            ref={analysisRef}
            className='
              mt-16
              -mx-4
              text-black
              min-h-screen
              py-14 sm:py-18
              bg-gradient-to-b from-white via-slate-50 to-white
              border-t border-black/5
            '
          >
            <div className='mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8 flex justify-center'>
              <div
                className='
                    relative
                    mx-auto
                    h-[calc(100vh-160px)]
                    aspect-[4/5]
                    w-auto
                    max-w-full
                    overflow-y-auto
                    overscroll-contain
                    rounded-3xl
                    bg-white
                    shadow-[0_30px_90px_rgba(0,0,0,0.16)]
                    ring-1 ring-black/10
                    px-5 py-6
                    sm:px-8 sm:py-8
                    lg:px-10 lg:py-10
                  '
              >
                {selectedCompany ? (
                  <>
                    <CompanyCard
                      key={selectedCompany.id}
                      company={selectedCompany}
                      onClose={() => {
                        setShowAnalysis(false);
                        setAnalysisLoading(false);

                        // Animate scroll back to carousel
                        requestAnimationFrame(() => {
                          carouselRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        });
                      }}
                      onReady={() => setAnalysisLoading(false)}
                    />

                    {analysisLoading ? (
                      <div className='absolute inset-0 flex items-center justify-center bg-white'>
                        <AnalysisLoader />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className='text-sm text-black/60'>No companies found.</p>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
