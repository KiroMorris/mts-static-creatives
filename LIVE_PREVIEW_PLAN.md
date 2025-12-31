# LivePreview Implementation Plan

## Executive Summary

This plan details the implementation of a CSS-based LivePreview component that displays a real-time, scaled preview of the 1080x1920 creative canvas alongside the style controls in the Layout step (Step 6). The preview will update instantly as users adjust text and callout styling parameters, eliminating the need for server-side rendering during style adjustments.

---

## 1. Files to Create/Modify

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/preview/LivePreview.tsx` | Main LivePreview component with CSS-based canvas simulation |
| `/src/lib/preview-utils.ts` | Helper functions for positioning calculations and style transformations |

### Files to Modify

| File Path | Changes Required |
|-----------|-----------------|
| `/src/components/style/StyleControlPanel.tsx` | Replace centered max-w-2xl layout with side-by-side grid layout; integrate LivePreview |
| `/src/app/globals.css` | Add CSS for scaled preview container and aspect ratio preservation |

---

## 2. LivePreview Component Structure

### Component Architecture

```
LivePreview.tsx
├── Props Interface
│   ├── heroImage: string | null
│   ├── calloutImages: CalloutImages
│   ├── headline: string
│   ├── subtitle: string
│   ├── textStyle: TextStyle
│   └── calloutStyle: CalloutStyle
│
├── Constants (from TEMPLATE)
│   ├── CANVAS_WIDTH = 1080
│   ├── CANVAS_HEIGHT = 1920
│   └── SCALE_FACTOR (calculated based on container)
│
├── Sub-Components
│   ├── PreviewCanvas (container with aspect-ratio)
│   ├── HeroLayer (background image)
│   ├── TextOverlay (headline + subtitle positioned)
│   └── CalloutStack (3 callout images with styling)
│
└── Positioning Logic
    ├── calculateTextPosition()
    ├── calculateCalloutPositions()
    └── scaleValue() helper
```

### Component Props Interface

```typescript
interface LivePreviewProps {
  // Image data from store
  heroImage: string | null;
  calloutImages: {
    detail: string | null;
    fit: string | null;
    pose: string | null;
  };

  // Text content from store
  headline: string;
  subtitle: string;

  // Style settings from store
  textStyle: TextStyle;
  calloutStyle: CalloutStyle;

  // Optional: container constraints
  maxHeight?: number;
  showBorder?: boolean;
}
```

---

## 3. StyleControlPanel Layout Update

### Current Layout (to be replaced)
```
┌─────────────────────────────────────────────┐
│                   max-w-2xl                  │
│  ┌───────────────────────────────────────┐  │
│  │         StyleControlPanel             │  │
│  │    (tabs, sliders, color pickers)     │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### New Layout (side by side)
```
┌────────────────────────────────────────────────────────────────┐
│                        max-w-6xl                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │      LivePreview         │  │    StyleControls          │   │
│  │   (fixed aspect 9:16)    │  │  (tabs, sliders, etc.)    │   │
│  │                          │  │                           │   │
│  │   [ scaled preview ]     │  │  [Text Style Tab]         │   │
│  │                          │  │  [Callouts Tab]           │   │
│  │   max-w-sm or 300px     │  │                           │   │
│  │                          │  │  flex-1 or max-w-md       │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Layout Implementation Strategy

```typescript
// StyleControlPanel.tsx structure changes
<div className="w-full max-w-6xl mx-auto">
  {/* Header - centered */}
  <div className="text-center mb-8">...</div>

  {/* Main content - side by side */}
  <div className="flex flex-col lg:flex-row gap-8 items-start">
    {/* Preview panel - sticky on desktop */}
    <div className="w-full lg:w-[340px] lg:sticky lg:top-32 flex-shrink-0">
      <LivePreview
        heroImage={heroImage}
        calloutImages={calloutImages}
        headline={headline}
        subtitle={subtitle}
        textStyle={text}
        calloutStyle={callout}
      />
    </div>

    {/* Controls panel - scrollable */}
    <div className="flex-1 min-w-0 max-w-xl">
      {/* Tab navigation */}
      {/* Tab content */}
    </div>
  </div>

  {/* Action buttons - centered at bottom */}
  <div className="flex justify-center gap-4 mt-8">...</div>
</div>
```

---

## 4. CSS/Styling Considerations

### Scaled Preview Container

```css
/* globals.css additions */

/* Preview container with aspect ratio preservation */
.preview-canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 0.75rem;
  background-color: #18181b; /* zinc-900 fallback */
}

/* Inner scaled content wrapper */
.preview-canvas-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 1080px;
  height: 1920px;
  transform-origin: top left;
  /* transform: scale(var(--preview-scale)); - set dynamically */
}

/* Text overlay layer */
.preview-text-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* Callout container */
.preview-callout-stack {
  position: absolute;
  display: flex;
  flex-direction: column;
}

