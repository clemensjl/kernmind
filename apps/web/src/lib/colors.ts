export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name: string;
  isDark: boolean;
}

export interface ColorHarmony {
  complementary: string;
  analogous: string[];
  triadic: string[];
  monochromatic: string[];
  shades: string[];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function getColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Color';
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (l < 12) return 'Obsidian Black';
  if (l > 92 && s < 10) return 'Pure White';
  if (s < 12) {
    if (l > 75) return 'Soft Platinum';
    if (l > 45) return 'Muted Slate';
    return 'Charcoal Grey';
  }

  if (h >= 345 || h < 15) {
    if (s > 70 && l > 50) return 'Vibrant Crimson';
    if (l > 75) return 'Pastel Rose';
    if (l < 35) return 'Deep Burgundy';
    return 'Ruby Red';
  }
  if (h >= 15 && h < 45) {
    if (l > 75) return 'Peach Cream';
    if (l < 40) return 'Warm Amber';
    return 'Coral Orange';
  }
  if (h >= 45 && h < 70) {
    if (l > 75) return 'Sunlit Cream';
    if (l < 40) return 'Golden Bronze';
    return 'Warm Gold';
  }
  if (h >= 70 && h < 165) {
    if (l > 75) return 'Sage Mint';
    if (l < 35) return 'Forest Pine';
    return 'Emerald Green';
  }
  if (h >= 165 && h < 200) {
    if (l > 75) return 'Ice Aqua';
    return 'Ocean Teal';
  }
  if (h >= 200 && h < 260) {
    if (l > 75) return 'Sky Mist';
    if (l < 35) return 'Midnight Navy';
    return 'Sapphire Blue';
  }
  if (h >= 260 && h < 315) {
    if (l > 75) return 'Lavender Bloom';
    if (l < 35) return 'Deep Plum';
    return 'Electric Violet';
  }
  return 'Blush Magenta';
}

export function getColorHarmonies(hex: string): ColorHarmony {
  const rgb = hexToRgb(hex) || { r: 100, g: 100, b: 200 };
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const toHexFromHsl = (hVal: number, sVal: number, lVal: number) => {
    const { r, g, b } = hslToRgb(hVal, sVal, lVal);
    return rgbToHex(r, g, b);
  };

  return {
    complementary: toHexFromHsl((h + 180) % 360, s, l),
    analogous: [
      toHexFromHsl((h + 30) % 360, s, l),
      toHexFromHsl((h - 30 + 360) % 360, s, l),
    ],
    triadic: [
      toHexFromHsl((h + 120) % 360, s, l),
      toHexFromHsl((h + 240) % 360, s, l),
    ],
    monochromatic: [
      toHexFromHsl(h, Math.max(10, s - 30), Math.min(90, l + 25)),
      toHexFromHsl(h, s, Math.max(15, l - 25)),
    ],
    shades: [
      toHexFromHsl(h, s, Math.min(95, l + 30)),
      toHexFromHsl(h, s, Math.min(85, l + 15)),
      hex.toUpperCase(),
      toHexFromHsl(h, s, Math.max(20, l - 15)),
      toHexFromHsl(h, s, Math.max(10, l - 30)),
    ],
  };
}

export function extractHexCodesFromText(text: string): string[] {
  const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
  const matches = text.match(hexRegex);
  if (!matches) return [];
  return Array.from(new Set(matches.map(h => h.toUpperCase())));
}
