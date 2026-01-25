'use client';

// PriceTag Element Component
// Renders a price tag with current price, original price (strikethrough), and discount badge
// Supports horizontal, vertical, and stacked layouts

import React from 'react';
import { getFontFamilyCSS } from '@/lib/font-config';
import type { PriceTagElement } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface PriceTagProps {
  element: PriceTagElement;
  isPreview?: boolean;  // When true, no interactive features
}

// ============================================================================
// Component
// ============================================================================

export function PriceTag({ element }: PriceTagProps) {
  const {
    currentPrice,
    originalPrice,
    discountPercent,
    currency,
    fontFamily,
    currentPriceFontSize,
    currentPriceColor,
    originalPriceFontSize,
    originalPriceColor,
    discountBadgeColor,
    layout,
  } = element;

  // Determine flex direction based on layout
  const getFlexDirection = (): 'row' | 'column' | 'column-reverse' => {
    switch (layout) {
      case 'vertical':
        return 'column';
      case 'stacked':
        return 'column-reverse';  // Current price on top, original below
      case 'horizontal':
      default:
        return 'row';
    }
  };

  // Get alignment classes based on layout
  const getAlignmentClasses = (): string => {
    if (layout === 'horizontal') {
      return 'items-center justify-center gap-3';
    }
    return 'items-center justify-center gap-1';
  };

  const flexDirection = getFlexDirection();
  const alignmentClasses = getAlignmentClasses();

  return (
    <div
      className={`w-full h-full flex ${alignmentClasses}`}
      style={{
        flexDirection: flexDirection,
        fontFamily: getFontFamilyCSS(fontFamily),
      }}
    >
      {/* Original price (strikethrough) - shown first in horizontal/vertical */}
      {originalPrice && layout !== 'stacked' && (
        <span
          style={{
            fontSize: originalPriceFontSize,
            color: originalPriceColor,
            textDecoration: 'line-through',
            opacity: 0.8,
          }}
        >
          {currency}{originalPrice}
        </span>
      )}

      {/* Current price */}
      <span
        style={{
          fontSize: currentPriceFontSize,
          color: currentPriceColor,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {currency}{currentPrice}
      </span>

      {/* Original price (strikethrough) - shown after current in stacked layout */}
      {originalPrice && layout === 'stacked' && (
        <span
          style={{
            fontSize: originalPriceFontSize,
            color: originalPriceColor,
            textDecoration: 'line-through',
            opacity: 0.8,
          }}
        >
          {currency}{originalPrice}
        </span>
      )}

      {/* Discount badge */}
      {discountPercent !== null && discountPercent > 0 && (
        <span
          className="px-2 py-0.5 rounded-full text-white font-bold whitespace-nowrap"
          style={{
            backgroundColor: discountBadgeColor,
            fontSize: Math.max(10, originalPriceFontSize * 0.8),
          }}
        >
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate discount percentage from original and current prices
 */
export function calculateDiscountPercent(original: string, current: string): number {
  const originalNum = parseFloat(original);
  const currentNum = parseFloat(current);

  if (isNaN(originalNum) || isNaN(currentNum) || originalNum <= 0) {
    return 0;
  }

  const discount = ((originalNum - currentNum) / originalNum) * 100;
  return Math.round(Math.max(0, discount));
}

/**
 * Format price with proper decimal places
 */
export function formatPrice(price: number | string, decimals: number = 2): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0.00';
  return num.toFixed(decimals);
}

export default PriceTag;
