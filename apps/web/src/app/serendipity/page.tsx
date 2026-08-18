'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/lib/types';
import { Header } from '@/components/navbar/Header';
import { CardRenderer } from '@/components/cards/CardRenderer';
import { CardDetailModal } from '@/components/modals/CardDetailModal';
import { QuickCaptureModal } from '@/components/modals/QuickCaptureModal';
import { AskMindModal } from '@/components/modals/AskMindModal';
import { Dices, Sparkles, Clock, RefreshCw, Compass } from 'lucide-react';

export default function SerendipityPage() {
  const [serendipityCards, setSerendipityCards] = useState<Card[]>([]);
  const [forgottenGems, setForgottenGems] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isAskMindOpen, setIsAskMindOpen] = useState(false);

  const fetchSerendipity = async () => {
    setIsRolling(true);
    try {
      const res = await fetch('/api/serendipity?limit=8');
      const data = await res.json();
      if (data.success) {
        setSerendipityCards(data.serendipity);
        setForgottenGems(data.forgottenGems);
        setAllCards([...data.serendipity, ...data.forgottenGems]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRolling(false);
    }
  };

  useEffect(() => {
    fetchSerendipity();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenAskMind={() => setIsAskMindOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Serendipity Banner */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <Compass className="w-4 h-4" />
            <span>Serendipity Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
            Rediscover your Mind
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            The human brain makes breakthroughs through unexpected connections. Roll the dice to surface forgotten ideas, notes, quotes, and visuals from your second brain.
          </p>

          <button
            onClick={fetchSerendipity}
            disabled={isRolling}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'Reshuffling...' : 'Roll the Serendipity Dice'}</span>
          </button>
        </div>

        {/* Serendipity Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Surfaced Sparks</span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Surfacing memories...
            </div>
          ) : (
            <div className="masonry-grid">
              {serendipityCards.map((card) => (
                <div key={card.id} className="masonry-item">
                  <CardRenderer card={card} onClick={setSelectedCard} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forgotten Gems */}
        {forgottenGems.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Forgotten Gems (Saved in the past)</span>
            </div>

            <div className="masonry-grid">
              {forgottenGems.map((card) => (
                <div key={card.id} className="masonry-item">
                  <CardRenderer card={card} onClick={setSelectedCard} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CardDetailModal
        card={selectedCard}
        isOpen={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        onUpdate={(updated) => {
          setSerendipityCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setSelectedCard(null);
        }}
        onDelete={(id) => {
          setSerendipityCards((prev) => prev.filter((c) => c.id !== id));
          setSelectedCard(null);
        }}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCardCreated={(newCard) => {
          setSerendipityCards((prev) => [newCard, ...prev]);
        }}
      />

      <AskMindModal
        isOpen={isAskMindOpen}
        onClose={() => setIsAskMindOpen(false)}
        allCards={allCards}
        onSelectCard={setSelectedCard}
      />
    </div>
  );
}
