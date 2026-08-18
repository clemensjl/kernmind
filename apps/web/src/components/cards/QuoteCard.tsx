'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { Quote } from 'lucide-react';

interface QuoteCardProps {
  card: Card;
  onClick?: () => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="smart-card group relative p-6 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border/70 hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <Quote className="w-5 h-5 text-accent/80" />
        {card.domain && (
          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
            {card.domain}
          </span>
        )}
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
