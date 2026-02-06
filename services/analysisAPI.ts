import { Analysis } from "../domain/analysis";

export async function getAnalysis(companyId: number): Promise<Analysis> {
  const res = await fetch(`/api/analysis?companyId=${companyId}`);
  if (!res.ok) throw new Error("Failed to fetch analysis");
  return res.json();
}