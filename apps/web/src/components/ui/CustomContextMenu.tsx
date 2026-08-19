'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Heart,
  BookOpen,
  ExternalLink,
  Copy,
  Trash2,
  Maximize2,
  Compass,
  Layers,
  Settings,
  RefreshCw,
  Search,
  Quote,
  Check,
  Share2,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface MenuPosition {
  x: number;
  y: number;
}

interface ClickedCardInfo {
  id: string;
  type: string;
  title: string;
  url?: string;
  isFavorite?: boolean;
}

export const CustomContextMenu: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [clickedCard, setClickedCard] = useState<ClickedCardInfo | null>(null);
  const [clickedLink, setClickedLink] = useState<string | null>(null);
  const [clickedImage, setClickedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't override context menu if holding shift or inside text inputs when user needs native spellcheck
      const target = e.target as HTMLElement;
      if (e.shiftKey) return;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.dataset.customContext) {
        // Still allow custom menu unless user explicitly holds shift
      }

      e.preventDefault();

      // Check for selected text
      const selection = window.getSelection()?.toString().trim() || '';
      setSelectedText(selection);

      // Check if inside a card
      const cardEl = target.closest('[data-card-id]') as HTMLElement | null;
      if (cardEl) {
        setClickedCard({
          id: cardEl.dataset.cardId || '',
          type: cardEl.dataset.cardType || 'note',
          title: cardEl.dataset.cardTitle || 'Memory',
          url: cardEl.dataset.cardUrl || undefined,
          isFavorite: cardEl.dataset.cardFavorite === 'true',
        });
      } else {
        setClickedCard(null);
      }

      // Check if clicked an anchor link
      const linkEl = target.closest('a') as HTMLAnchorElement | null;
      if (linkEl && linkEl.href) {
        setClickedLink(linkEl.href);
      } else {
        setClickedLink(null);
      }

      // Check if clicked an image
      const imgEl = target.closest('img') as HTMLImageElement | null;
      if (imgEl && imgEl.src) {
        setClickedImage(imgEl.src);
      } else {
        setClickedImage(null);
      }

      // Calculate safe position within viewport boundaries
      const menuWidth = 240;
      const menuHeight = 340;
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) {
        x = Math.max(10, window.innerWidth - menuWidth - 10);
      }
      if (y + menuHeight > window.innerHeight) {
        y = Math.max(10, window.innerHeight - menuHeight - 10);
      }

      setPosition({ x, y });
      setIsOpen(true);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  // Actions
  const handleOpenCapture = () => {
    closeMenu();
    window.dispatchEvent(new CustomEvent('open-quick-capture'));
  };

  const handleOpenAskMind = (initialQuery?: string) => {
    closeMenu();
    window.dispatchEvent(new CustomEvent('open-ask-mind', { detail: { query: initialQuery } }));
  };

  const handleSaveSelectedQuote = async () => {
    if (!selectedText) return;
    closeMenu();
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote',
          text: selectedText,
          title: `Quote: "${selectedText.substring(0, 40)}..."`,
          url: window.location.href,
        }),
      });
      if (res.ok) {
        showToast('Quote saved to your Mind!');
        window.dispatchEvent(new CustomEvent('mind-refreshed'));
      }
    } catch (err) {
      showToast('Could not save quote');
    }
  };

  const handleCardInspect = () => {
    if (!clickedCard) return;
    closeMenu();
    window.dispatchEvent(new CustomEvent('inspect-card-id', { detail: { cardId: clickedCard.id } }));
  };

  const handleToggleCardFavorite = async () => {
    if (!clickedCard) return;
    closeMenu();
    try {
      const nextFav = !clickedCard.isFavorite;
      await fetch(`/api/cards/${clickedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: nextFav }),
      });
      showToast(nextFav ? 'Added to favorites' : 'Removed from favorites');
      window.dispatchEvent(new CustomEvent('mind-refreshed'));
    } catch (err) {}
  };

  const handleDeleteCard = async () => {
    if (!clickedCard) return;
    closeMenu();
    if (!confirm(`Delete memory "${clickedCard.title}"?`)) return;
    try {
      await fetch(`/api/cards/${clickedCard.id}`, { method: 'DELETE' });
      showToast('Memory deleted');
      window.dispatchEvent(new CustomEvent('mind-refreshed'));
    } catch (err) {}
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`);
    closeMenu();
  };

  const handleSearchSelection = () => {
    if (!selectedText) return;
    closeMenu();
    router.push(`/?q=${encodeURIComponent(selectedText)}`);
  };

  if (!isOpen) {
    return toastMessage ? (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground text-background text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
        <Check className="w-3.5 h-3.5 text-accent" />
        <span>{toastMessage}</span>
      </div>
    ) : null;
  }

  return (
    <>
      <div
        ref={menuRef}
        style={{ left: position.x, top: position.y }}
        className="fixed z-50 w-60 py-1.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-sans select-none overflow-hidden"
      >
        {/* Header indicator */}
        <div className="px-3.5 py-1.5 border-b border-border/40 flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>{clickedCard ? clickedCard.type : selectedText ? 'Selection' : 'KernMind'}</span>
          <span className="font-mono text-[9px] lowercase opacity-70">menu</span>
        </div>

        {/* 1. SELECTION CONTEXT */}
        {selectedText && (
          <div className="py-1 border-b border-border/40">
            <button
              onClick={handleSaveSelectedQuote}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Quote className="w-4 h-4 text-accent shrink-0" />
              <span className="truncate">Save Selection as Quote</span>
            </button>

            <button
              onClick={() => handleOpenAskMind(`Explain this: "${selectedText}"`)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span>Ask AI about this</span>
            </button>

            <button
              onClick={handleSearchSelection}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">Search Mind for &ldquo;{selectedText.substring(0, 15)}...&rdquo;</span>
            </button>

            <button
              onClick={() => handleCopy(selectedText, 'Text')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Copy Selection</span>
            </button>
          </div>
        )}

        {/* 2. CARD CONTEXT */}
        {clickedCard && (
          <div className="py-1 border-b border-border/40">
            <button
              onClick={handleCardInspect}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Maximize2 className="w-4 h-4 text-accent shrink-0" />
              <span className="truncate font-semibold">Inspect / Edit Memory</span>
            </button>

            <button
              onClick={handleToggleCardFavorite}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Heart className={`w-4 h-4 shrink-0 ${clickedCard.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
              <span>{clickedCard.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}</span>
            </button>

            {clickedCard.type === 'article' && (
              <button
                onClick={() => {
                  closeMenu();
                  router.push(`/reader/${clickedCard.id}`);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-accent shrink-0" />
                <span>Open in Reader Mode</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAskMind(`Tell me about this memory titled: "${clickedCard.title}"`)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span>Ask AI about this Card</span>
            </button>

            {clickedCard.url && (
              <button
                onClick={() => window.open(clickedCard.url, '_blank')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Open Source Link</span>
              </button>
            )}

            {clickedCard.url && (
              <button
                onClick={() => handleCopy(clickedCard.url || '', 'Link')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
              >
                <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Copy Link</span>
              </button>
            )}

            <button
              onClick={handleDeleteCard}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-500/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Delete Memory</span>
            </button>
          </div>
        )}

        {/* 3. GENERAL MIND WORKSPACE ACTIONS */}
        <div className="py-1">
          <button
            onClick={handleOpenCapture}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-accent shrink-0" />
              <span>Quick Capture</span>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded">N</kbd>
          </button>

          <button
            onClick={() => handleOpenAskMind()}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span>Ask your Mind</span>
            </div>
            <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>

          <button
            onClick={() => {
              closeMenu();
              router.push('/serendipity');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
          >
            <Compass className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Serendipity Shuffle</span>
          </button>

          <button
            onClick={() => {
              closeMenu();
              router.push('/spaces');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
          >
            <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Smart Spaces</span>
          </button>

          <button
            onClick={() => {
              closeMenu();
              router.push('/settings');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Settings &amp; BYOK Keys</span>
          </button>

          <button
            onClick={() => {
              closeMenu();
              toggleTheme();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 shrink-0" />
            )}
            <span>{resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
          </button>

          <button
            onClick={() => handleCopy(window.location.href, 'Page URL')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors text-left"
          >
            <Share2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Share / Copy URL</span>
          </button>

          <button
            onClick={() => {
              closeMenu();
              window.location.reload();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-left"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>Reload Mind</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground text-background text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-3.5 h-3.5 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
