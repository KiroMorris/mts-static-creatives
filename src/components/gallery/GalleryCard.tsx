'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { GalleryCardProps } from '@/types/gallery';

/**
 * GalleryCard - Individual card displaying a creative thumbnail with actions
 *
 * Features:
 * - Thumbnail display with 9:16 aspect ratio
 * - Hover actions: View, Edit, Delete
 * - Selection checkbox for bulk operations
 * - Favorite toggle
 * - Date and tags display
 */
export function GalleryCard({
  creative,
  onView,
  onEdit,
  isSelectionMode,
  isSelected,
}: GalleryCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isFavorite, setIsFavorite] = useState(creative.isFavorite);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (isSelectionMode) {
      // Selection handled by parent
    } else {
      onView();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Persist to gallery store when implemented
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      // TODO: Call delete from gallery store
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestamp));
  };

  return (
    <div
      className={`
        group relative rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20
        border-2 ${
          isSelected
            ? 'border-violet-500 ring-2 ring-violet-500/50'
            : 'border-transparent hover:border-violet-500/30'
        }
        ${isSelectionMode ? 'ring-offset-2' : ''}
        bg-white dark:bg-zinc-900
      `}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setConfirmDelete(false);
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-[9/16] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
        {!imageError && creative.thumbnail ? (
          <Image
            src={creative.thumbnail}
            alt={creative.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlaceholderIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}

        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3 z-10">
            <div
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-violet-500 border-violet-500'
                    : 'bg-white/80 border-zinc-300 hover:border-violet-400'
                }
              `}
            >
              {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          className={`
            absolute top-3 right-3 z-10 w-8 h-8 rounded-full
            flex items-center justify-center transition-all duration-200
            ${
              isFavorite
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-400 hover:text-pink-500'
            }
            ${showActions || isFavorite ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon className="w-4 h-4" filled={isFavorite} />
        </button>

        {/* Hover Actions Overlay */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent
            flex flex-col justify-end p-4 transition-opacity duration-300
            ${showActions && !isSelectionMode ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="flex-1 py-2 px-3 bg-white/90 hover:bg-white text-zinc-900 rounded-lg text-sm font-medium transition-colors"
            >
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 py-2 px-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className={`
                py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${
                  confirmDelete
                    ? 'bg-red-500 hover:bg-red-600 text-white min-w-[80px]'
                    : 'bg-white/90 hover:bg-white text-zinc-900'
                }
              `}
              aria-label={confirmDelete ? 'Confirm delete' : 'Delete'}
            >
              {confirmDelete ? 'Confirm?' : <TrashIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3">
        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
          {creative.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(creative.updatedAt)}
          </p>
          <span className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded">
            {creative.aspectRatio}
          </span>
        </div>

        {/* Tags */}
        {creative.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {creative.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {creative.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-500 rounded-full">
                +{creative.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon Components
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
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

function ImagePlaceholderIcon({ className }: { className?: string }) {
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

export default GalleryCard;
