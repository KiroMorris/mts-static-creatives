// Canvas utility functions for V2 multi-aspect ratio support
// Handles dimension calculations, scaling, and coordinate conversions

import { ASPECT_RATIOS, AspectRatioId } from '@/types/canvas';

// ============================================================================
// Canvas Dimension Utilities
// ============================================================================

/**
 * Get canvas dimensions for an aspect ratio
 */
export function getCanvasDimensions(aspectRatio: AspectRatioId): { width: number; height: number } {
  const config = ASPECT_RATIOS[aspectRatio];
  return { width: config.width, height: config.height };
}

/**
 * Get the aspect ratio numeric value (width / height)
 */
export function getAspectRatioValue(aspectRatio: AspectRatioId): number {
  return ASPECT_RATIOS[aspectRatio].ratio;
}

// ============================================================================
// Scale Calculation Utilities
// ============================================================================

/**
 * Calculate scale factor to fit canvas in container while maintaining aspect ratio
 *
 * @param aspectRatio - The aspect ratio ID (e.g., '9:16', '1:1')
 * @param containerWidth - Available container width in pixels
 * @param containerHeight - Available container height in pixels
 * @param padding - Padding to apply around the canvas (default: 40)
 * @returns Scale factor (e.g., 0.5 means the canvas is rendered at 50% size)
 */
export function calculateCanvasScale(
  aspectRatio: AspectRatioId,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): number {
  const { width, height } = getCanvasDimensions(aspectRatio);
  const availableWidth = containerWidth - padding;
  const availableHeight = containerHeight - padding;

  const scaleByWidth = availableWidth / width;
  const scaleByHeight = availableHeight / height;

  // Use the smaller scale to ensure canvas fits within container
  // Never scale up beyond 1 (original size)
  return Math.min(scaleByWidth, scaleByHeight, 1);
}

/**
 * Calculate the scaled dimensions of the canvas for rendering
 */
export function getScaledCanvasDimensions(
  aspectRatio: AspectRatioId,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): { width: number; height: number; scale: number } {
  const { width, height } = getCanvasDimensions(aspectRatio);
  const scale = calculateCanvasScale(aspectRatio, containerWidth, containerHeight, padding);

  return {
    width: width * scale,
    height: height * scale,
    scale,
  };
}

// ============================================================================
// Coordinate Conversion Utilities
// ============================================================================

/**
 * Convert canvas coordinates to screen coordinates
 * Used when rendering elements in the scaled preview
 *
 * @param canvasX - X coordinate in canvas space
 * @param canvasY - Y coordinate in canvas space
 * @param scale - Current canvas scale factor
 * @param offsetX - Optional X offset (for panned views)
 * @param offsetY - Optional Y offset (for panned views)
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  scale: number,
  offsetX: number = 0,
  offsetY: number = 0
): { x: number; y: number } {
  return {
    x: canvasX * scale + offsetX,
    y: canvasY * scale + offsetY,
  };
}

/**
 * Convert screen coordinates to canvas coordinates
 * Used when handling mouse/touch events on the canvas
 *
 * @param screenX - X coordinate in screen space
 * @param screenY - Y coordinate in screen space
 * @param scale - Current canvas scale factor
 * @param offsetX - Optional X offset (for panned views)
 * @param offsetY - Optional Y offset (for panned views)
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  scale: number,
  offsetX: number = 0,
  offsetY: number = 0
): { x: number; y: number } {
  return {
    x: (screenX - offsetX) / scale,
    y: (screenY - offsetY) / scale,
  };
}

/**
 * Scale a size value from canvas to screen coordinates
 */
export function scaleSize(
  canvasSize: number,
  scale: number
): number {
  return canvasSize * scale;
}

/**
 * Scale a size value from screen to canvas coordinates
 */
export function unscaleSize(
  screenSize: number,
  scale: number
): number {
  return screenSize / scale;
}

// ============================================================================
// Bounds Utilities
// ============================================================================

/**
 * Clamp a position to stay within canvas bounds
 */
export function clampToCanvas(
  x: number,
  y: number,
  elementWidth: number,
  elementHeight: number,
  aspectRatio: AspectRatioId
): { x: number; y: number } {
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(aspectRatio);

  return {
    x: Math.max(0, Math.min(x, canvasWidth - elementWidth)),
    y: Math.max(0, Math.min(y, canvasHeight - elementHeight)),
  };
}

/**
 * Check if a point is within canvas bounds
 */
export function isWithinCanvas(
  x: number,
  y: number,
  aspectRatio: AspectRatioId
): boolean {
  const { width, height } = getCanvasDimensions(aspectRatio);
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

/**
 * Check if an element bounds is fully within canvas bounds
 */
export function isElementWithinCanvas(
  x: number,
  y: number,
  width: number,
  height: number,
  aspectRatio: AspectRatioId
): boolean {
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(aspectRatio);
  return x >= 0 && y >= 0 && x + width <= canvasWidth && y + height <= canvasHeight;
}

// ============================================================================
// Center Calculation Utilities
// ============================================================================

/**
 * Calculate the center point of the canvas
 */
export function getCanvasCenter(aspectRatio: AspectRatioId): { x: number; y: number } {
  const { width, height } = getCanvasDimensions(aspectRatio);
  return {
    x: width / 2,
    y: height / 2,
  };
}

/**
 * Center an element on the canvas
 */
export function centerElement(
  elementWidth: number,
  elementHeight: number,
  aspectRatio: AspectRatioId
): { x: number; y: number } {
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(aspectRatio);
  return {
    x: (canvasWidth - elementWidth) / 2,
    y: (canvasHeight - elementHeight) / 2,
  };
}
