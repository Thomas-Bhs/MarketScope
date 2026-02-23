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

export function formatMarketCapMillions(marketCap: number | null | undefined) {
  if (!marketCap || !Number.isFinite(marketCap)) {
    return '—';
  }

  const billions = marketCap / 1_000_000_000;
  const millions = marketCap / 1_000_000;

  if (billions >= 1) {
    return `${billions.toFixed(1)}B`;
  }

  return `${Math.round(millions).toLocaleString()}M`;
}
