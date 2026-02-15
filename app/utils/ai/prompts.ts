
export function buildAnalysisPrompt(newsText: string): string {
  return ` You are a financial news analyst.

TASK:
Based ONLY on the following news HEADLINES (not full articles), infer the likely market sentiment for the company and produce an investment recommendation.

STRICT OUTPUT:
Return ONLY a valid JSON object (no markdown, no extra text).

JSON OUTPUT FORMAT (example shape):
{"score":0,"recommendation":"HOLD","summary":"..."}

FIELD RULES:
- score: integer 0-100
- recommendation: BUY | HOLD | SELL
- summary: 1-2 sentences. Synthesize the headlines; do NOT copy/quote them.

Headlines: ${newsText}`;
}