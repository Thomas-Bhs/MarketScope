export type Recommendation = 'BUY' | 'HOLD' | 'SELL';

export function recommendationBadgeClass(rec: Recommendation) {
  switch (rec) {
    case 'BUY':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20';
    case 'SELL':
      return 'bg-rose-500/15 text-rose-300 border-rose-400/20';
    default:
      return 'bg-white/10 text-white/70 border-white/10';
  }
}

//finhub returns market cap in millions, so we need to format it accordingly
export function formatMarketCapMillions(marketCap: number | null | undefined) {
  if (!marketCap || !Number.isFinite(marketCap)) {
    return '—';
  }

  const m = marketCap;

  if(m>= 1_000_000) {
    const trillions = m / 1_000_000;
    return `${trillions.toFixed(2)}T`;
  }

  if (m >= 1_000) {
     const billions = m / 1_000;
     return `${billions.toFixed(2)}B`;
  }

  return `${Math.round(m).toLocaleString()}M`;
}


