'use client';

// FontSelector Component
// Provides font family and weight selection with live preview

import React from 'react';
import type { FontFamily, FontWeight, FontOption } from '@/types';
import {
  HEADLINE_FONTS,
  SUBTITLE_FONTS,
  getAvailableWeights,
  getFontFamilyCSS,
  getWeightLabel,
  getClosestWeight,
} from '@/lib/font-config';

// ============================================================================
// Types
// ============================================================================

interface FontSelectorProps {
  type: 'headline' | 'subtitle';
  selectedFont: FontFamily;
  selectedWeight: FontWeight;
  onFontChange: (font: FontFamily) => void;
  onWeightChange: (weight: FontWeight) => void;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface FontOptionItemProps {
  font: FontOption;
  isSelected: boolean;
  onClick: () => void;
}

function FontOptionItem({ font, isSelected, onClick }: FontOptionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-3 py-2 text-left rounded-lg transition-colors
        ${isSelected
          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
        }
      `}
    >
      <div
        className="text-sm truncate"
        style={{
          fontFamily: getFontFamilyCSS(font.id),
          fontWeight: font.weights.includes(700) ? 700 : 400,
        }}
      >
        {font.name}
      </div>
      <div
        className="text-xs mt-1 opacity-60 truncate"
        style={{
          fontFamily: getFontFamilyCSS(font.id),
          fontWeight: font.weights.includes(400) ? 400 : font.weights[0],
        }}
      >
        {font.preview}
      </div>
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FontSelector({
  type,
  selectedFont,
  selectedWeight,
  onFontChange,
  onWeightChange,
}: FontSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Get the appropriate font list based on type
  const fontList = type === 'headline' ? HEADLINE_FONTS : SUBTITLE_FONTS;
  const availableWeights = getAvailableWeights(selectedFont);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle font change - auto-adjust weight if not available
  const handleFontChange = (font: FontFamily) => {
    onFontChange(font);
    // Adjust weight to closest available if current weight isn't available
    const closestWeight = getClosestWeight(font, selectedWeight);
    if (closestWeight !== selectedWeight) {
      onWeightChange(closestWeight);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Font Family Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Font Family
        </label>
        <div className="relative" ref={dropdownRef}>
          {/* Selected Font Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 text-left rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span
                className="truncate"
                style={{
                  fontFamily: getFontFamilyCSS(selectedFont),
                  fontWeight: selectedWeight,
                }}
              >
                {selectedFont}
              </span>
              <ChevronIcon isOpen={isOpen} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-1 space-y-1">
                {fontList.map((font) => (
                  <FontOptionItem
                    key={font.id}
                    font={font}
                    isSelected={font.id === selectedFont}
                    onClick={() => handleFontChange(font.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Font Weight Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Font Weight
        </label>
        <div className="flex gap-2">
          {availableWeights.map((weight) => (
            <button
              key={weight}
              type="button"
              onClick={() => onWeightChange(weight)}
              className={`
                flex-1 px-3 py-2 text-sm rounded-lg transition-colors
                ${weight === selectedWeight
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }
              `}
              style={{
                fontFamily: getFontFamilyCSS(selectedFont),
                fontWeight: weight,
              }}
            >
              {getWeightLabel(weight)}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Preview
        </label>
        <div
          className="px-3 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-950 text-white overflow-hidden"
          style={{
            fontFamily: getFontFamilyCSS(selectedFont),
            fontWeight: selectedWeight,
            fontSize: type === 'headline' ? '24px' : '14px',
            letterSpacing: type === 'subtitle' ? '2px' : 'normal',
            textTransform: type === 'subtitle' ? 'uppercase' : 'none',
          }}
        >
          {type === 'headline' ? 'Sample Headline' : 'SAMPLE SUBTITLE TEXT'}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default FontSelector;
