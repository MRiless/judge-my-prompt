import { useState } from 'react';
import type { ModelConfig } from '@shared/types';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  models: ModelConfig[];
}

function PromptEditor({
  prompt,
  onPromptChange,
  selectedModel,
  onModelChange,
  models,
}: PromptEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!prompt.trim()) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const enabledModels = models.filter(m => m.enabled);

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <h2 className="panel-title">Your Prompt</h2>

        <div className="model-selector">
          <label htmlFor="model-select">Target Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
          >
            {enabledModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="prompt-container">
        <textarea
          className="prompt-textarea"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Start typing your prompt here...&#10;&#10;Try something like:&#10;&quot;Act as a senior software engineer. I'm building a React application and need help implementing a user authentication system. Please create a login component that...&quot;"
        />

        <div className="prompt-footer">
          <span className="char-count">
            {prompt.length} characters
          </span>

          <button
            className={`copy-button ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            disabled={!prompt.trim()}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 5V3.5C11 2.67157 10.3284 2 9.5 2H3.5C2.67157 2 2 2.67157 2 3.5V9.5C2 10.3284 2.67157 11 3.5 11H5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Copy Prompt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromptEditor;
