export type MiniCompanyItem = {
  id: number;
  name: string;
  logo?: string | null;
  marketCap?: number | null;
  price?: number | null;
  changePct?: number | null; //percentage change of stock price
};