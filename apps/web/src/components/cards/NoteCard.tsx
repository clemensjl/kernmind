'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { FileText, CheckSquare } from 'lucide-react';

interface NoteCardProps {
  card: Card;
  onClick?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ card, onClick }) => {
  const isChecklist = card.content?.includes('- [ ]') || card.content?.includes('- [x]');

  const renderChecklist = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('- [x]')) {
        return (
          <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
            <span>{line.replace('- [x]', '').trim()}</span>
          </div>
        );
      }
      if (line.startsWith('- [ ]')) {
        return (
          <div key={idx} className="flex items-start gap-2 text-sm text-foreground">
            <span className="w-3.5 h-3.5 mt-0.5 rounded border border-muted-foreground inline-block" />
            <span>{line.replace('- [ ]', '').trim()}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="text-sm text-foreground/90">
          {line}
        </p>
      );
    });
  };

  return (
    <div
      onClick={onClick}
      className="smart-card group relative p-5 rounded-2xl bg-card border border-border/60 hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isChecklist ? <CheckSquare className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          <span>{isChecklist ? 'Checklist' : 'Note'}</span>
        </div>
      </div>

      <h3 className="font-semibold text-base text-foreground leading-snug mb-2 group-hover:text-accent transition-colors">
        {card.title}
      </h3>

      {card.content && (
        <div className="space-y-1 mb-3">
          {isChecklist ? (
            renderChecklist(card.content)
          ) : (
            <p className="text-sm text-foreground/80 line-clamp-6 leading-relaxed whitespace-pre-wrap">
              {card.content}
            </p>
          )}
        </div>
      )}

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
          {card.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
