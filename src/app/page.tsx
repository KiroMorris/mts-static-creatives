'use client';

import React from 'react';
import { useCreativeStore } from '@/store/useCreativeStore';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { ProductUploader } from '@/components/upload/ProductUploader';
import { ModelScenePanel } from '@/components/style/ModelScenePanel';
import { StyleControlPanel } from '@/components/style/StyleControlPanel';
import { HeroPreview } from '@/components/preview/HeroPreview';
import { CalloutGrid } from '@/components/preview/CalloutGrid';
import { TextInputForm } from '@/components/text/TextInputForm';
import { CollagePreview } from '@/components/collage/CollagePreview';
import type { Step } from '@/types';

export default function Home() {
  const { currentStep, goToStep, reset } = useCreativeStore();

  // Render the current step's component
  // Steps: 1=Upload, 2=Model/Scene, 3=Hero, 4=Callouts, 5=Text, 6=Layout, 7=Export
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProductUploader />;
      case 2:
        return <ModelScenePanel />;
      case 3:
        return <HeroPreview />;
      case 4:
        return <CalloutGrid />;
      case 5:
        return <TextInputForm />;
      case 6:
        return <StyleControlPanel />;
      case 7:
        return <CollagePreview />;
      default:
        return <ProductUploader />;
    }
  };

  const handleStepClick = (step: Step) => {
    // Only allow navigation to completed steps (steps before current)
    if (step < currentStep) {
      goToStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white">
                Apparel Creative Generator
              </span>
            </div>

            {/* Reset button */}
            <button
              onClick={reset}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressSteps
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Powered by AI image generation. Create stunning social media creatives in minutes.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}
