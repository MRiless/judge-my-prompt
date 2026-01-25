import { useEffect, useRef } from 'react';
import { adConfig } from '../../config/affiliates';

/**
 * AdContainer - Privacy-friendly ad placement for Carbon Ads or EthicalAds
 *
 * Renders a small, unobtrusive ad unit. Only loads in production
 * and when ads are enabled in the config.
 */
function AdContainer() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load ads when enabled and we have a container
    if (!adConfig.enabled || !adRef.current) return;

    // Check if Carbon Ads script is already loaded
    const existingScript = document.getElementById('_carbonads_js');
    if (existingScript) return;

    // Create and load Carbon Ads script
    const script = document.createElement('script');
    script.id = '_carbonads_js';
    script.src = `//cdn.carbonads.com/carbon.js?serve=${adConfig.carbonAds.serve}&placement=${adConfig.carbonAds.placement}`;
    script.async = true;

    adRef.current.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById('_carbonads_js');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Don't render anything if ads are disabled
  if (!adConfig.enabled) {
    return null;
  }

  return (
    <div className="ad-container" ref={adRef}>
      {/* Carbon Ads will inject content here */}
    </div>
  );
}

export default AdContainer;
