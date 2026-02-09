import { Analysis } from '../../../domain/analysis';

// Ensure the score is a number between 0 and 100, defaulting to 50 if invalid
function clampScore(n: unknown): number {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x)) return 50;
  return Math.max(0, Math.min(100, Math.round(x)));
}

 export function applyBusinessRules(base: Analysis, newsText: string): Analysis {
  const rec = base.recommendation;
  let score = clampScore(base.score);


  if (rec === 'BUY') score = Math.max(score, 65);
  if (rec === 'SELL') score = Math.min(score, 35);

  const t = newsText.toLowerCase();
  const bumps: Array<[RegExp, number]> = [
    [/record|beats|surpass|strong|growth|up|profit|benefit|earnings/, +8],
    [/launch|new product|innovation/, +5],
    [/lawsuit|investigation|recall|downgrade|miss|decline|down|loss/, -10],
  ];
  // Apply bumps based on news keywords, ensuring the score remains between 0 and 100
  for (const [re, delta] of bumps) {
    //if we find a match in the news text, we adjust the score by the specified delta
    if (re.test(t)) score += delta;
  }

  score = clampScore(score);

  return { ...base, score };
}
