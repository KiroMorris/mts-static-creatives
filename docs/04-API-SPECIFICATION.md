# API Specification Document
## Apparel Creative Generator

---

### Base URL
```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

---

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload product image |
| POST | `/generate-hero` | Generate hero lifestyle image |
| POST | `/generate-callouts` | Generate 3 callout detail images |
| POST | `/regenerate-callout` | Regenerate single callout |
| POST | `/compose-collage` | Create final composite image |

---

## POST /api/upload

Upload a product image for processing.

### Request
```typescript
// Content-Type: multipart/form-data

{
  file: File  // The product image file
}
```

### Response
```typescript
// 200 OK
{
  success: true,
  data: {
    imageUrl: string,      // URL to access uploaded image
    imageId: string,       // Unique identifier for this image
    dimensions: {
      width: number,
      height: number
    },
    fileSize: number       // In bytes
  }
}

// 400 Bad Request
{
  success: false,
  error: {
    code: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "NO_FILE",
    message: string
  }
}
```

### Validation Rules
- Allowed types: `image/jpeg`, `image/png`, `image/webp`
- Max file size: 10MB
- Min dimensions: 500x500px

---

## POST /api/generate-hero

Generate a lifestyle hero image with model wearing the uploaded product.

### Request
```typescript
// Content-Type: application/json

{
  productImageUrl: string,     // URL from upload response
  productImageId: string,      // ID from upload response
  customPrompt?: string,       // Optional: override default prompt
  style?: {
    modelGender?: "female" | "male" | "neutral",
    setting?: "studio" | "outdoor" | "lifestyle",
    mood?: "casual" | "professional" | "energetic"
  }
}
```

### Response
```typescript
// 200 OK
{
  success: true,
  data: {
    heroImageUrl: string,      // Generated hero image URL
    heroImageId: string,       // Unique ID for this generation
    promptUsed: string,        // The actual prompt sent to AI
    generationTime: number     // Time in milliseconds
  }
}

// 400 Bad Request
{
  success: false,
  error: {
    code: "INVALID_IMAGE" | "GENERATION_FAILED" | "CONTENT_FILTERED",
    message: string
  }
}

// 429 Too Many Requests
{
  success: false,
  error: {
    code: "RATE_LIMITED",
    message: string,
    retryAfter: number  // Seconds to wait
  }
}
```

### AI Prompt Template (Default)
```
Generate a professional fashion photography image of a young attractive
model wearing this [PRODUCT_TYPE] in [PRODUCT_COLOR].

Style: Editorial fashion photography
Pose: Relaxed, lifestyle pose with one arm raised
Setting: Neutral indoor setting with soft natural lighting
Framing: Portrait orientation (9:16), model from waist up
Quality: High-end fashion campaign quality, sharp focus

The model should be looking at camera with a natural expression.
Maintain exact color and design details of the garment.
```

---

## POST /api/generate-callouts

Generate 3 detail/feature callout images.

### Request
```typescript
// Content-Type: application/json

{
  productImageUrl: string,
  heroImageUrl: string,        // Reference for style consistency
  heroImageId: string,
  types?: ["detail", "fit", "pose"]  // Which callouts to generate
}
```

### Response
```typescript
// 200 OK
{
  success: true,
  data: {
    callouts: [
      {
        type: "detail",
        imageUrl: string,
        imageId: string,
        promptUsed: string
      },
      {
        type: "fit",
        imageUrl: string,
        imageId: string,
        promptUsed: string
      },
      {
        type: "pose",
        imageUrl: string,
        imageId: string,
        promptUsed: string
      }
    ],
    totalGenerationTime: number
  }
}
```

### Callout Prompt Templates

**Detail (Texture/Fabric):**
```
Close-up fashion photography shot focusing on the fabric texture and
quality of a [PRODUCT_COLOR] [PRODUCT_TYPE].

Show: Soft cotton/fleece texture, stitching quality
Framing: Tight crop on shoulder/chest area
Lighting: Soft diffused light to show fabric texture
Style: Match the aesthetic of the reference hero image
```

**Fit (Body/Torso):**
```
Fashion photography showing the fit of a [PRODUCT_COLOR] [PRODUCT_TYPE]
on the same model from the hero image.

