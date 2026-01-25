// Canvas & Layout System Types for V2
// This file contains all canvas-related TypeScript interfaces

// ============================================================================
// Aspect Ratio Types
// ============================================================================

export type AspectRatioId = '9:16' | '1:1' | '4:5' | '16:9';

export interface AspectRatioConfig {
  id: AspectRatioId;
  name: string;
  width: number;
  height: number;
  ratio: number; // width / height
  icon: string; // Lucide icon name or custom SVG
  description: string;
}

export const ASPECT_RATIOS: Record<AspectRatioId, AspectRatioConfig> = {
  '9:16': {
    id: '9:16',
    name: 'Stories',
    width: 1080,
    height: 1920,
    ratio: 9 / 16,
    icon: 'smartphone',
    description: 'Instagram/TikTok Stories & Reels',
  },
  '1:1': {
    id: '1:1',
    name: 'Square',
    width: 1080,
    height: 1080,
    ratio: 1,
    icon: 'square',
    description: 'Instagram Feed, Facebook',
  },
  '4:5': {
    id: '4:5',
    name: 'Portrait',
    width: 1080,
    height: 1350,
    ratio: 4 / 5,
    icon: 'rectangle-vertical',
    description: 'Instagram Portrait Feed',
  },
  '16:9': {
    id: '16:9',
    name: 'Banner',
    width: 1920,
    height: 1080,
    ratio: 16 / 9,
    icon: 'monitor',
    description: 'YouTube, Web Banners',
  },
};

// ============================================================================
// Position & Size Types
// ============================================================================

export interface Position {
  x: number; // Canvas X coordinate (0 to canvas.width)
  y: number; // Canvas Y coordinate (0 to canvas.height)
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// Canvas Element Types
// ============================================================================

export type ElementType = 'hero' | 'text' | 'callout' | 'shape' | 'image';

export interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  rotation?: number;
  opacity?: number;
}

// Specific element types extend base
export interface HeroElement extends CanvasElement {
  type: 'hero';
  imageUrl: string | null;
  zoom: number;
  focusX: number;
  focusY: number;
}

export interface TextElement extends CanvasElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  textShadow: boolean;
  letterSpacing?: number;
  lineHeight?: number;
}

export interface CalloutElement extends CanvasElement {
  type: 'callout';
  imageUrl: string | null;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  zoom: number;
  focusX: number;
  focusY: number;
  calloutType: 'detail' | 'fit' | 'pose';
}

export interface ShapeElement extends CanvasElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface ImageElement extends CanvasElement {
  type: 'image';
  imageUrl: string;
  fit: 'cover' | 'contain' | 'fill';
}

// Union type for all element types
export type AnyCanvasElement =
  | HeroElement
  | TextElement
  | CalloutElement
  | ShapeElement
  | ImageElement;

// ============================================================================
// Resize Types
// ============================================================================

export type ResizeHandle =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  aspectRatio?: number; // width / height
}

export const DEFAULT_RESIZE_CONSTRAINTS: ResizeConstraints = {
  minWidth: 50,
  minHeight: 50,
  maxWidth: 2000,
  maxHeight: 2000,
  maintainAspectRatio: false,
};

// ============================================================================
// Snap & Grid Types
// ============================================================================

export interface SnapConfig {
  enabled: boolean;
  gridSize: number; // pixels in canvas coordinates
  showGrid: boolean;
}

export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  gridSize: 20,
  showGrid: false,
};

// ============================================================================
// Layer Types
// ============================================================================

export interface LayerInfo {
  id: string;
  name: string;
  type: ElementType;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  thumbnail?: string;
}

export type LayerOperation =
  | 'bring-to-front'
  | 'bring-forward'
  | 'send-backward'
  | 'send-to-back';

// ============================================================================
// Background Types
// ============================================================================

export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface SolidBackground {
  type: 'solid';
  color: string; // hex or rgba
}

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientBackground {
  type: 'gradient';
  gradientType: 'linear' | 'radial';
  angle: number; // 0-360 for linear
  stops: GradientStop[];
}

export interface ImageBackground {
  type: 'image';
  imageUrl: string;
  fit: 'cover' | 'contain' | 'fill' | 'tile';
  position: { x: number; y: number }; // 0-100
  opacity: number; // 0-1
  blur: number; // 0-20 pixels
}

export type CanvasBackground = SolidBackground | GradientBackground | ImageBackground;

export const DEFAULT_BACKGROUND: SolidBackground = {
  type: 'solid',
  color: '#18181b', // zinc-900
};

// ============================================================================
// Canvas Config Type (Complete Canvas State)
// ============================================================================

export interface CanvasConfig {
  aspectRatio: AspectRatioId;
  background: CanvasBackground;
  elements: AnyCanvasElement[];
  selectedElementId: string | null;
  snapConfig: SnapConfig;
}

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  aspectRatio: '9:16',
  background: DEFAULT_BACKGROUND,
  elements: [],
  selectedElementId: null,
  snapConfig: DEFAULT_SNAP_CONFIG,
};

// ============================================================================
// Alignment Guide Types
// ============================================================================

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number; // Canvas coordinate
  label?: string;
}

export interface SnapResult {
  position: Position;
  guides: AlignmentGuide[];
}

// ============================================================================
// History Types (for undo/redo)
// ============================================================================

export interface CanvasHistoryEntry {
  elements: AnyCanvasElement[];
  background: CanvasBackground;
  aspectRatio: AspectRatioId;
  timestamp: number;
}

// ============================================================================
// Canvas Viewport Types (for zoom/pan)
// ============================================================================

export interface CanvasViewport {
  zoom: number; // 0.25 to 4 (25% to 400%)
  panX: number; // Pan offset X
  panY: number; // Pan offset Y
}

export const DEFAULT_VIEWPORT: CanvasViewport = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0-100 for jpeg/webp
  scale: number; // 1 = original size, 2 = 2x, etc.
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 90,
  scale: 1,
};
