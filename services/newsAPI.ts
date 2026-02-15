import type { NewsItem } from "@/domain/news";

export async function getNewsByCompany(companyId: number): Promise<NewsItem[]> {
  const res = await fetch(`/api/news?companyId=${companyId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}