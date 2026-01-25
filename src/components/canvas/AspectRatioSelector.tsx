'use client';

// AspectRatioSelector Component
// UI component for switching between aspect ratios (9:16, 1:1, 4:5, 16:9)
// Displays visual representations of each ratio with labels

import React from 'react';
import { ASPECT_RATIOS, AspectRatioId } from '@/types/canvas';

// ============================================================================
// Types
// ============================================================================

interface AspectRatioSelectorProps {
  /** Currently selected aspect ratio */
  value: AspectRatioId;

  /** Callback when aspect ratio changes */
  onChange: (ratio: AspectRatioId) => void;

  /** Display layout: 'row' for horizontal, 'grid' for 2x2 */
  layout?: 'row' | 'grid';

  /** Whether to show the description text */
  showDescription?: boolean;

  /** Size of the ratio preview boxes */
  previewSize?: 'sm' | 'md' | 'lg';

  /** Optional CSS classes */
  className?: string;

  /** Whether the selector is disabled */
  disabled?: boolean;

  /** Optional label text */
  label?: string;
}

// ============================================================================
// Size Configurations
// ============================================================================

const PREVIEW_SIZES = {
  sm: {
    container: 'p-2',
    boxBase: 24, // Base size in pixels for the preview box
    text: 'text-[10px]',
    name: 'text-xs',
  },
  md: {
    container: 'p-3',
    boxBase: 32,
    text: 'text-xs',
    name: 'text-sm',
  },
  lg: {
    container: 'p-4',
    boxBase: 40,
    text: 'text-sm',
    name: 'text-base',
  },
};

// ============================================================================
// Aspect Ratio Preview Box
// ============================================================================

interface RatioPreviewBoxProps {
  ratio: number;
  baseSize: number;
  isSelected: boolean;
}

