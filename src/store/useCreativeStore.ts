import { create } from 'zustand';
import type { CreativeStore, Step, CalloutType } from '@/types';

const initialState = {
  currentStep: 1 as Step,
  productImage: null,
  productImageFile: null,
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
      currentStep: Math.min(state.currentStep + 1, 5) as Step,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1) as Step,
    })),

  goToStep: (step: Step) =>
    set({ currentStep: step }),

  reset: () => set(initialState),
}));
