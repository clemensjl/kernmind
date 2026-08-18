import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Card, SmartSpace, Settings, SearchFilter } from './types';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'openmind.db');
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      url TEXT,
      domain TEXT,
      imageUrl TEXT,
      favicon TEXT,
      author TEXT,
      price TEXT,
      currency TEXT,
      rating REAL,
      colors TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      ocrText TEXT,
      summary TEXT,
      isFavorite INTEGER NOT NULL DEFAULT 0,
      isArchived INTEGER NOT NULL DEFAULT 0,
      readingProgress INTEGER NOT NULL DEFAULT 0,
      estimatedReadTime INTEGER,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS spaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      query TEXT NOT NULL,
      iconColor TEXT,
      isPinned INTEGER NOT NULL DEFAULT 1,
      orderIndex INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
    CREATE INDEX IF NOT EXISTS idx_cards_created ON cards(createdAt);
    CREATE INDEX IF NOT EXISTS idx_cards_favorite ON cards(isFavorite);
    CREATE INDEX IF NOT EXISTS idx_cards_archived ON cards(isArchived);
  `);

  // Check if cards table is empty, if so, seed sample items
  const countRow = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number };
  if (countRow.count === 0) {
    seedInitialData(db);
  }
}

function seedInitialData(db: Database.Database) {
  const now = new Date().toISOString();
  const insertCard = db.prepare(`
    INSERT INTO cards (
      id, type, title, content, url, domain, imageUrl, favicon, author, price, currency, rating,
      colors, tags, ocrText, summary, isFavorite, isArchived, readingProgress, estimatedReadTime, createdAt, updatedAt
    ) VALUES (
      @id, @type, @title, @content, @url, @domain, @imageUrl, @favicon, @author, @price, @currency, @rating,
      @colors, @tags, @ocrText, @summary, @isFavorite, @isArchived, @readingProgress, @estimatedReadTime, @createdAt, @updatedAt
    )
  `);

  const initialCards: Card[] = [
    {
      id: 'seed-quote-1',
      type: 'quote',
      title: 'Design Philosophy Quote',
      content: '“Simplicity is about subtracting the obvious and adding the meaningful.”',
      author: 'John Maeda, The Laws of Simplicity',
      url: 'https://lawsofsimplicity.com',
      domain: 'lawsofsimplicity.com',
      tags: ['#design', '#philosophy', '#quote', '#minimalism'],
      colors: ['#0F172A', '#F8FAFC'],
      isFavorite: true,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-color-1',
      type: 'color',
      title: 'Warm Terracotta & Sunset Glow',
      content: '#E07A5F',
      tags: ['#color', '#palette', '#terracotta', '#warm', '#design'],
      colors: ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F'],
      isFavorite: true,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-article-1',
      type: 'article',
      title: 'The Architecture of Autonomous Second Brains',
      summary: 'Exploring how local-first vector embeddings and associative AI memory replace traditional hierarchical note-taking structures.',
      content: `# The Architecture of Autonomous Second Brains\n\nFor decades, digital knowledge management forced humans to think like filing cabinets. We created folders inside folders, tagged with rigid taxonomies, and spent more time organizing than creating.\n\n### The Associative Revolution\nThe human mind doesn't store memories in hierarchical file paths. A scent of coffee might evoke a morning in Lisbon, which reminds you of a typography layout on a café menu, which inspires a new UI component.\n\n> *“We need tools that mimic the associative fluidity of biological cognition.”*\n\nBy leveraging vector embeddings and multimodal vision models locally, we can construct personal memory palaces that index text, colors, shapes, and feelings automatically.`,
      url: 'https://openmind.app/blog/autonomous-second-brains',
      domain: 'openmind.app',
      imageUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be7fe802?w=800&auto=format&fit=crop&q=80',
      favicon: 'https://openmind.app/favicon.ico',
      author: 'Clemens Lechner',
      estimatedReadTime: 4,
      readingProgress: 45,
      tags: ['#ai', '#secondbrain', '#architecture', '#future', '#reading'],
      colors: ['#2B2D42', '#8D99AE', '#EDF2F4'],
      isFavorite: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-image-1',
      type: 'image',
      title: 'Minimalist Scandinavian Architecture Studio',
      content: 'Inspiration for clean lines, warm oak textures, and diffuse natural daylighting.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
      tags: ['#architecture', '#interior', '#minimalism', '#inspiration', '#light'],
      colors: ['#D4A373', '#CCD5AE', '#FAEDCD', '#333333'],
      ocrText: 'STUDIO NORDIC ARCHITECTS — EST 1984',
      isFavorite: false,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-note-1',
      type: 'note',
      title: 'Product Principles for OpenMind',
      content: '- [x] 100% Data Privacy (All SQLite & Vector stored locally)\n- [x] Zero-effort organization (AI auto-tags and categorizes)\n- [x] Bring Your Own Key (OpenAI, Gemini, Claude, Groq, Ollama)\n- [x] Beautiful distraction-free reader mode\n- [ ] Mobile PWA companion integration',
      tags: ['#openmind', '#principles', '#roadmap', '#product'],
      colors: ['#1E293B', '#38BDF8'],
      isFavorite: true,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-product-1',
      type: 'product',
      title: 'Analogue Pocket (Natural Aluminum Edition)',
      content: 'A multi-video-game system portable handheld with FPGA engineering.',
      url: 'https://www.analogue.co/pocket',
      domain: 'analogue.co',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      price: '$219.99',
      currency: 'USD',
      tags: ['#hardware', '#design', '#gaming', '#wishlist'],
      colors: ['#E2E8F0', '#0F172A', '#94A3B8'],
      isFavorite: false,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-book-1',
      type: 'book',
      title: 'Thinking in Systems: A Primer',
      author: 'Donella H. Meadows',
      content: 'Essential reading on feedback loops, leverage points, and non-linear dynamics in complex systems.',
      url: 'https://www.chelseagreen.com/product/thinking-in-systems/',
      domain: 'chelseagreen.com',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      tags: ['#books', '#systems', '#learning', '#recommended'],
      colors: ['#475569', '#F1F5F9', '#1E293B'],
      isFavorite: true,
      isArchived: false,
      readingProgress: 100,
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: now,
    }
  ];

  const insertMany = db.transaction((cards: Card[]) => {
    for (const card of cards) {
      insertCard.run({
        id: card.id,
        type: card.type,
        title: card.title,
        content: card.content || null,
        url: card.url || null,
        domain: card.domain || null,
        imageUrl: card.imageUrl || null,
        favicon: card.favicon || null,
        author: card.author || null,
        price: card.price || null,
        currency: card.currency || null,
        rating: card.rating || null,
        colors: card.colors ? JSON.stringify(card.colors) : '[]',
        tags: JSON.stringify(card.tags || []),
        ocrText: card.ocrText || null,
        summary: card.summary || null,
        isFavorite: card.isFavorite ? 1 : 0,
        isArchived: card.isArchived ? 1 : 0,
        readingProgress: card.readingProgress || 0,
        estimatedReadTime: card.estimatedReadTime || null,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      });
    }
  });

  insertMany(initialCards);

  // Seed default Smart Spaces
  const insertSpace = db.prepare(`
    INSERT INTO spaces (id, name, emoji, query, iconColor, isPinned, orderIndex, createdAt)
    VALUES (@id, @name, @emoji, @query, @iconColor, @isPinned, @orderIndex, @createdAt)
  `);

  const initialSpaces: SmartSpace[] = [
    {
      id: 'space-articles',
      name: 'Deep Reading',
      emoji: '📖',
      query: 'type:article',
      iconColor: '#3B82F6',
      isPinned: true,
      orderIndex: 0,
      createdAt: now,
    },
    {
      id: 'space-design',
      name: 'Design & Visuals',
      emoji: '🎨',
      query: 'tag:#design',
      iconColor: '#EC4899',
      isPinned: true,
      orderIndex: 1,
      createdAt: now,
    },
    {
      id: 'space-ai',
      name: 'AI & Intelligence',
      emoji: '🧠',
      query: 'tag:#ai',
      iconColor: '#8B5CF6',
      isPinned: true,
      orderIndex: 2,
      createdAt: now,
    },
    {
      id: 'space-quotes',
      name: 'Wisdom & Quotes',
      emoji: '💬',
      query: 'type:quote',
      iconColor: '#F59E0B',
      isPinned: true,
      orderIndex: 3,
      createdAt: now,
    },
    {
      id: 'space-wishlist',
      name: 'Wishlist & Products',
      emoji: '🛍️',
      query: 'type:product',
      iconColor: '#10B981',
      isPinned: true,
      orderIndex: 4,
      createdAt: now,
    }
  ];

  for (const space of initialSpaces) {
    insertSpace.run({
      ...space,
      isPinned: space.isPinned ? 1 : 0,
    });
  }
}

