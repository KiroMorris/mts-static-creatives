'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { LivePreview } from '@/components/preview/LivePreview';
import { useCreativeStore } from '@/store/useCreativeStore';
import { FontSelector } from '@/components/ui/FontSelector';
import type { FontFamily, FontWeight, CalloutType } from '@/types';

// ============================================================================
// Sub-Components
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

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: SliderProps) {
  // Calculate fill percentage for visual feedback
  const fillPercent = ((value - min) / (max - min)) * 100;

  // Prevent drag events from bubbling up to parent draggable elements
  const stopDragPropagation = (e: React.DragEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="space-y-3 group"
      draggable={false}
      onDragStart={stopDragPropagation}
      onMouseDown={stopDragPropagation}
    >
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {label}
        </label>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-cyan-500/10 dark:from-violet-500/20 dark:via-pink-500/20 dark:to-cyan-500/20 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/30 shadow-sm">
          {value}{unit}
        </span>
      </div>
      <div
        className="relative h-2"
        draggable={false}
        onDragStart={stopDragPropagation}
      >
        {/* Track background with subtle glow */}
        <div className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-700/50 overflow-hidden">
          {/* Animated gradient fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 transition-all duration-150 ease-out"
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
          onMouseDown={stopDragPropagation}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Custom thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-[3px] border-violet-500 shadow-lg shadow-violet-500/30 pointer-events-none transition-all duration-150 hover:scale-110 group-hover:border-pink-500 group-hover:shadow-pink-500/30"
          style={{ left: `calc(${fillPercent}% - 10px)` }}
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

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div className="relative group">
          {/* Gradient border ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 rounded-xl opacity-50 group-hover:opacity-100 blur-sm transition-opacity" />
          <div className="relative">
            <input
              type="color"
              value={value.startsWith('#') ? value : '#FFFFFF'}
              onChange={(e) => onChange(e.target.value)}
              className="w-14 h-14 rounded-xl cursor-pointer border-4 border-white dark:border-zinc-800 shadow-lg hover:scale-105 transition-transform"
            />
            <div
              className="absolute inset-1 rounded-lg pointer-events-none shadow-inner"
              style={{ backgroundColor: value.startsWith('#') ? value : '#FFFFFF' }}
            />
          </div>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white font-mono focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div
              className="w-5 h-5 rounded-md shadow-inner"
              style={{ backgroundColor: value.startsWith('#') ? value : '#FFFFFF' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-gradient-to-r hover:from-violet-500/5 hover:to-pink-500/5 dark:hover:from-violet-500/10 dark:hover:to-pink-500/10 transition-all -mx-3">
      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
          checked
            ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 shadow-lg shadow-violet-500/40'
            : 'bg-zinc-200 dark:bg-zinc-700/70'
        }`}
      >
        {/* Glow effect when active */}
        {checked && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 blur-md opacity-50" />
        )}
        <span
          className={`relative inline-block h-6 w-6 transform rounded-full transition-all duration-300 shadow-lg ${
            checked
              ? 'translate-x-7 bg-white scale-110'
              : 'translate-x-1 bg-white dark:bg-zinc-300'
          }`}
        >
          {/* Inner dot indicator */}
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}>
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
          </span>
        </span>
      </button>
    </label>
  );
}

