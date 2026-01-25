'use client';

import React from 'react';
import { GalleryCard } from './GalleryCard';
import type { SavedCreative, GalleryGridProps } from '@/types/gallery';

/**
 * GalleryGrid - Responsive grid layout for displaying saved creatives
 *
 * Features:
 * - Responsive columns: 2 on mobile, up to 6 on xl screens
 * - Selection mode support for bulk actions
 * - Click handlers for view and edit actions
 */
export function GalleryGrid({
  creatives,
  onView,
  onEdit,
  isSelectionMode,
  selectedIds,
}: GalleryGridProps) {
  if (creatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <EmptyGalleryIcon className="w-20 h-20 text-zinc-300 dark:text-zinc-600 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          No creatives yet
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          Create your first creative and it will appear here. All your saved work is stored locally on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {creatives.map((creative) => (
        <GalleryCard
          key={creative.id}
          creative={creative}
          onView={() => onView(creative)}
          onEdit={() => onEdit(creative)}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds.has(creative.id)}
        />
      ))}
    </div>
  );
}

// Empty state icon
function EmptyGalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

export default GalleryGrid;
