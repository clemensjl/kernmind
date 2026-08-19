'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navbar/Header';
import { QuickCaptureModal } from '@/components/modals/QuickCaptureModal';
import { AskMindModal } from '@/components/modals/AskMindModal';
import {
  ArrowLeft,
  Compass,
  Search,
  Layers,
  Sparkles,
  Plus,
  Brain,
  Home
} from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isAskMindOpen, setIsAskMindOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/20 selection:text-accent overflow-x-hidden">
      {/* Persistent Navigation Header */}
      <Header
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenAskMind={() => setIsAskMindOpen(true)}
      />

      {/* Main 404 Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="max-w-2xl w-full mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Visual Emblem */}
          <div className="relative inline-flex items-center justify-center">
            {/* Glowing radial background ring */}
            <div className="absolute -inset-4 rounded-full bg-accent/15 blur-2xl opacity-70 animate-pulse pointer-events-none" />
            
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-card border border-border/80 shadow-xl flex items-center justify-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-secondary/60">
                <img src="/logo.png" alt="KernMind" className="w-full h-full object-contain p-1" />
              </div>
            </div>
          </div>

          {/* Editorial Typography Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest font-mono">
              <span>Error 404 • Lost in Thought</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground leading-tight px-2">
              Memory not found in your Mind
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed px-4">
              The memory, link, or space you are looking for does not exist, has been moved, or faded into the ether.
            </p>
          </div>

          {/* Quick Search in Mind Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-md w-full mx-auto relative flex items-center px-2"
          >
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your memories instead..."
                className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-card border border-border/80 rounded-2xl shadow-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-foreground placeholder:text-muted-foreground transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>
          </form>

          {/* Fast Action Shortcuts */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Mind</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsQuickCaptureOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-secondary text-xs font-medium transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-accent" />
              <span>Capture New Note</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAskMindOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Companion</span>
            </button>

            <Link
              href="/spaces"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-secondary text-xs font-medium transition-all shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Smart Spaces</span>
            </Link>

            <Link
              href="/serendipity"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-secondary text-xs font-medium transition-all shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Serendipity</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Modals */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCardCreated={() => router.push('/')}
      />

      <AskMindModal
        isOpen={isAskMindOpen}
        onClose={() => setIsAskMindOpen(false)}
        allCards={[]}
        onSelectCard={() => router.push('/')}
      />
    </div>
  );
}
