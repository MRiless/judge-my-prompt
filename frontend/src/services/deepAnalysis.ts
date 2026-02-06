import type { DeepAnalysisResult, ModelConfig, ExamplePrompt, ProviderId } from '@shared/types';

// Deep analysis service supporting multiple AI providers

export class DeepAnalysisService {
  private apiKeys: Record<string, string> = {};

  configure(providerId: ProviderId, apiKey: string): void {
    this.apiKeys[providerId] = apiKey;
  }

  configureAll(keys: Record<string, string>): void {
    this.apiKeys = { ...keys };
  }

  isConfiguredFor(providerId: ProviderId): boolean {
    const key = this.apiKeys[providerId];
    return key !== undefined && key !== null && key.length > 0;
  }

  getConfiguredProvider(): ProviderId | null {
    for (const pid of Object.keys(this.apiKeys)) {
      if (this.apiKeys[pid]?.length > 0) return pid as ProviderId;
    }
    return null;
  }

  async analyze(
    prompt: string,
    modelConfig: ModelConfig
  ): Promise<DeepAnalysisResult> {
    const providerId = modelConfig.providerId || 'anthropic';
    const apiKey = this.apiKeys[providerId];

    if (!apiKey) {
      throw new Error(`No API key configured for ${modelConfig.provider}. Please add your ${modelConfig.provider} API key in the settings below.`);
    }

    const systemPrompt = modelConfig.deepAnalysisPrompt ||
      `You are an expert prompt engineer. Analyze prompts and provide actionable feedback to improve them for ${modelConfig.name}.`;

    // Use the new multi-provider backend endpoint
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        prompt,
        modelName: modelConfig.name,
        systemPrompt,
        providerId,
        analysisModelId: modelConfig.analysisModelId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI API error:', errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content || '';

    return this.parseAnalysisResponse(content);
  }

  private parseAnalysisResponse(content: string): DeepAnalysisResult {
    const lines = content.split('\n');
    const strengths: string[] = [];
    const improvements: string[] = [];
    const examplePrompts: ExamplePrompt[] = [];
    let rewrittenPrompt = '';
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const lowerLine = trimmed.toLowerCase();

      // Detect section headers - be more lenient, just look for keywords
      if (lowerLine.includes('strength') && !lowerLine.includes('prompt')) {
        currentSection = 'strengths';
        continue;
      } else if (lowerLine.includes('areas to improve') || lowerLine.includes('improvements') ||
                 (lowerLine.includes('improve') && lowerLine.includes(':'))) {
        currentSection = 'improvements';
        continue;
      } else if (lowerLine.includes('improved version') || lowerLine.includes('rewritten') ||
                 lowerLine.includes('revised prompt') || lowerLine.includes('revised version')) {
        currentSection = 'rewritten';
        continue;
      } else if (lowerLine.includes('example prompt') || lowerLine.includes('template prompt') ||
                 lowerLine.includes('example templates')) {
        currentSection = 'examples';
        continue;
      }

      // Parse content based on section
      if (currentSection === 'strengths' || currentSection === 'improvements') {
        // Look for bullet points or numbered items
        if (trimmed.startsWith('-') || trimmed.startsWith('\u2022') || trimmed.startsWith('*') || trimmed.match(/^\d+[\.\)]/)) {
          const item = trimmed
            .replace(/^[-\u2022*]+\s*/, '')
            .replace(/^\d+[\.\)]\s*/, '')
            .replace(/^\*\*/, '')
            .replace(/\*\*$/, '')
            .trim();
          if (item && item.length > 10) { // Minimum length to filter out junk
            if (currentSection === 'strengths') {
              strengths.push(item);
            } else {
              improvements.push(item);
            }
          }
        }
      } else if (currentSection === 'rewritten') {
        // Stop if we hit the examples section
        if (lowerLine.includes('example prompt') || lowerLine.includes('template prompt')) {
          currentSection = 'examples';
          continue;
        }
        // Collect all non-empty lines that aren't section headers
        if (trimmed && !trimmed.match(/^\*\*\d+\./) && !lowerLine.match(/^\d+\.\s*\*\*/)) {
          // Clean up the prompt text
          const cleanedLine = trimmed
            .replace(/^["']|["']$/g, '')
            .replace(/^\*\*|\*\*$/g, '')
            .replace(/^>+\s*/, ''); // Remove blockquote markers
          if (cleanedLine && cleanedLine.length > 5) {
            rewrittenPrompt += (rewrittenPrompt ? ' ' : '') + cleanedLine;
          }
        }
      } else if (currentSection === 'examples') {
        // Look for example format: - **[Title]**: "prompt" or **Title**: "prompt"
        const exampleMatch = trimmed.match(/^[-\u2022*]?\s*\*?\*?\[?([^\]:\n]{3,40})\]?\*?\*?:\s*["']?(.{20,})["']?$/);
        if (exampleMatch) {
          examplePrompts.push({
            title: exampleMatch[1].trim().replace(/^\*\*|\*\*$/g, '').replace(/^\[|\]$/g, ''),
            prompt: exampleMatch[2].trim().replace(/^["']|["']$/g, ''),
          });
        }
      }
    }

    return {
      analysis: content,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      rewrittenPrompt: rewrittenPrompt || undefined,
      examplePrompts: examplePrompts.length > 0 ? examplePrompts.slice(0, 3) : undefined,
    };
  }
}

export const deepAnalysisService = new DeepAnalysisService();
