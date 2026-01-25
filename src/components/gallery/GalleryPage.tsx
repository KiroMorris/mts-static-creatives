'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { GalleryGrid } from './GalleryGrid';
import { GalleryDetailModal } from './GalleryDetailModal';
import type { SavedCreative } from '@/types/gallery';
import { GALLERY_STORAGE_KEY } from '@/types/gallery';

type SortBy = 'createdAt' | 'updatedAt' | 'name';
type SortOrder = 'asc' | 'desc';

/**
 * GalleryPage - Main gallery page component with filtering, sorting, and actions
 *
 * Features:
 * - Search by name, tags
 * - Filter by aspect ratio
 * - Sort by date or name
 * - Grid/List view toggle
 * - Bulk selection mode
 * - Detail modal with download/edit/delete
 */
export function GalleryPage() {
  const router = useRouter();

  // State
  const [creatives, setCreatives] = useState<SavedCreative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAspectRatio, setFilterAspectRatio] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Modal state
  const [selectedCreative, setSelectedCreative] = useState<SavedCreative | null>(null);

  // Load creatives from localStorage on mount
  useEffect(() => {
    loadCreatives();
  }, []);

  const loadCreatives = () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedCreative[];
        setCreatives(parsed);
      }
    } catch (err) {
      console.error('Failed to load creatives:', err);
      setError('Failed to load your saved creatives. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCreatives = (updatedCreatives: SavedCreative[]) => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedCreatives));
      setCreatives(updatedCreatives);
    } catch (err) {
      console.error('Failed to save creatives:', err);
      setError('Failed to save changes. Storage may be full.');
    }
  };

  // Filter and sort creatives
  const filteredCreatives = useMemo(() => {
    let result = [...creatives];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((c) => c.isFavorite);
    }

    // Aspect ratio filter
    if (filterAspectRatio) {
      result = result.filter((c) => c.aspectRatio === filterAspectRatio);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'updatedAt':
        default:
          comparison = a.updatedAt - b.updatedAt;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [creatives, searchQuery, filterAspectRatio, showFavoritesOnly, sortBy, sortOrder]);

  // Handlers
  const handleView = (creative: SavedCreative) => {
    setSelectedCreative(creative);
  };

  const handleEdit = (creative: SavedCreative) => {
    // TODO: Load creative into editor and navigate
    // For now, just go to home page
    router.push('/');
  };

  const handleDelete = (id: string) => {
    const updated = creatives.filter((c) => c.id !== id);
    saveCreatives(updated);
    setSelectedCreative(null);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const updated = creatives.filter((c) => !selectedIds.has(c.id));
    saveCreatives(updated);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleToggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredCreatives.map((c) => c.id)));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleCloseModal = () => {
    setSelectedCreative(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" label="Loading gallery..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ErrorIcon className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md mb-6">{error}</p>
        <Button onClick={loadCreatives}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Title and Back */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Back to editor"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gallery</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {filteredCreatives.length} of {creatives.length} creatives
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by name or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            {/* New Creative Button */}
            <Button onClick={() => router.push('/')} variant="gradient" leftIcon={<PlusIcon className="w-5 h-5" />}>
              New Creative
            </Button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-[73px] z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Aspect Ratio */}
            <select
              value={filterAspectRatio || ''}
              onChange={(e) => setFilterAspectRatio(e.target.value || null)}
              className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Sizes</option>
              <option value="9:16">9:16 Portrait</option>
              <option value="1:1">1:1 Square</option>
              <option value="4:5">4:5 Social</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-') as [SortBy, SortOrder];
                setSortBy(by);
                setSortOrder(order);
              }}
              className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-violet-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="updatedAt-desc">Recently Modified</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-pink-500'
              }`}
            >
              <HeartIcon className="w-4 h-4 inline mr-1.5" filled={showFavoritesOnly} />
              Favorites
            </button>

            <div className="flex-1" />

            {/* Selection Mode Toggle */}
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) {
                  setSelectedIds(new Set());
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelectionMode
                  ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <CheckboxIcon className="w-4 h-4 inline mr-1.5" />
              Select
            </button>
          </div>
        </div>
      </div>

      {/* Selection Bar (visible when items selected) */}
      {selectedIds.size > 0 && (
        <div className="sticky top-[129px] z-20 bg-violet-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <span className="font-medium">{selectedIds.size} selected</span>
            <button
              onClick={handleSelectAll}
              className="text-sm underline hover:no-underline"
            >
              Select All
            </button>
            <button
              onClick={handleClearSelection}
              className="text-sm underline hover:no-underline"
            >
              Clear
            </button>
            <div className="flex-1" />
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              leftIcon={<TrashIcon className="w-4 h-4" />}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <GalleryGrid
          creatives={filteredCreatives}
          onView={handleView}
          onEdit={handleEdit}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
        />
      </main>

      {/* Detail Modal */}
      {selectedCreative && (
        <GalleryDetailModal
          creative={selectedCreative}
          onClose={handleCloseModal}
          onEdit={() => handleEdit(selectedCreative)}
          onDelete={() => handleDelete(selectedCreative.id)}
        />
      )}
    </div>
  );
}

// Icon Components
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
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

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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

function ErrorIcon({ className }: { className?: string }) {
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

export default GalleryPage;
