// Canvas and template constants

export const TEMPLATE = {
  // Canvas
  canvas: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
  },

  // Hero image (full bleed background)
  hero: {
    x: 0,
    y: 0,
    width: 1080,
    height: 1920,
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
      color: '#FFFFFF',
    },
    subtitle: {
      yOffset: 20,
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: 3,
      color: 'rgba(255, 255, 255, 0.9)',
    },
  },

  // Callouts (1:1 square with white border)
  callouts: {
    x: 48,
    startY: 1000,
    width: 200,
    height: 200,
    gap: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
} as const;

// File upload constraints
export const UPLOAD = {
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  minImageDimension: 500,
} as const;

// API endpoints
export const API = {
  upload: '/api/upload',
  generateHero: '/api/generate-hero',
  generateCallouts: '/api/generate-callouts',
  regenerateCallout: '/api/regenerate-callout',
  composeCollage: '/api/compose-collage',
} as const;

// Step labels
export const STEPS = [
  { number: 1, label: 'Upload', description: 'Upload product image' },
  { number: 2, label: 'Style', description: 'Customize appearance' },
  { number: 3, label: 'Hero', description: 'Generate hero image' },
  { number: 4, label: 'Callouts', description: 'Generate detail shots' },
  { number: 5, label: 'Text', description: 'Add headline & subtitle' },
  { number: 6, label: 'Export', description: 'Download your creative' },
] as const;
