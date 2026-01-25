'use client';

import React, { useState } from 'react';
import type { Template } from './TemplateSaveModal';

interface TemplateCardProps {
  template: Template;
  isActive?: boolean;
  onSelect: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  showActions?: boolean;
}

export function TemplateCard({
  template,
  isActive = false,
  onSelect,
  onDuplicate,
  onDelete,
  showActions = true,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'minimal': 'Minimal',
      'bold': 'Bold',
      'sale': 'Sale & Promo',
      'new-arrival': 'New Arrival',
      'seasonal': 'Seasonal',
      'lifestyle': 'Lifestyle',
      'premium': 'Premium',
      'custom': 'Custom',
    };
    return labels[category] || category;
  };

  return (
    <div
      className={`
        relative rounded-xl border overflow-hidden transition-all duration-200 group
        ${isActive
          ? 'border-zinc-900 dark:border-white ring-2 ring-zinc-900/20 dark:ring-white/20'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
        }
        bg-white dark:bg-zinc-900/50
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Hover overlay with actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transition-opacity">
            <button
              onClick={() => onSelect(template)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              Use Template
            </button>
          </div>
        )}

        {/* Preset badge */}
        {template.isPreset && (
          <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-zinc-900/80 text-white rounded">
            Preset
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white dark:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 rounded backdrop-blur-sm">
          {getCategoryLabel(template.category)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-zinc-900 dark:text-white line-clamp-1">
            {template.name}
          </h3>

          {/* More menu button */}
          {showActions && !template.isPreset && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden z-10">
                  {onDuplicate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(template);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Duplicate
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(template);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {template.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Settings preview */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="capitalize">
            {template.styleSettings.modelScene.setting}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="capitalize">
            {template.styleSettings.modelScene.mood}
          </span>
        </div>

        {/* Date */}
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          {formatDate(template.createdAt)}
        </div>
      </div>
    </div>
  );
}
