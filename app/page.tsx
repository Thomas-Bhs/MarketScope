'use client';

import { useEffect, useMemo, useState } from 'react';
import { CompanyCard } from '@/components/CompanyCard';
import { CompanyCarousel } from '@/components/CompanyCarousel';
import { getCompanies } from '@/services/companyAPI';
import type { Company } from '@/domain/company';

// Component for home page
export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await getCompanies();
      if (!cancelled) {
        setCompanies(data);
        // if no company is selected yet, select the first one from the list
        setSelectedCompanyId((prev) => prev ?? (data?.length ? data[0].id : null));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;

    return companies.filter((company) => {
      return company.name.toLowerCase().includes(q);
    });
  }, [companies, query]);

  const selectedCompany =
    filteredCompanies.find((c) => c.id === selectedCompanyId) ?? filteredCompanies[0] ?? null;

  return (
    <>
      <header className='px-4 pt-6 pb-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>MarketScope</h1>
          <p className='text-sm text-white/60'>AI Financial Insights</p>
        </div>

        <button
          className='
        h-10 w-10 rounded-full
        bg-white/5 hover:bg-white/10
        border border-white/10
        flex items-center justify-center
        transition
      '
          aria-label='Theme'
          type='button'
        >
          <span className='text-white/80'>☾</span>
        </button>
      </header>

      <main className='px-4 pb-10'>
        <div className='mb-6'>
          <input
            type='text'
            placeholder='Search companies'
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
            focus:ring-white/20
          '
          />
        </div>

        <div className='mb-6'>
          <CompanyCarousel
            companies={filteredCompanies}
            selectedId={selectedCompanyId}
            onSelect={(id) => setSelectedCompanyId(id)}
          />
        </div>

        {selectedCompany ? (
          <CompanyCard key={selectedCompany.id} company={selectedCompany} />
        ) : (
          <p className='text-sm text-white/60'>No companies found.</p>
        )}
      </main>
    </>
  );
}
