'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { resolvedTheme, themeSetting, toggleTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Current: ${themeSetting === 'system' ? `System (${resolvedTheme})` : resolvedTheme}. Click to toggle.`}
      className={`p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${className}`}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-medium capitalize">
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
        </span>
      )}
    </button>
  );
};
