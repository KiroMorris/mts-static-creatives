// Gemini AI client configuration for image generation
// Using Gemini Nano Banana Pro (gemini-2.0-flash-exp-image-generation)

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Model configuration for image generation
// Gemini 3 Pro Image (Nano Banana Pro)
export const IMAGE_GENERATION_MODEL = 'gemini-3-pro-image-preview';

// Get the generative model instance
export function getImageGenerationModel(): GenerativeModel {
  return genAI.getGenerativeModel({
    model: IMAGE_GENERATION_MODEL,
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
}

// Helper function to convert image URL to base64 for Gemini input
export async function imageUrlToBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  // Handle local file URLs (from /public/uploads/)
  if (imageUrl.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    imageUrl = `${baseUrl}${imageUrl}`;
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return {
    data: base64,
    mimeType: contentType,
  };
}

// Generate a unique ID for images
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Extract base64 image data from Gemini response
export function extractImageFromResponse(response: {
  response: { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> } }> };
}): { data: string; mimeType: string } | null {
  const candidates = response.response.candidates;
  if (!candidates || candidates.length === 0) {
    return null;
  }

  const parts = candidates[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    return null;
  }

  for (const part of parts) {
    if (part.inlineData) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      };
    }
  }

  return null;
}

// Supported aspect ratios for Gemini image generation
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';

// Generate image using Gemini with a prompt and optional reference image
export async function generateImage(
  prompt: string,
  referenceImage?: { data: string; mimeType: string },
  aspectRatio: AspectRatio = '9:16'
): Promise<{ imageData: string; mimeType: string }> {
  const model = getImageGenerationModel();

  // Build the content parts
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

  // Add reference image if provided (for subject consistency)
  if (referenceImage) {
    parts.push({
      inlineData: {
        data: referenceImage.data,
        mimeType: referenceImage.mimeType,
      },
    });
  }

  // Add the prompt
  parts.push({ text: prompt });

  // Generate content with image output and aspect ratio
  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      // @ts-expect-error - responseModalities and imageConfig are valid for image generation
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  // Extract the image from the response
  const imageResult = extractImageFromResponse(result);
  if (!imageResult) {
    throw new Error('No image generated in response');
  }

  return {
    imageData: imageResult.data,
    mimeType: imageResult.mimeType,
  };
}

// Generate image with multiple reference images (for style/subject consistency)
export async function generateImageWithReferences(
  prompt: string,
  referenceImages: Array<{ data: string; mimeType: string }>,
  aspectRatio: AspectRatio = '1:1'
): Promise<{ imageData: string; mimeType: string }> {
  const model = getImageGenerationModel();

  // Build the content parts
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

  // Add all reference images
  for (const refImage of referenceImages) {
    parts.push({
      inlineData: {
        data: refImage.data,
        mimeType: refImage.mimeType,
      },
    });
  }

  // Add the prompt
  parts.push({ text: prompt });

  // Generate content with image output and aspect ratio
  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      // @ts-expect-error - responseModalities and imageConfig are valid for image generation
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  // Extract the image from the response
  const imageResult = extractImageFromResponse(result);
  if (!imageResult) {
    throw new Error('No image generated in response');
  }

  return {
    imageData: imageResult.data,
    mimeType: imageResult.mimeType,
  };
}

export { genAI };
