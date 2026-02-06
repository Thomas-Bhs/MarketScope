import type { NewsItem } from "@/domain/news";

export async function getNews(): Promise<NewsItem[]> {
  const res = await fetch("http://localhost:3000/api/news");
  return res.json();
}

export async function getNewsByCompany(companyId: number): Promise<NewsItem[]> {
  const allNews = await getNews();
  return allNews.filter(n => n.companyId === companyId);
}