'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCreativeStore } from '@/store/useCreativeStore';
import { HERO_TEMPLATES } from '@/lib/prompt-templates';
import type { ModelSceneStyle } from '@/types';

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

// Copy space options - where to leave room for text/callouts
const COPY_SPACE_OPTIONS: { value: ModelSceneStyle['copySpace']; label: string; description: string }[] = [
  { value: 'left', label: 'Copy Left', description: 'Model on right, left clear for callouts' },
  { value: 'right', label: 'Copy Right', description: 'Model on left, right clear' },
  { value: 'top', label: 'Copy Top', description: 'Model lower, top clear for headline' },
  { value: 'bottom', label: 'Copy Bottom', description: 'Model upper, bottom clear' },
  { value: 'center', label: 'Centered', description: 'Model centered, no copy space' },
];

// Hero template options for the selector
const HERO_TEMPLATE_OPTIONS = [
  { value: '', label: 'Use Basic Settings Above' },
  ...HERO_TEMPLATES.map(t => ({ value: t.id, label: t.name })),
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
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full px-4 py-2.5 text-sm rounded-xl premium-select appearance-none cursor-pointer pr-10"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon className="w-4 h-4 text-violet-500" />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4 section-header-gradient">
      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
        {icon}
      </span>
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ModelScenePanel() {
  const {
    styleSettings,
    setModelSceneStyle,
    nextStep,
    prevStep,
  } = useCreativeStore();

  const { modelScene } = styleSettings;
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  // Get selected template details
  const selectedTemplate = modelScene.selectedHeroTemplate
    ? HERO_TEMPLATES.find(t => t.id === modelScene.selectedHeroTemplate)
    : null;

  // Check if using template mode
  const usingTemplate = !!modelScene.selectedHeroTemplate;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          <span className="gradient-text">Model & Scene Settings</span>
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Choose a style template or customize with basic settings
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-6 shadow-xl shadow-violet-500/5">
        {/* Hero Style Template Section - NEW */}
        <div>
          <SectionHeader title="Hero Style Template" icon={<FlashIcon />} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            90s/2000s direct flash aesthetic - raw, unpolished, authentic
          </p>

          {/* Template Selector */}
          <div className="space-y-3">
            <Select
              label="Choose Style"
              value={modelScene.selectedHeroTemplate || ''}
              options={HERO_TEMPLATE_OPTIONS}
              onChange={(v) => setModelSceneStyle({ selectedHeroTemplate: v || null })}
            />

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                  className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium"
                >
                  <ChevronIcon className={`w-4 h-4 transition-transform duration-300 ${showTemplatePreview ? 'rotate-180' : ''}`} />
                  {showTemplatePreview ? 'Hide' : 'Show'} template details
                </button>

                {showTemplatePreview && (
                  <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 border border-violet-200/50 dark:border-violet-500/20 text-sm space-y-3 animate-slide-down">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                      <strong className="text-zinc-700 dark:text-zinc-300">Pose:</strong>
                      <span className="text-zinc-600 dark:text-zinc-400">{selectedTemplate.subject.pose}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      <strong className="text-zinc-700 dark:text-zinc-300">Camera:</strong>
                      <span className="text-zinc-600 dark:text-zinc-400">{selectedTemplate.camera.angle}, {selectedTemplate.camera.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      <strong className="text-zinc-700 dark:text-zinc-300">Lighting:</strong>
                      <span className="text-zinc-600 dark:text-zinc-400">{selectedTemplate.lighting.style}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <strong className="text-zinc-700 dark:text-zinc-300">Environment:</strong>
                      <span className="text-zinc-600 dark:text-zinc-400">{selectedTemplate.environment.background}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <strong className="text-zinc-700 dark:text-zinc-300">Aesthetic:</strong>
                      <span className="text-zinc-600 dark:text-zinc-400">{selectedTemplate.aesthetic.look}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Model Section */}
        <div className="pt-6 mt-2 border-t border-violet-200/30 dark:border-violet-500/10">
          <SectionHeader title="Model" icon={<UserIcon />} />
          <div className="grid grid-cols-3 gap-4">
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
          </div>
        </div>

        {/* Composition Section - Copy Space */}
        <div className="pt-6 mt-2 border-t border-violet-200/30 dark:border-violet-500/10">
          <SectionHeader title="Composition" icon={<FrameIcon />} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Where to leave empty space for text and callout overlays
          </p>
          <div className="space-y-3">
            <Select
              label="Copy Space"
              value={modelScene.copySpace}
              options={COPY_SPACE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              onChange={(v) => setModelSceneStyle({ copySpace: v })}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {COPY_SPACE_OPTIONS.find(o => o.value === modelScene.copySpace)?.description}
            </p>
          </div>
        </div>

        {/* Scene Section - Only show when NOT using template */}
        {!usingTemplate && (
          <div className="pt-6 mt-2 border-t border-violet-200/30 dark:border-violet-500/10">
            <SectionHeader title="Scene & Style" icon={<SunIcon />} />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Basic settings (ignored when using a template above)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Pose"
                value={modelScene.pose}
                options={POSE_OPTIONS}
                onChange={(v) => setModelSceneStyle({ pose: v })}
              />
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
        )}

        {/* Custom Prompt Addition - NEW */}
        <div className="pt-6 mt-2 border-t border-violet-200/30 dark:border-violet-500/10">
          <SectionHeader title="Custom Additions" icon={<PencilIcon />} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Add specific details like props, expressions, or actions (optional)
          </p>
          <textarea
            value={modelScene.customPromptAddition}
            onChange={(e) => setModelSceneStyle({ customPromptAddition: e.target.value })}
            placeholder="e.g., holding a coffee cup, wind in hair, hands in pockets, looking away from camera..."
            rows={3}
            className="w-full px-4 py-3 text-sm rounded-xl premium-input resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Add creative direction for AI
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              modelScene.customPromptAddition.length > 400
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
            }`}>
              {modelScene.customPromptAddition.length} / 500
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={prevStep} className="group">
          <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <Button onClick={nextStep} className="btn-gradient text-white border-0 group">
          <SparklesIcon className="w-4 h-4 mr-2 animate-sparkle" />
          Generate Hero
          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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

function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function FlashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function ChevronIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function PencilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function FrameIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

export default ModelScenePanel;
