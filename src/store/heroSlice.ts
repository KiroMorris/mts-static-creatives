// Hero Slice for Zustand Store
// Manages hero image upload, zoom, focus, and background settings

import { StateCreator } from 'zustand';

// ============================================================================
// Types
// ============================================================================

export type HeroMode = 'ai-generated' | 'upload' | 'product-only';

export type HeroSizeMode = 'full' | 'half-top' | 'half-bottom' | 'half-left' | 'half-right' | 'custom';

export type BackgroundFillType = 'blur' | 'solid' | 'gradient' | 'transparent';

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number; // For linear gradient (0-360)
  centerX?: number; // For radial gradient (0-100)
  centerY?: number; // For radial gradient (0-100)
}

export interface HeroSizeConfig {
  mode: HeroSizeMode;
  // For all modes
  zoom: number; // 1.0 = 100%, 2.0 = 200%
  focusX: number; // 0-100 (percentage)
  focusY: number; // 0-100 (percentage)
  // For 'custom' mode
  customBounds?: {
    x: number; // 0-1080
    y: number; // 0-1920
    width: number; // pixels
    height: number; // pixels
  };
  // Background fill for non-full modes
  backgroundFill: {
    type: BackgroundFillType;
    blurAmount?: number; // For 'blur' type (0-50)
    solidColor?: string; // For 'solid' type (hex color)
    gradient?: GradientConfig; // For 'gradient' type
  };
}

export interface UploadedHeroImage {
  imageUrl: string;
  imageId: string;
  originalDimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  uploadedAt: number;
}

// Hero state managed by this slice
export interface HeroSliceState {
  // Hero mode selection
  heroMode: HeroMode;

  // Uploaded hero image (for 'upload' mode)
  uploadedHero: UploadedHeroImage | null;

  // Hero sizing and cropping configuration
  heroSizeConfig: HeroSizeConfig;

  // Upload states
  isUploadingHero: boolean;
  heroUploadProgress: number;
  heroUploadError: string | null;
}

// Hero actions
export interface HeroSliceActions {
  // Mode selection
  setHeroMode: (mode: HeroMode) => void;

  // Uploaded hero management
  setUploadedHero: (hero: UploadedHeroImage | null) => void;
  clearUploadedHero: () => void;

  // Size configuration
  setHeroSizeConfig: (config: Partial<HeroSizeConfig>) => void;
  setHeroSizeMode: (mode: HeroSizeMode) => void;
  setHeroZoom: (zoom: number) => void;
  setHeroFocus: (focusX: number, focusY: number) => void;
  setHeroBackgroundFill: (fill: Partial<HeroSizeConfig['backgroundFill']>) => void;
  resetHeroSizeConfig: () => void;

  // Upload states
  setIsUploadingHero: (isUploading: boolean) => void;
  setHeroUploadProgress: (progress: number) => void;
  setHeroUploadError: (error: string | null) => void;
}

export type HeroSlice = HeroSliceState & HeroSliceActions;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_HERO_SIZE_CONFIG: HeroSizeConfig = {
  mode: 'full',
  zoom: 1.0,
  focusX: 50,
  focusY: 50,
  backgroundFill: {
    type: 'blur',
    blurAmount: 20,
    solidColor: '#000000',
    gradient: {
      type: 'linear',
      colors: ['#1a1a1a', '#000000'],
      angle: 180,
    },
  },
};

const initialHeroState: HeroSliceState = {
  heroMode: 'ai-generated',
  uploadedHero: null,
  heroSizeConfig: DEFAULT_HERO_SIZE_CONFIG,
  isUploadingHero: false,
  heroUploadProgress: 0,
  heroUploadError: null,
};

// ============================================================================
// Slice Creator
// ============================================================================

