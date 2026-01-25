// V2 Compose API Route
// POST /api/v2/compose
// Flexible canvas composition with multiple aspect ratios and element types

import { NextRequest, NextResponse } from 'next/server';
import { composeV2 } from '@/lib/v2/sharp-compose-v2';
import {
  ComposeV2Request,
  ComposeV2Response,
  ValidationResult,
  ElementValidation,
  CANVAS_PRESETS,
  CanvasElement
} from '@/lib/v2/types';

// ============================================================================
// Request Validation
// ============================================================================

function validateComposeRequest(request: ComposeV2Request): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const elementErrors: ElementValidation[] = [];

  // Validate canvas
  if (!request.canvas) {
    errors.push('canvas configuration is required');
  } else {
    if (!request.canvas.aspectRatio) {
      errors.push('canvas.aspectRatio is required');
    } else if (!CANVAS_PRESETS[request.canvas.aspectRatio]) {
      errors.push(`Invalid aspectRatio: ${request.canvas.aspectRatio}. Valid options: 9:16, 1:1, 4:5, 16:9`);
    }
  }

  // Validate elements
  if (!request.elements || !Array.isArray(request.elements)) {
    errors.push('elements array is required');
  } else if (request.elements.length === 0) {
    warnings.push('No elements provided - output will be blank canvas');
  } else {
    // Validate each element
    for (const element of request.elements) {
      const elementValidation = validateElement(element);
      if (!elementValidation.valid) {
        elementErrors.push(elementValidation);
      }
      warnings.push(...elementValidation.warnings);
    }
  }

  // Check for hero element
  const hasHero = request.elements?.some(el => el.type === 'hero' && el.enabled);
  if (!hasHero && !request.canvas?.backgroundColor) {
    warnings.push('No hero image or background color - canvas will be black');
  }

  // Validate output options
  if (request.output) {
    if (request.output.format && !['png', 'jpeg', 'webp'].includes(request.output.format)) {
      errors.push(`Invalid output format: ${request.output.format}`);
    }
    if (request.output.quality !== undefined) {
      if (request.output.quality < 1 || request.output.quality > 100) {
        errors.push('output.quality must be between 1 and 100');
      }
    }
  }

  return {
    valid: errors.length === 0 && elementErrors.filter(e => !e.valid).length === 0,
    errors,
    warnings,
    elementErrors
  };
}

function validateElement(element: CanvasElement): ElementValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Common validations
  if (!element.id) {
    errors.push('Element missing required id');
  }

  if (!element.type) {
    errors.push('Element missing required type');
  }

  if (!element.position) {
    errors.push('Element missing required position');
  } else {
    if (typeof element.position.x !== 'number' || typeof element.position.y !== 'number') {
      errors.push('Position x and y must be numbers');
    }
    if (element.position.unit && !['px', '%'].includes(element.position.unit)) {
      errors.push('Position unit must be "px" or "%"');
    }
  }

  if (!element.size) {
    errors.push('Element missing required size');
  } else {
    if (element.size.width <= 0 || element.size.height <= 0) {
      errors.push('Size width and height must be positive');
    }
  }

  if (element.zIndex !== undefined && typeof element.zIndex !== 'number') {
    errors.push('zIndex must be a number');
  }

  // Type-specific validations
  switch (element.type) {
    case 'text':
      if (!element.content) {
        warnings.push(`Text element ${element.id} has no content`);
      }
      if (!element.fontFamily) {
        warnings.push(`Text element ${element.id} missing fontFamily, will use default`);
      }
      break;

    case 'hero':
    case 'image':
    case 'callout':
    case 'logo':
      if (!('imageBuffer' in element && element.imageBuffer) &&
          !('imageUrl' in element && element.imageUrl)) {
        errors.push(`Image element ${element.id} requires imageBuffer or imageUrl`);
      }
      break;

    case 'cta-button':
      if (!element.text) {
        warnings.push(`CTA button ${element.id} has no text`);
      }
      break;

    case 'badge':
      if (!element.text) {
        warnings.push(`Badge ${element.id} has no text`);
      }
      break;

    case 'price-tag':
      if (!element.price) {
        errors.push(`Price tag ${element.id} requires price`);
      }
      break;
  }

  return {
    valid: errors.length === 0,
    elementId: element.id || 'unknown',
    errors,
    warnings
  };
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ComposeV2Response>> {
  const startTime = Date.now();

  try {
    const body: ComposeV2Request = await request.json();

    // Validate request
    const validation = validateComposeRequest(body);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join('; '),
          details: validation.elementErrors
        }
      }, { status: 400 });
    }

    // Process composition
    const result = await composeV2(body);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.imageUrl,
        imageId: result.imageId,
        dimensions: {
          width: result.width,
          height: result.height,
          aspectRatio: body.canvas.aspectRatio
        },
        downloadUrl: result.downloadUrl,
        compositionTime: Date.now() - startTime,
        format: body.output?.format || 'png',
        elementsRendered: result.elementsRendered,
        warnings: validation.warnings.length > 0 ? validation.warnings : undefined
      }
    });

  } catch (error) {
    console.error('V2 Compose error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for specific error types
    if (errorMessage.includes('fetch')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'IMAGE_FETCH_ERROR',
          message: 'Failed to fetch one or more images. Please check the URLs.'
        }
      }, { status: 400 });
    }

    if (errorMessage.includes('sharp') || errorMessage.includes('image')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'IMAGE_PROCESSING_ERROR',
          message: 'Failed to process images. Please ensure all images are valid.'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    }, { status: 500 });
  }
}

