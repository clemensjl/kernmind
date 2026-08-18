'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  card: Card;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ card, onClick }) => {
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
      {/* Product Image */}
      {card.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Direct Visit Product Store Button on Hover */}
          {card.url && (
            <button
              onClick={handleOpenSource}
              title={`Visit ${card.domain || 'Store'}`}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105 z-10"
            >
              <span>Store</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          {card.price && (
            <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-sm">
              {card.price}
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {card.url ? (
            <button
              type="button"
              onClick={handleOpenSource}
              className="flex items-center gap-1.5 truncate max-w-[180px] hover:text-accent font-medium transition-colors group/link text-left"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-accent" />
              <span className="truncate group-hover/link:underline">{card.domain || 'Store'}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60 group-hover/link:opacity-100 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 truncate max-w-[180px]">
              <ShoppingBag className="w-3.5 h-3.5 text-accent" />
              <span className="truncate">{card.domain || 'Wishlist'}</span>
            </div>
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
