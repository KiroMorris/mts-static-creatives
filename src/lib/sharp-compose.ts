// Sharp.js Image Composition System for Apparel Creative Generator
// Creates 1080x1920 collage with hero image, callouts, and text overlay

import sharp from 'sharp';
import { TEMPLATE } from './constants';

// ============================================================================
// Types
// ============================================================================

export interface ComposeOptions {
  heroImageBuffer: Buffer;
  calloutBuffers: {
    detail: Buffer;
    fit: Buffer;
    pose: Buffer;
  };
  text: {
    headline: string;
    subtitle: string;
  };
}

export interface ComposeResult {
  buffer: Buffer;
  format: 'png';
  width: number;
  height: number;
}

// ============================================================================
// Constants from Template
// ============================================================================

const CANVAS_WIDTH = TEMPLATE.canvas.width;
const CANVAS_HEIGHT = TEMPLATE.canvas.height;

const CALLOUT_WIDTH = TEMPLATE.callouts.width;
const CALLOUT_HEIGHT = TEMPLATE.callouts.height;
const CALLOUT_GAP = TEMPLATE.callouts.gap;
const CALLOUT_X = TEMPLATE.callouts.x;
const CALLOUT_START_Y = TEMPLATE.callouts.startY;
const CALLOUT_RADIUS = TEMPLATE.callouts.borderRadius;
const CALLOUT_BORDER_WIDTH = TEMPLATE.callouts.borderWidth;
const CALLOUT_BORDER_COLOR = TEMPLATE.callouts.borderColor;

const TEXT_X = TEMPLATE.text.paddingLeft;
const HEADLINE_Y = TEMPLATE.text.headline.y;
const HEADLINE_FONT_SIZE = TEMPLATE.text.headline.fontSize;
const HEADLINE_LINE_HEIGHT = TEMPLATE.text.headline.lineHeight;
const HEADLINE_MAX_WIDTH = TEMPLATE.text.headline.maxWidth;

const SUBTITLE_Y_OFFSET = TEMPLATE.text.subtitle.yOffset;
const SUBTITLE_FONT_SIZE = TEMPLATE.text.subtitle.fontSize;
const SUBTITLE_LETTER_SPACING = TEMPLATE.text.subtitle.letterSpacing;

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
 * Wrap text into multiple lines based on character limit
 * Optimized for 72px Inter Bold font at 600px max width
 */
