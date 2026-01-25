/**
 * V2 Image Renderer
 * Renders logo and generic image elements with borders, rounded corners, and object-fit
 */

import sharp from 'sharp';

// ============================================================================
// Types
// ============================================================================

export type ObjectFit = 'cover' | 'contain' | 'fill';

export interface ImageElement {
  id: string;
  type: 'image';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Image source (one required)
  imageBuffer?: Buffer;
  imageUrl?: string;

  // Styling
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  objectFit?: ObjectFit;

  // Shadow
  shadow?: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

export interface LogoElement {
  id: string;
  type: 'logo';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Image source (one required)
  imageBuffer?: Buffer;
  imageUrl?: string;

  // Logos maintain aspect ratio by default
  maintainAspectRatio?: boolean;
}

export interface CalloutElement {
  id: string;
  type: 'callout';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Image source
  imageBuffer?: Buffer;
  imageUrl?: string;

  // Border styling
  borderWidth: number;
  borderColor: string;
  borderRadius: number;

  // Zoom and focus
  zoom: number;
  focusX: number;
  focusY: number;

  // Optional label
  label?: string;
}

export interface RenderSize {
  width: number;
  height: number;
}

// ============================================================================
// Image Render Function
// ============================================================================

/**
 * Render generic image element to PNG buffer
 */
export async function renderImage(
  element: ImageElement | LogoElement | CalloutElement,
  size: RenderSize
): Promise<Buffer> {
  if (!element.imageBuffer) {
    throw new Error(`Image element ${element.id} has no imageBuffer`);
  }

  const { width, height } = size;
  const opacity = element.opacity ?? 100;

  // Handle based on element type
  switch (element.type) {
    case 'logo':
      return renderLogo(element as LogoElement, size);
    case 'callout':
      return renderCallout(element as CalloutElement, size);
    default:
      return renderGenericImage(element as ImageElement, size);
  }
}

/**
 * Render generic image with borders and object-fit
 */
async function renderGenericImage(
  element: ImageElement,
  size: RenderSize
): Promise<Buffer> {
  const {
    imageBuffer,
    borderRadius = 0,
    borderWidth = 0,
    borderColor = '#FFFFFF',
    objectFit = 'cover',
    opacity = 100,
    shadow
  } = element;

  if (!imageBuffer) {
    throw new Error('No image buffer provided');
  }

  const { width, height } = size;

  // Calculate inner dimensions (accounting for border)
  const innerWidth = width - (borderWidth * 2);
  const innerHeight = height - (borderWidth * 2);
  const innerRadius = Math.max(0, borderRadius - borderWidth);

  // Resize image according to objectFit
  let resized = await sharp(imageBuffer)
    .resize(innerWidth, innerHeight, {
      fit: objectFit === 'fill' ? 'fill' : objectFit,
      position: 'centre'
    })
    .ensureAlpha()
    .toBuffer();

  // Apply rounded corners if needed
  if (innerRadius > 0) {
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

    resized = await sharp(resized)
      .composite([{ input: roundedMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  // If no border, apply opacity and return
  if (borderWidth === 0) {
    if (opacity < 100) {
      return sharp(resized)
        .composite([{
          input: Buffer.from([255, 255, 255, Math.round((opacity / 100) * 255)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();
    }
    return resized;
  }

  // Create border frame as SVG
  const borderFrame = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect
        width="${width}"
        height="${height}"
        rx="${borderRadius}"
        ry="${borderRadius}"
        fill="${borderColor}"
      />
    </svg>
  `);

  // Composite: border frame + rounded image inside
  let result = await sharp(borderFrame)
    .composite([{
      input: resized,
      top: borderWidth,
      left: borderWidth
    }])
    .png()
    .toBuffer();

  // Apply opacity if needed
  if (opacity < 100) {
    result = await sharp(result)
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round((opacity / 100) * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
  }

  return result;
}

/**
 * Render logo element with aspect ratio preservation
 */
async function renderLogo(
  element: LogoElement,
  size: RenderSize
): Promise<Buffer> {
  const {
    imageBuffer,
    maintainAspectRatio = true,
    opacity = 100
  } = element;

  if (!imageBuffer) {
    throw new Error('No image buffer provided for logo');
  }

  const { width, height } = size;

  // Resize logo
  let resized = await sharp(imageBuffer)
    .resize(width, height, {
      fit: maintainAspectRatio ? 'contain' : 'fill',
      position: 'centre',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  // Apply opacity if needed
  if (opacity < 100) {
    resized = await sharp(resized)
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round((opacity / 100) * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
  }

  return resized;
}

/**
 * Render callout element with zoom, focus, and border
 */
async function renderCallout(
  element: CalloutElement,
  size: RenderSize
): Promise<Buffer> {
  const {
    imageBuffer,
    borderWidth,
    borderColor,
    borderRadius,
    zoom = 1,
    focusX = 50,
    focusY = 50,
    opacity = 100
  } = element;

  if (!imageBuffer) {
    throw new Error('No image buffer provided for callout');
  }

  const { width, height } = size;

  // Calculate inner dimensions
  const innerWidth = width - (borderWidth * 2);
  const innerHeight = height - (borderWidth * 2);
  const innerRadius = Math.max(0, borderRadius - borderWidth);

  // Get metadata for zoom calculation
  const metadata = await sharp(imageBuffer).metadata();
  const imgWidth = metadata.width || innerWidth;
  const imgHeight = metadata.height || innerHeight;

  let resized: Buffer;

  if (zoom > 1) {
    // Calculate crop region for zoom with focus point
    const cropSize = Math.round(Math.min(imgWidth, imgHeight) / zoom);
    const maxLeft = Math.max(0, imgWidth - cropSize);
    const maxTop = Math.max(0, imgHeight - cropSize);
    const left = Math.round((focusX / 100) * maxLeft);
    const top = Math.round((focusY / 100) * maxTop);

    resized = await sharp(imageBuffer)
      .extract({
        left: Math.max(0, Math.min(left, imgWidth - cropSize)),
        top: Math.max(0, Math.min(top, imgHeight - cropSize)),
        width: Math.min(cropSize, imgWidth - left),
        height: Math.min(cropSize, imgHeight - top)
      })
      .resize(innerWidth, innerHeight, { fit: 'cover' })
      .ensureAlpha()
      .toBuffer();
  } else {
    resized = await sharp(imageBuffer)
      .resize(innerWidth, innerHeight, {
        fit: 'cover',
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
          width="${innerWidth}"
          height="${innerHeight}"
          rx="${innerRadius}"
          ry="${innerRadius}"
          fill="white"
        />
      </svg>
    `);

    resized = await sharp(resized)
      .composite([{ input: roundedMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  // If no border, apply opacity and return
  if (borderWidth === 0) {
    if (opacity < 100) {
      return sharp(resized)
        .composite([{
          input: Buffer.from([255, 255, 255, Math.round((opacity / 100) * 255)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();
    }
    return resized;
  }

  // Create border frame as SVG
  const borderFrame = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect
        width="${width}"
        height="${height}"
        rx="${borderRadius}"
        ry="${borderRadius}"
        fill="${borderColor}"
      />
    </svg>
  `);

  // Composite: border frame + rounded image inside
  let result = await sharp(borderFrame)
    .composite([{
      input: resized,
      top: borderWidth,
      left: borderWidth
    }])
    .png()
    .toBuffer();

  // Apply opacity if needed
  if (opacity < 100) {
    result = await sharp(result)
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round((opacity / 100) * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
  }

  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Fetch image from URL and return as buffer
 */
export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  // Handle data URLs
  if (url.startsWith('data:')) {
    const matches = url.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid data URL format');
    }
    return Buffer.from(matches[2], 'base64');
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0
  };
}

/**
 * Calculate aspect-ratio-preserved dimensions
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  fit: 'contain' | 'cover' = 'contain'
): { width: number; height: number } {
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;

  const ratio = fit === 'contain'
    ? Math.min(widthRatio, heightRatio)
    : Math.max(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
}

export default renderImage;
