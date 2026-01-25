// Gallery Storage Utilities for Apparel Creative Generator
// Functions to save/load/delete creatives from localStorage

import type {
  SavedCreative,
  NewCreativeData,
  CreativeUpdate,
  CreativeThumbnail,
  StorageStats,
  GalleryExportData,
  GalleryImportResult,
} from '@/types/gallery';
import {
  GALLERY_STORAGE_KEY,
  GALLERY_INDEX_KEY,
} from '@/types/gallery';

// ============================================================================
// Constants
// ============================================================================

// Practical localStorage limit (5MB typical, we use 4MB to be safe)
const STORAGE_LIMIT_BYTES = 4 * 1024 * 1024;

// Maximum recommended size per creative (to prevent bloat)
const MAX_CREATIVE_SIZE_BYTES = 500 * 1024; // 500KB

// Export version for compatibility
const EXPORT_VERSION = '1.0.0';

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique creative ID
 */
export function generateCreativeId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `creative_${timestamp}_${random}`;
}

// ============================================================================
// Image Utilities
// ============================================================================

/**
 * Generate thumbnail from full-size image
 */
export async function generateThumbnail(
  fullImageUrl: string,
  maxWidth: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = img.height / img.width;
      canvas.width = maxWidth;
      canvas.height = Math.round(maxWidth * ratio);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // JPEG at 70% quality
    };
    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    img.src = fullImageUrl;
  });
}

/**
 * Estimate storage size of a data URL in bytes
 */
export function estimateDataUrlSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  // Base64 encoding adds ~33% overhead, remove header and calculate
  const base64 = dataUrl.split(',')[1];
  if (!base64) return dataUrl.length;
  return Math.ceil((base64.length * 3) / 4);
}

/**
 * Estimate total size of a creative in bytes
 */
export function estimateCreativeSize(creative: SavedCreative | NewCreativeData): number {
  let size = 0;

  // Images
  size += estimateDataUrlSize(creative.thumbnail);
  size += estimateDataUrlSize(creative.fullImage);
  size += estimateDataUrlSize(creative.heroImage);
  size += estimateDataUrlSize(creative.productImage);
  if (creative.calloutImages.detail) size += estimateDataUrlSize(creative.calloutImages.detail);
  if (creative.calloutImages.fit) size += estimateDataUrlSize(creative.calloutImages.fit);
  if (creative.calloutImages.pose) size += estimateDataUrlSize(creative.calloutImages.pose);

  // Add ~10KB for metadata overhead
  size += 10 * 1024;

  return size;
}

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Get all creatives from localStorage
 */
export function getAllCreatives(): SavedCreative[] {
  try {
    const data = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SavedCreative[];
  } catch (error) {
    console.error('Failed to load creatives from localStorage:', error);
    return [];
  }
}

/**
 * Get creative by ID
 */
export function getCreativeById(id: string): SavedCreative | null {
  const creatives = getAllCreatives();
  return creatives.find((c) => c.id === id) || null;
}

/**
 * Get lightweight thumbnails for gallery listing
 */
export function getCreativeThumbnails(): CreativeThumbnail[] {
  const creatives = getAllCreatives();
  return creatives.map((c) => ({
    id: c.id,
    name: c.name,
    thumbnail: c.thumbnail,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    aspectRatio: c.aspectRatio,
    isFavorite: c.isFavorite,
    tags: c.tags,
  }));
}

/**
 * Save all creatives to localStorage
 */
function saveAllCreatives(creatives: SavedCreative[]): void {
  try {
    const data = JSON.stringify(creatives);
    localStorage.setItem(GALLERY_STORAGE_KEY, data);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some creatives to free up space.');
    }
    throw error;
  }
}

/**
 * Save a new creative
 */
