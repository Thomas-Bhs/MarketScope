import { CompanyCard } from '@/components/CompanyCard';
import { getCompanies } from '@/services/companyAPI';
import type { Company } from '@/domain/company';


// Component for home page
export default async function Home() {
  
  const companies: Company[] = await getCompanies();

  return (
    <main className='p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </main>
  );
}
