# Integration Plan: Hero and Callout Prompt Templates

This document outlines the implementation plan for integrating the new structured JSON prompt templates into the apparel-creative-generator app.

---

## Current State Analysis

### Existing Infrastructure

The codebase already has a prompt template system:

| File | Contents |
|------|----------|
| `src/lib/prompt-templates.ts` | 5 hero templates + 15 callout templates (detail, mid-body, dynamic) |
| `src/lib/defaultCalloutPrompts.ts` | 5 built-in text-based callout prompts |
| `src/lib/prompts.ts` | Core prompt generation functions |
| `src/components/style/ModelScenePanel.tsx` | Hero template selector UI |
| `src/components/prompt/CalloutSelector.tsx` | Callout selection dropdown |
| `src/components/prompt/CalloutPromptManager.tsx` | Custom prompt management |

### New Templates to Integrate

**From HERO_PROMPTS.md (8 styles):**
1. Raw Flash Editorial - 90s/2000s aesthetic
2. Urban Streetwear - Street fashion, neon, graffiti
3. Minimal Studio - Clean white backdrop, luxury
4. Golden Hour Lifestyle - Sunset, outdoor, dreamy
5. Vintage 70s Editorial - Retro, film grain, warm tones
6. High Fashion Studio - Dramatic, editorial luxury
7. Athleisure Action - Dynamic, sportswear, energy
8. Cozy Indoor Lifestyle - Loungewear, warm, hygge

**From CALLOUT_PROMPTS.md (12 templates in 4 categories):**

| Category | Templates |
|----------|-----------|
| Fabric/Texture Details | Fabric Weave, Stitching Detail, Label/Tag, Hem Edge |
| Fit Shots | Shoulder Drop, Torso Silhouette, Sleeve Length |
| Lifestyle/Movement | Walking Motion, Arm Raised, Casual Lean |
| Feature Highlights | Pocket Detail, Hood/Drawstring, Zipper/Closure, Cuff/Ribbing |

---

## Implementation Plan

### Phase 1: Data Structures & Templates

#### 1.1 Update Types (`src/types/index.ts`)

Add new type definitions:

```typescript
// Hero template categories for UI filtering
export type HeroTemplateCategory =
  | 'raw-flash'
  | 'streetwear'
  | 'minimal'
  | 'lifestyle'
  | 'vintage'
  | 'high-fashion'
  | 'athleisure'
  | 'cozy';

// Callout template categories
export type CalloutTemplateCategory =
  | 'fabric-detail'
  | 'fit'
  | 'lifestyle'
  | 'feature';

// Structured JSON template interface
export interface HeroJsonTemplate {
  task: string;
  shot_type: string;
  orientation: string;
  subject: {
    model: string;
    pose: string;
    expression: string;
  };
  camera: {
    lens: string;
    angle: string;
    distance: string;
    focus: string;
  };
  lighting: {
    type: string;
    style: string;
    vibe: string;
  };
  environment: {
    background: string;
    setting: string;
  };
  styling: {
    fit: string;
    details: string;
    retouching: string;
  };
  aesthetic: {
    look: string;
    grain: string;
    color_tone: string;
  };
  output: string;
}

export interface CalloutJsonTemplate {
  task: string;
  shot_type: string;
  crop: string;
  focus: string;
  camera: {
    lens: string;
    focus: string;
    angle?: string;
    depth_of_field?: string;
  };
  lighting: {
    type: string;
    effect: string;
  };
  style: string;
  retouching: string;
  output: string;
  details?: string[];
  composition?: string;
  aesthetic?: {
    vibe: string;
    feel: string;
  };
}

// Enhanced template interfaces
export interface EnhancedHeroTemplate {
  id: string;
  name: string;
  category: HeroTemplateCategory;
  description: string;
  bestFor: string[];
  jsonTemplate: HeroJsonTemplate;
}

export interface EnhancedCalloutTemplate {
  id: string;
  name: string;
  category: CalloutTemplateCategory;
  description: string;
  bestFor: string[];
  whenToUse: string;
  jsonTemplate: CalloutJsonTemplate;
}
```

