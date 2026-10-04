'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'gp-theme';

/** Runs before paint (see app/layout.tsx) so a saved theme never flashes. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}`;

const ThemeContext = createContext<{ choice: ThemeChoice; setChoice: (c: ThemeChoice) => void; resolved: 'light' | 'dark' } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>('system');
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark') setChoiceState(saved);
    } catch {
      /* ignore */
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c);
    const root = document.documentElement;
    if (c === 'system') delete root.dataset.theme;
    else root.dataset.theme = c;
    try {
      if (c === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const resolved = choice === 'system' ? (systemDark ? 'dark' : 'light') : choice;
  return <ThemeContext.Provider value={{ choice, setChoice, resolved }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
