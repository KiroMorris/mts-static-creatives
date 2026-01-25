'use client';

import React from 'react';
import { Slider, ColorPicker, Select, TextInput, Toggle, NumberInput } from '../ElementPropertyPanel';
import { AVAILABLE_FONTS, getAvailableWeights, getWeightLabel } from '@/lib/font-config';
import type { CTAButtonElement } from '@/types/elements';
import type { FontFamily, FontWeight } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface CTAPropertyEditorProps {
  element: CTAButtonElement;
  onUpdate: (updates: Partial<CTAButtonElement>) => void;
}

// ============================================================================
// Component
// ============================================================================

export function CTAPropertyEditor({ element, onUpdate }: CTAPropertyEditorProps) {
  const availableWeights = getAvailableWeights(element.fontFamily);

  const fontOptions = AVAILABLE_FONTS.map((font) => ({
    value: font.id,
    label: font.name,
  }));

  const weightOptions = availableWeights.map((weight) => ({
    value: String(weight),
    label: getWeightLabel(weight),
  }));

  return (
    <div className="space-y-4">
      {/* Button Text */}
      <TextInput
        label="Button Text"
        value={element.text}
        placeholder="Shop Now"
        onChange={(text) => onUpdate({ text })}
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
        min={10}
        max={48}
        step={1}
        unit="px"
        onChange={(fontSize) => onUpdate({ fontSize })}
      />

      {/* Text Color */}
      <ColorPicker
        label="Text Color"
        value={element.textColor}
        onChange={(textColor) => onUpdate({ textColor })}
      />

      {/* Background Color */}
      <ColorPicker
        label="Background Color"
        value={element.backgroundColor}
        onChange={(backgroundColor) => onUpdate({ backgroundColor })}
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

      {/* Border */}
      <div className="space-y-3">
        <Slider
          label="Border Width"
          value={element.borderWidth}
          min={0}
          max={10}
          step={1}
          unit="px"
          onChange={(borderWidth) => onUpdate({ borderWidth })}
        />

        {element.borderWidth > 0 && (
          <ColorPicker
            label="Border Color"
            value={element.borderColor}
            onChange={(borderColor) => onUpdate({ borderColor })}
          />
        )}
      </div>

      {/* Padding */}
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Padding X"
          value={element.paddingX}
          min={0}
          max={100}
          onChange={(paddingX) => onUpdate({ paddingX })}
          unit="px"
        />
        <NumberInput
          label="Padding Y"
          value={element.paddingY}
          min={0}
          max={100}
          onChange={(paddingY) => onUpdate({ paddingY })}
          unit="px"
        />
      </div>

      {/* Box Shadow */}
      <div className="space-y-3">
        <Toggle
          label="Button Shadow"
          checked={element.shadow !== null}
          onChange={(enabled) =>
            onUpdate({
              shadow: enabled
                ? { offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.25)' }
                : null,
            })
          }
        />

        {element.shadow && (
          <div className="pl-4 space-y-3 border-l-2 border-violet-500/20">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Offset X"
                value={element.shadow.offsetX}
                min={-50}
                max={50}
                onChange={(offsetX) =>
                  onUpdate({ shadow: { ...element.shadow!, offsetX } })
                }
                unit="px"
              />
              <NumberInput
                label="Offset Y"
                value={element.shadow.offsetY}
                min={-50}
                max={50}
                onChange={(offsetY) =>
                  onUpdate({ shadow: { ...element.shadow!, offsetY } })
                }
                unit="px"
              />
            </div>
            <Slider
              label="Blur"
              value={element.shadow.blur}
              min={0}
              max={50}
              step={1}
              unit="px"
              onChange={(blur) => onUpdate({ shadow: { ...element.shadow!, blur } })}
            />
            <Slider
              label="Spread"
              value={element.shadow.spread}
              min={-20}
              max={20}
              step={1}
              unit="px"
              onChange={(spread) => onUpdate({ shadow: { ...element.shadow!, spread } })}
            />
            <ColorPicker
              label="Shadow Color"
              value={element.shadow.color}
              onChange={(color) =>
                onUpdate({ shadow: { ...element.shadow!, color } })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CTAPropertyEditor;
