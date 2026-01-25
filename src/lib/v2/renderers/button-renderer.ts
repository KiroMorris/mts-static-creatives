/**
 * V2 Button Renderer
 * Renders CTA (Call-to-Action) button elements with text, backgrounds, and shadows
 */

import sharp from 'sharp';

// ============================================================================
// Types
// ============================================================================

export interface ButtonShadowConfig {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface CTAButtonElement {
  id: string;
  type: 'cta-button';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Button content
  text: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;

  // Button styling
  backgroundColor: string;
  borderRadius: number;
  paddingX?: number;
  paddingY?: number;

  // Optional border
  borderWidth?: number;
  borderColor?: string;

  // Optional shadow
  shadow?: ButtonShadowConfig;
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
 * Render CTA button as SVG, then convert to PNG buffer
 */
export async function renderCTAButton(
  element: CTAButtonElement,
  size: RenderSize
): Promise<Buffer> {
  const {
    text,
    fontFamily,
    fontSize,
    fontWeight,
    textColor,
    backgroundColor,
    borderRadius,
    paddingX = 0,
    paddingY = 0,
    borderWidth = 0,
    borderColor = 'transparent',
    shadow,
    opacity = 100
  } = element;

  const buttonWidth = size.width;
  const buttonHeight = size.height;

  // Build font family stack with fallbacks
  const fontStack = `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  // Build shadow filter if enabled
  const shadowFilter = shadow?.enabled ? `
    <filter id="btnShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow
        dx="${shadow.offsetX}"
        dy="${shadow.offsetY}"
        stdDeviation="${shadow.blur}"
        flood-color="${shadow.color}"
      />
    </filter>
  ` : '';

  const filterAttr = shadow?.enabled ? 'filter="url(#btnShadow)"' : '';

  // Calculate rect position accounting for border
  const rectX = borderWidth / 2;
  const rectY = borderWidth / 2;
  const rectWidth = buttonWidth - borderWidth;
  const rectHeight = buttonHeight - borderWidth;

  // Calculate SVG opacity
  const svgOpacity = opacity < 100 ? `opacity="${opacity / 100}"` : '';

  // Create SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${buttonWidth}" height="${buttonHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${shadowFilter}
  </defs>

  <g ${svgOpacity}>
    <!-- Button background -->
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
      ${filterAttr}
    />

    <!-- Button text (centered) -->
    <text
      x="${buttonWidth / 2}"
      y="${buttonHeight / 2}"
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
 * Calculate auto-sized button dimensions based on text
 * Useful when size is not explicitly specified
 */
export function calculateButtonSize(
  text: string,
  fontSize: number,
  paddingX: number = 24,
  paddingY: number = 12
): { width: number; height: number } {
  // Approximate text width (varies by font)
  const avgCharWidth = fontSize * 0.6;
  const textWidth = text.length * avgCharWidth;

  return {
    width: Math.ceil(textWidth + paddingX * 2),
    height: Math.ceil(fontSize * 1.4 + paddingY * 2)
  };
}

export default renderCTAButton;
