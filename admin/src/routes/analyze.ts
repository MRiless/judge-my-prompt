import { Router, Request, Response } from 'express';

type ProviderId = 'anthropic' | 'openai' | 'google' | 'mistral' | 'deepseek' | 'xai' | 'meta';

const router = Router();

// Provider-specific API configuration
interface ProviderApiConfig {
  endpoint: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
  buildBody: (systemPrompt: string, userPrompt: string, analysisModelId?: string) => unknown;
  extractContent: (data: unknown) => string;
}

const providerConfigs: Record<ProviderId, ProviderApiConfig> = {
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    buildBody: (systemPrompt, userPrompt, analysisModelId) => ({
      model: analysisModelId || 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    extractContent: (data: any) => data?.content?.[0]?.text || '',
  },

  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, userPrompt, analysisModelId) => ({
      model: analysisModelId || 'gpt-4.1-mini',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    extractContent: (data: any) => data?.choices?.[0]?.message?.content || '',
  },

  google: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
    buildHeaders: (_apiKey) => ({
      'Content-Type': 'application/json',
    }),
    buildBody: (systemPrompt, userPrompt, analysisModelId) => ({
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.7,
      },
      // Model ID is appended to the URL, not in the body
      _modelId: analysisModelId || 'gemini-2.5-flash',
    }),
    extractContent: (data: any) => data?.candidates?.[0]?.content?.parts?.[0]?.text || '',
  },

  mistral: {
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, userPrompt, analysisModelId) => ({
      model: analysisModelId || 'mistral-small-latest',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    extractContent: (data: any) => data?.choices?.[0]?.message?.content || '',
  },

  deepseek: {
    endpoint: 'https://api.deepseek.com/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, userPrompt, analysisModelId) => ({
      model: analysisModelId || 'deepseek-chat',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    extractContent: (data: any) => data?.choices?.[0]?.message?.content || '',
  },

  xai: {
    endpoint: 'https://api.x.ai/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, userPrompt, analysisModelId) => ({
      model: analysisModelId || 'grok-3-mini',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    extractContent: (data: any) => data?.choices?.[0]?.message?.content || '',
  },

  meta: {
    // Meta Llama via Together AI as default provider
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, userPrompt, analysisModelId) => ({
      model: analysisModelId || 'meta-llama/Llama-4-Maverick-17B-128E-Instruct',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    extractContent: (data: any) => data?.choices?.[0]?.message?.content || '',
  },
};

// Build the evaluation user prompt (shared across all providers)
function buildUserPrompt(prompt: string, modelName: string): string {
  return `Analyze this prompt intended for ${modelName}:

<prompt>
${prompt}
</prompt>

<evaluation-criteria>
Our prompt judge evaluates prompts based on these criteria. Your improved prompts MUST score well by including these patterns:

1. **Context Inclusion (20%)** - Include phrases like: "I'm working on", "I'm building", "my project", "my application", "the situation is", "currently", "we have"

2. **Task Clarity (20%)** - Use clear action verbs: "Create", "Write", "Generate", "Explain", "Analyze", "Implement", "Build", "Design", "Help me"

3. **Persona Specification (15%)** - Assign a role: "Act as", "You are a", "As a [role]", "senior", "expert in", "experienced"

4. **Prompt Length (15%)** - Aim for 100-500 characters with substance

5. **Format Specification (10%)** - Specify output: "as a list", "step by step", "in JSON", "bullet points", "in markdown", "structured as"

6. **Constraints (10%)** - Set boundaries: "must", "should", "avoid", "don't", "limit to", "make sure", "ensure", "only"

7. **Examples (10%)** - Include examples: "for example", "such as", "like this", "e.g."
</evaluation-criteria>

<placeholder-rules>
Use [PLACEHOLDER] markers ONLY for content the user needs to customize:
- [YOUR TOPIC] - the subject they're working on
- [YOUR TECHNOLOGY/LANGUAGE] - specific tech stack
- [YOUR REQUIREMENTS] - specific requirements or goals
- [YOUR CONSTRAINTS] - specific limitations
- [NUMBER] - specific quantities

DO NOT put brackets around:
- Action verbs (write, create, explain)
- Structural phrases (act as, step by step)
- Common patterns the judge looks for
</placeholder-rules>

Provide a structured analysis with:

1. **Strengths** (2-3 bullet points of what the prompt already does well)

2. **Areas to Improve** (2-3 bullet points - reference which evaluation criteria above are missing)

3. **Improved Version** (rewrite their SPECIFIC prompt, keeping their topic/intent but adding the missing criteria patterns. This should score highly on our judge.)

4. **Example Prompts** (provide exactly 2 complete template prompts related to their topic)

CRITICAL FORMAT FOR EXAMPLES - follow this EXACTLY:
- Each example must be a complete, standalone prompt (not a list of features)
- Write the full prompt text on a single line after the title
- Do NOT use sub-bullets or numbered lists inside examples
- Format: **[Title]**: "[Complete prompt text all on one line]"

Example of CORRECT format:
- **[API Integration]**: "Act as a senior backend developer. I'm building a Node.js application and need to implement a REST API endpoint for user authentication. Please create the code step by step, including input validation, error handling, and JWT token generation. The response should be in JSON format."

Example of WRONG format (do not do this):
- **[API Integration]**: "Create an API including:
  - Authentication
  - Validation"

Keep your response concise and actionable.`;
}

// Proxy endpoint for AI analysis (supports all providers)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { apiKey, prompt, modelName, systemPrompt, providerId, analysisModelId } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const provider = (providerId as ProviderId) || 'anthropic';
    const config = providerConfigs[provider];

    if (!config) {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    const finalSystemPrompt = systemPrompt ||
      `You are an expert prompt engineer. Analyze prompts and provide actionable feedback to improve them for ${modelName || 'AI assistants'}.`;

    const userPrompt = buildUserPrompt(prompt, modelName || 'an AI assistant');

    // Build request
    const headers = config.buildHeaders(apiKey);
    const body = config.buildBody(finalSystemPrompt, userPrompt, analysisModelId) as any;

    // Google Gemini has a different URL structure
    let endpoint = config.endpoint;
    if (provider === 'google') {
      const modelId = body._modelId;
      delete body._modelId;
      endpoint = `${config.endpoint}${modelId}:generateContent?key=${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API error:`, errorText);
      return res.status(response.status).json({
        error: `${provider} API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    const content = config.extractContent(data);

    // Return a normalized response
    res.json({ content, provider, raw: data });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request to AI API' });
  }
});

export default router;
