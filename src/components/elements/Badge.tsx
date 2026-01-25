'use client';

// Badge Component
// Renders a badge element (NEW, SALE, etc.) with preset styles
// Works within the ElementWrapper for drag/resize functionality

import React from 'react';
import { getFontFamilyCSS } from '@/lib/font-config';
import type { BadgeElement } from '@/types/elements';
import { BADGE_PRESETS } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface BadgeProps {
  element: BadgeElement;
  isPreview?: boolean;  // When true, disables pointer events for export
}

// ============================================================================
// Component
// ============================================================================

/**
 * Badge - Renders a styled badge/tag element
 * 
 * Features:
 * - Preset styles for common badges (NEW, SALE, LIMITED, BESTSELLER)
 * - Custom styling override for preset: 'custom'
 * - Custom fonts from font-config
 * - Text color and background color
 * - Border radius for rounded corners
 * - Padding for badge sizing
 * - Uppercase text with letter spacing for readability
 */
export function Badge({ element, isPreview = false }: BadgeProps) {
  // Get preset colors if using a preset, otherwise use custom values
  const presetConfig = element.preset !== 'custom' 
    ? BADGE_PRESETS[element.preset] 
    : null;

  // Use preset values as defaults, but allow override via element properties
  const backgroundColor = element.backgroundColor || presetConfig?.bg || '#22c55e';
  const textColor = element.textColor || presetConfig?.color || '#ffffff';
  const text = element.text || presetConfig?.text || 'BADGE';

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        fontFamily: getFontFamilyCSS(element.fontFamily),
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        color: textColor,
        backgroundColor: backgroundColor,
        borderRadius: element.borderRadius,
        padding: `${element.paddingY}px ${element.paddingX}px`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        pointerEvents: isPreview ? 'none' : 'auto',
        textAlign: 'center',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {text}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get default badge element properties for a given preset
 */
export function getBadgePresetDefaults(preset: keyof typeof BADGE_PRESETS): {
  text: string;
  backgroundColor: string;
  textColor: string;
} {
  const config = BADGE_PRESETS[preset];
  return {
    text: config.text,
    backgroundColor: config.bg,
    textColor: config.color,
  };
}

// ============================================================================
// Default Export
// ============================================================================

export default Badge;
