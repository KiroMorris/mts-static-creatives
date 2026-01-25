'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { UPLOAD } from '@/lib/constants';
import { validateHeroImageDimensions } from '@/store/heroSlice';
import type { UploadedHeroImage } from '@/store/heroSlice';

// ============================================================================
// Types
// ============================================================================

interface HeroUploaderProps {
  /** Called when a hero image is successfully uploaded */
  onUpload: (hero: UploadedHeroImage) => void;
  /** Currently uploaded hero image (if any) */
  currentImage?: UploadedHeroImage | null;
  /** Minimum dimension required for hero images (default: 500) */
  minDimension?: number;
  /** Recommended dimensions to display to user */
  recommendedDimensions?: { width: number; height: number };
  /** Called when the user removes the uploaded image */
  onRemove?: () => void;
  /** Optional class name for the container */
  className?: string;
  /** Whether to show the continue button */
  showContinue?: boolean;
  /** Called when continue is clicked */
  onContinue?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function HeroUploader({
  onUpload,
  currentImage,
  minDimension = 500,
  recommendedDimensions = { width: 1080, height: 1920 },
  onRemove,
  className = '',
  showContinue = false,
  onContinue,
}: HeroUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Get image dimensions from a file
   */
  const getImageDimensions = useCallback(
    (file: File): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const url = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };

        img.src = url;
      });
    },
    []
  );

  /**
   * Convert file to base64
   */
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Upload file to server (or process locally)
   */
  const uploadFile = useCallback(
    async (file: File): Promise<UploadedHeroImage> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Get image dimensions first
        const dimensions = await getImageDimensions(file);

        // Validate dimensions
        const validation = validateHeroImageDimensions(
          dimensions.width,
          dimensions.height,
          minDimension
        );

        if (!validation.valid) {
          throw new Error(validation.message);
        }

        // Create local preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 15, 85));
        }, 150);

        // For now, we'll convert to base64 for local storage
        // In production, this would upload to a server
        const base64 = await fileToBase64(file);

        // Generate a unique ID
        const imageId = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        clearInterval(progressInterval);
        setUploadProgress(100);

        const heroImage: UploadedHeroImage = {
          imageUrl: base64,
          imageId,
          originalDimensions: dimensions,
          fileSize: file.size,
          uploadedAt: Date.now(),
        };

        return heroImage;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload image';
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [getImageDimensions, fileToBase64, minDimension]
  );

  /**
   * Handle file drop
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > UPLOAD.maxFileSize) {
        setError('File size exceeds 10MB limit');
        return;
      }

      // Validate file type
      if (!(UPLOAD.supportedFormats as readonly string[]).includes(file.type)) {
        setError('Please upload a JPG, PNG, or WebP image');
        return;
      }

      try {
        const heroImage = await uploadFile(file);
        onUpload(heroImage);
      } catch {
        // Error already set in uploadFile
      }
    },
    [uploadFile, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  /**
   * Handle remove button click
   */
  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    onRemove?.();
  }, [previewUrl, onRemove]);

  /**
   * Handle continue button click
   */
  const handleContinue = useCallback(() => {
    if (currentImage) {
      onContinue?.();
    }
  }, [currentImage, onContinue]);

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Use current image URL for display
  const displayImageUrl = currentImage?.imageUrl || previewUrl;

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          <span className="gradient-text">Upload Your Hero Image</span>
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Upload a custom hero image for your creative
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
          Recommended: {recommendedDimensions.width}x{recommendedDimensions.height}px (9:16 aspect ratio)
        </p>
      </div>

      {/* Dropzone or Preview */}
      {!displayImageUrl ? (
        <div
          {...getRootProps()}
          className={`
            relative rounded-2xl p-12 upload-zone-gradient
            transition-all duration-300 cursor-pointer
            bg-gradient-to-br from-violet-50/50 via-white to-cyan-50/50
            dark:from-violet-950/20 dark:via-zinc-900 dark:to-cyan-950/20
            ${
              isDragActive && !isDragReject
                ? 'scale-[1.02] shadow-2xl shadow-violet-500/20'
                : isDragReject
                ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'hover:shadow-xl hover:shadow-violet-500/10'
            }
            ${isUploading ? 'pointer-events-none opacity-80' : ''}
          `}
        >
          <input {...getInputProps()} ref={fileInputRef} />

          {isUploading ? (
            <div className="flex flex-col items-center relative z-10">
              <div className="p-6 rounded-2xl glass-card mb-4">
                <Spinner size="lg" label="Uploading..." showProgress progress={uploadProgress} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                <ImageUploadIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                {isDragActive
                  ? isDragReject
                    ? 'This file type is not supported'
                    : 'Drop your hero image here'
                  : 'Drag & drop your hero image here'}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                or{' '}
                <span className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                  click to browse
                </span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30">
                  <SparkleIcon className="w-4 h-4 text-violet-500" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    JPG, PNG, WebP (max 10MB)
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                  <DimensionsIcon className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Min {minDimension}x{minDimension}px
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Preview with gradient border */}
          <div className="relative aspect-[9/16] max-w-md mx-auto rounded-2xl overflow-hidden gradient-border p-1">
            <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              <Image
                src={displayImageUrl}
                alt="Uploaded hero image"
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
              />
              {/* Overlay with image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                {currentImage && (
                  <div className="text-white text-sm">
                    <p className="font-medium">
                      {currentImage.originalDimensions.width} x {currentImage.originalDimensions.height}
                    </p>
                    <p className="text-white/70 text-xs">
                      {formatFileSize(currentImage.fileSize)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <Spinner size="lg" label="Processing..." showProgress progress={uploadProgress} />
              </div>
            )}
          </div>

          {/* Success indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/30 dark:to-cyan-900/30">
              <CheckIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Hero image uploaded successfully
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleRemove} disabled={isUploading} className="group">
              <RefreshIcon className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Change Image
            </Button>
            {showContinue && (
              <Button
                onClick={handleContinue}
                disabled={isUploading || !currentImage}
                className="btn-gradient text-white border-0"
              >
                Continue
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error message with premium styling */}
      {error && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/50 rounded-xl shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <XIcon className="w-3 h-3 text-white" />
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Tips section */}
      <div className="mt-8 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
          <LightbulbIcon className="w-4 h-4 text-amber-500" />
          Tips for best results
        </h3>
        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
          <li>Use high-resolution images (at least 1080x1920 recommended)</li>
          <li>Leave space on one side for text and callout overlays</li>
          <li>Ensure good lighting and contrast for visibility</li>
          <li>Consider the 9:16 aspect ratio for optimal display</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ImageUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function DimensionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

export default HeroUploader;
