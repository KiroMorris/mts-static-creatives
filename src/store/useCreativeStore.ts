import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  CreativeStore,
  Step,
  CalloutType,
  CalloutPrompt,
  StyleSettings,
  ModelSceneStyle,
  HeroStyle,
  TextStyle,
  CalloutStyle,
} from '@/types';
import { DEFAULT_STYLE_SETTINGS } from '@/types';
import {
  DEFAULT_CALLOUT_PROMPTS,
  DEFAULT_SELECTED_CALLOUTS,
  generateCalloutPromptId,
} from '@/lib/defaultCalloutPrompts';
import type { CanvasElement } from '@/types/elements';
import type { ElementsState, ElementsActions } from './elementsSlice';
import type { BrandState, BrandActions } from './brandSlice';
import { DEFAULT_BRAND } from './brandSlice';

// ============================================================================
// Canvas Slice imports for V2 Canvas & Layout System
// ============================================================================
import {
  createCanvasSlice,
  type CanvasSlice,
  type CanvasSliceState,
  type CanvasSliceActions,
  selectCanvasDimensions,
  selectSelectedElement,
  selectVisibleElementsSorted,
  selectCanUndo,
  selectCanRedo,
} from './canvasSlice';
import type {
  AspectRatioId,
  CanvasBackground,
  AnyCanvasElement,
  SnapConfig,
  CanvasViewport,
} from '@/types/canvas';
import {
  DEFAULT_BACKGROUND,
  DEFAULT_SNAP_CONFIG,
  DEFAULT_VIEWPORT,
} from '@/types/canvas';

// Re-export canvas slice selectors for use in components
export {
  selectCanvasDimensions,
  selectSelectedElement,
  selectVisibleElementsSorted,
  selectCanUndo,
  selectCanRedo,
};

// Re-export canvas types for convenience
export type {
  CanvasSlice,
  CanvasSliceState,
  CanvasSliceActions,
};

// ============================================================================
// Persistence Types & Utilities
// ============================================================================

// Type for persisted state (only the fields we save to localStorage)
interface PersistedState {
  styleSettings: StyleSettings;
  selectedCallouts: [string, string, string];
  calloutOrder: [CalloutType, CalloutType, CalloutType];
  customCalloutPrompts: CalloutPrompt[];
  headline: string;
  subtitle: string;
  // V2: Elements & Brand
  elements: CanvasElement[];
  brand: BrandState;
  // V2: Canvas state (partial - only user settings, not history)
  canvasAspectRatio: AspectRatioId;
  canvasBackground: CanvasBackground;
  snapConfig: SnapConfig;
}

// ============================================================================
// Combined Store Type (includes V2 slices)
// ============================================================================

export type CombinedStore = CreativeStore & ElementsState & ElementsActions & BrandState & BrandActions & CanvasSlice;

/**
 * Deep merge utility for style settings.
 * Ensures all nested objects are properly merged with defaults.
 */
function deepMergeStyleSettings(
  defaults: StyleSettings,
  persisted?: Partial<StyleSettings>
): StyleSettings {
  if (!persisted) return defaults;

  return {
    modelScene: { ...defaults.modelScene, ...persisted.modelScene },
    hero: { ...defaults.hero, ...persisted.hero },
    text: { ...defaults.text, ...persisted.text },
    callout: {
      ...defaults.callout,
      ...persisted.callout,
      // Ensure nested zoom settings are merged
      detail: { ...defaults.callout.detail, ...persisted.callout?.detail },
      fit: { ...defaults.callout.fit, ...persisted.callout?.fit },
      pose: { ...defaults.callout.pose, ...persisted.callout?.pose },
    },
  };
}

// DEV MODE: Set to true to skip generation steps with test images
const DEV_MODE = false;

