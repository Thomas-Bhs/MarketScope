export function extractJson(text: string): string | null {
  if (!text) return null;

  const match = text.match(/```json([\s\S]*?)```/i);
  if (match) return match[1].trim();

  //verify if the text contains a JSON object by looking for the first '{' and the last '}' and extracting the content in between
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1).trim();
  }

  return null;
}