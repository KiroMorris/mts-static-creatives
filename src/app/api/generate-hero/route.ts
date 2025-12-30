// POST /api/generate-hero - Generate hero lifestyle image using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateImage, imageUrlToBase64, generateImageId } from '@/lib/gemini';
import { PROMPTS } from '@/lib/prompts';
import type { HeroGenerationResponse, GenerationStyle } from '@/types';

interface GenerateHeroRequest {
  productImageUrl: string;
  productImageId: string;
  customPrompt?: string;
  style?: GenerationStyle;
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

    // Build the prompt
    let prompt: string;
    if (body.customPrompt) {
      prompt = body.customPrompt;
    } else {
      // Use default prompt from prompts.ts
      // Extract color/type from style if available, otherwise use defaults
      const productType = 'hoodie'; // Default for MVP
      const productColor = 'the shown'; // Let AI detect from image
      prompt = PROMPTS.hero(productColor, productType);
    }

    // Add style modifiers if provided
    if (body.style) {
      const styleAdditions: string[] = [];
      if (body.style.modelGender && body.style.modelGender !== 'female') {
        styleAdditions.push(`Model gender: ${body.style.modelGender}`);
      }
      if (body.style.setting && body.style.setting !== 'studio') {
        styleAdditions.push(`Setting: ${body.style.setting} environment`);
      }
      if (body.style.mood && body.style.mood !== 'casual') {
        styleAdditions.push(`Mood: ${body.style.mood}`);
      }
      if (styleAdditions.length > 0) {
        prompt += '\n\nAdditional style requirements:\n' + styleAdditions.join('\n');
      }
    }

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
