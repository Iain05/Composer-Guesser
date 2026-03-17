import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, DEFAULT_THEME, type Theme } from '@src/styles/themes';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  currentTheme: string;
  setTheme: (name: string) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(themeName: string, isDark: boolean) {
  const theme = themes[themeName] ?? themes[DEFAULT_THEME];
  const tokens = isDark ? theme.dark : theme.light;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--color-${key}`, value);
  }
  root.classList.toggle('dark', isDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme-mode');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentTheme, setCurrentThemeState] = useState(() => {
    const stored = localStorage.getItem('theme-name');
    return stored && themes[stored] ? stored : DEFAULT_THEME;
  });

  useEffect(() => {
    applyTheme(currentTheme, isDark);
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    localStorage.setItem('theme-name', currentTheme);
  }, [isDark, currentTheme]);

  function toggleTheme() {
    setIsDark((d) => !d);
  }

  function setTheme(name: string) {
    if (themes[name]) setCurrentThemeState(name);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
