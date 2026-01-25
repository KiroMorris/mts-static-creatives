'use client';

import React from 'react';
import { useElementsStore } from '@/store/useElementsStore';
import { TextPropertyEditor } from './editors/TextPropertyEditor';
import { CTAPropertyEditor } from './editors/CTAPropertyEditor';
import { BadgePropertyEditor } from './editors/BadgePropertyEditor';
import { PriceTagPropertyEditor } from './editors/PriceTagPropertyEditor';
import { ShapePropertyEditor } from './editors/ShapePropertyEditor';
import { LogoPropertyEditor } from './editors/LogoPropertyEditor';
import type { CanvasElement } from '@/types/elements';

// ============================================================================
// Shared UI Components
// ============================================================================

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step = 1, unit = '', onChange }: SliderProps) {
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </label>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
          {value}{unit}
        </span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-100"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-violet-500 shadow-md pointer-events-none transition-all duration-100"
          style={{ left: `calc(${fillPercent}% - 8px)` }}
        />
      </div>
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#FFFFFF'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-200 dark:border-zinc-600"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
        />
      </div>
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TextInput({ label, value, placeholder, onChange }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
      />
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function NumberInput({ label, value, min, max, step = 1, unit, onChange }: NumberInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked
            ? 'bg-gradient-to-r from-violet-500 to-pink-500'
            : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="py-3">
      {label && (
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="mt-2 h-px bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-transparent" />
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function LockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function UnlockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function ArrowUpIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ArrowDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface ElementPropertyPanelProps {
  className?: string;
}

export function ElementPropertyPanel({ className = '' }: ElementPropertyPanelProps) {
  const {
    elements,
    selectedElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    lockElement,
    unlockElement,
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
  } = useElementsStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
          </svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    updateElement(selectedElement.id, updates);
  };

  const renderEditor = () => {
    switch (selectedElement.type) {
      case 'text':
        return <TextPropertyEditor element={selectedElement} onUpdate={handleUpdate} />;
      case 'cta-button':
        return <CTAPropertyEditor element={selectedElement} onUpdate={handleUpdate} />;
      case 'badge':
        return <BadgePropertyEditor element={selectedElement} onUpdate={handleUpdate} />;
      case 'price-tag':
        return <PriceTagPropertyEditor element={selectedElement} onUpdate={handleUpdate} />;
      case 'shape':
        return <ShapePropertyEditor element={selectedElement} onUpdate={handleUpdate} />;
      case 'logo':
        return <LogoPropertyEditor element={selectedElement} onUpdate={handleUpdate} />;
      default:
        return (
          <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
            Unknown element type
          </div>
        );
    }
  };

  const elementTypeName = selectedElement.type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {elementTypeName}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => duplicateElement(selectedElement.id)}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              title="Duplicate (Cmd+D)"
            >
              <CopyIcon />
            </button>
            <button
              onClick={() =>
                selectedElement.locked
                  ? unlockElement(selectedElement.id)
                  : lockElement(selectedElement.id)
              }
              className={`p-1.5 rounded-lg transition-colors ${
                selectedElement.locked
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
              title={selectedElement.locked ? 'Unlock' : 'Lock'}
            >
              {selectedElement.locked ? <LockIcon /> : <UnlockIcon />}
            </button>
            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete (Backspace)"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {/* Layer controls */}
        <div className="flex gap-1">
          <button
            onClick={() => bringToFront(selectedElement.id)}
            className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-zinc-700 dark:text-zinc-300 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            title="Bring to Front (Cmd+])"
          >
            Front
          </button>
          <button
            onClick={() => moveUp(selectedElement.id)}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Move Up"
          >
            <ArrowUpIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => moveDown(selectedElement.id)}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Move Down"
          >
            <ArrowDownIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => sendToBack(selectedElement.id)}
            className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-zinc-700 dark:text-zinc-300 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            title="Send to Back (Cmd+[)"
          >
            Back
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Common Properties */}
        <div className="space-y-3">
          <SectionDivider label="Position & Size" />

          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="X Position"
              value={selectedElement.position.x}
              onChange={(x) =>
                handleUpdate({ position: { ...selectedElement.position, x } })
              }
              unit="px"
            />
            <NumberInput
              label="Y Position"
              value={selectedElement.position.y}
              onChange={(y) =>
                handleUpdate({ position: { ...selectedElement.position, y } })
              }
              unit="px"
            />
            <NumberInput
              label="Width"
              value={selectedElement.size.width}
              min={20}
              onChange={(width) =>
                handleUpdate({ size: { ...selectedElement.size, width } })
              }
              unit="px"
            />
            <NumberInput
              label="Height"
              value={selectedElement.size.height}
              min={20}
              onChange={(height) =>
                handleUpdate({ size: { ...selectedElement.size, height } })
              }
              unit="px"
            />
          </div>

          <Slider
            label="Opacity"
            value={selectedElement.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(opacity) => handleUpdate({ opacity })}
          />

          <Slider
            label="Rotation"
            value={selectedElement.rotation}
            min={-180}
            max={180}
            step={1}
            unit="deg"
            onChange={(rotation) => handleUpdate({ rotation })}
          />
        </div>

        {/* Type-specific Properties */}
        <SectionDivider label="Properties" />
        {renderEditor()}
      </div>
    </div>
  );
}

export default ElementPropertyPanel;
