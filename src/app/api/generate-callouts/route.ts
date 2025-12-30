// POST /api/generate-callouts - Generate 3 callout detail images using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateImageWithReferences, imageUrlToBase64, generateImageId } from '@/lib/gemini';
import { PROMPTS } from '@/lib/prompts';
import type { CalloutsGenerationResponse, CalloutImage, CalloutType } from '@/types';

interface GenerateCalloutsRequest {
  productImageUrl: string;
  heroImageUrl: string;
  heroImageId: string;
  types?: CalloutType[];
}

// Generate a single callout image
async function generateCallout(
  type: CalloutType,
  productImage: { data: string; mimeType: string },
  heroImage: { data: string; mimeType: string },
  uploadsDir: string
): Promise<CalloutImage> {
  // Get the appropriate prompt for this callout type
  const productType = 'hoodie'; // Default for MVP
  const productColor = 'the shown'; // Let AI detect from image

  let prompt: string;
  switch (type) {
    case 'detail':
      prompt = PROMPTS.calloutDetail(productColor, productType);
      break;
    case 'fit':
      prompt = PROMPTS.calloutFit(productColor, productType);
      break;
    case 'pose':
      prompt = PROMPTS.calloutPose(productColor, productType);
      break;
    default:
      throw new Error(`Invalid callout type: ${type}`);
  }

  // Add subject consistency instruction
  prompt += '\n\nIMPORTANT: Use the EXACT SAME model from the reference hero image for subject consistency.';

  // Generate with both product and hero images as references for consistency
  const generatedImage = await generateImageWithReferences(prompt, [productImage, heroImage]);

  // Save the generated image
  const imageId = generateImageId();
  const extension = generatedImage.mimeType.split('/')[1] || 'png';
  const filename = `callout_${type}_${imageId}.${extension}`;
  const filepath = path.join(uploadsDir, filename);

  const imageBuffer = Buffer.from(generatedImage.imageData, 'base64');
  await writeFile(filepath, imageBuffer);

  return {
    type,
    imageUrl: `/uploads/${filename}`,
    imageId,
    promptUsed: prompt,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<CalloutsGenerationResponse>> {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: GenerateCalloutsRequest = await request.json();

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

    // Determine which callout types to generate
    const typesToGenerate: CalloutType[] = body.types || ['detail', 'fit', 'pose'];

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

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory may already exist
    }

    // Generate callouts sequentially to avoid rate limiting
    let callouts: CalloutImage[] = [];
    try {
      for (const type of typesToGenerate) {
        console.log(`Generating ${type} callout...`);
        const callout = await generateCallout(type, productImage, heroImage, uploadsDir);
        callouts.push(callout);
        console.log(`${type} callout generated successfully`);
      }
    } catch (error) {
      console.error('Callout generation error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for content filtering
      if (errorMessage.toLowerCase().includes('safety') || errorMessage.toLowerCase().includes('blocked')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONTENT_FILTERED',
              message: 'Image generation was blocked by content safety filters.',
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
            message: errorMessage,
          },
        },
        { status: 500 }
      );
    }

    const totalGenerationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        callouts,
        totalGenerationTime,
      },
    });
  } catch (error) {
    console.error('Generate callouts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate callout images',
        },
      },
      { status: 500 }
    );
  }
}
