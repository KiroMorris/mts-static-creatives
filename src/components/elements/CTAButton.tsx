'use client';

// CTAButton Component
// Renders a call-to-action button with full styling support
// Works within the ElementWrapper for drag/resize functionality

import React from 'react';
import { getFontFamilyCSS } from '@/lib/font-config';
import type { CTAButtonElement } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface CTAButtonProps {
  element: CTAButtonElement;
  isPreview?: boolean;  // When true, disables pointer events for export
}

// ============================================================================
// Component
// ============================================================================

/**
 * CTAButton - Renders a styled call-to-action button
 * 
 * Features:
 * - Custom fonts from font-config
 * - Text color and background color
 * - Border with width, color, and radius
 * - Padding for button sizing
 * - Box shadow with offset, blur, spread, and color
 * - Fully customizable appearance
 */
export function CTAButton({ element, isPreview = false }: CTAButtonProps) {
  // Build box shadow CSS string
  const boxShadow = element.shadow
    ? `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.spread}px ${element.shadow.color}`
    : 'none';

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        fontFamily: getFontFamilyCSS(element.fontFamily),
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        color: element.textColor,
        backgroundColor: element.backgroundColor,
        borderRadius: element.borderRadius,
        border: element.borderWidth > 0 
          ? `${element.borderWidth}px solid ${element.borderColor}` 
          : 'none',
        padding: `${element.paddingY}px ${element.paddingX}px`,
        boxShadow,
        pointerEvents: isPreview ? 'none' : 'auto',
        textAlign: 'center',
        cursor: isPreview ? 'default' : 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {element.text}
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default CTAButton;
