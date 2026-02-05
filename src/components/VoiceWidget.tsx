'use client';

import { useEffect } from 'react';

export default function VoiceWidget() {
  useEffect(() => {
    // Load ElevenLabs convai widget script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* @ts-expect-error - Custom element from ElevenLabs */}
      <elevenlabs-convai agent-id="agent_3401kf214arkefmbpmmkv01mjq9s" />
    </div>
  );
}
