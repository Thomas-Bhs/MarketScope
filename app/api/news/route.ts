import { NextResponse } from 'next/server';
import type { NewsItem } from '@/domain/news';

// Mock of news
const news: NewsItem[] = [
  {
    companyId: 1,
    title: 'Apple lance un nouveau produit',
    source: 'Yahoo Finance',
    date: '2026-02-05',
  },
  { companyId: 1, title: 'Apple Q1: bénéfices record', source: 'Bloomberg', date: '2026-02-04' },
  {
    companyId: 2,
    title: 'Microsoft annonce des résultats record',
    source: 'Bloomberg',
    date: '2026-02-05',
  },
  { companyId: 2, title: "Microsoft investit dans l'IA", source: 'TechCrunch', date: '2026-02-03' },
];

export async function GET() {
  return NextResponse.json(news);
}
