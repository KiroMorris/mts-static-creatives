/**
 * V2 Element Renderers Index
 * Exports all renderers with a unified dispatch function
 */

import sharp, { OverlayOptions } from 'sharp';

// Import individual renderers
import { renderText, TextElement } from './text-renderer';
import { renderCTAButton, CTAButtonElement } from './button-renderer';
import { renderBadge, BadgeElement } from './badge-renderer';
import { renderPriceTag, PriceTagElement } from './price-renderer';
import { renderShape, ShapeElement } from './shape-renderer';
import { renderImage, ImageElement, LogoElement, CalloutElement } from './image-renderer';

// Re-export all renderers
export { renderText } from './text-renderer';
export type { TextElement } from './text-renderer';
export { renderCTAButton } from './button-renderer';
export type { CTAButtonElement } from './button-renderer';
export { renderBadge } from './badge-renderer';
export type { BadgeElement } from './badge-renderer';
export { renderPriceTag } from './price-renderer';
export type { PriceTagElement } from './price-renderer';
export { renderShape } from './shape-renderer';
export type { ShapeElement } from './shape-renderer';
export { renderImage } from './image-renderer';
export type { ImageElement, LogoElement, CalloutElement } from './image-renderer';

// ============================================================================
// Shared Types
// ============================================================================

export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';

export interface CanvasConfig {
  id: AspectRatio;
  width: number;
  height: number;
  label: string;
  platform: string[];
}

export interface Position {
  x: number;
  y: number;
  unit: 'px' | '%';
}

export interface Size {
  width: number;
  height: number;
  unit: 'px' | '%';
}

export interface BaseElement {
  id: string;
  type: ElementType;
  enabled: boolean;
  position: Position;
  size: Size;
  zIndex: number;
  opacity?: number;
  rotation?: number;
  locked?: boolean;
  name?: string;
}

export type ElementType =
  | 'hero'
  | 'image'
  | 'callout'
  | 'text'
  | 'cta-button'
  | 'badge'
  | 'price-tag'
  | 'shape'
  | 'logo';

// Hero element (handled separately as base layer)
export interface HeroElement extends BaseElement {
  type: 'hero';
  imageBuffer?: Buffer;
  imageUrl?: string;
  zoom: number;
  focusX: number;
  focusY: number;
  backgroundRemoved?: boolean;
  originalImageBuffer?: Buffer;
}

// Union type for all canvas elements
export type CanvasElement =
  | HeroElement
  | ImageElement
  | CalloutElement
  | TextElement
  | CTAButtonElement
  | BadgeElement
  | PriceTagElement
  | ShapeElement
  | LogoElement;

// ============================================================================
// Canvas Presets
// ============================================================================

export const CANVAS_PRESETS: Record<AspectRatio, CanvasConfig> = {
  '9:16': {
    id: '9:16',
    width: 1080,
    height: 1920,
    label: 'Story / Reels',
    platform: ['Instagram Stories', 'TikTok', 'YouTube Shorts']
  },
  '1:1': {
    id: '1:1',
    width: 1080,
    height: 1080,
    label: 'Square',
    platform: ['Instagram Feed', 'Facebook', 'LinkedIn']
  },
  '4:5': {
    id: '4:5',
    width: 1080,
    height: 1350,
    label: 'Portrait',
    platform: ['Instagram Feed (Portrait)', 'Pinterest']
  },
  '16:9': {
    id: '16:9',
    width: 1920,
    height: 1080,
    label: 'Landscape',
    platform: ['YouTube', 'Twitter/X', 'LinkedIn Banner']
  }
};

// ============================================================================
// Position & Size Resolution
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
    return { x: Math.round(position.x), y: Math.round(position.y) };
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

// ============================================================================
// Main Dispatch Function
// ============================================================================

/**
 * Render a single element to a Sharp-compatible overlay
 * Returns null for disabled elements or hero (handled separately)
 */