const devState = {
  currentStep: 6 as Step, // Start at Layout step
  productImage: '/uploads/hero_img_1767161180139_nzh0nuv.jpeg',
  productImageFile: null,
  styleSettings: DEFAULT_STYLE_SETTINGS,
  heroImage: '/uploads/hero_img_1767161180139_nzh0nuv.jpeg',
  heroPrompt: 'Test prompt',
  calloutImages: {
    detail: '/uploads/callout_detail_img_1767161207447_geeg1ud.jpeg',
    fit: '/uploads/callout_fit_img_1767161231556_wlulalx.jpeg',
    pose: '/uploads/callout_pose_img_1767161254540_o3myhsy.jpeg',
  },
  // Hero prompt control
  heroGeneratedPrompt: '',
  heroCustomPrompt: '',
  useCustomHeroPrompt: false,
  // Callout prompts management
  calloutPrompts: DEFAULT_CALLOUT_PROMPTS,
  selectedCallouts: DEFAULT_SELECTED_CALLOUTS as [string, string, string],
  calloutOrder: ['detail', 'fit', 'pose'] as [CalloutType, CalloutType, CalloutType],
  headline: 'COZY COMFORT',
  subtitle: 'NEW COLLECTION',
  finalCollage: null,
  isUploading: false,
  isGeneratingHero: false,
  isGeneratingCallouts: false,
  isComposing: false,
  error: null,
  // V2: Elements state
  elements: [] as CanvasElement[],
  selectedElementId: null as string | null,
  clipboard: null as CanvasElement | null,
  // V2: Brand state
  ...DEFAULT_BRAND,
};

const productionState = {
  currentStep: 1 as Step,
  productImage: null,
  productImageFile: null,
  styleSettings: DEFAULT_STYLE_SETTINGS,
  heroImage: null,
  heroPrompt: '',
  calloutImages: {
    detail: null,
    fit: null,
    pose: null,
  },
  // Hero prompt control
  heroGeneratedPrompt: '',
  heroCustomPrompt: '',
  useCustomHeroPrompt: false,
  // Callout prompts management
  calloutPrompts: DEFAULT_CALLOUT_PROMPTS,
  selectedCallouts: DEFAULT_SELECTED_CALLOUTS as [string, string, string],
  calloutOrder: ['detail', 'fit', 'pose'] as [CalloutType, CalloutType, CalloutType],
  headline: '',
  subtitle: '',
  finalCollage: null,
  isUploading: false,
  isGeneratingHero: false,
  isGeneratingCallouts: false,
  isComposing: false,
  error: null,
  // V2: Elements state
  elements: [] as CanvasElement[],
  selectedElementId: null as string | null,
  clipboard: null as CanvasElement | null,
  // V2: Brand state
  ...DEFAULT_BRAND,
};

const initialState = DEV_MODE ? devState : productionState;

// ============================================================================
// Store with Persist Middleware
// ============================================================================

