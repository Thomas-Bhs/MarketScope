//test data for companies endpoint
import { NextResponse } from 'next/server'; // remplace response for returning JSON in Next.js API routes

export async function GET() {
  const companies = [
    { id: 1, name: 'Apple', sector: 'Tech' },
    { id: 2, name: 'Microsoft', sector: 'Tech' },
    { id: 3, name: 'Nvidia', sector: 'Tech' },
    { id: 4, name: 'Amazon', sector: 'Consumer / Tech' },
  ];
  return NextResponse.json(companies);
}
