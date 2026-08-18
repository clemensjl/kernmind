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
  Github,
  Moon,
  Sun
} from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs transition-transform group-hover:scale-105 flex items-center justify-center bg-card border border-border/60">
            <img src="/logo.png" alt="KernMind" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground leading-none">
              KernMind
            </span>
            <span className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">
              byok • local-first
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
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
        <div className="flex items-center gap-2">
          {/* Ask AI Button */}
          <button
            onClick={onOpenAskMind}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Mind</span>
          </button>

          {/* Quick Capture (+) Button */}
          <button
            onClick={onOpenQuickCapture}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Capture</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/clemensjl/kernmind"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
