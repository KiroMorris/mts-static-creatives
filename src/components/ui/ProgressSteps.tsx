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
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-4 left-0 -translate-x-1/2 w-full h-0.5 -ml-2 ${
                    status === 'upcoming'
                      ? 'bg-zinc-200 dark:bg-zinc-700'
                      : 'bg-zinc-900 dark:bg-white'
                  }`}
                  style={{ width: 'calc(100% - 2rem)' }}
                />
              )}

              <div className="relative flex flex-col items-center group">
                {/* Step circle */}
                <button
                  onClick={() => isClickable && onStepClick(step.number as Step)}
                  disabled={!isClickable}
                  className={`
                    relative z-10 flex items-center justify-center
                    w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${
                      status === 'completed'
                        ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900'
                        : status === 'current'
                        ? 'bg-white border-zinc-900 text-zinc-900 dark:bg-zinc-900 dark:border-white dark:text-white'
                        : 'bg-white border-zinc-300 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-500'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2
                  `}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'completed' ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </button>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs font-medium block ${
                      status === 'current'
                        ? 'text-zinc-900 dark:text-white'
                        : status === 'completed'
                        ? 'text-zinc-600 dark:text-zinc-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {step.description}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
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
