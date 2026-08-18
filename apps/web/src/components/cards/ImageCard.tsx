'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { Sparkles, Type } from 'lucide-react';

interface ImageCardProps {
  card: Card;
  onClick?: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="smart-card group relative rounded-2xl bg-card border border-border/70 overflow-hidden hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative w-full overflow-hidden bg-muted">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-auto object-cover max-h-96 transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-secondary text-muted-foreground text-sm">
            Image not available
          </div>
        )}

        {/* OCR badge if text extracted */}
        {card.ocrText && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
            <Type className="w-3 h-3 text-amber-300" />
            <span>OCR Extracted</span>
          </div>
        )}

        {/* Extracted Color Palette Overlay on hover/visible */}
        {card.colors && card.colors.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 p-1 rounded-full bg-black/50 backdrop-blur-md">
            {card.colors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                title={color}
                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {card.title}
        </h3>

        {card.ocrText && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 italic bg-secondary/50 p-1.5 rounded-lg">
            "{card.ocrText}"
          </p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
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
