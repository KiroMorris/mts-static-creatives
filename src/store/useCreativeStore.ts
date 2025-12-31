import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
}

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
};

const initialState = DEV_MODE ? devState : productionState;

// ============================================================================
// Store with Persist Middleware
// ============================================================================

export const useCreativeStore = create<CreativeStore>()(
  persist(
    (set) => ({
      ...initialState,

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
    }),
    {
      name: 'acg-settings',
      version: 1,
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
          };
        } catch (error) {
          console.warn('Failed to restore settings, using defaults:', error);
          return current;
        }
      },
    }
  )
);
