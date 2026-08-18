'use client';

import React, { useState, useEffect } from 'react';
import { Settings, AIProvider } from '@/lib/types';
import { Header } from '@/components/navbar/Header';
import { QuickCaptureModal } from '@/components/modals/QuickCaptureModal';
import { AskMindModal } from '@/components/modals/AskMindModal';
import {
  Key,
  Cpu,
  Download,
  Upload,
  Palette,
  Shield,
  Save,
  Check,
  Server,
  FileArchive,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isAskMindOpen, setIsAskMindOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setImportStatus('Importing memories...');

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      if (data.success) {
        setImportStatus(`Successfully imported ${data.count} items!`);
      } else {
        setImportStatus(`Import failed: ${data.error}`);
      }
    } catch (err: any) {
      setImportStatus(`Invalid JSON file: ${err.message}`);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenAskMind={() => setIsAskMindOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Settings & AI Configuration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure your Bring Your Own Key (BYOK) providers, local LLMs, themes, and data exports.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* AI BYOK Provider Selection */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">AI Intelligence (BYOK)</h2>
                <p className="text-xs text-muted-foreground">Select your preferred AI engine for auto-tagging, OCR, and memory chat.</p>
              </div>
            </div>

            {/* Provider Radios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'local_heuristic', label: 'Local Heuristics', desc: '100% Offline, 0 API Keys' },
                { id: 'gemini', label: 'Google Gemini', desc: 'Fast, multimodal & generous free tier' },
                { id: 'openai', label: 'OpenAI', desc: 'GPT-4o & GPT-4o-mini' },
                { id: 'claude', label: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet / Haiku' },
                { id: 'groq', label: 'Groq', desc: 'Ultra-fast open models (Llama 3.3)' },
                { id: 'ollama', label: 'Ollama (Local)', desc: '100% Private local LLM (localhost:11434)' },
              ].map((prov) => {
                const isSelected = settings.aiProvider === prov.id;
                return (
                  <div
                    key={prov.id}
                    onClick={() => setSettings({ ...settings, aiProvider: prov.id as AIProvider })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-foreground/5 border-foreground shadow-xs'
                        : 'bg-card border-border/70 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{prov.label}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-accent bg-accent' : 'border-muted-foreground/40'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{prov.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* API Keys Inputs */}
            <div className="space-y-4 pt-2">
              {/* Google Gemini */}
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Key className="w-3.5 h-3.5 text-accent" />
                  <span>Google Gemini API Key</span>
                </label>
                <input
                  type="password"
                  value={settings.apiKeys?.gemini || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, gemini: e.target.value },
                    })
                  }
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2 text-xs bg-secondary/50 focus:bg-card border border-transparent focus:border-border rounded-xl font-mono outline-none"
                />
              </div>

              {/* OpenAI */}
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Key className="w-3.5 h-3.5 text-accent" />
                  <span>OpenAI API Key</span>
                </label>
                <input
                  type="password"
                  value={settings.apiKeys?.openai || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, openai: e.target.value },
                    })
                  }
                  placeholder="sk-..."
                  className="w-full px-3.5 py-2 text-xs bg-secondary/50 focus:bg-card border border-transparent focus:border-border rounded-xl font-mono outline-none"
                />
              </div>

              {/* Anthropic Claude */}
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Key className="w-3.5 h-3.5 text-accent" />
                  <span>Anthropic Claude API Key</span>
                </label>
                <input
                  type="password"
                  value={settings.apiKeys?.claude || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, claude: e.target.value },
                    })
                  }
                  placeholder="sk-ant-..."
                  className="w-full px-3.5 py-2 text-xs bg-secondary/50 focus:bg-card border border-transparent focus:border-border rounded-xl font-mono outline-none"
                />
              </div>

              {/* Groq */}
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Key className="w-3.5 h-3.5 text-accent" />
                  <span>Groq API Key</span>
                </label>
                <input
                  type="password"
                  value={settings.apiKeys?.groq || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, groq: e.target.value },
                    })
                  }
                  placeholder="gsk_..."
                  className="w-full px-3.5 py-2 text-xs bg-secondary/50 focus:bg-card border border-transparent focus:border-border rounded-xl font-mono outline-none"
                />
              </div>

              {/* Ollama Local URL */}
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Server className="w-3.5 h-3.5 text-accent" />
                  <span>Ollama Local Server URL</span>
                </label>
                <input
                  type="text"
                  value={settings.ollamaBaseUrl || 'http://localhost:11434'}
                  onChange={(e) => setSettings({ ...settings, ollamaBaseUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3.5 py-2 text-xs bg-secondary/50 focus:bg-card border border-transparent focus:border-border rounded-xl font-mono outline-none"
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-border/40">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={settings.autoTaggingEnabled}
                  onChange={(e) => setSettings({ ...settings, autoTaggingEnabled: e.target.checked })}
                  className="rounded border-border w-4 h-4 text-accent"
                />
                <span>Enable AI Auto-Tagging & Categorization</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={settings.ocrEnabled}
                  onChange={(e) => setSettings({ ...settings, ocrEnabled: e.target.checked })}
                  className="rounded border-border w-4 h-4 text-accent"
                />
                <span>Enable Image OCR Text Extraction</span>
              </label>
            </div>
          </div>

          {/* Backup, Export & Import */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Data Ownership & Portability</h2>
                <p className="text-xs text-muted-foreground">Your data is stored 100% locally in SQLite. Export or migrate anytime.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export JSON */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
                <h3 className="text-xs font-semibold text-foreground">Export JSON Backup</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Download all memories, spaces, and tags in structured JSON format.
                </p>
                <a
                  href="/api/export?format=json"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-medium hover:border-foreground text-foreground transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </a>
              </div>

              {/* Export Markdown ZIP */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
                <h3 className="text-xs font-semibold text-foreground">Export Markdown ZIP</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Export each item as an Obsidian-compatible Markdown note with YAML frontmatter.
                </p>
                <a
                  href="/api/export?format=markdown"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-medium hover:border-foreground text-foreground transition-colors"
                >
                  <FileArchive className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </a>
              </div>
            </div>

            {/* Import Area */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-foreground block mb-2">
                Import from MyMind, Pocket, or OpenMind JSON
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-xs font-medium cursor-pointer hover:border-foreground text-foreground transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select JSON File</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
                {importStatus && <span className="text-xs text-accent font-medium">{importStatus}</span>}
              </div>
            </div>
          </div>

          {/* Bottom Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Modals */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCardCreated={() => {}}
      />

      <AskMindModal
        isOpen={isAskMindOpen}
        onClose={() => setIsAskMindOpen(false)}
        allCards={[]}
      />
    </div>
  );
}
