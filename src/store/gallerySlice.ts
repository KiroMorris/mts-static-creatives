// Gallery Store for Apparel Creative Generator
// Zustand slice for managing saved creatives with localStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  GalleryStore,
  GalleryState,
  SavedCreative,
  NewCreativeData,
  CreativeUpdate,
  StorageStats,
} from '@/types/gallery';
import {
  DEFAULT_GALLERY_STATE,
  GALLERY_SETTINGS_KEY,
} from '@/types/gallery';
import {
  getAllCreatives,
  saveCreative as saveCreativeToStorage,
  updateCreative as updateCreativeInStorage,
  deleteCreative as deleteCreativeFromStorage,
  deleteMultipleCreatives,
  duplicateCreative as duplicateCreativeInStorage,
  getStorageStats as getStorageStatsFromStorage,
  exportAllData,
  downloadExportFile,
  importData as importDataFromFile,
  clearAllData as clearAllStorageData,
  filterCreatives,
} from '@/lib/gallery-storage';

// ============================================================================
// Persisted Settings Type (only view/filter preferences, not data)
// ============================================================================

interface PersistedGallerySettings {
  viewMode: 'grid' | 'list';
  sortBy: 'createdAt' | 'updatedAt' | 'name';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// Gallery Store
// ============================================================================

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set, get) => ({
      // Initial State
      ...DEFAULT_GALLERY_STATE,

      // ========================================================================
      // CRUD Operations
      // ========================================================================

      saveCreative: async (creativeData: NewCreativeData): Promise<string> => {
        set({ isLoading: true, error: null });

        try {
          const savedCreative = await saveCreativeToStorage(creativeData);

          set((state) => ({
            creatives: [savedCreative, ...state.creatives],
            isLoading: false,
          }));

          return savedCreative.id;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to save creative';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      updateCreative: async (id: string, updates: CreativeUpdate): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          const updatedCreative = updateCreativeInStorage(id, updates);

          set((state) => ({
            creatives: state.creatives.map((c) =>
              c.id === id ? updatedCreative : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update creative';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      deleteCreative: async (id: string): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          const deleted = deleteCreativeFromStorage(id);

          if (!deleted) {
            throw new Error('Creative not found');
          }

          set((state) => ({
            creatives: state.creatives.filter((c) => c.id !== id),
            selectedIds: new Set([...state.selectedIds].filter((i) => i !== id)),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete creative';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      deleteMultiple: async (ids: string[]): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          deleteMultipleCreatives(ids);

          const idsSet = new Set(ids);
          set((state) => ({
            creatives: state.creatives.filter((c) => !idsSet.has(c.id)),
            selectedIds: new Set(),
            isSelectionMode: false,
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete creatives';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // ========================================================================
      // Load/Fetch
      // ========================================================================

      loadCreatives: async (): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          const creatives = getAllCreatives();
          set({ creatives, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load creatives';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      getCreativeById: (id: string): SavedCreative | undefined => {
        return get().creatives.find((c) => c.id === id);
      },

      // ========================================================================
      // Duplicate
      // ========================================================================

      duplicateCreative: async (id: string, newName: string): Promise<string> => {
        set({ isLoading: true, error: null });

        try {
          const duplicated = duplicateCreativeInStorage(id, newName);

          set((state) => ({
            creatives: [duplicated, ...state.creatives],
            isLoading: false,
          }));

          return duplicated.id;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to duplicate creative';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // ========================================================================
      // Favorites
      // ========================================================================

      toggleFavorite: (id: string): void => {
        const creative = get().creatives.find((c) => c.id === id);
        if (!creative) return;

        const newStatus = !creative.isFavorite;

        try {
          updateCreativeInStorage(id, { isFavorite: newStatus });

          set((state) => ({
            creatives: state.creatives.map((c) =>
              c.id === id ? { ...c, isFavorite: newStatus, updatedAt: Date.now() } : c
            ),
          }));
        } catch (error) {
          console.error('Failed to toggle favorite:', error);
        }
      },

      // ========================================================================
      // Tags
      // ========================================================================

      addTag: (id: string, tag: string): void => {
        const creative = get().creatives.find((c) => c.id === id);
        if (!creative) return;

        const normalizedTag = tag.trim().toLowerCase();
        if (!normalizedTag || creative.tags.includes(normalizedTag)) return;

        const newTags = [...creative.tags, normalizedTag];

        try {
          updateCreativeInStorage(id, { tags: newTags });

          set((state) => ({
            creatives: state.creatives.map((c) =>
              c.id === id ? { ...c, tags: newTags, updatedAt: Date.now() } : c
            ),
          }));
        } catch (error) {
          console.error('Failed to add tag:', error);
        }
      },

      removeTag: (id: string, tag: string): void => {
        const creative = get().creatives.find((c) => c.id === id);
        if (!creative) return;

        const normalizedTag = tag.trim().toLowerCase();
        const newTags = creative.tags.filter((t) => t !== normalizedTag);

        try {
          updateCreativeInStorage(id, { tags: newTags });

          set((state) => ({
            creatives: state.creatives.map((c) =>
              c.id === id ? { ...c, tags: newTags, updatedAt: Date.now() } : c
            ),
          }));
        } catch (error) {
          console.error('Failed to remove tag:', error);
        }
      },

      // ========================================================================
      // Selection
      // ========================================================================

      toggleSelection: (id: string): void => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
          return { selectedIds: newSelected };
        });
      },

      selectAll: (): void => {
        set((state) => ({
          selectedIds: new Set(state.creatives.map((c) => c.id)),
        }));
      },

      clearSelection: (): void => {
        set({ selectedIds: new Set() });
      },

      setSelectionMode: (enabled: boolean): void => {
        set({
          isSelectionMode: enabled,
          selectedIds: enabled ? get().selectedIds : new Set(),
        });
      },

      // ========================================================================
      // View/Filter
      // ========================================================================

      setViewMode: (mode: 'grid' | 'list'): void => {
        set({ viewMode: mode });
      },

      setSort: (by: 'createdAt' | 'updatedAt' | 'name', order: 'asc' | 'desc'): void => {
        set({ sortBy: by, sortOrder: order });
      },

      setSearchQuery: (query: string): void => {
        set({ searchQuery: query });
      },

      setFilterTags: (tags: string[]): void => {
        set({ filterTags: tags });
      },

      setFilterAspectRatio: (ratio: string | null): void => {
        set({ filterAspectRatio: ratio });
      },

      toggleFavoritesFilter: (): void => {
        set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly }));
      },

      // ========================================================================
      // Data Management
      // ========================================================================

      exportAllData: async (): Promise<void> => {
        try {
          const data = exportAllData();
          downloadExportFile(data);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to export data';
          set({ error: message });
          throw error;
        }
      },

      importData: async (file: File): Promise<number> => {
        set({ isLoading: true, error: null });

        try {
          const result = await importDataFromFile(file);

          if (!result.success) {
            throw new Error(result.errors.join(', '));
          }

          // Reload creatives from storage
          const creatives = getAllCreatives();
          set({ creatives, isLoading: false });

          return result.importedCount;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to import data';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      clearAllData: async (): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          clearAllStorageData();
          set({
            creatives: [],
            selectedIds: new Set(),
            isSelectionMode: false,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear data';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      getStorageStats: (): StorageStats => {
        return getStorageStatsFromStorage();
      },
    }),
    {
      name: GALLERY_SETTINGS_KEY,
      storage: createJSONStorage(() => localStorage),

      // Only persist view preferences, not the actual data
      // (data is managed separately in gallery-storage.ts)
      partialize: (state): PersistedGallerySettings => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),

      // Merge persisted settings with default state
      merge: (persisted, current) => {
        const persistedSettings = persisted as PersistedGallerySettings | undefined;

        return {
          ...current,
          viewMode: persistedSettings?.viewMode ?? current.viewMode,
          sortBy: persistedSettings?.sortBy ?? current.sortBy,
          sortOrder: persistedSettings?.sortOrder ?? current.sortOrder,
        };
      },
    }
  )
);

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Get filtered and sorted creatives based on current state
 */
export function useFilteredCreatives(): SavedCreative[] {
  const {
    creatives,
    searchQuery,
    filterTags,
    filterAspectRatio,
    showFavoritesOnly,
    sortBy,
    sortOrder,
  } = useGalleryStore();

  return filterCreatives(creatives, {
    searchQuery,
    tags: filterTags,
    aspectRatio: filterAspectRatio,
    favoritesOnly: showFavoritesOnly,
    sortBy,
    sortOrder,
  });
}

/**
 * Get count of selected creatives
 */
export function useSelectedCount(): number {
  return useGalleryStore((state) => state.selectedIds.size);
}

/**
 * Check if a creative is selected
 */
export function useIsSelected(id: string): boolean {
  return useGalleryStore((state) => state.selectedIds.has(id));
}

/**
 * Get storage statistics
 */
export function useStorageStats(): StorageStats {
  const getStorageStats = useGalleryStore((state) => state.getStorageStats);
  return getStorageStats();
}
