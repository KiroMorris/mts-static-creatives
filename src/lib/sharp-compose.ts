// Sharp.js Image Composition System for Apparel Creative Generator
// Creates 1080x1920 collage with hero image, callouts, and text overlay

import sharp from 'sharp';
import { TEMPLATE } from './constants';

// ============================================================================
// Types
// ============================================================================

export interface TextStyleOptions {
  headlineFontSize?: number;
  headlineColor?: string;
  headlineShadow?: boolean;
  headlineX?: number;           // Direct X position (0-1080)
  headlineY?: number;           // Direct Y position (0-1920)
  headlineFontFamily?: string;  // Font family name (e.g., 'Inter', 'Playfair Display')
  headlineFontWeight?: number;  // Font weight (400, 500, 700)
  subtitleFontSize?: number;
  subtitleColor?: string;
  subtitleLetterSpacing?: number;
  subtitleGap?: number;         // Gap between headline and subtitle
  subtitleFontFamily?: string;  // Font family name
  subtitleFontWeight?: number;  // Font weight
}

// Per-callout zoom settings
export interface CalloutZoomOptions {
  zoom?: number;    // Zoom level (1.0 = normal, 2.0 = 2x zoom)
  focusX?: number;  // Horizontal focus point (0-100, 50 = center)
  focusY?: number;  // Vertical focus point (0-100, 50 = center)
}

export interface CalloutStyleOptions {
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  gap?: number;
  x?: number;    // Direct X position (0-1080)
  y?: number;    // Direct Y position for first callout (0-1920)
  // Per-callout zoom settings
  detail?: CalloutZoomOptions;
  fit?: CalloutZoomOptions;
  pose?: CalloutZoomOptions;
}

export interface HeroStyleOptions {
  zoom?: number;    // Zoom level (1.0 = normal, 2.0 = 2x zoom)
  focusX?: number;  // Horizontal focus point (0-100, 50 = center)
  focusY?: number;  // Vertical focus point (0-100, 50 = center)
}

export type CalloutType = 'detail' | 'fit' | 'pose';

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
  heroStyle?: HeroStyleOptions;
  textStyle?: TextStyleOptions;
  calloutStyle?: CalloutStyleOptions;
  calloutOrder?: [CalloutType, CalloutType, CalloutType];
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
 * Uses direct X/Y positioning for precise control
 */
