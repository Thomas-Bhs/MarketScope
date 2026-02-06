//test data for companies endpoint
import { NextResponse } from 'next/server'; // remplace response for returning JSON in Next.js API routes

export async function GET() {
  const companies = [
    { id: 1, name: 'Apple', sector: 'Tech' },
    { id: 2, name: 'Microsoft', sector: 'Tech' },
  ];
  return NextResponse.json(companies);
}

