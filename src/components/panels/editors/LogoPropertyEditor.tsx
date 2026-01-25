'use client';

import React, { useRef } from 'react';
import { Select, TextInput } from '../ElementPropertyPanel';
import { useElementsStore } from '@/store/useElementsStore';
import type { LogoElement, LogoFit } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface LogoPropertyEditorProps {
  element: LogoElement;
  onUpdate: (updates: Partial<LogoElement>) => void;
}

// ============================================================================
// Options
// ============================================================================

const FIT_OPTIONS: { value: LogoFit; label: string; description: string }[] = [
  { value: 'contain', label: 'Contain', description: 'Fit entirely within bounds' },
  { value: 'cover', label: 'Cover', description: 'Fill entire bounds (may crop)' },
  { value: 'fill', label: 'Fill', description: 'Stretch to fill bounds' },
];

// ============================================================================
// Icons
// ============================================================================

function UploadIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function LogoPropertyEditor({ element, onUpdate }: LogoPropertyEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logo: brandLogo, setLogo: setBrandLogo } = useElementsStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPEG, SVG, or WebP image.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB.');
      return;
    }

    // Convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate({ imageUrl: dataUrl });
      // Also update the brand logo
      setBrandLogo(dataUrl);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    onUpdate({ imageUrl: url });
  };

  const handleRemoveLogo = () => {
    onUpdate({ imageUrl: '' });
  };

  const handleUseBrandLogo = () => {
    if (brandLogo) {
      onUpdate({ imageUrl: brandLogo });
    }
  };

  const hasLogo = element.imageUrl && element.imageUrl.length > 0;

  return (
    <div className="space-y-4">
      {/* Logo Preview */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Logo Image
        </label>

        {hasLogo ? (
          <div className="relative group">
            <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center p-4">
              <img
                src={element.imageUrl}
                alt="Logo preview"
                className={`max-w-full max-h-full object-${element.fit}`}
              />
            </div>
            <button
              onClick={handleRemoveLogo}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Remove logo"
            >
              <TrashIcon />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-violet-500 dark:hover:border-violet-400 transition-colors"
          >
            <UploadIcon className="w-8 h-8 text-zinc-400" />
            <span className="text-sm text-zinc-500">Click to upload logo</span>
            <span className="text-xs text-zinc-400">PNG, JPEG, SVG, or WebP (max 2MB)</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* URL Input */}
      <TextInput
        label="Or enter image URL"
        value={element.imageUrl}
        placeholder="https://example.com/logo.png"
        onChange={handleUrlChange}
      />

      {/* Brand Logo Quick Action */}
      {brandLogo && brandLogo !== element.imageUrl && (
        <button
          onClick={handleUseBrandLogo}
          className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
        >
          Use Brand Logo
        </button>
      )}

      {/* Fit Mode */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Fit Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FIT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdate({ fit: option.value })}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center
                ${element.fit === option.value
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600'
                }
              `}
              title={option.description}
            >
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {option.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {FIT_OPTIONS.find((opt) => opt.value === element.fit)?.description}
        </p>
      </div>

      {/* Upload New Button */}
      {hasLogo && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center justify-center gap-2"
        >
          <UploadIcon className="w-4 h-4" />
          Replace Logo
        </button>
      )}
    </div>
  );
}

export default LogoPropertyEditor;
