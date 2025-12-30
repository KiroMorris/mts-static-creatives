// POST /api/regenerate-callout - Regenerate a single callout image using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateImageWithReferences, imageUrlToBase64, generateImageId } from '@/lib/gemini';
import { PROMPTS } from '@/lib/prompts';
import type { CalloutType } from '@/types';

interface RegenerateCalloutRequest {
  calloutType: CalloutType;
  productImageUrl: string;
  heroImageUrl: string;
  customPrompt?: string;
}

interface RegenerateCalloutResponse {
  success: boolean;
  data?: {
    type: CalloutType;
    imageUrl: string;
    imageId: string;
    promptUsed: string;
    generationTime: number;
  };
  error?: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<RegenerateCalloutResponse>> {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: RegenerateCalloutRequest = await request.json();

    // Validate required fields
    if (!body.calloutType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'calloutType is required (detail, fit, or pose)',
          },
        },
        { status: 400 }
      );
    }

    if (!['detail', 'fit', 'pose'].includes(body.calloutType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'calloutType must be one of: detail, fit, pose',
          },
        },
        { status: 400 }
      );
    }

    if (!body.productImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'productImageUrl is required',
          },
        },
        { status: 400 }
      );
    }

    if (!body.heroImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'heroImageUrl is required for style consistency',
          },
        },
        { status: 400 }
      );
    }

    // Convert images to base64 for Gemini
    let productImage;
    let heroImage;
    try {
      productImage = await imageUrlToBase64(body.productImageUrl);
      heroImage = await imageUrlToBase64(body.heroImageUrl);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: `Failed to fetch reference images: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        },
        { status: 400 }
      );
    }

    // Build the prompt
    let prompt: string;
    const productType = 'hoodie'; // Default for MVP
    const productColor = 'the shown'; // Let AI detect from image

    if (body.customPrompt) {
      prompt = body.customPrompt;
    } else {
      switch (body.calloutType) {
        case 'detail':
          prompt = PROMPTS.calloutDetail(productColor, productType);
          break;
        case 'fit':
          prompt = PROMPTS.calloutFit(productColor, productType);
          break;
        case 'pose':
          prompt = PROMPTS.calloutPose(productColor, productType);
          break;
      }
    }

    // Add subject consistency instruction
    prompt += '\n\nIMPORTANT: Use the EXACT SAME model from the reference hero image for subject consistency.';
    prompt += '\n\nGenerate a slightly different variation while maintaining the same style and model.';

    // Generate the callout image with references
    let generatedImage;
    try {
      generatedImage = await generateImageWithReferences(prompt, [productImage, heroImage]);
    } catch (error) {
      console.error('Gemini generation error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for content filtering
      if (errorMessage.toLowerCase().includes('safety') || errorMessage.toLowerCase().includes('blocked')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONTENT_FILTERED',
              message: 'Image generation was blocked by content safety filters. Try a different prompt.',
            },
          },
          { status: 400 }
        );
      }

      // Check for rate limiting
      if (errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('quota')) {
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
            message: `Failed to regenerate callout: ${errorMessage}`,
          },
        },
        { status: 500 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory may already exist
    }

    // Save the generated image
    const imageId = generateImageId();
    const extension = generatedImage.mimeType.split('/')[1] || 'png';
    const filename = `callout_${body.calloutType}_${imageId}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    const imageBuffer = Buffer.from(generatedImage.imageData, 'base64');
    await writeFile(filepath, imageBuffer);

    const imageUrl = `/uploads/${filename}`;
    const generationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        type: body.calloutType,
        imageUrl,
        imageId,
        promptUsed: prompt,
        generationTime,
      },
    });
  } catch (error) {
    console.error('Regenerate callout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to regenerate callout image',
        },
      },
      { status: 500 }
    );
  }
}
