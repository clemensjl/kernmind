'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { BookOpen, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ArticleCardProps {
  card: Card;
  onClick?: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="smart-card group relative rounded-2xl bg-card border border-border/70 overflow-hidden hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      {/* Cover Image */}
      {card.imageUrl && (
        <div className="relative w-full h-44 overflow-hidden bg-muted">
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {card.estimatedReadTime && (
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{card.estimatedReadTime} min read</span>
            </div>
          )}
        </div>
      )}

      {/* Reading Progress Indicator */}
      {card.readingProgress > 0 && (
        <div className="w-full h-1 bg-secondary">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${card.readingProgress}%` }}
          />
        </div>
      )}

      <div className="p-4 space-y-2.5">
        {/* Source metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
            {card.favicon && (
              <img
                src={card.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-sm shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span className="truncate">{card.domain || 'Article'}</span>
          </div>

          <Link
            href={`/reader/${card.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary hover:bg-muted text-foreground text-[11px] font-medium transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>Read</span>
          </Link>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {card.title}
        </h3>

        {/* Summary or excerpt */}
        {(card.summary || card.content) && (
          <p className="text-xs text-foreground/75 line-clamp-3 leading-relaxed">
            {card.summary || card.content}
          </p>
        )}

        {/* Tags */}
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
