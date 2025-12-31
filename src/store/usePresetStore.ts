import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Preset, PresetStore, StyleSettings, CalloutPrompt } from '@/types';
import { DEFAULT_STYLE_SETTINGS } from '@/types';
import { DEFAULT_SELECTED_CALLOUTS } from '@/lib/defaultCalloutPrompts';
import {
  generatePresetId,
  exportPresetToJSON,
  parseImportedFile,
} from '@/lib/presetStorage';
import { useCreativeStore } from './useCreativeStore';

// ============================================================================
// Default System Presets
// ============================================================================

const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'system-clean-minimal',
    name: 'Clean & Minimal',
    description: 'Studio setting with soft lighting and minimal text styling',
    createdAt: 0,
    updatedAt: 0,
    styleSettings: {
      modelScene: {
        modelGender: 'female',
        modelAge: 'young',
        modelEthnicity: 'any',
        pose: 'relaxed',
        setting: 'studio',
        mood: 'professional',
        lighting: 'soft',
        selectedHeroTemplate: null,
        customPromptAddition: '',
        copySpace: 'left',
      },
      hero: {
        zoom: 1.0,
        focusX: 50,
        focusY: 50,
      },
      text: {
        headlineFontSize: 64,
        headlineColor: '#FFFFFF',
        headlineShadow: false,
        headlineX: 48,
        headlineY: 820,
        headlineFontFamily: 'Inter',
        headlineFontWeight: 500,
        subtitleFontSize: 16,
        subtitleColor: 'rgba(255, 255, 255, 0.85)',
        subtitleLetterSpacing: 4,
        subtitleGap: 16,
        subtitleFontFamily: 'Inter',
        subtitleFontWeight: 400,
      },
      callout: {
        ...DEFAULT_STYLE_SETTINGS.callout,
        borderWidth: 2,
        borderRadius: 4,
      },
    },
    selectedCallouts: DEFAULT_SELECTED_CALLOUTS,
    customCalloutPrompts: [],
    includeText: true,
    headline: 'EFFORTLESS STYLE',
    subtitle: 'NEW ARRIVALS',
    tags: ['minimal', 'clean', 'studio'],
    isDefault: true,
  },
  {
    id: 'system-urban-street',
    name: 'Urban Street',
    description: 'Urban setting with dramatic lighting and bold text',
    createdAt: 0,
    updatedAt: 0,
    styleSettings: {
      modelScene: {
        modelGender: 'male',
        modelAge: 'young',
        modelEthnicity: 'any',
        pose: 'confident',
        setting: 'urban',
        mood: 'edgy',
        lighting: 'dramatic',
        selectedHeroTemplate: null,
        customPromptAddition: '',
        copySpace: 'right',
      },
      hero: {
        zoom: 1.1,
        focusX: 45,
        focusY: 50,
      },
      text: {
        headlineFontSize: 80,
        headlineColor: '#FFFFFF',
        headlineShadow: true,
        headlineX: 540,
        headlineY: 800,
        headlineFontFamily: 'Bebas Neue',
        headlineFontWeight: 400,
        subtitleFontSize: 18,
        subtitleColor: '#FFFFFF',
        subtitleLetterSpacing: 6,
        subtitleGap: 24,
        subtitleFontFamily: 'Montserrat',
        subtitleFontWeight: 500,
      },
      callout: {
        ...DEFAULT_STYLE_SETTINGS.callout,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        borderRadius: 0,
        x: 780,
      },
    },
    selectedCallouts: ['builtin-dynamic', 'builtin-fit', 'builtin-alternate-pose'] as [string, string, string],
    customCalloutPrompts: [],
    includeText: true,
    headline: 'STREET READY',
    subtitle: 'URBAN COLLECTION',
    tags: ['urban', 'street', 'bold'],
    isDefault: true,
  },
  {
    id: 'system-cozy-lifestyle',
    name: 'Cozy Lifestyle',
    description: 'Home setting with natural lighting and warm vibes',
    createdAt: 0,
    updatedAt: 0,
    styleSettings: {
      modelScene: {
        modelGender: 'female',
        modelAge: 'young',
        modelEthnicity: 'any',
        pose: 'relaxed',
        setting: 'home',
        mood: 'cozy',
        lighting: 'natural',
        selectedHeroTemplate: null,
        customPromptAddition: '',
        copySpace: 'left',
      },
      hero: {
        zoom: 1.0,
        focusX: 50,
        focusY: 45,
      },
      text: {
        headlineFontSize: 72,
        headlineColor: '#FFFFFF',
        headlineShadow: true,
        headlineX: 48,
        headlineY: 820,
        headlineFontFamily: 'Playfair Display',
        headlineFontWeight: 400,
        subtitleFontSize: 18,
        subtitleColor: 'rgba(255, 255, 255, 0.9)',
        subtitleLetterSpacing: 3,
        subtitleGap: 20,
        subtitleFontFamily: 'Lato',
        subtitleFontWeight: 400,
      },
      callout: {
        ...DEFAULT_STYLE_SETTINGS.callout,
        borderWidth: 3,
        borderRadius: 12,
      },
    },
    selectedCallouts: DEFAULT_SELECTED_CALLOUTS,
    customCalloutPrompts: [],
    includeText: true,
    headline: 'COZY COMFORT',
    subtitle: 'LOUNGEWEAR EDIT',
    tags: ['cozy', 'home', 'lifestyle'],
    isDefault: true,
  },
  {
    id: 'system-high-fashion',
    name: 'High Fashion',
    description: 'Elegant poses with dramatic lighting and sophisticated styling',
    createdAt: 0,
    updatedAt: 0,
    styleSettings: {
      modelScene: {
        modelGender: 'female',
        modelAge: 'young',
        modelEthnicity: 'any',
        pose: 'elegant',
        setting: 'minimalist',
        mood: 'elegant',
        lighting: 'dramatic',
        selectedHeroTemplate: null,
        customPromptAddition: '',
        copySpace: 'bottom',
      },
      hero: {
        zoom: 1.2,
        focusX: 50,
        focusY: 40,
      },
      text: {
        headlineFontSize: 56,
        headlineColor: '#FFFFFF',
        headlineShadow: false,
        headlineX: 540,
        headlineY: 1700,
        headlineFontFamily: 'Playfair Display',
        headlineFontWeight: 400,
        subtitleFontSize: 14,
        subtitleColor: 'rgba(255, 255, 255, 0.8)',
        subtitleLetterSpacing: 8,
        subtitleGap: 20,
        subtitleFontFamily: 'Inter',
        subtitleFontWeight: 400,
      },
      callout: {
        ...DEFAULT_STYLE_SETTINGS.callout,
        size: 180,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 0,
        y: 1400,
      },
    },
    selectedCallouts: ['builtin-detail', 'builtin-waist-hem', 'builtin-alternate-pose'] as [string, string, string],
    customCalloutPrompts: [],
    includeText: true,
    headline: 'ELEVATED',
    subtitle: 'LUXURY ESSENTIALS',
    tags: ['fashion', 'elegant', 'luxury'],
    isDefault: true,
  },
  {
    id: 'system-casual-everyday',
    name: 'Casual Everyday',
    description: 'Relaxed outdoor setting with natural, friendly vibes',
    createdAt: 0,
    updatedAt: 0,
    styleSettings: {
      modelScene: {
        modelGender: 'female',
        modelAge: 'young',
        modelEthnicity: 'any',
        pose: 'casual',
        setting: 'outdoor',
        mood: 'casual',
        lighting: 'golden-hour',
        selectedHeroTemplate: null,
        customPromptAddition: '',
        copySpace: 'left',
      },
      hero: {
        zoom: 1.0,
        focusX: 55,
        focusY: 50,
      },
      text: {
        headlineFontSize: 68,
        headlineColor: '#FFFFFF',
        headlineShadow: true,
        headlineX: 48,
        headlineY: 820,
        headlineFontFamily: 'Poppins',
        headlineFontWeight: 700,
        subtitleFontSize: 18,
        subtitleColor: 'rgba(255, 255, 255, 0.95)',
        subtitleLetterSpacing: 2,
        subtitleGap: 16,
        subtitleFontFamily: 'Poppins',
        subtitleFontWeight: 400,
      },
      callout: {
        ...DEFAULT_STYLE_SETTINGS.callout,
        borderWidth: 3,
        borderRadius: 16,
      },
    },
    selectedCallouts: DEFAULT_SELECTED_CALLOUTS,
    customCalloutPrompts: [],
    includeText: true,
    headline: 'EVERYDAY EASE',
    subtitle: 'CASUAL COLLECTION',
    tags: ['casual', 'outdoor', 'everyday'],
    isDefault: true,
  },
];

