'use client';

import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
  showProgress?: boolean;
  progress?: number;
}

const sizeStyles: Record<SpinnerSize, { spinner: string; text: string }> = {
  sm: { spinner: 'h-4 w-4', text: 'text-xs' },
  md: { spinner: 'h-8 w-8', text: 'text-sm' },
  lg: { spinner: 'h-12 w-12', text: 'text-base' },
  xl: { spinner: 'h-16 w-16', text: 'text-lg' },
};

export function Spinner({
  size = 'md',
  className = '',
  label,
  showProgress = false,
  progress = 0,
}: SpinnerProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Background circle */}
        <svg
          className={`${styles.spinner} text-zinc-200 dark:text-zinc-700`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        {/* Spinning arc */}
        <svg
          className={`absolute inset-0 ${styles.spinner} animate-spin text-zinc-900 dark:text-white`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            d="M12 2a10 10 0 0 1 10 10"
          />
        </svg>
      </div>

      {label && (
        <span className={`${styles.text} text-zinc-600 dark:text-zinc-400 font-medium`}>
          {label}
        </span>
      )}

      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className={`${styles.text} text-zinc-500 dark:text-zinc-400 mt-1 block text-center`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

export function FullPageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Spinner size="xl" label={label} />
    </div>
  );
}

export default Spinner;