#### 1.2 Create Hero Templates (`src/lib/heroTemplates.ts`)

New file with all 8 hero styles from HERO_PROMPTS.md:

```typescript
import type { EnhancedHeroTemplate, HeroTemplateCategory } from '@/types';

export const HERO_TEMPLATE_CATEGORIES: { id: HeroTemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Styles' },
  { id: 'raw-flash', label: 'Raw Flash' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'high-fashion', label: 'High Fashion' },
  { id: 'athleisure', label: 'Athleisure' },
  { id: 'cozy', label: 'Cozy' },
];

export const ENHANCED_HERO_TEMPLATES: EnhancedHeroTemplate[] = [
  // All 8 templates with full JSON structure
];

// Helper functions
export function getHeroTemplateById(id: string): EnhancedHeroTemplate | undefined;
export function getHeroTemplatesByCategory(category: HeroTemplateCategory | 'all'): EnhancedHeroTemplate[];
export function heroTemplateToPrompt(template: EnhancedHeroTemplate, productColor: string, productType: string): string;
```

#### 1.3 Create Callout Templates (`src/lib/calloutTemplates.ts`)

New file with all 12 callout templates from CALLOUT_PROMPTS.md:

```typescript
import type { EnhancedCalloutTemplate, CalloutTemplateCategory } from '@/types';

export const CALLOUT_TEMPLATE_CATEGORIES: { id: CalloutTemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Types' },
  { id: 'fabric-detail', label: 'Fabric Details' },
  { id: 'fit', label: 'Fit Shots' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'feature', label: 'Features' },
];

export const ENHANCED_CALLOUT_TEMPLATES: EnhancedCalloutTemplate[] = [
  // All 12 templates with full JSON structure
];

// Helper functions
export function getCalloutTemplateById(id: string): EnhancedCalloutTemplate | undefined;
export function getCalloutTemplatesByCategory(category: CalloutTemplateCategory | 'all'): EnhancedCalloutTemplate[];
export function calloutTemplateToPrompt(template: EnhancedCalloutTemplate, productColor: string, productType: string): string;
```

---

### Phase 2: Store Updates

#### 2.1 Update Store State (`src/store/useCreativeStore.ts`)

Add new state properties:

```typescript
interface CreativeState {
  // ... existing state

  // Hero template selection (NEW)
  selectedHeroTemplateId: string | null;
  heroTemplateCategory: HeroTemplateCategory | 'all';

  // Callout template selection (NEW)
  calloutTemplateCategory: CalloutTemplateCategory | 'all';
  selectedCalloutTemplateIds: [string, string, string]; // Template IDs for 3 slots
}
```

Add new actions:

```typescript
interface CreativeActions {
  // ... existing actions

  // Hero template actions (NEW)
  setSelectedHeroTemplateId: (id: string | null) => void;
  setHeroTemplateCategory: (category: HeroTemplateCategory | 'all') => void;

  // Callout template actions (NEW)
  setCalloutTemplateCategory: (category: CalloutTemplateCategory | 'all') => void;
  setSelectedCalloutTemplateId: (slotIndex: 0 | 1 | 2, templateId: string) => void;
}
```

#### 2.2 Update Default State

```typescript
const productionState = {
  // ... existing defaults

  // NEW defaults
  selectedHeroTemplateId: 'hero-raw-flash-editorial', // Default to first template
  heroTemplateCategory: 'all',
  calloutTemplateCategory: 'all',
  selectedCalloutTemplateIds: [
    'callout-fabric-weave',
    'callout-torso-silhouette',
    'callout-walking-motion'
  ],
};
```

---

### Phase 3: Prompt Generation Updates

#### 3.1 Update Prompts (`src/lib/prompts.ts`)

Modify to use JSON templates:

