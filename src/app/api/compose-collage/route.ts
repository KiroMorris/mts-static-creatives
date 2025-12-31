// API Route: Compose Collage
// POST /api/compose-collage
// Combines hero image, callouts, and text into final 1080x1920 creative

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  composeCollage,
  fetchImageAsBuffer,
  bufferToBase64DataUrl,
  validateImageDimensions
} from '@/lib/sharp-compose';

// ============================================================================
// Types
// ============================================================================

interface ComposeCollageRequest {
  heroImageUrl: string;
  callouts: {
    detail: string;
    fit: string;
    pose: string;
  };
  text: {
    headline: string;
    subtitle: string;
  };
  heroStyle?: {
    zoom: number;
    focusX: number;
    focusY: number;
  };
  textStyle?: {
    headlineFontSize: number;
    headlineColor: string;
    headlineShadow: boolean;
    headlineX: number;
    headlineY: number;
    subtitleFontSize: number;
    subtitleColor: string;
    subtitleLetterSpacing: number;
    subtitleGap: number;
  };
  calloutStyle?: {
    size: number;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    gap: number;
    x: number;
    y: number;
    zoom: number;
  };
  outputFormat?: 'base64' | 'file';
  fileFormat?: 'png' | 'jpeg' | 'webp';
}

interface ComposeCollageResponse {
  success: boolean;
  data?: {
    collageUrl: string;
    collageId: string;
    dimensions: { width: number; height: number };
    downloadUrl: string;
    compositionTime: number;
    format: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique ID for collage
 */
function generateCollageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `collage_${timestamp}_${random}`;
}

/**
 * Ensure output directory exists
 */
async function ensureOutputDir(): Promise<string> {
  const outputDir = path.join(process.cwd(), 'public', 'generated');

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  return outputDir;
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const req = body as Partial<ComposeCollageRequest>;

  if (!req.heroImageUrl || typeof req.heroImageUrl !== 'string') {
    return { valid: false, error: 'heroImageUrl is required' };
  }

  if (!req.callouts || typeof req.callouts !== 'object') {
    return { valid: false, error: 'callouts object is required' };
  }

  if (!req.callouts.detail || !req.callouts.fit || !req.callouts.pose) {
    return { valid: false, error: 'All three callout URLs (detail, fit, pose) are required' };
  }

  if (!req.text || typeof req.text !== 'object') {
    return { valid: false, error: 'text object is required' };
  }

  if (!req.text.headline || typeof req.text.headline !== 'string') {
    return { valid: false, error: 'text.headline is required' };
  }

  if (!req.text.subtitle || typeof req.text.subtitle !== 'string') {
    return { valid: false, error: 'text.subtitle is required' };
  }

  return { valid: true };
}

/**
 * Check if URL is a data URL (base64)
 */
function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Convert data URL to buffer
 */
function dataUrlToBuffer(dataUrl: string): Buffer {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  return Buffer.from(matches[2], 'base64');
}

/**
 * Fetch image from URL or convert from data URL
 */
async function getImageBuffer(url: string): Promise<Buffer> {
  if (isDataUrl(url)) {
    return dataUrlToBuffer(url);
  }

  // Handle local URLs (starting with /) by prepending base URL
  let fullUrl = url;
  if (url.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    fullUrl = `${baseUrl}${url}`;
  }

  return fetchImageAsBuffer(fullUrl);
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<ComposeCollageResponse>> {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error || 'Invalid request'
          }
        },
        { status: 400 }
      );
    }

    const {
      heroImageUrl,
      callouts,
      text,
      heroStyle,
      textStyle,
      calloutStyle,
      outputFormat = 'base64',
      fileFormat = 'png'
    } = body as ComposeCollageRequest;

    // Fetch all images in parallel
    const [heroBuffer, detailBuffer, fitBuffer, poseBuffer] = await Promise.all([
      getImageBuffer(heroImageUrl),
      getImageBuffer(callouts.detail),
      getImageBuffer(callouts.fit),
      getImageBuffer(callouts.pose)
    ]);

    // Validate hero image dimensions
    const heroValidation = await validateImageDimensions(heroBuffer, 500, 500);
    if (!heroValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'IMAGE_TOO_SMALL',
            message: heroValidation.error || 'Hero image is too small'
          }
        },
        { status: 400 }
      );
    }

    // Debug: Log the style values being used
    console.log('=== COMPOSE COLLAGE DEBUG ===');
    console.log('textStyle:', JSON.stringify(textStyle, null, 2));
    console.log('calloutStyle:', JSON.stringify(calloutStyle, null, 2));
    console.log('heroStyle:', JSON.stringify(heroStyle, null, 2));

    // Compose the collage with styles
    const collageBuffer = await composeCollage({
      heroImageBuffer: heroBuffer,
      calloutBuffers: {
        detail: detailBuffer,
        fit: fitBuffer,
        pose: poseBuffer
      },
      text: {
        headline: text.headline,
        subtitle: text.subtitle
      },
      heroStyle,
      textStyle,
      calloutStyle
    });

    const collageId = generateCollageId();
    const compositionTime = Date.now() - startTime;

    // Handle output format
    if (outputFormat === 'file') {
      // Save to file system
      const outputDir = await ensureOutputDir();
      const extension = fileFormat === 'jpeg' ? 'jpg' : fileFormat;
      const filename = `${collageId}.${extension}`;
      const filePath = path.join(outputDir, filename);

      await writeFile(filePath, collageBuffer);

      const publicUrl = `/generated/${filename}`;

      return NextResponse.json({
        success: true,
        data: {
          collageUrl: publicUrl,
          collageId,
          dimensions: { width: 1080, height: 1920 },
          downloadUrl: publicUrl,
          compositionTime,
          format: fileFormat
        }
      });
    } else {
      // Return as base64
      const mimeType = fileFormat === 'jpeg' ? 'image/jpeg' : `image/${fileFormat}`;
      const base64Url = bufferToBase64DataUrl(collageBuffer, mimeType);

      return NextResponse.json({
        success: true,
        data: {
          collageUrl: base64Url,
          collageId,
          dimensions: { width: 1080, height: 1920 },
          downloadUrl: base64Url,
          compositionTime,
          format: fileFormat
        }
      });
    }
  } catch (error) {
    console.error('Collage composition error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific error types
    if (errorMessage.includes('fetch')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'IMAGE_FETCH_ERROR',
            message: 'Failed to fetch one or more images. Please check the URLs.'
          }
        },
        { status: 400 }
      );
    }

    if (errorMessage.includes('sharp') || errorMessage.includes('image')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'IMAGE_PROCESSING_ERROR',
            message: 'Failed to process images. Please ensure all images are valid.'
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during composition'
        }
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - Health Check / Info
// ============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/compose-collage',
    method: 'POST',
    description: 'Compose a 1080x1920 creative collage from hero image, callouts, and text',
    parameters: {
      heroImageUrl: 'string (URL or base64 data URL)',
      callouts: {
        detail: 'string (URL or base64 data URL)',
        fit: 'string (URL or base64 data URL)',
        pose: 'string (URL or base64 data URL)'
      },
      text: {
        headline: 'string (main headline text)',
        subtitle: 'string (product subtitle)'
      },
      outputFormat: 'optional: "base64" (default) | "file"',
      fileFormat: 'optional: "png" (default) | "jpeg" | "webp"'
    },
    output: {
      dimensions: '1080x1920',
      formats: ['png', 'jpeg', 'webp']
    }
  });
}
