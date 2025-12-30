# Template Specification Document
## Apparel Creative Generator

---

### Canvas Specifications

| Property | Value |
|----------|-------|
| Output Width | 1080px |
| Output Height | 1920px |
| Aspect Ratio | 9:16 |
| Color Space | sRGB |
| Output Format | PNG (lossless) or JPG (quality: 90) |

---

### Layout Blueprint

```
┌────────────────────────────────────────┐  0px
│                                        │
│                                        │
│                                        │
│              HERO IMAGE                │
│          (Full bleed background)       │
│                                        │
│                                        │
│                                        │
│   ┌────────────────────────────────    │
│   │                                    │
│   │  HEADLINE TEXT                     │  ~820px from top
│   │  "New colors"                      │
│   │  "just dropped"                    │
│   │                                    │
│   │  SUBTITLE TEXT                     │  ~980px from top
│   │  "THE ULTRA SOFT HOODIE"           │
│   │                                    │
│   └────────────────────────────────    │
│                                        │
│   ┌─────────────┐                      │
│   │  CALLOUT 1  │                      │  ~1100px from top
│   │  (Detail)   │                      │
│   │  280x350    │                      │
│   └─────────────┘                      │
│   ┌─────────────┐                      │
│   │  CALLOUT 2  │                      │  ~1470px from top
│   │  (Fit)      │                      │
│   │  280x350    │                      │
│   └─────────────┘                      │
│   ┌─────────────┐                      │
│   │  CALLOUT 3  │                      │  (partially visible)
│   │  (Pose)     │                      │
│   │  280x350    │                      │
│   └─────────────┘                      │
│                                        │
└────────────────────────────────────────┘  1920px
```

---

### Exact Positioning (Pixels)

#### Hero Image
```typescript
const heroPosition = {
  x: 0,
  y: 0,
  width: 1080,
  height: 1920,
  fit: 'cover',      // Scale to fill, crop excess
  anchor: 'center'   // Center the crop
};
```

#### Headline Text
```typescript
const headlineStyle = {
  x: 48,                    // Left padding
  y: 820,                   // From top
  maxWidth: 600,            // Text wrap width
  fontFamily: 'Inter',      // Or similar sans-serif
  fontSize: 72,             // Primary size
  fontWeight: 700,          // Bold
  lineHeight: 1.1,          // Tight line height
  color: '#FFFFFF',
  textShadow: {
    offsetX: 0,
    offsetY: 2,
    blur: 8,
    color: 'rgba(0, 0, 0, 0.3)'
  }
};
```

#### Subtitle Text
```typescript
const subtitleStyle = {
  x: 48,
  y: 980,                   // Below headline
  maxWidth: 600,
  fontFamily: 'Inter',
  fontSize: 18,
  fontWeight: 500,
  letterSpacing: 3,         // Spaced out caps
  textTransform: 'uppercase',
  color: '#FFFFFF',
  opacity: 0.9
};
```

#### Callout Images
```typescript
const calloutPositions = {
  callout1: {
    x: 48,
    y: 1100,
    width: 280,
    height: 350,
    borderRadius: 8
  },
  callout2: {
    x: 48,
    y: 1470,              // callout1.y + callout1.height + 20px gap
    width: 280,
    height: 350,
    borderRadius: 8
  },
  callout3: {
    x: 48,
    y: 1840,              // Partially off-canvas (intentional)
    width: 280,
    height: 350,
    borderRadius: 8
  }
};

// Gap between callouts: 20px
```

---

### Typography Specifications

#### Headline Font
```css
/* Primary headline */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
font-size: 72px;
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.02em;
color: #FFFFFF;

/* Text shadow for readability */
text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

#### Subtitle Font
```css
/* Subtitle / Product name */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
font-size: 18px;
font-weight: 500;
line-height: 1.4;
letter-spacing: 0.15em;
text-transform: uppercase;
color: rgba(255, 255, 255, 0.9);
```

---

### Sharp.js Composition Code

```typescript
// lib/sharp-compose.ts

import sharp from 'sharp';
import path from 'path';

