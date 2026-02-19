import type { PricePoint, PriceRange } from '@/domain/pricePoint';

export async function getPrices(symbol: string, range: PriceRange = '1m'): Promise<PricePoint[]> {
  const res = await fetch(`/api/prices?symbol=${encodeURIComponent(symbol)}&range=${range}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to fetch prices (${res.status}): ${details}`);
  }

  return res.json();
}
