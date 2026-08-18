import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { CardType } from './types';

export interface ScrapedResult {
  title: string;
  description: string;
  content: string; // Clean readable markdown/text
  contentHtml?: string;
  url: string;
  domain: string;
  imageUrl?: string;
  favicon?: string;
  author?: string;
  siteName?: string;
  price?: string;
  currency?: string;
  detectedType: CardType;
  estimatedReadTime: number;
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedResult> {
  let url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname.replace(/^www\./, '');
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 KernMindBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Metadata extraction
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').first().text().trim();
    const h1Title = $('h1').first().text().trim();
    const title = ogTitle || pageTitle || h1Title || domain;

    const description = $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') || '';

    let imageUrl = $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content');

    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        imageUrl = new URL(imageUrl, url).href;
      } catch {}
    }

    const siteName = $('meta[property="og:site_name"]').attr('content') || domain;
    const author = $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('.author, [rel="author"], .byline').first().text().trim() || undefined;

    let favicon = $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') || fallbackFavicon;

    if (favicon && !favicon.startsWith('http')) {
      try {
        favicon = new URL(favicon, url).href;
      } catch {
        favicon = fallbackFavicon;
      }
    }

    // Check for product pricing
    let price: string | undefined;
    let currency: string | undefined;
    const ogPrice = $('meta[property="og:price:amount"]').attr('content') ||
      $('meta[property="product:price:amount"]').attr('content');
    const ogCurrency = $('meta[property="og:price:currency"]').attr('content') ||
      $('meta[property="product:price:currency"]').attr('content') || '$';

    if (ogPrice) {
      price = `${ogCurrency}${ogPrice}`;
      currency = ogCurrency;
    } else {
      // Heuristic price scan
      const priceText = $('.price, [class*="price"], [id*="price"]').first().text().trim();
      const priceMatch = priceText.match(/([$€£¥]\s*\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s*[$€£¥])/);
      if (priceMatch) {
        price = priceMatch[0];
      }
    }

    // Mozilla Readability parsing
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const cleanContent = article?.textContent ? article.textContent.trim() : description;
    const cleanHtml = article?.content || undefined;

    // Word count and read time
    const wordCount = cleanContent.split(/\s+/).length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

    // Type detection heuristics
    let detectedType: CardType = 'article';
    const lowerUrl = url.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    if (
      price ||
      lowerUrl.includes('/product/') ||
      lowerUrl.includes('/dp/') ||
      lowerUrl.includes('/item/') ||
      lowerDomain.includes('amazon') ||
      lowerDomain.includes('etsy') ||
      lowerDomain.includes('ebay')
    ) {
      detectedType = 'product';
    } else if (lowerDomain.includes('goodreads') || lowerUrl.includes('/book/')) {
      detectedType = 'book';
    } else if (cleanContent.length < 250 && !imageUrl) {
      detectedType = 'note';
    }

    return {
      title,
      description,
      content: cleanContent,
      contentHtml: cleanHtml,
      url,
      domain,
      imageUrl: imageUrl || undefined,
      favicon: favicon || fallbackFavicon,
      author,
      siteName,
      price,
      currency,
      detectedType,
      estimatedReadTime,
    };
  } catch (error: any) {
    // Fallback for failed fetch or blocked requests
    return {
      title: domain,
      description: targetUrl,
      content: targetUrl,
      url: targetUrl,
      domain,
      favicon: fallbackFavicon,
      detectedType: 'article',
      estimatedReadTime: 1,
    };
  }
}
