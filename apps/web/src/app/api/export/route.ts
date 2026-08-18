import { NextRequest, NextResponse } from 'next/server';
import { getAllCards, getSmartSpaces, getSettings } from '@/lib/db';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const cards = await getAllCards();
    const spaces = await getSmartSpaces();
    const settings = await getSettings();

    if (format === 'markdown') {
      const zip = new JSZip();
      
      // Add each card as a clean Markdown file
      cards.forEach(card => {
        const safeTitle = (card.title || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
        const filename = `${card.type}_${card.id}_${safeTitle}.md`;
        
        const mdContent = `---
id: ${card.id}
type: ${card.type}
title: "${card.title.replace(/"/g, '\\"')}"
url: ${card.url || ''}
domain: ${card.domain || ''}
author: ${card.author || ''}
tags: [${card.tags.map(t => `"${t}"`).join(', ')}]
colors: [${(card.colors || []).map(c => `"${c}"`).join(', ')}]
favorite: ${card.isFavorite}
created: ${card.createdAt}
---

# ${card.title}

${card.summary ? `> **Summary**: ${card.summary}\n\n` : ''}
${card.imageUrl ? `![Cover Image](${card.imageUrl})\n\n` : ''}

${card.content || ''}

${card.ocrText ? `\n\n### Extracted Text (OCR):\n${card.ocrText}` : ''}
`;
        zip.file(filename, mdContent);
      });

      // Add manifest.json
      zip.file('manifest.json', JSON.stringify({ version: '1.0', exportDate: new Date().toISOString(), totalCards: cards.length, spaces }, null, 2));

      const zipArrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });
      return new Response(zipArrayBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="kernmind_export_${Date.now()}.zip"`,
        },
      });
    }

    // Default JSON export
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cardCount: cards.length,
      cards,
      spaces,
      settings: {
        theme: settings.theme,
        autoTaggingEnabled: settings.autoTaggingEnabled,
      },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="kernmind_backup_${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
