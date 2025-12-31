# Auto-Persist Settings System - Implementation Plan

## Overview

This document outlines the implementation plan for automatic settings persistence in the Apparel Creative Generator. The goal is to have all user settings automatically save to localStorage when changed and restore when the app reopens - no manual "save" button needed.

---

## 1. Technical Approach

### Recommended: Zustand Persist Middleware

The codebase already uses Zustand's `persist` middleware successfully in `usePresetStore.ts`. We will extend this pattern to `useCreativeStore.ts`.

**Why Zustand Persist:**
- Already in use in the project (proven pattern)
- Zero additional dependencies
- Automatic serialization/deserialization
- Built-in versioning and migration support
- Selective persistence via `partialize`
- Seamless integration with existing store structure

**Storage Key:** `acg-settings` (to distinguish from existing `acg-presets`)

---

## 2. What to Persist vs Exclude

### PERSIST (Auto-save on every change)

#### Step 2 - Model/Scene (`styleSettings.modelScene`)
| Field | Type | Default |
|-------|------|---------|
| `modelGender` | `'female' \| 'male'` | `'female'` |
| `modelAge` | `'young' \| 'middle' \| 'mature'` | `'young'` |
| `modelEthnicity` | string enum | `'any'` |
| `pose` | string enum | `'relaxed'` |
| `setting` | string enum | `'home'` |
| `mood` | string enum | `'cozy'` |
| `lighting` | string enum | `'natural'` |
| `copySpace` | `CopySpace` | `'left'` |
| `selectedHeroTemplate` | `string \| null` | `null` |
| `customPromptAddition` | `string` | `''` |

#### Step 3 - Hero (`styleSettings.hero`)
| Field | Type | Default |
|-------|------|---------|
| `zoom` | `number` | `1.0` |
| `focusX` | `number` | `50` |
| `focusY` | `number` | `50` |

#### Step 4 - Callouts
| Field | Type | Default |
|-------|------|---------|
| `selectedCallouts` | `[string, string, string]` | `['builtin-detail', 'builtin-fit', 'builtin-pose']` |
| `calloutPrompts` (custom only) | `CalloutPrompt[]` | `[]` (built-in prompts restored fresh) |
| `styleSettings.callout.detail` | `CalloutZoomSettings` | `{ zoom: 1.0, focusX: 50, focusY: 50 }` |
| `styleSettings.callout.fit` | `CalloutZoomSettings` | `{ zoom: 1.0, focusX: 50, focusY: 50 }` |
| `styleSettings.callout.pose` | `CalloutZoomSettings` | `{ zoom: 1.0, focusX: 50, focusY: 50 }` |

#### Step 5 - Text (`styleSettings.text`)
| Field | Type | Default |
|-------|------|---------|
| `headline` | `string` | `''` |
| `subtitle` | `string` | `''` |
| `headlineFontFamily` | `FontFamily` | `'Inter'` |
| `headlineFontWeight` | `FontWeight` | `700` |
| `headlineFontSize` | `number` | `72` |
| `headlineColor` | `string` | `'#FFFFFF'` |
| `headlineShadow` | `boolean` | `true` |
| `headlineX` | `number` | `48` |
| `headlineY` | `number` | `820` |
| `subtitleFontFamily` | `FontFamily` | `'Inter'` |
| `subtitleFontWeight` | `FontWeight` | `500` |
| `subtitleFontSize` | `number` | `18` |
| `subtitleColor` | `string` | `'rgba(255, 255, 255, 0.9)'` |
| `subtitleLetterSpacing` | `number` | `3` |
| `subtitleGap` | `number` | `20` |

#### Step 6 - Layout/Callouts (`styleSettings.callout`)
| Field | Type | Default |
|-------|------|---------|
| `size` | `number` | `200` |
| `borderWidth` | `number` | `3` |
| `borderColor` | `string` | `'#FFFFFF'` |
| `borderRadius` | `number` | `8` |
| `gap` | `number` | `16` |
| `x` | `number` | `48` |
| `y` | `number` | `760` |

### DO NOT PERSIST (Reset each session)

| Field | Reason |
|-------|--------|
| `productImage` | User should upload fresh each session |
| `productImageFile` | File objects cannot be serialized |
| `heroImage` | Generated content, needs regeneration |
| `heroPrompt` | Ephemeral generation state |
| `heroGeneratedPrompt` | Session-specific generation output |
| `heroCustomPrompt` | Could persist, but cleaner to reset |
| `useCustomHeroPrompt` | Toggle should reset with prompts |
| `calloutImages.detail` | Generated content |
| `calloutImages.fit` | Generated content |
| `calloutImages.pose` | Generated content |
| `finalCollage` | Generated content |
| `currentStep` | Always start at step 1 |
| `isUploading` | Loading state |
| `isGeneratingHero` | Loading state |
| `isGeneratingCallouts` | Loading state |
| `isComposing` | Loading state |
| `error` | Session-specific error state |

