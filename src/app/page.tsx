'use client';

import React, { useState } from 'react';
import { useCreativeStore } from '@/store/useCreativeStore';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { ProductUploader } from '@/components/upload/ProductUploader';
import { ModelScenePanel } from '@/components/style/ModelScenePanel';
import { StyleControlPanel } from '@/components/style/StyleControlPanel';
import { HeroPreview } from '@/components/preview/HeroPreview';
import { CalloutGrid } from '@/components/preview/CalloutGrid';
import { TextInputForm } from '@/components/text/TextInputForm';
import { CollagePreview } from '@/components/collage/CollagePreview';
import { PresetSelector, SavePresetModal, PresetManager } from '@/components/preset';
import type { Step } from '@/types';

export default function Home() {
  const { currentStep, goToStep, reset } = useCreativeStore();
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);

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
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated background gradient orbs - More vibrant and dynamic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary violet orb - larger and more prominent */}
        <div className="absolute top-[-15%] left-[5%] w-[700px] h-[700px] rounded-full bg-violet-500/30 dark:bg-violet-500/20 blur-[150px] animate-float" />
        {/* Pink/magenta orb */}
        <div className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] rounded-full bg-pink-500/25 dark:bg-pink-500/15 blur-[130px] animate-float" style={{ animationDelay: '1.5s' }} />
        {/* Cyan orb */}
        <div className="absolute bottom-[-5%] left-[25%] w-[500px] h-[500px] rounded-full bg-cyan-500/25 dark:bg-cyan-500/15 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        {/* Additional subtle orbs for more depth */}
        <div className="absolute top-[60%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/15 dark:bg-blue-500/10 blur-[80px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-rose-500/20 dark:bg-rose-500/10 blur-[60px] animate-float" style={{ animationDelay: '4s' }} />
        {/* Subtle grid overlay for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]" />
      </div>

      {/* Header - Premium Glass Effect */}
      <header className="sticky top-0 z-40 glass-intense border-b border-violet-500/10 dark:border-violet-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo - Enhanced with animation */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                {/* Animated glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
                <div className="relative w-12 h-12 bg-gradient-to-br from-violet-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-xl shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow duration-300">
                  <SparklesIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl gradient-text-rainbow">
                  Creative Studio
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wider uppercase">
                  Apparel Generator
                </span>
              </div>
            </div>

            {/* Preset Selector and Reset - Enhanced */}
            <div className="flex items-center gap-4">
              <PresetSelector
                onSavePreset={() => setIsSavePresetOpen(true)}
                onManagePresets={() => setIsPresetManagerOpen(true)}
              />
              <button
                onClick={reset}
                className="group relative px-5 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 hover:border-violet-400/50 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-500/10"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start Over
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps - Enhanced Container */}
      <div className="sticky top-[72px] z-30 glass-intense border-b border-violet-500/10 dark:border-violet-500/15 py-6">
        {/* Subtle gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressSteps
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Main Content - Enhanced Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Content wrapper with animation */}
        <div className="animate-fade-in">
          {/* Decorative corner accents */}
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-violet-500/20 rounded-tl-3xl pointer-events-none hidden lg:block" />
          <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-pink-500/20 rounded-tr-3xl pointer-events-none hidden lg:block" />
          {renderStep()}
        </div>
      </main>

      {/* Footer - Premium Vibrant */}
      <footer className="relative z-10 mt-auto overflow-hidden">
        {/* Gradient border at top */}
        <div className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <div className="relative py-10 bg-gradient-to-b from-transparent via-violet-500/5 to-pink-500/5 dark:via-violet-500/10 dark:to-pink-500/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Branding */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl blur-md opacity-50" />
                  <div className="relative w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="text-sm font-bold gradient-text-purple-pink">
                  Powered by AI
                </span>
              </div>

              {/* Tagline */}
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                Create stunning social media creatives in minutes
              </p>

              {/* Version badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse shadow-lg shadow-emerald-500/50" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">v1.0 Live</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Preset Modals */}
      <SavePresetModal
        isOpen={isSavePresetOpen}
        onClose={() => setIsSavePresetOpen(false)}
      />
      <PresetManager
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
      />
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
