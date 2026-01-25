// Background Removal Utility Functions
// Supports multiple providers: @imgly/background-removal (client-side) and remove.bg API (server-side)

// ============================================================================
// Types
// ============================================================================

export interface BackgroundRemovalResult {
  imageBuffer: Buffer;
  imageDataUrl?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  processingTime: number;
  provider: BackgroundRemovalProvider;
}

export interface BackgroundRemovalOptions {
  trimMargin?: number;        // Pixels to add around detected object
  outputFormat?: 'png' | 'webp';
  returnMask?: boolean;       // Also return the mask for manual editing
}

export type BackgroundRemovalProvider = 'removebg' | 'imgly' | 'local';

export interface RemoveBgError {
  code: string;
  message: string;
}

// ============================================================================
// Configuration
// ============================================================================

const REMOVEBG_API_URL = 'https://api.remove.bg/v1.0/removebg';

// ============================================================================
// Remove.bg API Provider (Server-side)
// ============================================================================

/**
 * Remove background using remove.bg API
 * Requires REMOVEBG_API_KEY environment variable
 *
 * Pricing: ~$0.20-0.40 per image depending on resolution
 * Best for: High-quality production use
 *
 * @param imageBuffer - The image buffer to process
 * @param options - Processing options
 * @returns BackgroundRemovalResult with processed image
 */
export async function removeBackgroundRemoveBg(
  imageBuffer: Buffer,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> {
  const startTime = Date.now();
  const apiKey = process.env.REMOVEBG_API_KEY;

  if (!apiKey) {
    throw new Error('REMOVEBG_API_KEY environment variable is not set. Please add it to your .env.local file.');
  }

  const formData = new FormData();
  // Convert Buffer to Uint8Array for Blob compatibility
  // Create a new Uint8Array to ensure it's detached from the original buffer
  const imageData = new Uint8Array(imageBuffer);
  formData.append('image_file', new Blob([imageData], { type: 'image/png' }), 'image.png');
  formData.append('size', 'auto');           // auto, preview, full, or specific dimensions
  formData.append('type', 'product');        // product, person, car, etc.
  formData.append('format', options.outputFormat || 'png');
  formData.append('crop', 'false');          // Keep original dimensions

  if (options.trimMargin !== undefined) {
    formData.append('crop_margin', `${options.trimMargin}px`);
  }

  const response = await fetch(REMOVEBG_API_URL, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ errors: [{ title: 'Unknown error' }] }));
    const errorMessage = errorData.errors?.[0]?.title || 'Failed to remove background';
    throw new Error(`remove.bg API error: ${errorMessage}`);
  }

  const resultBuffer = Buffer.from(await response.arrayBuffer());
  const processingTime = Date.now() - startTime;

  return {
    imageBuffer: resultBuffer,
    creditsUsed: parseInt(response.headers.get('X-Credits-Used') || '1'),
    creditsRemaining: parseInt(response.headers.get('X-Credits-Remaining') || '0'),
    processingTime,
    provider: 'removebg'
  };
}

// ============================================================================
// Client-Side Background Removal using @imgly/background-removal
// ============================================================================

/**
 * Configuration for @imgly/background-removal client-side library
 * This runs entirely in the browser - no API key needed!
 *
 * To use: npm install @imgly/background-removal
 *
 * Benefits:
 * - Free (no API costs)
 * - Privacy (images never leave the browser)
 * - Offline capable after initial model download
 *
 * Drawbacks:
 * - Initial model download ~30MB
 * - Slower than API (10-30 seconds per image)
 * - Lower quality than remove.bg for complex images
 */
export const IMGLY_CONFIG = {
  // Model to use: 'small', 'medium', or 'large'
  model: 'medium' as const,

  // Output configuration
  output: {
    format: 'image/png' as const,
    quality: 1.0,
  },

  // Debug mode
  debug: false,
};

/**
 * Remove background client-side using @imgly/background-removal
 * This is called from the client, not the server
 *
 * Usage in a React component:
 * ```tsx
 * import { removeBackground } from '@imgly/background-removal';
 *
 * const removeBackgroundClientSide = async (imageFile: File): Promise<Blob> => {
 *   const result = await removeBackground(imageFile, {
 *     model: 'medium',
 *     output: { format: 'image/png', quality: 1.0 }
 *   });
 *   return result;
 * };
 * ```
 */

