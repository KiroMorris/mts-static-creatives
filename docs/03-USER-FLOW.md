# User Flow Document
## Apparel Creative Generator

---

### Overview

This document details the complete user journey from landing on the app to downloading the final creative.

---

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              START                                      │
│                                │                                        │
│                                ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        STEP 1: UPLOAD                             │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                            │  │  │
│  │  │         ┌─────────────────────────────┐                    │  │  │
│  │  │         │                             │                    │  │  │
│  │  │         │    Drag & drop your         │                    │  │  │
│  │  │         │    hoodie image here        │                    │  │  │
│  │  │         │                             │                    │  │  │
│  │  │         │    or click to browse       │                    │  │  │
│  │  │         │                             │                    │  │  │
│  │  │         └─────────────────────────────┘                    │  │  │
│  │  │                                                            │  │  │
│  │  │    Supported: JPG, PNG, WebP (max 10MB)                    │  │  │
│  │  │                                                            │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  User Action: Drops/selects product image                         │  │
│  │  System: Validates file, shows preview                            │  │
│  │  Next: Click "Continue" button                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│                                ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     STEP 2: GENERATE HERO                         │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                            │  │  │
│  │  │  ┌─────────────┐    ┌──────────────────────────────────┐  │  │  │
│  │  │  │  Uploaded   │    │                                  │  │  │  │
│  │  │  │  Product    │ →  │     Generated Hero Preview       │  │  │  │
│  │  │  │             │    │         (9:16 ratio)             │  │  │  │
│  │  │  └─────────────┘    │                                  │  │  │  │
│  │  │                      │     [Loading spinner while      │  │  │  │
│  │  │                      │      generating...]             │  │  │  │
│  │  │                      │                                  │  │  │  │
│  │  │                      └──────────────────────────────────┘  │  │  │
│  │  │                                                            │  │  │
│  │  │  [ Regenerate ]  [ Edit Prompt ]  [ ✓ Approve & Continue ] │  │  │
│  │  │                                                            │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  User Actions:                                                    │  │
│  │  - "Regenerate" → Generate new hero with same prompt              │  │
│  │  - "Edit Prompt" → Opens prompt editor modal                      │  │
│  │  - "Approve" → Locks hero, proceeds to callouts                   │  │
│  │                                                                   │  │
│  │  System: Calls OpenAI to generate lifestyle image                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│                                ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   STEP 3: GENERATE CALLOUTS                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                            │  │  │
│  │  │    Generate 3 detail shots to complete your creative       │  │  │
│  │  │                                                            │  │  │
│  │  │    ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │  │
│  │  │    │          │  │          │  │          │               │  │  │
│  │  │    │ Detail/  │  │  Fit     │  │ Alt Pose │               │  │  │
│  │  │    │ Texture  │  │  Shot    │  │          │               │  │  │
│  │  │    │          │  │          │  │          │               │  │  │
│  │  │    └──────────┘  └──────────┘  └──────────┘               │  │  │
│  │  │    [Regenerate]  [Regenerate]  [Regenerate]               │  │  │
│  │  │                                                            │  │  │
│  │  │              [ ✓ Approve All & Continue ]                  │  │  │
│  │  │                                                            │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  User Actions:                                                    │  │
│  │  - Regenerate individual callouts                                 │  │
│  │  - Approve all to proceed                                         │  │
│  │                                                                   │  │
│  │  System: Generates 3 images in parallel                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│                                ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      STEP 4: ADD TEXT                             │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                            │  │  │
│  │  │   Headline                                                 │  │  │
│  │  │   ┌────────────────────────────────────────────────────┐  │  │  │
│  │  │   │ New colors just dropped                            │  │  │  │
│  │  │   └────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                            │  │  │
│  │  │   Subtitle (Product Name)                                  │  │  │
│  │  │   ┌────────────────────────────────────────────────────┐  │  │  │
│  │  │   │ THE ULTRA SOFT HOODIE                              │  │  │  │
│  │  │   └────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                            │  │  │
│  │  │              [ Generate Final Creative ]                   │  │  │
│  │  │                                                            │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  User Actions:                                                    │  │
│  │  - Enter headline text                                            │  │
│  │  - Enter subtitle/product name                                    │  │
│  │  - Click generate                                                 │  │
│  │                                                                   │  │
│  │  Validation: Both fields required, max 50 chars each              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│                                ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   STEP 5: FINAL PREVIEW                           │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                            │  │  │
│  │  │           ┌────────────────────────┐                       │  │  │
│  │  │           │                        │                       │  │  │
│  │  │           │   FINAL COMPOSITE      │                       │  │  │
│  │  │           │   9:16 CREATIVE        │                       │  │  │
│  │  │           │                        │                       │  │  │
│  │  │           │   - Hero image         │                       │  │  │
│  │  │           │   - 3 callouts         │                       │  │  │
│  │  │           │   - Text overlay       │                       │  │  │
│  │  │           │                        │                       │  │  │
│  │  │           └────────────────────────┘                       │  │  │
│  │  │                                                            │  │  │
│  │  │     [ ⬇ Download PNG ]  [ ⬇ Download JPG ]  [ Start Over ] │  │  │
│  │  │                                                            │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  User Actions:                                                    │  │
│  │  - Download final creative                                        │  │
│  │  - Start over for new product                                     │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                               END                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen States

