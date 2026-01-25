// Gallery Types for Apparel Creative Generator
// Saved creatives with thumbnail, full image, and metadata

import type { StyleSettings, CalloutPrompt, CalloutType } from './index';

// ============================================================================
// Core Gallery Types
// ============================================================================

/**
 * SavedCreative - Complete representation of a saved creative project
 */
export interface SavedCreative {
  // === Identity ===
  id: string;                              // Unique identifier (e.g., "creative_1704067200000_abc123")
  name: string;                            // User-defined name
  description?: string;                    // Optional description

  // === Timestamps ===
  createdAt: number;                       // Unix timestamp when first saved
  updatedAt: number;                       // Unix timestamp of last modification

  // === Images (stored as data URLs for localStorage, or blob refs for IndexedDB) ===
  thumbnail: string;                       // Low-res preview (300x533 for 9:16 ratio)
  fullImage: string;                       // Full resolution final collage (1080x1920)
  heroImage: string;                       // Original hero image used
  calloutImages: {
    detail: string | null;
    fit: string | null;
    pose: string | null;
  };
  productImage: string;                    // Original uploaded product image

  // === Configuration (for editing/duplication) ===
  styleSettings: StyleSettings;            // Complete style settings
  selectedCallouts: [string, string, string];
  calloutOrder: [CalloutType, CalloutType, CalloutType];
  customCalloutPrompts: CalloutPrompt[];   // Any custom prompts used

  // === Text Content ===
  headline: string;
  subtitle: string;

  // === Prompts Used (for reference/recreation) ===
  heroPrompt: string;                      // The prompt used for hero generation
  heroGeneratedPrompt: string;             // Auto-generated prompt
  heroCustomPrompt: string;                // User-edited prompt
  useCustomHeroPrompt: boolean;

  // === Metadata ===
  dimensions: {
    width: number;                         // 1080
    height: number;                        // 1920
  };
  aspectRatio: '9:16' | '1:1' | '4:5';     // For future multi-format support
  fileSize: number;                        // Estimated bytes
  format: 'png' | 'jpg';                   // Export format used

  // === Organization ===
  tags: string[];                          // User-defined tags
  isFavorite: boolean;                     // Quick access flag
  folder?: string;                         // Future: folder organization

  // === Source Tracking ===
  templateId?: string;                     // If created from a template
  duplicatedFrom?: string;                 // If duplicated from another creative
}

/**
 * CreativeThumbnail - Lightweight version for gallery listing
 * Used for fast gallery loading without full data
 */
export interface CreativeThumbnail {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
  aspectRatio: '9:16' | '1:1' | '4:5';
  isFavorite: boolean;
  tags: string[];
}

/**
 * NewCreativeData - Data needed to save a new creative
 * Omits auto-generated fields (id, timestamps)
 */
export type NewCreativeData = Omit<SavedCreative, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * CreativeUpdate - Partial update data for existing creative
 */
export type CreativeUpdate = Partial<Omit<SavedCreative, 'id' | 'createdAt'>>;

// ============================================================================
// Gallery State Types
// ============================================================================

/**
 * GalleryState - Zustand store state for gallery
 */
export interface GalleryState {
  creatives: SavedCreative[];
  isLoading: boolean;
  error: string | null;

  // View state
  viewMode: 'grid' | 'list';
  sortBy: 'createdAt' | 'updatedAt' | 'name';
  sortOrder: 'asc' | 'desc';

  // Filter state
  searchQuery: string;
  filterTags: string[];
  filterAspectRatio: string | null;
  showFavoritesOnly: boolean;

  // Selection state (for bulk actions)
  selectedIds: Set<string>;
  isSelectionMode: boolean;
}

/**
 * GalleryActions - Store actions
 */
export interface GalleryActions {
  // CRUD Operations
  saveCreative: (creative: NewCreativeData) => Promise<string>;
  updateCreative: (id: string, updates: CreativeUpdate) => Promise<void>;
  deleteCreative: (id: string) => Promise<void>;
  deleteMultiple: (ids: string[]) => Promise<void>;

  // Load/Fetch
  loadCreatives: () => Promise<void>;
  getCreativeById: (id: string) => SavedCreative | undefined;

  // Duplicate
  duplicateCreative: (id: string, newName: string) => Promise<string>;

  // Favorites
  toggleFavorite: (id: string) => void;

  // Tags
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;

  // Selection
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectionMode: (enabled: boolean) => void;

  // View/Filter
  setViewMode: (mode: 'grid' | 'list') => void;
  setSort: (by: 'createdAt' | 'updatedAt' | 'name', order: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterAspectRatio: (ratio: string | null) => void;
  toggleFavoritesFilter: () => void;

  // Data Management
  exportAllData: () => Promise<void>;
  importData: (file: File) => Promise<number>;
  clearAllData: () => Promise<void>;
  getStorageStats: () => StorageStats;
}

export type GalleryStore = GalleryState & GalleryActions;

// ============================================================================
// Storage & Utility Types
// ============================================================================

/**
 * StorageStats - Storage usage information
 */
export interface StorageStats {
  totalCreatives: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  averageSizePerCreative: number;
  storageLimit: number;              // Practical localStorage limit
  usagePercentage: number;
  oldestCreative: number | null;     // Timestamp
  newestCreative: number | null;
}

/**
 * GalleryExportData - Format for exporting gallery data
 */
export interface GalleryExportData {
  version: string;
  exportedAt: number;
  creatives: SavedCreative[];
}

/**
 * GalleryImportResult - Result of importing gallery data
 */
export interface GalleryImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_GALLERY_STATE: GalleryState = {
  creatives: [],
  isLoading: false,
  error: null,
  viewMode: 'grid',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  searchQuery: '',
  filterTags: [],
  filterAspectRatio: null,
  showFavoritesOnly: false,
  selectedIds: new Set(),
  isSelectionMode: false,
};

// Storage key constants
export const GALLERY_STORAGE_KEY = 'acg-gallery';
export const GALLERY_INDEX_KEY = 'acg-gallery-index';
export const GALLERY_SETTINGS_KEY = 'acg-gallery-settings';

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * GalleryGridProps - Props for the gallery grid component
 */
export interface GalleryGridProps {
  creatives: SavedCreative[];
  onView: (creative: SavedCreative) => void;
  onEdit: (creative: SavedCreative) => void;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
}

/**
 * GalleryCardProps - Props for individual gallery card component
 */
export interface GalleryCardProps {
  creative: SavedCreative;
  onView: () => void;
  onEdit: () => void;
  isSelectionMode: boolean;
  isSelected: boolean;
}

/**
 * GalleryDetailModalProps - Props for the detail modal component
 */
export interface GalleryDetailModalProps {
  creative: SavedCreative;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
