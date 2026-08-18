'use client';

import React from 'react';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  Shield,
  Key,
  Compass,
  BookOpen,
  Palette,
  CheckCircle2,
  XCircle,
  Download,
  Terminal,
  ArrowRight,
  Github,
  Zap,
  Layers,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const comparisonData = [
    { feature: 'License & Source Code', kernmind: '100% Open Source (MIT)', mymind: 'Proprietary / Closed Source' },
    { feature: 'Annual Cost', kernmind: '$0 / Free Forever', mymind: '$144 / year ($12/mo)' },
    { feature: 'AI Engine', kernmind: 'BYOK (OpenAI, Gemini, Claude, Groq, Ollama)', mymind: 'Proprietary Blackbox AI' },
    { feature: 'Data Storage & Privacy', kernmind: '100% Local-First (SQLite + Vector)', mymind: 'Proprietary Cloud Lock-in' },
    { feature: 'Distraction-Free Reader', kernmind: 'Full Reader + Typography Controls', mymind: 'Restricted to Mastermind Plan' },
    { feature: 'Color Palette Extractor', kernmind: 'Interactive Harmonies + Swatches', mymind: 'Basic Swatch Detection' },
    { feature: 'Data Portability', kernmind: '1-Click JSON & Markdown ZIP Export', mymind: 'Limited Export' },
    { feature: 'Offline Support', kernmind: 'Runs 100% offline with Ollama/Heuristics', mymind: 'Requires Internet & Cloud' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-sans selection:bg-accent/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FDFBF7]/85 border-b border-[#EADBCE]/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1C1917] text-white flex items-center justify-center shadow-xs">
              <Brain className="w-4 h-4 text-[#E07A5F]" />
            </div>
            <span className="font-bold text-lg tracking-tight">KernMind</span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/clemensjl/kernmind"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#44403C] hover:bg-[#F2EDE4] transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1917] text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>Open Web App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] text-xs font-semibold tracking-wide">
          <Sparkles className="w-4 h-4" />
          <span>The Open-Source, Privacy-First MyMind Alternative</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-serif tracking-tight text-[#1C1917] leading-[1.1]">
          Remember everything.<br />
          <span className="italic font-normal text-[#E07A5F]">Organize nothing.</span>
        </h1>

        <p className="text-base sm:text-xl text-[#78716C] max-w-2xl mx-auto leading-relaxed">
          KernMind is your personal, AI-powered extension of biological memory. Save articles, colors, quotes, notes, and visual inspiration with 1-click. 100% self-hosted & Bring Your Own Key.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1917] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            <span>Launch Web App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://github.com/clemensjl/kernmind"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#EADBCE] text-[#1C1917] text-sm font-semibold hover:bg-[#F2EDE4] transition-all shadow-xs"
          >
            <Github className="w-4 h-4" />
            <span>Star on GitHub</span>
          </a>
        </div>

        <p className="text-xs text-[#A99B89] font-mono pt-2">
          MIT Licensed • 100% Free • Windows App & Chrome Extension Included
        </p>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE]/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E07A5F]/10 flex items-center justify-center text-[#E07A5F]">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1C1917]">Bring Your Own Key (BYOK)</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">
              Connect Google Gemini, OpenAI, Claude 3.5, Groq, or run 100% offline with local Ollama models. You pay pennies per year instead of $144/year subscriptions.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE]/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1C1917]">100% Local & Private</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">
              No tracking, no telemetry, no social vanity metrics. Your memories live inside an ultra-fast local SQLite database on your own machine.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE]/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1C1917]">Serendipity & Smart Spaces</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">
              Dynamic collections that auto-update from search queries. Roll the Serendipity Dice to rediscover forgotten ideas and quotes.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold font-serif tracking-tight text-[#1C1917]">
            KernMind vs. mymind.com
          </h2>
          <p className="text-sm text-[#78716C]">
            Why thousands of knowledge workers are switching to self-hosted, BYOK Second Brains.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-white border border-[#EADBCE] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EADBCE] bg-[#F9F6F0]">
                <th className="p-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Feature</th>
                <th className="p-4 text-sm font-bold text-[#1C1917] bg-[#E07A5F]/10">KernMind (Our Project)</th>
                <th className="p-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">mymind.com</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]/60 text-sm">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FDFBF7]">
                  <td className="p-4 font-medium text-[#1C1917]">{row.feature}</td>
                  <td className="p-4 font-semibold text-emerald-700 bg-[#E07A5F]/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{row.kernmind}</span>
                  </td>
                  <td className="p-4 text-[#78716C]">
                    <span>{row.mymind}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 1-Click Docker / Deployment section */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-serif text-[#1C1917]">
            Deploy in 60 Seconds
          </h2>
          <p className="text-sm text-[#78716C]">
            Run anywhere with Docker or pnpm.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#141417] text-white font-mono text-xs sm:text-sm space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-neutral-400 pb-2 border-b border-neutral-800">
            <Terminal className="w-4 h-4 text-[#E07A5F]" />
            <span>Terminal</span>
          </div>
          <p className="text-emerald-400"># Clone and launch with Docker Compose</p>
          <p>git clone https://github.com/clemensjl/openmind.git kernmind</p>
          <p>cd kernmind</p>
          <p className="text-amber-300">docker compose up -d</p>
          <p className="text-neutral-400"># Open http://localhost:3000</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#EADBCE] px-6 text-center text-xs text-[#78716C] space-y-2">
        <p className="font-medium text-[#1C1917]">
          KernMind — Built with craftsmanship for free-thinking minds.
        </p>
        <p>Released under the permissive MIT License. 100% Open Source.</p>
      </footer>
    </div>
  );
}
