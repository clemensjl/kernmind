'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { Quote, ArrowUpRight } from 'lucide-react';

interface QuoteCardProps {
  card: Card;
  onClick?: () => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ card, onClick }) => {
  const handleOpenSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.url) {
      window.open(card.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={onClick}
      className="smart-card group relative p-6 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border/70 hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <Quote className="w-5 h-5 text-accent/80" />
        {card.url ? (
          <button
            type="button"
            onClick={handleOpenSource}
            title={`Visit ${card.domain || card.url}`}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-accent truncate max-w-[150px] transition-colors group/link"
          >
            <span className="truncate group-hover/link:underline">{card.domain || 'Source'}</span>
            <ArrowUpRight className="w-3 h-3 opacity-60 group-hover/link:opacity-100 shrink-0" />
          </button>
        ) : card.domain ? (
          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
            {card.domain}
          </span>
        ) : null}
      </div>

      <blockquote className="font-serif italic text-lg sm:text-xl text-foreground leading-relaxed mb-4">
        {card.content || card.title}
      </blockquote>

      {card.author && (
        <div className="text-xs font-sans font-medium text-muted-foreground flex items-center gap-1.5 mb-3">
          <span className="w-4 h-[1px] bg-muted-foreground/50" />
          <span>{card.author}</span>
        </div>
      )}

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
          {card.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
