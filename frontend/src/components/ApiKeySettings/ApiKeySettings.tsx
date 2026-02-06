import { useState } from 'react';
import type { ProviderId } from '@shared/types';
import { apiProviders } from '../../config/affiliates';

const STORAGE_PREFIX = 'prompt-judge-apikey-';

interface ApiKeySettingsProps {
  providerId: ProviderId;
  providerName: string;
  onKeyChange: (providerId: ProviderId, key: string) => void;
  apiKeys: Record<string, string>;
}

function ApiKeySettings({
  providerId,
  providerName,
  onKeyChange,
  apiKeys,
}: ApiKeySettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderId | null>(null);

  const currentKey = apiKeys[providerId] || '';
  const hasKey = currentKey.length > 0;
  const provider = apiProviders[providerId];

  const handleSaveKey = (pid: ProviderId, key: string) => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      localStorage.setItem(`${STORAGE_PREFIX}${pid}`, trimmedKey);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}${pid}`);
    }
    onKeyChange(pid, trimmedKey);
    setEditingProvider(null);
  };

  const handleClearKey = (pid: ProviderId) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${pid}`);
    onKeyChange(pid, '');
    setEditingProvider(null);
  };

  const maskedKey = (key: string) => {
    if (key.length <= 8) return '****';
    return key.slice(0, 4) + '...' + key.slice(-4);
  };

  return (
    <div className="api-key-settings">
      <button
        className="api-key-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="api-key-toggle-left">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 6.5C10.5 8.433 8.933 10 7 10C5.067 10 3.5 8.433 3.5 6.5C3.5 4.567 5.067 3 7 3C8.933 3 10.5 4.567 10.5 6.5Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 9.5L14 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 11.5L14 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M13 10.5L13 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          API Key: {providerName}
          {hasKey && <span className="api-key-status configured">Configured</span>}
          {!hasKey && <span className="api-key-status missing">Not set</span>}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isExpanded && (
        <div className="api-key-content">
          {/* Current provider key */}
          <div className="api-key-provider-row">
            <div className="api-key-provider-info">
              <span className="api-key-provider-name">{provider?.name || providerName}</span>
              {hasKey && editingProvider !== providerId ? (
                <span className="api-key-masked">{maskedKey(currentKey)}</span>
              ) : null}
            </div>

            {editingProvider === providerId ? (
              <div className="api-key-input-row">
                <input
                  type="password"
                  className="api-key-input"
                  placeholder={provider?.keyPlaceholder || 'Enter API key...'}
                  defaultValue={currentKey}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveKey(providerId, (e.target as HTMLInputElement).value);
                    } else if (e.key === 'Escape') {
                      setEditingProvider(null);
                    }
                  }}
                  onBlur={(e) => {
                    // Small delay to allow button clicks to register
                    setTimeout(() => {
                      if (editingProvider === providerId) {
                        handleSaveKey(providerId, e.target.value);
                      }
                    }, 150);
                  }}
                />
              </div>
            ) : (
              <div className="api-key-actions">
                <button
                  className="api-key-action-btn"
                  onClick={() => setEditingProvider(providerId)}
                >
                  {hasKey ? 'Change' : 'Set Key'}
                </button>
                {hasKey && (
                  <button
                    className="api-key-action-btn api-key-clear"
                    onClick={() => handleClearKey(providerId)}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Get API key link */}
          {provider && (
            <a
              href={provider.getApiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="api-key-get-link"
            >
              {provider.description} &rarr;
            </a>
          )}

          <p className="api-key-privacy-note">
            Keys are stored locally in your browser only. Never sent to our servers.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to load all saved API keys from localStorage
export function loadApiKeys(): Record<string, string> {
  const keys: Record<string, string> = {};
  const providers: ProviderId[] = ['anthropic', 'openai', 'google', 'mistral', 'deepseek', 'xai', 'meta'];
  for (const pid of providers) {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${pid}`);
    if (saved) {
      keys[pid] = saved;
    }
  }
  // Also check legacy key format
  const legacyKey = localStorage.getItem('prompt-judge-api-key');
  if (legacyKey && !keys['anthropic']) {
    keys['anthropic'] = legacyKey;
    localStorage.setItem(`${STORAGE_PREFIX}anthropic`, legacyKey);
    localStorage.removeItem('prompt-judge-api-key');
  }
  return keys;
}

export default ApiKeySettings;
