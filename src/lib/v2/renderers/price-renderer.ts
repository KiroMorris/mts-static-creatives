/**
 * V2 Price Renderer
 * Renders price tag elements with optional strikethrough original price
 */

import sharp from 'sharp';

// ============================================================================
// Types
// ============================================================================

export interface PriceTagElement {
  id: string;
  type: 'price-tag';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Prices
  price: string;               // e.g., "$99.99"
  originalPrice?: string;      // e.g., "$149.99" (strikethrough)
  currency?: string;           // e.g., "$", "EUR", "GBP"

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;

  // Colors
  priceColor: string;
  originalPriceColor?: string;

  // Background styling (optional)
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export interface RenderSize {
  width: number;
  height: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Escape special XML characters for SVG text
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// Main Render Function
// ============================================================================

/**
 * Render price tag with optional strikethrough original price
 */
export async function renderPriceTag(
  element: PriceTagElement,
  size: RenderSize
): Promise<Buffer> {
  const {
    price,
    originalPrice,
    fontFamily,
    fontSize,
    fontWeight,
    priceColor,
    originalPriceColor = '#888888',
    backgroundColor,
    borderRadius = 0,
    padding = 0,
    opacity = 100
  } = element;

  const width = size.width;
  const height = size.height;

  // Build font family stack with fallbacks
  const fontStack = `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  // Determine vertical positioning
  const hasOriginalPrice = !!originalPrice;
  const originalFontSize = fontSize * 0.65;
  const lineGap = 4;

  let priceY: number;
  let originalY: number;

  if (hasOriginalPrice) {
    // Stack prices: original on top (with strikethrough), current price below
    const totalTextHeight = fontSize + originalFontSize + lineGap;
    // Original price at top
    originalY = (height - totalTextHeight) / 2 + originalFontSize * 0.5;
    // Current price below
    priceY = originalY + originalFontSize * 0.5 + lineGap + fontSize * 0.5;
  } else {
    // Single price, centered vertically
    priceY = height / 2;
    originalY = 0;
  }

  // Build background if specified
  const backgroundRect = backgroundColor ? `
    <rect
      x="0"
      y="0"
      width="${width}"
      height="${height}"
      rx="${borderRadius}"
      ry="${borderRadius}"
      fill="${backgroundColor}"
    />
  ` : '';

  // Build original price with strikethrough
  const originalPriceContent = hasOriginalPrice ? `
    <!-- Original price with strikethrough -->
    <text
      x="${width / 2}"
      y="${originalY}"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="${fontStack}"
      font-size="${originalFontSize}"
      font-weight="400"
      fill="${originalPriceColor}"
      text-decoration="line-through"
    >${escapeXml(originalPrice || '')}</text>
  ` : '';

  // Calculate SVG opacity
  const svgOpacity = opacity < 100 ? `opacity="${opacity / 100}"` : '';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <g ${svgOpacity}>
    ${backgroundRect}

    ${originalPriceContent}

    <!-- Current price -->
    <text
      x="${width / 2}"
      y="${priceY}"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="${fontStack}"
      font-size="${fontSize}"
      font-weight="${fontWeight}"
      fill="${priceColor}"
    >${escapeXml(price)}</text>
  </g>
</svg>`;

  // Convert SVG to PNG buffer using Sharp
  const svgBuffer = Buffer.from(svg);

  return sharp(svgBuffer)
    .png()
    .toBuffer();
}

/**
 * Calculate auto-sized price tag dimensions
 */
export function calculatePriceTagSize(
  price: string,
  fontSize: number,
  originalPrice?: string,
  padding: number = 12
): { width: number; height: number } {
  // Calculate width based on longest price string
  const maxLength = Math.max(price.length, (originalPrice || '').length);
  const estimatedTextWidth = maxLength * fontSize * 0.6;

  // Calculate height
  const hasOriginal = !!originalPrice;
  const originalFontSize = fontSize * 0.65;
  const lineGap = 4;

  const textHeight = hasOriginal
    ? fontSize + originalFontSize + lineGap
    : fontSize;

  return {
    width: Math.ceil(estimatedTextWidth + padding * 2),
    height: Math.ceil(textHeight + padding * 2)
  };
}

/**
 * Format price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: string = '$',
  decimals: number = 2
): string {
  return `${currency}${amount.toFixed(decimals)}`;
}

export default renderPriceTag;
