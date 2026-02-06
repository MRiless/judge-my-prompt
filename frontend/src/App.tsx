import { useState, useEffect } from 'react';
import { usePromptEvaluation } from './hooks/usePromptEvaluation';
import { deepAnalysisService } from './services/deepAnalysis';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PromptEditor from './components/PromptEditor/PromptEditor';
import ResultsPanel from './components/StrengthIndicator/ResultsPanel';
import ConsentModal from './components/DeepAnalysis/ConsentModal';
import HowItWorks from './components/HowItWorks/HowItWorks';
import AdContainer from './components/Monetization/AdContainer';
import { loadApiKeys } from './components/ApiKeySettings/ApiKeySettings';
import type { DeepAnalysisResult, ProviderId } from '@shared/types';

const THEME_KEY = 'prompt-judge-theme';

type Theme = 'light' | 'dark';

function App() {
  const {
    prompt,
    setPrompt,
    selectedModel,
    setSelectedModel,
    result,
    isEvaluating,
    models,
  } = usePromptEvaluation({ debounceMs: 300 });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DeepAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Load saved API keys on mount
  useEffect(() => {
    const savedKeys = loadApiKeys();
    setApiKeys(savedKeys);
    deepAnalysisService.configureAll(savedKeys);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleApiKeyChange = (providerId: ProviderId, key: string) => {
    setApiKeys(prev => {
      const updated = { ...prev };
      if (key) {
        updated[providerId] = key;
      } else {
        delete updated[providerId];
      }
      deepAnalysisService.configureAll(updated);
      return updated;
    });
  };

  const handleDeepAnalysis = () => {
    const model = models.find(m => m.id === selectedModel);
    const providerId = model?.providerId || 'anthropic';

    if (!deepAnalysisService.isConfiguredFor(providerId)) {
      // Instead of window.prompt, set an error that guides the user to the API key settings
      setAnalysisError(`No API key set for ${model?.provider || 'this provider'}. Expand the "API Key" section below and add your key.`);
      return;
    }
    setShowConsentModal(true);
  };

  const handleConsentAccept = async () => {
    setShowConsentModal(false);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    const model = models.find(m => m.id === selectedModel);
    if (!model) {
      setAnalysisError('Model not found');
      setIsAnalyzing(false);
      return;
    }

    try {
      const result = await deepAnalysisService.analyze(prompt, model);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Deep analysis error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseImprovedPrompt = () => {
    if (analysisResult?.rewrittenPrompt) {
      setPrompt(analysisResult.rewrittenPrompt);
      setAnalysisResult(null);
    }
  };

  if (showHowItWorks) {
    return (
      <div className="app-container">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          showingHowItWorks={true}
        />
        <HowItWorks onBack={() => setShowHowItWorks(false)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onShowHowItWorks={() => setShowHowItWorks(true)}
      />

      <main className="main-content">
        <div className="workspace">
          <div className="left-column">
            <PromptEditor
              prompt={prompt}
              onPromptChange={(newPrompt) => {
                setPrompt(newPrompt);
                setAnalysisResult(null);
              }}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              models={models}
            />
            {/* Privacy-friendly ad placement - hidden until we hit traffic minimums */}
            <AdContainer />
          </div>

          <ResultsPanel
            result={result}
            isEvaluating={isEvaluating}
            isAnalyzing={isAnalyzing}
            selectedModel={selectedModel}
            models={models}
            onDeepAnalysis={handleDeepAnalysis}
            hasPrompt={prompt.trim().length > 0}
            analysisResult={analysisResult}
            analysisError={analysisError}
            onUseImprovedPrompt={handleUseImprovedPrompt}
            apiKeys={apiKeys}
            onApiKeyChange={handleApiKeyChange}
          />
        </div>
      </main>

      <Footer />

      {showConsentModal && (
        <ConsentModal
          onAccept={handleConsentAccept}
          onDecline={() => setShowConsentModal(false)}
        />
      )}
    </div>
  );
}

export default App;
