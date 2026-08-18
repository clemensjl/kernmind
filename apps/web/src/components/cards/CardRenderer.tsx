'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { NoteCard } from './NoteCard';
import { QuoteCard } from './QuoteCard';
import { ColorCard } from './ColorCard';
import { ArticleCard } from './ArticleCard';
import { ImageCard } from './ImageCard';
import { ProductCard } from './ProductCard';
import { BookCard } from './BookCard';

interface CardRendererProps {
  card: Card;
  onClick?: (card: Card) => void;
}

export const CardRenderer: React.FC<CardRendererProps> = ({ card, onClick }) => {
  const handleClick = () => {
    if (onClick) onClick(card);
  };

  const renderCardContent = () => {
    switch (card.type) {
      case 'quote':
      case 'highlight':
        return <QuoteCard card={card} onClick={handleClick} />;
      case 'color':
        return <ColorCard card={card} onClick={handleClick} />;
      case 'article':
        return <ArticleCard card={card} onClick={handleClick} />;
      case 'image':
        return <ImageCard card={card} onClick={handleClick} />;
      case 'product':
        return <ProductCard card={card} onClick={handleClick} />;
      case 'book':
        return <BookCard card={card} onClick={handleClick} />;
      case 'note':
      default:
        return <NoteCard card={card} onClick={handleClick} />;
    }
  };

  return (
    <div
      data-card-id={card.id}
      data-card-type={card.type}
      data-card-title={card.title}
      data-card-url={card.url || ''}
      data-card-favorite={card.isFavorite ? 'true' : 'false'}
      className="contents"
    >
      {renderCardContent()}
    </div>
  );
};
