// Sharp Compose V2 - Flexible Canvas Composition Engine
// Supports multiple aspect ratios, toggleable elements, and arbitrary positioning

import sharp, { OverlayOptions } from 'sharp';
import {
  AspectRatio,
  CanvasConfig,
  CANVAS_PRESETS,
  CanvasElement,
  ComposeV2Request,
  ComposeV2Result,
  TextElement,
  CTAButtonElement,
  BadgeElement,
  PriceTagElement,
  ShapeElement,
  CalloutElement,
  ImageElement,
  LogoElement,
  HeroElement
} from './types';
import {
  createCanvas,
  resolvePosition,
  resolveSize,
  applyImageTransform,
  generateId,
  bufferToBase64DataUrl,
  escapeXml,
  hexToRgba,
  getCanvasConfig
} from './canvas-utils';
import { getActiveElements, getHeroElement, getNonHeroElements } from './layer-manager';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// ============================================================================
// Image Resolution
// ============================================================================

/**
 * Fetch image from URL and return as buffer
 */
async function fetchImageBuffer(url: string): Promise<Buffer> {
  // Handle data URLs
  if (url.startsWith('data:')) {
    const matches = url.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid data URL format');
    }
    return Buffer.from(matches[2], 'base64');
  }

  // Handle relative URLs
  let fullUrl = url;
  if (url.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    fullUrl = `${baseUrl}${url}`;
  }

  const response = await fetch(fullUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Resolve image references to buffers for all image elements
 */
async function resolveImageBuffers(
  elements: CanvasElement[]
): Promise<Map<string, Buffer>> {
  const buffers = new Map<string, Buffer>();

  const imageElements = elements.filter(el =>
    ['hero', 'image', 'callout', 'logo'].includes(el.type) && el.enabled
  );

  await Promise.all(imageElements.map(async (element) => {
    try {
      let buffer: Buffer | undefined;

      // Check for imageBuffer first (already resolved)
      if ('imageBuffer' in element && element.imageBuffer) {
        buffer = element.imageBuffer;
      } else if ('imageUrl' in element && element.imageUrl) {
        buffer = await fetchImageBuffer(element.imageUrl);
      }

      if (buffer) {
        buffers.set(element.id, buffer);
      }
    } catch (error) {
      console.error(`Failed to resolve image for element ${element.id}:`, error);
      // Don't throw - allow composition to continue without this element
    }
  }));

  return buffers;
}

// ============================================================================
// Element Renderers
// ============================================================================

/**
 * Render text element as SVG buffer
 */
async function renderTextElement(
  element: TextElement,
  size: { width: number; height: number }
): Promise<Buffer> {
  const {
    content,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle = 'normal',
    textTransform = 'none',
    color,
    align,
    verticalAlign = 'top',
    lineHeight,
    letterSpacing,
    maxWidth,
    shadow,
    outline,
    background
  } = element;

  // Apply text transform
  let processedText = content;
  switch (textTransform) {
    case 'uppercase':
      processedText = content.toUpperCase();
      break;
    case 'lowercase':
      processedText = content.toLowerCase();
      break;
    case 'capitalize':
      processedText = content.replace(/\b\w/g, c => c.toUpperCase());
      break;
  }

  // Wrap text
  const wrapWidth = maxWidth || size.width;
  const avgCharWidth = fontSize * 0.55;
  const maxCharsPerLine = Math.floor(wrapWidth / avgCharWidth);
  const lines = wrapText(processedText, maxCharsPerLine);

  // Calculate dimensions
  const actualLineHeight = fontSize * lineHeight;
  const totalTextHeight = lines.length * actualLineHeight;

  // Calculate text anchor
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
  }

  // Calculate vertical offset
  let startY: number;
  const ascenderRatio = 0.85;
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

  // Build font stack
  const fontStack = `${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  // Build shadow filter if enabled
  const shadowFilter = shadow?.enabled ? `
    <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow
        dx="${shadow.offsetX}"
        dy="${shadow.offsetY}"
        stdDeviation="${shadow.blur}"
        flood-color="${shadow.color}"
      />
    </filter>
  ` : '';

  // Build outline attributes
  const strokeAttr = outline?.enabled
    ? `stroke="${outline.color}" stroke-width="${outline.width}" paint-order="stroke fill"`
    : '';

  // Build background rect
  const backgroundRect = background?.enabled ? `
    <rect
      x="0"
      y="0"
      width="${size.width}"
      height="${size.height}"
      rx="${background.borderRadius}"
      ry="${background.borderRadius}"
      fill="${background.color}"
      opacity="${(background.opacity ?? 100) / 100}"
    />
  ` : '';

  // Generate text elements
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
        fill="${color}"
        ${strokeAttr}
        ${shadow?.enabled ? 'filter="url(#textShadow)"' : ''}
      >${escapeXml(line)}</text>
    `;
  }).join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${shadowFilter}
  </defs>
  ${backgroundRect}
  ${textElements}
