'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { SavedCreative, GalleryDetailModalProps } from '@/types/gallery';

/**
 * GalleryDetailModal - Full-size preview modal with download/edit/delete actions
 *
 * Features:
 * - Full resolution image display
 * - Download in PNG/JPG formats
 * - Edit button to load creative back into editor
 * - Delete with confirmation
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 */
export function GalleryDetailModal({
  creative,
  onClose,
  onEdit,
  onDelete,
}: GalleryDetailModalProps) {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownload = useCallback(async () => {
    if (!creative.fullImage) return;

    setIsDownloading(true);
    try {
      // If fullImage is a URL, fetch it
      const response = await fetch(creative.fullImage);
      const blob = await response.blob();

      // Convert to desired format if needed
      let downloadBlob = blob;
      if (downloadFormat === 'jpg' && blob.type === 'image/png') {
        // Convert PNG to JPG
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const jpgResponse = await fetch(jpgDataUrl);
          downloadBlob = await jpgResponse.blob();
        }
        URL.revokeObjectURL(img.src);
      }

      // Create download link
      const url = URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = creative.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeName}_${Date.now()}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [creative, downloadFormat]);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      onClose();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 5000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[95vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Image Preview Section */}
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px]">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-lg overflow-hidden shadow-xl">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                <Spinner size="lg" label="Loading preview..." />
              </div>
            )}
            {imageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-500">
                <ImageErrorIcon className="w-16 h-16 mb-2" />
                <span className="text-sm">Failed to load image</span>
              </div>
            ) : (
              <Image
                src={creative.fullImage || creative.thumbnail}
                alt={creative.name}
                fill
                className={`object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                priority
              />
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-700">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 pr-8">
              {creative.name}
            </h2>
            {creative.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {creative.description}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Dates */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Created</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {formatDate(creative.createdAt)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Modified</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {formatDate(creative.updatedAt)}
                </span>
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Dimensions</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {creative.dimensions.width} x {creative.dimensions.height}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Aspect Ratio</span>
                <span className="text-zinc-700 dark:text-zinc-300">{creative.aspectRatio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">File Size</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {formatFileSize(creative.fileSize)}
                </span>
              </div>
            </div>

            {/* Tags */}
            {creative.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {creative.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Text Content Preview */}
            {(creative.headline || creative.subtitle) && (
              <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Text Content
                </span>
                {creative.headline && (
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {creative.headline}
                  </p>
                )}
                {creative.subtitle && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {creative.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Download Options */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Download Format
              </span>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="png"
                    checked={downloadFormat === 'png'}
                    onChange={() => setDownloadFormat('png')}
                    className="w-4 h-4 accent-violet-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">PNG</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="jpg"
                    checked={downloadFormat === 'jpg'}
                    onChange={() => setDownloadFormat('jpg')}
                    className="w-4 h-4 accent-violet-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">JPG</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
            <Button
              variant="gradient"
              size="lg"
              fullWidth
              onClick={handleDownload}
              isLoading={isDownloading}
              leftIcon={<DownloadIcon className="w-5 h-5" />}
            >
              Download {downloadFormat.toUpperCase()}
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={onEdit}
                leftIcon={<EditIcon className="w-4 h-4" />}
              >
                Edit
              </Button>
              <Button
                variant={showDeleteConfirm ? 'danger' : 'ghost'}
                size="md"
                fullWidth
                onClick={handleDelete}
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                {showDeleteConfirm ? 'Confirm?' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function ImageErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

export default GalleryDetailModal;