---

## 3. Files to Modify

### Primary Changes

| File | Changes |
|------|---------|
| `src/store/useCreativeStore.ts` | Add `persist` middleware, configure `partialize`, add migration |
| `src/types/index.ts` | Add persistence version constant (optional) |

### No Changes Required

| File | Reason |
|------|--------|
| `src/lib/defaultCalloutPrompts.ts` | Built-in prompts stay in code |
| `src/store/usePresetStore.ts` | Already persisted separately |
| Component files | No changes - they already use store hooks |

---

## 4. Implementation Steps

### Step 1: Add Persist Middleware Import
```typescript
// src/store/useCreativeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
```

### Step 2: Define Partialize Function
Create a function to extract only the fields we want to persist:

```typescript
const partializeState = (state: CreativeState) => ({
  // Style settings (all of them)
  styleSettings: state.styleSettings,

  // Callout selections
  selectedCallouts: state.selectedCallouts,

  // Custom callout prompts only (filter out built-in)
  customCalloutPrompts: state.calloutPrompts.filter(p => !p.isBuiltIn),

  // Text content
  headline: state.headline,
  subtitle: state.subtitle,
});
```

### Step 3: Wrap Store with Persist
```typescript
export const useCreativeStore = create<CreativeStore>()(
  persist(
    (set, get) => ({
      // ... existing store implementation
    }),
    {
      name: 'acg-settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: partializeState,
      merge: (persisted, current) => {
        // Custom merge logic - see Step 4
      },
    }
  )
);
```

### Step 4: Implement Custom Merge Function
The merge function handles restoring persisted state while:
- Preserving built-in callout prompts from code
- Applying defaults for any missing fields
- Never restoring excluded fields

```typescript
merge: (persisted, current) => {
  const persistedState = persisted as PersistedState | undefined;

  if (!persistedState) {
    return current;
  }

  // Merge custom callout prompts with built-in prompts
  const customPrompts = persistedState.customCalloutPrompts || [];
  const mergedCalloutPrompts = [
    ...DEFAULT_CALLOUT_PROMPTS,
    ...customPrompts,
  ];

  return {
    ...current,
    styleSettings: deepMergeStyleSettings(
      DEFAULT_STYLE_SETTINGS,
      persistedState.styleSettings
    ),
    selectedCallouts: persistedState.selectedCallouts || DEFAULT_SELECTED_CALLOUTS,
    calloutPrompts: mergedCalloutPrompts,
    headline: persistedState.headline ?? '',
    subtitle: persistedState.subtitle ?? '',
  };
}
```

### Step 5: Add Deep Merge Utility
Create a utility to safely merge style settings with defaults:

```typescript
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
```

### Step 6: Update Reset Function
Ensure the `reset()` action also clears persisted storage if desired:

```typescript
reset: () => {
  set(initialState);
  // Optionally clear localStorage for fresh start
  // localStorage.removeItem('acg-settings');
}
```

---

## 5. Migration/Versioning Strategy

### Version Control

The persist middleware supports versioning. When the schema changes:

```typescript
{
  name: 'acg-settings',
  version: 2, // Increment when schema changes
  migrate: (persistedState, version) => {
    if (version === 1) {
      // Migration from v1 to v2
      // Example: Add new field with default
      return {
        ...persistedState,
        newField: 'default-value',
      };
    }
    return persistedState;
  },
}
```

### Migration Scenarios

| Version Change | Example Migration |
|----------------|-------------------|
| Add new field | Set default value |
| Remove field | Delete from persisted state |
| Rename field | Copy old value to new key, delete old |
| Change field type | Transform value to new type |
| Restructure nested object | Remap properties |

### Recommended Version History Pattern

```typescript
// Keep track of versions and their changes
const STORAGE_VERSION = 1;

const migrations = {
  // Version 1 -> 2: Example
  // 1: (state) => ({ ...state, newField: 'default' }),
};

const migrate = (persistedState: unknown, version: number) => {
  let state = persistedState;
  for (let v = version; v < STORAGE_VERSION; v++) {
    if (migrations[v]) {
      state = migrations[v](state);
    }
  }
  return state;
};
```

---

## 6. Edge Cases

### 6.1 First-Time User
- **Scenario:** No data in localStorage
- **Handling:** `merge` function returns `current` (defaults) when `persisted` is undefined
- **Result:** App loads with `DEFAULT_STYLE_SETTINGS`

