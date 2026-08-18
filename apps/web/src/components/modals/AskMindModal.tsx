'use client';

import React, { useState } from 'react';
import { Card, ChatMessage } from '@/lib/types';
import { Sparkles, X, Send, Bot, User, Loader2, Bookmark, ArrowRight } from 'lucide-react';

interface AskMindModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: Card[];
  onSelectCard?: (card: Card) => void;
}

export const AskMindModal: React.FC<AskMindModalProps> = ({
  isOpen,
  onClose,
  allCards,
  onSelectCard,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I am your OpenMind AI companion. Ask me anything across your saved articles, quotes, color palettes, and notes.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'What quotes on design do I have saved?',
    'Summarize my notes on Second Brain architecture',
    'What products are in my wishlist?',
    'Find items saved about minimalism',
  ];

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || query;
    if (!promptText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptText.trim(),
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          referencedCardIds: data.referencedCardIds,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${data.error || 'Could not query your mind'}`,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error connecting to AI service: ${err.message}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Ask your Mind</h2>
              <p className="text-xs text-muted-foreground">Conversational recall across your second brain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            const referencedCards = msg.referencedCardIds
              ? allCards.filter((c) => msg.referencedCardIds?.includes(c.id))
              : [];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isBot ? 'bg-accent/15 text-accent' : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] p-4 rounded-2xl text-sm leading-relaxed ${
                    isBot
                      ? 'bg-secondary/60 text-foreground'
                      : 'bg-primary text-primary-foreground font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Referenced Card Chips */}
                  {referencedCards.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Cited Memories:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {referencedCards.map((card) => (
                          <button
                            key={card.id}
                            onClick={() => {
                              if (onSelectCard) {
                                onSelectCard(card);
                                onClose();
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:border-accent transition-colors shadow-xs"
                          >
                            <Bookmark className="w-3 h-3 text-accent" />
                            <span className="truncate max-w-[180px]">{card.title}</span>
                            <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-10">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing your memories...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        {messages.length === 1 && (
          <div className="px-6 py-2 border-t border-border/30 flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-secondary hover:bg-muted text-secondary-foreground transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-border/60 bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your saved memories..."
              className="flex-1 px-4 py-2.5 text-sm bg-secondary/50 focus:bg-card border border-transparent focus:border-border rounded-xl outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
