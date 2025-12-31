# Preset/Workflow Saving System - Implementation Plan

## Executive Summary

This plan outlines a comprehensive preset system that allows users to save, load, and quickly execute generation workflows with previously configured settings.

---

## 1. Data Included in a Preset

### Core Settings (StyleSettings)

**ModelSceneStyle:**
- modelGender, modelAge, modelEthnicity
- pose, setting, mood, lighting
- selectedHeroTemplate, customPromptAddition, copySpace

**HeroStyle:**
- zoom, focusX, focusY

**TextStyle:**
- headlineFontSize, headlineColor, headlineShadow
- headlineX, headlineY
- subtitleFontSize, subtitleColor, subtitleLetterSpacing, subtitleGap

**CalloutStyle:**
- size, borderWidth, borderColor, borderRadius, gap, x, y
- Per-callout zoom settings (detail, fit, pose)

### Prompt Settings
- selectedCallouts: [string, string, string] (3 prompt IDs)
- customCalloutPrompts: CalloutPrompt[] (user-created only)

### Optional Text Content
- headline, subtitle (user can choose to include or not)

---

## 2. Storage Strategy

### Primary: localStorage
```typescript
// Key: 'acg-presets'
// Value: JSON.stringify({ version: string, presets: Preset[], lastUpdated: number })
```

### Secondary: JSON Export/Import
- Export as downloadable `.json` file
- Import via file upload

---

## 3. Type Definitions

Add to `/src/types/index.ts`:

```typescript
export interface Preset {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;              // Optional base64 preview

  // Core settings
  styleSettings: StyleSettings;

  // Callout selections
  selectedCallouts: [string, string, string];
  customCalloutPrompts: CalloutPrompt[];

  // Optional text
  includeText: boolean;
  headline?: string;
  subtitle?: string;

  // Metadata
  tags?: string[];
  isDefault?: boolean;             // System presets
}

export interface PresetState {
  presets: Preset[];
  activePresetId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface PresetActions {
  loadPresets: () => void;
  savePreset: (name: string, description?: string, includeText?: boolean) => Preset;
  updatePreset: (id: string, updates: Partial<Preset>) => void;
  deletePreset: (id: string) => void;
  duplicatePreset: (id: string, newName: string) => Preset;
  applyPreset: (id: string) => void;
  exportPreset: (id: string) => void;
  importPresets: (file: File) => Promise<void>;
  quickGenerate: (presetId: string, productImageFile: File) => Promise<void>;
}
```

---

## 4. UI Components

### New Files to Create:

```
src/components/preset/
  index.ts                    # Barrel export
  PresetManager.tsx           # Full management modal
  PresetSelector.tsx          # Header dropdown
  SavePresetModal.tsx         # Save dialog
  PresetCard.tsx              # Individual preset display
  QuickGeneratePanel.tsx      # One-click generation
```

---

## 5. UI Placement

### Header Integration (Recommended)

```
[Logo] Apparel Creative Generator     [Presets ▼] [Start Over]
```

Dropdown contains:
- Active preset name (if any)
- "Save Current Settings..."
- ─────────────
- List of saved presets
- ─────────────
- "Manage Presets..."
- "Quick Generate..."

### Step 1 Enhancement

Add tabs to Upload step:
- "Start Fresh" (current)
- "From Preset" (apply preset first)
- "Quick Generate" (one-click)

---

## 6. Quick Generate Flow

### User Experience:
1. Click "Quick Generate"
2. Modal opens with preset selector + image upload
3. Select preset, upload image, click "Generate"
4. Progress overlay shows:
   - Uploading image...
   - Generating hero...
   - Generating callouts...
   - Composing final...
5. Final creative displayed with download

### Implementation:
```typescript
async function quickGenerate(presetId: string, imageFile: File) {
  // 1. Apply preset settings
  // 2. Upload product image
  // 3. Generate hero image
  // 4. Generate callout images
  // 5. Compose final collage
  // 6. Navigate to export step
}
```

---

## 7. Default/System Presets

Include built-in presets (cannot delete):

1. **"Clean & Minimal"** - Studio, soft lighting, minimal text
2. **"Urban Street"** - Urban setting, dramatic, bold text
3. **"Cozy Lifestyle"** - Home setting, natural, warm
4. **"High Fashion"** - Elegant, dramatic, sophisticated
5. **"Casual Everyday"** - Relaxed, natural, friendly

---

## 8. Store Structure

### New Store: `/src/store/usePresetStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePresetStore = create<PresetStore>()(
  persist(
    (set, get) => ({
      presets: DEFAULT_PRESETS,
      activePresetId: null,

      savePreset: (name, description, includeText) => {
        // Get current state from useCreativeStore
        // Create preset object
        // Add to presets array
      },

      applyPreset: (id) => {
        // Find preset
        // Apply to useCreativeStore
      },

      quickGenerate: async (presetId, imageFile) => {
        // Full automated workflow
      },
    }),
    { name: 'acg-presets' }
  )
);
```

---

## 9. Implementation Phases

### Phase 1: Core System
1. Add type definitions
2. Create usePresetStore
3. Create SavePresetModal
4. Create PresetSelector dropdown
5. Integrate into header

### Phase 2: Management UI
1. Create PresetManager modal
2. Add rename, duplicate, delete
3. Add preset thumbnails
4. Add tags/organization

### Phase 3: Export/Import
1. JSON export functionality
2. JSON import with validation
3. Schema versioning for migrations

### Phase 4: Quick Generate
1. Create QuickGeneratePanel
2. Implement automated workflow
3. Add progress tracking
4. Error handling

---

## 10. Critical Files

**Create:**
- `/src/store/usePresetStore.ts`
- `/src/lib/presetStorage.ts`
- `/src/components/preset/` (all components)

**Modify:**
- `/src/types/index.ts` - Add Preset types
- `/src/store/useCreativeStore.ts` - Add bulk apply methods
- `/src/app/page.tsx` - Add header preset dropdown

---

## 11. Edge Cases

1. **Missing prompts**: Fall back to defaults if custom prompt ID not found
2. **Storage limits**: Warn at ~4MB (localStorage limit is ~5MB)
3. **Duplicate names**: Append number on import conflicts
4. **Schema migration**: Version number in storage, migrate on load
5. **Modified indicator**: Show when settings differ from applied preset