export function createTextSVG(
  headline: string,
  subtitle: string,
  style?: TextStyleOptions
): string {
  // Use style options or defaults
  const fontSize = style?.headlineFontSize || HEADLINE_FONT_SIZE;
  const headlineColor = style?.headlineColor || 'white';
  const showShadow = style?.headlineShadow !== false; // default true
  const headlineFontFamily = style?.headlineFontFamily || 'Inter';
  const headlineFontWeight = style?.headlineFontWeight || 700;
  const subtitleFontSize = style?.subtitleFontSize || SUBTITLE_FONT_SIZE;
  const subtitleColor = style?.subtitleColor || 'rgba(255,255,255,0.9)';
  const subtitleLetterSpacing = style?.subtitleLetterSpacing || SUBTITLE_LETTER_SPACING;
  const subtitleGap = style?.subtitleGap ?? SUBTITLE_Y_OFFSET;
  const subtitleFontFamily = style?.subtitleFontFamily || 'Inter';
  const subtitleFontWeight = style?.subtitleFontWeight || 500;

  // Build font-family strings with fallbacks for SVG rendering
  const headlineFontStack = `${headlineFontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
  const subtitleFontStack = `${subtitleFontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  // Use direct X/Y positioning from style, or fallback to defaults
  // Round to ensure integer coordinates for consistent rendering
  const baseX = Math.round(style?.headlineX ?? TEXT_X);
  const baseY = Math.round(style?.headlineY ?? HEADLINE_Y);
  const lineHeight = Math.round(fontSize * 1.1);

  // IMPORTANT: SVG text 'y' attribute positions the BASELINE, not the top of the text.
  // CSS 'top' positions the top of the element. To match CSS behavior, we need to
  // add an offset equal to the font's ascent (approximately 0.85 * fontSize for most fonts).
  // This makes the visual top of the text align with the specified Y position.
  //
  // For Inter font and similar sans-serif fonts:
  // - Cap height is typically around 0.70-0.75 of em
  // - Ascender is typically around 0.85-0.93 of em
  // We use 0.85 as a good approximation that works across common fonts
  const ascenderRatio = 0.85;
  const headlineAscenderOffset = Math.round(fontSize * ascenderRatio);
  const subtitleAscenderOffset = Math.round(subtitleFontSize * ascenderRatio);

  console.log('createTextSVG - baseX:', baseX, 'baseY:', baseY, 'fontSize:', fontSize, 'lineHeight:', lineHeight, 'ascenderOffset:', headlineAscenderOffset);

  // Wrap headline text into lines (adjust chars per line based on font size)
  const charsPerLine = Math.round(15 * (72 / fontSize));
  const headlineLines = wrapText(headline, charsPerLine);

  // Generate headline text elements
  // Y position = baseY + ascender offset to align top of text with specified position
  const headlineSVG = headlineLines.map((line, i) => `
    <text
      x="${baseX}"
      y="${baseY + headlineAscenderOffset + (i * lineHeight)}"
      font-family="${headlineFontStack}"
      font-size="${fontSize}"
      font-weight="${headlineFontWeight}"
      fill="${headlineColor}"
      letter-spacing="-0.02em"
    >${escapeXml(line)}</text>
  `).join('');

  // Add text shadow via filter for each headline line (if enabled)
  const headlineShadowSVG = showShadow ? headlineLines.map((line, i) => `
    <text
      x="${baseX}"
      y="${baseY + headlineAscenderOffset + (i * lineHeight)}"
      font-family="${headlineFontStack}"
      font-size="${fontSize}"
      font-weight="${headlineFontWeight}"
      fill="rgba(0,0,0,0.3)"
      letter-spacing="-0.02em"
      filter="url(#shadow)"
    >${escapeXml(line)}</text>
  `).join('') : '';

  // Calculate subtitle Y position (below last headline line + gap)
  // This matches the CSS calculation: headlineY + (lineCount * lineHeight) + gap
  // This gives us the visual TOP position of the subtitle
  const subtitleTopY = baseY + (headlineLines.length * lineHeight) + subtitleGap;

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
    x="${baseX}"
    y="${subtitleTopY + subtitleAscenderOffset}"
    font-family="${subtitleFontStack}"
    font-size="${subtitleFontSize}"
    font-weight="${subtitleFontWeight}"
    letter-spacing="${subtitleLetterSpacing}px"
    fill="${subtitleColor}"
  >${escapeXml(subtitle.toUpperCase())}</text>
</svg>`;
}

/**
 * Prepare callout image: resize to square, add rounded corners and white border
 * Supports zoom and focus point to crop into the image
 */
export async function prepareCallout(
  buffer: Buffer,
  style?: CalloutStyleOptions,
  zoomOptions?: CalloutZoomOptions
): Promise<Buffer> {
  // Use style options or defaults
  const size = style?.size || CALLOUT_WIDTH;
  const borderWidth = style?.borderWidth ?? CALLOUT_BORDER_WIDTH;
  const borderColor = style?.borderColor || CALLOUT_BORDER_COLOR;
  const borderRadius = style?.borderRadius ?? CALLOUT_RADIUS;
  const zoom = zoomOptions?.zoom ?? 1;
  const focusX = zoomOptions?.focusX ?? 50;
  const focusY = zoomOptions?.focusY ?? 50;

  const innerWidth = size - (borderWidth * 2);
  const innerHeight = size - (borderWidth * 2);
  const innerRadius = Math.max(0, borderRadius - borderWidth);

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

  // Apply zoom if needed, then resize to inner dimensions
  let resized: Buffer;
  if (zoom > 1) {
    // Get metadata to calculate crop
    const metadata = await sharp(buffer).metadata();
    const imgWidth = metadata.width || innerWidth;
    const imgHeight = metadata.height || innerHeight;

    // Calculate crop region for zoom with focus point
    const cropSize = Math.round(Math.min(imgWidth, imgHeight) / zoom);
    const maxLeft = imgWidth - cropSize;
    const maxTop = imgHeight - cropSize;
    const left = Math.round((focusX / 100) * maxLeft);
    const top = Math.round((focusY / 100) * maxTop);

    resized = await sharp(buffer)
      .extract({
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: Math.min(cropSize, imgWidth - left),
        height: Math.min(cropSize, imgHeight - top)
      })
      .resize(innerWidth, innerHeight, { fit: 'cover' })
      .ensureAlpha()
      .toBuffer();
  } else {
    resized = await sharp(buffer)
      .resize(innerWidth, innerHeight, {
        fit: 'cover',
        position: 'center'
      })
      .ensureAlpha()
      .toBuffer();
  }

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

  // Create border frame (skip if borderWidth is 0)
  if (borderWidth === 0) {
    return rounded;
  }

  const borderFrame = Buffer.from(`
    <svg width="${size}" height="${size}">
      <rect
        width="${size}"
        height="${size}"
        rx="${borderRadius}"
        ry="${borderRadius}"
        fill="${borderColor}"
      />
    </svg>
  `);

  // Composite: border frame + rounded image inside
  const withBorder = await sharp(borderFrame)
    .composite([
      {
        input: rounded,
        top: borderWidth,
        left: borderWidth
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
 * Apply zoom to an image by extracting a region and resizing
 *
 * IMPORTANT: This must match CSS object-fit:cover + object-position behavior exactly.
 * When zoom=1 with focusX/Y=50: Sharp's position:'centre' matches CSS object-position:center
 * When zoom>1: We manually extract a region based on focus point, then resize to cover
 */
async function applyZoom(
  buffer: Buffer,
  targetWidth: number,
  targetHeight: number,
  zoom: number,
  focusX: number = 50,
  focusY: number = 50
): Promise<Buffer> {
  // Get image metadata first
  const metadata = await sharp(buffer).metadata();
  const imgWidth = metadata.width || targetWidth;
  const imgHeight = metadata.height || targetHeight;

  if (zoom <= 1) {
    // No zoom - use Sharp's built-in cover with center position
    // Sharp's 'centre' position should match CSS object-position: 50% 50%
    return sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'centre'  // Use 'centre' (British spelling) for Sharp
      })
      .toBuffer();
  }

  // For zoom > 1: manually calculate crop region
  // This simulates zooming into a specific area of the image

  // Calculate how much of the original image we want to show (1/zoom)
  const cropWidth = Math.round(imgWidth / zoom);
  const cropHeight = Math.round(imgHeight / zoom);

  // Calculate crop position based on focus point (0-100 maps to available range)
  const maxLeft = Math.max(0, imgWidth - cropWidth);
  const maxTop = Math.max(0, imgHeight - cropHeight);
  const left = Math.round((focusX / 100) * maxLeft);
  const top = Math.round((focusY / 100) * maxTop);

  // Extract the zoomed region and resize to target dimensions
  return sharp(buffer)
    .extract({
      left: Math.max(0, Math.min(left, imgWidth - cropWidth)),
      top: Math.max(0, Math.min(top, imgHeight - cropHeight)),
      width: cropWidth,
      height: cropHeight
    })
    .resize(targetWidth, targetHeight, { fit: 'cover', position: 'centre' })
    .toBuffer();
}

/**
 * Compose the final collage from hero, callouts, and text
 *
 * @param options - Hero image buffer, callout buffers, text content, and style options
 * @returns Buffer containing the final PNG image
 */
export async function composeCollage(options: ComposeOptions): Promise<Buffer> {
  const { heroImageBuffer, calloutBuffers, text, heroStyle, textStyle, calloutStyle, calloutOrder = ['detail', 'fit', 'pose'] } = options;

  // DEBUG: Log all received style options
  console.log('=== SHARP COMPOSE DEBUG ===');
  console.log('textStyle received:', JSON.stringify(textStyle, null, 2));
  console.log('calloutStyle received:', JSON.stringify(calloutStyle, null, 2));
  console.log('heroStyle received:', JSON.stringify(heroStyle, null, 2));

  // Get callout style values with defaults
  const calloutSize = calloutStyle?.size || CALLOUT_WIDTH;
  const calloutGap = calloutStyle?.gap ?? CALLOUT_GAP;

  // Use direct X/Y positioning from style, with fallback defaults
  const calloutX = calloutStyle?.x ?? CALLOUT_X;
  const calloutStartY = calloutStyle?.y ?? CALLOUT_START_Y;

  console.log('Callout positioning - X:', calloutX, 'StartY:', calloutStartY, 'Size:', calloutSize, 'Gap:', calloutGap);

  // Per-callout zoom settings
  const detailZoom = calloutStyle?.detail ?? { zoom: 1, focusX: 50, focusY: 50 };
  const fitZoom = calloutStyle?.fit ?? { zoom: 1, focusX: 50, focusY: 50 };
  const poseZoom = calloutStyle?.pose ?? { zoom: 1, focusX: 50, focusY: 50 };

  // Get hero style values with defaults
  const heroZoom = heroStyle?.zoom ?? 1;
  const heroFocusX = heroStyle?.focusX ?? 50;
  const heroFocusY = heroStyle?.focusY ?? 50;

  // 1. Apply zoom and resize hero image to fill the entire canvas
  const heroResized = await applyZoom(
    heroImageBuffer,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    heroZoom,
    heroFocusX,
    heroFocusY
  );

  // 2. Prepare all three callout images with rounded corners and per-callout zoom
  // Use calloutOrder to determine the sequence
  const zoomSettings: Record<CalloutType, CalloutZoomOptions> = {
    detail: detailZoom,
    fit: fitZoom,
    pose: poseZoom
  };

  const [callout1, callout2, callout3] = await Promise.all([
    prepareCallout(calloutBuffers[calloutOrder[0]], calloutStyle, zoomSettings[calloutOrder[0]]),
    prepareCallout(calloutBuffers[calloutOrder[1]], calloutStyle, zoomSettings[calloutOrder[1]]),
    prepareCallout(calloutBuffers[calloutOrder[2]], calloutStyle, zoomSettings[calloutOrder[2]])
  ]);

  // 3. Create text overlay as SVG buffer with styles
  const textOverlaySVG = createTextSVG(text.headline, text.subtitle, textStyle);
  const textOverlayBuffer = Buffer.from(textOverlaySVG);

  // 4. Calculate callout Y positions
  // Ensure all positions are integers (Sharp requires integer values for composite)
  const callout1Y = Math.round(calloutStartY);
  const callout2Y = Math.round(calloutStartY + calloutSize + calloutGap);
  const callout3Y = Math.round(calloutStartY + (calloutSize + calloutGap) * 2);
  const calloutXInt = Math.round(calloutX);

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
        left: calloutXInt
      },
      // Callout 2 - Fit shot
      {
        input: callout2,
        top: callout2Y,
        left: calloutXInt
      },
      // Callout 3 - Pose shot
      {
        input: callout3,
        top: callout3Y,
        left: calloutXInt
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