// ============================================================================
// GET Handler - API Info
// ============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    version: 'v2',
    endpoint: '/api/v2/compose',
    method: 'POST',
    description: 'Flexible canvas composition with multiple aspect ratios and element types',
    supportedAspectRatios: Object.keys(CANVAS_PRESETS),
    canvasPresets: CANVAS_PRESETS,
    supportedElementTypes: [
      'hero',
      'image',
      'callout',
      'text',
      'cta-button',
      'badge',
      'price-tag',
      'shape',
      'logo'
    ],
    outputFormats: ['png', 'jpeg', 'webp'],
    outputTypes: ['base64', 'file', 'buffer'],
    schema: {
      canvas: {
        aspectRatio: 'string (9:16 | 1:1 | 4:5 | 16:9)',
        backgroundColor: 'optional string (hex color)',
        customWidth: 'optional number',
        customHeight: 'optional number'
      },
      elements: 'array of CanvasElement objects',
      output: {
        format: 'optional string (png | jpeg | webp)',
        quality: 'optional number (1-100)',
        outputType: 'optional string (base64 | file)',
        filename: 'optional string'
      }
    },
    elementSchema: {
      common: {
        id: 'string (required)',
        type: 'string (required)',
        enabled: 'boolean (required)',
        position: '{ x: number, y: number, unit: "px" | "%" }',
        size: '{ width: number, height: number, unit: "px" | "%" }',
        zIndex: 'number',
        opacity: 'optional number (0-100)',
        rotation: 'optional number (degrees)'
      },
      hero: {
        imageUrl: 'string',
        imageBuffer: 'Buffer (for server-side)',
        zoom: 'number (default 1)',
        focusX: 'number (0-100, default 50)',
        focusY: 'number (0-100, default 50)'
      },
      text: {
        content: 'string',
        fontFamily: 'string',
        fontSize: 'number',
        fontWeight: 'number',
        color: 'string (hex)',
        align: '"left" | "center" | "right"',
        lineHeight: 'number (multiplier)',
        letterSpacing: 'number (px)',
        shadow: 'optional TextShadow',
        outline: 'optional TextOutline',
        background: 'optional TextBackground'
      },
      callout: {
        imageUrl: 'string',
        borderWidth: 'number',
        borderColor: 'string',
        borderRadius: 'number',
        zoom: 'number',
        focusX: 'number',
        focusY: 'number',
        label: 'optional string'
      },
      'cta-button': {
        text: 'string',
        fontFamily: 'string',
        fontSize: 'number',
        textColor: 'string',
        backgroundColor: 'string',
        borderRadius: 'number',
        paddingX: 'number',
        paddingY: 'number'
      },
      badge: {
        text: 'string',
        fontFamily: 'string',
        fontSize: 'number',
        textColor: 'string',
        backgroundColor: 'string',
        paddingX: 'number',
        paddingY: 'number'
      },
      'price-tag': {
        price: 'string',
        originalPrice: 'optional string',
        fontFamily: 'string',
        fontSize: 'number',
        priceColor: 'string'
      },
      shape: {
        shapeType: '"rectangle" | "circle" | "line" | "triangle"',
        fillColor: 'optional string',
        strokeColor: 'optional string',
        strokeWidth: 'optional number',
        borderRadius: 'optional number (for rectangles)'
      }
    }
  });
}
