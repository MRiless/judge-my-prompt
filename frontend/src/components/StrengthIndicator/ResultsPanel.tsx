import { useState } from 'react';
import type { EvaluationResult, ModelConfig, DeepAnalysisResult } from '@shared/types';
import { apiProviders } from '../../config/affiliates';

interface ResultsPanelProps {
  result: EvaluationResult | null;
  isEvaluating: boolean;
  isAnalyzing: boolean;
  selectedModel: string;
  models: ModelConfig[];
  onDeepAnalysis: () => void;
  hasPrompt: boolean;
  analysisResult?: DeepAnalysisResult | null;
  analysisError?: string | null;
  onUseImprovedPrompt?: () => void;
}

function ResultsPanel({
  result,
  isEvaluating,
  isAnalyzing,
  selectedModel,
  models,
  onDeepAnalysis,
  hasPrompt,
  analysisResult,
  analysisError,
  onUseImprovedPrompt,
}: ResultsPanelProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const model = models.find(m => m.id === selectedModel);

  if (!hasPrompt || !result) {
    return (
      <div className="results-panel">
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 20H32M16 28H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3 className="empty-title">Start typing your prompt</h3>
          <p className="empty-description">
            Get real-time feedback on how to make your prompt stronger for {model?.name || 'your chosen model'}.
          </p>
        </div>
      </div>
    );
  }

  const getLeverScoreClass = (score: number): string => {
    if (score < 40) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  };

  return (
    <div className={`results-panel ${isEvaluating ? 'evaluating' : ''}`}>
      {/* Strength Meter */}
      <div className="strength-meter">
        <div className={`strength-score ${result.strengthLevel}`}>
          {result.overallScore}
        </div>
        <div className={`strength-label ${result.strengthLevel}`}>
          {result.strengthLevel}
        </div>
        <div className="strength-bar-container">
          <div
            className={`strength-bar ${result.strengthLevel}`}
            style={{ width: `${result.overallScore}%` }}
          />
        </div>
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="suggestions">
          <h3 className="suggestions-title">Suggestions to Improve</h3>
          <ul className="suggestion-list">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <svg className="suggestion-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6V11M10 14V14.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{suggestion.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model Tips */}
      {result.modelTips.length > 0 && (
        <div className="model-tips">
          <h3 className="model-tips-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L9.5 5.5L14 6L10.5 9L11.5 14L8 11.5L4.5 14L5.5 9L2 6L6.5 5.5L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            {model?.name || 'Model'} Tips
          </h3>
          <ul className="tip-list">
            {result.modelTips.map((tip, index) => (
              <li key={index} className="tip-item">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lever Breakdown */}
      <div className="lever-breakdown">
        <button
          className="lever-toggle"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <span>Detailed Breakdown</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ transform: showBreakdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showBreakdown && (
          <div className="lever-list">
            {result.heuristicResults.map(hr => (
              <div key={hr.leverId} className="lever-item">
                <span className="lever-name">
                  {hr.leverId.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
                <span className={`lever-score ${getLeverScoreClass(hr.score)}`}>
                  {hr.score}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deep Analysis Results */}
      {analysisResult && (
        <div className="analysis-results">
          <h4>AI Analysis</h4>

          {analysisResult.strengths.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--color-success)', fontSize: '0.8125rem' }}>Strengths:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                {analysisResult.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.improvements.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--color-warning)', fontSize: '0.8125rem' }}>Areas to Improve:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                {analysisResult.improvements.map((s, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.examplePrompts && analysisResult.examplePrompts.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Example Prompts:</strong>
              <div style={{ marginTop: '0.5rem' }}>
                {analysisResult.examplePrompts.map((example, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      marginBottom: '0.375rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {example.title}
                    </div>
                    <code style={{
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      display: 'block',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {example.prompt}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResult.rewrittenPrompt && onUseImprovedPrompt && (
            <button
              className="btn btn-primary"
              onClick={onUseImprovedPrompt}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Use Improved Prompt
            </button>
          )}
        </div>
      )}

      {/* Analysis Error */}
      {analysisError && (
        <div className="analysis-results" style={{ borderColor: 'var(--color-error)' }}>
          <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
            Analysis failed: {analysisError}
          </p>
        </div>
      )}

      {/* Deep Analysis Button */}
      <div className="deep-analysis-section">
        <button
          className="deep-analysis-button"
          onClick={onDeepAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Deep Analysis with AI
            </>
          )}
        </button>
        <p className="deep-analysis-note">
          Get detailed feedback powered by Claude
        </p>
        <div className="api-key-link">
          <a
            href={apiProviders.anthropic.getApiKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Don't have an API key? Get one from Anthropic →
          </a>
        </div>
      </div>
    </div>
  );
}

export default ResultsPanel;
