'use client';

import React from 'react';
import { Slider, ColorPicker, Select, TextInput, NumberInput } from '../ElementPropertyPanel';
import { AVAILABLE_FONTS, getAvailableWeights, getWeightLabel } from '@/lib/font-config';
import { BADGE_PRESETS, type BadgeElement, type BadgePreset } from '@/types/elements';
import type { FontFamily, FontWeight } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface BadgePropertyEditorProps {
  element: BadgeElement;
  onUpdate: (updates: Partial<BadgeElement>) => void;
}

// ============================================================================
// Preset Options
// ============================================================================

const PRESET_OPTIONS: { value: BadgePreset; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'sale', label: 'Sale' },
  { value: 'limited', label: 'Limited' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'custom', label: 'Custom' },
];

// ============================================================================
// Component
// ============================================================================

export function BadgePropertyEditor({ element, onUpdate }: BadgePropertyEditorProps) {
  const availableWeights = getAvailableWeights(element.fontFamily);

  const fontOptions = AVAILABLE_FONTS.map((font) => ({
    value: font.id,
    label: font.name,
  }));

  const weightOptions = availableWeights.map((weight) => ({
    value: String(weight),
    label: getWeightLabel(weight),
  }));

  const handlePresetChange = (preset: BadgePreset) => {
    if (preset === 'custom') {
      onUpdate({ preset });
    } else {
      const presetConfig = BADGE_PRESETS[preset];
      onUpdate({
        preset,
        text: presetConfig.text,
        backgroundColor: presetConfig.bg,
        textColor: presetConfig.color,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Selector */}
      <Select
        label="Preset Style"
        value={element.preset}
        options={PRESET_OPTIONS}
        onChange={(preset) => handlePresetChange(preset as BadgePreset)}
      />

      {/* Preset Preview Pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(BADGE_PRESETS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => handlePresetChange(key as BadgePreset)}
            className={`
              px-3 py-1 text-xs font-bold rounded-full transition-all
              ${element.preset === key ? 'ring-2 ring-offset-2 ring-violet-500' : 'opacity-80 hover:opacity-100'}
            `}
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.text}
          </button>
        ))}
      </div>

      {/* Badge Text */}
      <TextInput
        label="Badge Text"
        value={element.text}
        placeholder="NEW"
        onChange={(text) => onUpdate({ text, preset: 'custom' })}
      />

      {/* Font Family */}
      <Select
        label="Font Family"
        value={element.fontFamily}
        options={fontOptions}
        onChange={(fontFamily) => onUpdate({ fontFamily: fontFamily as FontFamily })}
      />

      {/* Font Weight */}
      <Select
        label="Font Weight"
        value={String(element.fontWeight)}
        options={weightOptions}
        onChange={(weight) => onUpdate({ fontWeight: Number(weight) as FontWeight })}
      />

      {/* Font Size */}
      <Slider
        label="Font Size"
        value={element.fontSize}
        min={8}
        max={32}
        step={1}
        unit="px"
        onChange={(fontSize) => onUpdate({ fontSize })}
      />

      {/* Text Color */}
      <ColorPicker
        label="Text Color"
        value={element.textColor}
        onChange={(textColor) => onUpdate({ textColor, preset: 'custom' })}
      />

      {/* Background Color */}
      <ColorPicker
        label="Background Color"
        value={element.backgroundColor}
        onChange={(backgroundColor) => onUpdate({ backgroundColor, preset: 'custom' })}
      />

      {/* Border Radius */}
      <Slider
        label="Border Radius"
        value={element.borderRadius}
        min={0}
        max={50}
        step={1}
        unit="px"
        onChange={(borderRadius) => onUpdate({ borderRadius })}
      />

      {/* Padding */}
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Padding X"
          value={element.paddingX}
          min={0}
          max={50}
          onChange={(paddingX) => onUpdate({ paddingX })}
          unit="px"
        />
        <NumberInput
          label="Padding Y"
          value={element.paddingY}
          min={0}
          max={50}
          onChange={(paddingY) => onUpdate({ paddingY })}
          unit="px"
        />
      </div>
    </div>
  );
}

export default BadgePropertyEditor;
