'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePresetStore } from '@/store/usePresetStore';

interface PresetSelectorProps {
  onSavePreset: () => void;
  onManagePresets: () => void;
}

export function PresetSelector({ onSavePreset, onManagePresets }: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { presets, activePresetId, applyPreset } = usePresetStore();

  const activePreset = presets.find((p) => p.id === activePresetId);
  const systemPresets = presets.filter((p) => p.isDefault);
  const userPresets = presets.filter((p) => !p.isDefault);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (presetId: string) => {
    applyPreset(presetId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900 transition-colors"
      >
        <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-zinc-700 dark:text-zinc-300">
          {activePreset ? activePreset.name : 'Presets'}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50">
          {/* Active preset indicator */}
          {activePreset && (
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Active Preset
              </div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5">
                {activePreset.name}
              </div>
            </div>
          )}

          {/* Save Current */}
          <button
            onClick={() => {
              onSavePreset();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Current Settings...
          </button>

          <div className="border-t border-zinc-200 dark:border-zinc-700" />

          {/* System Presets */}
          {systemPresets.length > 0 && (
            <>
              <div className="px-4 py-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  System Presets
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {systemPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors
                      ${preset.id === activePresetId
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    <span>{preset.name}</span>
                    {preset.id === activePresetId && (
                      <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* User Presets */}
          {userPresets.length > 0 && (
            <>
              <div className="border-t border-zinc-200 dark:border-zinc-700" />
              <div className="px-4 py-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  My Presets
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {userPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors
                      ${preset.id === activePresetId
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    <span>{preset.name}</span>
                    {preset.id === activePresetId && (
                      <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="border-t border-zinc-200 dark:border-zinc-700" />

          {/* Manage Presets */}
          <button
            onClick={() => {
              onManagePresets();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Presets...
          </button>
        </div>
      )}
    </div>
  );
}