function RatioPreviewBox({ ratio, baseSize, isSelected }: RatioPreviewBoxProps) {
  // Calculate dimensions based on aspect ratio
  // For tall ratios (< 1), width is fixed and height varies
  // For wide ratios (> 1), height is fixed and width varies
  // For square (= 1), both are the same

  let width: number;
  let height: number;

  if (ratio === 1) {
    // Square
    width = baseSize;
    height = baseSize;
  } else if (ratio < 1) {
    // Portrait (taller than wide)
    width = baseSize * 0.6;
    height = width / ratio;
  } else {
    // Landscape (wider than tall)
    height = baseSize * 0.6;
    width = height * ratio;
  }

  // Normalize to fit within a reasonable bound
  const maxDimension = baseSize * 1.5;
  if (width > maxDimension) {
    const scale = maxDimension / width;
    width = maxDimension;
    height = height * scale;
  }
  if (height > maxDimension) {
    const scale = maxDimension / height;
    height = maxDimension;
    width = width * scale;
  }

  return (
    <div
      className={`
        rounded transition-all duration-200
        ${isSelected
          ? 'bg-violet-500 dark:bg-violet-400'
          : 'bg-zinc-300 dark:bg-zinc-600'
        }
      `}
      style={{
        width: Math.round(width),
        height: Math.round(height),
      }}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * AspectRatioSelector - UI for switching between canvas aspect ratios
 *
 * Displays a visual grid/row of aspect ratio options with:
 * - Preview boxes showing the actual ratio proportions
 * - Ratio labels (9:16, 1:1, etc.)
 * - Name labels (Stories, Square, etc.)
 * - Optional descriptions
 *
 * Supports row and grid layouts, multiple sizes, and full accessibility.
 */
export function AspectRatioSelector({
  value,
  onChange,
  layout = 'grid',
  showDescription = false,
  previewSize = 'md',
  className = '',
  disabled = false,
  label,
}: AspectRatioSelectorProps) {
  const sizeConfig = PREVIEW_SIZES[previewSize];
  const ratioEntries = Object.values(ASPECT_RATIOS);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      {/* Ratio Options Grid/Row */}
      <div
        className={`
          ${layout === 'grid' ? 'grid grid-cols-4 gap-2' : 'flex gap-2'}
        `}
        role="radiogroup"
        aria-label="Select aspect ratio"
      >
        {ratioEntries.map((config) => {
          const isSelected = value === config.id;

          return (
            <button
              key={config.id}
              onClick={() => !disabled && onChange(config.id)}
              disabled={disabled}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${config.name} (${config.id})`}
              className={`
                flex flex-col items-center gap-1.5
                ${sizeConfig.container}
                rounded-lg border-2 transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected
                  ? 'border-violet-500 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }
              `}
            >
              {/* Ratio Preview Box */}
              <div className="flex items-center justify-center h-12">
                <RatioPreviewBox
                  ratio={config.ratio}
                  baseSize={sizeConfig.boxBase}
                  isSelected={isSelected}
                />
              </div>

              {/* Ratio Label (e.g., "9:16") */}
              <span
                className={`
                  ${sizeConfig.name} font-semibold
                  ${isSelected
                    ? 'text-violet-700 dark:text-violet-300'
                    : 'text-zinc-700 dark:text-zinc-300'
                  }
                `}
              >
                {config.id}
              </span>

              {/* Name Label (e.g., "Stories") */}
              <span
                className={`
                  ${sizeConfig.text}
                  ${isSelected
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-zinc-500 dark:text-zinc-500'
                  }
                `}
              >
                {config.name}
              </span>

              {/* Description (optional) */}
              {showDescription && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center leading-tight">
                  {config.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Compact Variant
// ============================================================================

interface AspectRatioSelectorCompactProps {
  /** Currently selected aspect ratio */
  value: AspectRatioId;

  /** Callback when aspect ratio changes */
  onChange: (ratio: AspectRatioId) => void;

  /** Optional CSS classes */
  className?: string;

  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * AspectRatioSelectorCompact - A minimal dropdown version of the selector
 *
 * Useful for toolbars or space-constrained areas.
 */
export function AspectRatioSelectorCompact({
  value,
  onChange,
  className = '',
  disabled = false,
}: AspectRatioSelectorCompactProps) {
  const config = ASPECT_RATIOS[value];

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AspectRatioId)}
        disabled={disabled}
        className={`
          appearance-none
          px-3 py-2 pr-8
          text-sm font-medium
          bg-white dark:bg-zinc-800
          border border-zinc-200 dark:border-zinc-700
          rounded-lg
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {Object.values(ASPECT_RATIOS).map((ratioConfig) => (
          <option key={ratioConfig.id} value={ratioConfig.id}>
            {ratioConfig.id} - {ratioConfig.name}
          </option>
        ))}
      </select>

      {/* Dropdown Arrow */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// Icon Buttons Variant
// ============================================================================

interface AspectRatioIconButtonsProps {
  /** Currently selected aspect ratio */
  value: AspectRatioId;

  /** Callback when aspect ratio changes */
  onChange: (ratio: AspectRatioId) => void;

  /** Optional CSS classes */
  className?: string;

  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * AspectRatioIconButtons - Icon-only buttons for the toolbar
 *
 * Shows just the ratio proportions without text labels.
 */
export function AspectRatioIconButtons({
  value,
  onChange,
  className = '',
  disabled = false,
}: AspectRatioIconButtonsProps) {
  return (
    <div className={`flex gap-1 ${className}`} role="radiogroup" aria-label="Select aspect ratio">
      {Object.values(ASPECT_RATIOS).map((config) => {
        const isSelected = value === config.id;

        return (
          <button
            key={config.id}
            onClick={() => !disabled && onChange(config.id)}
            disabled={disabled}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${config.name} (${config.id})`}
            title={`${config.name} (${config.id})`}
            className={`
              p-2 rounded-lg transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isSelected
                ? 'bg-violet-500 dark:bg-violet-500'
                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }
            `}
          >
            <RatioPreviewBox
              ratio={config.ratio}
              baseSize={20}
              isSelected={isSelected}
            />
          </button>
        );
      })}
    </div>
  );
}

export default AspectRatioSelector;
