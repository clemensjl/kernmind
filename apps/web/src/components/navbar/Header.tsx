'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Plus,
  Compass,
  Sparkles,
  Layers,
  Settings as SettingsIcon,
  Github
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface HeaderProps {
  onOpenQuickCapture: () => void;
  onOpenAskMind: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickCapture,
  onOpenAskMind,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Mind', href: '/', icon: Brain },
    { label: 'Spaces', href: '/spaces', icon: Layers },
    { label: 'Serendipity', href: '/serendipity', icon: Compass },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/85 border-b border-border/50 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden transition-transform group-hover:scale-105 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="KernMind" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-foreground leading-none">
                KernMind
              </span>
              <span className="hidden xs:inline text-[9px] sm:text-[10px] text-muted-foreground font-mono leading-none mt-0.5">
                byok • local-first
              </span>
            </div>
          </Link>

          {/* Center Nav Links (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-border/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Theme Toggle Button (Always visible on all screens) */}
            <ThemeToggle />

            {/* Ask AI Button */}
            <button
              onClick={onOpenAskMind}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Mind</span>
            </button>

            {/* Quick Capture (+) Button */}
            <button
              onClick={onOpenQuickCapture}
              className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Capture</span>
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/clemensjl/kernmind"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors hidden sm:flex"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible only on small mobile devices) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-lg border-t border-border/60 py-1.5 px-4 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-accent font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