```typescript
import { getHeroTemplateById, heroTemplateToPrompt } from './heroTemplates';
import { getCalloutTemplateById, calloutTemplateToPrompt } from './calloutTemplates';

export const PROMPTS = {
  hero: (
    productColor: string,
    productType: string,
    style?: ModelSceneStyle,
    templateId?: string
  ) => {
    // Use template if provided
    if (templateId) {
      const template = getHeroTemplateById(templateId);
      if (template) {
        return heroTemplateToPrompt(template, productColor, productType);
      }
    }

    // Fall back to existing dropdown-based generation
    return generateBasicHeroPrompt(productColor, productType, style);
  },

  callout: (
    productColor: string,
    productType: string,
    templateId: string
  ) => {
    const template = getCalloutTemplateById(templateId);
    if (template) {
      return calloutTemplateToPrompt(template, productColor, productType);
    }
    return '';
  },
};
```

#### 3.2 JSON to Prompt Conversion

Create helper function to convert structured JSON to prompt string:

```typescript
export function heroTemplateToPrompt(
  template: EnhancedHeroTemplate,
  productColor: string,
  productType: string
): string {
  const t = template.jsonTemplate;

  // Inject product details
  const subject = t.subject.model.replace(
    /wearing .+/,
    `wearing the ${productColor} ${productType}`
  );

  return `
${t.task}

SHOT TYPE: ${t.shot_type}
ORIENTATION: ${t.orientation}

SUBJECT:
- Model: ${subject}
- Pose: ${t.subject.pose}
- Expression: ${t.subject.expression}

CAMERA:
- Lens: ${t.camera.lens}
- Angle: ${t.camera.angle}
- Distance: ${t.camera.distance}
- Focus: ${t.camera.focus}

LIGHTING:
- Type: ${t.lighting.type}
- Style: ${t.lighting.style}
- Vibe: ${t.lighting.vibe}

ENVIRONMENT:
- Background: ${t.environment.background}
- Setting: ${t.environment.setting}

STYLING:
- Fit: ${t.styling.fit}
- Details: ${t.styling.details}
- Retouching: ${t.styling.retouching}

AESTHETIC:
- Look: ${t.aesthetic.look}
- Grain: ${t.aesthetic.grain}
- Color Tone: ${t.aesthetic.color_tone}

OUTPUT: ${t.output}
`.trim();
}
```

---

### Phase 4: API Updates

#### 4.1 Update Hero Generation (`src/app/api/generate-hero/route.ts`)

```typescript
interface GenerateHeroRequest {
  productImageUrl: string;
  customPrompt?: string;
  modelSceneStyle?: ModelSceneStyle;
  heroTemplateId?: string; // NEW: Template ID
}

// In POST handler:
let prompt: string;
if (body.heroTemplateId) {
  prompt = PROMPTS.hero(productColor, productType, body.modelSceneStyle, body.heroTemplateId);
} else if (body.customPrompt) {
  prompt = body.customPrompt;
} else {
  prompt = PROMPTS.hero(productColor, productType, body.modelSceneStyle);
}
```

#### 4.2 Update Callout Generation (`src/app/api/generate-callouts/route.ts`)

```typescript
interface CalloutConfig {
  slotIndex: number;
  templateId: string;    // NEW: Use template ID
  promptName: string;
}

// Generate prompt from template
const prompt = PROMPTS.callout(productColor, productType, config.templateId);
```

---

### Phase 5: UI Updates

#### 5.1 Create Template Card Component (`src/components/ui/TemplateCard.tsx`)

Reusable card for displaying templates:

```typescript
interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
  isSelected: boolean;
  onSelect: () => void;
}

export function TemplateCard({ ... }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "p-4 rounded-lg border text-left transition-all",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-zinc-200 hover:border-zinc-300"
      )}
    >
      <h4 className="font-medium">{name}</h4>
      <p className="text-sm text-zinc-500 mt-1">{description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {bestFor.map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-zinc-100 rounded">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
```

#### 5.2 Update ModelScenePanel (`src/components/style/ModelScenePanel.tsx`)

