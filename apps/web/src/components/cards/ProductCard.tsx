'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { ShoppingBag, Tag, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  card: Card;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="smart-card group relative rounded-2xl bg-card border border-border/70 overflow-hidden hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      {/* Product Image */}
      {card.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {card.price && (
            <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-sm">
              {card.price}
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
            <ShoppingBag className="w-3.5 h-3.5 text-accent" />
            <span className="truncate">{card.domain || 'Wishlist'}</span>
          </div>
          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <h3 className="font-semibold text-base text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {card.title}
        </h3>

        {card.content && (
          <p className="text-xs text-foreground/75 line-clamp-2">
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
