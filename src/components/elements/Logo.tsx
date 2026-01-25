'use client';

// Logo Element Component
// Renders an uploaded logo image with configurable fit modes
// Supports contain, cover, and fill object-fit options

import React from 'react';
import Image from 'next/image';
import type { LogoElement, LogoFit } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface LogoProps {
  element: LogoElement;
  isPreview?: boolean;  // When true, no interactive features
}

// ============================================================================
// Helper to get object-fit class
// ============================================================================

function getObjectFitClass(fit: LogoFit): string {
  switch (fit) {
    case 'contain':
      return 'object-contain';
    case 'cover':
      return 'object-cover';
    case 'fill':
      return 'object-fill';
    default:
      return 'object-contain';
  }
}

// ============================================================================
// Component
// ============================================================================

export function Logo({ element }: LogoProps) {
  const { imageUrl, fit, size } = element;

  // If no image URL, show placeholder
  if (!imageUrl) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-zinc-800 border border-dashed border-zinc-600 rounded"
        style={{ minHeight: 40 }}
      >
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">No logo</span>
        </div>
      </div>
    );
  }

  const objectFitClass = getObjectFitClass(fit);

  // Check if the image URL is a data URL (base64)
  const isDataUrl = imageUrl.startsWith('data:');
  
  // Check if the image URL is a blob URL
  const isBlobUrl = imageUrl.startsWith('blob:');

  // For data URLs and blob URLs, use regular img tag for better compatibility
  if (isDataUrl || isBlobUrl) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Brand logo"
          className={`w-full h-full ${objectFitClass}`}
          style={{
            display: 'block',
          }}
        />
      </div>
    );
  }

  // For regular URLs, use Next.js Image component
  const imageSize = Math.max(size.width, 200);
  
  return (
    <div className="w-full h-full relative overflow-hidden">
      <Image
        src={imageUrl}
        alt="Brand logo"
        fill
        className={objectFitClass}
        sizes={`${imageSize}px`}
        unoptimized
      />
    </div>
  );
}

// ============================================================================
// Logo Fit Labels (for UI)
// ============================================================================

export const LOGO_FIT_LABELS: Record<LogoFit, string> = {
  contain: 'Contain (fit inside)',
  cover: 'Cover (fill & crop)',
  fill: 'Fill (stretch)',
};

export const LOGO_FIT_DESCRIPTIONS: Record<LogoFit, string> = {
  contain: 'The entire logo is visible, maintaining aspect ratio',
  cover: 'The logo fills the area, cropping if needed',
  fill: 'The logo stretches to fill the entire area',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Data URLs are valid
  if (url.startsWith('data:image/')) return true;
  
  // Blob URLs are valid
  if (url.startsWith('blob:')) return true;
  
  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const lowerUrl = url.toLowerCase();
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return imageExtensions.some(ext => pathname.endsWith(ext)) || 
           url.includes('image') || 
           url.includes('logo');
  } catch {
    // If URL parsing fails, check the string directly
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }
}

/**
 * Convert a File to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default Logo;
