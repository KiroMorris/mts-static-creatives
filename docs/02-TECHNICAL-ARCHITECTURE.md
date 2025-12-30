# Technical Architecture Document
## Apparel Creative Generator

---

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | React framework with SSR |
| Styling | Tailwind CSS | Utility-first styling |
| State | Zustand | Lightweight state management |
| Image Upload | react-dropzone | Drag & drop file upload |
| Canvas | Sharp (server) | Image composition/manipulation |
| AI Generation | OpenAI API (GPT-4o / DALL-E 3) | Image generation |
| Storage | Vercel Blob / Local | Temporary image storage |
| Deployment | Vercel | Hosting & serverless functions |

---

### Project Structure

```
apparel-creative-generator/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main app page
│   ├── globals.css
│   └── api/
│       ├── generate-hero/
│       │   └── route.ts            # Hero image generation endpoint
│       ├── generate-callouts/
│       │   └── route.ts            # Callout images generation endpoint
│       ├── compose-collage/
│       │   └── route.ts            # Final collage composition endpoint
│       └── upload/
│           └── route.ts            # Image upload handler
│
├── components/
│   ├── upload/
│   │   └── ProductUploader.tsx     # Drag & drop upload component
│   ├── preview/
│   │   ├── HeroPreview.tsx         # Hero image preview & controls
│   │   ├── CalloutPreview.tsx      # Individual callout preview
│   │   └── CalloutGrid.tsx         # 3 callouts grid view
│   ├── text/
│   │   └── TextInputForm.tsx       # Headline & subtitle inputs
│   ├── collage/
│   │   └── CollagePreview.tsx      # Final composite preview
│   └── ui/
│       ├── Button.tsx
│       ├── Spinner.tsx
│       ├── ProgressSteps.tsx       # Step indicator (1-5)
│       └── ImageCard.tsx
│
├── lib/
│   ├── openai.ts                   # OpenAI client configuration
│   ├── sharp-compose.ts            # Image composition utilities
│   ├── prompts.ts                  # AI prompt templates
│   └── constants.ts                # Dimensions, positions, etc.
│
├── store/
│   └── useCreativeStore.ts         # Zustand store for app state
│
├── types/
│   └── index.ts                    # TypeScript type definitions
│
├── public/
│   └── fonts/                      # Custom fonts for text overlay
│
└── docs/
    ├── 01-PRD.md
    ├── 02-TECHNICAL-ARCHITECTURE.md
    ├── 03-USER-FLOW.md
    ├── 04-API-SPECIFICATION.md
    └── 05-TEMPLATE-SPECIFICATION.md
```

---

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Upload     │→ │  Hero Gen    │→ │  Callouts Gen        │   │
│  │   Component  │  │  Component   │  │  Component           │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│         │                 │                    │                 │
│         ↓                 ↓                    ↓                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Text Input  │→ │  Collage     │→ │  Download            │   │
│  │  Component   │  │  Preview     │  │  Component           │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
│                    ┌────────────────────┐                        │
│                    │   Zustand Store    │                        │
│                    │   (App State)      │                        │
│                    └────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/upload           → Store uploaded product image       │
│  POST /api/generate-hero    → Generate hero lifestyle image      │
│  POST /api/generate-callouts→ Generate 3 detail images          │
│  POST /api/compose-collage  → Composite final image             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ↓                               ↓
┌──────────────────────┐        ┌──────────────────────────┐
│     OpenAI API       │        │     Sharp (Node.js)      │
│  (Image Generation)  │        │  (Image Composition)     │
├──────────────────────┤        ├──────────────────────────┤
│ - DALL-E 3           │        │ - Resize images          │
│ - GPT-4o Vision      │        │ - Composite layers       │
│   (for analysis)     │        │ - Add text overlays      │
└──────────────────────┘        │ - Export final PNG       │
                                └──────────────────────────┘
```

---

### State Management (Zustand Store)

```typescript
interface CreativeStore {
  // Step tracking
  currentStep: 1 | 2 | 3 | 4 | 5;

  // Uploaded product
  productImage: string | null;
  productImageFile: File | null;

  // Generated images
  heroImage: string | null;
  heroPrompt: string;
  calloutImages: {
    detail: string | null;
    fit: string | null;
    pose: string | null;
  };

  // Text content
  headline: string;
  subtitle: string;

  // Final output
  finalCollage: string | null;

  // Loading states
  isGeneratingHero: boolean;
  isGeneratingCallouts: boolean;
  isComposing: boolean;

  // Actions
  setProductImage: (url: string, file: File) => void;
  setHeroImage: (url: string) => void;
  setCalloutImage: (type: 'detail' | 'fit' | 'pose', url: string) => void;
  setText: (headline: string, subtitle: string) => void;
  setFinalCollage: (url: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}
```

---

### Data Flow

#### 1. Upload Flow
```
User drops image → react-dropzone captures File
                → Preview displayed locally (URL.createObjectURL)
                → File uploaded to /api/upload
                → Server stores in temp storage
                → Returns URL for AI processing
```

#### 2. Hero Generation Flow
```
User clicks "Generate" → POST /api/generate-hero
                       → Server builds prompt with product image
                       → Calls OpenAI DALL-E 3 API
                       → Returns generated image URL
                       → Frontend displays preview
                       → User approves or regenerates
```

#### 3. Callouts Generation Flow
```
User clicks "Generate Callouts" → POST /api/generate-callouts
                                → Server generates 3 images in parallel
                                → Returns array of image URLs
                                → Frontend displays grid preview
                                → User can regenerate individual callouts
```

#### 4. Collage Composition Flow
```
User enters text + clicks "Create Collage"
    → POST /api/compose-collage
    → Server uses Sharp to:
        1. Create 1080x1920 canvas
        2. Place hero image as background
        3. Place 3 callouts at fixed positions
        4. Render text at fixed positions
        5. Export as PNG buffer
    → Returns base64 or URL
    → Frontend displays final preview
```

---

### Environment Variables

```env
# .env.local

# OpenAI
OPENAI_API_KEY=sk-...

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Optional: Custom model endpoint
OPENAI_BASE_URL=https://api.openai.com/v1
```

---

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "openai": "^4.0.0",
    "sharp": "^0.33.0",
    "zustand": "^4.0.0",
    "react-dropzone": "^14.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

### Error Handling Strategy

| Error Type | Handling |
|------------|----------|
| Upload failure | Show toast, allow retry |
| AI generation failure | Show error message, allow retry with modified prompt |
| Rate limiting | Show countdown, queue request |
| Composition failure | Log error, show fallback message |
| Network timeout | Auto-retry with exponential backoff (max 3) |

---

### Security Considerations

1. **API Key Protection** - OpenAI key server-side only
2. **File Validation** - Check MIME type, file size on upload
3. **Rate Limiting** - Implement per-IP rate limits on API routes
4. **Image Sanitization** - Process uploads through Sharp to strip metadata
5. **CORS** - Restrict to same-origin for API routes
