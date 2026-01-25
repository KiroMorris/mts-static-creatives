/**
 * V2 Badge Renderer
 * Renders pill-shaped badge elements with text
 */

import sharp from 'sharp';

// ============================================================================
// Types
// ============================================================================

export interface BadgeElement {
  id: string;
  type: 'badge';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Badge content
  text: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;

  // Badge styling
  backgroundColor: string;
  paddingX: number;
  paddingY: number;

  // Optional border
  borderWidth?: number;
  borderColor?: string;

  // Badge is always pill-shaped (borderRadius = height/2) by default
  // but can be overridden with custom borderRadius
  borderRadius?: number;
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
 * Render pill-shaped badge to PNG buffer
 * If size is provided, use it; otherwise calculate from text dimensions
 */
export async function renderBadge(
  element: BadgeElement,
  size?: RenderSize
): Promise<Buffer> {
  const {
    text,
    fontFamily,
    fontSize,
    fontWeight,
    textColor,
    backgroundColor,
    paddingX,
    paddingY,
    borderWidth = 0,
    borderColor = 'transparent',
    borderRadius: customBorderRadius,
    opacity = 100
  } = element;

  // Calculate badge dimensions
  let width: number;
  let height: number;

  if (size && size.width > 0 && size.height > 0) {
    // Use provided size
    width = size.width;
    height = size.height;
  } else {
    // Calculate based on text and padding
    const estimatedTextWidth = text.length * fontSize * 0.6;
    width = estimatedTextWidth + paddingX * 2;
    height = fontSize * 1.4 + paddingY * 2;
  }

  // Pill shape: borderRadius = height / 2 (unless custom is specified)
  const borderRadius = customBorderRadius ?? (height / 2);

  // Build font family stack with fallbacks
  const fontStack = `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  // Calculate rect position accounting for border
  const rectX = borderWidth / 2;
  const rectY = borderWidth / 2;
  const rectWidth = width - borderWidth;
  const rectHeight = height - borderWidth;

  // Calculate SVG opacity
  const svgOpacity = opacity < 100 ? `opacity="${opacity / 100}"` : '';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <g ${svgOpacity}>
    <!-- Pill background -->
    <rect
      x="${rectX}"
      y="${rectY}"
      width="${rectWidth}"
      height="${rectHeight}"
      rx="${borderRadius}"
      ry="${borderRadius}"
      fill="${backgroundColor}"
      stroke="${borderWidth > 0 ? borderColor : 'none'}"
      stroke-width="${borderWidth}"
    />

    <!-- Badge text -->
    <text
      x="${width / 2}"
      y="${height / 2}"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="${fontStack}"
      font-size="${fontSize}"
      font-weight="${fontWeight}"
      fill="${textColor}"
    >${escapeXml(text)}</text>
  </g>
</svg>`;

  // Convert SVG to PNG buffer using Sharp
  const svgBuffer = Buffer.from(svg);

  return sharp(svgBuffer)
    .png()
    .toBuffer();
}

/**
 * Calculate auto-sized badge dimensions based on text
 */
export function calculateBadgeSize(
  text: string,
  fontSize: number,
  paddingX: number = 16,
  paddingY: number = 8
): { width: number; height: number } {
  const estimatedTextWidth = text.length * fontSize * 0.6;

  return {
    width: Math.ceil(estimatedTextWidth + paddingX * 2),
    height: Math.ceil(fontSize * 1.4 + paddingY * 2)
  };
}

export default renderBadge;
