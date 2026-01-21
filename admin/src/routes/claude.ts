import { Router, Request, Response } from 'express';

const router = Router();

// Proxy endpoint for Claude API (avoids CORS issues)
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { apiKey, prompt, modelName, systemPrompt } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const finalSystemPrompt = systemPrompt ||
      `You are an expert prompt engineer. Analyze prompts and provide actionable feedback to improve them for ${modelName || 'AI assistants'}.`;

    const userPrompt = `Analyze this prompt intended for ${modelName || 'an AI assistant'}:

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: finalSystemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(response.status).json({
        error: `Claude API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request to Claude API' });
  }
});

export default router;
