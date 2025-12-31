import { create } from 'zustand';
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

export const useCreativeStore = create<CreativeStore>((set) => ({
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
}));