export async function saveCreative(creativeData: NewCreativeData): Promise<SavedCreative> {
  const id = generateCreativeId();
  const now = Date.now();

  // Generate thumbnail if not provided
  let thumbnail = creativeData.thumbnail;
  if (!thumbnail && creativeData.fullImage) {
    try {
      thumbnail = await generateThumbnail(creativeData.fullImage);
    } catch (error) {
      console.warn('Failed to generate thumbnail, using full image:', error);
      thumbnail = creativeData.fullImage;
    }
  }

  const creative: SavedCreative = {
    ...creativeData,
    id,
    createdAt: now,
    updatedAt: now,
    thumbnail,
    fileSize: estimateCreativeSize(creativeData),
  };

  const creatives = getAllCreatives();

  // Check storage limits
  const totalSize = creatives.reduce((sum, c) => sum + (c.fileSize || 0), 0);
  const newSize = creative.fileSize || 0;

  if (totalSize + newSize > STORAGE_LIMIT_BYTES) {
    throw new Error(
      `Storage limit would be exceeded. Current: ${Math.round(totalSize / 1024)}KB, ` +
      `New: ${Math.round(newSize / 1024)}KB, Limit: ${Math.round(STORAGE_LIMIT_BYTES / 1024)}KB`
    );
  }

  creatives.unshift(creative); // Add to beginning (newest first)
  saveAllCreatives(creatives);

  return creative;
}

/**
 * Update an existing creative
 */
export function updateCreative(id: string, updates: CreativeUpdate): SavedCreative {
  const creatives = getAllCreatives();
  const index = creatives.findIndex((c) => c.id === id);

  if (index === -1) {
    throw new Error(`Creative not found: ${id}`);
  }

  const updatedCreative: SavedCreative = {
    ...creatives[index],
    ...updates,
    updatedAt: Date.now(),
  };

  // Recalculate file size if images changed
  if (updates.fullImage || updates.thumbnail || updates.heroImage || updates.calloutImages) {
    updatedCreative.fileSize = estimateCreativeSize(updatedCreative);
  }

  creatives[index] = updatedCreative;
  saveAllCreatives(creatives);

  return updatedCreative;
}

/**
 * Delete a creative by ID
 */
export function deleteCreative(id: string): boolean {
  const creatives = getAllCreatives();
  const index = creatives.findIndex((c) => c.id === id);

  if (index === -1) {
    return false;
  }

  creatives.splice(index, 1);
  saveAllCreatives(creatives);

  return true;
}

/**
 * Delete multiple creatives
 */
export function deleteMultipleCreatives(ids: string[]): number {
  const creatives = getAllCreatives();
  const idsSet = new Set(ids);
  const filtered = creatives.filter((c) => !idsSet.has(c.id));
  const deletedCount = creatives.length - filtered.length;

  if (deletedCount > 0) {
    saveAllCreatives(filtered);
  }

  return deletedCount;
}

/**
 * Duplicate a creative with a new name
 */
