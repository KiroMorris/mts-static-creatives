'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LivePreview } from '@/components/preview/LivePreview';
import { useCreativeStore } from '@/store/useCreativeStore';
import { FontSelector } from '@/components/ui/FontSelector';
import type { FontFamily, FontWeight } from '@/types';

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
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
        <span className="text-xs text-zinc-600 dark:text-zinc-300">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
      />
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
    <div className="space-y-1">
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith('#') ? value : '#FFFFFF'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
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
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

// ============================================================================
// Section Components
// ============================================================================

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
        {title}
      </h3>
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
    setHeroStyle,
    setTextStyle,
    setCalloutStyle,
    nextStep,
    prevStep,
  } = useCreativeStore();

  const [activeTab, setActiveTab] = useState<'hero' | 'text' | 'callout'>('hero');

  const { hero, text, callout } = styleSettings;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Customize Layout
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Adjust text and callout styling - see changes in real-time
        </p>
      </div>

      {/* Main content - side by side layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Preview panel - sticky on desktop */}
        <div className="w-full lg:w-[340px] lg:sticky lg:top-32 flex-shrink-0 order-1 lg:order-none">
          <LivePreview
            heroImage={heroImage}
            calloutImages={calloutImages}
            headline={headline || 'Your Headline'}
            subtitle={subtitle || 'Your Subtitle'}
            heroStyle={hero}
            textStyle={text}
            calloutStyle={callout}
          />
        </div>

        {/* Controls panel */}
        <div className="flex-1 min-w-0 max-w-xl">
          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 mb-6">
        {[
          { id: 'hero' as const, label: 'Hero', icon: <ImageIcon /> },
          { id: 'text' as const, label: 'Text', icon: <TextIcon /> },
          { id: 'callout' as const, label: 'Callouts', icon: <GridIcon /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6">
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

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
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

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
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

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
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

            {/* Detail Callout Zoom */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <SectionHeader title="Detail Callout" icon={<ZoomIcon />} />
              <div className="space-y-4">
                <Slider
                  label="Zoom"
                  value={callout.detail.zoom}
                  min={1}
                  max={2}
                  step={0.1}
                  unit="x"
                  onChange={(v) => setCalloutStyle({ detail: { ...callout.detail, zoom: v } })}
                />
                <Slider
                  label="Focus X"
                  value={callout.detail.focusX}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => setCalloutStyle({ detail: { ...callout.detail, focusX: v } })}
                />
                <Slider
                  label="Focus Y"
                  value={callout.detail.focusY}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => setCalloutStyle({ detail: { ...callout.detail, focusY: v } })}
                />
              </div>
            </div>

            {/* Fit Callout Zoom */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <SectionHeader title="Fit Callout" icon={<ZoomIcon />} />
              <div className="space-y-4">
                <Slider
                  label="Zoom"
                  value={callout.fit.zoom}
                  min={1}
                  max={2}
                  step={0.1}
                  unit="x"
                  onChange={(v) => setCalloutStyle({ fit: { ...callout.fit, zoom: v } })}
                />
                <Slider
                  label="Focus X"
                  value={callout.fit.focusX}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => setCalloutStyle({ fit: { ...callout.fit, focusX: v } })}
                />
                <Slider
                  label="Focus Y"
                  value={callout.fit.focusY}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => setCalloutStyle({ fit: { ...callout.fit, focusY: v } })}
                />
              </div>
            </div>

            {/* Pose Callout Zoom */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <SectionHeader title="Pose Callout" icon={<ZoomIcon />} />
              <div className="space-y-4">
                <Slider
                  label="Zoom"
                  value={callout.pose.zoom}
                  min={1}
                  max={2}
                  step={0.1}
                  unit="x"
                  onChange={(v) => setCalloutStyle({ pose: { ...callout.pose, zoom: v } })}
                />
                <Slider
                  label="Focus X"
                  value={callout.pose.focusX}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => setCalloutStyle({ pose: { ...callout.pose, focusX: v } })}
                />
                <Slider
                  label="Focus Y"
                  value={callout.pose.focusY}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(v) => setCalloutStyle({ pose: { ...callout.pose, focusY: v } })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue to Export
          <ArrowRightIcon className="w-4 h-4 ml-1" />
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
