export type MiniCompanyItem = {
  id: number;
  name: string;
  symbol: string;
  sector?: string | null;
  ticker?: string | null;
  logo?: string | null;
  marketCap?: number | null;
  price?: number | null;
  change?: number | null; //absolute change of stock price
  changePct?: number | null; //percentage change of stock price
};
