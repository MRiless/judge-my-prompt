import { useState } from 'react';
import { apiProviders, modelProviderMap } from '../../config/affiliates';

interface HowItWorksProps {
  onBack: () => void;
}

const levers = [
  {
    name: 'Prompt Length',
    weight: '15%',
    description: 'Checks if your prompt has enough detail to give the AI context.',
    why: 'Too short prompts often lack the context needed for quality responses. Too long can be overwhelming. The sweet spot is typically 50-4000 characters.',
    good: 'A detailed prompt with context, requirements, and specifics',
    bad: 'One-word or vague prompts like "Help me"',
  },
  {
    name: 'Context Inclusion',
    weight: '20%',
    description: 'Detects whether you\'ve provided background information or situational context.',
    why: 'AI models perform significantly better when they understand the situation. Context helps them tailor responses to your specific needs.',
    good: '"I\'m building a React app for a healthcare startup..."',
    bad: '"Write some code"',
  },
  {
    name: 'Persona Specification',
    weight: '15%',
    description: 'Checks if you\'ve assigned a role or expertise level to the AI.',
    why: 'When you tell an AI to "act as" something, it activates relevant knowledge patterns and adjusts its communication style appropriately.',
    good: '"Act as a senior DevOps engineer with AWS expertise..."',
    bad: 'No role specification',
  },
  {
    name: 'Task Clarity',
    weight: '20%',
    description: 'Evaluates whether you\'ve clearly defined what you want the AI to do.',
    why: 'Ambiguous tasks lead to ambiguous results. Clear action verbs and specific objectives help the AI focus on exactly what you need.',
    good: '"Create a Python function that validates email addresses..."',
    bad: '"Something about emails"',
  },
  {
    name: 'Examples Presence',
    weight: '10%',
    description: 'Detects if you\'ve included examples of desired input/output.',
    why: 'Examples are incredibly powerful. They show rather than tell, eliminating ambiguity about your expectations.',
    good: '"Format like this: Input: X -> Output: Y"',
    bad: 'No examples provided',
  },
  {
    name: 'Format Specification',
    weight: '10%',
    description: 'Checks if you\'ve specified how you want the response formatted.',
    why: 'Telling the AI exactly how to structure its response (bullet points, JSON, markdown, etc.) saves you reformatting time.',
    good: '"Respond in a numbered list with pros and cons"',
    bad: 'No format guidance',
  },
  {
    name: 'Constraints Defined',
    weight: '10%',
    description: 'Detects whether you\'ve set boundaries or limitations.',
    why: 'Constraints help focus the AI\'s response. Word limits, topics to avoid, or specific requirements all improve output quality.',
    good: '"Keep it under 200 words, avoid technical jargon"',
    bad: 'No boundaries set',
  },
];

const modelTips: Record<string, { description: string; tips: string[] }> = {
  claude: {
    description: 'Claude excels with structured, thoughtful prompts and appreciates explicit boundaries.',
    tips: [
      'Use XML tags to structure your prompt (e.g., <context>, <task>, <constraints>)',
      'Be explicit about what you want and don\'t want',
      'Claude handles nuance well - you can include edge cases and exceptions',
      'Works great with multi-turn conversations for complex tasks',
    ],
  },
  'gpt-4': {
    description: 'GPT-4 is versatile and excels at following detailed instructions with specific formatting.',
    tips: [
      'Use numbered lists for multi-step instructions',
      'Specify output format explicitly (JSON, markdown tables, etc.)',
      'Include numeric constraints (word count, number of items)',
      'System messages are powerful for setting behavior',
    ],
  },
  gemini: {
    description: 'Gemini is designed for multi-modal understanding and excels at reasoning tasks.',
    tips: [
      'Great for tasks that combine text with other modalities',
      'Excels at step-by-step reasoning - ask it to "think through" problems',
      'Handles long context windows well',
      'Good at structured data extraction',
    ],
  },
  'llama-3': {
    description: 'Llama 3 is a capable open-source model that follows instructions well.',
    tips: [
      'Keep prompts clear and direct',
      'Works well with explicit formatting instructions',
      'Good at code generation and technical tasks',
      'Benefits from few-shot examples in the prompt',
    ],
  },
  mistral: {
    description: 'Mistral models are efficient and follow instructions precisely.',
    tips: [
      'Responds well to concise, well-structured prompts',
      'Good at following specific formatting rules',
      'Excels at straightforward instruction-following',
      'Keep context focused and relevant',
    ],
  },
};

