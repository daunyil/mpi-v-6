import { create } from 'zustand';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (typeof window !== 'undefined' && localStorage.getItem('editor_theme') as ThemeMode) || 'dark',
  toggleTheme: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('editor_theme', next);
    set({ mode: next });
  },
  setTheme: (mode) => {
    localStorage.setItem('editor_theme', mode);
    set({ mode });
  },
}));
