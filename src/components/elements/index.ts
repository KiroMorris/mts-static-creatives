// Elements Component Index
// Exports all element components for the V2 canvas system

// ============================================================================
// Component Exports
// ============================================================================

// Text and typography
export { TextBlock } from './TextBlock';
export { CTAButton } from './CTAButton';
export { Badge, getBadgePresetDefaults } from './Badge';

// Price and commerce
export { PriceTag, calculateDiscountPercent, formatPrice } from './PriceTag';

// Shapes and graphics
export { Shape, SHAPE_TYPE_LABELS, SHAPE_TYPE_ICONS } from './Shape';

// Brand assets
export { Logo, LOGO_FIT_LABELS, LOGO_FIT_DESCRIPTIONS, isValidImageUrl, fileToDataUrl } from './Logo';

// ============================================================================
// Type Re-exports
// ============================================================================

export type {
  // Base types
  BaseElement,
  Position,
  Size,
  ElementType,

  // Shadow types
  TextShadow,
  BoxShadow,
  TextBackground,

  // Element types
  TextElement,
  CTAButtonElement,
  BadgeElement,
  BadgePreset,
  PriceTagElement,
  PriceTagLayout,
  ShapeElement,
  ShapeType,
  LogoElement,
  LogoFit,

  // Union type
  CanvasElement,
} from '@/types/elements';

// ============================================================================
// Constants Re-exports
// ============================================================================

export { BADGE_PRESETS } from '@/types/elements';
