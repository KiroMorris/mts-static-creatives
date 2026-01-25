// Element Types for V2 Elements System
// Defines all element interfaces for drag/drop canvas components

import type { FontFamily, FontWeight } from './index';

// ============================================================================
// Base Types
// ============================================================================

export interface Position {
  x: number;  // pixels from left
  y: number;  // pixels from top
}

export interface Size {
  width: number;
  height: number;
}

export type ElementType =
  | 'text'
  | 'cta-button'
  | 'badge'
  | 'price-tag'
  | 'shape'
  | 'logo'
  | 'hero'
  | 'callout';

// ============================================================================
// Base Element Interface
// ============================================================================

export interface BaseElement {
  id: string;
  type: ElementType;
  enabled: boolean;
  position: Position;
  size: Size;
  zIndex: number;
  opacity: number;       // 0-1
  rotation: number;      // degrees
  locked: boolean;       // prevent editing
}

// ============================================================================
// Shadow Types
// ============================================================================

export interface TextShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface BoxShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

// ============================================================================
// Text Background
// ============================================================================

export interface TextBackground {
  color: string;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
}

// ============================================================================
// Element Types
// ============================================================================

// Text Block Element
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: FontFamily;
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  shadow: TextShadow | null;
  background: TextBackground | null;
}

// CTA Button Element
export interface CTAButtonElement extends BaseElement {
  type: 'cta-button';
  text: string;
  fontFamily: FontFamily;
  fontSize: number;
  fontWeight: FontWeight;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  paddingX: number;
  paddingY: number;
  shadow: BoxShadow | null;
}

// Badge Element
export type BadgePreset = 'new' | 'sale' | 'limited' | 'bestseller' | 'custom';

export interface BadgeElement extends BaseElement {
  type: 'badge';
  text: string;
  preset: BadgePreset;
  fontFamily: FontFamily;
  fontSize: number;
  fontWeight: FontWeight;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
}

// Price Tag Element
export type PriceTagLayout = 'horizontal' | 'vertical' | 'stacked';

export interface PriceTagElement extends BaseElement {
  type: 'price-tag';
  currentPrice: string;
  originalPrice: string | null;  // null = no sale
  discountPercent: number | null;
  currency: string;
  fontFamily: FontFamily;
  currentPriceFontSize: number;
  currentPriceColor: string;
  originalPriceFontSize: number;
  originalPriceColor: string;
  discountBadgeColor: string;
  layout: PriceTagLayout;
}

// Shape Element
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'triangle';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;  // for rectangles
}

// Logo Element
export type LogoFit = 'contain' | 'cover' | 'fill';

export interface LogoElement extends BaseElement {
  type: 'logo';
  imageUrl: string;  // uploaded logo URL or data URL
  fit: LogoFit;
}

// ============================================================================
// Union Type for All Elements
// ============================================================================

export type CanvasElement =
  | TextElement
  | CTAButtonElement
  | BadgeElement
  | PriceTagElement
  | ShapeElement
  | LogoElement;

// ============================================================================
// Badge Presets
// ============================================================================

export const BADGE_PRESETS: Record<Exclude<BadgePreset, 'custom'>, { text: string; bg: string; color: string }> = {
  new: { text: 'NEW', bg: '#22c55e', color: '#ffffff' },
  sale: { text: 'SALE', bg: '#ef4444', color: '#ffffff' },
  limited: { text: 'LIMITED', bg: '#f59e0b', color: '#000000' },
  bestseller: { text: 'BESTSELLER', bg: '#8b5cf6', color: '#ffffff' },
};

// ============================================================================
// Type Guards
// ============================================================================

export function isTextElement(element: BaseElement): element is TextElement {
  return element.type === 'text';
}

export function isCTAButtonElement(element: BaseElement): element is CTAButtonElement {
  return element.type === 'cta-button';
}

export function isBadgeElement(element: BaseElement): element is BadgeElement {
  return element.type === 'badge';
}

export function isPriceTagElement(element: BaseElement): element is PriceTagElement {
  return element.type === 'price-tag';
}

export function isShapeElement(element: BaseElement): element is ShapeElement {
  return element.type === 'shape';
}

export function isLogoElement(element: BaseElement): element is LogoElement {
  return element.type === 'logo';
}
