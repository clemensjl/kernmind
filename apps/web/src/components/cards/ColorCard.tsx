'use client';

import React, { useState } from 'react';
import { Card } from '@/lib/types';
import { getColorHarmonies, getColorName, hexToRgb } from '@/lib/colors';
import { Check, Copy, Palette } from 'lucide-react';

interface ColorCardProps {
  card: Card;
  onClick?: () => void;
}

export const ColorCard: React.FC<ColorCardProps> = ({ card, onClick }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const primaryHex = card.colors?.[0] || (card.content?.startsWith('#') ? card.content : '#E07A5F');
  const rgb = hexToRgb(primaryHex);
  const colorName = getColorName(primaryHex);
  const harmonies = getColorHarmonies(primaryHex);

  const handleCopy = (e: React.MouseEvent, hex: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div
      onClick={onClick}
      className="smart-card group relative rounded-2xl bg-card border border-border/70 overflow-hidden hover:border-border hover:shadow-card-hover cursor-pointer transition-all duration-200"
    >
      {/* Primary Color Banner */}
      <div
        className="w-full h-32 relative flex items-end p-4 transition-transform duration-300 group-hover:scale-[1.01]"
        style={{ backgroundColor: primaryHex }}
      >
        <button
          onClick={(e) => handleCopy(e, primaryHex)}
          className="ml-auto px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-mono font-medium flex items-center gap-1.5 hover:bg-black/60 transition-colors"
        >
          {copied === primaryHex ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 opacity-70" />
              <span>{primaryHex}</span>
            </>
          )}
        </button>
      </div>

      {/* Card Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">{colorName}</h3>
            {rgb && (
              <p className="text-[11px] font-mono text-muted-foreground">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </p>
            )}
          </div>
          <Palette className="w-4 h-4 text-muted-foreground/60" />
        </div>

        {/* Harmonies & Sub-palettes */}
        <div className="pt-2 border-t border-border/40">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
            Harmony Swatches
          </p>
          <div className="flex items-center gap-1.5">
            {[primaryHex, harmonies.complementary, ...harmonies.analogous].map((hex, idx) => (
              <div
                key={idx}
                onClick={(e) => handleCopy(e, hex)}
                title={`Copy ${hex}`}
                className="group/swatch relative flex-1 h-6 rounded-md cursor-pointer border border-black/10 transition-transform hover:scale-110"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {card.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
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
