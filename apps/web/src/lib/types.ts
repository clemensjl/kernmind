export type CardType = 
  | 'note'
  | 'quote'
  | 'highlight'
  | 'article'
  | 'image'
  | 'color'
  | 'product'
  | 'book'
  | 'code'
  | 'file';

export interface Card {
  id: string;
  type: CardType;
  title: string;
  content?: string;
  url?: string;
  domain?: string;
  imageUrl?: string;
  favicon?: string;
  author?: string;
  price?: string;
  currency?: string;
  rating?: number;
  colors?: string[];
  tags: string[];
  ocrText?: string;
  summary?: string;
  isFavorite: boolean;
  isArchived: boolean;
  readingProgress: number; // 0-100
  estimatedReadTime?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface SmartSpace {
  id: string;
  name: string;
  emoji: string;
  query: string;
  iconColor?: string;
  isPinned: boolean;
  orderIndex: number;
  createdAt: string;
}

export type AIProvider = 'openai' | 'gemini' | 'claude' | 'groq' | 'openrouter' | 'ollama' | 'local_heuristic';

export interface Settings {
  aiProvider: AIProvider;
  apiKeys: {
    openai?: string;
    gemini?: string;
    claude?: string;
    groq?: string;
    openrouter?: string;
  };
  selectedModels: {
    openai?: string;
    gemini?: string;
    claude?: string;
    groq?: string;
    openrouter?: string;
    ollama?: string;
  };
  ollamaBaseUrl: string;
  autoTaggingEnabled: boolean;
  ocrEnabled: boolean;
  theme: 'system' | 'light' | 'dark' | 'cream' | 'sepia';
  cardDensity: 'comfortable' | 'compact' | 'visual';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  referencedCardIds?: string[];
  createdAt: string;
}

export interface SearchFilter {
  query?: string;
  type?: CardType | 'all';
  tags?: string[];
  color?: string;
  domain?: string;
  favoritesOnly?: boolean;
  archivedOnly?: boolean;
  dateRange?: 'all' | 'today' | 'this-week' | 'this-month' | 'this-year';
}
