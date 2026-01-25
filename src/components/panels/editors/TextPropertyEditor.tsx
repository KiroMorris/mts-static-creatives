'use client';

import React from 'react';
import { Slider, ColorPicker, Select, TextInput, Toggle, NumberInput } from '../ElementPropertyPanel';
import { AVAILABLE_FONTS, getAvailableWeights, getWeightLabel } from '@/lib/font-config';
import type { TextElement } from '@/types/elements';
import type { FontFamily, FontWeight } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface TextPropertyEditorProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

// ============================================================================
// Component
// ============================================================================

export function TextPropertyEditor({ element, onUpdate }: TextPropertyEditorProps) {
  const availableWeights = getAvailableWeights(element.fontFamily);

  const fontOptions = AVAILABLE_FONTS.map((font) => ({
    value: font.id,
    label: font.name,
  }));

  const weightOptions = availableWeights.map((weight) => ({
    value: String(weight),
    label: getWeightLabel(weight),
  }));

  const alignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];

  const transformOptions = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
  ];

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <TextInput
        label="Text Content"
        value={element.content}
        placeholder="Enter your text..."
        onChange={(content) => onUpdate({ content })}
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
        min={12}
        max={200}
        step={2}
        unit="px"
        onChange={(fontSize) => onUpdate({ fontSize })}
      />

      {/* Text Color */}
      <ColorPicker
        label="Text Color"
        value={element.color}
        onChange={(color) => onUpdate({ color })}
      />

      {/* Text Alignment */}
      <Select
        label="Text Alignment"
        value={element.textAlign}
        options={alignOptions}
        onChange={(textAlign) => onUpdate({ textAlign: textAlign as 'left' | 'center' | 'right' })}
      />

      {/* Text Transform */}
      <Select
        label="Text Transform"
        value={element.textTransform}
        options={transformOptions}
        onChange={(textTransform) =>
          onUpdate({ textTransform: textTransform as 'none' | 'uppercase' | 'lowercase' | 'capitalize' })
        }
      />

      {/* Letter Spacing */}
      <Slider
        label="Letter Spacing"
        value={element.letterSpacing}
        min={-5}
        max={20}
        step={0.5}
        unit="px"
        onChange={(letterSpacing) => onUpdate({ letterSpacing })}
      />

      {/* Line Height */}
      <Slider
        label="Line Height"
        value={element.lineHeight}
        min={0.8}
        max={3}
        step={0.1}
        onChange={(lineHeight) => onUpdate({ lineHeight })}
      />

      {/* Text Shadow */}
      <div className="space-y-3">
        <Toggle
          label="Text Shadow"
          checked={element.shadow !== null}
          onChange={(enabled) =>
            onUpdate({
              shadow: enabled
                ? { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.5)' }
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
              max={30}
              step={1}
              unit="px"
              onChange={(blur) => onUpdate({ shadow: { ...element.shadow!, blur } })}
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

      {/* Text Background */}
      <div className="space-y-3">
        <Toggle
          label="Text Background"
          checked={element.background !== null}
          onChange={(enabled) =>
            onUpdate({
              background: enabled
                ? { color: 'rgba(0,0,0,0.5)', paddingX: 16, paddingY: 8, borderRadius: 4 }
                : null,
            })
          }
        />

        {element.background && (
          <div className="pl-4 space-y-3 border-l-2 border-violet-500/20">
            <ColorPicker
              label="Background Color"
              value={element.background.color}
              onChange={(color) =>
                onUpdate({ background: { ...element.background!, color } })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Padding X"
                value={element.background.paddingX}
                min={0}
                max={100}
                onChange={(paddingX) =>
                  onUpdate({ background: { ...element.background!, paddingX } })
                }
                unit="px"
              />
              <NumberInput
                label="Padding Y"
                value={element.background.paddingY}
                min={0}
                max={100}
                onChange={(paddingY) =>
                  onUpdate({ background: { ...element.background!, paddingY } })
                }
                unit="px"
              />
            </div>
            <Slider
              label="Border Radius"
              value={element.background.borderRadius}
              min={0}
              max={50}
              step={1}
              unit="px"
              onChange={(borderRadius) =>
                onUpdate({ background: { ...element.background!, borderRadius } })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TextPropertyEditor;
