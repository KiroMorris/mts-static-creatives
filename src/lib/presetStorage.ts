// Preset Storage Helpers for Apparel Creative Generator

import type { Preset, StyleSettings, CalloutPrompt } from '@/types';
import { DEFAULT_STYLE_SETTINGS } from '@/types';

// Generate a unique preset ID
export function generatePresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Export a preset to JSON and trigger download
export function exportPresetToJSON(preset: Preset): void {
  const dataStr = JSON.stringify(preset, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${preset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preset.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export multiple presets to JSON
export function exportPresetsToJSON(presets: Preset[]): void {
  const exportData = {
    version: '1.0',
    exportedAt: Date.now(),
    presets: presets.filter(p => !p.isDefault), // Don't export system presets
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `acg_presets_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Validate imported preset structure
export function validateImportedPreset(data: unknown): { valid: boolean; preset?: Preset; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid preset data: not an object' };
  }

  const preset = data as Record<string, unknown>;

  // Check required fields
  if (typeof preset.name !== 'string' || !preset.name.trim()) {
    return { valid: false, error: 'Invalid preset: missing or invalid name' };
  }

  if (!preset.styleSettings || typeof preset.styleSettings !== 'object') {
    return { valid: false, error: 'Invalid preset: missing style settings' };
  }

  if (!Array.isArray(preset.selectedCallouts) || preset.selectedCallouts.length !== 3) {
    return { valid: false, error: 'Invalid preset: selectedCallouts must be an array of 3 strings' };
  }

  // Validate styleSettings structure
  const styleSettings = preset.styleSettings as Record<string, unknown>;
  const requiredStyleKeys = ['modelScene', 'hero', 'text', 'callout'];
  for (const key of requiredStyleKeys) {
    if (!styleSettings[key] || typeof styleSettings[key] !== 'object') {
      return { valid: false, error: `Invalid preset: missing styleSettings.${key}` };
    }
  }

  // Create validated preset with defaults for any missing optional fields
  const validatedPreset: Preset = {
    id: preset.id as string || generatePresetId(),
    name: (preset.name as string).trim(),
    description: typeof preset.description === 'string' ? preset.description : undefined,
    createdAt: typeof preset.createdAt === 'number' ? preset.createdAt : Date.now(),
    updatedAt: Date.now(),
    thumbnail: typeof preset.thumbnail === 'string' ? preset.thumbnail : undefined,
    styleSettings: mergeWithDefaultSettings(preset.styleSettings as Partial<StyleSettings>),
    selectedCallouts: preset.selectedCallouts as [string, string, string],
    customCalloutPrompts: Array.isArray(preset.customCalloutPrompts)
      ? validateCalloutPrompts(preset.customCalloutPrompts)
      : [],
    includeText: typeof preset.includeText === 'boolean' ? preset.includeText : false,
    headline: typeof preset.headline === 'string' ? preset.headline : undefined,
    subtitle: typeof preset.subtitle === 'string' ? preset.subtitle : undefined,
    tags: Array.isArray(preset.tags) ? preset.tags.filter(t => typeof t === 'string') : [],
    isDefault: false, // Imported presets are never system presets
  };

  return { valid: true, preset: validatedPreset };
}

// Validate and filter callout prompts
function validateCalloutPrompts(prompts: unknown[]): CalloutPrompt[] {
  return prompts
    .filter((p): p is CalloutPrompt => {
      if (!p || typeof p !== 'object') return false;
      const prompt = p as Record<string, unknown>;
      return (
        typeof prompt.id === 'string' &&
        typeof prompt.name === 'string' &&
        typeof prompt.promptText === 'string' &&
        typeof prompt.isBuiltIn === 'boolean'
      );
    })
    .map(p => ({
      ...p,
      isBuiltIn: false, // Imported prompts are never built-in
    }));
}

// Merge partial settings with defaults
function mergeWithDefaultSettings(partial: Partial<StyleSettings>): StyleSettings {
  return {
    modelScene: {
      ...DEFAULT_STYLE_SETTINGS.modelScene,
      ...(partial.modelScene || {}),
    },
    hero: {
      ...DEFAULT_STYLE_SETTINGS.hero,
      ...(partial.hero || {}),
    },
    text: {
      ...DEFAULT_STYLE_SETTINGS.text,
      ...(partial.text || {}),
    },
    callout: {
      ...DEFAULT_STYLE_SETTINGS.callout,
      ...(partial.callout || {}),
    },
  };
}

// Parse imported file (handles both single preset and multi-preset export format)
export async function parseImportedFile(file: File): Promise<{ presets: Preset[]; errors: string[] }> {
  const text = await file.text();
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    return { presets: [], errors: ['Invalid JSON file'] };
  }

  const presets: Preset[] = [];
  const errors: string[] = [];

  // Check if it's a multi-preset export
  if (data && typeof data === 'object' && 'presets' in data && Array.isArray((data as { presets: unknown[] }).presets)) {
    const exportData = data as { presets: unknown[] };
    for (let i = 0; i < exportData.presets.length; i++) {
      const result = validateImportedPreset(exportData.presets[i]);
      if (result.valid && result.preset) {
        // Generate new ID to avoid conflicts
        result.preset.id = generatePresetId();
        presets.push(result.preset);
      } else {
        errors.push(`Preset ${i + 1}: ${result.error}`);
      }
    }
  } else {
    // Single preset
    const result = validateImportedPreset(data);
    if (result.valid && result.preset) {
      result.preset.id = generatePresetId();
      presets.push(result.preset);
    } else {
      errors.push(result.error || 'Invalid preset');
    }
  }

  return { presets, errors };
}
