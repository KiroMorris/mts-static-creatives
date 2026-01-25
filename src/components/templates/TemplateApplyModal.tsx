'use client';

import React, { useState, useEffect } from 'react';
import { useCreativeStore } from '@/store/useCreativeStore';
import type { Template } from './TemplateSaveModal';

interface TemplateApplyModalProps {
  isOpen: boolean;
  template: Template | null;
  onClose: () => void;
  onApply: () => void;
}

interface ApplyOptions {
  applyStyleSettings: boolean;
  applyCalloutSelection: boolean;
  applyTextContent: boolean;
  applyCalloutPrompts: boolean;
}

export function TemplateApplyModal({
  isOpen,
  template,
  onClose,
  onApply,
}: TemplateApplyModalProps) {
  const [options, setOptions] = useState<ApplyOptions>({
    applyStyleSettings: true,
    applyCalloutSelection: true,
    applyTextContent: true,
    applyCalloutPrompts: true,
  });
  const [isApplying, setIsApplying] = useState(false);

  const {
    setStyleSettings,
    setAllSelectedCallouts,
    setText,
    addCalloutPrompt,
    calloutPrompts,
  } = useCreativeStore();

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleApply = async () => {
    if (!template) return;

    setIsApplying(true);

    try {
      // Apply style settings
      if (options.applyStyleSettings) {
        setStyleSettings(template.styleSettings);
      }

      // Apply callout selection
      if (options.applyCalloutSelection) {
        setAllSelectedCallouts(template.selectedCallouts);
      }

      // Apply text content
      if (options.applyTextContent && (template.headline || template.subtitle)) {
        setText(template.headline || '', template.subtitle || '');
      }

      // Import custom callout prompts (only ones that don't exist)
      if (options.applyCalloutPrompts && template.customCalloutPrompts.length > 0) {
        const existingIds = new Set(calloutPrompts.map(p => p.id));
        for (const prompt of template.customCalloutPrompts) {
          if (!existingIds.has(prompt.id)) {
            addCalloutPrompt({
              name: prompt.name,
              promptText: prompt.promptText,
              isBuiltIn: false,
            });
          }
        }
      }

      onApply();
      onClose();
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen || !template) return null;

  const hasTextContent = !!(template.headline || template.subtitle);
  const hasCustomPrompts = template.customCalloutPrompts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Apply Template
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Template info */}
          <div className="flex gap-4">
            {template.thumbnail && (
              <div className="w-20 h-28 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-zinc-900 dark:text-white truncate">
                {template.name}
              </h3>
              {template.description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {template.description}
                </p>
              )}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Applying this template will replace your current settings. Generated images will not be affected.
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              What to apply:
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.applyStyleSettings}
                onChange={(e) => setOptions({ ...options, applyStyleSettings: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-900/20 dark:focus:ring-white/20"
              />
              <div>
                <span className="text-sm text-zinc-900 dark:text-white">Style settings</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Model, scene, lighting, and visual settings
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.applyCalloutSelection}
                onChange={(e) => setOptions({ ...options, applyCalloutSelection: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-900/20 dark:focus:ring-white/20"
              />
              <div>
                <span className="text-sm text-zinc-900 dark:text-white">Callout selection</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Selected callout prompts for each slot
                </p>
              </div>
            </label>

            {hasTextContent && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.applyTextContent}
                  onChange={(e) => setOptions({ ...options, applyTextContent: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-900/20 dark:focus:ring-white/20"
                />
                <div>
                  <span className="text-sm text-zinc-900 dark:text-white">Text content</span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Headline: &quot;{template.headline || '-'}&quot; / Subtitle: &quot;{template.subtitle || '-'}&quot;
                  </p>
                </div>
              </label>
            )}

            {hasCustomPrompts && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.applyCalloutPrompts}
                  onChange={(e) => setOptions({ ...options, applyCalloutPrompts: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-900/20 dark:focus:ring-white/20"
                />
                <div>
                  <span className="text-sm text-zinc-900 dark:text-white">Custom callout prompts</span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Import {template.customCalloutPrompts.length} custom prompt{template.customCalloutPrompts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Settings preview */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Template settings
            </div>
            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex justify-between">
                <span>Setting:</span>
                <span className="capitalize">{template.styleSettings.modelScene.setting}</span>
              </div>
              <div className="flex justify-between">
                <span>Mood:</span>
                <span className="capitalize">{template.styleSettings.modelScene.mood}</span>
              </div>
              <div className="flex justify-between">
                <span>Lighting:</span>
                <span className="capitalize">{template.styleSettings.modelScene.lighting}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="capitalize">{template.styleSettings.modelScene.modelGender}, {template.styleSettings.modelScene.modelAge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isApplying || (!options.applyStyleSettings && !options.applyCalloutSelection && !options.applyTextContent && !options.applyCalloutPrompts)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isApplying ? 'Applying...' : 'Apply Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