function parseCardRow(row: any): Card {
  return {
    ...row,
    isFavorite: Boolean(row.isFavorite),
    isArchived: Boolean(row.isArchived),
    colors: row.colors ? JSON.parse(row.colors) : [],
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}

export function getAllCards(filter?: SearchFilter): Card[] {
  const db = getDb();
  let query = 'SELECT * FROM cards WHERE 1=1';
  const params: any[] = [];

  if (filter?.archivedOnly) {
    query += ' AND isArchived = 1';
  } else {
    query += ' AND isArchived = 0';
  }

  if (filter?.favoritesOnly) {
    query += ' AND isFavorite = 1';
  }

  if (filter?.type && filter.type !== 'all') {
    query += ' AND type = ?';
    params.push(filter.type);
  }

  if (filter?.domain) {
    query += ' AND domain LIKE ?';
    params.push(`%${filter.domain}%`);
  }

  if (filter?.query) {
    const q = `%${filter.query.toLowerCase()}%`;
    query += ` AND (
      LOWER(title) LIKE ? OR 
      LOWER(content) LIKE ? OR 
      LOWER(summary) LIKE ? OR 
      LOWER(author) LIKE ? OR 
      LOWER(tags) LIKE ? OR 
      LOWER(ocrText) LIKE ? OR 
      LOWER(domain) LIKE ?
    )`;
    params.push(q, q, q, q, q, q, q);
  }

  if (filter?.tags && filter.tags.length > 0) {
    for (const tag of filter.tags) {
      const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
      query += ' AND tags LIKE ?';
      params.push(`%${cleanTag}%`);
    }
  }

  if (filter?.color) {
    query += ' AND (colors LIKE ? OR LOWER(tags) LIKE ?)';
    params.push(`%${filter.color}%`, `%${filter.color.toLowerCase()}%`);
  }

  query += ' ORDER BY createdAt DESC';

  const rows = db.prepare(query).all(...params);
  return rows.map(parseCardRow);
}

export function getCardById(id: string): Card | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
  if (!row) return null;
  return parseCardRow(row);
}

