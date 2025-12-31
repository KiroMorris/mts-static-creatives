'use client';

import React, { useState } from 'react';
import type { CalloutPrompt } from '@/types';
import { Button } from '@/components/ui/Button';

interface CalloutSelectorProps {
  availablePrompts: CalloutPrompt[];
  selectedPromptIds: [string, string, string]; // 3 selected prompt IDs
  onSelectionChange: (slotIndex: 0 | 1 | 2, promptId: string) => void;
  onManagePrompts: () => void; // Opens the manager
  disabled?: boolean;
}

export function CalloutSelector({
  availablePrompts,
  selectedPromptIds,
  onSelectionChange,
  onManagePrompts,
  disabled = false,
}: CalloutSelectorProps) {
  const [expandedSlot, setExpandedSlot] = useState<0 | 1 | 2 | null>(null);

  // Check for duplicate selections
  const getDuplicateSlots = (): Set<number> => {
    const duplicates = new Set<number>();
    const seen = new Map<string, number>();

    selectedPromptIds.forEach((id, index) => {
      if (seen.has(id)) {
        duplicates.add(seen.get(id)!);
        duplicates.add(index);
      } else {
        seen.set(id, index);
      }
    });

    return duplicates;
  };

  const duplicateSlots = getDuplicateSlots();
  const hasDuplicates = duplicateSlots.size > 0;

  const getPromptById = (id: string): CalloutPrompt | undefined => {
    return availablePrompts.find((p) => p.id === id);
  };

  const slotLabels = ['Callout 1', 'Callout 2', 'Callout 3'] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Select Callout Prompts
        </h3>
        <button
          onClick={onManagePrompts}
          disabled={disabled}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Manage Prompts
        </button>
      </div>

      {/* Duplicate Warning */}
      {hasDuplicates && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
          <WarningIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Same prompt selected multiple times. Consider using different prompts for variety.
          </p>
        </div>
      )}

      {/* Slot Selectors */}
      <div className="space-y-3">
        {slotLabels.map((label, index) => {
          const slotIndex = index as 0 | 1 | 2;
          const selectedId = selectedPromptIds[slotIndex];
          const selectedPrompt = getPromptById(selectedId);
          const isDuplicate = duplicateSlots.has(slotIndex);
          const isExpanded = expandedSlot === slotIndex;

          return (
            <div
              key={slotIndex}
              className={`
                rounded-lg border transition-colors
                ${isDuplicate
                  ? 'border-yellow-400 dark:border-yellow-600'
                  : 'border-zinc-200 dark:border-zinc-700'
                }
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              {/* Selector Row */}
              <div className="flex items-center gap-3 p-3">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 w-20 flex-shrink-0">
                  {label}
                </span>

                <div className="flex-1 relative">
                  <select
                    value={selectedId}
                    onChange={(e) => onSelectionChange(slotIndex, e.target.value)}
                    disabled={disabled}
                    className={`
                      w-full px-3 py-2 pr-10 rounded-lg appearance-none
                      border bg-white dark:bg-zinc-800
                      text-zinc-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-zinc-500
                      disabled:cursor-not-allowed
                      ${isDuplicate
                        ? 'border-yellow-400 dark:border-yellow-600'
                        : 'border-zinc-300 dark:border-zinc-600'
                      }
                    `}
                  >
                    {availablePrompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.name} {prompt.isBuiltIn ? '' : '(Custom)'}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>

                {/* Expand/Preview Button */}
                <button
                  onClick={() => setExpandedSlot(isExpanded ? null : slotIndex)}
                  disabled={disabled}
                  className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed"
                  aria-label={isExpanded ? 'Hide preview' : 'Show preview'}
                >
                  <ChevronIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Prompt Preview (Accordion) */}
              {isExpanded && selectedPrompt && (
                <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="mt-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedPrompt.isBuiltIn && (
                        <LockIcon className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {selectedPrompt.name}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                      {selectedPrompt.promptText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Each callout will be generated using its selected prompt. Hover or expand to preview the prompt text.
      </p>
    </div>
  );
}

// Icons
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export default CalloutSelector;