interface ComposeOptions {
  heroImageBuffer: Buffer;
  calloutBuffers: {
    detail: Buffer;
    fit: Buffer;
    pose: Buffer;
  };
  text: {
    headline: string;
    subtitle: string;
  };
}

// Canvas dimensions
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

// Callout dimensions
const CALLOUT_WIDTH = 280;
const CALLOUT_HEIGHT = 350;
const CALLOUT_GAP = 20;
const CALLOUT_X = 48;
const CALLOUT_START_Y = 1100;
const CALLOUT_RADIUS = 8;

// Text positions
const TEXT_X = 48;
const HEADLINE_Y = 820;
const SUBTITLE_Y = 980;

export async function composeCollage(options: ComposeOptions): Promise<Buffer> {
  const { heroImageBuffer, calloutBuffers, text } = options;

  // 1. Resize hero to fill canvas
  const heroResized = await sharp(heroImageBuffer)
    .resize(CANVAS_WIDTH, CANVAS_HEIGHT, {
      fit: 'cover',
      position: 'center'
    })
    .toBuffer();

  // 2. Prepare callout images with rounded corners
  const callout1 = await prepareCallout(calloutBuffers.detail);
  const callout2 = await prepareCallout(calloutBuffers.fit);
  const callout3 = await prepareCallout(calloutBuffers.pose);

  // 3. Create text overlay as SVG
  const textOverlay = createTextSVG(text.headline, text.subtitle);

  // 4. Composite all layers
  const composite = await sharp(heroResized)
    .composite([
      // Text overlay
      {
        input: Buffer.from(textOverlay),
        top: 0,
        left: 0
      },
      // Callout 1
      {
        input: callout1,
        top: CALLOUT_START_Y,
        left: CALLOUT_X
      },
      // Callout 2
      {
        input: callout2,
        top: CALLOUT_START_Y + CALLOUT_HEIGHT + CALLOUT_GAP,
        left: CALLOUT_X
      },
      // Callout 3
      {
        input: callout3,
        top: CALLOUT_START_Y + (CALLOUT_HEIGHT + CALLOUT_GAP) * 2,
        left: CALLOUT_X
      }
    ])
    .png()
    .toBuffer();

  return composite;
}

