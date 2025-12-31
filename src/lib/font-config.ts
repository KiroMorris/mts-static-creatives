// Font Configuration for Apparel Creative Generator
// Contains font metadata, filtered lists, and helper functions

import type { FontFamily, FontOption, FontWeight } from '@/types';

// ============================================================================
// Available Fonts Registry
// ============================================================================

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'Inter',
    name: 'Inter',
    category: 'both',
    weights: [400, 500, 700],
    preview: 'The quick brown fox'
  },
  {
    id: 'Playfair Display',
    name: 'Playfair Display',
    category: 'display',
    weights: [400, 700],
    preview: 'Elegant Style'
  },
  {
    id: 'Montserrat',
    name: 'Montserrat',
    category: 'both',
    weights: [400, 500, 700],
    preview: 'Modern Design'
  },
  {
    id: 'Oswald',
    name: 'Oswald',
    category: 'display',
    weights: [400, 500, 700],
    preview: 'BOLD IMPACT'
  },
  {
    id: 'Bebas Neue',
    name: 'Bebas Neue',
    category: 'display',
    weights: [400],
    preview: 'ALL CAPS STYLE'
  },
  {
    id: 'Poppins',
    name: 'Poppins',
    category: 'both',
    weights: [400, 500, 700],
    preview: 'Friendly & Modern'
  },
  {
    id: 'Roboto Condensed',
    name: 'Roboto Condensed',
    category: 'body',
    weights: [400, 700],
    preview: 'COMPACT SUBTITLE'
  },
  {
    id: 'Lato',
    name: 'Lato',
    category: 'body',
    weights: [400, 700],
    preview: 'CLEAN AND WARM'
  },
  {
    id: 'Open Sans',
    name: 'Open Sans',
    category: 'body',
    weights: [400, 500, 700],
    preview: 'NEUTRAL STYLE'
  },
];

// ============================================================================
// Filtered Font Lists
// ============================================================================

// Fonts suitable for headlines (display or both categories)
export const HEADLINE_FONTS = AVAILABLE_FONTS.filter(
  f => f.category === 'display' || f.category === 'both'
);

// Fonts suitable for subtitles (body or both categories)
export const SUBTITLE_FONTS = AVAILABLE_FONTS.filter(
  f => f.category === 'body' || f.category === 'both'
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get CSS font-family string with fallbacks for browser rendering
 */
export function getFontFamilyCSS(fontFamily: FontFamily): string {
  // Use quoted font name for fonts with spaces
  const quotedName = fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
  return `${quotedName}, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
}

/**
 * Get CSS font-family string for SVG (Sharp/librsvg rendering)
 * Note: SVG rendering may require fonts installed on the server
 */
export function getFontFamilySVG(fontFamily: FontFamily): string {
  return `${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
}

/**
 * Get available weights for a specific font family
 */
export function getAvailableWeights(fontFamily: FontFamily): FontWeight[] {
  const font = AVAILABLE_FONTS.find(f => f.id === fontFamily);
  return font?.weights || [400, 700];
}

/**
 * Check if a font weight is available for a given font family
 */
export function isWeightAvailable(fontFamily: FontFamily, weight: FontWeight): boolean {
  const availableWeights = getAvailableWeights(fontFamily);
  return availableWeights.includes(weight);
}

/**
 * Get font option by ID
 */
export function getFontById(fontFamily: FontFamily): FontOption | undefined {
  return AVAILABLE_FONTS.find(f => f.id === fontFamily);
}

/**
 * Get the closest available weight if the requested weight isn't available
 */
export function getClosestWeight(fontFamily: FontFamily, requestedWeight: FontWeight): FontWeight {
  const availableWeights = getAvailableWeights(fontFamily);

  if (availableWeights.includes(requestedWeight)) {
    return requestedWeight;
  }

  // Find the closest available weight
  return availableWeights.reduce((closest, weight) => {
    const closestDiff = Math.abs(closest - requestedWeight);
    const currentDiff = Math.abs(weight - requestedWeight);
    return currentDiff < closestDiff ? weight : closest;
  }, availableWeights[0]);
}

/**
 * Font weight labels for UI display
 */
export const FONT_WEIGHT_LABELS: Record<FontWeight, string> = {
  400: 'Regular',
  500: 'Medium',
  700: 'Bold',
};

/**
 * Get display label for a font weight
 */
export function getWeightLabel(weight: FontWeight): string {
  return FONT_WEIGHT_LABELS[weight] || String(weight);
}
