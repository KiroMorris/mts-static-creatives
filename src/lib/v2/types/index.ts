// V2 Sharp Composer Type Definitions
// Comprehensive types for flexible canvas composition

// ============================================================================
// Canvas Types
// ============================================================================

export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';

export interface CanvasConfig {
  id: AspectRatio;
  width: number;
  height: number;
  label: string;
  platform: string[];
}

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
// Position and Size Types
// ============================================================================

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

// ============================================================================
// Element Types
// ============================================================================

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

export interface BaseElement {
  id: string;
  type: ElementType;
  enabled: boolean;
  position: Position;
  size: Size;
  zIndex: number;
  opacity?: number;        // 0-100, default 100
  rotation?: number;       // Degrees, default 0
  locked?: boolean;
  name?: string;
}

// ============================================================================
// Hero Element
// ============================================================================

export interface HeroElement extends BaseElement {
  type: 'hero';
  imageBuffer?: Buffer;
  imageUrl?: string;
  zoom: number;
  focusX: number;
  focusY: number;
  backgroundRemoved?: boolean;
  originalImageBuffer?: Buffer;
  source?: 'ai-generated' | 'user-uploaded' | 'url';
}

// ============================================================================
// Callout Element
// ============================================================================

export interface CalloutElement extends BaseElement {
  type: 'callout';
  imageBuffer?: Buffer;
  imageUrl?: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  zoom: number;
  focusX: number;
  focusY: number;
  label?: string;
}

// ============================================================================
// Text Element
// ============================================================================

export interface TextShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface TextOutline {
  enabled: boolean;
  width: number;
  color: string;
}

export interface TextBackground {
  enabled: boolean;
  color: string;
  padding: number;
  borderRadius: number;
  opacity?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: string;
  align: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight: number;
  letterSpacing: number;
  maxWidth?: number;
  shadow?: TextShadow;
  outline?: TextOutline;
  background?: TextBackground;
}

// ============================================================================
// CTA Button Element
// ============================================================================

export interface CTAButtonElement extends BaseElement {
  type: 'cta-button';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

// ============================================================================
// Badge Element
// ============================================================================

export interface BadgeElement extends BaseElement {
  type: 'badge';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  backgroundColor: string;
  paddingX: number;
  paddingY: number;
}

// ============================================================================
// Price Tag Element
// ============================================================================

export interface PriceTagElement extends BaseElement {
  type: 'price-tag';
  price: string;
  originalPrice?: string;
  currency?: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  priceColor: string;
  originalPriceColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

// ============================================================================
// Shape Element
// ============================================================================

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'triangle';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  lineEndpoints?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

// ============================================================================
// Logo Element
// ============================================================================

export interface LogoElement extends BaseElement {
  type: 'logo';
  imageBuffer?: Buffer;
  imageUrl?: string;
  maintainAspectRatio: boolean;
}

// ============================================================================
// Image Element
// ============================================================================

export interface ImageElement extends BaseElement {
  type: 'image';
  imageBuffer?: Buffer;
  imageUrl?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  objectFit: 'cover' | 'contain' | 'fill';
}

// ============================================================================
// Union Type for All Elements
// ============================================================================

export type CanvasElement =
  | HeroElement
  | CalloutElement
  | TextElement
  | CTAButtonElement
  | BadgeElement
  | PriceTagElement
  | ShapeElement
  | LogoElement
  | ImageElement;

// ============================================================================
// API Types
// ============================================================================

export interface ComposeV2Request {
  canvas: {
    aspectRatio: AspectRatio;
    backgroundColor?: string;
    customWidth?: number;
    customHeight?: number;
  };
  elements: CanvasElement[];
  output?: {
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    outputType?: 'base64' | 'file' | 'buffer';
    filename?: string;
  };
}

export interface ComposeV2Response {
  success: boolean;
  data?: {
    imageUrl: string;
    imageId: string;
    dimensions: {
      width: number;
      height: number;
      aspectRatio: AspectRatio;
    };
    downloadUrl?: string;
    compositionTime: number;
    format: string;
    elementsRendered: number;
    warnings?: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ElementValidation {
  valid: boolean;
  elementId: string;
  errors: string[];
  warnings: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  elementErrors: ElementValidation[];
}

// ============================================================================
// Compose Result
// ============================================================================

export interface ComposeV2Result {
  imageUrl: string;
  imageId: string;
  width: number;
  height: number;
  downloadUrl?: string;
  elementsRendered: number;
  buffer?: Buffer;
}
