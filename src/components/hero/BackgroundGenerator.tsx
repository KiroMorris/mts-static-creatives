'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  BACKGROUND_PRESETS,
  BACKGROUND_CATEGORIES,
  CUSTOM_PROMPT_SUGGESTIONS,
  type BackgroundPreset,
  type BackgroundCategory,
  type BackgroundPresetConfig,
} from '@/lib/background-presets';

// API endpoint
const API_GENERATE_BACKGROUND = '/api/generate-background';

interface BackgroundGeneratorProps {
  productImageUrl?: string;
  onBackgroundGenerated: (backgroundUrl: string, placement: {
    scale: number;
    x: number;
    y: number;
    shadow: boolean;
    reflection: boolean;
  }) => void;
  onClose?: () => void;
  currentBackground?: string;
}

type TabType = 'presets' | 'custom';

export function BackgroundGenerator({
  productImageUrl,
  onBackgroundGenerated,
  onClose,
  currentBackground,
}: BackgroundGeneratorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [activeCategory, setActiveCategory] = useState<BackgroundCategory>('studio');
  const [selectedPreset, setSelectedPreset] = useState<BackgroundPreset | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [colorScheme, setColorScheme] = useState('');
  const [promptAdditions, setPromptAdditions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedBackground, setGeneratedBackground] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get presets for active category
  const categoryPresets = Object.values(BACKGROUND_PRESETS).filter(
    (preset) => preset.category === activeCategory
  );

  const generateBackground = useCallback(async () => {
    if (activeTab === 'presets' && !selectedPreset) {
      setError('Please select a background preset');
      return;
    }
    if (activeTab === 'custom' && !customPrompt.trim()) {
      setError('Please enter a custom prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    try {
      const requestBody: Record<string, unknown> = {
        aspectRatio: '9:16',
      };

      if (activeTab === 'presets' && selectedPreset) {
        requestBody.presetId = selectedPreset;
        if (promptAdditions.trim()) {
          requestBody.promptAdditions = promptAdditions;
        }
        if (colorScheme.trim()) {
          requestBody.colorScheme = colorScheme;
        }
      } else {
        requestBody.customPrompt = customPrompt;
      }

      if (productImageUrl) {
        requestBody.productImageUrl = productImageUrl;
      }

      const response = await fetch(API_GENERATE_BACKGROUND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to generate background');
      }

      setGeneratedBackground(data.data.backgroundImageUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate background';
      setError(message);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  }, [activeTab, selectedPreset, customPrompt, colorScheme, promptAdditions, productImageUrl]);

  const handleApplyBackground = () => {
    if (!generatedBackground) return;

    const preset = selectedPreset ? BACKGROUND_PRESETS[selectedPreset] : null;
    const placement = preset?.defaultPlacement || {
      scale: 0.8,
      x: 50,
      y: 50,
      shadow: true,
      reflection: false,
    };

    onBackgroundGenerated(generatedBackground, placement);
  };

  const handleSelectPreset = (presetId: BackgroundPreset) => {
    setSelectedPreset(presetId);
    setGeneratedBackground(null);
    setError(null);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCustomPrompt(suggestion);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            AI Background Generator
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Generate custom backgrounds for your product images
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-zinc-500" />
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <PresetIcon className="w-4 h-4 inline-block mr-2" />
              Presets
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <WandIcon className="w-4 h-4 inline-block mr-2" />
              Custom Prompt
            </button>
          </div>

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {BACKGROUND_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      activeCategory === category.id
                        ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Preset Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {categoryPresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isSelected={selectedPreset === preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                  />
                ))}
              </div>

              {/* Preset Modifications */}
              {selectedPreset && (
                <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Customize (Optional)
                  </h4>
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      Color Scheme
                    </label>
                    <input
                      type="text"
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      placeholder="e.g., warm earth tones, cool blues"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      Additional Details
                    </label>
                    <input
                      type="text"
                      value={promptAdditions}
                      onChange={(e) => setPromptAdditions(e.target.value)}
                      placeholder="e.g., with vintage feel, more dramatic shadows"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Prompt Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Describe your background
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the background you want to generate..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  Try these suggestions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {CUSTOM_PROMPT_SUGGESTIONS.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            onClick={generateBackground}
            disabled={isGenerating || (activeTab === 'presets' && !selectedPreset) || (activeTab === 'custom' && !customPrompt.trim())}
            isLoading={isGenerating}
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Background
          </Button>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Preview
          </h3>

          <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-lg">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner
                  size="xl"
                  label="Generating background..."
                  showProgress
                  progress={generationProgress}
                />
              </div>
            ) : generatedBackground ? (
              <Image
                src={generatedBackground}
                alt="Generated background"
                fill
                className="object-cover"
              />
            ) : currentBackground ? (
              <Image
                src={currentBackground}
                alt="Current background"
                fill
                className="object-cover opacity-50"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <ImagePlaceholderIcon className="w-16 h-16 mb-4" />
                <p className="text-sm text-center px-4">
                  Select a preset or enter a custom prompt to generate a background
                </p>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {generatedBackground && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={generateBackground}
                disabled={isGenerating}
                className="flex-1"
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="gradient"
                onClick={handleApplyBackground}
                className="flex-1"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Apply Background
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Preset Card Component
function PresetCard({
  preset,
  isSelected,
  onClick,
}: {
  preset: BackgroundPresetConfig;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800'
      }`}
    >
      {/* Color swatches */}
      <div className="flex gap-1 mb-2">
        {preset.suggestedColors?.map((color, index) => (
          <div
            key={index}
            className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-600"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
        {preset.name}
      </h4>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
        {preset.description}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded">
          {preset.lighting}
        </span>
      </div>
    </button>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PresetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

export default BackgroundGenerator;
