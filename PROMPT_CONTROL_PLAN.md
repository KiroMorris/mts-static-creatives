# Prompt Control Feature - Implementation Plan

## Overview

This plan details the implementation of prompt control features for the Apparel Creative Generator:
1. **Hero Image Prompt Control** - View/edit auto-generated prompts before generation
2. **Callout Prompts Management** - Create, edit, delete custom callout prompts
3. **Callout Selection** - Choose which 3 prompts to use before generating callouts

---

## 1. New Types/Interfaces

Add to `src/types/index.ts`:

```typescript
// Callout prompt definition
export interface CalloutPrompt {
  id: string;                    // Unique identifier
  name: string;                  // Display name (e.g., "Detail Shot", "Fit Shot")
  promptText: string;            // The actual prompt template
  isBuiltIn: boolean;            // true for default prompts, false for user-created
  createdAt?: number;            // Timestamp for user-created prompts
}

// Selected callout configuration for generation
export interface SelectedCallout {
  slotIndex: number;             // 0, 1, or 2 (which of the 3 slots)
  promptId: string;              // ID of the CalloutPrompt to use
  generatedImageUrl?: string;    // URL after generation
}

// Update CalloutImages to be slot-based
export interface CalloutImages {
  slot0: string | null;          // First callout slot
  slot1: string | null;          // Second callout slot
  slot2: string | null;          // Third callout slot
}

export type CalloutSlot = 'slot0' | 'slot1' | 'slot2';
```

---

## 2. Store Changes

Update `src/store/useCreativeStore.ts`:

### New State Properties:
```typescript
// Hero prompt control
heroGeneratedPrompt: string;           // The auto-generated prompt (read-only display)
heroCustomPrompt: string;              // User-edited prompt
useCustomHeroPrompt: boolean;          // Toggle between auto/custom

// Callout prompts management
calloutPrompts: CalloutPrompt[];       // All available prompts (built-in + custom)

// Callout selection for generation
selectedCallouts: [string, string, string]; // Array of 3 promptIds for slots 0,1,2

// Updated callout images (slot-based)
calloutImages: {
  slot0: string | null;
  slot1: string | null;
  slot2: string | null;
};
```

### New Actions:
```typescript
// Hero prompt actions
setHeroGeneratedPrompt: (prompt: string) => void;
setHeroCustomPrompt: (prompt: string) => void;
setUseCustomHeroPrompt: (use: boolean) => void;

// Callout prompt management
addCalloutPrompt: (prompt: Omit<CalloutPrompt, 'id' | 'createdAt'>) => void;
updateCalloutPrompt: (id: string, updates: Partial<CalloutPrompt>) => void;
deleteCalloutPrompt: (id: string) => void;

// Callout selection
setSelectedCallout: (slotIndex: 0 | 1 | 2, promptId: string) => void;
setAllSelectedCallouts: (promptIds: [string, string, string]) => void;

// Updated callout image setter
setCalloutImageBySlot: (slot: CalloutSlot, url: string) => void;
```

---

## 3. Default Built-in Prompts

Create `src/lib/defaultCalloutPrompts.ts`:

```typescript
import type { CalloutPrompt } from '@/types';

export const DEFAULT_CALLOUT_PROMPTS: CalloutPrompt[] = [
  {
    id: 'builtin-detail',
    name: 'Detail Shot',
    promptText: `Close-up fashion photography shot focusing on the fabric texture and quality.
Show: Soft cotton/fleece texture, quality stitching details, fabric drape
Framing: SQUARE 1:1 aspect ratio, tight crop on shoulder/chest area
Lighting: Soft diffused lighting
IMPORTANT: Output must be SQUARE (1:1 ratio). Focus on texture and material quality.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-fit',
    name: 'Fit Shot',
    promptText: `Fashion photography showing the fit of the garment on the same model.
Show: Cropped view of torso/waist area showing how the garment fits
Framing: SQUARE 1:1 aspect ratio, mid-body crop, casual relaxed pose
Lighting: Natural lighting
IMPORTANT: Output must be SQUARE (1:1 ratio). Emphasize the comfortable, flattering fit.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-pose',
    name: 'Pose Shot',
    promptText: `Alternative lifestyle shot of the same model wearing the garment.
Pose: Natural relaxed pose, different angle from hero
Expression: Natural expression
Framing: SQUARE 1:1 aspect ratio, head and upper body visible
IMPORTANT: Output must be SQUARE (1:1 ratio). Show versatility and lifestyle context.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-back',
    name: 'Back View',
    promptText: `Fashion photography showing the back of the garment.
Show: Back view of the model wearing the garment, showing back design and fit
Framing: SQUARE 1:1 aspect ratio, upper body from behind
IMPORTANT: Output must be SQUARE (1:1 ratio). Show the back design clearly.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-lifestyle',
    name: 'Lifestyle Action',
    promptText: `Dynamic lifestyle shot of the model in motion or activity.
Show: Model in natural activity (walking, stretching, casual movement)
Framing: SQUARE 1:1 aspect ratio, action-oriented composition
IMPORTANT: Output must be SQUARE (1:1 ratio). Show the garment in real-life context.`,
    isBuiltIn: true,
  },
];
```

---

## 4. API Changes

### 4.1 Update `/api/generate-hero/route.ts`

```typescript
interface GenerateHeroRequest {
  productImageUrl: string;
  productImageId?: string;
  customPrompt?: string;
  modelSceneStyle?: ModelSceneStyle;
  previewPromptOnly?: boolean;  // NEW: If true, just return the prompt without generating
}

interface HeroGenerationResponse {
  success: boolean;
  data?: {
    heroImageUrl?: string;        // Optional if previewPromptOnly
    heroImageId?: string;
    promptUsed: string;
    generationTime?: number;
    generatedPrompt?: string;     // NEW: The auto-generated prompt
  };
  error?: ApiError;
}
```

