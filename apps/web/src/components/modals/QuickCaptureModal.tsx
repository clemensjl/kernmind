'use client';

import React, { useState } from 'react';
import { Card } from '@/lib/types';
import { Plus, X, Link as LinkIcon, Sparkles, Loader2, Palette, Quote, FileText } from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: (card: Card) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onCardCreated,
}) => {
  const [input, setInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUrl = input.trim().startsWith('http://') || input.trim().startsWith('https://') || input.trim().includes('.com') || input.trim().includes('.org') || input.trim().includes('.io');
  const isColor = input.trim().startsWith('#') && (input.trim().length === 4 || input.trim().length === 7);
  const isQuote = input.trim().startsWith('“') || input.trim().startsWith('"');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    const tags = tagsInput
      .split(/\s+/)
      .map(t => (t.startsWith('#') ? t : `#${t}`))
      .filter(t => t.length > 1);

    try {
      const payload: any = { tags };

      if (isUrl) {
        payload.url = input.trim();
      } else if (isColor) {
        payload.type = 'color';
        payload.text = input.trim();
        payload.colors = [input.trim().toUpperCase()];
      } else if (isQuote) {
        payload.type = 'quote';
        payload.text = input.trim();
      } else {
        payload.type = 'note';
        payload.text = input.trim();
      }

      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.card) {
        onCardCreated(data.card);
        setInput('');
        setTagsInput('');
        onClose();
      } else {
        setError(data.error || 'Failed to capture item');
      }
    } catch (err: any) {
      setError(err.message || 'Capture failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Save to your Mind</h2>
              <p className="text-xs text-muted-foreground">Drop a link, note, quote, or hex color</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a URL, type a note, quote, or color (#E07A5F)..."
              autoFocus
              className="w-full p-3.5 text-sm bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-2xl outline-none transition-all placeholder:text-muted-foreground/60 leading-relaxed"
            />

            {/* Smart Detection Pill */}
            {input.trim() && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/90 backdrop-blur-sm text-[11px] font-medium text-foreground">
                {isUrl && (
                  <>
                    <LinkIcon className="w-3 h-3 text-blue-500" />
                    <span>URL / Article</span>
                  </>
                )}
                {isColor && (
                  <>
                    <Palette className="w-3 h-3 text-rose-500" />
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: input.trim() }} />
                      Color Swatch
                    </span>
                  </>
                )}
                {isQuote && (
                  <>
                    <Quote className="w-3 h-3 text-amber-500" />
                    <span>Quote</span>
                  </>
                )}
                {!isUrl && !isColor && !isQuote && (
                  <>
                    <FileText className="w-3 h-3 text-purple-500" />
                    <span>Quick Note</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Optional tags: #design #ideas"
              className="w-full px-3.5 py-2 text-xs bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-xl outline-none transition-all font-mono placeholder:font-sans"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium px-1">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Remembering...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Remember</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
