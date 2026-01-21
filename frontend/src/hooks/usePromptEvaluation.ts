import { useState, useEffect, useRef, useCallback } from 'react';
import { EvaluationEngine } from '../evaluation/EvaluationEngine';
import type { EvaluationResult, Lever, ModelConfig } from '@shared/types';

// Default levers (embedded for offline/client-side operation)
const defaultLevers: Lever[] = [
  {
    id: 'prompt-length',
    name: 'Prompt Length',
    description: 'Checks for sufficient detail in the prompt',
    weight: 15,
    enabled: true,
    thresholds: { min: 50, max: 4000, optimal: { min: 100, max: 2000 } },
    feedback: {
      missing: 'Your prompt is too short. Add more context and details.',
      weak: 'Your prompt could use more detail to get better results.',
      good: 'Good prompt length with adequate detail.',
    },
    priority: 1,
  },
  {
    id: 'context-inclusion',
    name: 'Context Inclusion',
    description: 'Detects background information and context markers',
    weight: 20,
    enabled: true,
    thresholds: {},
    patterns: ['context:', 'background:', 'situation:', 'for context', 'currently', 'we have', 'our', 'my project', 'i\'m working on', 'i am building'],
    feedback: {
      missing: 'Add context about your situation or project to get more relevant responses.',
      weak: 'Consider adding more background information for better results.',
      good: 'Good context provided!',
    },
    priority: 2,
  },
  {
    id: 'persona-specification',
    name: 'Persona Specification',
    description: 'Checks for role or persona assignment',
    weight: 15,
    enabled: true,
    thresholds: {},
    patterns: ['act as', 'you are', 'you\'re a', 'as a', 'imagine you\'re', 'expert in', 'specialist', 'senior', 'experienced'],
    feedback: {
      missing: 'Consider assigning a persona or role (e.g., \'Act as a senior developer...\').',
      weak: 'Your persona could be more specific to the task.',
      good: 'Good persona specification!',
    },
    priority: 3,
  },
  {
    id: 'task-clarity',
    name: 'Task Clarity',
    description: 'Evaluates clear task definition and action words',
    weight: 20,
    enabled: true,
    thresholds: {},
    patterns: ['create', 'write', 'generate', 'explain', 'analyze', 'summarize', 'compare', 'review', 'help me', 'build', 'implement', 'design', 'fix', 'debug'],
    feedback: {
      missing: 'Clearly state what you want the AI to do (e.g., \'Write...\', \'Explain...\', \'Create...\').',
      weak: 'Be more specific about the task you want completed.',
      good: 'Clear task definition!',
    },
    priority: 1,
  },
  {
    id: 'examples-presence',
    name: 'Examples Presence',
    description: 'Detects example patterns for better understanding',
    weight: 10,
    enabled: true,
    thresholds: {},
    patterns: ['for example', 'such as', 'like this', 'example:', 'sample:', 'similar to', 'for instance', 'e.g.'],
    feedback: {
      missing: 'Adding examples can significantly improve response quality.',
      weak: 'Consider adding more examples to clarify your expectations.',
      good: 'Great use of examples!',
    },
    priority: 4,
  },
  {
    id: 'format-specification',
    name: 'Format Specification',
    description: 'Checks for output format requests',
    weight: 10,
    enabled: true,
    thresholds: {},
    patterns: ['format:', 'in json', 'as a list', 'bullet points', 'numbered list', 'markdown', 'table format', 'step by step', 'output as'],
    feedback: {
      missing: 'Specify your desired output format (e.g., list, JSON, markdown).',
      weak: 'Be more specific about the format you want.',
      good: 'Good format specification!',
    },
    priority: 5,
  },
  {
    id: 'constraints-defined',
    name: 'Constraints Defined',
    description: 'Detects limits and boundaries in the prompt',
    weight: 10,
    enabled: true,
    thresholds: {},
    patterns: ['must', 'should', 'don\'t', 'do not', 'avoid', 'limit', 'maximum', 'minimum', 'only', 'at least', 'at most', 'ensure', 'without'],
    feedback: {
      missing: 'Define constraints or boundaries for more focused results.',
      weak: 'Consider adding more specific constraints.',
      good: 'Good constraints defined!',
    },
    priority: 6,
  },
];

