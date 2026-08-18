'use client';

import React, { useState } from 'react';
import { Card } from '@/lib/types';
import { FileText, CheckSquare, Check } from 'lucide-react';

interface NoteCardProps {
  card: Card;
  onClick?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ card, onClick }) => {
  const [content, setContent] = useState(card.content || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const isChecklist = content.includes('- [ ]') || content.includes('- [x]');

  const handleToggleTodo = async (e: React.MouseEvent, lineIndex: number) => {
    e.stopPropagation(); // Don't trigger modal click
    if (isUpdating) return;

    const lines = content.split('\n');
    const targetLine = lines[lineIndex];
    if (!targetLine) return;

    let updatedLine = targetLine;
    if (targetLine.startsWith('- [ ]')) {
      updatedLine = targetLine.replace('- [ ]', '- [x]');
    } else if (targetLine.startsWith('- [x]')) {
      updatedLine = targetLine.replace('- [x]', '- [ ]');
    }

    lines[lineIndex] = updatedLine;
    const newContent = lines.join('\n');
    setContent(newContent);
    setIsUpdating(true);

    try {
      await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
    } catch (err) {
      console.error('Failed to update checklist item:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderChecklist = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const isChecked = line.startsWith('- [x]');
      const isUnchecked = line.startsWith('- [ ]');

      if (isChecked || isUnchecked) {
        const itemText = line.replace(/^- \[( |x)\]\s*/, '');
        return (
          <div
            key={idx}
            onClick={(e) => handleToggleTodo(e, idx)}
            className="flex items-start gap-2.5 py-0.5 text-sm group/item cursor-pointer select-none transition-colors"
          >
            <button
              type="button"
              className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center border transition-all ${
                isChecked
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'border-muted-foreground/50 hover:border-foreground bg-secondary/30'
              }`}
            >
              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <span
              className={`flex-1 transition-all leading-snug ${
                isChecked
                  ? 'text-muted-foreground line-through decoration-muted-foreground/60'
                  : 'text-foreground/90 group-hover/item:text-foreground'
              }`}
            >
              {itemText}
            </span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-sm text-foreground/80 leading-relaxed">
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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          {isChecklist ? <CheckSquare className="w-3.5 h-3.5 text-accent" /> : <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
          <span>{isChecklist ? 'Checklist' : 'Note'}</span>
        </div>
      </div>

      <h3 className="font-semibold text-base text-foreground leading-snug mb-2.5 group-hover:text-accent transition-colors">
        {card.title}
      </h3>

      {content && (
        <div className="space-y-1 mb-3">
          {isChecklist ? (
            renderChecklist(content)
          ) : (
            <p className="text-sm text-foreground/80 line-clamp-6 leading-relaxed whitespace-pre-wrap">
              {content}
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
