export type Analysis = {
  score: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  summary: string;
};
