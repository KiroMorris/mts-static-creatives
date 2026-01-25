/**
 * V2 Shape Renderer
 * Renders geometric shapes: rectangles, circles, lines, triangles
 */

import sharp from 'sharp';

// ============================================================================
// Types
// ============================================================================

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'triangle';

export interface LineEndpoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  enabled: boolean;
  position: { x: number; y: number; unit: 'px' | '%' };
  size: { width: number; height: number; unit: 'px' | '%' };
  zIndex: number;
  opacity?: number;
  rotation?: number;

  // Shape properties
  shapeType: ShapeType;
  fillColor?: string;          // null or transparent = no fill
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;       // For rectangles only

  // Line-specific endpoints (relative to shape position)
  lineEndpoints?: LineEndpoints;

  // Optional shadow
  shadow?: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

export interface RenderSize {
  width: number;
  height: number;
}

// ============================================================================
// Main Render Function
// ============================================================================

/**
 * Render geometric shape to PNG buffer
 */
export async function renderShape(
  element: ShapeElement,
  size: RenderSize
): Promise<Buffer> {
  const {
    shapeType,
    fillColor = 'transparent',
    strokeColor = '#000000',
    strokeWidth = 0,
    borderRadius = 0,
    lineEndpoints,
    shadow,
    opacity = 100
  } = element;

  const { width, height } = size;

  // Build shadow filter if enabled
  const shadowFilter = shadow?.enabled ? `
    <filter id="shapeShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow
        dx="${shadow.offsetX}"
        dy="${shadow.offsetY}"
        stdDeviation="${shadow.blur}"
        flood-color="${shadow.color}"
      />
    </filter>
  ` : '';

  const filterAttr = shadow?.enabled ? 'filter="url(#shapeShadow)"' : '';

  let shapeContent: string;

  switch (shapeType) {
    case 'rectangle':
      shapeContent = renderRectangle(width, height, fillColor, strokeColor, strokeWidth, borderRadius, filterAttr);
      break;

    case 'circle':
      shapeContent = renderCircle(width, height, fillColor, strokeColor, strokeWidth, filterAttr);
      break;

    case 'line':
      shapeContent = renderLine(width, height, lineEndpoints, strokeColor, strokeWidth, filterAttr);
      break;

    case 'triangle':
      shapeContent = renderTriangle(width, height, fillColor, strokeColor, strokeWidth, filterAttr);
      break;

    default:
      shapeContent = '';
  }

  // Calculate SVG opacity
  const svgOpacity = opacity < 100 ? `opacity="${opacity / 100}"` : '';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${shadowFilter}
  </defs>
  <g ${svgOpacity}>
    ${shapeContent}
  </g>
</svg>`;

  // Convert SVG to PNG buffer using Sharp
  const svgBuffer = Buffer.from(svg);

  return sharp(svgBuffer)
    .png()
    .toBuffer();
}

// ============================================================================
// Shape Renderers
// ============================================================================

/**
 * Render rectangle shape
 */
function renderRectangle(
  width: number,
  height: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
  borderRadius: number,
  filterAttr: string
): string {
  const x = strokeWidth / 2;
  const y = strokeWidth / 2;
  const rectWidth = width - strokeWidth;
  const rectHeight = height - strokeWidth;

  return `
    <rect
      x="${x}"
      y="${y}"
      width="${rectWidth}"
      height="${rectHeight}"
      rx="${borderRadius}"
      ry="${borderRadius}"
      fill="${fillColor}"
      stroke="${strokeWidth > 0 ? strokeColor : 'none'}"
      stroke-width="${strokeWidth}"
      ${filterAttr}
    />
  `;
}

/**
 * Render circle/ellipse shape
 */
function renderCircle(
  width: number,
  height: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
  filterAttr: string
): string {
  const cx = width / 2;
  const cy = height / 2;

  // If width equals height, render a circle; otherwise render an ellipse
  if (width === height) {
    const r = (Math.min(width, height) / 2) - (strokeWidth / 2);
    return `
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${r}"
        fill="${fillColor}"
        stroke="${strokeWidth > 0 ? strokeColor : 'none'}"
        stroke-width="${strokeWidth}"
        ${filterAttr}
      />
    `;
  }

  // Ellipse
  const rx = (width / 2) - (strokeWidth / 2);
  const ry = (height / 2) - (strokeWidth / 2);

  return `
    <ellipse
      cx="${cx}"
      cy="${cy}"
      rx="${rx}"
      ry="${ry}"
      fill="${fillColor}"
      stroke="${strokeWidth > 0 ? strokeColor : 'none'}"
      stroke-width="${strokeWidth}"
      ${filterAttr}
    />
  `;
}

/**
 * Render line shape
 */
function renderLine(
  width: number,
  height: number,
  endpoints: LineEndpoints | undefined,
  strokeColor: string,
  strokeWidth: number,
  filterAttr: string
): string {
  // Default to diagonal line if no endpoints specified
  const x1 = endpoints?.x1 ?? 0;
  const y1 = endpoints?.y1 ?? 0;
  const x2 = endpoints?.x2 ?? width;
  const y2 = endpoints?.y2 ?? height;

  // Line must have stroke to be visible
  const actualStrokeWidth = strokeWidth || 2;

  return `
    <line
      x1="${x1}"
      y1="${y1}"
      x2="${x2}"
      y2="${y2}"
      stroke="${strokeColor}"
      stroke-width="${actualStrokeWidth}"
      stroke-linecap="round"
      ${filterAttr}
    />
  `;
}

/**
 * Render triangle shape (equilateral, pointing up)
 */
function renderTriangle(
  width: number,
  height: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
  filterAttr: string
): string {
  // Calculate triangle points (equilateral, centered)
  const offset = strokeWidth / 2;

  // Top point
  const topX = width / 2;
  const topY = offset;

  // Bottom left
  const bottomLeftX = offset;
  const bottomLeftY = height - offset;

  // Bottom right
  const bottomRightX = width - offset;
  const bottomRightY = height - offset;

  const points = `${topX},${topY} ${bottomRightX},${bottomRightY} ${bottomLeftX},${bottomLeftY}`;

  return `
    <polygon
      points="${points}"
      fill="${fillColor}"
      stroke="${strokeWidth > 0 ? strokeColor : 'none'}"
      stroke-width="${strokeWidth}"
      stroke-linejoin="round"
      ${filterAttr}
    />
  `;
}

// ============================================================================
// Shape Factory Functions
// ============================================================================

/**
 * Create a horizontal line element
 */
export function createHorizontalLine(
  width: number,
  strokeColor: string = '#000000',
  strokeWidth: number = 2
): Partial<ShapeElement> {
  return {
    shapeType: 'line',
    size: { width, height: strokeWidth, unit: 'px' },
    strokeColor,
    strokeWidth,
    lineEndpoints: { x1: 0, y1: strokeWidth / 2, x2: width, y2: strokeWidth / 2 }
  };
}

/**
 * Create a vertical line element
 */
export function createVerticalLine(
  height: number,
  strokeColor: string = '#000000',
  strokeWidth: number = 2
): Partial<ShapeElement> {
  return {
    shapeType: 'line',
    size: { width: strokeWidth, height, unit: 'px' },
    strokeColor,
    strokeWidth,
    lineEndpoints: { x1: strokeWidth / 2, y1: 0, x2: strokeWidth / 2, y2: height }
  };
}

/**
 * Create a divider line (horizontal with padding)
 */
export function createDivider(
  width: number,
  strokeColor: string = 'rgba(255,255,255,0.3)',
  strokeWidth: number = 1
): Partial<ShapeElement> {
  return createHorizontalLine(width, strokeColor, strokeWidth);
}

export default renderShape;
