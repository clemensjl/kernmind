'use client';

import React, { useRef, useEffect } from 'react';
import { CardType, SearchFilter } from '@/lib/types';
import {
  Search,
  X,
  Sparkles,
  Heart,
  Newspaper,
  FileText,
  Quote,
  Palette,
  Image as ImageIcon,
  ShoppingBag,
  BookOpen,
  LucideIcon
} from 'lucide-react';

interface OmnibarProps {
  filter: SearchFilter;
  onFilterChange: (newFilter: SearchFilter) => void;
  totalCount: number;
}

const TYPE_PILLS: { label: string; type: CardType | 'all'; Icon: LucideIcon }[] = [
  { label: 'All', type: 'all', Icon: Sparkles },
  { label: 'Articles', type: 'article', Icon: Newspaper },
  { label: 'Notes', type: 'note', Icon: FileText },
  { label: 'Quotes', type: 'quote', Icon: Quote },
  { label: 'Colors', type: 'color', Icon: Palette },
  { label: 'Images', type: 'image', Icon: ImageIcon },
  { label: 'Products', type: 'product', Icon: ShoppingBag },
  { label: 'Books', type: 'book', Icon: BookOpen },
];

const COLOR_SWATCHES = [
  { label: 'Red', hex: '#EF4444' },
  { label: 'Warm Orange', hex: '#F97316' },
  { label: 'Gold', hex: '#F59E0B' },
  { label: 'Emerald', hex: '#10B981' },
  { label: 'Teal', hex: '#14B8A6' },
  { label: 'Sky', hex: '#0EA5E9' },
  { label: 'Violet', hex: '#8B5CF6' },
  { label: 'Rose', hex: '#F43F5E' },
  { label: 'Dark', hex: '#18181B' },
];

export const Omnibar: React.FC<OmnibarProps> = ({
  filter,
  onFilterChange,
  totalCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQueryChange = (val: string) => {
    onFilterChange({ ...filter, query: val });
  };

  const handleTypeSelect = (type: CardType | 'all') => {
    onFilterChange({ ...filter, type: type === filter.type ? 'all' : type });
  };

  const handleColorSelect = (hex: string) => {
    onFilterChange({ ...filter, color: filter.color === hex ? undefined : hex });
  };

  const handleToggleFavorites = () => {
    onFilterChange({ ...filter, favoritesOnly: !filter.favoritesOnly });
  };

  const hasActiveFilters = Boolean(filter.query || (filter.type && filter.type !== 'all') || filter.color || filter.favoritesOnly);

  const handleResetFilters = () => {
    onFilterChange({ type: 'all', query: '', color: undefined, favoritesOnly: false });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Main Omnibar Search Container */}
      <div className="relative group">
        <div className="relative flex items-center bg-card border border-border/80 focus-within:border-foreground/30 focus-within:shadow-omnibar rounded-full px-4 py-3 transition-all duration-300">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-foreground shrink-0 transition-colors ml-1" />

          <input
            ref={inputRef}
            type="text"
            value={filter.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search your mind... (keywords, #tags, colors, URLs)"
            className="flex-1 px-3.5 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm sm:text-base outline-none"
          />

          <div className="flex items-center gap-2 pr-1">
            {filter.query && (
              <button
                onClick={() => handleQueryChange('')}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleToggleFavorites}
              title="Favorites only"
              className={`p-1.5 rounded-full transition-colors ${
                filter.favoritesOnly
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${filter.favoritesOnly ? 'fill-rose-500' : ''}`} />
            </button>

            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground/70 bg-secondary/80 px-2 py-0.5 rounded-md">
              <span>⌘K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips & Colors Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {TYPE_PILLS.map((pill) => {
            const isSelected = (filter.type || 'all') === pill.type;
            const PillIcon = pill.Icon;
            return (
              <button
                key={pill.type}
                onClick={() => handleTypeSelect(pill.type)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-foreground text-background shadow-xs scale-105'
                    : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <PillIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Color Palette Swatches */}
        <div className="flex items-center gap-1.5 ml-auto">
          {COLOR_SWATCHES.map((swatch) => {
            const isSelected = filter.color === swatch.hex;
            return (
              <button
                key={swatch.hex}
                onClick={() => handleColorSelect(swatch.hex)}
                title={`Filter by ${swatch.label}`}
                className={`w-4 h-4 rounded-full border transition-all ${
                  isSelected
                    ? 'scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background'
                    : 'opacity-70 hover:opacity-100 hover:scale-110 border-black/10'
                }`}
                style={{ backgroundColor: swatch.hex }}
              />
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-muted-foreground hover:text-foreground underline pl-1.5"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
