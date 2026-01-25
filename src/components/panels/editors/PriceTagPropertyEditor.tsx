'use client';

import React from 'react';
import { Slider, ColorPicker, Select, TextInput, Toggle, NumberInput } from '../ElementPropertyPanel';
import { AVAILABLE_FONTS } from '@/lib/font-config';
import type { PriceTagElement, PriceTagLayout } from '@/types/elements';
import type { FontFamily } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface PriceTagPropertyEditorProps {
  element: PriceTagElement;
  onUpdate: (updates: Partial<PriceTagElement>) => void;
}

// ============================================================================
// Options
// ============================================================================

const LAYOUT_OPTIONS: { value: PriceTagLayout; label: string }[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'stacked', label: 'Stacked' },
];

const CURRENCY_OPTIONS = [
  { value: '$', label: '$ (USD)' },
  { value: '\u20AC', label: 'Euro' },
  { value: '\u00A3', label: 'Pound' },
  { value: '\u00A5', label: 'Yen' },
  { value: 'C$', label: 'C$ (CAD)' },
  { value: 'A$', label: 'A$ (AUD)' },
];

// ============================================================================
// Component
// ============================================================================

export function PriceTagPropertyEditor({ element, onUpdate }: PriceTagPropertyEditorProps) {
  const fontOptions = AVAILABLE_FONTS.map((font) => ({
    value: font.id,
    label: font.name,
  }));

  const hasOriginalPrice = element.originalPrice !== null;
  const hasDiscount = element.discountPercent !== null;

  return (
    <div className="space-y-4">
      {/* Layout */}
      <Select
        label="Layout"
        value={element.layout}
        options={LAYOUT_OPTIONS}
        onChange={(layout) => onUpdate({ layout: layout as PriceTagLayout })}
      />

      {/* Currency */}
      <Select
        label="Currency"
        value={element.currency}
        options={CURRENCY_OPTIONS}
        onChange={(currency) => onUpdate({ currency })}
      />

      {/* Current Price */}
      <TextInput
        label="Current Price"
        value={element.currentPrice}
        placeholder="49.99"
        onChange={(currentPrice) => onUpdate({ currentPrice })}
      />

      {/* Current Price Styling */}
      <Slider
        label="Price Font Size"
        value={element.currentPriceFontSize}
        min={16}
        max={80}
        step={2}
        unit="px"
        onChange={(currentPriceFontSize) => onUpdate({ currentPriceFontSize })}
      />

      <ColorPicker
        label="Price Color"
        value={element.currentPriceColor}
        onChange={(currentPriceColor) => onUpdate({ currentPriceColor })}
      />

      {/* Font Family */}
      <Select
        label="Font Family"
        value={element.fontFamily}
        options={fontOptions}
        onChange={(fontFamily) => onUpdate({ fontFamily: fontFamily as FontFamily })}
      />

      {/* Original Price Toggle */}
      <div className="space-y-3">
        <Toggle
          label="Show Original Price"
          checked={hasOriginalPrice}
          onChange={(enabled) =>
            onUpdate({
              originalPrice: enabled ? '79.99' : null,
            })
          }
        />

        {hasOriginalPrice && (
          <div className="pl-4 space-y-3 border-l-2 border-violet-500/20">
            <TextInput
              label="Original Price"
              value={element.originalPrice || ''}
              placeholder="79.99"
              onChange={(originalPrice) => onUpdate({ originalPrice })}
            />

            <Slider
              label="Original Price Size"
              value={element.originalPriceFontSize}
              min={10}
              max={40}
              step={1}
              unit="px"
              onChange={(originalPriceFontSize) => onUpdate({ originalPriceFontSize })}
            />

            <ColorPicker
              label="Original Price Color"
              value={element.originalPriceColor}
              onChange={(originalPriceColor) => onUpdate({ originalPriceColor })}
            />
          </div>
        )}
      </div>

      {/* Discount Badge Toggle */}
      <div className="space-y-3">
        <Toggle
          label="Show Discount Badge"
          checked={hasDiscount}
          onChange={(enabled) =>
            onUpdate({
              discountPercent: enabled ? 25 : null,
            })
          }
        />

        {hasDiscount && (
          <div className="pl-4 space-y-3 border-l-2 border-violet-500/20">
            <NumberInput
              label="Discount Percent"
              value={element.discountPercent || 0}
              min={1}
              max={99}
              onChange={(discountPercent) => onUpdate({ discountPercent })}
              unit="%"
            />

            <ColorPicker
              label="Discount Badge Color"
              value={element.discountBadgeColor}
              onChange={(discountBadgeColor) => onUpdate({ discountBadgeColor })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceTagPropertyEditor;
