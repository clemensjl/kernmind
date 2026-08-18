'use client';

import React, { useState, useEffect } from 'react';
import { Card, SearchFilter } from '@/lib/types';
import { Header } from '@/components/navbar/Header';
import { Omnibar } from '@/components/search/Omnibar';
import { CardRenderer } from '@/components/cards/CardRenderer';
import { CardDetailModal } from '@/components/modals/CardDetailModal';
import { QuickCaptureModal } from '@/components/modals/QuickCaptureModal';
import { AskMindModal } from '@/components/modals/AskMindModal';
import { Plus, Sparkles, Inbox, RefreshCw, Compass } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<SearchFilter>({ type: 'all' });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isAskMindOpen, setIsAskMindOpen] = useState(false);

  const fetchCards = async (currentFilter: SearchFilter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilter.query) params.set('q', currentFilter.query);
      if (currentFilter.type && currentFilter.type !== 'all') params.set('type', currentFilter.type);
      if (currentFilter.color) params.set('color', currentFilter.color);
      if (currentFilter.favoritesOnly) params.set('favorites', 'true');

      const res = await fetch(`/api/cards?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCards(data.cards);
        if (!currentFilter.query && currentFilter.type === 'all' && !currentFilter.color) {
          setAllCards(data.cards);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(filter);
  }, [filter]);

  // Keyboard shortcut 'N' for new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !isQuickCaptureOpen &&
        !selectedCard &&
        !isAskMindOpen
      ) {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickCaptureOpen, selectedCard, isAskMindOpen]);

  const handleCardCreated = (newCard: Card) => {
    setCards((prev) => [newCard, ...prev]);
    setAllCards((prev) => [newCard, ...prev]);
  };

  const handleCardUpdated = (updated: Card) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setAllCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCard(null);
  };

  const handleCardDeleted = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setAllCards((prev) => prev.filter((c) => c.id !== id));
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/20 selection:text-accent">
      <Header
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenAskMind={() => setIsAskMindOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Omnibar Floating Search */}
        <Omnibar
          filter={filter}
          onFilterChange={setFilter}
          totalCount={cards.length}
        />

        {/* Loading state */}
        {isLoading && cards.length === 0 && (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Accessing your Mind...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && cards.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Nothing found in your Mind</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {filter.query || filter.color || filter.type !== 'all'
                  ? 'Try adjusting your search criteria or clear the filters.'
                  : 'Start by saving your first note, article, quote, or color palette.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsQuickCaptureOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Save Something</span>
              </button>
              {(filter.query || filter.color || filter.type !== 'all') && (
                <button
                  onClick={() => setFilter({ type: 'all' })}
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Masonry Grid */}
        {cards.length > 0 && (
          <div className="masonry-grid">
            {cards.map((card) => (
              <div key={card.id} className="masonry-item">
                <CardRenderer card={card} onClick={setSelectedCard} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Bar on Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30 flex items-center gap-2">
        <button
          onClick={() => setIsAskMindOpen(true)}
          className="p-3.5 rounded-full bg-card border border-border shadow-lg text-accent hover:bg-secondary transition-transform active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="p-3.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Modals */}
      <CardDetailModal
        card={selectedCard}
        isOpen={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleCardUpdated}
        onDelete={handleCardDeleted}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCardCreated={handleCardCreated}
      />

      <AskMindModal
        isOpen={isAskMindOpen}
        onClose={() => setIsAskMindOpen(false)}
        allCards={allCards.length > 0 ? allCards : cards}
        onSelectCard={setSelectedCard}
      />
    </div>
  );
}