// ============================================================================
// Section Components
// ============================================================================

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      {/* Icon with gradient background and glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl blur-md opacity-40" />
        <span className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
          {icon}
        </span>
      </div>
      {/* Title with gradient accent line */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">
          {title}
        </h3>
        <div className="mt-1.5 h-0.5 w-16 bg-gradient-to-r from-violet-500 via-pink-500 to-transparent rounded-full" />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function StyleControlPanel() {
  const {
    heroImage,
    calloutImages,
    headline,
    subtitle,
    styleSettings,
    calloutOrder,
    setHeroStyle,
    setTextStyle,
    setCalloutStyle,
    reorderCallouts,
    nextStep,
    prevStep,
  } = useCreativeStore();

  const [activeTab, setActiveTab] = useState<'hero' | 'text' | 'callout'>('hero');
  const [draggedItem, setDraggedItem] = useState<CalloutType | null>(null);
  const dragOverItem = useRef<CalloutType | null>(null);

  const { hero, text, callout } = styleSettings;

  // Drag and drop handlers for callout reordering
  const handleDragStart = (type: CalloutType) => {
    setDraggedItem(type);
  };

  const handleDragOver = (e: React.DragEvent, type: CalloutType) => {
    e.preventDefault();
    dragOverItem.current = type;
  };

  const handleDrop = () => {
    if (draggedItem && dragOverItem.current && draggedItem !== dragOverItem.current) {
      const newOrder = [...calloutOrder] as [CalloutType, CalloutType, CalloutType];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const dropIndex = newOrder.indexOf(dragOverItem.current);

      // Swap positions
      newOrder[draggedIndex] = dragOverItem.current;
      newOrder[dropIndex] = draggedItem;

      reorderCallouts(newOrder);
    }
    setDraggedItem(null);
    dragOverItem.current = null;
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    dragOverItem.current = null;
  };

  // Get callout label for display
  const getCalloutLabel = (type: CalloutType): string => {
    switch (type) {
      case 'detail': return 'Detail';
      case 'fit': return 'Fit';
      case 'pose': return 'Pose';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with animated gradient */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-cyan-500/10 border border-violet-500/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse" />
          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Live Preview Mode</span>
        </div>
        <h2 className="text-3xl font-bold mb-3">
          <span className="gradient-text-rainbow">Customize Layout</span>
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Fine-tune your creative with precision controls. Changes update in real-time.
        </p>
      </div>

      {/* Main content - side by side layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Preview panel - sticky on desktop, stays visible when scrolling */}
        <div className="w-full lg:w-[340px] lg:sticky lg:top-[180px] flex-shrink-0 order-1 lg:order-none self-start">
          <LivePreview
            heroImage={heroImage}
            calloutImages={calloutImages}
            headline={headline || 'Your Headline'}
            subtitle={subtitle || 'Your Subtitle'}
            heroStyle={hero}
            textStyle={text}
            calloutStyle={callout}
            calloutOrder={calloutOrder}
          />
        </div>

        {/* Controls panel */}
        <div className="flex-1 min-w-0 max-w-xl">
          {/* Tab Navigation - Premium Vibrant */}
          <div className="relative p-1 rounded-2xl bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-cyan-500/10 dark:from-violet-500/20 dark:via-pink-500/20 dark:to-cyan-500/20 mb-8 shadow-lg shadow-violet-500/5">
            {/* Animated background glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 opacity-10 blur-xl" />
            <div className="relative flex gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-1">
              {[
                { id: 'hero' as const, label: 'Hero', icon: <ImageIcon className="w-5 h-5" />, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40' },
                { id: 'text' as const, label: 'Text', icon: <TextIcon className="w-5 h-5" />, gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/40' },
                { id: 'callout' as const, label: 'Callouts', icon: <GridIcon className="w-5 h-5" />, gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/40' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.shadow} scale-[1.02]`
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {/* Active indicator glow */}
                  {activeTab === tab.id && (
                    <span className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.gradient} blur-md opacity-40`} />
                  )}
                  <span className="relative">{tab.icon}</span>
                  <span className="relative">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

      {/* Tab Content */}
      <div className="glass-card rounded-2xl p-6 shadow-xl shadow-violet-500/5">
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <SectionHeader title="Hero Image" icon={<ImageIcon />} />
            <div className="space-y-4">
              <Slider
                label="Zoom"
                value={hero.zoom}
                min={1}
                max={2}
                step={0.1}
                unit="x"
                onChange={(v) => setHeroStyle({ zoom: v })}
              />
              <Slider
                label="Focus X (Horizontal)"
                value={hero.focusX}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={(v) => setHeroStyle({ focusX: v })}
              />
              <Slider
                label="Focus Y (Vertical)"
                value={hero.focusY}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={(v) => setHeroStyle({ focusY: v })}
              />
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-6">
            <SectionHeader title="Headline" icon={<TextIcon />} />
            <div className="space-y-4">
              <FontSelector
                type="headline"
                selectedFont={text.headlineFontFamily}
                selectedWeight={text.headlineFontWeight}
                onFontChange={(font: FontFamily) => setTextStyle({ headlineFontFamily: font })}
                onWeightChange={(weight: FontWeight) => setTextStyle({ headlineFontWeight: weight })}
              />
              <Slider
                label="Font Size"
                value={text.headlineFontSize}
                min={48}
                max={120}
                step={4}
                unit="px"
                onChange={(v) => setTextStyle({ headlineFontSize: v })}
              />
              <ColorPicker
                label="Headline Color"
                value={text.headlineColor}
                onChange={(v) => setTextStyle({ headlineColor: v })}
              />
              <Toggle
                label="Text Shadow"
                checked={text.headlineShadow}
                onChange={(v) => setTextStyle({ headlineShadow: v })}
              />
            </div>

            <div className="pt-6 mt-6 border-t border-violet-200/30 dark:border-violet-500/10">
              <SectionHeader title="Text Position" icon={<PositionIcon />} />
              <div className="space-y-4">
                <Slider
                  label="Horizontal (X)"
                  value={text.headlineX}
                  min={20}
                  max={600}
                  step={10}
                  unit="px"
                  onChange={(v) => setTextStyle({ headlineX: v })}
                />
                <Slider
                  label="Vertical (Y)"
                  value={text.headlineY}
                  min={100}
                  max={1600}
                  step={20}
                  unit="px"
                  onChange={(v) => setTextStyle({ headlineY: v })}
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-violet-200/30 dark:border-violet-500/10">
              <SectionHeader title="Subtitle" icon={<TextIcon />} />
              <div className="space-y-4">
                <FontSelector
                  type="subtitle"
                  selectedFont={text.subtitleFontFamily}
                  selectedWeight={text.subtitleFontWeight}
                  onFontChange={(font: FontFamily) => setTextStyle({ subtitleFontFamily: font })}
                  onWeightChange={(weight: FontWeight) => setTextStyle({ subtitleFontWeight: weight })}
                />
                <Slider
                  label="Font Size"
                  value={text.subtitleFontSize}
                  min={12}
                  max={32}
                  step={2}
                  unit="px"
                  onChange={(v) => setTextStyle({ subtitleFontSize: v })}
                />
                <ColorPicker
                  label="Subtitle Color"
                  value={text.subtitleColor}
                  onChange={(v) => setTextStyle({ subtitleColor: v })}
                />
                <Slider
                  label="Letter Spacing"
                  value={text.subtitleLetterSpacing}
                  min={0}
                  max={10}
                  step={1}
                  unit="px"
                  onChange={(v) => setTextStyle({ subtitleLetterSpacing: v })}
                />
                <Slider
                  label="Gap from Headline"
                  value={text.subtitleGap}
                  min={10}
                  max={60}
                  step={5}
                  unit="px"
                  onChange={(v) => setTextStyle({ subtitleGap: v })}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'callout' && (
          <div className="space-y-6">
            <SectionHeader title="Callout Images" icon={<GridIcon />} />
            <div className="space-y-4">
              <Slider
                label="Size"
                value={callout.size}
                min={120}
                max={300}
                step={10}
                unit="px"
                onChange={(v) => setCalloutStyle({ size: v })}
              />
              <Slider
                label="Border Width"
                value={callout.borderWidth}
                min={0}
                max={10}
                step={1}
                unit="px"
                onChange={(v) => setCalloutStyle({ borderWidth: v })}
              />
              <ColorPicker
                label="Border Color"
                value={callout.borderColor}
                onChange={(v) => setCalloutStyle({ borderColor: v })}
              />
              <Slider
                label="Corner Radius"
                value={callout.borderRadius}
                min={0}
                max={24}
                step={2}
                unit="px"
                onChange={(v) => setCalloutStyle({ borderRadius: v })}
              />
              <Slider
                label="Gap Between"
                value={callout.gap}
                min={8}
                max={40}
                step={4}
                unit="px"
                onChange={(v) => setCalloutStyle({ gap: v })}
              />
            </div>

            <div className="pt-6 mt-6 border-t border-violet-200/30 dark:border-violet-500/10">
              <SectionHeader title="Position" icon={<PositionIcon />} />
              <div className="space-y-4">
                <Slider
                  label="Horizontal (X)"
                  value={callout.x}
                  min={20}
                  max={880}
                  step={10}
                  unit="px"
                  onChange={(v) => setCalloutStyle({ x: v })}
                />
                <Slider
                  label="Vertical (Y)"
                  value={callout.y}
                  min={100}
                  max={1400}
                  step={20}
                  unit="px"
                  onChange={(v) => setCalloutStyle({ y: v })}
                />
              </div>
            </div>

            {/* Draggable Callout Order Section */}
            <div className="pt-6 mt-6 border-t border-violet-200/30 dark:border-violet-500/10">
              <div className="flex items-center justify-between mb-5">
                <SectionHeader title="Callout Order & Zoom" icon={<ZoomIcon />} />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20">
                  <DragIcon className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Drag to reorder</span>
                </div>
              </div>

              <div className="space-y-4">
                {calloutOrder.map((type, index) => (
                  <div
                    key={type}
                    onDragOver={(e) => handleDragOver(e, type)}
                    onDrop={handleDrop}
                    className={`
                      relative p-5 rounded-2xl border-2 transition-all duration-300
                      ${draggedItem === type
                        ? 'border-violet-500 bg-gradient-to-r from-violet-500/15 to-pink-500/15 opacity-70 scale-[0.98] rotate-[-1deg] shadow-2xl shadow-violet-500/30'
                        : 'border-zinc-200/80 dark:border-zinc-700/50 hover:border-violet-400 dark:hover:border-violet-500 bg-white/80 dark:bg-zinc-800/50 hover:shadow-lg hover:shadow-violet-500/10'
                      }
                      backdrop-blur-sm
                    `}
                  >
                    {/* Glow effect when dragging */}
                    {draggedItem === type && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 opacity-20 blur-xl" />
                    )}

                    {/* Callout Header with Order Number */}
                    <div className="relative flex items-center gap-4 mb-5">
                      {/* Drag Handle with number - ONLY this part is draggable */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl blur-sm opacity-50" />
                          <span className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            {index + 1}
                          </span>
                        </div>
                        {/* Drag Handle - draggable area */}
                        <div
                          draggable
                          onDragStart={() => handleDragStart(type)}
                          onDragEnd={handleDragEnd}
                          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700/50 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors cursor-grab active:cursor-grabbing"
                          title="Drag to reorder"
                        >
                          <DragIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500 hover:text-violet-500" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                          {getCalloutLabel(type)}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Adjust zoom and focus</p>
                      </div>
                    </div>

                    {/* Callout Controls */}
                    <div className="relative space-y-4 pl-11">
                      <Slider
                        label="Zoom Level"
                        value={callout[type].zoom}
                        min={1}
                        max={2}
                        step={0.1}
                        unit="x"
                        onChange={(v) => setCalloutStyle({ [type]: { ...callout[type], zoom: v } })}
                      />
                      <Slider
                        label="Focus X (Horizontal)"
                        value={callout[type].focusX}
                        min={0}
                        max={100}
                        step={5}
                        unit="%"
                        onChange={(v) => setCalloutStyle({ [type]: { ...callout[type], focusX: v } })}
                      />
                      <Slider
                        label="Focus Y (Vertical)"
                        value={callout[type].focusY}
                        min={0}
                        max={100}
                        step={5}
                        unit="%"
                        onChange={(v) => setCalloutStyle({ [type]: { ...callout[type], focusY: v } })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Action Buttons - Premium Styling */}
      <div className="flex justify-center gap-5 mt-12">
        <Button variant="outline" size="lg" onClick={prevStep} className="group min-w-[140px]">
          <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" />
          Back
        </Button>
        <Button variant="gradient" size="lg" onClick={nextStep} glow className="group min-w-[200px]">
          <span className="mr-2">Continue to Export</span>
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ImageIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function TextIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function GridIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function PositionIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

function ZoomIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
  );
}

function DragIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default StyleControlPanel;
