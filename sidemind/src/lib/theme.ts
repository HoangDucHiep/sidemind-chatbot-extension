// SideMind · Theme Switcher & Hook
// Supports 'light' | 'dark' | 'auto' with persistent storage

import { useState, useEffect } from 'react';
import { storage } from './storage';

export type Theme = 'light' | 'dark' | 'auto';

let currentTheme: Theme = 'light';

export function applyTheme(theme: Theme): void {
  currentTheme = theme;
  let effectiveTheme: 'light' | 'dark' = 'light';

  if (theme === 'auto') {
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectiveTheme = prefersDark ? 'dark' : 'light';
  } else {
    effectiveTheme = theme;
  }

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  storage.set('sidemind_theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme);

  useEffect(() => {
    storage.get('sidemind_theme').then((saved) => {
      if (saved) {
        setThemeState(saved);
        applyTheme(saved);
      } else {
        applyTheme('light');
      }
    });

    const unwatch = storage.watch('sidemind_theme', (newTheme) => {
      if (newTheme) {
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    });

    // Listen for OS scheme change if theme is auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (currentTheme === 'auto') {
        applyTheme('auto');
      }
    };
    mediaQuery.addEventListener('change', listener);

    return () => {
      unwatch();
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return {
    theme,
    setTheme: changeTheme,
  };
}
