import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Template,
  TemplateStore,
  TemplateCategory,
  TemplateConfig,
} from '@/types/templates';
import { CURRENT_TEMPLATE_VERSION } from '@/types/templates';
import { serializeCreativeToTemplate, deserializeTemplateToCreative } from '@/lib/template-serialization';
import { useCreativeStore } from './useCreativeStore';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'acg-templates';
const MAX_TEMPLATES = 100;

// ============================================================================
// Default Preset Templates
// ============================================================================

// Note: These are minimal presets. Full preset templates would include
// complete configurations from actual creative designs.
const DEFAULT_PRESET_TEMPLATES: Template[] = [
  // Preset templates will be added here as the feature matures
  // For now, we start with an empty preset list and let users create their own
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// Templates Store
// ============================================================================

export const useTemplatesStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // State
      // ========================================================================
      templates: DEFAULT_PRESET_TEMPLATES,
      activeTemplateId: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      categoryFilter: 'all',

      // ========================================================================
      // Actions
      // ========================================================================

      loadTemplates: async () => {
        set({ isLoading: true, error: null });

        try {
          // Templates are loaded automatically via persist middleware
          // This method can be used to trigger a refresh or merge with presets
          const { templates } = get();

          // Ensure preset templates are always present
          const presetIds = DEFAULT_PRESET_TEMPLATES.map((p) => p.id);
          const missingPresets = DEFAULT_PRESET_TEMPLATES.filter(
            (preset) => !templates.find((t) => t.id === preset.id)
          );

          if (missingPresets.length > 0) {
            set({
              templates: [
                ...missingPresets,
                ...templates.filter((t) => !presetIds.includes(t.id)),
              ],
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load templates',
            isLoading: false,
          });
        }
      },

      saveTemplate: async (name, options = {}) => {
        const {
          description,
          category = 'custom',
          tags = [],
          includeTextContent = false,
          thumbnail,
        } = options;

        const { templates } = get();

        // Check max limit
        if (templates.filter((t) => !t.isPreset).length >= MAX_TEMPLATES) {
          throw new Error(`Maximum ${MAX_TEMPLATES} custom templates allowed. Please delete some templates.`);
        }

        const creativeStore = useCreativeStore.getState();
        const now = getCurrentTimestamp();

        // Serialize current creative state to template config
        const config = serializeCreativeToTemplate(creativeStore, { includeTextContent });

        const newTemplate: Template = {
          id: generateTemplateId(),
          version: '1.0.0',
          name: name.trim(),
          description: description?.trim(),
          category,
          tags,
          createdAt: now,
          updatedAt: now,
          thumbnail,
          isPreset: false,
          isCustom: true,
          config,
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
          activeTemplateId: newTemplate.id,
        }));

        return newTemplate;
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== id) return template;
            // Don't allow updating preset templates
            if (template.isPreset) return template;

            return {
              ...template,
              ...updates,
              // Don't allow changing these fields
              id: template.id,
              isPreset: template.isPreset,
              createdAt: template.createdAt,
              // Always update the timestamp
              updatedAt: getCurrentTimestamp(),
            };
          }),
        }));
      },

      deleteTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);

        // Don't allow deleting preset templates
        if (template?.isPreset) {
          return;
        }

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          activeTemplateId: state.activeTemplateId === id ? null : state.activeTemplateId,
        }));
      },

      duplicateTemplate: (id, newName) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          throw new Error('Template not found');
        }

        const now = getCurrentTimestamp();

        const duplicatedTemplate: Template = {
          ...template,
          id: generateTemplateId(),
          name: newName.trim(),
          createdAt: now,
          updatedAt: now,
          isPreset: false,
          isCustom: true,
          basedOn: template.id,
        };

        set((state) => ({
          templates: [...state.templates, duplicatedTemplate],
        }));

        return duplicatedTemplate;
      },

      applyTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          return;
        }

        const creativeStore = useCreativeStore.getState();

        // Deserialize template config back to creative store
        deserializeTemplateToCreative(template.config, creativeStore);

        set({ activeTemplateId: id });
      },

      exportTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) {
          return;
        }

        const exportData = {
          version: '1.0',
          exportedAt: getCurrentTimestamp(),
          templates: [template],
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      importTemplates: async (file) => {
        set({ isLoading: true, error: null });

        try {
          const text = await file.text();
          let data: unknown;

          try {
            data = JSON.parse(text);
          } catch {
            set({ error: 'Invalid JSON file', isLoading: false });
            return 0;
          }

          const importedTemplates: Template[] = [];
          const errors: string[] = [];

          // Handle both single template and multi-template export format
          if (
            data &&
            typeof data === 'object' &&
            'templates' in data &&
            Array.isArray((data as { templates: unknown[] }).templates)
          ) {
            // Multi-template format
            const exportData = data as { templates: unknown[] };
            for (let i = 0; i < exportData.templates.length; i++) {
              const result = validateImportedTemplate(exportData.templates[i]);
              if (result.valid && result.template) {
                result.template.id = generateTemplateId();
                result.template.isPreset = false;
                result.template.isCustom = true;
                importedTemplates.push(result.template);
              } else {
                errors.push(`Template ${i + 1}: ${result.error}`);
              }
            }
          } else {
            // Single template format
            const result = validateImportedTemplate(data);
            if (result.valid && result.template) {
              result.template.id = generateTemplateId();
              result.template.isPreset = false;
              result.template.isCustom = true;
              importedTemplates.push(result.template);
            } else {
              errors.push(result.error || 'Invalid template');
            }
          }

          if (importedTemplates.length > 0) {
            set((state) => ({
              templates: [...state.templates, ...importedTemplates],
              isLoading: false,
              error: errors.length > 0 ? `Imported ${importedTemplates.length} template(s) with some errors` : null,
            }));
          } else {
            set({
              error: errors[0] || 'No valid templates found',
              isLoading: false,
            });
          }

          return importedTemplates.length;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to import templates',
            isLoading: false,
          });
          return 0;
        }
      },

      setActiveTemplateId: (id) => {
        set({ activeTemplateId: id });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setCategoryFilter: (category) => {
        set({ categoryFilter: category });
      },

      getFilteredTemplates: () => {
        const { templates, searchQuery, categoryFilter } = get();

        return templates.filter((template) => {
          // Category filter
          if (categoryFilter !== 'all' && template.category !== categoryFilter) {
            return false;
          }

          // Search filter
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesName = template.name.toLowerCase().includes(query);
            const matchesDescription = template.description?.toLowerCase().includes(query) ?? false;
            const matchesTags = template.tags.some((tag) => tag.toLowerCase().includes(query));

            if (!matchesName && !matchesDescription && !matchesTags) {
              return false;
            }
          }

          return true;
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),

      // Only persist specific fields
      partialize: (state) => ({
        templates: state.templates,
        activeTemplateId: state.activeTemplateId,
      }),

      // Custom merge function
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<TemplateStore> | undefined;

        if (!persistedState) {
          return current;
        }

        // Merge persisted templates with preset templates
        const persistedTemplates = persistedState.templates || [];
        const presetIds = DEFAULT_PRESET_TEMPLATES.map((p) => p.id);

        // Ensure all preset templates are present
        const mergedTemplates = [
          ...DEFAULT_PRESET_TEMPLATES,
          ...persistedTemplates.filter((t) => !presetIds.includes(t.id)),
        ];

        return {
          ...current,
          templates: mergedTemplates,
          activeTemplateId: persistedState.activeTemplateId ?? null,
        };
      },
    }
  )
);

