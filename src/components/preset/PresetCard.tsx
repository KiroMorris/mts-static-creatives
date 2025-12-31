'use client';

import React from 'react';
import type { Preset } from '@/types';

interface PresetCardProps {
  preset: Preset;
  isActive?: boolean;
  onApply: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
  showActions?: boolean;
}

export function PresetCard({
  preset,
  isActive = false,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  showActions = true,
}: PresetCardProps) {
  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Built-in';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border transition-all duration-200
        ${isActive
          ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50'
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white dark:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* System badge */}
      {preset.isDefault && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
          System
        </span>
      )}

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-white">
            {preset.name}
          </h3>
          {preset.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {preset.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {preset.tags && preset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {preset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Settings preview */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="capitalize">
            {preset.styleSettings.modelScene.setting}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="capitalize">
            {preset.styleSettings.modelScene.mood}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="capitalize">
            {preset.styleSettings.modelScene.lighting}
          </span>
        </div>

        {/* Date */}
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          {formatDate(preset.createdAt)}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => onApply(preset.id)}
              className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              Apply
            </button>

            {onDuplicate && (
              <button
                onClick={() => onDuplicate(preset.id)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title="Duplicate"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}

            {onExport && (
              <button
                onClick={() => onExport(preset.id)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title="Export"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            )}

            {onEdit && !preset.isDefault && (
              <button
                onClick={() => onEdit(preset.id)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {onDelete && !preset.isDefault && (
              <button
                onClick={() => onDelete(preset.id)}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
