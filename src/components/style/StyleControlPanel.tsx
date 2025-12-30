'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCreativeStore } from '@/store/useCreativeStore';
import type { ModelSceneStyle, TextStyle, CalloutStyle } from '@/types';

// ============================================================================
// Option Definitions
// ============================================================================

const MODEL_GENDER_OPTIONS: { value: ModelSceneStyle['modelGender']; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const MODEL_AGE_OPTIONS: { value: ModelSceneStyle['modelAge']; label: string }[] = [
  { value: 'young', label: 'Young (18-25)' },
  { value: 'middle', label: 'Middle (26-40)' },
  { value: 'mature', label: 'Mature (40+)' },
];

const MODEL_ETHNICITY_OPTIONS: { value: ModelSceneStyle['modelEthnicity']; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'caucasian', label: 'Caucasian' },
  { value: 'african', label: 'African' },
  { value: 'asian', label: 'Asian' },
  { value: 'hispanic', label: 'Hispanic' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
  { value: 'south-asian', label: 'South Asian' },
];

const POSE_OPTIONS: { value: ModelSceneStyle['pose']; label: string }[] = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'casual', label: 'Casual' },
  { value: 'confident', label: 'Confident' },
];

const SETTING_OPTIONS: { value: ModelSceneStyle['setting']; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'urban', label: 'Urban' },
  { value: 'home', label: 'Home/Cozy' },
  { value: 'minimalist', label: 'Minimalist' },
];

const MOOD_OPTIONS: { value: ModelSceneStyle['mood']; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'edgy', label: 'Edgy' },
  { value: 'cozy', label: 'Cozy' },
  { value: 'professional', label: 'Professional' },
];

const LIGHTING_OPTIONS: { value: ModelSceneStyle['lighting']; label: string }[] = [
  { value: 'natural', label: 'Natural' },
  { value: 'studio', label: 'Studio' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'soft', label: 'Soft' },
];

const POSITION_OPTIONS: { value: CalloutStyle['position']; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const VERTICAL_POSITION_OPTIONS: { value: CalloutStyle['verticalPosition']; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' },
];

const HEADLINE_POSITION_OPTIONS: { value: TextStyle['headlinePosition']; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' },
];

// ============================================================================
// Sub-Components
// ============================================================================

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
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
    styleSettings,
    setModelSceneStyle,
    setTextStyle,
    setCalloutStyle,
    nextStep,
    prevStep,
  } = useCreativeStore();

  const [activeTab, setActiveTab] = useState<'model' | 'text' | 'callout'>('model');

  const { modelScene, text, callout } = styleSettings;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Customize Your Style
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Configure the look and feel of your creative
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 mb-6">
        {[
          { id: 'model' as const, label: 'Model & Scene', icon: <UserIcon /> },
          { id: 'text' as const, label: 'Text Style', icon: <TextIcon /> },
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
        {activeTab === 'model' && (
          <div className="space-y-6">
            <SectionHeader title="Model Appearance" icon={<UserIcon />} />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Gender"
                value={modelScene.modelGender}
                options={MODEL_GENDER_OPTIONS}
                onChange={(v) => setModelSceneStyle({ modelGender: v })}
              />
              <Select
                label="Age Range"
                value={modelScene.modelAge}
                options={MODEL_AGE_OPTIONS}
                onChange={(v) => setModelSceneStyle({ modelAge: v })}
              />
              <Select
                label="Ethnicity"
                value={modelScene.modelEthnicity}
                options={MODEL_ETHNICITY_OPTIONS}
                onChange={(v) => setModelSceneStyle({ modelEthnicity: v })}
              />
              <Select
                label="Pose"
                value={modelScene.pose}
                options={POSE_OPTIONS}
                onChange={(v) => setModelSceneStyle({ pose: v })}
              />
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <SectionHeader title="Scene & Lighting" icon={<SunIcon />} />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Setting"
                  value={modelScene.setting}
                  options={SETTING_OPTIONS}
                  onChange={(v) => setModelSceneStyle({ setting: v })}
                />
                <Select
                  label="Mood"
                  value={modelScene.mood}
                  options={MOOD_OPTIONS}
                  onChange={(v) => setModelSceneStyle({ mood: v })}
                />
                <Select
                  label="Lighting"
                  value={modelScene.lighting}
                  options={LIGHTING_OPTIONS}
                  onChange={(v) => setModelSceneStyle({ lighting: v })}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-6">
            <SectionHeader title="Headline" icon={<TextIcon />} />
            <div className="space-y-4">
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
              <Select
                label="Vertical Position"
                value={text.headlinePosition}
                options={HEADLINE_POSITION_OPTIONS}
                onChange={(v) => setTextStyle({ headlinePosition: v })}
              />
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <SectionHeader title="Subtitle" icon={<TextIcon />} />
              <div className="space-y-4">
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
              <SectionHeader title="Position" icon={<GridIcon />} />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Horizontal"
                  value={callout.position}
                  options={POSITION_OPTIONS}
                  onChange={(v) => setCalloutStyle({ position: v })}
                />
                <Select
                  label="Vertical"
                  value={callout.verticalPosition}
                  options={VERTICAL_POSITION_OPTIONS}
                  onChange={(v) => setCalloutStyle({ verticalPosition: v })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue to Generate
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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

function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
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
