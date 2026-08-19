'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeSetting = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  themeSetting: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeSetting) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeSetting: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Read stored preference or default to system
    const stored = localStorage.getItem('kernmind_theme') as ThemeSetting | null;
    const initialSetting: ThemeSetting = stored && ['system', 'light', 'dark'].includes(stored) ? stored : 'system';
    setThemeSetting(initialSetting);

    // 2. Resolve system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (setting: ThemeSetting) => {
      let active: ResolvedTheme = 'light';
      if (setting === 'dark') {
        active = 'dark';
      } else if (setting === 'light') {
        active = 'light';
      } else {
        // System preference
        active = mediaQuery.matches ? 'dark' : 'light';
      }

      setResolvedTheme(active);

      if (active === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    applyTheme(initialSetting);
    setMounted(true);

    // 3. System color change listener
    const handleSystemThemeChange = () => {
      const currentStored = localStorage.getItem('kernmind_theme') as ThemeSetting | null;
      if (!currentStored || currentStored === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const setTheme = (setting: ThemeSetting) => {
    setThemeSetting(setting);
    localStorage.setItem('kernmind_theme', setting);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let active: ResolvedTheme = 'light';
    if (setting === 'dark') {
      active = 'dark';
    } else if (setting === 'light') {
      active = 'light';
    } else {
      active = mediaQuery.matches ? 'dark' : 'light';
    }

    setResolvedTheme(active);

    if (active === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ themeSetting, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
