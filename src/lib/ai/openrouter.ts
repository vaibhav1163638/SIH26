interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | any[]; // allow multimodal payloads
}

interface OpenRouterOptions {
  temperature?: number;
  max_tokens?: number;
}

// Ordered fallback list – newest/most capable first
const MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'minimax/minimax-m3:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'thinkingmachines/inkling:free',
];

/**
 * Calls OpenRouter with a list of fallback models.
 * Returns the assistant content together with the model that produced it
 * and a flag indicating whether a fallback was used.
 */
export async function generateOpenRouterResponse(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<{ content: string; model: string; usedFallback: boolean }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is missing.');
  }

  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.max_tokens ?? 1000;

  let lastError: Error | null = null;

  for (let idx = 0; idx < MODELS.length; idx++) {
    const model = MODELS[idx];
    console.log(`[OPENROUTER] Trying model: ${model}`);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agrosarthi.ai',
          'X-Title': 'AgroSarthi Assistant',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      // 429 – rate‑limited by the upstream provider
      if (response.status === 429) {
        const errorText = await response.text();
        console.warn(`[OPENROUTER] Model rate limited: ${model}`);
        console.warn(`[OPENROUTER] Details: ${errorText}`);
        lastError = new Error('Rate limited');
        // Immediately fall back – do NOT retry this model
        continue;
      }

      // 404 – model not available on the free tier (or removed)
      if (response.status === 404) {
        const errorText = await response.text();
        console.warn(`[OPENROUTER] Model unavailable: ${model}`);
        console.warn(`[OPENROUTER] Details: ${errorText}`);
        lastError = new Error('Model unavailable');
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OPENROUTER ERROR]', response.status, errorText);
        throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Invalid response from OpenRouter: No choices returned.');
      }

      // Success – return content and indicate if we used a fallback model
      return {
        content: data.choices[0].message.content,
        model,
        usedFallback: idx > 0,
      };
    } catch (err: any) {
      // Network or unexpected errors – log and try next model
      console.error(`[OPENROUTER] Exception for model ${model}:`, err);
      lastError = err;
      continue;
    }
  }

  // All models exhausted
  throw lastError || new Error('AI service is temporarily unavailable. Please try again later.');
}
