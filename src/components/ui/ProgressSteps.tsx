'use client';

import React from 'react';
import { STEPS } from '@/lib/constants';
import type { Step } from '@/types';

interface ProgressStepsProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
  completedSteps?: Step[];
}

export function ProgressSteps({
  currentStep,
  onStepClick,
  completedSteps = [],
}: ProgressStepsProps) {
  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(stepNumber as Step)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'completed';
    return 'upcoming';
  };

  const canNavigateToStep = (stepNumber: number): boolean => {
    // Can navigate to completed steps or current step
    return stepNumber <= currentStep;
  };

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.number);
          const isClickable = canNavigateToStep(step.number) && onStepClick;

          return (
            <li key={step.number} className="relative flex-1">
              {/* Connector line - Enhanced with gradient */}
              {index > 0 && (
                <div
                  className="absolute top-6 right-1/2 h-[4px] -translate-y-1/2"
                  style={{ width: 'calc(100% - 3.5rem)' }}
                >
                  <div className="relative h-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`
                        absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                        ${status === 'upcoming'
                          ? 'w-0'
                          : 'w-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-violet-500'
                        }
                      `}
                    />
                    {status !== 'upcoming' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    )}
                  </div>
                </div>
              )}

              <div className="relative flex flex-col items-center group">
                {/* Step circle with enhanced glow effect */}
                <div className="relative">
                  {/* Animated ring for current step */}
                  {status === 'current' && (
                    <>
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 blur-lg opacity-50 animate-pulse" />
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 opacity-30 animate-spin" style={{ animationDuration: '3s' }} />
                    </>
                  )}

                  {/* Glow for completed steps */}
                  {status === 'completed' && (
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 blur-md opacity-50" />
                  )}

                  <button
                    onClick={() => isClickable && onStepClick(step.number as Step)}
                    disabled={!isClickable}
                    className={`
                      relative z-10 flex items-center justify-center
                      w-12 h-12 rounded-full transition-all duration-400 ease-out
                      ${
                        status === 'completed'
                          ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/40'
                          : status === 'current'
                          ? 'bg-gradient-to-br from-violet-500 via-pink-500 to-fuchsia-500 text-white shadow-2xl shadow-violet-500/50'
                          : 'bg-white dark:bg-zinc-800/90 border-2 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-400 dark:text-zinc-500 shadow-md'
                      }
                      ${isClickable ? 'cursor-pointer hover:scale-115 hover:shadow-2xl hover:shadow-violet-500/40' : 'cursor-default'}
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
                    `}
                    aria-current={status === 'current' ? 'step' : undefined}
                  >
                    {status === 'completed' ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <span className={`text-sm font-bold ${status === 'current' ? '' : ''}`}>
                        {step.number}
                      </span>
                    )}
                  </button>
                </div>

                {/* Step label - Enhanced */}
                <div className="mt-4 text-center">
                  <span
                    className={`
                      text-xs font-bold block transition-all duration-300 uppercase tracking-wider
                      ${
                        status === 'current'
                          ? 'gradient-text text-transparent bg-clip-text'
                          : status === 'completed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Enhanced Tooltip on hover */}
                <div className={`
                  absolute bottom-full mb-4 px-4 py-2.5 rounded-xl
                  opacity-0 group-hover:opacity-100 transition-all duration-300
                  transform group-hover:-translate-y-2 scale-95 group-hover:scale-100
                  pointer-events-none whitespace-nowrap z-50
                  ${status === 'current'
                    ? 'bg-gradient-to-r from-violet-600 via-pink-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/30'
                    : status === 'completed'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-xl shadow-emerald-500/30'
                    : 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xl'
                  }
                  text-xs font-semibold
                `}>
                  <div className="relative flex items-center gap-2">
                    {status === 'completed' && <CheckIcon className="w-3.5 h-3.5" />}
                    {status === 'current' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    {step.description}
                  </div>
                  {/* Tooltip arrow */}
                  <div className={`
                    absolute top-full left-1/2 -translate-x-1/2 -mt-px
                    border-[6px] border-transparent
                    ${status === 'current'
                      ? 'border-t-fuchsia-600'
                      : status === 'completed'
                      ? 'border-t-cyan-600'
                      : 'border-t-zinc-900 dark:border-t-zinc-800'
                    }
                  `} />
                </div>

                {/* Current step animated indicator */}
                {status === 'current' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Progress bar at bottom - Enhanced */}
      <div className="mt-8 relative">
        {/* Background track */}
        <div className="h-2 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-full overflow-hidden shadow-inner">
          {/* Animated progress fill */}
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            {/* Glow at the end */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-md opacity-80" />
          </div>
        </div>
        {/* Stats row */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Step</span>
            <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold">
              {currentStep} of {STEPS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <span className="font-bold text-sm gradient-text">
              {Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default ProgressSteps;
