import type { Company } from "@/domain/company";

export async function getCompanies(): Promise<Company[]> {
  const res = await fetch("http://localhost:3000/api/companies");
  return res.json();
}