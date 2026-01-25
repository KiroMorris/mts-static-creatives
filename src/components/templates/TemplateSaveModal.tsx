'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCreativeStore } from '@/store/useCreativeStore';
import type { StyleSettings, CalloutPrompt } from '@/types';

// Template category type
export type TemplateCategory =
  | 'minimal'
  | 'bold'
  | 'sale'
  | 'new-arrival'
  | 'seasonal'
  | 'lifestyle'
  | 'premium'
  | 'custom';

// Template interface
export interface Template {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  isPreset: boolean;

  // Saved configuration
  styleSettings: StyleSettings;
  selectedCallouts: [string, string, string];
  customCalloutPrompts: CalloutPrompt[];
  headline?: string;
  subtitle?: string;
}

interface TemplateSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (template: Template) => void;
  thumbnail?: string;
}

interface SaveOptions {
  includeTextContent: boolean;
}

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'sale', label: 'Sale & Promo' },
  { value: 'new-arrival', label: 'New Arrival' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'premium', label: 'Premium' },
  { value: 'custom', label: 'Custom' },
];

const STORAGE_KEY = 'acg-templates';

// Generate a unique template ID
function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Save template to localStorage
function saveTemplateToStorage(template: Template): void {
  const templates = loadTemplatesFromStorage();
  const existingIndex = templates.findIndex(t => t.id === template.id);

  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

// Load templates from localStorage
export function loadTemplatesFromStorage(): Template[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Template[];
  } catch {
    return [];
  }
}

export function TemplateSaveModal({ isOpen, onClose, onSave, thumbnail }: TemplateSaveModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [options, setOptions] = useState<SaveOptions>({
    includeTextContent: true,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    styleSettings,
    selectedCallouts,
    calloutPrompts,
    headline,
    subtitle,
  } = useCreativeStore();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
      setName('');
      setDescription('');
      setCategory('custom');
      setTags([]);
      setTagInput('');
      setError(null);
    }
  }, [isOpen]);

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

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a template name');
      return;
    }

    // Check for duplicate names
    const existingTemplates = loadTemplatesFromStorage();
    const isDuplicate = existingTemplates.some(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setError('A template with this name already exists');
      return;
    }

    setIsSaving(true);

    try {
      const now = Date.now();
      const customPrompts = calloutPrompts.filter((p) => !p.isBuiltIn);

      const template: Template = {
        id: generateTemplateId(),
        name: trimmedName,
        description: description.trim() || undefined,
        category,
        tags,
        createdAt: now,
        updatedAt: now,
        thumbnail,
        isPreset: false,
        styleSettings,
        selectedCallouts,
        customCalloutPrompts: customPrompts,
        headline: options.includeTextContent ? headline : undefined,
        subtitle: options.includeTextContent ? subtitle : undefined,
      };

      saveTemplateToStorage(template);
      onSave?.(template);
      onClose();
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Save as Template
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
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Thumbnail preview */}
          {thumbnail && (
            <div className="flex justify-center">
              <div className="w-32 h-48 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img
                  src={thumbnail}
                  alt="Template preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Summer Campaign Style"
              className={`
                w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-800
                text-zinc-900 dark:text-white placeholder:text-zinc-400
                focus:outline-none focus:ring-2 focus:ring-offset-0
                ${error
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white'
                }
              `}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Description input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description <span className="text-zinc-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about when to use this template..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white resize-none"
            />
          </div>

          {/* Category select */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Tags <span className="text-zinc-400">(up to 5)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-zinc-900/20 dark:focus:ring-white/20"
                />
                <button
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Include in template
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeTextContent}
                onChange={(e) => setOptions({ ...options, includeTextContent: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-900/20 dark:focus:ring-white/20"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Include headline & subtitle text
              </span>
            </label>
          </div>

          {/* Preview of settings */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Settings to be saved
            </div>
            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex justify-between">
                <span>Setting:</span>
                <span className="capitalize">{styleSettings.modelScene.setting}</span>
              </div>
              <div className="flex justify-between">
                <span>Mood:</span>
                <span className="capitalize">{styleSettings.modelScene.mood}</span>
              </div>
              <div className="flex justify-between">
                <span>Lighting:</span>
                <span className="capitalize">{styleSettings.modelScene.lighting}</span>
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
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
