'use client';

// TextBlock Component
// Renders a text element with fonts, colors, shadows, and backgrounds
// Works within the ElementWrapper for drag/resize functionality

import React from 'react';
import { getFontFamilyCSS } from '@/lib/font-config';
import type { TextElement } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface TextBlockProps {
  element: TextElement;
  isPreview?: boolean;  // When true, disables pointer events for export
}

// ============================================================================
// Component
// ============================================================================

/**
 * TextBlock - Renders text with full styling support
 * 
 * Features:
 * - Custom fonts from font-config
 * - Text color and size
 * - Text shadow with offset, blur, and color
 * - Background with padding and border radius
 * - Text transform (uppercase, lowercase, capitalize)
 * - Letter spacing and line height
 * - Text alignment (left, center, right)
 */
export function TextBlock({ element, isPreview = false }: TextBlockProps) {
  // Build text shadow CSS string
  const textShadow = element.shadow
    ? `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.color}`
    : 'none';

  // Build background styles
  const backgroundStyles = element.background
    ? {
        backgroundColor: element.background.color,
        padding: `${element.background.paddingY}px ${element.background.paddingX}px`,
        borderRadius: element.background.borderRadius,
      }
    : {};

  return (
    <div
      className="w-full h-full flex overflow-hidden"
      style={{
        alignItems: 'center',
        justifyContent: element.textAlign === 'left' 
          ? 'flex-start' 
          : element.textAlign === 'right' 
            ? 'flex-end' 
            : 'center',
        pointerEvents: isPreview ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          fontFamily: getFontFamilyCSS(element.fontFamily),
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.textAlign,
          letterSpacing: element.letterSpacing,
          lineHeight: element.lineHeight,
          textTransform: element.textTransform,
          textShadow,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          ...backgroundStyles,
        }}
      >
        {element.content}
      </div>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default TextBlock;
