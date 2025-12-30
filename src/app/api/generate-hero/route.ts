// POST /api/generate-hero - Generate hero lifestyle image using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateImage, imageUrlToBase64, generateImageId } from '@/lib/gemini';
import { PROMPTS } from '@/lib/prompts';
import type { HeroGenerationResponse, ModelSceneStyle } from '@/types';

interface GenerateHeroRequest {
  productImageUrl: string;
  productImageId?: string;
  customPrompt?: string;
  modelSceneStyle?: ModelSceneStyle;
}

export async function POST(request: NextRequest): Promise<NextResponse<HeroGenerationResponse>> {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: GenerateHeroRequest = await request.json();

    // Validate required fields
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

    // Convert product image to base64 for Gemini
    let productImageBase64;
    try {
      productImageBase64 = await imageUrlToBase64(body.productImageUrl);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: `Failed to fetch product image: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        },
        { status: 400 }
      );
    }

    // Build the prompt with style settings
    let prompt: string;
    if (body.customPrompt) {
      prompt = body.customPrompt;
    } else {
      // Use default prompt from prompts.ts with style settings
      const productType = 'hoodie'; // Default for MVP
      const productColor = 'the shown'; // Let AI detect from image
      prompt = PROMPTS.hero(productColor, productType, body.modelSceneStyle);
    }

    // Style is integrated in the prompt via PROMPTS.hero()
    console.log('Generated hero prompt:', prompt.substring(0, 200) + '...');

    // Generate the hero image using Gemini
    let generatedImage;
    try {
      generatedImage = await generateImage(prompt, productImageBase64);
    } catch (error) {
      console.error('Gemini generation error:', error);

      // Check for content filtering
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
            message: `Failed to generate hero image: ${errorMessage}`,
          },
        },
        { status: 500 }
      );
    }

    // Save the generated image to public/uploads
    const heroImageId = generateImageId();
    const extension = generatedImage.mimeType.split('/')[1] || 'png';
    const filename = `hero_${heroImageId}.${extension}`;

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

    const heroImageUrl = `/uploads/${filename}`;
    const generationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        heroImageUrl,
        heroImageId,
        promptUsed: prompt,
        generationTime,
      },
    });
  } catch (error) {
    console.error('Generate hero error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate hero image',
        },
      },
      { status: 500 }
    );
  }
}