export function wrapText(text: string, maxCharsPerLine: number = 15): string[] {
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
 * Create SVG text overlay with headline and subtitle
 * Uses embedded font-face for consistent rendering
 */
export function createTextSVG(headline: string, subtitle: string): string {
  // Wrap headline text into lines
  const headlineLines = wrapText(headline, 15);

  // Generate headline text elements
  const headlineSVG = headlineLines.map((line, i) => `
    <text
      x="${TEXT_X}"
      y="${HEADLINE_Y + (i * HEADLINE_LINE_HEIGHT)}"
      font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
      font-size="${HEADLINE_FONT_SIZE}"
      font-weight="700"
      fill="white"
      letter-spacing="-0.02em"
    >${escapeXml(line)}</text>
  `).join('');

  // Add text shadow via filter for each headline line
  const headlineShadowSVG = headlineLines.map((line, i) => `
    <text
      x="${TEXT_X}"
      y="${HEADLINE_Y + (i * HEADLINE_LINE_HEIGHT)}"
      font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
      font-size="${HEADLINE_FONT_SIZE}"
      font-weight="700"
      fill="rgba(0,0,0,0.3)"
      letter-spacing="-0.02em"
      filter="url(#shadow)"
    >${escapeXml(line)}</text>
  `).join('');

  // Calculate subtitle Y position (below last headline line + offset)
  const subtitleY = HEADLINE_Y + (headlineLines.length * HEADLINE_LINE_HEIGHT) + SUBTITLE_Y_OFFSET;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Text shadow filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>

  <!-- Headline with shadow -->
  <g>
    ${headlineShadowSVG}
    ${headlineSVG}
  </g>

  <!-- Subtitle -->
  <text
    x="${TEXT_X}"
    y="${subtitleY}"
    font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
    font-size="${SUBTITLE_FONT_SIZE}"
    font-weight="500"
    letter-spacing="${SUBTITLE_LETTER_SPACING}"
    fill="rgba(255,255,255,0.9)"
    text-transform="uppercase"
  >${escapeXml(subtitle.toUpperCase())}</text>
</svg>`;
}

/**
 * Prepare callout image: resize to square, add rounded corners and white border
 */
export async function prepareCallout(buffer: Buffer): Promise<Buffer> {
  const innerWidth = CALLOUT_WIDTH - (CALLOUT_BORDER_WIDTH * 2);
  const innerHeight = CALLOUT_HEIGHT - (CALLOUT_BORDER_WIDTH * 2);
  const innerRadius = Math.max(0, CALLOUT_RADIUS - CALLOUT_BORDER_WIDTH);

  // Create rounded rectangle mask for inner image
  const roundedMask = Buffer.from(`
    <svg width="${innerWidth}" height="${innerHeight}">
      <rect
        width="${innerWidth}"
        height="${innerHeight}"
        rx="${innerRadius}"
        ry="${innerRadius}"
        fill="white"
      />
    </svg>
  `);

  // Resize image to inner dimensions (square 1:1)
  const resized = await sharp(buffer)
    .resize(innerWidth, innerHeight, {
      fit: 'cover',
      position: 'center'
    })
    .ensureAlpha()
    .toBuffer();

  // Apply the rounded corner mask
  const rounded = await sharp(resized)
    .composite([
      {
        input: roundedMask,
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  // Create white border frame
  const borderFrame = Buffer.from(`
    <svg width="${CALLOUT_WIDTH}" height="${CALLOUT_HEIGHT}">
      <rect
        width="${CALLOUT_WIDTH}"
        height="${CALLOUT_HEIGHT}"
        rx="${CALLOUT_RADIUS}"
        ry="${CALLOUT_RADIUS}"
        fill="${CALLOUT_BORDER_COLOR}"
      />
    </svg>
  `);

  // Composite: white border frame + rounded image inside
  const withBorder = await sharp(borderFrame)
    .composite([
      {
        input: rounded,
        top: CALLOUT_BORDER_WIDTH,
        left: CALLOUT_BORDER_WIDTH
      }
    ])
    .png()
    .toBuffer();

  return withBorder;
}

/**
 * Prepare callout with optional white border
 */
export async function prepareCalloutWithBorder(
  buffer: Buffer,
  borderWidth: number = 2
): Promise<Buffer> {
  // First prepare the basic rounded callout
  const roundedCallout = await prepareCallout(buffer);

  // If no border needed, return as-is
  if (borderWidth === 0) {
    return roundedCallout;
  }

  // Create border frame as SVG
  const borderFrame = Buffer.from(`
    <svg width="${CALLOUT_WIDTH + borderWidth * 2}" height="${CALLOUT_HEIGHT + borderWidth * 2}">
      <rect
        x="0"
        y="0"
        width="${CALLOUT_WIDTH + borderWidth * 2}"
        height="${CALLOUT_HEIGHT + borderWidth * 2}"
        rx="${CALLOUT_RADIUS + borderWidth}"
        ry="${CALLOUT_RADIUS + borderWidth}"
        fill="rgba(255,255,255,0.2)"
      />
    </svg>
  `);

  // Create the bordered callout
  const bordered = await sharp(borderFrame)
    .composite([
      {
        input: roundedCallout,
        top: borderWidth,
        left: borderWidth
      }
    ])
    .png()
    .toBuffer();

  return bordered;
}

// ============================================================================
// Main Composition Function
// ============================================================================

/**
 * Compose the final collage from hero, callouts, and text
 *
 * @param options - Hero image buffer, callout buffers, and text content
 * @returns Buffer containing the final PNG image
 */
export async function composeCollage(options: ComposeOptions): Promise<Buffer> {
  const { heroImageBuffer, calloutBuffers, text } = options;

  // 1. Resize hero image to fill the entire canvas
  const heroResized = await sharp(heroImageBuffer)
    .resize(CANVAS_WIDTH, CANVAS_HEIGHT, {
      fit: 'cover',
      position: 'center'
    })
    .toBuffer();

  // 2. Prepare all three callout images with rounded corners
  const [callout1, callout2, callout3] = await Promise.all([
    prepareCallout(calloutBuffers.detail),
    prepareCallout(calloutBuffers.fit),
    prepareCallout(calloutBuffers.pose)
  ]);

  // 3. Create text overlay as SVG buffer
  const textOverlaySVG = createTextSVG(text.headline, text.subtitle);
  const textOverlayBuffer = Buffer.from(textOverlaySVG);

  // 4. Calculate callout Y positions
  const callout1Y = CALLOUT_START_Y;
  const callout2Y = CALLOUT_START_Y + CALLOUT_HEIGHT + CALLOUT_GAP;
  const callout3Y = CALLOUT_START_Y + (CALLOUT_HEIGHT + CALLOUT_GAP) * 2;

  // 5. Composite all layers onto the hero background
  const composite = await sharp(heroResized)
    .composite([
      // Text overlay (rendered as SVG)
      {
        input: textOverlayBuffer,
        top: 0,
        left: 0
      },
      // Callout 1 - Detail shot
      {
        input: callout1,
        top: callout1Y,
        left: CALLOUT_X
      },
      // Callout 2 - Fit shot
      {
        input: callout2,
        top: callout2Y,
        left: CALLOUT_X
      },
      // Callout 3 - Pose shot (partially off-canvas at y=1840)
      {
        input: callout3,
        top: callout3Y,
        left: CALLOUT_X
      }
    ])
    .png({ quality: 100, compressionLevel: 6 })
    .toBuffer();

  return composite;
}

/**
 * Compose collage and return with metadata
 */
export async function composeCollageWithMetadata(
  options: ComposeOptions
): Promise<ComposeResult> {
  const buffer = await composeCollage(options);

  return {
    buffer,
    format: 'png',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
  };
}

/**
 * Export collage as JPEG with specified quality
 */
export async function composeCollageAsJPEG(
  options: ComposeOptions,
  quality: number = 90
): Promise<Buffer> {
  const pngBuffer = await composeCollage(options);

  return sharp(pngBuffer)
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
}

/**
 * Export collage as WebP with specified quality
 */
export async function composeCollageAsWebP(
  options: ComposeOptions,
  quality: number = 90
): Promise<Buffer> {
  const pngBuffer = await composeCollage(options);

  return sharp(pngBuffer)
    .webp({ quality })
    .toBuffer();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Fetch image from URL and return as buffer
 */
export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Convert buffer to base64 data URL
 */
export function bufferToBase64DataUrl(buffer: Buffer, mimeType: string = 'image/png'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Validate image buffer dimensions
 */
export async function validateImageDimensions(
  buffer: Buffer,
  minWidth: number = 500,
  minHeight: number = 500
): Promise<{ valid: boolean; width: number; height: number; error?: string }> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  if (width < minWidth || height < minHeight) {
    return {
      valid: false,
      width,
      height,
      error: `Image dimensions ${width}x${height} are below minimum ${minWidth}x${minHeight}`
    };
  }

  return { valid: true, width, height };
}
