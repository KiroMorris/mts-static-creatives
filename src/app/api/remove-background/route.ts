// API Route: Remove Background
// POST /api/remove-background
// Removes background from an uploaded product image

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  removeBackground,
  fetchImageAsBuffer,
  bufferToDataUrl,
  isRemoveBgAvailable,
  getRecommendedProvider,
  BackgroundRemovalProvider,
  BackgroundRemovalOptions,
} from '@/lib/background-removal';

// ============================================================================
// Types
// ============================================================================

interface RemoveBackgroundRequest {
  imageUrl: string;                          // URL of uploaded product image (or data URL)
  imageId?: string;                          // Optional ID for tracking
  provider?: BackgroundRemovalProvider;      // 'removebg', 'imgly', or 'local'
  options?: BackgroundRemovalOptions;
}

interface RemoveBackgroundResponse {
  success: boolean;
  data?: {
    processedImageUrl: string;               // Data URL or public URL of processed image
    processedImageId: string;                // Unique ID for the processed image
    originalBounds?: {                       // Detected object bounds (if available)
      x: number;
      y: number;
      width: number;
      height: number;
    };
    processingTime: number;                  // Time taken in ms
    provider: string;                        // Which provider was used
    creditsUsed?: number;                    // For remove.bg: credits consumed
    creditsRemaining?: number;               // For remove.bg: remaining credits
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
 * Generate unique ID for processed image
 */
function generateImageId(prefix: string = 'bgremoved'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Ensure output directory exists
 */
async function ensureOutputDir(): Promise<string> {
  const outputDir = path.join(process.cwd(), 'public', 'processed');

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  return outputDir;
}

/**
 * Save processed image to public directory
 */
async function saveProcessedImage(buffer: Buffer, imageId: string): Promise<string> {
  const outputDir = await ensureOutputDir();
  const filename = `${imageId}.png`;
  const filePath = path.join(outputDir, filename);

  await writeFile(filePath, buffer);

  return `/processed/${filename}`;
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const req = body as Partial<RemoveBackgroundRequest>;

  if (!req.imageUrl || typeof req.imageUrl !== 'string') {
    return { valid: false, error: 'imageUrl is required' };
  }

  // Validate provider if specified
  if (req.provider && !['removebg', 'imgly', 'local'].includes(req.provider)) {
    return { valid: false, error: 'Invalid provider. Must be "removebg", "imgly", or "local"' };
  }

  return { valid: true };
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<RemoveBackgroundResponse>> {
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
      imageUrl,
      imageId: providedImageId,
      provider: requestedProvider,
      options = {}
    } = body as RemoveBackgroundRequest;

    // Determine which provider to use
    let provider: BackgroundRemovalProvider;
    if (requestedProvider === 'imgly') {
      // imgly runs client-side, so we can't use it here
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PROVIDER',
            message: 'imgly provider runs client-side only. Use the BackgroundRemovalButton component instead.'
          }
        },
        { status: 400 }
      );
    } else if (requestedProvider) {
      provider = requestedProvider;
    } else {
      // Auto-select provider
      provider = isRemoveBgAvailable() ? 'removebg' : 'local';
    }

    // Check if remove.bg is requested but not available
    if (provider === 'removebg' && !isRemoveBgAvailable()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'API_KEY_MISSING',
            message: 'remove.bg API key is not configured. Add REMOVEBG_API_KEY to your .env.local file, or use provider "local" for basic processing.'
          }
        },
        { status: 400 }
      );
    }

    console.log(`[remove-background] Processing with provider: ${provider}`);
    console.log(`[remove-background] Image URL: ${imageUrl.substring(0, 100)}...`);

    // Fetch the original image
    const imageBuffer = await fetchImageAsBuffer(imageUrl);

    // Remove background
    const result = await removeBackground(imageBuffer, provider, options);

    // Generate ID for processed image
    const processedImageId = providedImageId
      ? `bgremoved_${providedImageId}`
      : generateImageId('bgremoved');

    // Save processed image and get URL
    const processedImageUrl = await saveProcessedImage(result.imageBuffer, processedImageId);

    const processingTime = Date.now() - startTime;

    console.log(`[remove-background] Completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        processedImageUrl,
        processedImageId,
        processingTime: result.processingTime,
        provider: result.provider,
        creditsUsed: result.creditsUsed,
        creditsRemaining: result.creditsRemaining
      }
    });

  } catch (error) {
    console.error('[remove-background] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific error types
    if (errorMessage.includes('REMOVEBG_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'API_KEY_MISSING',
            message: errorMessage
          }
        },
        { status: 400 }
      );
    }

    if (errorMessage.includes('remove.bg API error')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROVIDER_ERROR',
            message: errorMessage
          }
        },
        { status: 502 }
      );
    }

    if (errorMessage.includes('fetch')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'IMAGE_FETCH_ERROR',
            message: 'Failed to fetch the source image. Please check the URL.'
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BACKGROUND_REMOVAL_FAILED',
          message: errorMessage
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
  const hasRemoveBg = isRemoveBgAvailable();
  const recommendedProvider = getRecommendedProvider();

  return NextResponse.json({
    endpoint: '/api/remove-background',
    method: 'POST',
    description: 'Remove background from a product image using AI',
    status: {
      removebg: {
        available: hasRemoveBg,
        note: hasRemoveBg
          ? 'remove.bg API is configured and ready'
          : 'Add REMOVEBG_API_KEY to .env.local to enable'
      },
      imgly: {
        available: true,
        note: 'Client-side only - use BackgroundRemovalButton component'
      },
      local: {
        available: true,
        note: 'Basic fallback - adds alpha channel only'
      }
    },
    recommendedProvider,
    parameters: {
      imageUrl: 'string (required) - URL or data URL of image to process',
      imageId: 'string (optional) - Custom ID for tracking',
      provider: `string (optional) - "removebg" | "local" (default: ${recommendedProvider})`,
      options: {
        trimMargin: 'number (optional) - Pixels to add around object',
        outputFormat: 'string (optional) - "png" | "webp"'
      }
    },
    response: {
      processedImageUrl: 'URL of the processed image with transparent background',
      processedImageId: 'Unique ID for the processed image',
      processingTime: 'Time taken in milliseconds',
      provider: 'Which provider was used',
      creditsUsed: 'For remove.bg: credits consumed',
      creditsRemaining: 'For remove.bg: remaining credits'
    },
    documentation: {
      removebg: 'https://www.remove.bg/api',
      imgly: 'https://www.npmjs.com/package/@imgly/background-removal'
    }
  });
}
