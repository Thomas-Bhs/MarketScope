export type Company = {
  id: number;
  name: string;
  sector: string;
  score?: number; //optional         
  recommendation?: "BUY" | "HOLD" | "SELL"; //optional
};