// ============================================================================
// Validation Helper
// ============================================================================

interface ValidationResult {
  valid: boolean;
  template?: Template;
  error?: string;
}

function validateImportedTemplate(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid template data: not an object' };
  }

  const template = data as Record<string, unknown>;

  // Check required fields
  if (typeof template.name !== 'string' || !template.name.trim()) {
    return { valid: false, error: 'Invalid template: missing or invalid name' };
  }

  if (!template.config || typeof template.config !== 'object') {
    return { valid: false, error: 'Invalid template: missing config' };
  }

  // Validate config structure
  const config = template.config as Record<string, unknown>;
  const requiredConfigKeys = ['canvas', 'hero', 'callouts', 'text', 'ai', 'styleSettings'];

  for (const key of requiredConfigKeys) {
    if (!config[key] || typeof config[key] !== 'object') {
      return { valid: false, error: `Invalid template: missing config.${key}` };
    }
  }

  const now = getCurrentTimestamp();

  // Create validated template
  const validatedTemplate: Template = {
    id: (template.id as string) || generateTemplateId(),
    version: (template.version as string) || '1.0.0',
    name: (template.name as string).trim(),
    description: typeof template.description === 'string' ? template.description : undefined,
    category: isValidCategory(template.category) ? template.category : 'custom',
    tags: Array.isArray(template.tags) ? template.tags.filter((t) => typeof t === 'string') : [],
    createdAt: typeof template.createdAt === 'string' ? template.createdAt : now,
    updatedAt: now,
    thumbnail: typeof template.thumbnail === 'string' ? template.thumbnail : undefined,
    isPreset: false,
    isCustom: true,
    basedOn: typeof template.basedOn === 'string' ? template.basedOn : undefined,
    config: template.config as TemplateConfig,
  };

  return { valid: true, template: validatedTemplate };
}

function isValidCategory(value: unknown): value is TemplateCategory {
  const validCategories: TemplateCategory[] = [
    'minimal',
    'bold',
    'sale',
    'new-arrival',
    'seasonal',
    'lifestyle',
    'premium',
    'custom',
  ];
  return typeof value === 'string' && validCategories.includes(value as TemplateCategory);
}

// ============================================================================
// Selectors (for components)
// ============================================================================

export const selectTemplates = (state: TemplateStore) => state.templates;
export const selectActiveTemplate = (state: TemplateStore) =>
  state.templates.find((t) => t.id === state.activeTemplateId);
export const selectPresetTemplates = (state: TemplateStore) =>
  state.templates.filter((t) => t.isPreset);
export const selectCustomTemplates = (state: TemplateStore) =>
  state.templates.filter((t) => t.isCustom && !t.isPreset);
export const selectIsLoading = (state: TemplateStore) => state.isLoading;
export const selectError = (state: TemplateStore) => state.error;
