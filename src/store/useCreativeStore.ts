import { create } from 'zustand';
import type {
  CreativeStore,
  Step,
  CalloutType,
  StyleSettings,
  ModelSceneStyle,
  TextStyle,
  CalloutStyle,
} from '@/types';
import { DEFAULT_STYLE_SETTINGS } from '@/types';

const initialState = {
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
  headline: '',
  subtitle: '',
  finalCollage: null,
  isUploading: false,
  isGeneratingHero: false,
  isGeneratingCallouts: false,
  isComposing: false,
  error: null,
};

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
      currentStep: Math.min(state.currentStep + 1, 6) as Step,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1) as Step,
    })),

  goToStep: (step: Step) =>
    set({ currentStep: step }),

  reset: () => set(initialState),
}));
