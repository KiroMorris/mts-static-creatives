'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

// ============================================================================
// Types
// ============================================================================

type ProcessingState = 'idle' | 'loading' | 'processing' | 'complete' | 'error';
type Provider = 'imgly' | 'removebg' | 'auto';

interface BackgroundRemovalButtonProps {
  /** Image URL or data URL to process */
  imageUrl: string;
  /** Called when background removal completes successfully */
  onComplete: (processedImageUrl: string, processedImageId?: string) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Called when processing starts */
  onStart?: () => void;
  /** Which provider to use: 'imgly' (client-side, free), 'removebg' (API), or 'auto' */
  provider?: Provider;
  /** Optional custom button text */
  buttonText?: string;
  /** Optional custom processing text */
  processingText?: string;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  /** Full width button */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

interface ImglyProgress {
  progress: number;
  stage: string;
}

// ============================================================================
// Background Removal Button Component
// ============================================================================

/**
 * BackgroundRemovalButton
 *
 * A button that triggers AI-powered background removal on a product image.
 *
 * Supports two providers:
 * 1. @imgly/background-removal (default) - Runs entirely client-side, free, no API key needed
 * 2. remove.bg API - Server-side, requires API key, best quality
 *
 * Usage:
 * ```tsx
 * <BackgroundRemovalButton
 *   imageUrl={productImageUrl}
 *   onComplete={(url) => setProcessedImage(url)}
 *   provider="imgly"
 * />
 * ```
 */
export function BackgroundRemovalButton({
  imageUrl,
  onComplete,
  onError,
  onStart,
  provider = 'auto',
  buttonText = 'Remove Background',
  processingText = 'Removing background...',
  size = 'md',
  variant = 'secondary',
  fullWidth = false,
  disabled = false,
  className = '',
}: BackgroundRemovalButtonProps) {
  const [state, setState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imglyLoaded, setImglyLoaded] = useState<boolean | null>(null);

  // Reference to track if component is mounted
  const isMountedRef = useRef(true);

  // Check if imgly is available on mount
  useEffect(() => {
    checkImglyAvailability();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Check if @imgly/background-removal is installed
   * This uses a dynamic import to check if the package exists
   */
  const checkImglyAvailability = async () => {
    try {
      // Use dynamic import to check if package exists
      // This will throw if not installed
      const module = await import(/* webpackIgnore: true */ '@imgly/background-removal').catch(() => null);
      setImglyLoaded(module !== null);
    } catch {
      setImglyLoaded(false);
    }
  };

  /**
   * Process with client-side imgly
   */
  const processWithImgly = useCallback(async () => {
    try {
      // Dynamically import imgly - this will only work if the package is installed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imglyModule = await import(/* webpackIgnore: true */ '@imgly/background-removal') as any;
      const removeBackground = imglyModule.removeBackground || imglyModule.default?.removeBackground;

      if (!removeBackground) {
        throw new Error('@imgly/background-removal module not found. Install it with: npm install @imgly/background-removal');
      }

      // Fetch image and convert to File object
      let imageBlob: Blob;
      if (imageUrl.startsWith('data:')) {
        // Convert data URL to blob
        const response = await fetch(imageUrl);
        imageBlob = await response.blob();
      } else {
        const response = await fetch(imageUrl);
        imageBlob = await response.blob();
      }

      // Convert to File
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });

      // Process with progress callback
      const resultBlob = await removeBackground(imageFile, {
        model: 'medium',
        output: {
          format: 'image/png',
          quality: 1.0,
        },
        progress: (progress: number, message?: string) => {
          if (isMountedRef.current) {
            setProgress(Math.round(progress * 100));
            if (message) {
              setProgressStage(message);
            }
          }
        },
      });

      // Convert result to data URL
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read processed image'));
        reader.readAsDataURL(resultBlob);
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process with imgly';
      throw new Error(`Client-side processing failed: ${message}`);
    }
  }, [imageUrl]);

  /**
   * Process with server-side API (remove.bg)
   */
  const processWithAPI = useCallback(async () => {
    setProgressStage('Sending to server...');
    setProgress(30);

    const response = await fetch('/api/remove-background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        provider: 'removebg',
      }),
    });