Add category tabs and visual template grid:

```typescript
// Add category filter tabs
<div className="flex gap-2 overflow-x-auto pb-2">
  {HERO_TEMPLATE_CATEGORIES.map(cat => (
    <button
      key={cat.id}
      onClick={() => setHeroTemplateCategory(cat.id)}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm whitespace-nowrap",
        heroTemplateCategory === cat.id
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      )}
    >
      {cat.label}
    </button>
  ))}
</div>

// Template grid
<div className="grid grid-cols-2 gap-3 mt-4">
  {filteredTemplates.map(template => (
    <TemplateCard
      key={template.id}
      {...template}
      isSelected={selectedHeroTemplateId === template.id}
      onSelect={() => setSelectedHeroTemplateId(template.id)}
    />
  ))}
</div>
```

#### 5.3 Update CalloutSelector (`src/components/prompt/CalloutSelector.tsx`)

Similar category tabs and visual selection for callouts:

```typescript
// Category tabs for callout types
<div className="flex gap-2 mb-4">
  {CALLOUT_TEMPLATE_CATEGORIES.map(cat => (
    <button key={cat.id} ...>{cat.label}</button>
  ))}
</div>

// Template grid for each slot
<div className="grid grid-cols-2 gap-2">
  {filteredCalloutTemplates.map(template => (
    <TemplateCard
      key={template.id}
      {...template}
      isSelected={selectedCalloutTemplateIds[slotIndex] === template.id}
      onSelect={() => setSelectedCalloutTemplateId(slotIndex, template.id)}
    />
  ))}
</div>
```

---

## Implementation Order

### Step 1: Foundation Files
- [ ] Update `src/types/index.ts` with new types
- [ ] Create `src/lib/heroTemplates.ts` with 8 templates
- [ ] Create `src/lib/calloutTemplates.ts` with 12 templates

### Step 2: Store Integration
- [ ] Update `src/store/useCreativeStore.ts` with new state/actions
- [ ] Set default template selections

### Step 3: Prompt Generation
- [ ] Update `src/lib/prompts.ts` with template support
- [ ] Add JSON-to-prompt conversion functions

### Step 4: API Routes
- [ ] Update `src/app/api/generate-hero/route.ts`
- [ ] Update `src/app/api/generate-callouts/route.ts`
- [ ] Update `src/app/api/regenerate-callout/route.ts`

### Step 5: UI Components
- [ ] Create `src/components/ui/TemplateCard.tsx`
- [ ] Update `src/components/style/ModelScenePanel.tsx`
- [ ] Update `src/components/prompt/CalloutSelector.tsx`
- [ ] Update `src/components/preview/CalloutGrid.tsx`

### Step 6: Testing
- [ ] Test all hero template generations
- [ ] Test all callout template generations
- [ ] Verify UI selections work correctly
- [ ] Test backwards compatibility

---

## File Changes Summary

| Action | File Path |
|--------|-----------|
| MODIFY | `src/types/index.ts` |
| CREATE | `src/lib/heroTemplates.ts` |
| CREATE | `src/lib/calloutTemplates.ts` |
| MODIFY | `src/lib/prompts.ts` |
| MODIFY | `src/store/useCreativeStore.ts` |
| MODIFY | `src/app/api/generate-hero/route.ts` |
| MODIFY | `src/app/api/generate-callouts/route.ts` |
| MODIFY | `src/app/api/regenerate-callout/route.ts` |
| CREATE | `src/components/ui/TemplateCard.tsx` |
| MODIFY | `src/components/style/ModelScenePanel.tsx` |
| MODIFY | `src/components/prompt/CalloutSelector.tsx` |
| MODIFY | `src/components/preview/CalloutGrid.tsx` |

---

## Notes

- Keep existing prompt generation as fallback for backwards compatibility
- The JSON templates will be converted to formatted prompt strings for the AI
- Category filtering improves UX for finding the right style
- Template cards provide visual selection instead of dropdowns
- Product color and type are dynamically injected into templates