async function prepareCallout(buffer: Buffer): Promise<Buffer> {
  // Create rounded rectangle mask
  const roundedMask = Buffer.from(
    `<svg width="${CALLOUT_WIDTH}" height="${CALLOUT_HEIGHT}">
      <rect
        width="${CALLOUT_WIDTH}"
        height="${CALLOUT_HEIGHT}"
        rx="${CALLOUT_RADIUS}"
        ry="${CALLOUT_RADIUS}"
        fill="white"
      />
    </svg>`
  );

  return sharp(buffer)
    .resize(CALLOUT_WIDTH, CALLOUT_HEIGHT, {
      fit: 'cover',
      position: 'center'
    })
    .composite([
      {
        input: roundedMask,
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();
}

function createTextSVG(headline: string, subtitle: string): string {
  // Split headline into lines if needed (max ~15 chars per line for this font size)
  const headlineLines = wrapText(headline, 15);

  const headlineY = HEADLINE_Y;
  const lineHeight = 80; // 72px font + spacing

  const headlineSVG = headlineLines.map((line, i) => `
    <text
      x="${TEXT_X}"
      y="${headlineY + (i * lineHeight)}"
      font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
      font-size="72"
      font-weight="700"
      fill="white"
      style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
    >${escapeXml(line)}</text>
  `).join('');

  const subtitleYPos = headlineY + (headlineLines.length * lineHeight) + 20;

  return `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&amp;display=swap');
        </style>
      </defs>

      ${headlineSVG}

      <text
        x="${TEXT_X}"
        y="${subtitleYPos}"
        font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        font-size="18"
        font-weight="500"
        letter-spacing="3"
        fill="rgba(255,255,255,0.9)"
      >${escapeXml(subtitle.toUpperCase())}</text>
    </svg>
  `;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

---

### Constants File

```typescript
// lib/constants.ts

export const TEMPLATE = {
  // Canvas
  canvas: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16'
  },

  // Hero image
  hero: {
    x: 0,
    y: 0,
    width: 1080,
    height: 1920
  },

  // Text positioning
  text: {
    paddingLeft: 48,
    headline: {
      y: 820,
      fontSize: 72,
      fontWeight: 700,
      lineHeight: 80,
      maxWidth: 600,
      color: '#FFFFFF'
    },
    subtitle: {
      yOffset: 20,  // Below last headline line
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: 3,
      color: 'rgba(255, 255, 255, 0.9)'
    }
  },

  // Callouts
  callouts: {
    x: 48,
    startY: 1100,
    width: 280,
    height: 350,
    gap: 20,
    borderRadius: 8
  }
} as const;

export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_IMAGE_DIMENSION = 500;
```

---

### Visual Reference Overlay

```
┌─────────────────────────────────────────────────────────────────┐
│                          1080px                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │                      HERO IMAGE                          │   │
│  │                    (covers entire canvas)                │   │
│  │                                                          │   │
│  │   48px                                                   │   │
│  │   ┌──┐                                                   │   │
│  │   │  │  ← padding from left edge                         │   │
│  │   └──┘                                                   │   │  1920px
│  │        ┌───────────────────────────────────────────────  │   │
│  │   820px│  "New colors"         ← Headline line 1         │   │
│  │        │  "just dropped"       ← Headline line 2         │   │
│  │        │                                                 │   │
│  │   980px│  THE ULTRA SOFT HOODIE  ← Subtitle              │   │
│  │        └───────────────────────────────────────────────  │   │
│  │                                                          │   │
│  │  1100px ┌─────────────┐                                  │   │
│  │         │  280x350    │ ← Callout 1                      │   │
│  │         └─────────────┘                                  │   │
│  │         20px gap                                         │   │
│  │  1470px ┌─────────────┐                                  │   │
│  │         │  280x350    │ ← Callout 2                      │   │
│  │         └─────────────┘                                  │   │
│  │         20px gap                                         │   │
│  │  1840px ┌─────────────┐                                  │   │
│  │         │  280x350    │ ← Callout 3 (80px off-canvas)    │   │
│  │         └─────────────┘                                  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Callout Border/Shadow (Optional Enhancement)

```typescript
// Optional: Add subtle border and shadow to callouts
const calloutWithBorder = await sharp(calloutBuffer)
  .resize(CALLOUT_WIDTH, CALLOUT_HEIGHT)
  .extend({
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
    background: { r: 255, g: 255, b: 255, alpha: 0.2 }
  })
  // Apply shadow
  .blur(0.5)
  .toBuffer();
```

---

### Font Loading for Server-Side Rendering

Since Sharp uses SVG for text, and SVG on server may not have fonts:

**Option 1: Embed font as base64 in SVG**
```typescript
// Pre-convert font to base64
const interFontBase64 = fs.readFileSync('./public/fonts/Inter-Bold.woff2').toString('base64');

const svgWithEmbeddedFont = `
  <svg>
    <defs>
      <style>
        @font-face {
          font-family: 'Inter';
          src: url(data:font/woff2;base64,${interFontBase64}) format('woff2');
          font-weight: 700;
        }
      </style>
    </defs>
    ...
  </svg>
`;
```

**Option 2: Pre-render text as image**
```typescript
// Use canvas library to render text, then composite
import { createCanvas } from 'canvas';

const canvas = createCanvas(600, 200);
const ctx = canvas.getContext('2d');
ctx.font = '700 72px Inter';
ctx.fillStyle = 'white';
ctx.fillText('New colors', 0, 72);
ctx.fillText('just dropped', 0, 152);

const textBuffer = canvas.toBuffer('image/png');
```

---

### Export Options

```typescript
// PNG Export (Lossless, larger file)
const pngBuffer = await sharp(compositeBuffer)
  .png({ quality: 100, compressionLevel: 6 })
  .toBuffer();

// JPG Export (Smaller file, slight quality loss)
const jpgBuffer = await sharp(compositeBuffer)
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer();

// WebP Export (Best compression, modern format)
const webpBuffer = await sharp(compositeBuffer)
  .webp({ quality: 90 })
  .toBuffer();
```