</svg>`;

  return Buffer.from(svg);
}

/**
 * Render CTA button as SVG buffer
 */
async function renderCTAButton(
  element: CTAButtonElement,
  size: { width: number; height: number }
): Promise<Buffer> {
  const {
    text,
    fontFamily,
    fontSize,
    fontWeight,
    textColor,
    backgroundColor,
    borderRadius,
    borderWidth = 0,
    borderColor = 'transparent',
    shadow
  } = element;

  const buttonWidth = size.width;
  const buttonHeight = size.height;

  // Build shadow filter
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
  const fontStack = `${fontFamily}, -apple-system, sans-serif`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${buttonWidth}" height="${buttonHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${shadowFilter}
  </defs>

  <rect
    x="${borderWidth / 2}"
    y="${borderWidth / 2}"
    width="${buttonWidth - borderWidth}"
    height="${buttonHeight - borderWidth}"
    rx="${borderRadius}"
    ry="${borderRadius}"
    fill="${backgroundColor}"
    stroke="${borderColor}"
    stroke-width="${borderWidth}"
    ${filterAttr}
  />

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
</svg>`;

  return Buffer.from(svg);
}

/**
 * Render badge as SVG buffer
 */
async function renderBadge(element: BadgeElement): Promise<Buffer> {
  const {
    text,
    fontFamily,
    fontSize,
    fontWeight,
    textColor,
    backgroundColor,
    paddingX,
    paddingY
  } = element;

  // Calculate badge dimensions
  const estimatedTextWidth = text.length * fontSize * 0.6;
  const width = estimatedTextWidth + paddingX * 2;
  const height = fontSize + paddingY * 2;
  const borderRadius = height / 2; // Pill shape

  const fontStack = `${fontFamily}, -apple-system, sans-serif`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect
    x="0"
    y="0"
    width="${width}"
    height="${height}"
    rx="${borderRadius}"
    ry="${borderRadius}"
    fill="${backgroundColor}"
  />

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
</svg>`;

  return Buffer.from(svg);
}

/**
 * Render price tag as SVG buffer
 */
async function renderPriceTag(
  element: PriceTagElement,
  size: { width: number; height: number }
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
    borderRadius = 0
  } = element;

  const { width, height } = size;
  const hasOriginalPrice = !!originalPrice;
  const originalFontSize = fontSize * 0.65;
  const lineGap = 4;

  let priceY: number;
  let originalY: number;

  if (hasOriginalPrice) {
    const totalTextHeight = fontSize + originalFontSize + lineGap;
    priceY = (height - totalTextHeight) / 2 + fontSize * 0.85;
    originalY = priceY + lineGap + originalFontSize * 0.85;
  } else {
    priceY = height / 2 + fontSize * 0.35;
    originalY = 0;
  }

  const backgroundRect = backgroundColor ? `
    <rect
      x="0" y="0"
      width="${width}" height="${height}"
      rx="${borderRadius}" ry="${borderRadius}"
      fill="${backgroundColor}"
    />
  ` : '';

  const fontStack = `${fontFamily}, -apple-system, sans-serif`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${backgroundRect}

  <text
    x="${width / 2}" y="${priceY}"
    text-anchor="middle"
    font-family="${fontStack}"
    font-size="${fontSize}"
    font-weight="${fontWeight}"
    fill="${priceColor}"
  >${escapeXml(price)}</text>

  ${hasOriginalPrice ? `
  <text
    x="${width / 2}" y="${originalY}"
    text-anchor="middle"
    font-family="${fontStack}"
    font-size="${originalFontSize}"
    font-weight="400"
    fill="${originalPriceColor}"
    text-decoration="line-through"
  >${escapeXml(originalPrice || '')}</text>
  ` : ''}
</svg>`;

  return Buffer.from(svg);
}

/**
 * Render shape as SVG buffer
 */
