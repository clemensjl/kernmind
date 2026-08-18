'use client';

import React, { useState, useEffect } from 'react';
import { SmartSpace, Card } from '@/lib/types';
import { Header } from '@/components/navbar/Header';
import { CardRenderer } from '@/components/cards/CardRenderer';
import { CardDetailModal } from '@/components/modals/CardDetailModal';
import { QuickCaptureModal } from '@/components/modals/QuickCaptureModal';
import { AskMindModal } from '@/components/modals/AskMindModal';
import {
  Layers,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Palette,
  Quote,
  Compass,
  Code,
  Image as ImageIcon,
  ShoppingBag,
  Lightbulb,
  Bookmark,
  Terminal,
  Heart,
  Folder,
  Feather,
  Flame,
  Globe,
  Cpu,
  LucideIcon
} from 'lucide-react';

const SPACE_ICON_MAP: Record<string, LucideIcon> = {
  'Layers': Layers,
  'BookOpen': BookOpen,
  'Palette': Palette,
  'Sparkles': Sparkles,
  'Quote': Quote,
  'Compass': Compass,
  'Code': Code,
  'Image': ImageIcon,
  'ShoppingBag': ShoppingBag,
  'Lightbulb': Lightbulb,
  'Bookmark': Bookmark,
  'Terminal': Terminal,
  'Heart': Heart,
  'Folder': Folder,
  'Feather': Feather,
  'Flame': Flame,
  'Globe': Globe,
  'Cpu': Cpu,
};

const AVAILABLE_ICONS = Object.keys(SPACE_ICON_MAP);

function getSpaceIcon(iconNameOrEmoji: string): LucideIcon {
  if (SPACE_ICON_MAP[iconNameOrEmoji]) {
    return SPACE_ICON_MAP[iconNameOrEmoji];
  }
  // Fallback heuristics for legacy seed data
  if (iconNameOrEmoji === '📖' || iconNameOrEmoji.includes('book')) return BookOpen;
  if (iconNameOrEmoji === '🎨' || iconNameOrEmoji.includes('art') || iconNameOrEmoji.includes('color')) return Palette;
  if (iconNameOrEmoji === '🧠' || iconNameOrEmoji.includes('mind') || iconNameOrEmoji.includes('ai')) return Cpu;
  if (iconNameOrEmoji === '💬' || iconNameOrEmoji.includes('quote')) return Quote;
  if (iconNameOrEmoji === '💡' || iconNameOrEmoji.includes('idea')) return Lightbulb;
  return Layers;
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<SmartSpace[]>([]);
  const [activeSpace, setActiveSpace] = useState<SmartSpace | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Lightbulb');
  const [newQuery, setNewQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isAskMindOpen, setIsAskMindOpen] = useState(false);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('/api/spaces');
      const data = await res.json();
      if (data.success && data.spaces) {
        setSpaces(data.spaces);
        if (!activeSpace && data.spaces.length > 0) {
          setActiveSpace(data.spaces[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  // Fetch cards for active space query
  useEffect(() => {
    if (!activeSpace) return;
    const fetchSpaceCards = async () => {
      setIsLoading(true);
      try {
        const query = activeSpace.query;
        let endpoint = '/api/cards';
        const params = new URLSearchParams();

        if (query.startsWith('type:')) {
          params.set('type', query.replace('type:', ''));
        } else if (query.startsWith('tag:')) {
          params.set('tags', query.replace('tag:', ''));
        } else if (query.startsWith('color:')) {
          params.set('color', query.replace('color:', ''));
        } else {
          params.set('q', query);
        }

        const res = await fetch(`${endpoint}?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setCards(data.cards);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpaceCards();
  }, [activeSpace]);

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newQuery.trim()) return;

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          emoji: selectedIcon,
          query: newQuery.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.space) {
        setSpaces((prev) => [...prev, data.space]);
        setActiveSpace(data.space);
        setNewName('');
        setNewQuery('');
        setSelectedIcon('Lightbulb');
        setIsCreating(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSpace = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this Smart Space?')) return;
    try {
      const res = await fetch(`/api/spaces/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSpaces((prev) => prev.filter((s) => s.id !== id));
        if (activeSpace?.id === id) {
          setActiveSpace(spaces.find((s) => s.id !== id) || null);
        }
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenAskMind={() => setIsAskMindOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-accent" />
              <span>Smart Spaces</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Dynamic, auto-updating collections powered by queries and tags.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs self-start"
          >
            <Plus className="w-4 h-4" />
            <span>New Smart Space</span>
          </button>
        </div>

        {/* Create Space Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateSpace}
            className="p-5 rounded-2xl bg-card border border-border/80 shadow-md max-w-xl space-y-4 animate-in fade-in duration-200"
          >
            <h3 className="text-sm font-semibold text-foreground">Create Smart Space</h3>
            
            {/* Symbol / Icon Selector */}
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Select Symbol</label>
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-secondary/40 border border-border/50">
                {AVAILABLE_ICONS.map((iconKey) => {
                  const IconComp = SPACE_ICON_MAP[iconKey];
                  const isSelected = selectedIcon === iconKey;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setSelectedIcon(iconKey)}
                      title={iconKey}
                      className={`p-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-foreground text-background shadow-xs scale-110'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Space Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Architecture Studio"
                required
                className="w-full p-2.5 text-sm bg-secondary/50 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Filter Query (e.g. <code className="text-accent font-mono">tag:#design</code>, <code className="text-accent font-mono">type:article</code>, <code className="text-accent font-mono">color:warm</code>)
              </label>
              <input
                type="text"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="tag:#architecture or type:image"
                required
                className="w-full p-2.5 text-sm font-mono bg-secondary/50 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >
                Create Space
              </button>
            </div>
          </form>
        )}

        {/* Space Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {spaces.map((space) => {
            const isActive = activeSpace?.id === space.id;
            const SpaceIcon = getSpaceIcon(space.emoji);
            return (
              <div
                key={space.id}
                onClick={() => setActiveSpace(space)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer text-xs font-medium transition-all shrink-0 border ${
                  isActive
                    ? 'bg-foreground text-background border-transparent shadow-sm'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:border-border'
                }`}
              >
                <SpaceIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{space.name}</span>
                <span className="text-[10px] opacity-60 font-mono">({space.query})</span>
                <button
                  onClick={(e) => handleDeleteSpace(space.id, e)}
                  title="Remove Space"
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Space Content Header */}
        {activeSpace && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono">Active Filter: {activeSpace.query}</span>
            <span>{cards.length} saved memory(ies)</span>
          </div>
        )}

        {/* Masonry Grid */}
        {cards.length > 0 ? (
          <div className="masonry-grid">
            {cards.map((card) => (
              <div key={card.id} className="masonry-item">
                <CardRenderer card={card} onClick={setSelectedCard} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No items currently match this Smart Space criteria.
          </div>
        )}
      </main>

      {/* Modals */}
      <CardDetailModal
        card={selectedCard}
        isOpen={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        onUpdate={(updated) => {
          setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setSelectedCard(null);
        }}
        onDelete={(id) => {
          setCards((prev) => prev.filter((c) => c.id !== id));
          setSelectedCard(null);
        }}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCardCreated={(newCard) => {
          setCards((prev) => [newCard, ...prev]);
        }}
      />

      <AskMindModal
        isOpen={isAskMindOpen}
        onClose={() => setIsAskMindOpen(false)}
        allCards={cards}
        onSelectCard={setSelectedCard}
      />
    </div>
  );
}
