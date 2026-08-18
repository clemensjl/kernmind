'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { BookOpen, Clock, ExternalLink, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface ArticleCardProps {
  card: Card;
  onClick?: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ card, onClick }) => {
  const handleOpenSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.url) {
      window.open(card.url, '_blank', 'noopener,noreferrer');
    }
  };

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

          {/* Direct Visit Website Overlay Button on Hover */}
          {card.url && (
            <button
              onClick={handleOpenSource}
              title={`Visit ${card.domain || 'original website'}`}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105 z-10"
            >
              <span>Visit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

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
        {/* Source metadata & Action Buttons */}
        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
          {card.url ? (
            <button
              type="button"
              onClick={handleOpenSource}
              title={`Open ${card.url}`}
              className="flex items-center gap-1.5 truncate max-w-[170px] hover:text-accent font-medium transition-colors text-left group/domain"
            >
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
              <span className="truncate group-hover/domain:underline">{card.domain || 'Source Website'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60 group-hover/domain:opacity-100 transition-opacity shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              {card.favicon && (
                <img
                  src={card.favicon}
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                />
              )}
              <span className="truncate">{card.domain || 'Article'}</span>
            </div>
          )}

          {/* Quick Read / Visit Button Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            {card.url && (
              <button
                type="button"
                onClick={handleOpenSource}
                title="Visit original website"
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/80 hover:bg-secondary hover:text-accent text-foreground text-[11px] font-medium transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Visit</span>
              </button>
            )}

            <Link
              href={`/reader/${card.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary hover:bg-muted text-foreground text-[11px] font-medium transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              <span>Read</span>
            </Link>
          </div>
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
