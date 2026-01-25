// Brand Assets Zustand Slice (V2)
// Manages brand identity: logo, colors, fonts

import { StateCreator } from 'zustand';

// ============================================================================
// State Interface
// ============================================================================

export interface BrandState {
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
}

// ============================================================================
// Actions Interface
// ============================================================================

export interface BrandActions {
  // Logo
  setLogo: (url: string | null) => void;

  // Colors
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setColors: (colors: { primary?: string; secondary?: string; accent?: string }) => void;

  // Fonts
  setFontPrimary: (font: string) => void;
  setFontSecondary: (font: string) => void;
  setFonts: (fonts: { primary?: string; secondary?: string }) => void;

  // Bulk
  setBrandAssets: (assets: Partial<BrandState>) => void;
  resetBrandAssets: () => void;
}

// ============================================================================
// Slice Type
// ============================================================================

export type BrandSlice = BrandState & BrandActions;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_BRAND: BrandState = {
  logo: null,
  primaryColor: '#8b5cf6',   // Violet
  secondaryColor: '#ec4899', // Pink
  accentColor: '#06b6d4',    // Cyan
  fontPrimary: 'Inter',
  fontSecondary: 'Inter',
};

// ============================================================================
// Create Slice
// ============================================================================

export const createBrandSlice: StateCreator<
  BrandSlice,
  [],
  [],
  BrandSlice
> = (set) => ({
  ...DEFAULT_BRAND,

  // -------------------------------------------------------------------------
  // Logo
  // -------------------------------------------------------------------------

  setLogo: (url) => set({ logo: url }),

  // -------------------------------------------------------------------------
  // Colors
  // -------------------------------------------------------------------------

  setPrimaryColor: (color) => set({ primaryColor: color }),

  setSecondaryColor: (color) => set({ secondaryColor: color }),

  setAccentColor: (color) => set({ accentColor: color }),

  setColors: (colors) =>
    set((state) => ({
      ...(colors.primary && { primaryColor: colors.primary }),
      ...(colors.secondary && { secondaryColor: colors.secondary }),
      ...(colors.accent && { accentColor: colors.accent }),
    })),

  // -------------------------------------------------------------------------
  // Fonts
  // -------------------------------------------------------------------------

  setFontPrimary: (font) => set({ fontPrimary: font }),

  setFontSecondary: (font) => set({ fontSecondary: font }),

  setFonts: (fonts) =>
    set((state) => ({
      ...(fonts.primary && { fontPrimary: fonts.primary }),
      ...(fonts.secondary && { fontSecondary: fonts.secondary }),
    })),

  // -------------------------------------------------------------------------
  // Bulk Operations
  // -------------------------------------------------------------------------

  setBrandAssets: (assets) => set((state) => ({ ...state, ...assets })),

  resetBrandAssets: () => set(DEFAULT_BRAND),
});
