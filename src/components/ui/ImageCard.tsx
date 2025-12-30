'use client';

import React from 'react';
import Image from 'next/image';
import { Spinner } from './Spinner';

interface ImageCardProps {
  src?: string | null;
  alt: string;
  aspectRatio?: '9:16' | '1:1' | '4:5' | '3:4';
  isLoading?: boolean;
  loadingLabel?: string;
  showOverlay?: boolean;
  overlayContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const aspectRatioStyles: Record<string, string> = {
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '3:4': 'aspect-[3/4]',
};

export function ImageCard({
  src,
  alt,
  aspectRatio = '1:1',
  isLoading = false,
  loadingLabel = 'Loading...',
  showOverlay = false,
  overlayContent,
  onClick,
  className = '',
  children,
}: ImageCardProps) {
  const hasImage = src && !isLoading;

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800
        ${aspectRatioStyles[aspectRatio]}
        ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-zinc-400 transition-all' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
          <Spinner size="lg" label={loadingLabel} />
        </div>
      )}

      {/* Image */}
      {hasImage && (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      )}

      {/* Empty state */}
      {!src && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
          <ImagePlaceholderIcon className="w-12 h-12 mb-2" />
          <span className="text-sm">No image</span>
        </div>
      )}

      {/* Overlay */}
      {showOverlay && hasImage && (
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          {overlayContent}
        </div>
      )}

      {/* Children (action buttons, etc.) */}
      {children && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          {children}
        </div>
      )}
    </div>
  );
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
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
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

export default ImageCard;
