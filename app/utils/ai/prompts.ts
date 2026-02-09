
export function buildAnalysisPrompt(newsText: string): string {
  return `

Please analyze the following news and return a valid JSON.
No explanations, no markdown.

Format:
{"score":0-100,"recommendation":"BUY|HOLD|SELL","summary":"..."}

News: ${newsText}`;
}