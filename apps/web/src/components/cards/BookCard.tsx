'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { BookMarked, Star } from 'lucide-react';

interface BookCardProps {
  card: Card;
  onClick?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="smart-card group relative rounded-2xl bg-card border border-border/70 overflow-hidden hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      {card.imageUrl && (
        <div className="relative w-full h-52 overflow-hidden bg-muted flex items-center justify-center p-4">
          <img
            src={card.imageUrl}
            alt={card.title}
            className="h-full w-auto object-contain rounded-md shadow-md transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5 text-accent" />
            <span>Book</span>
          </div>
          {card.rating && (
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{card.rating}</span>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-base text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {card.title}
        </h3>

        {card.author && (
          <p className="text-xs text-muted-foreground font-medium">
            by {card.author}
          </p>
        )}

        {card.content && (
          <p className="text-xs text-foreground/75 line-clamp-3 leading-relaxed">
            {card.content}
          </p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-border/40">
            {card.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