export async function renderElement(
  element: CanvasElement,
  canvas: CanvasConfig
): Promise<OverlayOptions | null> {
  if (!element.enabled) return null;

  const pos = resolvePosition(element.position, canvas.width, canvas.height);
  const size = resolveSize(element.size, canvas.width, canvas.height);

  let buffer: Buffer | null = null;

  try {
    switch (element.type) {
      case 'text':
        buffer = await renderText(element as TextElement, size);
        break;

      case 'cta-button':
        buffer = await renderCTAButton(element as CTAButtonElement, size);
        break;

      case 'badge':
        buffer = await renderBadge(element as BadgeElement, size);
        break;

      case 'price-tag':
        buffer = await renderPriceTag(element as PriceTagElement, size);
        break;

      case 'shape':
        buffer = await renderShape(element as ShapeElement, size);
        break;

      case 'image':
      case 'logo':
      case 'callout':
        buffer = await renderImage(
          element as ImageElement | LogoElement | CalloutElement,
          size
        );
        break;

      case 'hero':
        // Hero is handled separately as base layer
        return null;

      default:
        console.warn(`Unknown element type: ${(element as BaseElement).type}`);
        return null;
    }
  } catch (error) {
    console.error(`Failed to render element ${element.id}:`, error);
    return null;
  }

  if (!buffer) return null;

  // Apply rotation if specified
  if (element.rotation && element.rotation !== 0) {
    buffer = await sharp(buffer)
      .rotate(element.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
  }

  return {
    input: buffer,
    top: pos.y,
    left: pos.x,
    blend: 'over'
  };
}

/**
 * Render multiple elements in parallel batches
 */
export async function renderElements(
  elements: CanvasElement[],
  canvas: CanvasConfig,
  batchSize: number = 5
): Promise<OverlayOptions[]> {
  const overlays: OverlayOptions[] = [];

  // Sort by z-index (lower renders first / bottom layer)
  const sortedElements = [...elements]
    .filter(el => el.enabled && el.type !== 'hero')
    .sort((a, b) => a.zIndex - b.zIndex);

  // Process in batches to avoid memory spikes
  for (let i = 0; i < sortedElements.length; i += batchSize) {
    const batch = sortedElements.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(el => renderElement(el, canvas))
    );

    for (const result of batchResults) {
      if (result) {
        overlays.push(result);
      }
    }
  }

  return overlays;
}

// ============================================================================
// Element Filtering
// ============================================================================

/**
 * Filter elements by enabled state and sort by z-index
 */
export function getActiveElements<T extends BaseElement>(elements: T[]): T[] {
  return elements
    .filter(el => el.enabled)
    .sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Toggle element visibility
 */
export function toggleElement<T extends BaseElement>(
  elements: T[],
  elementId: string,
  enabled?: boolean
): T[] {
  return elements.map(el => {
    if (el.id === elementId) {
      return { ...el, enabled: enabled ?? !el.enabled };
    }
    return el;
  });
}

/**
 * Update element z-index
 */
export function updateElementZIndex<T extends BaseElement>(
  elements: T[],
  elementId: string,
  direction: 'up' | 'down' | 'top' | 'bottom'
): T[] {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const index = sorted.findIndex(el => el.id === elementId);

  if (index === -1) return elements;

  const element = sorted[index];
  let newIndex: number;

  switch (direction) {
    case 'up':
      newIndex = Math.min(index + 1, sorted.length - 1);
      break;
    case 'down':
      newIndex = Math.max(index - 1, 0);
      break;
    case 'top':
      newIndex = sorted.length - 1;
      break;
    case 'bottom':
      newIndex = 0;
      break;
  }

  // Remove and reinsert
  sorted.splice(index, 1);
  sorted.splice(newIndex, 0, element);

  // Reassign z-index values
  return sorted.map((el, i) => ({ ...el, zIndex: i }));
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  renderElement,
  renderElements,
  renderText,
  renderCTAButton,
  renderBadge,
  renderPriceTag,
  renderShape,
  renderImage,
  resolvePosition,
  resolveSize,
  getActiveElements,
  toggleElement,
  updateElementZIndex,
  CANVAS_PRESETS
};
