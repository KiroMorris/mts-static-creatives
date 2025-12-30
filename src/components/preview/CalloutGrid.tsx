'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCreativeStore } from '@/store/useCreativeStore';
import { API } from '@/lib/constants';
import type { CalloutType } from '@/types';

const CALLOUT_TYPES: { type: CalloutType; label: string; description: string }[] = [
  { type: 'detail', label: 'Detail/Texture', description: 'Close-up fabric shot' },
  { type: 'fit', label: 'Fit Shot', description: 'Cropped body view' },
  { type: 'pose', label: 'Alt Pose', description: 'Alternative angle' },
];

export function CalloutGrid() {
  const {
    productImage,
    heroImage,
    calloutImages,
    setCalloutImage,
    isGeneratingCallouts,
    setLoading,
    setError,
    error,
    nextStep,
    prevStep,
  } = useCreativeStore();

  const [regeneratingType, setRegeneratingType] = useState<CalloutType | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const hasInitiatedGeneration = useRef(false);

  const generateAllCallouts = async () => {
    if (!productImage || !heroImage) return;

    setLoading('isGeneratingCallouts', true);
    setError(null);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 3, 90));
    }, 300);

    try {
      const response = await fetch(API.generateCallouts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl: productImage,
          heroImageUrl: heroImage,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Generation failed');
      }

      const data = await response.json();

      // Set each callout image
      data.data.callouts.forEach((callout: { type: CalloutType; imageUrl: string }) => {
        setCalloutImage(callout.type, callout.imageUrl);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate callouts';
      setError(message);
    } finally {
      clearInterval(progressInterval);
      setLoading('isGeneratingCallouts', false);
    }
  };

  const regenerateCallout = async (type: CalloutType) => {
    if (!productImage || !heroImage) return;

    setRegeneratingType(type);
    setError(null);

    try {
      const response = await fetch(API.regenerateCallout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl: productImage,
          heroImageUrl: heroImage,
          calloutType: type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Regeneration failed');
      }

      const data = await response.json();
      setCalloutImage(type, data.data.imageUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate callout';
      setError(message);
    } finally {
      setRegeneratingType(null);
    }
  };

  // Auto-generate on mount if no callouts (with guard to prevent double-call)
  useEffect(() => {
    const hasAnyCallout = calloutImages.detail || calloutImages.fit || calloutImages.pose;
    if (productImage && heroImage && !hasAnyCallout && !isGeneratingCallouts && !hasInitiatedGeneration.current) {
      hasInitiatedGeneration.current = true;
      generateAllCallouts();
    }
  }, [productImage, heroImage, calloutImages, isGeneratingCallouts]);

  const allCalloutsGenerated =
    calloutImages.detail && calloutImages.fit && calloutImages.pose;

  const handleApprove = () => {
    if (allCalloutsGenerated) {
      nextStep();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Generate Detail Shots
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Create 3 complementary callout images to complete your creative
        </p>
      </div>

      {/* Generation in progress */}
      {isGeneratingCallouts && (
        <div className="flex justify-center mb-8">
          <Spinner
            size="lg"
            label="Generating detail shots..."
            showProgress
            progress={generationProgress}
          />
        </div>
      )}

      {/* Callout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {CALLOUT_TYPES.map(({ type, label, description }) => {
          const imageUrl = calloutImages[type];
          const isRegenerating = regeneratingType === type;

          return (
            <div key={type} className="flex flex-col">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {label}
              </h3>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md">
                {isGeneratingCallouts && !imageUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner size="md" />
                  </div>
                ) : isRegenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80">
                    <Spinner size="md" label="Regenerating..." />
                  </div>
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={label}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                    <ImagePlaceholderIcon className="w-12 h-12 mb-2" />
                    <p className="text-xs text-center px-4">{description}</p>
                  </div>
                )}

                {/* Overlay with regenerate button */}
                {imageUrl && !isRegenerating && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => regenerateCallout(type)}
                      disabled={isGeneratingCallouts}
                    >
                      <RefreshIcon className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>

              {/* Individual regenerate button (mobile friendly) */}
              {imageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => regenerateCallout(type)}
                  disabled={isRegenerating || isGeneratingCallouts}
                  className="mt-2 sm:hidden"
                >
                  <RefreshIcon className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          variant="secondary"
          onClick={generateAllCallouts}
          disabled={isGeneratingCallouts}
          isLoading={isGeneratingCallouts}
        >
          <RefreshIcon className="w-4 h-4 mr-1" />
          Regenerate All
        </Button>
        <Button
          onClick={handleApprove}
          disabled={!allCalloutsGenerated || isGeneratingCallouts || !!regeneratingType}
        >
          <CheckIcon className="w-4 h-4 mr-1" />
          Approve All & Continue
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

export default CalloutGrid;
