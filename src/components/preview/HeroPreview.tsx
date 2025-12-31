'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PromptEditor } from '@/components/prompt';
import { useCreativeStore } from '@/store/useCreativeStore';
import { API } from '@/lib/constants';

export function HeroPreview() {
  const {
    productImage,
    heroImage,
    styleSettings,
    setHeroImage,
    isGeneratingHero,
    setLoading,
    setError,
    error,
    nextStep,
    prevStep,
    // New prompt control state
    heroGeneratedPrompt,
    heroCustomPrompt,
    useCustomHeroPrompt,
    setHeroGeneratedPrompt,
    setHeroCustomPrompt,
    setUseCustomHeroPrompt,
  } = useCreativeStore();

  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isFetchingPrompt, setIsFetchingPrompt] = useState(false);
  const hasInitiatedGeneration = useRef(false);
  const hasFetchedPrompt = useRef(false);

  // Fetch the auto-generated prompt on mount (preview mode)
  const fetchPromptPreview = async () => {
    if (!productImage || hasFetchedPrompt.current) return;

    hasFetchedPrompt.current = true;
    setIsFetchingPrompt(true);

    try {
      const response = await fetch(API.generateHero, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl: productImage,
          modelSceneStyle: styleSettings.modelScene,
          previewPromptOnly: true, // Just get the prompt, don't generate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.generatedPrompt) {
          setHeroGeneratedPrompt(data.data.generatedPrompt);
        }
      }
    } catch (err) {
      console.error('Failed to fetch prompt preview:', err);
    } finally {
      setIsFetchingPrompt(false);
    }
  };

  // Fetch prompt preview on mount
  useEffect(() => {
    if (productImage && !heroGeneratedPrompt && !hasFetchedPrompt.current) {
      fetchPromptPreview();
    }
  }, [productImage, heroGeneratedPrompt]);

  const generateHero = async () => {
    if (!productImage) return;

    setLoading('isGeneratingHero', true);
    setError(null);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    // Determine which prompt to use
    const promptToUse = useCustomHeroPrompt && heroCustomPrompt
      ? heroCustomPrompt
      : undefined; // Let API generate if not using custom

    try {
      const response = await fetch(API.generateHero, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl: productImage,
          customPrompt: promptToUse,
          modelSceneStyle: styleSettings.modelScene,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Generation failed');
      }

      const data = await response.json();
      setHeroImage(data.data.heroImageUrl);

      // Update the generated prompt if returned
      if (data.data?.generatedPrompt) {
        setHeroGeneratedPrompt(data.data.generatedPrompt);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate hero image';
      setError(message);
    } finally {
      clearInterval(progressInterval);
      setLoading('isGeneratingHero', false);
    }
  };

  // Auto-generate on mount if no hero image (with guard to prevent double-call)
  useEffect(() => {
    if (productImage && !heroImage && !isGeneratingHero && !hasInitiatedGeneration.current) {
      hasInitiatedGeneration.current = true;
      generateHero();
    }
  }, [productImage, heroImage, isGeneratingHero]);

  const handleRegenerate = () => {
    generateHero();
  };

  const handleApprove = () => {
    if (heroImage) {
      nextStep();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Generate Hero Image
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          AI will create a lifestyle hero shot with a model wearing your product
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image (Reference) */}
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
            Your Product
          </h3>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md">
            {productImage && (
              <Image
                src={productImage}
                alt="Uploaded product"
                fill
                className="object-contain"
              />
            )}
          </div>
        </div>

        {/* Hero Image Preview */}
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
            Generated Hero (9:16)
          </h3>
          <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md">
            {isGeneratingHero ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner
                  size="xl"
                  label="Generating your creative..."
                  showProgress
                  progress={generationProgress}
                />
              </div>
            ) : heroImage ? (
              <Image
                src={heroImage}
                alt="Generated hero"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <ImagePlaceholderIcon className="w-16 h-16 mb-4" />
                <p className="text-sm">Click Regenerate to start</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Prompt Editor - Inline Collapsible */}
      <div className="mt-8">
        <button
          onClick={() => setShowPromptEditor(!showPromptEditor)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
        >
          <ChevronIcon className={`w-4 h-4 transition-transform ${showPromptEditor ? 'rotate-180' : ''}`} />
          {showPromptEditor ? 'Hide Prompt Editor' : 'Show Prompt Editor'}
          {isFetchingPrompt && <Spinner size="sm" />}
        </button>

        {showPromptEditor && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <PromptEditor
              generatedPrompt={heroGeneratedPrompt}
              customPrompt={heroCustomPrompt}
              onCustomPromptChange={setHeroCustomPrompt}
              useCustom={useCustomHeroPrompt}
              onToggleCustom={setUseCustomHeroPrompt}
              disabled={isGeneratingHero}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          variant="secondary"
          onClick={handleRegenerate}
          disabled={isGeneratingHero}
          isLoading={isGeneratingHero}
        >
          <RefreshIcon className="w-4 h-4 mr-1" />
          {useCustomHeroPrompt && heroCustomPrompt ? 'Generate with Custom Prompt' : 'Regenerate'}
        </Button>
        <Button
          onClick={handleApprove}
          disabled={!heroImage || isGeneratingHero}
        >
          <CheckIcon className="w-4 h-4 mr-1" />
          Approve & Continue
        </Button>
      </div>
    </div>
  );
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

export default HeroPreview;
