'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePresetStore } from '@/store/usePresetStore';
import { useCreativeStore } from '@/store/useCreativeStore';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavePresetModal({ isOpen, onClose }: SavePresetModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const { savePreset, presets } = usePresetStore();
  const { styleSettings } = useCreativeStore();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
      setName('');
      setDescription('');
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

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a preset name');
      return;
    }

    // Check for duplicate names
    const existingPreset = presets.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingPreset) {
      setError('A preset with this name already exists');
      return;
    }

    savePreset(trimmedName, description.trim() || undefined, false);
    onClose();
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
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Save Preset
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
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Preset Name <span className="text-red-500">*</span>
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
              placeholder="Add notes about when to use this preset..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white resize-none"
            />
          </div>

          {/* Preview of what will be saved */}
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
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
          >
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
}
