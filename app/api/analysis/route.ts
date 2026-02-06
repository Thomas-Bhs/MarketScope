import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { NewsItem } from '@/domain/news';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId missing' }, { status: 400 });

  // Mock news remplace by API
  const news: NewsItem[] = [
    { companyId: 1, title: 'Apple Q1 bénéfices record', source: 'Bloomberg', date: '2026-02-04' },
    {
      companyId: 1,
      title: 'Apple lance un nouveau produit',
      source: 'Yahoo Finance',
      date: '2026-02-05',
    },
  ];

  // prepare the text for the AI prompt
  const newsText = news
    .filter((n) => n.companyId === Number(companyId))
    .map((n) => n.title)
    .join('\n'); //concatenate news titles for the AI prompt

  const prompt = `
  Analyse this news and return a JSON with:
- score : number between 0 and 100 indicating the positive impact of the news on the stock price
- recommendation : BUY / HOLD / SELL
- summary : resume of the news in a few sentence

News :
${newsText}
`;

  //call the AI to analyze the news
  const completion = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = completion.choices[0].message?.content || '{}';

  try {
    const analysis = JSON.parse(text); //transfrom AI response to object
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: 'Invalid AI response', text });
  }
}