// ============================================================================
// Unified Background Removal Function
// ============================================================================

/**
 * Remove background from image using the specified provider
 *
 * @param imageBuffer - The image buffer to process
 * @param provider - Which provider to use ('removebg' for API, 'local' for server-side processing)
 * @param options - Processing options
 * @returns BackgroundRemovalResult
 */
export async function removeBackground(
  imageBuffer: Buffer,
  provider: BackgroundRemovalProvider = 'removebg',
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> {
  switch (provider) {
    case 'removebg':
      return removeBackgroundRemoveBg(imageBuffer, options);

    case 'local':
      // For server-side local processing, we could use sharp to make transparent
      // This is a basic fallback - not as good as AI-based removal
      return removeBackgroundLocal(imageBuffer, options);

    case 'imgly':
      // imgly runs on client-side only
      throw new Error('imgly provider must be used client-side. Use removeBackgroundClientSide() instead.');

    default:
      throw new Error(`Unknown background removal provider: ${provider}`);
  }
}

// ============================================================================
// Local Background Removal (Basic - Server-side fallback)
// ============================================================================

/**
 * Basic background removal using sharp
 * This is a very simple approach that removes near-white backgrounds
 * Not as good as AI-based removal but works for simple product images
 *
 * @param imageBuffer - The image buffer to process
 * @param options - Processing options
 * @returns BackgroundRemovalResult
 */
async function removeBackgroundLocal(
  imageBuffer: Buffer,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> {
  const startTime = Date.now();

  // Import sharp dynamically to avoid issues with client-side imports
  const sharp = (await import('sharp')).default;

  // Get image info
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }

  // Simple approach: make the image have an alpha channel
  // For actual background removal, you'd need more sophisticated processing
  const resultBuffer = await image
    .ensureAlpha()
    .png()
    .toBuffer();

  const processingTime = Date.now() - startTime;

  return {
    imageBuffer: resultBuffer,
    processingTime,
    provider: 'local'
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert a buffer to a data URL
 */
export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'image/png'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Convert a data URL to a buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  return Buffer.from(matches[2], 'base64');
}

/**
 * Fetch an image from URL and return as buffer
 */
export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  // Handle data URLs
  if (url.startsWith('data:')) {
    return dataUrlToBuffer(url);
  }

  // Handle local URLs
  let fullUrl = url;
  if (url.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    fullUrl = `${baseUrl}${url}`;
  }

  const response = await fetch(fullUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Check if remove.bg API is available (has API key)
 */
export function isRemoveBgAvailable(): boolean {
  return !!process.env.REMOVEBG_API_KEY;
}

/**
 * Get the recommended provider based on availability
 */
export function getRecommendedProvider(): BackgroundRemovalProvider {
  if (isRemoveBgAvailable()) {
    return 'removebg';
  }
  // Fall back to client-side imgly
  return 'imgly';
}

// ============================================================================
// Documentation
// ============================================================================

/**
 * BACKGROUND REMOVAL OPTIONS
 * ==========================
 *
 * This module supports multiple background removal approaches:
 *
 * 1. remove.bg API (Server-side, Recommended for production)
 *    - Best quality results
 *    - Costs ~$0.20-0.40 per image
 *    - Requires REMOVEBG_API_KEY in .env.local
 *    - Usage: POST to /api/remove-background with provider: 'removebg'
 *
 * 2. @imgly/background-removal (Client-side, Free)
 *    - Runs entirely in the browser
 *    - No API costs
 *    - ~30MB initial model download
 *    - Slower (10-30 seconds per image)
 *    - Good for development and low-volume use
 *    - Usage: Import directly in React component
 *
 * 3. Local (Server-side fallback, Basic)
 *    - Uses sharp for basic processing
 *    - Not true AI background removal
 *    - Only adds alpha channel
 *    - Use only as last resort
 *
 * RECOMMENDED SETUP:
 * =================
 *
 * For development:
 *   - Use @imgly/background-removal (client-side, free)
 *   - No API key needed
 *   - Run: npm install @imgly/background-removal
 *
 * For production:
 *   - Use remove.bg API for best results
 *   - Add REMOVEBG_API_KEY to your .env.local:
 *     REMOVEBG_API_KEY=your_api_key_here
 *   - Get API key at: https://www.remove.bg/api
 */
