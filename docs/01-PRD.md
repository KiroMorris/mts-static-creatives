# Product Requirements Document (PRD)
## Apparel Creative Generator

### Overview
A Next.js web application that generates social media ad creatives for apparel brands. Users upload a hoodie/sweatshirt product image and the app generates a complete 9:16 ad creative with AI-generated lifestyle imagery.

---

### Problem Statement
Creating professional social media ad creatives requires:
- Hiring models and photographers
- Expensive photo shoots
- Design skills for composition and layout
- Time-consuming editing process

This tool automates the entire process using AI image generation.

---

### Target Users
- DTC apparel brands
- Shopify store owners
- Social media marketers
- Small fashion businesses

---

### Core User Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. UPLOAD                                              │
│     User uploads flat product image (hoodie/sweatshirt) │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. GENERATE HERO IMAGE                                 │
│     AI generates lifestyle hero shot (model wearing     │
│     the product) in portrait orientation                │
│                                                         │
│     User can: ✓ Approve  ↻ Regenerate  ✎ Edit prompt   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. GENERATE 3 CALLOUT IMAGES                           │
│     AI generates 3 detail/feature close-up shots:       │
│     - Texture/fabric detail                             │
│     - Fit detail (cropped body shot)                    │
│     - Alternative pose/angle                            │
│                                                         │
│     User can: ✓ Approve  ↻ Regenerate individual       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. ADD TEXT                                            │
│     User inputs:                                        │
│     - Headline (e.g., "New colors just dropped")        │
│     - Subtitle (e.g., "THE ULTRA SOFT HOODIE")          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  5. GENERATE FINAL COLLAGE                              │
│     System composites all elements into final 9:16      │
│     creative matching the reference layout              │
│                                                         │
│     User can: ⬇ Download  ↻ Adjust                     │
└─────────────────────────────────────────────────────────┘
```

---

### Final Output Specification

**Format:** Single 9:16 image (1080x1920 pixels)

**Layout:**
```
┌────────────────────────────────┐
│                                │
│         HERO IMAGE             │
│      (model wearing hoodie)    │
│                                │
│   ┌─────────────────────────   │
│   │ "New colors              │ │
│   │  just dropped"           │ │
│   │                          │ │
│   │ THE ULTRA SOFT HOODIE    │ │
│   └─────────────────────────   │
│                                │
│   ┌──────────┐                 │
│   │ Callout 1│                 │
│   │ (detail) │                 │
│   └──────────┘                 │
│   ┌──────────┐                 │
│   │ Callout 2│                 │
│   │ (fit)    │                 │
│   └──────────┘                 │
│   ┌──────────┐                 │
│   │ Callout 3│                 │
│   │ (pose)   │                 │
│   └──────────┘                 │
│                                │
└────────────────────────────────┘
```

---

### Functional Requirements

#### FR-1: Image Upload
- Accept JPG, PNG, WebP formats
- Max file size: 10MB
- Preview uploaded image before processing
- Validate image is a product photo

#### FR-2: Hero Image Generation
- Generate lifestyle image with model wearing the uploaded product
- Output resolution: 1080x1920 (9:16)
- Maintain product color accuracy
- Allow regeneration with same or modified prompt
- Store generation history for session

#### FR-3: Callout Image Generation
- Generate 3 distinct detail images
- Each callout: 300x400 pixels (approximate)
- Types:
  1. Texture/fabric close-up
  2. Fit detail (body/torso focus)
  3. Alternative lifestyle pose
- Allow individual regeneration

#### FR-4: Text Overlay
- Headline: Large, bold, left-aligned
- Subtitle: Smaller, caps, letter-spaced
- Fixed positioning matching reference
- White text with subtle shadow for readability

#### FR-5: Collage Composition
- Composite all elements programmatically
- Fixed template layout (no drag-and-drop needed for MVP)
- Export as high-quality PNG/JPG

#### FR-6: Download
- Download final composite image
- Option to download individual generated images

---

### Non-Functional Requirements

#### NFR-1: Performance
- Hero generation: < 30 seconds
- Callout generation: < 20 seconds each
- Collage composition: < 5 seconds

#### NFR-2: Quality
- Generated images should be photorealistic
- Consistent model appearance across all images
- Professional composition and lighting

#### NFR-3: Usability
- Single-page app flow (no page reloads)
- Clear progress indicators during generation
- Mobile-responsive design

---

### MVP Scope

**In Scope:**
- Single product type (hoodies/sweatshirts)
- One template layout (reference design)
- Basic text customization (content only)
- OpenAI/DALL-E or similar for generation

**Out of Scope (Future):**
- Multiple template layouts
- Multiple product types (t-shirts, pants, etc.)
- Custom font selection
- Brand kit integration
- Batch generation
- User accounts/saved projects

---

### Success Metrics
- Time to create one complete creative: < 3 minutes
- User satisfaction with generated quality
- Successful generation rate > 90%
