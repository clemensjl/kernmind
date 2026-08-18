'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/lib/types';
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Type,
  Sun,
  Moon,
  Coffee,
  Check,
  Clock,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';

type FontOption = 'serif' | 'sans' | 'mono';
type ThemeOption = 'cream' | 'light' | 'sepia' | 'dark' | 'pitch';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [font, setFont] = useState<FontOption>('serif');
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<ThemeOption>('cream');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchCard = async () => {
      if (!params?.id) return;
      try {
        const res = await fetch(`/api/cards/${params.id}`);
        const data = await res.json();
        if (data.success && data.card) {
          setCard(data.card);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCard();
  }, [params?.id]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Loading reader view...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <p className="text-base font-medium text-foreground">Article not found</p>
        <Link href="/" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
          Return to Mind
        </Link>
      </div>
    );
  }

  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#F4ECD8] text-[#433422]';
      case 'light':
        return 'bg-white text-neutral-900';
      case 'dark':
        return 'bg-[#18181B] text-[#E4E4E7]';
      case 'pitch':
        return 'bg-black text-[#D4D4D8]';
      case 'cream':
      default:
        return 'bg-[#FDFBF7] text-[#1C1917]';
    }
  };

  const getFontFamily = () => {
    switch (font) {
      case 'sans':
        return 'font-sans';
      case 'mono':
        return 'font-mono';
      case 'serif':
      default:
        return 'font-serif';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClasses()}`}>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/10 z-50">
        <div
          className="h-full bg-accent transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Control Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-inherit/90 border-b border-black/5 dark:border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mind</span>
        </button>

        {/* Reader Customization Controls */}
        <div className="flex items-center gap-3">
          {/* Font switcher */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFont('serif')}
              className={`px-2 py-1 rounded ${font === 'serif' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'opacity-70'}`}
            >
              Serif
            </button>
            <button
              onClick={() => setFont('sans')}
              className={`px-2 py-1 rounded ${font === 'sans' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'opacity-70'}`}
            >
              Sans
            </button>
            <button
              onClick={() => setFont('mono')}
              className={`px-2 py-1 rounded ${font === 'mono' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'opacity-70'}`}
            >
              Mono
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-lg text-xs">
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="px-1 hover:opacity-100 opacity-70 font-semibold"
            >
              A-
            </button>
            <span className="text-[11px] font-mono opacity-80">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(26, s + 2))}
              className="px-1 hover:opacity-100 opacity-70 font-semibold"
            >
              A+
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme('cream')}
              title="Cream theme"
              className={`w-5 h-5 rounded-full bg-[#FDFBF7] border border-stone-300 transition-transform ${theme === 'cream' ? 'scale-125 ring-1 ring-stone-500' : 'opacity-70'}`}
            />
            <button
              onClick={() => setTheme('sepia')}
              title="Sepia theme"
              className={`w-5 h-5 rounded-full bg-[#F4ECD8] border border-amber-300 transition-transform ${theme === 'sepia' ? 'scale-125 ring-1 ring-amber-600' : 'opacity-70'}`}
            />
            <button
              onClick={() => setTheme('dark')}
              title="Dark theme"
              className={`w-5 h-5 rounded-full bg-[#18181B] border border-neutral-700 transition-transform ${theme === 'dark' ? 'scale-125 ring-1 ring-white' : 'opacity-70'}`}
            />
          </div>

          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              title="Original Source"
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all ml-1"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </header>

      {/* Reader Main Content Container */}
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Article Metadata */}
        <div className="space-y-4 pb-6 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs opacity-60 uppercase tracking-widest font-mono">
            {card.domain && <span>{card.domain}</span>}
            {card.estimatedReadTime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {card.estimatedReadTime} min read
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
            {card.title}
          </h1>

          {card.author && (
            <p className="text-sm italic opacity-80">
              Written by {card.author}
            </p>
          )}

          {card.summary && (
            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border-l-2 border-accent text-sm leading-relaxed opacity-90 italic">
              {card.summary}
            </div>
          )}
        </div>

        {/* Lead Image if available */}
        {card.imageUrl && (
          <div className="w-full rounded-2xl overflow-hidden my-6 shadow-md">
            <img src={card.imageUrl} alt={card.title} className="w-full h-auto object-cover max-h-96" />
          </div>
        )}

        {/* Body Text */}
        <article
          className={`space-y-6 leading-relaxed ${getFontFamily()}`}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {card.content ? (
            card.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xl font-bold font-sans pt-4 pb-1">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-2xl font-bold font-sans pt-6 pb-2">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-3xl font-bold font-sans pt-8 pb-3">
                    {paragraph.replace('# ', '')}
                  </h1>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="p-4 my-4 rounded-xl bg-black/5 dark:bg-white/5 border-l-4 border-accent italic"
                  >
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="leading-relaxed selection:bg-amber-200 dark:selection:bg-amber-900/60">
                  {paragraph}
                </p>
              );
            })
          ) : (
            <p className="italic opacity-60">No full content stored for this article.</p>
          )}
        </article>

        {/* Tags Footer */}
        {card.tags && card.tags.length > 0 && (
          <div className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1.5">
            {card.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 font-mono opacity-80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