Show: Cropped view of torso/waist area, showing how garment fits
Framing: Mid-body crop, casual pose
Include: Small glimpse of skin at waistline for fit reference
Style: Relaxed, authentic lifestyle feel
```

**Pose (Alternative Angle):**
```
Alternative lifestyle shot of the same model wearing the
[PRODUCT_COLOR] [PRODUCT_TYPE].

Pose: Different angle - lying down, looking up at camera
Expression: Relaxed, content
Framing: Head and upper body visible
Style: Intimate, authentic lifestyle photography
```

---

## POST /api/regenerate-callout

Regenerate a single callout image.

### Request
```typescript
// Content-Type: application/json

{
  calloutType: "detail" | "fit" | "pose",
  productImageUrl: string,
  heroImageUrl: string,
  customPrompt?: string  // Optional override
}
```

### Response
```typescript
// 200 OK
{
  success: true,
  data: {
    type: string,
    imageUrl: string,
    imageId: string,
    promptUsed: string,
    generationTime: number
  }
}
```

---

## POST /api/compose-collage

Compose all elements into final 9:16 creative.

### Request
```typescript
// Content-Type: application/json

{
  heroImageUrl: string,
  callouts: {
    detail: string,   // URLs
    fit: string,
    pose: string
  },
  text: {
    headline: string,      // e.g., "New colors just dropped"
    subtitle: string       // e.g., "THE ULTRA SOFT HOODIE"
  },
  outputFormat?: "png" | "jpg",
  outputQuality?: number   // 1-100, default 90
}
```

### Response
```typescript
// 200 OK
{
  success: true,
  data: {
    collageUrl: string,        // Final image URL
    collageId: string,
    dimensions: {
      width: 1080,
      height: 1920
    },
    downloadUrl: string,       // Direct download link
    compositionTime: number
  }
}

// 400 Bad Request
{
  success: false,
  error: {
    code: "MISSING_IMAGES" | "INVALID_TEXT" | "COMPOSITION_FAILED",
    message: string
  }
}
```

---

### Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_TYPE` | 400 | Uploaded file is not a supported image format |
| `FILE_TOO_LARGE` | 400 | File exceeds 10MB limit |
| `NO_FILE` | 400 | No file provided in upload |
| `INVALID_IMAGE` | 400 | Image URL is invalid or inaccessible |
| `GENERATION_FAILED` | 500 | AI failed to generate image |
| `CONTENT_FILTERED` | 400 | Content was rejected by AI safety filters |
| `RATE_LIMITED` | 429 | Too many requests, slow down |
| `MISSING_IMAGES` | 400 | Required images not provided for composition |
| `INVALID_TEXT` | 400 | Text validation failed |
| `COMPOSITION_FAILED` | 500 | Image composition process failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/upload` | 20 requests/minute |
| `/generate-hero` | 10 requests/minute |
| `/generate-callouts` | 10 requests/minute |
| `/regenerate-callout` | 20 requests/minute |
| `/compose-collage` | 30 requests/minute |

---

### TypeScript Types

```typescript
// types/api.ts

export interface UploadResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    imageId: string;
    dimensions: { width: number; height: number };
    fileSize: number;
  };
  error?: ApiError;
}

export interface HeroGenerationResponse {
  success: boolean;
  data?: {
    heroImageUrl: string;
    heroImageId: string;
    promptUsed: string;
    generationTime: number;
  };
  error?: ApiError;
}

export interface CalloutsGenerationResponse {
  success: boolean;
  data?: {
    callouts: CalloutImage[];
    totalGenerationTime: number;
  };
  error?: ApiError;
}

export interface CalloutImage {
  type: 'detail' | 'fit' | 'pose';
  imageUrl: string;
  imageId: string;
  promptUsed: string;
}

export interface CollageResponse {
  success: boolean;
  data?: {
    collageUrl: string;
    collageId: string;
    dimensions: { width: number; height: number };
    downloadUrl: string;
    compositionTime: number;
  };
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  retryAfter?: number;
}
```
