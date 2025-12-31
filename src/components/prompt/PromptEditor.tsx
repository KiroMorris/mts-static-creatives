'use client';

import React, { useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface PromptEditorProps {
  generatedPrompt: string;       // The auto-generated prompt (read-only)
  customPrompt: string;          // Current custom prompt value
  onCustomPromptChange: (prompt: string) => void;
  useCustom: boolean;            // Whether using custom or generated
  onToggleCustom: (useCustom: boolean) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_PROMPT_LENGTH = 2000;

// ============================================================================
// Sub-Components
// ============================================================================

interface ToggleTabsProps {
  useCustom: boolean;
  onToggle: (useCustom: boolean) => void;
  disabled?: boolean;
}

function ToggleTabs({ useCustom, onToggle, disabled }: ToggleTabsProps) {
  return (
    <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
      <button
        type="button"
        onClick={() => onToggle(false)}
        disabled={disabled}
        className={`
          flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
          ${!useCustom
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center justify-center gap-2">
          <AutoIcon className="w-4 h-4" />
          Auto-generated
        </span>
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        disabled={disabled}
        className={`
          flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
          ${useCustom
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center justify-center gap-2">
          <EditIcon className="w-4 h-4" />
          Custom
        </span>
      </button>
    </div>
  );
}

interface CharacterCountProps {
  current: number;
  max: number;
}

function CharacterCount({ current, max }: CharacterCountProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-zinc-400 dark:bg-zinc-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span
        className={`text-xs font-medium ${
          isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-zinc-500 dark:text-zinc-400'
        }`}
      >
        {current}/{max}
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PromptEditor({
  generatedPrompt,
  customPrompt,
  onCustomPromptChange,
  useCustom,
  onToggleCustom,
  disabled = false,
  className = '',
}: PromptEditorProps) {
  const handleCopyToCustom = useCallback(() => {
    onCustomPromptChange(generatedPrompt);
    onToggleCustom(true);
  }, [generatedPrompt, onCustomPromptChange, onToggleCustom]);

  const handleCustomPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onCustomPromptChange(e.target.value);
    },
    [onCustomPromptChange]
  );

  const currentPrompt = useCustom ? customPrompt : generatedPrompt;
  const promptToDisplay = useCustom ? customPrompt : generatedPrompt;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Hero Image Prompt
        </label>
        {!useCustom && generatedPrompt && (
          <button
            type="button"
            onClick={handleCopyToCustom}
            disabled={disabled}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
              text-zinc-600 dark:text-zinc-400
              hover:text-zinc-900 dark:hover:text-zinc-200
              hover:bg-zinc-100 dark:hover:bg-zinc-800
              rounded-md transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <CopyIcon className="w-3.5 h-3.5" />
            Copy to Custom
          </button>
        )}
      </div>

      {/* Toggle Tabs */}
      <ToggleTabs
        useCustom={useCustom}
        onToggle={onToggleCustom}
        disabled={disabled}
      />

      {/* Prompt Display/Editor */}
      <div className="relative">
        {useCustom ? (
          // Editable textarea for custom prompt
          <textarea
            value={customPrompt}
            onChange={handleCustomPromptChange}
            disabled={disabled}
            placeholder="Enter your custom prompt for the hero image..."
            rows={6}
            className={`
              w-full px-4 py-3 rounded-lg border
              bg-white dark:bg-zinc-800
              text-zinc-900 dark:text-white
              placeholder-zinc-400 dark:placeholder-zinc-500
              border-zinc-300 dark:border-zinc-600
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent
              resize-y min-h-[150px]
              text-sm leading-relaxed
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        ) : (
          // Read-only display for auto-generated prompt
          <div
            className={`
              w-full px-4 py-3 rounded-lg border
              bg-zinc-50 dark:bg-zinc-800/50
              border-zinc-200 dark:border-zinc-700
              text-zinc-700 dark:text-zinc-300
              text-sm leading-relaxed
              min-h-[150px]
              ${!generatedPrompt ? 'flex items-center justify-center' : ''}
            `}
          >
            {generatedPrompt ? (
              <p className="whitespace-pre-wrap">{generatedPrompt}</p>
            ) : (
              <div className="text-center text-zinc-400 dark:text-zinc-500">
                <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Prompt will be generated based on your settings</p>
              </div>
            )}
          </div>
        )}

        {/* Mode indicator badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
              ${useCustom
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }
            `}
          >
            {useCustom ? (
              <>
                <EditIcon className="w-3 h-3" />
                Editable
              </>
            ) : (
              <>
                <LockIcon className="w-3 h-3" />
                Read-only
              </>
            )}
          </span>
        </div>
      </div>

      {/* Character count - only show for custom mode */}
      {useCustom && (
        <CharacterCount current={customPrompt.length} max={MAX_PROMPT_LENGTH} />
      )}

      {/* Helper text */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {useCustom
          ? 'Customize the prompt to control how your hero image is generated. Be specific about model, pose, lighting, and setting.'
          : 'This prompt is auto-generated from your style settings. Switch to Custom to edit it.'}
      </p>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function AutoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
      />
    </svg>
  );
}

function LockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

export default PromptEditor;
