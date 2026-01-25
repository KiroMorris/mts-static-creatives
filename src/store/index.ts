// Store exports
// Central export point for all Zustand stores

// Main creative store
export { useCreativeStore } from './useCreativeStore';

// Preset store for workflow saving
export { usePresetStore } from './usePresetStore';

// Hero store for V2 hero upload/configuration
export {
  useHeroStore,
  useHeroMode,
  useUploadedHero,
  useHeroSizeConfig,
  useHeroUploadState,
  useHeroActions,
} from './useHeroStore';

// Hero slice types and utilities
export {
  DEFAULT_HERO_SIZE_CONFIG,
  HERO_SIZE_PRESETS,
  validateHeroImageDimensions,
  calculateCropRegion,
} from './heroSlice';

export type {
  HeroSlice,
  HeroSizeConfig,
  HeroMode,
  UploadedHeroImage,
  HeroSizeMode,
  BackgroundFillType,
  GradientConfig,
} from './heroSlice';

// Elements store for V2 canvas elements
export { useElementsStore } from './useElementsStore';
export type { ElementsStore } from './useElementsStore';

// Elements slice types
export type { ElementsSlice, ElementsState, ElementsActions } from './elementsSlice';

// Brand slice types
export type { BrandSlice, BrandState, BrandActions } from './brandSlice';
export { DEFAULT_BRAND } from './brandSlice';