### 6.2 Corrupted/Invalid Data
- **Scenario:** localStorage contains malformed JSON or invalid data
- **Handling:** Zustand persist catches JSON parse errors gracefully
- **Fallback:** Use defaults if parse fails
- **Recommendation:** Add try/catch in merge function for extra safety

```typescript
merge: (persisted, current) => {
  try {
    // ... merge logic
  } catch (error) {
    console.warn('Failed to restore settings, using defaults:', error);
    return current;
  }
}
```

### 6.3 Schema Version Mismatch
- **Scenario:** User has v1 data but app expects v2
- **Handling:** `migrate` function transforms old data to new schema
- **Recommendation:** Always increment version and add migration when schema changes

### 6.4 Missing Fields in Persisted Data
- **Scenario:** New field added in update, missing from old persisted data
- **Handling:** Deep merge with defaults ensures new fields get default values
- **Pattern:** Always spread defaults first: `{ ...defaults, ...persisted }`

### 6.5 Built-in Prompts Changed
- **Scenario:** Developer updates `DEFAULT_CALLOUT_PROMPTS`
- **Handling:** Built-in prompts always come from code, never persisted
- **Result:** Users automatically get updated built-in prompts

### 6.6 Selected Callout References Missing Prompt
- **Scenario:** User had custom prompt selected, then cleared localStorage in another tab
- **Handling:** Validate `selectedCallouts` IDs exist in `calloutPrompts`
- **Fallback:** Replace missing IDs with first available built-in prompt

```typescript
// In merge function
const validatedCallouts = persistedState.selectedCallouts.map(id => {
  const exists = mergedCalloutPrompts.find(p => p.id === id);
  return exists ? id : DEFAULT_SELECTED_CALLOUTS[0];
}) as [string, string, string];
```

### 6.7 localStorage Quota Exceeded
- **Scenario:** User creates many custom prompts, hits ~5MB localStorage limit
- **Handling:** Zustand persist will throw; app continues with in-memory state
- **Recommendation:** Log warning, consider cleanup UI for custom prompts

### 6.8 Private/Incognito Browsing
- **Scenario:** User in private mode where localStorage may be restricted
- **Handling:** Zustand persist handles this gracefully - operates in memory only
- **Result:** Settings work during session but don't persist

### 6.9 Multiple Tabs
- **Scenario:** User has app open in multiple tabs
- **Handling:** Each tab has its own Zustand store instance
- **Note:** Last write wins. Consider `storage` event listener for cross-tab sync if needed (future enhancement)

### 6.10 Reset vs Clear Storage
- **Decision needed:** Should `reset()` also clear localStorage?
- **Option A:** Reset only in-memory state (user preferences preserved for next session)
- **Option B:** Reset everything including storage (true "start fresh")
- **Recommendation:** Option A for `reset()`, add separate `clearAllSettings()` for Option B

---

## 7. Testing Checklist

### Manual Testing

- [ ] Fresh load: App starts with defaults
- [ ] Change setting: Verify localStorage updates immediately
- [ ] Refresh page: All settings restored correctly
- [ ] Clear localStorage: App falls back to defaults
- [ ] Create custom callout prompt: Persists across refresh
- [ ] Delete custom callout prompt: Removal persists
- [ ] Change all style settings: All restore correctly
- [ ] Test in incognito mode: No errors, works without persistence

### Automated Testing (Future)

- [ ] Unit test: partialize extracts correct fields
- [ ] Unit test: merge handles undefined persisted state
- [ ] Unit test: merge handles partial persisted state
- [ ] Unit test: migration transforms old schema correctly
- [ ] Integration test: Full save/restore cycle

---

## 8. Implementation Timeline

| Phase | Task | Estimate |
|-------|------|----------|
| 1 | Add persist middleware and partialize | 30 min |
| 2 | Implement custom merge function | 30 min |
| 3 | Add deep merge utility | 15 min |
| 4 | Test all settings persist/restore | 30 min |
| 5 | Handle edge cases | 30 min |
| 6 | Documentation/comments | 15 min |

**Total Estimated Time:** ~2.5 hours

---

## 9. Future Enhancements (Out of Scope)

- Cross-tab synchronization via storage events
- Cloud sync for logged-in users
- Export/import settings (separate from presets)
- Settings history/undo
- Multiple profiles beyond the preset system

---

## Summary

This implementation uses Zustand's proven `persist` middleware to automatically save user settings to localStorage. The key aspects are:

1. **Selective persistence** via `partialize` - only settings, not generated content
2. **Safe restoration** via custom `merge` - preserves built-in prompts, applies defaults
3. **Version migration** support for future schema changes
4. **Graceful degradation** for edge cases like corrupted data or private browsing

The implementation requires changes to only one file (`useCreativeStore.ts`) and follows the existing pattern established by `usePresetStore.ts`.
