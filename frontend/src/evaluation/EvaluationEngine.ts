import type { Lever, ModelConfig, HeuristicResult, EvaluationResult, Suggestion } from '@shared/types';

export class EvaluationEngine {
  private levers: Lever[];
  private models: Map<string, ModelConfig>;

  constructor(levers: Lever[], models: ModelConfig[]) {
    this.levers = levers;
    this.models = new Map(models.map(m => [m.id, m]));
  }

  evaluate(prompt: string, modelId: string): EvaluationResult {
    const model = this.models.get(modelId);
    const enabledLevers = this.levers.filter(l => l.enabled);

    const heuristicResults: HeuristicResult[] = enabledLevers.map(lever =>
      this.evaluateLever(prompt, lever, model)
    );

    const overallScore = this.calculateOverallScore(heuristicResults, model);
    const strengthLevel = this.getStrengthLevel(overallScore);
    const suggestions = this.generateSuggestions(heuristicResults, model);
    const modelTips = model ? this.getModelTips(heuristicResults, model) : [];

    return {
      overallScore,
      strengthLevel,
      heuristicResults,
      suggestions,
      modelTips,
    };
  }

  private evaluateLever(prompt: string, lever: Lever, model?: ModelConfig): HeuristicResult {
    const lowerPrompt = prompt.toLowerCase();
    let score = 0;
    let matched = false;
    let feedback = '';
    const suggestions: string[] = [];

    switch (lever.id) {
      case 'prompt-length':
        ({ score, matched, feedback } = this.evaluateLength(prompt, lever));
        if (!matched) {
          suggestions.push(lever.feedback.missing);
        }
        break;

      case 'context-inclusion':
      case 'persona-specification':
      case 'task-clarity':
      case 'examples-presence':
      case 'format-specification':
      case 'constraints-defined':
        ({ score, matched, feedback } = this.evaluatePatterns(lowerPrompt, lever));
        if (!matched) {
          suggestions.push(lever.feedback.missing);
        } else if (score < 70) {
          suggestions.push(lever.feedback.weak);
        }
        break;

      default:
        score = 50;
        matched = false;
        feedback = 'Unknown lever';
    }

    return {
      leverId: lever.id,
      score,
      matched,
      feedback,
      suggestions,
    };
  }

  private evaluateLength(prompt: string, lever: Lever): { score: number; matched: boolean; feedback: string } {
    const length = prompt.length;
    const { min = 50, max = 4000, optimal } = lever.thresholds;

    if (length < min) {
      return {
        score: Math.max(0, (length / min) * 40),
        matched: false,
        feedback: lever.feedback.missing,
      };
    }

    if (length > max) {
      return {
        score: Math.max(50, 100 - ((length - max) / max) * 50),
        matched: true,
        feedback: 'Prompt is quite long - consider being more concise.',
      };
    }

    if (optimal) {
      if (length >= optimal.min && length <= optimal.max) {
        return {
          score: 100,
          matched: true,
          feedback: lever.feedback.good,
        };
      } else if (length < optimal.min) {
        return {
          score: 60 + ((length - min) / (optimal.min - min)) * 40,
          matched: true,
          feedback: lever.feedback.weak,
        };
      } else {
        return {
          score: 80,
          matched: true,
          feedback: 'Good length, though a bit verbose.',
        };
      }
    }

    return {
      score: 70,
      matched: true,
      feedback: lever.feedback.good,
    };
  }

  private evaluatePatterns(lowerPrompt: string, lever: Lever): { score: number; matched: boolean; feedback: string } {
    const patterns = lever.patterns || [];
    const matchedPatterns = patterns.filter(p => lowerPrompt.includes(p.toLowerCase()));
    const matchCount = matchedPatterns.length;

    if (matchCount === 0) {
      return {
        score: 0,
        matched: false,
        feedback: lever.feedback.missing,
      };
    }

    if (matchCount === 1) {
      return {
        score: 60,
        matched: true,
        feedback: lever.feedback.weak,
      };
    }

    if (matchCount >= 3) {
      return {
        score: 100,
        matched: true,
        feedback: lever.feedback.good,
      };
    }

    return {
      score: 80,
      matched: true,
      feedback: lever.feedback.good,
    };
  }

  private calculateOverallScore(results: HeuristicResult[], model?: ModelConfig): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const result of results) {
      const lever = this.levers.find(l => l.id === result.leverId);
      if (!lever) continue;

      // Use model-specific weight if available, otherwise use lever's default weight
      const weight = model?.leverWeights?.[lever.id] ?? lever.weight;
      totalWeight += weight;
      weightedSum += result.score * weight;
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  private getStrengthLevel(score: number): 'weak' | 'fair' | 'good' | 'strong' | 'excellent' {
    if (score < 30) return 'weak';
    if (score < 50) return 'fair';
    if (score < 70) return 'good';
    if (score < 85) return 'strong';
    return 'excellent';
  }

  private generateSuggestions(results: HeuristicResult[], model?: ModelConfig): Suggestion[] {
    const allSuggestions: Suggestion[] = [];

    for (const result of results) {
      const lever = this.levers.find(l => l.id === result.leverId);
      if (!lever) continue;

      // Only add suggestions for low-scoring levers
      if (result.score < 70) {
        for (const text of result.suggestions) {
          allSuggestions.push({
            text,
            priority: lever.priority,
            leverId: lever.id,
          });
        }
      }
    }

    // Sort by priority and take top 5
    return allSuggestions
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5);
  }

  private getModelTips(results: HeuristicResult[], model: ModelConfig): string[] {
    const tips: string[] = [];

    // Add relevant best practice tips based on low-scoring areas
    for (const result of results) {
      if (result.score < 60) {
        const relevantTip = model.bestPractices.find(bp => {
          const tipLower = bp.tip.toLowerCase();
          return tipLower.includes(result.leverId.replace('-', ' ')) ||
                 tipLower.includes(result.leverId.split('-')[0]);
        });
        if (relevantTip && !tips.includes(relevantTip.tip)) {
          tips.push(relevantTip.tip);
        }
      }
    }

    // Always include at least one model tip
    if (tips.length === 0 && model.bestPractices.length > 0) {
      tips.push(model.bestPractices[0].tip);
    }

    return tips.slice(0, 3);
  }

  updateLevers(levers: Lever[]): void {
    this.levers = levers;
  }

  updateModels(models: ModelConfig[]): void {
    this.models = new Map(models.map(m => [m.id, m]));
  }
}
