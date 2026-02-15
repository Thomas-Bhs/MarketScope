import { InferenceClient } from '@huggingface/inference';
import { extractJson } from '@/app/utils/ai/extractJson';

type ChatModel =
  | 'openai/gpt-oss-20b:ovhcloud'
  | 'meta-llama/Llama-3.1-8B-Instruct:ovhcloud'
  | 'mistralai/Mistral-7B-Instruct-v0.3:ovhcloud'
  | string;

type HFMessage = { role: 'system' | 'user'; content: string };

export async function getJsonFromHF(params: {
  client: InferenceClient;
  model: ChatModel;
  fallbackModel?: ChatModel;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
}): Promise<{ text: string; json: string | null }> {
  const {
    client,
    model,
    fallbackModel = 'meta-llama/Llama-3.1-8B-Instruct:ovhcloud',
    prompt,
    max_tokens = 250,
    temperature = 0,
  } = params;

  const system: HFMessage = {
    role: 'system',
    content:
      'You are a JSON generator. Reply with ONLY a valid JSON object matching the requested format. No reasoning, no markdown, no extra text.',
  };

  const pickText = (completion: any): string => {
    const msg = completion?.choices?.[0]?.message;
    const content = msg?.content;

    if (typeof content === 'string' && content.trim()) return content;
    
    //some providers return content as an array
    if (Array.isArray(content)) {
      const joined = content.map((x: any) => (typeof x === 'string' ? x : x?.text ?? '')).join('');
      if (joined.trim()) return joined;
    }


    return '';
  };

  // first try
  const completion1 = await client.chatCompletion({
    model,
    messages: [system, { role: 'user', content: prompt }],
    max_tokens,
    temperature,
  });

  let text = pickText(completion1).trim();
  let json = extractJson(text);

  // second retry if no JSON detected
  if (!json) {
    const retryPrompt =
      `${prompt}\n\nIMPORTANT:\n` +
      `Return ONLY the JSON object.\n` +
      `Start with '{' and end with '}'.\n` +
      `No explanations. No additional text.`;

    const completion2 = await client.chatCompletion({
      model,
      messages: [system, { role: 'user', content: retryPrompt }],
      max_tokens,
      temperature,
    });

    text = pickText(completion2).trim();
    json = extractJson(text);
  }

  // final fallback if still no JSON and a different fallback model is provided
  if (!json && fallbackModel && fallbackModel !== model) {
    const completion3 = await client.chatCompletion({
      model: fallbackModel,
      messages: [system, { role: 'user', content: prompt }],
      max_tokens,
      temperature,
    });

    text = pickText(completion3).trim();
    json = extractJson(text);
  }

  return { text, json };
}
