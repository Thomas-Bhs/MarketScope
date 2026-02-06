import { CompanyCard } from '@/components/CompanyCard';
import { getCompanies } from '@/services/companyAPI';
import type { Company } from '@/domain/company';

// fetch data from analysis endpoint
/*async function getAnalysis(): Promise<Company[]> {
  const res = await fetch('http://localhost:3000/api/analysis');
  return res.json();
}
*/

// Component for home page
export default async function Home() {
  //const companies = await getAnalysis();
  const companies: Company[] = await getCompanies();

  return (
    <main className='p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </main>
  );
}