    setProgress(70);
    setProgressStage('Processing...');

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'API processing failed');
    }

    setProgress(100);
    return result.data.processedImageUrl;

  }, [imageUrl]);

  /**
   * Main processing handler
   */
  const handleRemoveBackground = useCallback(async () => {
    if (!imageUrl || state === 'processing' || state === 'loading') {
      return;
    }

    setState('loading');
    setProgress(0);
    setProgressStage('Initializing...');
    setErrorMessage('');
    onStart?.();

    try {
      setState('processing');
      let resultUrl: string;

      // Determine which provider to use
      const useImgly = provider === 'imgly' || (provider === 'auto' && imglyLoaded);
      const useAPI = provider === 'removebg' || (provider === 'auto' && !imglyLoaded);

      if (useImgly && imglyLoaded) {
        // Use client-side processing
        setProgressStage('Loading AI model...');
        resultUrl = await processWithImgly();
      } else if (useAPI) {
        // Use server API
        resultUrl = await processWithAPI();
      } else {
        throw new Error('No background removal provider available. Install @imgly/background-removal or configure REMOVEBG_API_KEY.');
      }

      if (isMountedRef.current) {
        setState('complete');
        setProgress(100);
        setProgressStage('Complete!');
        onComplete(resultUrl);

        // Reset state after a delay
        setTimeout(() => {
          if (isMountedRef.current) {
            setState('idle');
            setProgress(0);
            setProgressStage('');
          }
        }, 2000);
      }

    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Background removal failed';
        setState('error');
        setErrorMessage(message);
        onError?.(message);

        // Reset error state after delay
        setTimeout(() => {
          if (isMountedRef.current) {
            setState('idle');
            setErrorMessage('');
          }
        }, 5000);
      }
    }
  }, [imageUrl, state, provider, imglyLoaded, onStart, onComplete, onError, processWithImgly, processWithAPI]);

  // Determine button content based on state
  const renderButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <span className="flex items-center gap-2">
            <LoadingSpinner size={16} />
            <span>Initializing...</span>
          </span>
        );

      case 'processing':
        return (
          <span className="flex items-center gap-2">
            <LoadingSpinner size={16} />
            <span className="flex flex-col items-start leading-tight">
              <span>{processingText}</span>
              {progress > 0 && (
                <span className="text-xs opacity-75">
                  {progress}% {progressStage && `- ${progressStage}`}
                </span>
              )}
            </span>
          </span>
        );

      case 'complete':
        return (
          <span className="flex items-center gap-2">
            <CheckIcon />
            <span>Background Removed!</span>
          </span>
        );

      case 'error':
        return (
          <span className="flex items-center gap-2">
            <ErrorIcon />
            <span className="flex flex-col items-start leading-tight">
              <span>Failed</span>
              <span className="text-xs opacity-75 max-w-[200px] truncate">{errorMessage}</span>
            </span>
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-2">
            <RemoveBackgroundIcon />
            <span>{buttonText}</span>
          </span>
        );
    }
  };

  // Determine button variant based on state
  const getVariant = () => {
    if (state === 'complete') return 'gradient';
    if (state === 'error') return 'danger' as const;
    return variant;
  };

  const isProcessing = state === 'loading' || state === 'processing';

  return (
    <div className={`relative ${className}`}>
      <Button
        variant={getVariant()}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled || isProcessing || !imageUrl}
        onClick={handleRemoveBackground}
        className={`relative overflow-hidden ${isProcessing ? 'cursor-wait' : ''}`}
      >
        {/* Progress bar overlay */}
        {isProcessing && progress > 0 && (
          <div
            className="absolute inset-0 bg-white/20 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        )}
        <span className="relative z-10">{renderButtonContent()}</span>
      </Button>

      {/* Provider info tooltip */}
      {imglyLoaded === false && provider === 'auto' && (
        <p className="text-xs text-zinc-500 mt-1">
          Tip: Install @imgly/background-removal for free client-side processing
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
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
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function RemoveBackgroundIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Scissors icon representing "cut" */}
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ============================================================================
// Export
// ============================================================================

export default BackgroundRemovalButton;

/**
 * USAGE EXAMPLES
 * ==============
 *
 * Basic usage with auto provider selection:
 * ```tsx
 * <BackgroundRemovalButton
 *   imageUrl={productImage}
 *   onComplete={(url) => setProcessedImage(url)}
 * />
 * ```
 *
 * Force client-side processing (free, requires @imgly/background-removal):
 * ```tsx
 * <BackgroundRemovalButton
 *   imageUrl={productImage}
 *   provider="imgly"
 *   onComplete={(url) => setProcessedImage(url)}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 *
 * Force server-side processing (requires REMOVEBG_API_KEY):
 * ```tsx
 * <BackgroundRemovalButton
 *   imageUrl={productImage}
 *   provider="removebg"
 *   onComplete={(url) => setProcessedImage(url)}
 *   buttonText="Remove BG (API)"
 * />
 * ```
 *
 * Custom styling:
 * ```tsx
 * <BackgroundRemovalButton
 *   imageUrl={productImage}
 *   onComplete={handleComplete}
 *   variant="gradient"
 *   size="lg"
 *   fullWidth
 *   buttonText="AI Background Removal"
 * />
 * ```
 *
 * INSTALLATION
 * ============
 *
 * For client-side (free) processing:
 * ```bash
 * npm install @imgly/background-removal
 * ```
 *
 * For server-side (API) processing:
 * Add to .env.local:
 * ```
 * REMOVEBG_API_KEY=your_api_key_here
 * ```
 */
