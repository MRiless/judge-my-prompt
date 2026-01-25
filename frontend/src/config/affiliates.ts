/**
 * Monetization Configuration
 *
 * Centralized config for affiliate links, ad settings, and support links.
 * Easy to update when affiliate programs become available.
 */

// API Provider Affiliate/Referral Links
// Note: Update these with actual affiliate links when programs are available
export const apiProviders = {
  anthropic: {
    name: 'Anthropic',
    getApiKeyUrl: 'https://console.anthropic.com/',
    description: 'Get your Claude API key',
  },
  openai: {
    name: 'OpenAI',
    getApiKeyUrl: 'https://platform.openai.com/api-keys',
    description: 'Get your GPT-4 API key',
  },
  google: {
    name: 'Google AI',
    getApiKeyUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Get your Gemini API key',
  },
  meta: {
    name: 'Meta AI',
    getApiKeyUrl: 'https://llama.meta.com/',
    description: 'Access Llama models',
  },
  mistral: {
    name: 'Mistral AI',
    getApiKeyUrl: 'https://console.mistral.ai/',
    description: 'Get your Mistral API key',
  },
} as const;

// Model ID to provider mapping for affiliate links
export const modelProviderMap: Record<string, keyof typeof apiProviders> = {
  'claude': 'anthropic',
  'gpt-4': 'openai',
  'gemini': 'google',
  'llama-3': 'meta',
  'mistral': 'mistral',
};

// Support/Tip Jar Configuration
export const supportLinks = {
  // Buy Me a Coffee
  buyMeACoffee: {
    url: 'https://buymeacoffee.com/mriless',
    label: 'Buy Me a Coffee',
  },
  // Ko-fi alternative - replace with your actual link when set up
  kofi: {
    url: 'https://ko-fi.com/judgemyprompt',
    label: 'Support on Ko-fi',
  },
  // GitHub Sponsors - if applicable
  github: {
    url: 'https://github.com/sponsors/judgemyprompt',
    label: 'GitHub Sponsors',
  },
} as const;

// Primary support link to use
export const primarySupportLink = supportLinks.buyMeACoffee;

// Ad Network Configuration
export const adConfig = {
  // Set to true when ready to show ads in production
  enabled: import.meta.env.PROD,

  // Carbon Ads configuration
  carbonAds: {
    // Replace with actual Carbon Ads serve/placement IDs when approved
    serve: 'CKYIKKQL',
    placement: 'judgemypromptcom',
  },

  // EthicalAds configuration (alternative)
  ethicalAds: {
    // Replace with actual publisher ID when approved
    publisherId: 'your-publisher-id',
  },
} as const;

// Privacy-Respecting Analytics Configuration
// Using Cloudflare Web Analytics (FREE) - configured in index.html
export const analyticsConfig = {
  // Cloudflare Web Analytics - FREE, privacy-first, no cookies
  // Setup: See index.html for instructions
  // Dashboard: https://dash.cloudflare.com/ → Web Analytics
  cloudflare: {
    // Token is set directly in index.html script tag
    dashboardUrl: 'https://dash.cloudflare.com/',
  },

  // Upgrade options if you need more features later:
  // - Plausible ($9/mo): goals, funnels, custom events
  // - Simple Analytics ($9/mo): similar to Plausible
} as const;

// Helper function to get affiliate URL for a model
export function getApiKeyUrl(modelId: string): string {
  const providerId = modelProviderMap[modelId];
  if (providerId && apiProviders[providerId]) {
    return apiProviders[providerId].getApiKeyUrl;
  }
  // Default to Anthropic for Deep Analysis
  return apiProviders.anthropic.getApiKeyUrl;
}

// Helper function to get provider name for a model
export function getProviderName(modelId: string): string {
  const providerId = modelProviderMap[modelId];
  if (providerId && apiProviders[providerId]) {
    return apiProviders[providerId].name;
  }
  return 'your provider';
}