export function createCard(cardData: Partial<Card> & { type: Card['type']; title: string }): Card {
  const db = getDb();
  const now = new Date().toISOString();
  const id = cardData.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const card: Card = {
    id,
    type: cardData.type,
    title: cardData.title,
    content: cardData.content || '',
    url: cardData.url,
    domain: cardData.domain,
    imageUrl: cardData.imageUrl,
    favicon: cardData.favicon,
    author: cardData.author,
    price: cardData.price,
    currency: cardData.currency,
    rating: cardData.rating,
    colors: cardData.colors || [],
    tags: cardData.tags || [],
    ocrText: cardData.ocrText,
    summary: cardData.summary,
    isFavorite: cardData.isFavorite || false,
    isArchived: cardData.isArchived || false,
    readingProgress: cardData.readingProgress || 0,
    estimatedReadTime: cardData.estimatedReadTime,
    createdAt: cardData.createdAt || now,
    updatedAt: now,
  };

  const insert = db.prepare(`
    INSERT INTO cards (
      id, type, title, content, url, domain, imageUrl, favicon, author, price, currency, rating,
      colors, tags, ocrText, summary, isFavorite, isArchived, readingProgress, estimatedReadTime, createdAt, updatedAt
    ) VALUES (
      @id, @type, @title, @content, @url, @domain, @imageUrl, @favicon, @author, @price, @currency, @rating,
      @colors, @tags, @ocrText, @summary, @isFavorite, @isArchived, @readingProgress, @estimatedReadTime, @createdAt, @updatedAt
    )
  `);

  insert.run({
    id: card.id,
    type: card.type,
    title: card.title,
    content: card.content || null,
    url: card.url || null,
    domain: card.domain || null,
    imageUrl: card.imageUrl || null,
    favicon: card.favicon || null,
    author: card.author || null,
    price: card.price || null,
    currency: card.currency || null,
    rating: card.rating || null,
    colors: JSON.stringify(card.colors || []),
    tags: JSON.stringify(card.tags || []),
    ocrText: card.ocrText || null,
    summary: card.summary || null,
    isFavorite: card.isFavorite ? 1 : 0,
    isArchived: card.isArchived ? 1 : 0,
    readingProgress: card.readingProgress,
    estimatedReadTime: card.estimatedReadTime || null,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  });

  return card;
}

