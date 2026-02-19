export type PricePoint = {
  date: string; // "YYYY-MM-DD"
  close: number; // closing price
};

export type PriceRange = '7d' | '1m' | '6m';
