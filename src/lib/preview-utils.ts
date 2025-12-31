// Preview utility functions for LivePreview component
// Mirrors the positioning logic from sharp-compose.ts for client-side rendering

import { TEMPLATE } from './constants';
import type { TextStyle, CalloutStyle } from '@/types';

// ============================================================================
// Canvas Constants
// ============================================================================

export const CANVAS_WIDTH = TEMPLATE.canvas.width;   // 1080
export const CANVAS_HEIGHT = TEMPLATE.canvas.height; // 1920

// Text positioning constants
const TEXT_X = TEMPLATE.text.paddingLeft;            // 48
const HEADLINE_Y = TEMPLATE.text.headline.y;         // 820
const SUBTITLE_Y_OFFSET = TEMPLATE.text.subtitle.yOffset; // 20

// Callout positioning constants
const CALLOUT_X = TEMPLATE.callouts.x;               // 48

// ============================================================================
// Text Positioning Defaults
// ============================================================================

/**
 * Get the default text X position (left padding)
 */
export function getDefaultTextX(): number {
  return TEXT_X;
}

/**
 * Get the default headline Y position
 */
export function getDefaultHeadlineY(): number {
  return HEADLINE_Y;
}

// ============================================================================
// Subtitle Positioning
// ============================================================================

/**
 * Calculate subtitle Y position (below headline)
 * Uses the new headlineY and subtitleGap from textStyle
 */
export function calculateSubtitleYFromStyle(
  textStyle: TextStyle,
  headlineLineCount: number = 1
): number {
  const lineHeight = Math.round(textStyle.headlineFontSize * 1.1);
  return textStyle.headlineY + (headlineLineCount * lineHeight) + textStyle.subtitleGap;
}

// ============================================================================
// Callout Positioning
// ============================================================================

/**
 * Get default callout X position
 */
export function getDefaultCalloutX(): number {
  return CALLOUT_X;
}

/**
 * Calculate Y positions for all 3 callouts using direct X/Y from style
 */
export function calculateCalloutYPositions(style: CalloutStyle): [number, number, number] {
  const startY = style.y;
  const callout1Y = startY;
  const callout2Y = startY + style.size + style.gap;
  const callout3Y = startY + (style.size + style.gap) * 2;
  return [callout1Y, callout2Y, callout3Y];
}

// ============================================================================
// Text Wrapping
// ============================================================================

/**
 * Wrap text into lines based on font size and max width
 * Mirrors the wrapText function in sharp-compose.ts
 *
 * The calculation: charsPerLine = 15 * (72 / fontSize)
 * At default 72px font size: 15 chars per line
 * At larger sizes: fewer chars per line
 * At smaller sizes: more chars per line
 */
export function wrapHeadlineText(
  text: string,
  fontSize: number
): string[] {
  const charsPerLine = Math.round(15 * (72 / fontSize));
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= charsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

// ============================================================================
// Scaling
// ============================================================================

/**
 * Calculate scale factor for preview container
 * Used to scale the 1080x1920 canvas to fit the container width
 */
export function calculateScaleFactor(containerWidth: number): number {
  return containerWidth / CANVAS_WIDTH;
}

/**
 * Scale a pixel value from canvas coordinates to preview coordinates
 */
export function scaleValue(value: number, scaleFactor: number): number {
  return Math.round(value * scaleFactor);
}

// ============================================================================
// CSS Text Shadow
// ============================================================================

/**
 * Generate CSS text-shadow value matching the SVG filter in sharp-compose.ts
 * The SVG filter uses: <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
 */
export function getTextShadowCSS(enabled: boolean): string {
  if (!enabled) return 'none';
  // Match the SVG drop shadow: offset-x, offset-y, blur-radius, color
  return '0px 2px 8px rgba(0, 0, 0, 0.3)';
}

// ============================================================================
// Line Height Calculation
// ============================================================================

/**
 * Calculate line height based on font size
 * Matches the calculation in sharp-compose.ts: lineHeight = fontSize * 1.1
 */
export function calculateLineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.1);
}
