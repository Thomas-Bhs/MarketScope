import type { Company } from "@/domain/company";

export async function getCompanies(): Promise<Company[]> {
  
    const res = await fetch('/api/companies', { cache: 'no-store' });
    
    if (!res.ok) throw new Error(`Failed to fetch companies (${res.status})`);
  return res.json();
}