function HowItWorks({ onBack }: HowItWorksProps) {
  const [selectedModel, setSelectedModel] = useState('claude');

  return (
    <div className="how-it-works">
      <div className="how-it-works-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Judge My Prompt
        </button>
      </div>

      <div className="how-it-works-content">
        <h1>How Judge My Prompt Works</h1>
        <p className="intro">
          Judge My Prompt analyzes your prompts in real-time using a set of research-backed criteria
          that correlate with better AI responses. All evaluation happens locally in your browser -
          your prompts never leave your device unless you choose Deep Analysis.
        </p>

        <section className="section">
          <h2>The Evaluation Process</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Real-time Analysis</h3>
                <p>As you type, your prompt is evaluated against 7 quality indicators called "levers".</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Weighted Scoring</h3>
                <p>Each lever contributes to your overall score based on its importance for the selected model.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Actionable Suggestions</h3>
                <p>You get specific recommendations to improve your prompt, prioritized by impact.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>What We Look For</h2>
          <p className="section-intro">
            Each lever evaluates a specific aspect of prompt quality. Here's what they mean and why they matter:
          </p>

          <div className="levers-grid">
            {levers.map((lever) => (
              <div key={lever.name} className="lever-card">
                <div className="lever-header">
                  <h3>{lever.name}</h3>
                  <span className="lever-weight">{lever.weight}</span>
                </div>
                <p className="lever-description">{lever.description}</p>
                <div className="lever-why">
                  <strong>Why it matters:</strong> {lever.why}
                </div>
                <div className="lever-examples">
                  <div className="example good">
                    <span className="example-label">Good</span>
                    <span>{lever.good}</span>
                  </div>
                  <div className="example bad">
                    <span className="example-label">Weak</span>
                    <span>{lever.bad}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Model-Specific Tips</h2>
          <p className="section-intro">
            Different AI models have different strengths. Select a model to see tips for writing better prompts for it:
          </p>

          <div className="model-selector-large">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-dropdown"
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="gpt-4">GPT-4 (OpenAI)</option>
              <option value="gemini">Gemini (Google)</option>
              <option value="llama-3">Llama 3 (Meta)</option>
              <option value="mistral">Mistral</option>
            </select>
          </div>

          <div className="model-tips-card">
            <p className="model-description">{modelTips[selectedModel].description}</p>
            <ul className="model-tips-list">
              {modelTips[selectedModel].tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
            {/* Affiliate link to get API key */}
            {modelProviderMap[selectedModel] && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <a
                  href={apiProviders[modelProviderMap[selectedModel]].getApiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="affiliate-link"
                >
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 3.5H3.5C2.94772 3.5 2.5 3.94772 2.5 4.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9.5 2.5H13.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.5 2.5L7.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {apiProviders[modelProviderMap[selectedModel]].description}
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <h2>Deep Analysis</h2>
          <p className="section-intro">
            For more nuanced feedback, Deep Analysis uses Claude AI to provide:
          </p>
          <ul className="feature-list">
            <li>Contextual strengths and weaknesses of your specific prompt</li>
            <li>An improved version of your prompt with suggestions applied</li>
            <li>Example template prompts with placeholders you can customize</li>
          </ul>
          <div className="privacy-note">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 3.5V7.5C2 11.0899 4.58172 14.1274 8 15C11.4183 14.1274 14 11.0899 14 7.5V3.5L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6 8L7.5 9.5L10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Deep Analysis requires your own API key and explicit consent. Your key is stored only in your browser.</span>
          </div>
        </section>

        <section className="section">
          <h2>Privacy Commitment</h2>
          <div className="privacy-box">
            <div className="privacy-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div>
                <h4>Local Processing</h4>
                <p>All prompt evaluation happens in your browser. Nothing is sent to any server.</p>
              </div>
            </div>
            <div className="privacy-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <h4>No Data Storage</h4>
                <p>We don't store, log, or track your prompts. Ever.</p>
              </div>
            </div>
            <div className="privacy-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h4>Your Control</h4>
                <p>Deep Analysis only sends data when you explicitly request it and consent.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HowItWorks;
