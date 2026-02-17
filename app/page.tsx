'use client';

import { useEffect, useMemo, useState } from 'react';
import { CompanyCard } from '@/components/CompanyCard';
import { getCompanies } from '@/services/companyAPI';
import type { Company } from '@/domain/company';

// Component for home page
export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await getCompanies();
      if (!cancelled) setCompanies(data);
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

  return (
    <main className='p-8'>
      <div className='mb-6'>
        <input
          type='text'
          placeholder='Search companies'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className='border rounded px-3 py-2 w-full max-w-md'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredCompanies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </main>
  );
}
