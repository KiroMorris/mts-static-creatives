/**
 * V2 Text Renderer
 * Renders text elements with fonts, shadows, outlines, backgrounds, and gradients
 */

import sharp from 'sharp';

// ============================================================================
// Types
// ============================================================================

export interface TextShadowConfig {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  layers?: Array<{
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  }>;
}

export interface TextOutlineConfig {
  enabled: boolean;
  width: number;
  color: string;
}

export interface TextBackgroundConfig {
  enabled: boolean;
  color: string;
  padding: number | { top: number; right: number; bottom: number; left: number };
  borderRadius: number;
  opacity?: number;
}

export interface TextGradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  angle?: number;
  stops: Array<{
    offset: number;
    color: string;
  }>;
}

export interface TextElement {
  id: string;
  type: 'text';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Content
  content: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Color & Alignment
  color: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';

  // Spacing
  lineHeight?: number;
  letterSpacing?: number;

  // Text wrapping
  maxWidth?: number;
  overflow?: 'visible' | 'hidden' | 'ellipsis';

  // Effects
  shadow?: TextShadowConfig;
  outline?: TextOutlineConfig;
  background?: TextBackgroundConfig;
  gradient?: TextGradientConfig;
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

/**
 * Wrap text into lines based on max width
 * Estimates pixel width based on font size
 */
export function wrapTextAdvanced(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontFamily: string = 'Inter'
): string[] {
  // Approximate character widths (varies by font)
  const avgCharWidth = fontSize * 0.55;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Apply text transform (uppercase, lowercase, capitalize)
 */
function applyTextTransform(text: string, transform?: string): string {
  switch (transform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.replace(/\b\w/g, c => c.toUpperCase());
    default:
      return text;
  }
}

/**
 * Build SVG shadow filter
 */
function buildShadowFilter(shadow: TextShadowConfig): string {
  if (!shadow?.enabled) return '';

  const layers = shadow.layers || [{
    offsetX: shadow.offsetX,
    offsetY: shadow.offsetY,
    blur: shadow.blur,
    color: shadow.color
  }];

  const shadowEffects = layers.map((layer, i) => `
    <feDropShadow
      dx="${layer.offsetX}"
      dy="${layer.offsetY}"
      stdDeviation="${layer.blur}"
      flood-color="${layer.color}"
      result="shadow${i}"
    />
  `).join('');

  return `
    <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
      ${shadowEffects}
    </filter>
  `;
}

/**
 * Build SVG gradient definition
 */
function buildGradientDef(gradient: TextGradientConfig): string {
  if (!gradient?.enabled) return '';

  const stops = gradient.stops.map(stop =>
    `<stop offset="${stop.offset}%" stop-color="${stop.color}"/>`
  ).join('');

  if (gradient.type === 'linear') {
    const angle = gradient.angle || 0;
    // Convert angle to x1,y1,x2,y2 coordinates
    const radians = (angle - 90) * (Math.PI / 180);
    const x1 = 50 + Math.cos(radians + Math.PI) * 50;
    const y1 = 50 + Math.sin(radians + Math.PI) * 50;
    const x2 = 50 + Math.cos(radians) * 50;
    const y2 = 50 + Math.sin(radians) * 50;

    return `
      <linearGradient id="textGradient" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        ${stops}
      </linearGradient>
    `;
  }

  // Radial gradient
  return `
    <radialGradient id="textGradient" cx="50%" cy="50%" r="50%">
      ${stops}
    </radialGradient>
  `;
}

/**
 * Build SVG background rectangle
 */
function buildBackgroundRect(
  bg: TextBackgroundConfig,
  width: number,
  textHeight: number,
  align: string,
  startY: number
): string {
  if (!bg?.enabled) return '';

  const padding = typeof bg.padding === 'number'
    ? { top: bg.padding, right: bg.padding, bottom: bg.padding, left: bg.padding }
    : bg.padding;

  const rectWidth = width + padding.left + padding.right;
  const rectHeight = textHeight + padding.top + padding.bottom;
  const opacity = (bg.opacity ?? 100) / 100;

  let rectX: number;
  switch (align) {
    case 'center':
      rectX = (width / 2) - (rectWidth / 2);
      break;
    case 'right':
      rectX = width - rectWidth + padding.right;
      break;
    default:
      rectX = -padding.left;
  }

  const rectY = startY - padding.top;

  return `
    <rect
      x="${rectX}"
      y="${rectY}"
      width="${rectWidth}"
      height="${rectHeight}"
      rx="${bg.borderRadius}"
      ry="${bg.borderRadius}"
      fill="${bg.color}"
      opacity="${opacity}"
    />
  `;
}

// ============================================================================
// Main Render Function
// ============================================================================

/**
 * Render text element to a Sharp-compatible buffer
 */
export async function renderText(
  element: TextElement,
  size: RenderSize
): Promise<Buffer> {
  const {
    content,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle = 'normal',
    textTransform,
    color,
    align = 'left',
    verticalAlign = 'top',
    lineHeight = 1.2,
    letterSpacing = 0,
    maxWidth,
    shadow,
    outline,
    background,
    gradient,
    opacity = 100
  } = element;

  // Apply text transform
  const processedText = applyTextTransform(content, textTransform);

  // Wrap text if maxWidth specified
  const wrapWidth = maxWidth || size.width;
  const lines = wrapTextAdvanced(processedText, fontSize, wrapWidth, fontFamily);

  // Calculate dimensions
  const actualLineHeight = fontSize * lineHeight;
  const totalTextHeight = lines.length * actualLineHeight;

  // Calculate vertical offset based on alignment
  // Using ascender ratio of 0.85 for baseline adjustment
  const ascenderRatio = 0.85;
  let startY: number;
  switch (verticalAlign) {
    case 'top':
      startY = fontSize * ascenderRatio;
      break;
    case 'middle':
      startY = (size.height - totalTextHeight) / 2 + fontSize * ascenderRatio;
      break;
    case 'bottom':
      startY = size.height - totalTextHeight + fontSize * ascenderRatio;
      break;
    default:
      startY = fontSize * ascenderRatio;
  }

  // Calculate horizontal offset based on alignment
  let textAnchor: string;
  let textX: number;
  switch (align) {
    case 'left':
      textAnchor = 'start';
      textX = 0;
      break;
    case 'center':
      textAnchor = 'middle';
      textX = size.width / 2;
      break;
    case 'right':
      textAnchor = 'end';
      textX = size.width;
      break;
    default:
      textAnchor = 'start';
      textX = 0;
  }

  // Build font family stack with fallbacks
  const fontStack = `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  // Build shadow filter
  const shadowFilter = shadow?.enabled ? buildShadowFilter(shadow) : '';

  // Build gradient definition
  const gradientDef = gradient?.enabled ? buildGradientDef(gradient) : '';
  const fillColor = gradient?.enabled ? 'url(#textGradient)' : color;

  // Build outline (stroke) attributes
  const strokeAttr = outline?.enabled
    ? `stroke="${outline.color}" stroke-width="${outline.width}" paint-order="stroke fill"`
    : '';

  // Build background rect if enabled
  const backgroundRect = background?.enabled
    ? buildBackgroundRect(background, size.width, totalTextHeight, align, startY - fontSize * ascenderRatio)
    : '';

  // Generate text elements for each line
  const textElements = lines.map((line, i) => {
    const y = startY + i * actualLineHeight;
    return `
      <text
        x="${textX}"
        y="${y}"
        text-anchor="${textAnchor}"
        font-family="${fontStack}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        font-style="${fontStyle}"
        letter-spacing="${letterSpacing}px"
        fill="${fillColor}"
        ${strokeAttr}
        ${shadow?.enabled ? 'filter="url(#textShadow)"' : ''}
      >${escapeXml(line)}</text>
    `;
  }).join('');

  // Calculate SVG opacity
  const svgOpacity = opacity < 100 ? `opacity="${opacity / 100}"` : '';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${shadowFilter}
    ${gradientDef}
  </defs>

  <g ${svgOpacity}>
    ${backgroundRect}
    ${textElements}
  </g>
</svg>`;

  // Convert SVG to PNG buffer using Sharp for consistent output
  const svgBuffer = Buffer.from(svg);

  return sharp(svgBuffer)
    .png()
    .toBuffer();
}

export default renderText;
