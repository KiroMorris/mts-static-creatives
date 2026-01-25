// POST /api/generate-background - Generate AI background using Gemini
// Part of V2 Hero & Product System - AI Background Replacement

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateImage, imageUrlToBase64, generateImageId } from '@/lib/gemini';
import {
  BACKGROUND_PRESETS,
  buildBackgroundPrompt,
  type BackgroundPreset,
  type ProductPlacement,
} from '@/lib/background-presets';

// Request types
interface GenerateBackgroundRequest {
  // Background source - one of these is required
  presetId?: BackgroundPreset;
  customPrompt?: string;

  // Optional product image for context-aware generation
  productImageUrl?: string;

  // Optional modifications
  colorScheme?: string;
  promptAdditions?: string;

  // Placement hints (for prompt context)
  placement?: ProductPlacement;

  // Output options
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
}

// Response types
interface GenerateBackgroundResponse {
  success: boolean;
  data?: {
    backgroundImageUrl: string;
    backgroundImageId: string;
    promptUsed: string;
    presetUsed?: BackgroundPreset;
    generationTime: number;
    placement: ProductPlacement;
  };
  error?: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateBackgroundResponse>> {
  const startTime = Date.now();

  try {
    const body: GenerateBackgroundRequest = await request.json();

    // Validate: need either preset or custom prompt
    if (!body.presetId && !body.customPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Either presetId or customPrompt is required',
          },
        },
        { status: 400 }
      );
    }

    // Build the prompt
    let basePrompt: string;
    let placement: ProductPlacement;
    let presetUsed: BackgroundPreset | undefined;

    if (body.presetId) {
      const preset = BACKGROUND_PRESETS[body.presetId];
      if (!preset) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PRESET',
              message: `Unknown preset: ${body.presetId}`,
            },
          },
          { status: 400 }
        );
      }
      basePrompt = preset.prompt;
      placement = body.placement || preset.defaultPlacement;
      presetUsed = body.presetId;
    } else {
      basePrompt = body.customPrompt!;
      placement = body.placement || {
        scale: 0.8,
        x: 50,
        y: 50,
        shadow: true,
        reflection: false,
      };
    }

    // Build the final prompt with any modifications
    const finalPrompt = buildBackgroundPrompt(
      basePrompt,
      body.promptAdditions,
      body.colorScheme
    );

    console.log('Generating background with prompt:', finalPrompt.substring(0, 200) + '...');

    // Get product image for context if provided
    let productImageBase64: { data: string; mimeType: string } | undefined;
    if (body.productImageUrl) {
      try {
        productImageBase64 = await imageUrlToBase64(body.productImageUrl);
      } catch (error) {
        console.warn('Failed to load product image for context:', error);
        // Continue without product context - it's optional
      }
    }

    // Add context to prompt if we have product image
    const contextPrompt = productImageBase64
      ? `Generate a professional background image that would complement an apparel product. ${finalPrompt}. The background should leave appropriate space for product placement and text overlays.`
      : `Generate a professional background image suitable for apparel product photography. ${finalPrompt}. The background should have good depth and leave space for product placement.`;

    // Determine aspect ratio
    const aspectRatio = body.aspectRatio || '9:16';

    // Generate the background image
    let generatedImage;
    try {
      generatedImage = await generateImage(
        contextPrompt,
        productImageBase64,
        aspectRatio
      );
    } catch (error) {
      console.error('Gemini background generation error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for content filtering
      if (
        errorMessage.toLowerCase().includes('safety') ||
        errorMessage.toLowerCase().includes('blocked')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONTENT_FILTERED',
              message: 'Background generation was blocked by content safety filters. Try a different prompt.',
            },
          },
          { status: 400 }
        );
      }

      // Check for rate limiting
      if (
        errorMessage.toLowerCase().includes('rate') ||
        errorMessage.toLowerCase().includes('quota')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: 60,
            },
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: `Failed to generate background: ${errorMessage}`,
          },
        },
        { status: 500 }
      );
    }

    // Save the generated image
    const backgroundImageId = generateImageId();
    const extension = generatedImage.mimeType.split('/')[1] || 'png';
    const filename = `bg_${backgroundImageId}.${extension}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory may already exist
    }

    // Write the image file
    const filepath = path.join(uploadsDir, filename);
    const imageBuffer = Buffer.from(generatedImage.imageData, 'base64');
    await writeFile(filepath, imageBuffer);

    const backgroundImageUrl = `/uploads/${filename}`;
    const generationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        backgroundImageUrl,
        backgroundImageId,
        promptUsed: contextPrompt,
        presetUsed,
        generationTime,
        placement,
      },
    });
  } catch (error) {
    console.error('Generate background error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate background',
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available presets
export async function GET(): Promise<NextResponse> {
  const presets = Object.values(BACKGROUND_PRESETS).map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: preset.category,
    description: preset.description,
    lighting: preset.lighting,
    suggestedColors: preset.suggestedColors,
  }));

  return NextResponse.json({
    success: true,
    data: {
      presets,
      categories: ['studio', 'lifestyle', 'abstract', 'seasonal'],
    },
  });
}
