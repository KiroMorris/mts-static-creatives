'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CalloutSelector, CalloutPromptManager } from '@/components/prompt';
import { useCreativeStore } from '@/store/useCreativeStore';
import { API } from '@/lib/constants';
import type { CalloutType } from '@/types';

// Map slot index to callout type for legacy compatibility
const SLOT_TO_TYPE: CalloutType[] = ['detail', 'fit', 'pose'];

// Slot display configuration
const SLOT_CONFIG = [
  { label: 'Callout 1', description: 'First callout image' },
  { label: 'Callout 2', description: 'Second callout image' },
  { label: 'Callout 3', description: 'Third callout image' },
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
    // New prompt control state
    calloutPrompts,
    selectedCallouts,
    setSelectedCallout,
    addCalloutPrompt,
    updateCalloutPrompt,
    deleteCalloutPrompt,
  } = useCreativeStore();

  const [regeneratingSlot, setRegeneratingSlot] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showPromptManager, setShowPromptManager] = useState(false);
  const [showPromptSelector, setShowPromptSelector] = useState(true);
  const hasGeneratedOnce = useRef(false);

  // Get prompt by ID
  const getPromptById = (id: string) => calloutPrompts.find(p => p.id === id);

  const generateAllCallouts = async () => {
    if (!productImage || !heroImage) return;

    setLoading('isGeneratingCallouts', true);
    setError(null);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 3, 90));
    }, 300);

    // Build callout configs from selected prompts
    const calloutConfigs = selectedCallouts.map((promptId, slotIndex) => {
      const prompt = getPromptById(promptId);
      return {
        slotIndex,
        promptText: prompt?.promptText || '',
        promptName: prompt?.name || `Callout ${slotIndex + 1}`,
      };
    });

    try {
      const response = await fetch(API.generateCallouts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl: productImage,
          heroImageUrl: heroImage,
          calloutConfigs, // Use new slot-based API
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Generation failed');
      }

      const data = await response.json();

      // Set each callout image by slot
      data.data.callouts.forEach((callout: { slotIndex?: number; type?: CalloutType; imageUrl: string }) => {
        // Support both slot-based and legacy type-based response
        if (typeof callout.slotIndex === 'number') {
          const type = SLOT_TO_TYPE[callout.slotIndex];
          setCalloutImage(type, callout.imageUrl);
        } else if (callout.type) {
          setCalloutImage(callout.type, callout.imageUrl);
        }
      });

      hasGeneratedOnce.current = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate callouts';
      setError(message);
    } finally {
      clearInterval(progressInterval);
      setLoading('isGeneratingCallouts', false);
    }
  };

  const regenerateCallout = async (slotIndex: number) => {
    if (!productImage || !heroImage) return;

    setRegeneratingSlot(slotIndex);
    setError(null);

    const promptId = selectedCallouts[slotIndex];
    const prompt = getPromptById(promptId);
    const type = SLOT_TO_TYPE[slotIndex];

    try {
      const response = await fetch(API.regenerateCallout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl: productImage,
          heroImageUrl: heroImage,
          slotIndex,
          promptText: prompt?.promptText || '',
          promptName: prompt?.name || `Callout ${slotIndex + 1}`,
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
      setRegeneratingSlot(null);
    }
  };

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
          Select prompts and generate 3 complementary callout images
        </p>
      </div>

      {/* Prompt Selector - Collapsible */}
      <div className="mb-8">
        <button
          onClick={() => setShowPromptSelector(!showPromptSelector)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
        >
          <ChevronIcon className={`w-4 h-4 transition-transform ${showPromptSelector ? 'rotate-180' : ''}`} />
          {showPromptSelector ? 'Hide Prompt Selection' : 'Show Prompt Selection'}
        </button>

        {showPromptSelector && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <CalloutSelector
              availablePrompts={calloutPrompts}
              selectedPromptIds={selectedCallouts}
              onSelectionChange={setSelectedCallout}
              onManagePrompts={() => setShowPromptManager(true)}
              disabled={isGeneratingCallouts}
            />
          </div>
        )}
      </div>

      {/* Prompt Manager Modal */}
      {showPromptManager && (
        <CalloutPromptManager
          prompts={calloutPrompts}
          onAdd={addCalloutPrompt}
          onUpdate={updateCalloutPrompt}
          onDelete={deleteCalloutPrompt}
          onClose={() => setShowPromptManager(false)}
        />
      )}

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

      {/* Callout Grid - Using slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {SLOT_CONFIG.map(({ label, description }, slotIndex) => {
          const type = SLOT_TO_TYPE[slotIndex];
          const imageUrl = calloutImages[type];
          const isRegenerating = regeneratingSlot === slotIndex;
          const selectedPrompt = getPromptById(selectedCallouts[slotIndex]);

          return (
            <div key={slotIndex} className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {label}
                </h3>
                {selectedPrompt && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
                    {selectedPrompt.name}
                  </span>
                )}
              </div>
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
                      onClick={() => regenerateCallout(slotIndex)}
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
                  onClick={() => regenerateCallout(slotIndex)}
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
          {hasGeneratedOnce.current ? 'Regenerate All' : 'Generate All'}
        </Button>
        <Button
          onClick={handleApprove}
          disabled={!allCalloutsGenerated || isGeneratingCallouts || regeneratingSlot !== null}
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

export default CalloutGrid;
