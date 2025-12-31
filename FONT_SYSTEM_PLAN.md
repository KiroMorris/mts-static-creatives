# Font System Feature - Implementation Plan

## Executive Summary

This plan outlines the implementation of a font selection system for the Apparel Creative Generator. The feature will allow users to choose from multiple font options for headline and subtitle text, with live preview and persistent settings.

---

## 1. Fonts to Include

**Display/Headline Fonts:**
- Inter (current default - bold, modern)
- Playfair Display (elegant serif)
- Montserrat (geometric, versatile)
- Oswald (condensed, impactful)
- Bebas Neue (bold, all-caps style)
- Poppins (friendly, rounded)

**Subtitle Fonts:**
- Inter (matching option)
- Roboto Condensed (clean, narrow)
- Lato (warm, professional)
- Open Sans (neutral, readable)

---

## 2. Type Definitions

Add to `/src/types/index.ts`:

```typescript
export type FontFamily =
  | 'Inter'
  | 'Playfair Display'
  | 'Montserrat'
  | 'Oswald'
  | 'Bebas Neue'
  | 'Poppins'
  | 'Roboto Condensed'
  | 'Lato'
  | 'Open Sans';

export type FontWeight = 400 | 500 | 700;

export interface FontOption {
  id: FontFamily;
  name: string;
  category: 'display' | 'body' | 'both';
  weights: FontWeight[];
  preview: string;
}
```

Update `TextStyle` interface:
```typescript
export interface TextStyle {
  // Existing fields...
  headlineFontFamily: FontFamily;
  headlineFontWeight: FontWeight;
  subtitleFontFamily: FontFamily;
  subtitleFontWeight: FontWeight;
}
```

---

## 3. Files to Create/Modify

### New Files:
- `/src/lib/font-config.ts` - Font registry with metadata
- `/src/components/ui/FontSelector.tsx` - Font selection dropdown with preview
- `/fonts/` directory with TTF files for Sharp

### Files to Modify:
- `/src/types/index.ts` - Add font types and update TextStyle
- `/src/lib/sharp-compose.ts` - Dynamic font families in SVG
- `/src/components/style/StyleControlPanel.tsx` - Add font selectors to Text tab
- `/src/components/preview/LivePreview.tsx` - Dynamic fonts in preview
- `/src/app/layout.tsx` - Load Google Fonts for browser

---

## 4. Font Configuration Module

Create `/src/lib/font-config.ts`:

```typescript
import type { FontFamily, FontOption, FontWeight } from '@/types';

export const AVAILABLE_FONTS: FontOption[] = [
  { id: 'Inter', name: 'Inter', category: 'both', weights: [400, 500, 700], preview: 'The quick brown fox' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'display', weights: [400, 700], preview: 'Elegant Style' },
  { id: 'Montserrat', name: 'Montserrat', category: 'both', weights: [400, 500, 700], preview: 'Modern Design' },
  { id: 'Oswald', name: 'Oswald', category: 'display', weights: [400, 500, 700], preview: 'BOLD IMPACT' },
  { id: 'Bebas Neue', name: 'Bebas Neue', category: 'display', weights: [400], preview: 'ALL CAPS STYLE' },
  { id: 'Poppins', name: 'Poppins', category: 'both', weights: [400, 500, 700], preview: 'Friendly & Modern' },
  { id: 'Roboto Condensed', name: 'Roboto Condensed', category: 'body', weights: [400, 500], preview: 'COMPACT SUBTITLE' },
  { id: 'Lato', name: 'Lato', category: 'body', weights: [400, 700], preview: 'CLEAN AND WARM' },
  { id: 'Open Sans', name: 'Open Sans', category: 'body', weights: [400, 500], preview: 'NEUTRAL STYLE' },
];

export const HEADLINE_FONTS = AVAILABLE_FONTS.filter(f => f.category === 'display' || f.category === 'both');
export const SUBTITLE_FONTS = AVAILABLE_FONTS.filter(f => f.category === 'body' || f.category === 'both');

export function getFontFamilyCSS(fontFamily: FontFamily): string {
  return `"${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
}
```

---

## 5. Sharp Compose Updates

Update `/src/lib/sharp-compose.ts` to accept dynamic font families:

```typescript
export interface TextStyleOptions {
  // ... existing fields
  headlineFontFamily?: string;
  headlineFontWeight?: number;
  subtitleFontFamily?: string;
  subtitleFontWeight?: number;
}
```

Update SVG text elements to use dynamic font-family and font-weight.

---

## 6. UI Components

### FontSelector Component

```typescript
interface FontSelectorProps {
  type: 'headline' | 'subtitle';
  selectedFont: FontFamily;
  selectedWeight: FontWeight;
  onFontChange: (font: FontFamily) => void;
  onWeightChange: (weight: FontWeight) => void;
}
```

Features:
- Font family dropdown with font preview in each option
- Font weight dropdown (Regular/Medium/Bold)
- Live preview text sample

---

## 7. Browser Font Loading

Update `/src/app/layout.tsx`:

```typescript
import {
  Inter, Playfair_Display, Montserrat, Oswald,
  Bebas_Neue, Poppins, Roboto_Condensed, Lato, Open_Sans
} from 'next/font/google';

// Configure each font with subsets and variables
```

---

## 8. Server-Side Font Loading (Sharp)

For Sharp/librsvg to render fonts correctly:
1. Download TTF files from Google Fonts
2. Place in `/fonts` directory
3. Configure fontconfig to find fonts
4. Set `FONTCONFIG_PATH` environment variable

---

## 9. Implementation Phases

### Phase 1: Infrastructure
- Add type definitions
- Create font-config.ts
- Download font files

### Phase 2: Sharp Integration
- Update createTextSVG function
- Test server-side rendering

### Phase 3: UI Components
- Create FontSelector component
- Add to StyleControlPanel
- Update LivePreview

### Phase 4: Testing
- Verify browser/server consistency
- Test all font combinations
- Visual QA

---

## 10. Default Values

```typescript
text: {
  // ... existing
  headlineFontFamily: 'Inter',
  headlineFontWeight: 700,
  subtitleFontFamily: 'Inter',
  subtitleFontWeight: 500,
}
```
