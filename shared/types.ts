// Shared TypeScript types for Prompt Strength Tool

export interface Lever {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
  thresholds: {
    min?: number;
    max?: number;
    optimal?: { min: number; max: number };
  };
  patterns?: string[];
  feedback: {
    missing: string;
    weak: string;
    good: string;
  };
  priority: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  enabled: boolean;
  leverWeights: Record<string, number>;
  bestPractices: {
    tip: string;
    examples?: {
      good: string;
      bad: string;
    };
  }[];
  preferredStructure: string[];
  deepAnalysisPrompt?: string;
}

export interface HeuristicResult {
  leverId: string;
  score: number; // 0-100
  matched: boolean;
  feedback: string;
  suggestions: string[];
}

export interface EvaluationResult {
  overallScore: number; // 0-100
  strengthLevel: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  heuristicResults: HeuristicResult[];
  suggestions: Suggestion[];
  modelTips: string[];
}

export interface Suggestion {
  text: string;
  priority: number;
  leverId: string;
}

export interface DeepAnalysisRequest {
  prompt: string;
  modelId: string;
}

export interface ExamplePrompt {
  title: string;
  prompt: string;
}

export interface DeepAnalysisResult {
  analysis: string;
  strengths: string[];
  improvements: string[];
  rewrittenPrompt?: string;
  examplePrompts?: ExamplePrompt[];
}
