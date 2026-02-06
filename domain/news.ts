export type NewsItem = {
  companyId: number;
  title: string;
  source: string;
  date: string;
  url?: string;    //link to the news article, optional
  summary?: string;  //brief summary of the news, optional
};