export const createHeroSlice: StateCreator<HeroSlice> = (set) => ({
  ...initialHeroState,

  // Mode selection
  setHeroMode: (mode: HeroMode) =>
    set({ heroMode: mode, heroUploadError: null }),

  // Uploaded hero management
  setUploadedHero: (hero: UploadedHeroImage | null) =>
    set({
      uploadedHero: hero,
      heroUploadError: null,
      heroUploadProgress: hero ? 100 : 0,
    }),

  clearUploadedHero: () =>
    set({
      uploadedHero: null,
      heroUploadProgress: 0,
      heroUploadError: null,
    }),

  // Size configuration
  setHeroSizeConfig: (config: Partial<HeroSizeConfig>) =>
    set((state) => ({
      heroSizeConfig: {
        ...state.heroSizeConfig,
        ...config,
        // Deep merge backgroundFill if provided
        backgroundFill: config.backgroundFill
          ? { ...state.heroSizeConfig.backgroundFill, ...config.backgroundFill }
          : state.heroSizeConfig.backgroundFill,
      },
    })),

  setHeroSizeMode: (mode: HeroSizeMode) =>
    set((state) => ({
      heroSizeConfig: { ...state.heroSizeConfig, mode },
    })),

  setHeroZoom: (zoom: number) =>
    set((state) => ({
      heroSizeConfig: {
        ...state.heroSizeConfig,
        zoom: Math.max(0.5, Math.min(3.0, zoom)), // Clamp between 0.5 and 3.0
      },
    })),

  setHeroFocus: (focusX: number, focusY: number) =>
    set((state) => ({
      heroSizeConfig: {
        ...state.heroSizeConfig,
        focusX: Math.max(0, Math.min(100, focusX)),
        focusY: Math.max(0, Math.min(100, focusY)),
      },
    })),

  setHeroBackgroundFill: (fill: Partial<HeroSizeConfig['backgroundFill']>) =>
    set((state) => ({
      heroSizeConfig: {
        ...state.heroSizeConfig,
        backgroundFill: {
          ...state.heroSizeConfig.backgroundFill,
          ...fill,
        },
      },
    })),

  resetHeroSizeConfig: () =>
    set({ heroSizeConfig: DEFAULT_HERO_SIZE_CONFIG }),

  // Upload states
  setIsUploadingHero: (isUploading: boolean) =>
    set({ isUploadingHero: isUploading }),

  setHeroUploadProgress: (progress: number) =>
    set({ heroUploadProgress: Math.max(0, Math.min(100, progress)) }),

  setHeroUploadError: (error: string | null) =>
    set({ heroUploadError: error }),
});

// ============================================================================
// Hero Size Presets (for UI display)
// ============================================================================

export interface HeroSizePreset {
  id: HeroSizeMode;
  name: string;
  description: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const HERO_SIZE_PRESETS: Record<HeroSizeMode, HeroSizePreset> = {
  'full': {
    id: 'full',
    name: 'Full Canvas',
    description: 'Hero covers entire canvas',
    bounds: { x: 0, y: 0, width: 1080, height: 1920 },
  },
  'half-top': {
    id: 'half-top',
    name: 'Top Half',
    description: 'Hero in top 50% of canvas',
    bounds: { x: 0, y: 0, width: 1080, height: 960 },
  },
  'half-bottom': {
    id: 'half-bottom',
    name: 'Bottom Half',
    description: 'Hero in bottom 50% of canvas',
    bounds: { x: 0, y: 960, width: 1080, height: 960 },
  },
  'half-left': {
    id: 'half-left',
    name: 'Left Half',
    description: 'Hero in left 50% of canvas',
    bounds: { x: 0, y: 0, width: 540, height: 1920 },
  },
  'half-right': {
    id: 'half-right',
    name: 'Right Half',
    description: 'Hero in right 50% of canvas',
    bounds: { x: 540, y: 0, width: 540, height: 1920 },
  },
  'custom': {
    id: 'custom',
    name: 'Custom Size',
    description: 'Define custom position and size',
    bounds: { x: 0, y: 0, width: 1080, height: 1920 },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates if an image meets the minimum dimension requirements for hero upload
 */
export function validateHeroImageDimensions(
  width: number,
  height: number,
  minDimension: number = 500
): { valid: boolean; message?: string } {
  if (width < minDimension || height < minDimension) {
    return {
      valid: false,
      message: `Image must be at least ${minDimension}x${minDimension} pixels. Your image is ${width}x${height}.`,
    };
  }
  return { valid: true };
}

/**
 * Calculate the cropped region based on zoom and focus settings
 */
export function calculateCropRegion(
  imageWidth: number,
  imageHeight: number,
  zoom: number,
  focusX: number,
  focusY: number,
  targetWidth: number,
  targetHeight: number
): { x: number; y: number; width: number; height: number } {
  // Calculate the visible area based on zoom
  const visibleWidth = targetWidth / zoom;
  const visibleHeight = targetHeight / zoom;

  // Calculate the crop position based on focus point
  const maxOffsetX = Math.max(0, imageWidth - visibleWidth);
  const maxOffsetY = Math.max(0, imageHeight - visibleHeight);

  const cropX = (focusX / 100) * maxOffsetX;
  const cropY = (focusY / 100) * maxOffsetY;

  return {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(Math.min(visibleWidth, imageWidth)),
    height: Math.round(Math.min(visibleHeight, imageHeight)),
  };
}
