'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/lib/types';
import {
  Plus,
  X,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  Palette,
  Quote,
  FileText,
  ListTodo,
  CheckSquare,
  Square,
  Trash2,
  Check
} from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: (card: Card) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onCardCreated,
}) => {
  const [mode, setMode] = useState<'text' | 'checklist'>('text');
  const [input, setInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', text: '', done: false },
    { id: '2', text: '', done: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const itemInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  if (!isOpen) return null;

  const isUrl = input.trim().startsWith('http://') || input.trim().startsWith('https://') || input.trim().includes('.com') || input.trim().includes('.org') || input.trim().includes('.io');
  const isColor = input.trim().startsWith('#') && (input.trim().length === 4 || input.trim().length === 7);
  const isQuote = input.trim().startsWith('“') || input.trim().startsWith('"');
  const isChecklistText = input.includes('- [ ]') || input.includes('- [x]');

  // Insert - [ ] at cursor position in text mode
  const handleInsertCheckbox = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setInput((prev) => (prev ? `${prev}\n- [ ] ` : '- [ ] '));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const prefix = start > 0 && val[start - 1] !== '\n' ? '\n- [ ] ' : '- [ ] ';
    const nextVal = val.substring(0, start) + prefix + val.substring(end);
    setInput(nextVal);
    setTimeout(() => {
      textarea.focus();
      const nextPos = start + prefix.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  // Checklist mode handlers
  const handleAddItem = (afterId?: string) => {
    const newItem: ChecklistItem = { id: Date.now().toString(), text: '', done: false };
    if (!afterId) {
      setChecklistItems((prev) => [...prev, newItem]);
    } else {
      setChecklistItems((prev) => {
        const idx = prev.findIndex((i) => i.id === afterId);
        if (idx === -1) return [...prev, newItem];
        const next = [...prev];
        next.splice(idx + 1, 0, newItem);
        return next;
      });
    }
    setTimeout(() => {
      itemInputRefs.current[newItem.id]?.focus();
    }, 20);
  };

  const handleUpdateItemText = (id: string, text: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleToggleItemDone = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    if (checklistItems.length <= 1) {
      setChecklistItems([{ id: Date.now().toString(), text: '', done: false }]);
      return;
    }
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(id);
    } else if (e.key === 'Backspace') {
      const current = checklistItems.find((i) => i.id === id);
      if (current && current.text === '' && checklistItems.length > 1) {
        e.preventDefault();
        const idx = checklistItems.findIndex((i) => i.id === id);
        handleRemoveItem(id);
        const prevItem = checklistItems[idx - 1];
        if (prevItem) {
          itemInputRefs.current[prevItem.id]?.focus();
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    const tags = tagsInput
      .split(/\s+/)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    try {
      const payload: any = { tags };

      if (mode === 'checklist') {
        const validItems = checklistItems.filter((i) => i.text.trim().length > 0);
        if (validItems.length === 0) {
          setError('Please add at least one task to the checklist.');
          setIsLoading(false);
          return;
        }

        const markdownContent = validItems
          .map((item) => `- [${item.done ? 'x' : ' '}] ${item.text.trim()}`)
          .join('\n');

        payload.type = 'note';
        payload.title = checklistTitle.trim() || `Checklist (${validItems.length} tasks)`;
        payload.text = markdownContent;
        if (!tags.includes('#checklist')) {
          payload.tags = ['#checklist', ...tags];
        }
      } else {
        if (!input.trim()) {
          setIsLoading(false);
          return;
        }

        if (isUrl) {
          payload.url = input.trim();
        } else if (isColor) {
          payload.type = 'color';
          payload.text = input.trim();
          payload.colors = [input.trim().toUpperCase()];
        } else if (isQuote) {
          payload.type = 'quote';
          payload.text = input.trim();
        } else {
          payload.type = 'note';
          payload.text = input.trim();
        }
      }

      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.card) {
        onCardCreated(data.card);
        setInput('');
        setTagsInput('');
        setChecklistTitle('');
        setChecklistItems([
          { id: '1', text: '', done: false },
          { id: '2', text: '', done: false },
        ]);
        onClose();
      } else {
        setError(data.error || 'Failed to capture item');
      }
    } catch (err: any) {
      setError(err.message || 'Capture failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden p-6 space-y-4 font-sans"
      >
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              {mode === 'checklist' ? <ListTodo className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {mode === 'checklist' ? 'New Checklist' : 'Save to your Mind'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mode === 'checklist' ? 'Interactive tasks with 1-click toggles' : 'Drop a link, note, quote, or color'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode Switcher Pills */}
            <div className="flex items-center bg-secondary/70 p-0.5 rounded-full border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  mode === 'text'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Quick Note
              </button>
              <button
                type="button"
                onClick={() => setMode('checklist')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${
                  mode === 'checklist'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListTodo className="w-3 h-3 text-accent" />
                <span>Checklist</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. CHECKLIST MODE */}
          {mode === 'checklist' ? (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={checklistTitle}
                  onChange={(e) => setChecklistTitle(e.target.value)}
                  placeholder="Checklist title (e.g. Weekend Roadmap, Grocery List)..."
                  className="w-full px-3.5 py-2.5 text-sm font-semibold bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-xl outline-none transition-all placeholder:font-normal placeholder:text-muted-foreground/60"
                  autoFocus
                />
              </div>

              {/* Task Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {checklistItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-secondary/30 border border-border/40 focus-within:border-accent/60 transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleItemDone(item.id)}
                      className={`p-1 rounded-md transition-colors ${
                        item.done
                          ? 'text-accent bg-accent/10'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.done ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <input
                      ref={(el) => {
                        itemInputRefs.current[item.id] = el;
                      }}
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                      onKeyDown={(e) => handleItemKeyDown(e, item.id)}
                      placeholder={`Task item ${index + 1}... (Press Enter for next)`}
                      className={`flex-1 text-xs sm:text-sm bg-transparent outline-none ${
                        item.done ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddItem()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-xs font-medium text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-accent" />
                <span>Add Task Item</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-1">(or Enter)</span>
              </button>
            </div>
          ) : (
            /* 2. FREE TEXT / URL / QUOTE MODE */
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste a URL, type a note, quote, checklist (- [ ] task), or color (#E07A5F)..."
                autoFocus
                className="w-full p-3.5 pb-10 text-sm bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-2xl outline-none transition-all placeholder:text-muted-foreground/60 leading-relaxed font-sans"
              />

              {/* Text formatting tools row */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInsertCheckbox}
                  title="Insert task checkbox"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card/90 hover:bg-secondary border border-border/60 text-[11px] font-medium text-foreground transition-colors shadow-2xs"
                >
                  <CheckSquare className="w-3 h-3 text-accent" />
                  <span>+ Checkbox</span>
                </button>
              </div>

              {/* Smart Detection Pill */}
              {input.trim() && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/90 backdrop-blur-sm text-[11px] font-medium text-foreground">
                  {isUrl && (
                    <>
                      <LinkIcon className="w-3 h-3 text-blue-500" />
                      <span>URL / Article</span>
                    </>
                  )}
                  {isColor && (
                    <>
                      <Palette className="w-3 h-3 text-rose-500" />
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: input.trim() }} />
                        Color Swatch
                      </span>
                    </>
                  )}
                  {isQuote && (
                    <>
                      <Quote className="w-3 h-3 text-amber-500" />
                      <span>Quote</span>
                    </>
                  )}
                  {isChecklistText && (
                    <>
                      <ListTodo className="w-3 h-3 text-emerald-500" />
                      <span>Checklist</span>
                    </>
                  )}
                  {!isUrl && !isColor && !isQuote && !isChecklistText && (
                    <>
                      <FileText className="w-3 h-3 text-purple-500" />
                      <span>Quick Note</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tags row */}
          <div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Optional tags: #todos #roadmap #ideas"
              className="w-full px-3.5 py-2 text-xs bg-secondary/40 focus:bg-card border border-transparent focus:border-border rounded-xl outline-none transition-all font-mono placeholder:font-sans"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium px-1">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (mode === 'text' && !input.trim()) || (mode === 'checklist' && checklistItems.filter(i => i.text.trim()).length === 0)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{mode === 'checklist' ? 'Save Checklist' : 'Remember'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
