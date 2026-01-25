// Canvas Creation and Sizing Utilities for V2 Sharp Composer
// Handles canvas creation, sizing, and position/size resolution

import sharp from 'sharp';
import {
  AspectRatio,
  CanvasConfig,
  CANVAS_PRESETS,
  Position,
  Size
} from './types';

// ============================================================================
// Canvas Creation
// ============================================================================

/**
 * Create a blank canvas with optional background color or image
 */
export async function createCanvas(
  aspectRatio: AspectRatio,
  background?: { color?: string; imageBuffer?: Buffer },
  customDimensions?: { width?: number; height?: number }
): Promise<Buffer> {
  const preset = CANVAS_PRESETS[aspectRatio];
  const width = customDimensions?.width || preset.width;
  const height = customDimensions?.height || preset.height;

  if (background?.imageBuffer) {
    // Resize background image to cover canvas
    return sharp(background.imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'centre'
      })
      .png()
      .toBuffer();
  }

  // Create solid color canvas
  const color = background?.color || '#000000';
  const { r, g, b, alpha } = hexToRgba(color);

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha }
    }
  })
    .png()
    .toBuffer();
}

/**
 * Create a transparent canvas
 */
export async function createTransparentCanvas(
  width: number,
  height: number
): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .png()
    .toBuffer();
}

/**
 * Get canvas configuration for an aspect ratio
 */
export function getCanvasConfig(
  aspectRatio: AspectRatio,
  customDimensions?: { width?: number; height?: number }
): CanvasConfig {
  const preset = CANVAS_PRESETS[aspectRatio];

  if (customDimensions?.width || customDimensions?.height) {
    return {
      ...preset,
      width: customDimensions.width || preset.width,
      height: customDimensions.height || preset.height
    };
  }

  return preset;
}

/**
 * Validate canvas dimensions
 */
export function validateCanvasDimensions(
  width: number,
  height: number,
  minDimension: number = 540
): { valid: boolean; error?: string } {
  if (width < minDimension || height < minDimension) {
    return {
      valid: false,
      error: `Canvas dimensions must be at least ${minDimension}px on the shortest side`
    };
  }

  if (width > 4096 || height > 4096) {
    return {
      valid: false,
      error: 'Canvas dimensions cannot exceed 4096px'
    };
  }

  return { valid: true };
}

// ============================================================================
// Position and Size Resolution
// ============================================================================

/**
 * Convert position to absolute pixels based on canvas dimensions
 */
export function resolvePosition(
  position: Position,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  if (position.unit === 'px') {
    return {
      x: Math.round(position.x),
      y: Math.round(position.y)
    };
  }

  // Convert percentage to pixels
  return {
    x: Math.round((position.x / 100) * canvasWidth),
    y: Math.round((position.y / 100) * canvasHeight)
  };
}

/**
 * Resolve size to absolute pixels
 */
export function resolveSize(
  size: Size,
  canvasWidth: number,
  canvasHeight: number
): { width: number; height: number } {
  if (size.unit === 'px') {
    return {
      width: Math.round(size.width),
      height: Math.round(size.height)
    };
  }

  return {
    width: Math.round((size.width / 100) * canvasWidth),
    height: Math.round((size.height / 100) * canvasHeight)
  };
}

/**
 * Convert absolute pixels to percentage
 */
export function toPercentage(
  pixels: number,
  total: number
): number {
  return (pixels / total) * 100;
}

/**
 * Convert percentage to absolute pixels
 */
export function toPixels(
  percentage: number,
  total: number
): number {
  return Math.round((percentage / 100) * total);
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Convert hex color to RGBA values
 */
export function hexToRgba(hex: string): { r: number; g: number; b: number; alpha: number } {
  // Handle rgba format
  const rgbaMatch = hex.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      alpha: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    };
  }

  // Handle hex format
  const cleanHex = hex.replace('#', '');

  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
      alpha: 1
    };
  }

  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.slice(0, 2), 16),
      g: parseInt(cleanHex.slice(2, 4), 16),
      b: parseInt(cleanHex.slice(4, 6), 16),
      alpha: 1
    };
  }

  // Handle 8-digit hex (with alpha)
  if (cleanHex.length === 8) {
    return {
      r: parseInt(cleanHex.slice(0, 2), 16),
      g: parseInt(cleanHex.slice(2, 4), 16),
      b: parseInt(cleanHex.slice(4, 6), 16),
      alpha: parseInt(cleanHex.slice(6, 8), 16) / 255
    };
  }

  // Default to black
  return { r: 0, g: 0, b: 0, alpha: 1 };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ============================================================================
// Hero Transform Utilities
// ============================================================================

/**
 * Apply zoom and focus to an image (for hero images)
 * Matches CSS object-fit: cover behavior with zoom support
 */
export async function applyImageTransform(
  imageBuffer: Buffer,
  targetWidth: number,
  targetHeight: number,
  zoom: number = 1,
  focusX: number = 50,
  focusY: number = 50
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const imgWidth = metadata.width || targetWidth;
  const imgHeight = metadata.height || targetHeight;

  if (zoom <= 1) {
    // No zoom - use Sharp's built-in cover
    return sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'centre'
      })
      .toBuffer();
  }

  // Calculate crop region for zoom
  const cropWidth = Math.round(imgWidth / zoom);
  const cropHeight = Math.round(imgHeight / zoom);

  // Calculate crop position based on focus point
  const maxLeft = Math.max(0, imgWidth - cropWidth);
  const maxTop = Math.max(0, imgHeight - cropHeight);
  const left = Math.round((focusX / 100) * maxLeft);
  const top = Math.round((focusY / 100) * maxTop);

  // Extract zoomed region and resize to target
  return sharp(imageBuffer)
    .extract({
      left: Math.max(0, Math.min(left, imgWidth - cropWidth)),
      top: Math.max(0, Math.min(top, imgHeight - cropHeight)),
      width: cropWidth,
      height: cropHeight
    })
    .resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'centre'
    })
    .toBuffer();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate unique ID with optional prefix
 */
export function generateId(prefix: string = 'v2'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Convert buffer to base64 data URL
 */
export function bufferToBase64DataUrl(buffer: Buffer, mimeType: string = 'image/png'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Escape special XML characters for SVG text
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if element is within canvas bounds
 */
export function isWithinBounds(
  position: { x: number; y: number },
  size: { width: number; height: number },
  canvasWidth: number,
  canvasHeight: number
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + size.width <= canvasWidth &&
    position.y + size.height <= canvasHeight
  );
}

/**
 * Normalize image for consistent processing
 * Auto-rotates based on EXIF, ensures sRGB color space
 */
export async function normalizeImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .rotate()                    // Auto-rotate based on EXIF
    .toColorspace('srgb')        // Ensure sRGB
    .png()
    .toBuffer();
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imageBuffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
}> {
  const metadata = await sharp(imageBuffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    hasAlpha: metadata.hasAlpha || false
  };
}