#### Step 1: Upload
| State | UI Display |
|-------|------------|
| Empty | Dropzone with dashed border, upload icon, helper text |
| Dragging | Dropzone highlighted, "Drop to upload" text |
| Uploading | Progress bar, "Uploading..." text |
| Success | Image preview with "Change" button, "Continue" enabled |
| Error | Error message, retry option |

#### Step 2: Hero Generation
| State | UI Display |
|-------|------------|
| Initial | Product preview on left, empty preview area on right |
| Generating | Skeleton loader with progress text |
| Generated | Hero preview with action buttons |
| Regenerating | Previous image dimmed, loading overlay |
| Error | Error message with retry button |

#### Step 3: Callout Generation
| State | UI Display |
|-------|------------|
| Initial | 3 empty placeholder cards |
| Generating | All 3 cards show skeleton loaders |
| Generated | All 3 images displayed with individual regenerate buttons |
| Partial Regen | 1-2 cards regenerating while others show images |

#### Step 4: Text Input
| State | UI Display |
|-------|------------|
| Initial | Empty input fields with placeholder text |
| Filled | Text visible, "Generate" button enabled |
| Validation Error | Red border on empty fields, error message |

#### Step 5: Final Preview
| State | UI Display |
|-------|------------|
| Composing | Full-screen loading state |
| Ready | Large preview with download buttons |
| Downloaded | Success toast, preview remains |

---

### Navigation Rules

1. **Linear Flow** - Users must complete each step before proceeding
2. **Back Navigation** - Users can go back to any previous step
3. **State Preservation** - Going back preserves all generated content
4. **Re-entry** - Returning to a step shows previous results

---

### Error Handling UX

```
┌─────────────────────────────────────────────┐
│  ⚠️  Generation Failed                      │
│                                             │
│  We couldn't generate the image.            │
│  This might be due to content restrictions. │
│                                             │
│  [ Try Again ]  [ Edit Prompt ]             │
└─────────────────────────────────────────────┘
```

**Error Types:**
- **Network Error** → "Connection failed. Please check your internet."
- **API Error** → "Generation service unavailable. Try again shortly."
- **Content Filter** → "Image couldn't be generated. Try a different approach."
- **Rate Limit** → "Too many requests. Please wait X seconds."

---

### Loading States

**Hero Generation:**
```
Generating your creative...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%
This usually takes 15-30 seconds
```

**Callouts Generation:**
```
Generating detail shots... (2/3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 66%
```

**Collage Composition:**
```
Composing your final creative...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 80%
Almost there!
```

---

### Mobile Considerations

- Single column layout on mobile
- Full-width image previews
- Bottom-sticky action buttons
- Touch-friendly dropzone (tap to upload)
- Swipe between steps (optional enhancement)
