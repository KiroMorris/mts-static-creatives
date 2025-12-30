'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCreativeStore } from '@/store/useCreativeStore';
import { API } from '@/lib/constants';

export function CollagePreview() {
  const {
    heroImage,
    calloutImages,
    headline,
    subtitle,
    finalCollage,
    setFinalCollage,
    isComposing,
    setLoading,
    setError,
    error,
    prevStep,
    reset,
  } = useCreativeStore();

  const [compositionProgress, setCompositionProgress] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const hasInitiatedComposition = useRef(false);

  const composeCollage = async () => {
    if (!heroImage || !calloutImages.detail || !calloutImages.fit || !calloutImages.pose) {
      return;
    }

    setLoading('isComposing', true);
    setError(null);
    setCompositionProgress(0);

    const progressInterval = setInterval(() => {
      setCompositionProgress((prev) => Math.min(prev + 8, 90));
    }, 200);

    try {
      const response = await fetch(API.composeCollage, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroImageUrl: heroImage,
          callouts: {
            detail: calloutImages.detail,
            fit: calloutImages.fit,
            pose: calloutImages.pose,
          },
          text: {
            headline,
            subtitle,
          },
        }),
      });

      clearInterval(progressInterval);
      setCompositionProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Composition failed');
      }

      const data = await response.json();
      setFinalCollage(data.data.collageUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to compose collage';
      setError(message);
    } finally {
      clearInterval(progressInterval);
      setLoading('isComposing', false);
    }
  };

  // Auto-compose on mount if no collage exists (with guard to prevent double-call)
  useEffect(() => {
    if (heroImage && calloutImages.detail && calloutImages.fit && calloutImages.pose && !finalCollage && !isComposing && !hasInitiatedComposition.current) {
      hasInitiatedComposition.current = true;
      composeCollage();
    }
  }, [heroImage, calloutImages, finalCollage, isComposing]);

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!finalCollage) return;

    try {
      const response = await fetch(finalCollage);
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creative-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleStartOver = () => {
    reset();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Your Creative is Ready!
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Download your final 9:16 creative for social media
        </p>
      </div>

      {/* Final Preview */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-sm aspect-[9/16] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-2xl">
          {isComposing ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner
                size="xl"
                label="Composing your final creative..."
                showProgress
                progress={compositionProgress}
              />
            </div>
          ) : finalCollage ? (
            <Image
              src={finalCollage}
              alt="Final creative"
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
              <ImagePlaceholderIcon className="w-16 h-16 mb-4" />
              <p className="text-sm">Composing your creative...</p>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Download Options */}
      {finalCollage && !isComposing && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 text-center">
            Download Options
          </h3>

          {/* Format Selection */}
          <div className="flex justify-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="png"
                checked={downloadFormat === 'png'}
                onChange={() => setDownloadFormat('png')}
                className="w-4 h-4 accent-zinc-900 dark:accent-white"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                PNG (Lossless)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="jpg"
                checked={downloadFormat === 'jpg'}
                onChange={() => setDownloadFormat('jpg')}
                className="w-4 h-4 accent-zinc-900 dark:accent-white"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                JPG (Smaller size)
              </span>
            </label>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => handleDownload(downloadFormat)}
              className="min-w-[200px]"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download {downloadFormat.toUpperCase()}
            </Button>
          </div>
        </div>
      )}

      {/* Creative Summary */}
      {finalCollage && !isComposing && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Creative Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">1080</p>
              <p className="text-xs text-zinc-500">Width (px)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">1920</p>
              <p className="text-xs text-zinc-500">Height (px)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">9:16</p>
              <p className="text-xs text-zinc-500">Aspect Ratio</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">4</p>
              <p className="text-xs text-zinc-500">Images Used</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Edit
        </Button>
        <Button variant="secondary" onClick={composeCollage} disabled={isComposing}>
          <RefreshIcon className="w-4 h-4 mr-1" />
          Regenerate
        </Button>
        <Button variant="ghost" onClick={handleStartOver}>
          <PlusIcon className="w-4 h-4 mr-1" />
          Start Over
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default CollagePreview;