// ============================================================================
// Preset Store
// ============================================================================

export const usePresetStore = create<PresetStore>()(
  persist(
    (set, get) => ({
      // State
      presets: DEFAULT_PRESETS,
      activePresetId: null,
      isLoading: false,
      error: null,

      // Actions
      loadPresets: () => {
        // Ensure default presets are always present
        const { presets } = get();
        const defaultIds = DEFAULT_PRESETS.map(p => p.id);
        const missingDefaults = DEFAULT_PRESETS.filter(
          dp => !presets.find(p => p.id === dp.id)
        );

        if (missingDefaults.length > 0) {
          set({
            presets: [...missingDefaults, ...presets.filter(p => !defaultIds.includes(p.id))],
          });
        }
      },

      savePreset: (name: string, description?: string, includeText?: boolean) => {
        const creativeStore = useCreativeStore.getState();

        const newPreset: Preset = {
          id: generatePresetId(),
          name: name.trim(),
          description: description?.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          styleSettings: { ...creativeStore.styleSettings },
          selectedCallouts: [...creativeStore.selectedCallouts] as [string, string, string],
          customCalloutPrompts: creativeStore.calloutPrompts.filter(p => !p.isBuiltIn),
          includeText: includeText ?? false,
          headline: includeText ? creativeStore.headline : undefined,
          subtitle: includeText ? creativeStore.subtitle : undefined,
          tags: [],
          isDefault: false,
        };

        set((state) => ({
          presets: [...state.presets, newPreset],
          activePresetId: newPreset.id,
        }));

        return newPreset;
      },

      updatePreset: (id: string, updates: Partial<Preset>) => {
        set((state) => ({
          presets: state.presets.map((preset) =>
            preset.id === id && !preset.isDefault
              ? { ...preset, ...updates, updatedAt: Date.now() }
              : preset
          ),
        }));
      },

      deletePreset: (id: string) => {
        const preset = get().presets.find(p => p.id === id);
        if (preset?.isDefault) {
          return; // Cannot delete system presets
        }

        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
          activePresetId: state.activePresetId === id ? null : state.activePresetId,
        }));
      },

      duplicatePreset: (id: string, newName: string) => {
        const preset = get().presets.find(p => p.id === id);
        if (!preset) {
          throw new Error('Preset not found');
        }

        const duplicatedPreset: Preset = {
          ...preset,
          id: generatePresetId(),
          name: newName.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isDefault: false, // Duplicates are never system presets
        };

        set((state) => ({
          presets: [...state.presets, duplicatedPreset],
        }));

        return duplicatedPreset;
      },

      applyPreset: (id: string) => {
        const preset = get().presets.find(p => p.id === id);
        if (!preset) {
          return;
        }

        const creativeStore = useCreativeStore.getState();

        // Apply style settings
        creativeStore.setStyleSettings(preset.styleSettings);

        // Apply callout selections
        creativeStore.setAllSelectedCallouts(preset.selectedCallouts);

        // Add any custom callout prompts from the preset that don't exist
        const existingPromptIds = creativeStore.calloutPrompts.map(p => p.id);
        for (const customPrompt of preset.customCalloutPrompts) {
          if (!existingPromptIds.includes(customPrompt.id)) {
            creativeStore.addCalloutPrompt({
              name: customPrompt.name,
              promptText: customPrompt.promptText,
              isBuiltIn: false,
            });
          }
        }

        // Apply text if included
        if (preset.includeText && preset.headline !== undefined && preset.subtitle !== undefined) {
          creativeStore.setText(preset.headline, preset.subtitle);
        }

        set({ activePresetId: id });
      },

      exportPreset: (id: string) => {
        const preset = get().presets.find(p => p.id === id);
        if (preset) {
          exportPresetToJSON(preset);
        }
      },

      importPresets: async (file: File) => {
        set({ isLoading: true, error: null });

        try {
          const { presets: importedPresets, errors } = await parseImportedFile(file);

          if (errors.length > 0 && importedPresets.length === 0) {
            set({ error: errors[0], isLoading: false });
            return 0;
          }

          if (importedPresets.length > 0) {
            set((state) => ({
              presets: [...state.presets, ...importedPresets],
              isLoading: false,
              error: errors.length > 0 ? `Imported ${importedPresets.length} preset(s) with some errors` : null,
            }));
          } else {
            set({ isLoading: false });
          }

          return importedPresets.length;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to import presets',
            isLoading: false,
          });
          return 0;
        }
      },

      setActivePresetId: (id: string | null) => {
        set({ activePresetId: id });
      },
    }),
    {
      name: 'acg-presets',
      version: 1,
      partialize: (state) => ({
        presets: state.presets,
        activePresetId: state.activePresetId,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<PresetStore> | undefined;
        return {
          ...current,
          presets: persistedState?.presets ?? current.presets,
          activePresetId: persistedState?.activePresetId ?? current.activePresetId,
        };
      },
    }
  )
);
