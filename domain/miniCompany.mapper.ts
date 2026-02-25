import type { Company } from './company';
import type { MiniCompanyItem } from './miniCompanyItem';

//"Pick" take only the fields, from miniCompanyItem, that we want to add to build a miniCompanyItem
export type MiniExtras = Pick<
  MiniCompanyItem,
  'ticker' | 'logo' | 'marketCap' | 'price' | 'change' | 'changePct'
>;

export function buildMiniCompanyItem(company: Company, extras?: MiniExtras): MiniCompanyItem {
  const symbol = (company.symbol ?? '').trim().toUpperCase(); // normalize the symbol

  return {
    id: company.id,
    name: company.name,
    sector: company.sector,
    symbol,
    ticker: extras?.ticker ?? symbol,
    logo: extras?.logo ?? null,
    marketCap: extras?.marketCap ?? null,
    price: extras?.price ?? null,
    change: extras?.change ?? null,
    changePct: extras?.changePct ?? null,
  };
}