### 4.2 Update `/api/generate-callouts/route.ts`

```typescript
interface GenerateCalloutsRequest {
  productImageUrl: string;
  heroImageUrl: string;
  heroImageId: string;
  // NEW: Array of callout configurations
  calloutConfigs: Array<{
    slotIndex: number;           // 0, 1, or 2
    promptText: string;          // The full prompt to use
    promptName: string;          // For logging/tracking
  }>;
}

interface CalloutsGenerationResponse {
  success: boolean;
  data?: {
    callouts: Array<{
      slotIndex: number;
      imageUrl: string;
      imageId: string;
      promptUsed: string;
      promptName: string;
    }>;
    totalGenerationTime: number;
  };
  error?: ApiError;
}
```

### 4.3 Update `/api/regenerate-callout/route.ts`

```typescript
interface RegenerateCalloutRequest {
  slotIndex: number;             // Changed from calloutType
  productImageUrl: string;
  heroImageUrl: string;
  promptText: string;            // The prompt to use
  promptName: string;            // For tracking
}
```

---

## 5. UI Components to Create

### 5.1 `src/components/prompt/PromptEditor.tsx`

Hero prompt view/edit component:
- Toggle switch between "Auto-generated" and "Custom"
- Read-only display of auto-generated prompt
- Editable textarea for custom prompt
- Copy button to copy generated prompt to custom
- Character count indicator

### 5.2 `src/components/prompt/CalloutPromptManager.tsx`

CRUD for custom callout prompts:
- List of all available prompts (built-in shown with lock icon)
- "Add Custom Prompt" button
- Edit button for custom prompts
- Delete button for custom prompts (disabled for built-in)
- Modal for adding/editing prompt

### 5.3 `src/components/prompt/CalloutSelector.tsx`

Select prompts for 3 callout slots:
- 3 dropdown/select boxes (one per slot)
- Each dropdown shows all available prompts
- Visual indicator if same prompt selected multiple times
- Preview of prompt text on hover
- "Manage Prompts" link to open CalloutPromptManager

---

## 6. Component Modifications

### 6.1 Update `HeroPreview.tsx`

Changes:
1. Don't auto-generate on mount - fetch prompt preview first
2. Add PromptEditor component inline
3. User can edit before clicking "Generate"
4. Show the prompt that will be used
5. Regenerate uses current prompt (custom or auto)

### 6.2 Update `CalloutGrid.tsx`

Changes:
1. Add pre-generation selection step
2. Show CalloutSelector before generation
3. Add "Manage Prompts" modal access
4. Update to slot-based image storage
5. Show which prompt was used for each image
6. Regenerate per slot uses selected prompt

---

## 7. Step-by-Step Implementation Order

### Phase 1: Types and Store Foundation
1. Update `src/types/index.ts` - Add new interfaces
2. Create `src/lib/defaultCalloutPrompts.ts` - Define built-in prompts
3. Update `src/store/useCreativeStore.ts` - Add state & actions

### Phase 2: API Updates
4. Update `/api/generate-hero/route.ts` - Add prompt preview mode
5. Update `/api/generate-callouts/route.ts` - Accept custom prompts
6. Update `/api/regenerate-callout/route.ts` - Use slot-based + custom prompts

### Phase 3: UI Components
7. Create `src/components/prompt/PromptEditor.tsx`
8. Create `src/components/prompt/CalloutPromptManager.tsx`
9. Create `src/components/prompt/CalloutSelector.tsx`
10. Create `src/components/prompt/index.ts` - Export barrel

### Phase 4: Integration
11. Update `src/components/preview/HeroPreview.tsx`
12. Update `src/components/preview/CalloutGrid.tsx`

### Phase 5: Polish and Testing
13. Test all flows
14. Handle edge cases
15. Ensure mobile responsiveness

---

## 8. File Changes Summary

### New Files:
| File | Purpose |
|------|---------|
| `src/lib/defaultCalloutPrompts.ts` | Default built-in callout prompts |
| `src/components/prompt/PromptEditor.tsx` | Hero prompt view/edit |
| `src/components/prompt/CalloutPromptManager.tsx` | CRUD for custom prompts |
| `src/components/prompt/CalloutSelector.tsx` | Select prompts for slots |
| `src/components/prompt/index.ts` | Export barrel file |

### Files to Modify:
| File | Changes |
|------|---------|
| `src/types/index.ts` | Add new interfaces |
| `src/store/useCreativeStore.ts` | Add state & actions |
| `src/app/api/generate-hero/route.ts` | Add prompt preview mode |
| `src/app/api/generate-callouts/route.ts` | Accept custom prompts |
| `src/app/api/regenerate-callout/route.ts` | Slot-based + custom prompts |
| `src/components/preview/HeroPreview.tsx` | Integrate PromptEditor |
| `src/components/preview/CalloutGrid.tsx` | Add selection UI |

---

## 9. Local Storage Persistence

Consider persisting custom prompts to localStorage using zustand persist:

```typescript
import { persist } from 'zustand/middleware';

export const useCreativeStore = create(
  persist(
    (set) => ({
      // ... state
    }),
    {
      name: 'apparel-creative-store',
      partialize: (state) => ({
        calloutPrompts: state.calloutPrompts,
      }),
    }
  )
);
```

---

## 10. Utility Functions

```typescript
// src/lib/utils.ts
export function generatePromptId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 11. Validation Rules

- Ensure at least 3 prompts available
- Warn (but allow) if same prompt selected multiple times
- Ensure prompt text is not empty
- Ensure prompt name is unique among custom prompts
