'use client';

import { useState, useEffect } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import ZenMode from './ZenMode';
import ProMode from './ProMode';

/**
 * CanvaBuilder — Mode Switcher (Zen ↔ Pro)
 *
 * Default: Zen Mode (Canvas-First, simple for teachers)
 * Toggle: Pro Mode (full panels, advanced users)
 *
 * Mode is persisted in localStorage so it's remembered across sessions.
 */
export default function CanvaBuilder() {
  const [mode, setMode] = useState<'zen' | 'pro'>(() => {
    // Default to zen mode, remember last choice
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('canva-mode');
        if (saved === 'pro') return 'pro';
      } catch { /* ignore */ }
    }
    return 'zen';
  });

  // Auto-load saved project on mount
  useEffect(() => {
    const store = useCanvaStore.getState();
    if (store.hasSavedProject()) {
      store.loadProject();
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'zen' ? 'pro' : 'zen';
    setMode(newMode);
    try {
      localStorage.setItem('canva-mode', newMode);
    } catch { /* ignore */ }
  };

  if (mode === 'pro') {
    return <ProMode onToggleMode={toggleMode} />;
  }

  return <ZenMode onToggleMode={toggleMode} />;
}