export function duplicateCreative(id: string, newName: string): SavedCreative {
  const original = getCreativeById(id);

  if (!original) {
    throw new Error(`Creative not found: ${id}`);
  }

  const newId = generateCreativeId();
  const now = Date.now();

  const duplicate: SavedCreative = {
    ...original,
    id: newId,
    name: newName,
    createdAt: now,
    updatedAt: now,
    duplicatedFrom: id,
    isFavorite: false, // Don't copy favorite status
  };

  const creatives = getAllCreatives();
  creatives.unshift(duplicate);
  saveAllCreatives(creatives);

  return duplicate;
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(id: string): boolean {
  const creative = getCreativeById(id);
  if (!creative) return false;

  const newStatus = !creative.isFavorite;
  updateCreative(id, { isFavorite: newStatus });
  return newStatus;
}

/**
 * Add a tag to a creative
 */
export function addTag(id: string, tag: string): void {
  const creative = getCreativeById(id);
  if (!creative) return;

  const normalizedTag = tag.trim().toLowerCase();
  if (!normalizedTag || creative.tags.includes(normalizedTag)) return;

  updateCreative(id, { tags: [...creative.tags, normalizedTag] });
}

/**
 * Remove a tag from a creative
 */
export function removeTag(id: string, tag: string): void {
  const creative = getCreativeById(id);
  if (!creative) return;

  const normalizedTag = tag.trim().toLowerCase();
  updateCreative(id, { tags: creative.tags.filter((t) => t !== normalizedTag) });
}

// ============================================================================
// Storage Stats
// ============================================================================

/**
 * Get storage statistics
 */
export function getStorageStats(): StorageStats {
  const creatives = getAllCreatives();

  const totalSizeBytes = creatives.reduce((sum, c) => sum + (c.fileSize || 0), 0);
  const timestamps = creatives.map((c) => c.createdAt).filter(Boolean);

  return {
    totalCreatives: creatives.length,
    totalSizeBytes,
    totalSizeMB: Math.round((totalSizeBytes / (1024 * 1024)) * 100) / 100,
    averageSizePerCreative: creatives.length > 0 ? Math.round(totalSizeBytes / creatives.length) : 0,
    storageLimit: STORAGE_LIMIT_BYTES,
    usagePercentage: Math.round((totalSizeBytes / STORAGE_LIMIT_BYTES) * 100),
    oldestCreative: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestCreative: timestamps.length > 0 ? Math.max(...timestamps) : null,
  };
}

// ============================================================================
// Export / Import
// ============================================================================

/**
 * Export all creatives to a downloadable JSON file
 */
export function exportAllData(): GalleryExportData {
  const creatives = getAllCreatives();

  return {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    creatives,
  };
}

/**
 * Download export data as a file
 */
export function downloadExportFile(data: GalleryExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `acg-gallery-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Import creatives from an exported file
 */
export async function importData(file: File): Promise<GalleryImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as GalleryExportData;

        // Validate format
        if (!data.version || !Array.isArray(data.creatives)) {
          resolve({
            success: false,
            importedCount: 0,
            skippedCount: 0,
            errors: ['Invalid export file format'],
          });
          return;
        }

        const existingCreatives = getAllCreatives();
        const existingIds = new Set(existingCreatives.map((c) => c.id));

        let importedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        for (const creative of data.creatives) {
          // Skip if ID already exists
          if (existingIds.has(creative.id)) {
            skippedCount++;
            continue;
          }

          try {
            // Validate required fields
            if (!creative.id || !creative.name || !creative.fullImage) {
              errors.push(`Invalid creative: ${creative.id || 'unknown'}`);
              continue;
            }

            existingCreatives.push(creative);
            importedCount++;
          } catch (err) {
            errors.push(`Failed to import: ${creative.id}`);
          }
        }

        if (importedCount > 0) {
          saveAllCreatives(existingCreatives);
        }

        resolve({
          success: true,
          importedCount,
          skippedCount,
          errors,
        });
      } catch (error) {
        resolve({
          success: false,
          importedCount: 0,
          skippedCount: 0,
          errors: ['Failed to parse import file'],
        });
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read import file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Clear all gallery data
 */
export function clearAllData(): void {
  localStorage.removeItem(GALLERY_STORAGE_KEY);
  localStorage.removeItem(GALLERY_INDEX_KEY);
}

// ============================================================================
// Search & Filter Utilities
// ============================================================================

/**
 * Filter and sort creatives based on criteria
 */
export function filterCreatives(
  creatives: SavedCreative[],
  options: {
    searchQuery?: string;
    tags?: string[];
    aspectRatio?: string | null;
    favoritesOnly?: boolean;
    sortBy?: 'createdAt' | 'updatedAt' | 'name';
    sortOrder?: 'asc' | 'desc';
  }
): SavedCreative[] {
  let filtered = [...creatives];

  // Search query
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // Tags filter
  if (options.tags && options.tags.length > 0) {
    const filterTags = options.tags.map((t) => t.toLowerCase());
    filtered = filtered.filter((c) =>
      filterTags.some((tag) => c.tags.includes(tag))
    );
  }

  // Aspect ratio filter
  if (options.aspectRatio) {
    filtered = filtered.filter((c) => c.aspectRatio === options.aspectRatio);
  }

  // Favorites only
  if (options.favoritesOnly) {
    filtered = filtered.filter((c) => c.isFavorite);
  }

  // Sort
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'updatedAt':
        comparison = a.updatedAt - b.updatedAt;
        break;
      case 'createdAt':
      default:
        comparison = a.createdAt - b.createdAt;
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
}

/**
 * Get all unique tags from creatives
 */
export function getAllTags(): string[] {
  const creatives = getAllCreatives();
  const tagSet = new Set<string>();

  for (const creative of creatives) {
    for (const tag of creative.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}
