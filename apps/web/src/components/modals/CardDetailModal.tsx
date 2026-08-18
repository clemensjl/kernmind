'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardType } from '@/lib/types';
import {
  X,
  Trash2,
  Heart,
  BookOpen,
  ExternalLink,
  Sparkles,
  Save,
  Clock,
  Palette,
  Tag as TagIcon
} from 'lucide-react';
import Link from 'next/link';

interface CardDetailModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Card) => void;
  onDelete: (id: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiTagging, setIsAiTagging] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setContent(card.content || '');
      setTagsInput(card.tags?.join(' ') || '');
      setIsFavorite(card.isFavorite || false);
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const tags = tagsInput
      .split(/\s+/)
      .map(t => (t.startsWith('#') ? t : `#${t}`))
      .filter(t => t.length > 1);

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags,
          isFavorite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate(data.card);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    const nextFav = !isFavorite;
    setIsFavorite(nextFav);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: nextFav }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate(data.card);
      }
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this memory from your Mind?')) return;
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(card.id);
        onClose();
      }
    } catch (err) {}
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
              {card.type}
            </span>
            {card.domain && <span>• {card.domain}</span>}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleFavorite}
              title="Favorite"
              className={`p-2 rounded-full hover:bg-secondary transition-colors ${
                isFavorite ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            {card.type === 'article' && (
              <Link
                href={`/reader/${card.id}`}
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-muted text-xs font-medium text-foreground transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Reader Mode</span>
              </Link>
            )}

            {card.url && (
              <a
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={handleDelete}
              title="Delete"
              className="p-2 rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Cover Media if available */}
          {card.imageUrl && (
            <div className="w-full rounded-2xl overflow-hidden max-h-72 bg-muted flex items-center justify-center">
              <img src={card.imageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Color swatches if color type */}
          {card.colors && card.colors.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Palettes:</span>
              <div className="flex items-center gap-2">
                {card.colors.map((c, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-card border border-border"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Editable Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-lg font-semibold bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-xl outline-none transition-all"
            />
          </div>

          {/* Content / Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {card.type === 'quote' ? 'Quote Text' : 'Content / Notes'}
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-sm bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-xl outline-none transition-all leading-relaxed"
            />
          </div>

          {/* OCR Extracted Text if any */}
          {card.ocrText && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                OCR Extracted Text
              </p>
              <p className="text-xs text-foreground/80 font-mono whitespace-pre-wrap">
                {card.ocrText}
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <TagIcon className="w-3 h-3" />
              <span>Tags (space separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#design #inspiration #quote"
              className="w-full px-3 py-2 text-sm bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-xl outline-none transition-all font-mono"
            />
          </div>

          {/* Metadata timestamp */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Saved on {new Date(card.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            {card.author && <span>By {card.author}</span>}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60 bg-secondary/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