export function updateCard(id: string, updates: Partial<Card>): Card | null {
  const db = getDb();
  const existing = getCardById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Card = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  const stmt = db.prepare(`
    UPDATE cards SET
      type = @type,
      title = @title,
      content = @content,
      url = @url,
      domain = @domain,
      imageUrl = @imageUrl,
      favicon = @favicon,
      author = @author,
      price = @price,
      currency = @currency,
      rating = @rating,
      colors = @colors,
      tags = @tags,
      ocrText = @ocrText,
      summary = @summary,
      isFavorite = @isFavorite,
      isArchived = @isArchived,
      readingProgress = @readingProgress,
      estimatedReadTime = @estimatedReadTime,
      updatedAt = @updatedAt
    WHERE id = @id
  `);

  stmt.run({
    id: updated.id,
    type: updated.type,
    title: updated.title,
    content: updated.content || null,
    url: updated.url || null,
    domain: updated.domain || null,
    imageUrl: updated.imageUrl || null,
    favicon: updated.favicon || null,
    author: updated.author || null,
    price: updated.price || null,
    currency: updated.currency || null,
    rating: updated.rating || null,
    colors: JSON.stringify(updated.colors || []),
    tags: JSON.stringify(updated.tags || []),
    ocrText: updated.ocrText || null,
    summary: updated.summary || null,
    isFavorite: updated.isFavorite ? 1 : 0,
    isArchived: updated.isArchived ? 1 : 0,
    readingProgress: updated.readingProgress,
    estimatedReadTime: updated.estimatedReadTime || null,
    updatedAt: updated.updatedAt,
  });

  return updated;
}

export function deleteCard(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM cards WHERE id = ?').run(id);
  return info.changes > 0;
}

export function getSmartSpaces(): SmartSpace[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM spaces ORDER BY orderIndex ASC, createdAt ASC').all();
  return rows.map((r: any) => ({
    ...r,
    isPinned: Boolean(r.isPinned),
  }));
}

export function createSmartSpace(space: Omit<SmartSpace, 'id' | 'createdAt'>): SmartSpace {
  const db = getDb();
  const id = `space-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const newSpace: SmartSpace = {
    ...space,
    id,
    createdAt,
  };

  db.prepare(`
    INSERT INTO spaces (id, name, emoji, query, iconColor, isPinned, orderIndex, createdAt)
    VALUES (@id, @name, @emoji, @query, @iconColor, @isPinned, @orderIndex, @createdAt)
  `).run({
    ...newSpace,
    isPinned: newSpace.isPinned ? 1 : 0,
  });

  return newSpace;
}

export function deleteSmartSpace(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM spaces WHERE id = ?').run(id);
  return info.changes > 0;
}

export function getSerendipityCards(limit = 6): Card[] {
  const db = getDb();
  // Get random unarchived cards
  const rows = db.prepare(`
    SELECT * FROM cards 
    WHERE isArchived = 0 
    ORDER BY RANDOM() 
    LIMIT ?
  `).all(limit);
  return rows.map(parseCardRow);
}

export function getSettings(): Settings {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'app_config'").get() as { value: string } | undefined;

  const defaultSettings: Settings = {
    aiProvider: (process.env.DEFAULT_AI_PROVIDER as any) || 'local_heuristic',
    apiKeys: {
      openai: process.env.OPENAI_API_KEY || '',
      gemini: process.env.GEMINI_API_KEY || '',
      claude: process.env.ANTHROPIC_API_KEY || '',
      groq: process.env.GROQ_API_KEY || '',
      openrouter: process.env.OPENROUTER_API_KEY || '',
    },
    selectedModels: {
      openai: 'gpt-4o-mini',
      gemini: 'gemini-1.5-flash',
      claude: 'claude-3-5-haiku-20241022',
      groq: 'llama-3.3-70b-versatile',
      openrouter: 'meta-llama/llama-3.3-70b-instruct',
      ollama: 'llama3.2',
    },
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    autoTaggingEnabled: true,
    ocrEnabled: true,
    theme: 'cream',
    cardDensity: 'comfortable',
  };

  if (!row) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(row.value);
    return {
      ...defaultSettings,
      ...parsed,
      apiKeys: { ...defaultSettings.apiKeys, ...parsed.apiKeys },
      selectedModels: { ...defaultSettings.selectedModels, ...parsed.selectedModels },
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Partial<Settings>): Settings {
  const db = getDb();
  const current = getSettings();
  const updated: Settings = {
    ...current,
    ...settings,
    apiKeys: { ...current.apiKeys, ...settings.apiKeys },
    selectedModels: { ...current.selectedModels, ...settings.selectedModels },
  };

  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES ('app_config', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(JSON.stringify(updated));

  return updated;
}