export const useCreativeStore = create<CombinedStore>()(
  persist(
    (set, get, store) => ({
      ...initialState,

      // ========================================================================
      // V2: Canvas Slice (merged using createCanvasSlice)
      // ========================================================================
      ...createCanvasSlice(set, get, store),

      setProductImage: (url: string, file: File) =>
        set({ productImage: url, productImageFile: file, error: null }),

      setStyleSettings: (settings: Partial<StyleSettings>) =>
        set((state) => ({
          styleSettings: { ...state.styleSettings, ...settings },
        })),

      setModelSceneStyle: (style: Partial<ModelSceneStyle>) =>
        set((state) => ({
          styleSettings: {
            ...state.styleSettings,
            modelScene: { ...state.styleSettings.modelScene, ...style },
          },
        })),

      setTextStyle: (style: Partial<TextStyle>) =>
        set((state) => ({
          styleSettings: {
            ...state.styleSettings,
            text: { ...state.styleSettings.text, ...style },
          },
        })),

      setCalloutStyle: (style: Partial<CalloutStyle>) =>
        set((state) => ({
          styleSettings: {
            ...state.styleSettings,
            callout: { ...state.styleSettings.callout, ...style },
          },
        })),

      setHeroStyle: (style: Partial<HeroStyle>) =>
        set((state) => ({
          styleSettings: {
            ...state.styleSettings,
            hero: { ...state.styleSettings.hero, ...style },
          },
        })),

      setHeroImage: (url: string) =>
        set({ heroImage: url, error: null }),

      setCalloutImage: (type: CalloutType, url: string) =>
        set((state) => ({
          calloutImages: { ...state.calloutImages, [type]: url },
          error: null,
        })),

      setText: (headline: string, subtitle: string) =>
        set({ headline, subtitle }),

      setFinalCollage: (url: string) =>
        set({ finalCollage: url, error: null }),

      setLoading: (key, value) =>
        set({ [key]: value }),

      setError: (error: string | null) =>
        set({ error }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 7) as Step,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1) as Step,
        })),

      goToStep: (step: Step) =>
        set({ currentStep: step }),

      reset: () => set(initialState),

      // Hero prompt control actions
      setHeroGeneratedPrompt: (prompt: string) =>
        set({ heroGeneratedPrompt: prompt }),

      setHeroCustomPrompt: (prompt: string) =>
        set({ heroCustomPrompt: prompt }),

      setUseCustomHeroPrompt: (use: boolean) =>
        set({ useCustomHeroPrompt: use }),

      // Callout prompt management actions
      addCalloutPrompt: (prompt: Omit<CalloutPrompt, 'id' | 'createdAt'>) =>
        set((state) => ({
          calloutPrompts: [
            ...state.calloutPrompts,
            {
              ...prompt,
              id: generateCalloutPromptId(),
              createdAt: Date.now(),
            },
          ],
        })),

      updateCalloutPrompt: (id: string, updates: Partial<CalloutPrompt>) =>
        set((state) => ({
          calloutPrompts: state.calloutPrompts.map((prompt) =>
            prompt.id === id ? { ...prompt, ...updates } : prompt
          ),
        })),

      deleteCalloutPrompt: (id: string) =>
        set((state) => {
          // Don't allow deleting built-in prompts
          const promptToDelete = state.calloutPrompts.find((p) => p.id === id);
          if (promptToDelete?.isBuiltIn) {
            return state;
          }

          // Remove the prompt from the list
          const newCalloutPrompts = state.calloutPrompts.filter((p) => p.id !== id);

          // If this prompt was selected in any slot, replace it with the first available prompt
          const firstAvailableId = newCalloutPrompts[0]?.id || '';
          const newSelectedCallouts = state.selectedCallouts.map((selectedId) =>
            selectedId === id ? firstAvailableId : selectedId
          ) as [string, string, string];

          return {
            calloutPrompts: newCalloutPrompts,
            selectedCallouts: newSelectedCallouts,
          };
        }),

      // Callout selection actions
      setSelectedCallout: (slotIndex: 0 | 1 | 2, promptId: string) =>
        set((state) => {
          const newSelectedCallouts = [...state.selectedCallouts] as [string, string, string];
          newSelectedCallouts[slotIndex] = promptId;
          return { selectedCallouts: newSelectedCallouts };
        }),

      setAllSelectedCallouts: (promptIds: [string, string, string]) =>
        set({ selectedCallouts: promptIds }),

      // Callout order actions
      reorderCallouts: (newOrder: [CalloutType, CalloutType, CalloutType]) =>
        set({ calloutOrder: newOrder }),

      // ========================================================================
      // V2: Elements Actions
      // ========================================================================

      // CRUD
      addElement: (element) => {
        const id = nanoid();
        const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));
        const newElement = {
          ...element,
          id,
          zIndex: maxZIndex + 1,
        } as CanvasElement;
        set((state) => ({
          elements: [...state.elements, newElement],
          selectedElementId: id,
        }));
        return id;
      },

      updateElement: (id, updates) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } as CanvasElement : el
          ),
        }));
      },

      deleteElement: (id) => {
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId,
        }));
      },

      duplicateElement: (id) => {
        const element = get().elements.find((el) => el.id === id);
        if (!element) return '';
        const newId = nanoid();
        const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));
        const duplicatedElement = {
          ...element,
          id: newId,
          zIndex: maxZIndex + 1,
          position: {
            x: element.position.x + 20,
            y: element.position.y + 20,
          },
        } as CanvasElement;
        set((state) => ({
          elements: [...state.elements, duplicatedElement],
          selectedElementId: newId,
        }));
        return newId;
      },

      // Selection
      selectElement: (id) => set({ selectedElementId: id }),

      getSelectedOverlayElement: () => {
        const { elements, selectedElementId } = get();
        return elements.find((el) => el.id === selectedElementId) || null;
      },

      // Z-Index Ordering
      bringToFront: (id) => {
        const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
          ),
        }));
      },

      sendToBack: (id) => {
        const minZIndex = Math.min(...get().elements.map((e) => e.zIndex));
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
          ),
        }));
      },

      moveUp: (id) => {
        const elements = get().elements;
        const element = elements.find((el) => el.id === id);
        if (!element) return;
        const above = elements
          .filter((el) => el.zIndex > element.zIndex)
          .sort((a, b) => a.zIndex - b.zIndex)[0];
        if (above) {
          set((state) => ({
            elements: state.elements.map((el) => {
              if (el.id === id) return { ...el, zIndex: above.zIndex };
              if (el.id === above.id) return { ...el, zIndex: element.zIndex };
              return el;
            }),
          }));
        }
      },

      moveDown: (id) => {
        const elements = get().elements;
        const element = elements.find((el) => el.id === id);
        if (!element) return;
        const below = elements
          .filter((el) => el.zIndex < element.zIndex)
          .sort((a, b) => b.zIndex - a.zIndex)[0];
        if (below) {
          set((state) => ({
            elements: state.elements.map((el) => {
              if (el.id === id) return { ...el, zIndex: below.zIndex };
              if (el.id === below.id) return { ...el, zIndex: element.zIndex };
              return el;
            }),
          }));
        }
      },

      // Clipboard
      copyElement: (id) => {
        const element = get().elements.find((el) => el.id === id);
        if (element) {
          set({ clipboard: { ...element } });
        }
      },

      pasteElement: () => {
        const clipboard = get().clipboard;
        if (!clipboard) return null;
        const { id, ...elementWithoutId } = clipboard;
        return get().addElement({
          ...elementWithoutId,
          position: {
            x: clipboard.position.x + 20,
            y: clipboard.position.y + 20,
          },
        });
      },

      // Toggle & Lock
      toggleElement: (id) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, enabled: !el.enabled } : el
          ),
        }));
      },

      lockElement: (id) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, locked: true } : el
          ),
        }));
      },

      unlockElement: (id) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, locked: false } : el
          ),
        }));
      },

      toggleLockElement: (id) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, locked: !el.locked } : el
          ),
        }));
      },

      // Bulk Operations
      clearElements: () => set({ elements: [], selectedElementId: null }),

      setElements: (elements) => set({ elements, selectedElementId: null }),

      getSortedElements: () => {
        return [...get().elements]
          .filter((el) => el.enabled)
          .sort((a, b) => a.zIndex - b.zIndex);
      },

      // ========================================================================
      // V2: Brand Actions
      // ========================================================================

      setLogo: (url) => set({ logo: url }),

      setPrimaryColor: (color) => set({ primaryColor: color }),

      setSecondaryColor: (color) => set({ secondaryColor: color }),

      setAccentColor: (color) => set({ accentColor: color }),

      setColors: (colors) =>
        set((state) => ({
          ...(colors.primary && { primaryColor: colors.primary }),
          ...(colors.secondary && { secondaryColor: colors.secondary }),
          ...(colors.accent && { accentColor: colors.accent }),
        })),

      setFontPrimary: (font) => set({ fontPrimary: font }),

      setFontSecondary: (font) => set({ fontSecondary: font }),

      setFonts: (fonts) =>
        set((state) => ({
          ...(fonts.primary && { fontPrimary: fonts.primary }),
          ...(fonts.secondary && { fontSecondary: fonts.secondary }),
        })),

      setBrandAssets: (assets) => set((state) => ({ ...state, ...assets })),

      resetBrandAssets: () => set(DEFAULT_BRAND),
    }),
    {
      name: 'acg-settings',
      version: 2, // Bumped version for canvas slice addition
      storage: createJSONStorage(() => localStorage),

      // Only persist specific fields (exclude generated content, loading states, etc.)
      partialize: (state): PersistedState => ({
        // Style settings (all of them)
        styleSettings: state.styleSettings,

        // Callout selections
        selectedCallouts: state.selectedCallouts,

        // Callout display order
        calloutOrder: state.calloutOrder,

        // Custom callout prompts only (filter out built-in)
        customCalloutPrompts: state.calloutPrompts.filter((p) => !p.isBuiltIn),

        // Text content
        headline: state.headline,
        subtitle: state.subtitle,

        // V2: Elements (persist all elements for template saving)
        elements: state.elements,

        // V2: Brand assets
        brand: {
          logo: state.logo,
          primaryColor: state.primaryColor,
          secondaryColor: state.secondaryColor,
          accentColor: state.accentColor,
          fontPrimary: state.fontPrimary,
          fontSecondary: state.fontSecondary,
        },

        // V2: Canvas state (from new canvas slice)
        canvasAspectRatio: state.canvasAspectRatio,
        canvasBackground: state.canvasBackground,
        snapConfig: state.snapConfig,
      }),

      // Custom merge function to restore state with defaults
      merge: (persisted, current) => {
        try {
          const persistedState = persisted as PersistedState | undefined;

          if (!persistedState) {
            return current;
          }

          // Merge custom callout prompts with built-in prompts
          const customPrompts = persistedState.customCalloutPrompts || [];
          const mergedCalloutPrompts: CalloutPrompt[] = [
            ...DEFAULT_CALLOUT_PROMPTS,
            ...customPrompts,
          ];

          // Validate selectedCallouts - ensure all referenced prompts exist
          const validPromptIds = new Set(mergedCalloutPrompts.map((p) => p.id));
          const validatedCallouts = (persistedState.selectedCallouts || DEFAULT_SELECTED_CALLOUTS).map(
            (id, index) => {
              if (validPromptIds.has(id)) {
                return id;
              }
              // Fall back to default for this slot if the referenced prompt doesn't exist
              return DEFAULT_SELECTED_CALLOUTS[index] || DEFAULT_CALLOUT_PROMPTS[0]?.id || '';
            }
          ) as [string, string, string];

          // Merge brand assets with defaults
          const mergedBrand = {
            ...DEFAULT_BRAND,
            ...persistedState.brand,
          };

          return {
            ...current,
            // Deep merge style settings with defaults
            styleSettings: deepMergeStyleSettings(
              DEFAULT_STYLE_SETTINGS,
              persistedState.styleSettings
            ),
            // Validated callout selections
            selectedCallouts: validatedCallouts,
            // Callout display order with fallback
            calloutOrder: persistedState.calloutOrder || ['detail', 'fit', 'pose'],
            // Merged callout prompts (built-in from code + custom from storage)
            calloutPrompts: mergedCalloutPrompts,
            // Text content with fallback to empty string
            headline: persistedState.headline ?? '',
            subtitle: persistedState.subtitle ?? '',
            // V2: Restore elements (empty array if none persisted)
            elements: persistedState.elements || [],
            // V2: Restore brand assets (spread into top-level state)
            logo: mergedBrand.logo,
            primaryColor: mergedBrand.primaryColor,
            secondaryColor: mergedBrand.secondaryColor,
            accentColor: mergedBrand.accentColor,
            fontPrimary: mergedBrand.fontPrimary,
            fontSecondary: mergedBrand.fontSecondary,
            // V2: Canvas state with defaults
            canvasAspectRatio: persistedState.canvasAspectRatio || '9:16',
            canvasBackground: persistedState.canvasBackground || DEFAULT_BACKGROUND,
            snapConfig: persistedState.snapConfig
              ? { ...DEFAULT_SNAP_CONFIG, ...persistedState.snapConfig }
              : DEFAULT_SNAP_CONFIG,
          };
        } catch (error) {
          console.warn('Failed to restore settings, using defaults:', error);
          return current;
        }
      },
    }
  )
);
