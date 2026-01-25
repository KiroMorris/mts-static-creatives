import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  createHeroSlice,
  DEFAULT_HERO_SIZE_CONFIG,
  type HeroSlice,
  type HeroSizeConfig,
  type HeroMode,
} from './heroSlice';

// ============================================================================
// Persistence Types
// ============================================================================

interface PersistedHeroState {
  heroMode: HeroMode;
  heroSizeConfig: HeroSizeConfig;
}

// ============================================================================
// Store Creation
// ============================================================================

export const useHeroStore = create<HeroSlice>()(
  persist(
    (set, get, api) => createHeroSlice(set, get, api),
    {
      name: 'acg-hero-settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),

      // Only persist mode and size config (not uploaded images or loading states)
      partialize: (state): PersistedHeroState => ({
        heroMode: state.heroMode,
        heroSizeConfig: state.heroSizeConfig,
      }),

      // Custom merge function to restore state with defaults
      merge: (persisted, current) => {
        try {
          const persistedState = persisted as PersistedHeroState | undefined;

          if (!persistedState) {
            return current;
          }

          return {
            ...current,
            heroMode: persistedState.heroMode || 'ai-generated',
            heroSizeConfig: {
              ...DEFAULT_HERO_SIZE_CONFIG,
              ...persistedState.heroSizeConfig,
              // Ensure backgroundFill is properly merged
              backgroundFill: {
                ...DEFAULT_HERO_SIZE_CONFIG.backgroundFill,
                ...persistedState.heroSizeConfig?.backgroundFill,
              },
            },
          };
        } catch (error) {
          console.warn('Failed to restore hero settings, using defaults:', error);
          return current;
        }
      },
    }
  )
);

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

/**
 * Select just the hero mode
 */
export const useHeroMode = () => useHeroStore((state) => state.heroMode);

/**
 * Select the uploaded hero image
 */
export const useUploadedHero = () => useHeroStore((state) => state.uploadedHero);

/**
 * Select the hero size configuration
 */
export const useHeroSizeConfig = () => useHeroStore((state) => state.heroSizeConfig);

/**
 * Select upload states
 */
export const useHeroUploadState = () =>
  useHeroStore((state) => ({
    isUploading: state.isUploadingHero,
    progress: state.heroUploadProgress,
    error: state.heroUploadError,
  }));

/**
 * Select all hero actions (stable reference)
 */
export const useHeroActions = () =>
  useHeroStore((state) => ({
    setHeroMode: state.setHeroMode,
    setUploadedHero: state.setUploadedHero,
    clearUploadedHero: state.clearUploadedHero,
    setHeroSizeConfig: state.setHeroSizeConfig,
    setHeroSizeMode: state.setHeroSizeMode,
    setHeroZoom: state.setHeroZoom,
    setHeroFocus: state.setHeroFocus,
    setHeroBackgroundFill: state.setHeroBackgroundFill,
    resetHeroSizeConfig: state.resetHeroSizeConfig,
    setIsUploadingHero: state.setIsUploadingHero,
    setHeroUploadProgress: state.setHeroUploadProgress,
    setHeroUploadError: state.setHeroUploadError,
  }));

// Export types
export type {
  HeroSlice,
  HeroSizeConfig,
  HeroMode,
  UploadedHeroImage,
  HeroSizeMode,
  BackgroundFillType,
  GradientConfig,
} from './heroSlice';

export { DEFAULT_HERO_SIZE_CONFIG, HERO_SIZE_PRESETS, validateHeroImageDimensions, calculateCropRegion } from './heroSlice';