/* Individual callout */
.preview-callout {
  flex-shrink: 0;
  overflow: hidden;
  object-fit: cover;
}
```

### Responsive Breakpoints

```css
/* Mobile: preview stacked above controls */
@media (max-width: 1023px) {
  .preview-canvas {
    max-width: 280px;
    margin: 0 auto 2rem;
  }
}

/* Desktop: side by side */
@media (min-width: 1024px) {
  .preview-canvas {
    max-width: 340px;
  }
}
```

---

## 5. Helper Functions (preview-utils.ts)

```typescript
// /src/lib/preview-utils.ts

import { TEMPLATE } from './constants';
import type { TextStyle, CalloutStyle } from '@/types';

// Canvas constants
export const CANVAS_WIDTH = TEMPLATE.canvas.width;  // 1080
export const CANVAS_HEIGHT = TEMPLATE.canvas.height; // 1920

/**
 * Calculate headline Y position based on position setting
 */
export function calculateHeadlineY(position: TextStyle['headlinePosition']): number {
  switch (position) {
    case 'top':
      return 200;
    case 'bottom':
      return 1400;
    case 'middle':
    default:
      return TEMPLATE.text.headline.y; // 820
  }
}

/**
 * Calculate subtitle Y position (below headline)
 */
export function calculateSubtitleY(
  headlinePosition: TextStyle['headlinePosition'],
  headlineFontSize: number,
  headlineLineCount: number = 1
): number {
  const headlineY = calculateHeadlineY(headlinePosition);
  const lineHeight = Math.round(headlineFontSize * 1.1);
  return headlineY + (headlineLineCount * lineHeight) + TEMPLATE.text.subtitle.yOffset;
}

/**
 * Calculate callout stack start Y position
 */
export function calculateCalloutStartY(style: CalloutStyle): number {
  const totalHeight = (style.size * 3) + (style.gap * 2);

  switch (style.verticalPosition) {
    case 'top':
      return 200;
    case 'bottom':
      return CANVAS_HEIGHT - totalHeight - 100;
    case 'middle':
    default:
      return Math.round((CANVAS_HEIGHT - totalHeight) / 2) + 200;
  }
}

/**
 * Calculate callout X position
 */
export function calculateCalloutX(style: CalloutStyle): number {
  return style.position === 'right'
    ? CANVAS_WIDTH - style.size - 48
    : TEMPLATE.callouts.x; // 48
}

/**
 * Wrap text into lines based on font size and max width
 */
export function wrapHeadlineText(
  text: string,
  fontSize: number
): string[] {
  const charsPerLine = Math.round(15 * (72 / fontSize));
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= charsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Calculate scale factor for preview container
 */
export function calculateScaleFactor(containerWidth: number): number {
  return containerWidth / CANVAS_WIDTH;
}
```

---

## 6. Implementation Phases

### Phase 1: Create Helper Utilities
1. Create `/src/lib/preview-utils.ts` with all positioning calculation functions
2. Export constants that mirror server-side composition logic

### Phase 2: Create LivePreview Component
1. Create `/src/components/preview/LivePreview.tsx`
2. Implement the scaled container with ResizeObserver
3. Build HeroLayer sub-component (simple Image with cover fit)
4. Build TextLayer sub-component (positioned headline + subtitle)
5. Build CalloutLayer sub-component (vertical stack of 3 images)

### Phase 3: Add CSS Styles
1. Add `.preview-canvas` and related styles to `/src/app/globals.css`
2. Add responsive breakpoint styles

### Phase 4: Update StyleControlPanel
1. Import LivePreview and store hooks for images/text
2. Change container from `max-w-2xl` to `max-w-6xl`
3. Restructure to flex row layout with preview on left, controls on right
4. Make preview sticky on desktop
5. Test responsive behavior at mobile breakpoints

### Phase 5: Testing & Polish
1. Verify positioning matches server-side composition exactly
2. Test all style adjustments update preview in real-time
3. Ensure mobile layout stacks correctly
4. Add loading/placeholder states for missing images

---

## 7. Parallel Execution Strategy

**Can be executed in parallel (2 agents):**

| Agent 1 | Agent 2 |
|---------|---------|
| Phase 1: Create `preview-utils.ts` | Phase 3: Add CSS to `globals.css` |
| Phase 2: Create `LivePreview.tsx` | (wait for Agent 1) |

**Must be sequential:**
- Phase 4 (StyleControlPanel update) depends on Phase 1 & 2 completing
- Phase 5 (testing) depends on all phases

**Recommended: 2 parallel agents**, then sequential integration.

---

## 8. Critical Files Reference

- `/src/components/style/StyleControlPanel.tsx` - Primary file to modify
- `/src/lib/constants.ts` - TEMPLATE values for positioning
- `/src/lib/sharp-compose.ts` - Server-side logic to mirror
- `/src/types/index.ts` - TextStyle and CalloutStyle interfaces
- `/src/store/useCreativeStore.ts` - Zustand store for state
