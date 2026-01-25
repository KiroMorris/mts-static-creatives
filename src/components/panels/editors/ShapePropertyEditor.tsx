'use client';

import React from 'react';
import { Slider, ColorPicker, Select } from '../ElementPropertyPanel';
import type { ShapeElement, ShapeType } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface ShapePropertyEditorProps {
  element: ShapeElement;
  onUpdate: (updates: Partial<ShapeElement>) => void;
}

// ============================================================================
// Shape Options
// ============================================================================

const SHAPE_OPTIONS: { value: ShapeType; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'line', label: 'Line' },
  { value: 'triangle', label: 'Triangle' },
];

// ============================================================================
// Shape Preview Icons
// ============================================================================

function ShapePreviewIcon({ type, fillColor, strokeColor }: { type: ShapeType; fillColor: string; strokeColor: string }) {
  const size = 32;

  switch (type) {
    case 'rectangle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect
            x="4"
            y="8"
            width="24"
            height="16"
            rx="2"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      );
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="12"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      );
    case 'line':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <line
            x1="4"
            y1="16"
            x2="28"
            y2="16"
            stroke={strokeColor || fillColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon
            points="16,4 28,28 4,28"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return null;
  }
}

// ============================================================================
// Component
// ============================================================================

export function ShapePropertyEditor({ element, onUpdate }: ShapePropertyEditorProps) {
  const showBorderRadius = element.shapeType === 'rectangle';
  const showFill = element.shapeType !== 'line';

  return (
    <div className="space-y-4">
      {/* Shape Type Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Shape Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SHAPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdate({ shapeType: option.value })}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                ${element.shapeType === option.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600'
                }
              `}
            >
              <ShapePreviewIcon
                type={option.value}
                fillColor={element.fillColor}
                strokeColor={element.strokeColor}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Fill Color (not for lines) */}
      {showFill && (
        <ColorPicker
          label="Fill Color"
          value={element.fillColor}
          onChange={(fillColor) => onUpdate({ fillColor })}
        />
      )}

      {/* Stroke Color */}
      <ColorPicker
        label="Stroke Color"
        value={element.strokeColor}
        onChange={(strokeColor) => onUpdate({ strokeColor })}
      />

      {/* Stroke Width */}
      <Slider
        label="Stroke Width"
        value={element.strokeWidth}
        min={0}
        max={20}
        step={1}
        unit="px"
        onChange={(strokeWidth) => onUpdate({ strokeWidth })}
      />

      {/* Border Radius (only for rectangles) */}
      {showBorderRadius && (
        <Slider
          label="Border Radius"
          value={element.borderRadius}
          min={0}
          max={100}
          step={1}
          unit="px"
          onChange={(borderRadius) => onUpdate({ borderRadius })}
        />
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Quick Actions
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ fillColor: 'transparent' })}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          >
            No Fill
          </button>
          <button
            onClick={() => onUpdate({ strokeColor: 'transparent', strokeWidth: 0 })}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          >
            No Stroke
          </button>
          {showBorderRadius && (
            <>
              <button
                onClick={() => onUpdate({ borderRadius: 0 })}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                Sharp
              </button>
              <button
                onClick={() => onUpdate({ borderRadius: Math.min(element.size.width, element.size.height) / 2 })}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                Pill
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShapePropertyEditor;