async function renderShape(
  element: ShapeElement,
  size: { width: number; height: number }
): Promise<Buffer> {
  const {
    shapeType,
    fillColor = 'transparent',
    strokeColor = '#000000',
    strokeWidth = 0,
    borderRadius = 0,
    lineEndpoints
  } = element;

  const { width, height } = size;
  let shapeContent: string;

  switch (shapeType) {
    case 'rectangle':
      shapeContent = `
        <rect
          x="${strokeWidth / 2}"
          y="${strokeWidth / 2}"
          width="${width - strokeWidth}"
          height="${height - strokeWidth}"
          rx="${borderRadius}"
          ry="${borderRadius}"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
        />
      `;
      break;

    case 'circle':
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) / 2 - strokeWidth / 2;
      shapeContent = `
        <circle
          cx="${cx}" cy="${cy}" r="${r}"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
        />
      `;
      break;

    case 'line':
      const x1 = lineEndpoints?.x1 ?? 0;
      const y1 = lineEndpoints?.y1 ?? 0;
      const x2 = lineEndpoints?.x2 ?? width;
      const y2 = lineEndpoints?.y2 ?? height;
      shapeContent = `
        <line
          x1="${x1}" y1="${y1}"
          x2="${x2}" y2="${y2}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth || 2}"
        />
      `;
      break;

    case 'triangle':
      const points = `${width / 2},0 ${width},${height} 0,${height}`;
      shapeContent = `
        <polygon
          points="${points}"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
        />
      `;
      break;

    default:
      shapeContent = '';
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${shapeContent}
</svg>`;

  return Buffer.from(svg);
}

/**
 * Render image/callout/logo element
 */
async function renderImageElement(
  element: ImageElement | CalloutElement | LogoElement,
  size: { width: number; height: number },
  imageBuffer: Buffer
): Promise<Buffer> {
  const { width, height } = size;

  // Get element-specific properties
  let borderWidth = 0;
  let borderColor = '#FFFFFF';
  let borderRadius = 0;
  let objectFit: 'cover' | 'contain' | 'fill' = 'cover';
  let zoom = 1;
  let focusX = 50;
  let focusY = 50;

  if (element.type === 'callout') {
    borderWidth = element.borderWidth;
    borderColor = element.borderColor;
    borderRadius = element.borderRadius;
    zoom = element.zoom;
    focusX = element.focusX;
    focusY = element.focusY;
  } else if (element.type === 'image') {
    borderWidth = element.borderWidth || 0;
    borderColor = element.borderColor || '#FFFFFF';
    borderRadius = element.borderRadius || 0;
    objectFit = element.objectFit;
  }

  const innerWidth = width - (borderWidth * 2);
  const innerHeight = height - (borderWidth * 2);
  const innerRadius = Math.max(0, borderRadius - borderWidth);

  // Apply zoom/transform to image
  let resized: Buffer;
  if (zoom > 1 && element.type === 'callout') {
    resized = await applyImageTransform(imageBuffer, innerWidth, innerHeight, zoom, focusX, focusY);
  } else {
    resized = await sharp(imageBuffer)
      .resize(innerWidth, innerHeight, {
        fit: objectFit === 'contain' ? 'inside' : objectFit === 'fill' ? 'fill' : 'cover',
        position: 'centre'
      })
      .ensureAlpha()
      .toBuffer();
  }

  // Apply rounded corners
  if (innerRadius > 0) {
    const roundedMask = Buffer.from(`
      <svg width="${innerWidth}" height="${innerHeight}">
        <rect
          width="${innerWidth}" height="${innerHeight}"
          rx="${innerRadius}" ry="${innerRadius}"
          fill="white"
        />
      </svg>
    `);

    resized = await sharp(resized)
      .composite([{ input: roundedMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  // Add border if specified
  if (borderWidth > 0) {
    const borderFrame = Buffer.from(`
      <svg width="${width}" height="${height}">
        <rect
          width="${width}" height="${height}"
          rx="${borderRadius}" ry="${borderRadius}"
          fill="${borderColor}"
        />
      </svg>
    `);

    return sharp(borderFrame)
      .composite([{
        input: resized,
        top: borderWidth,
        left: borderWidth
      }])
      .png()
      .toBuffer();
  }

  return resized;
}

// ============================================================================
// Main Render Functions
// ============================================================================

/**
 * Render a single element to a Sharp-compatible overlay
 */
async function renderElement(
  element: CanvasElement,
  canvas: CanvasConfig,
  imageBuffers: Map<string, Buffer>
): Promise<OverlayOptions | null> {
  if (!element.enabled) return null;

  const pos = resolvePosition(element.position, canvas.width, canvas.height);
  const size = resolveSize(element.size, canvas.width, canvas.height);

  let buffer: Buffer | null = null;

  try {
    switch (element.type) {
      case 'text':
        buffer = await renderTextElement(element, size);
        break;

      case 'cta-button':
        buffer = await renderCTAButton(element, size);
        break;

      case 'badge':
        buffer = await renderBadge(element);
        break;

      case 'price-tag':
        buffer = await renderPriceTag(element, size);
        break;

      case 'shape':
        buffer = await renderShape(element, size);
        break;

      case 'image':
      case 'callout':
      case 'logo': {
        const imageBuffer = imageBuffers.get(element.id);
        if (imageBuffer) {
          buffer = await renderImageElement(element, size, imageBuffer);
        }
        break;
      }

      case 'hero':
        // Hero is handled separately as base layer
        return null;
    }
  } catch (error) {
    console.error(`Error rendering element ${element.id}:`, error);
    return null;
  }

  if (!buffer) return null;

  // Apply rotation if specified
  if (element.rotation && element.rotation !== 0) {
    buffer = await sharp(buffer)
      .rotate(element.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
  }

  // Apply opacity if specified
  if (element.opacity !== undefined && element.opacity < 100) {
    const metadata = await sharp(buffer).metadata();
    const { data, info } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    // Modify alpha channel
    const alphaMultiplier = element.opacity / 100;
    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(data[i] * alphaMultiplier);
    }

    buffer = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
      .png()
      .toBuffer();
  }

  return {
    input: buffer,
    top: pos.y,
    left: pos.x,
    blend: 'over'
  };
}

// ============================================================================
// Main Composition Function
// ============================================================================

/**
 * Compose V2 - Main composition function
 * Accepts canvas config and array of elements, returns composed image
 */
export async function composeV2(request: ComposeV2Request): Promise<ComposeV2Result> {
  const startTime = Date.now();

  // Get canvas configuration
  const canvas = getCanvasConfig(
    request.canvas.aspectRatio,
    request.canvas.customWidth || request.canvas.customHeight
      ? { width: request.canvas.customWidth, height: request.canvas.customHeight }
      : undefined
  );

  // Get active elements
  const activeElements = getActiveElements(request.elements);

  // Resolve all image buffers upfront
  const imageBuffers = await resolveImageBuffers(activeElements);

  // 1. Create base canvas
  let compositeBase: Buffer;
  const heroElement = getHeroElement(activeElements) as HeroElement | undefined;

  if (heroElement && imageBuffers.has(heroElement.id)) {
    // Use hero image as base
    const heroBuffer = imageBuffers.get(heroElement.id)!;
    compositeBase = await applyImageTransform(
      heroBuffer,
      canvas.width,
      canvas.height,
      heroElement.zoom,
      heroElement.focusX,
      heroElement.focusY
    );
  } else {
    // Create solid color or transparent canvas
    compositeBase = await createCanvas(
      request.canvas.aspectRatio,
      { color: request.canvas.backgroundColor || '#000000' }
    );
  }

  // 2. Prepare all overlay elements
  const overlays: OverlayOptions[] = [];
  const nonHeroElements = getNonHeroElements(activeElements);

  // Render elements in parallel for performance
  const overlayPromises = nonHeroElements.map(element =>
    renderElement(element, canvas, imageBuffers)
  );

  const overlayResults = await Promise.all(overlayPromises);

  for (const overlay of overlayResults) {
    if (overlay) {
      overlays.push(overlay);
    }
  }

  // 3. Composite all layers
  let finalBuffer: Buffer;
  if (overlays.length > 0) {
    finalBuffer = await sharp(compositeBase)
      .composite(overlays)
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
  } else {
    finalBuffer = await sharp(compositeBase)
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
  }

  // 4. Convert to requested output format
  const outputFormat = request.output?.format || 'png';
  const quality = request.output?.quality || 90;

  let outputBuffer: Buffer;
  switch (outputFormat) {
    case 'jpeg':
      outputBuffer = await sharp(finalBuffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      break;
    case 'webp':
      outputBuffer = await sharp(finalBuffer)
        .webp({ quality })
        .toBuffer();
      break;
    default:
      outputBuffer = finalBuffer;
  }

  // 5. Generate output
  const imageId = generateId('creative');
  const mimeType = `image/${outputFormat}`;

  let imageUrl: string;
  let downloadUrl: string | undefined;

  if (request.output?.outputType === 'file') {
    const filename = request.output.filename || `${imageId}.${outputFormat}`;
    const publicPath = await saveToFile(outputBuffer, filename);
    imageUrl = publicPath;
    downloadUrl = publicPath;
  } else {
    imageUrl = bufferToBase64DataUrl(outputBuffer, mimeType);
    downloadUrl = imageUrl;
  }

  const compositionTime = Date.now() - startTime;
  console.log(`V2 Composition completed in ${compositionTime}ms, ${overlays.length + (heroElement ? 1 : 0)} elements rendered`);

  return {
    imageUrl,
    imageId,
    width: canvas.width,
    height: canvas.height,
    downloadUrl,
    elementsRendered: overlays.length + (heroElement ? 1 : 0),
    buffer: request.output?.outputType === 'buffer' ? outputBuffer : undefined
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Wrap text into multiple lines
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
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
 * Save buffer to public directory
 */
async function saveToFile(buffer: Buffer, filename: string): Promise<string> {
  const outputDir = path.join(process.cwd(), 'public', 'generated');

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, filename);
  await writeFile(filePath, buffer);

  return `/generated/${filename}`;
}

// ============================================================================
// Exports
// ============================================================================

export {
  renderTextElement,
  renderCTAButton,
  renderBadge,
  renderPriceTag,
  renderShape,
  renderImageElement,
  renderElement,
  resolveImageBuffers
};