// Default model configs (embedded for offline operation)
const defaultModels: ModelConfig[] = [
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    description: 'Anthropic\'s Claude models',
    enabled: true,
    leverWeights: { 'prompt-length': 15, 'context-inclusion': 25, 'persona-specification': 15, 'task-clarity': 20, 'examples-presence': 10, 'format-specification': 5, 'constraints-defined': 10 },
    bestPractices: [
      { tip: 'Use XML tags to structure your prompt (e.g., <context>, <task>, <constraints>)' },
      { tip: 'Claude responds well to explicit role assignments with \'You are...\'' },
      { tip: 'Be explicit about what you want Claude to avoid or include' },
    ],
    preferredStructure: ['Context/Background', 'Task Definition', 'Constraints/Requirements', 'Output Format'],
  },
  {
    id: 'gpt4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'OpenAI\'s GPT-4',
    enabled: true,
    leverWeights: { 'prompt-length': 15, 'context-inclusion': 20, 'persona-specification': 20, 'task-clarity': 20, 'examples-presence': 10, 'format-specification': 10, 'constraints-defined': 5 },
    bestPractices: [
      { tip: 'GPT-4 excels when you specify numeric constraints (length, count, etc.)' },
      { tip: 'Request JSON output for structured data' },
      { tip: 'Use clear section headers with markdown formatting' },
    ],
    preferredStructure: ['System Context', 'Background Information', 'Specific Task', 'Format Requirements'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    description: 'Google\'s Gemini',
    enabled: true,
    leverWeights: { 'prompt-length': 15, 'context-inclusion': 20, 'persona-specification': 10, 'task-clarity': 25, 'examples-presence': 15, 'format-specification': 10, 'constraints-defined': 5 },
    bestPractices: [
      { tip: 'Gemini excels at multi-step reasoning - break complex tasks into steps' },
      { tip: 'Gemini responds well to examples with clear input/output pairs' },
    ],
    preferredStructure: ['Clear Task Statement', 'Step-by-Step Instructions', 'Examples', 'Output Format'],
  },
  {
    id: 'llama3',
    name: 'Llama 3',
    provider: 'Meta',
    description: 'Meta\'s Llama 3',
    enabled: true,
    leverWeights: { 'prompt-length': 20, 'context-inclusion': 20, 'persona-specification': 15, 'task-clarity': 25, 'examples-presence': 10, 'format-specification': 5, 'constraints-defined': 5 },
    bestPractices: [
      { tip: 'Llama 3 benefits from explicit, direct instructions without ambiguity' },
      { tip: 'Keep context concise - Llama 3 performs best with focused prompts' },
    ],
    preferredStructure: ['Direct Task Statement', 'Specific Requirements', 'Concise Context', 'Expected Output'],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'Mistral AI',
    description: 'Mistral AI models',
    enabled: true,
    leverWeights: { 'prompt-length': 15, 'context-inclusion': 15, 'persona-specification': 15, 'task-clarity': 25, 'examples-presence': 15, 'format-specification': 10, 'constraints-defined': 5 },
    bestPractices: [
      { tip: 'Mistral excels with clear, well-structured instructions' },
      { tip: 'Use few-shot examples to establish the pattern you want' },
    ],
    preferredStructure: ['Task Definition', 'Few-Shot Examples', 'Specific Requirements', 'Output Format'],
  },
];

interface UsePromptEvaluationOptions {
  debounceMs?: number;
}

interface UsePromptEvaluationReturn {
  prompt: string;
  setPrompt: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  result: EvaluationResult | null;
  isEvaluating: boolean;
  models: ModelConfig[];
  levers: Lever[];
}

export function usePromptEvaluation(options: UsePromptEvaluationOptions = {}): UsePromptEvaluationReturn {
  const { debounceMs = 300 } = options;

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [levers] = useState<Lever[]>(defaultLevers);
  const [models] = useState<ModelConfig[]>(defaultModels);

  const engineRef = useRef<EvaluationEngine | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize engine
  useEffect(() => {
    engineRef.current = new EvaluationEngine(levers, models);
  }, [levers, models]);

  // Debounced evaluation
  const evaluate = useCallback(() => {
    if (!engineRef.current || !prompt.trim()) {
      setResult(null);
      return;
    }

    setIsEvaluating(true);

    // Run evaluation (synchronous, but we wrap it for UX)
    const evaluationResult = engineRef.current.evaluate(prompt, selectedModel);
    setResult(evaluationResult);
    setIsEvaluating(false);
  }, [prompt, selectedModel]);

  // Trigger evaluation on prompt or model change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!prompt.trim()) {
      setResult(null);
      return;
    }

    setIsEvaluating(true);
    debounceRef.current = setTimeout(() => {
      evaluate();
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [prompt, selectedModel, debounceMs, evaluate]);

  return {
    prompt,
    setPrompt,
    selectedModel,
    setSelectedModel,
    result,
    isEvaluating,
    models,
    levers,
  };
}
