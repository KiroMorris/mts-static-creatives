// POST /api/upload - Handle product image upload
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { UPLOAD } from '@/lib/constants';
import type { UploadResponse } from '@/types';

// Helper to generate unique image ID
function generateImageId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get image dimensions from buffer (basic implementation)
async function getImageDimensions(buffer: Buffer, mimeType: string): Promise<{ width: number; height: number }> {
  // For MVP, return default dimensions
  // In production, use sharp or similar to get actual dimensions
  // For now, we'll try to parse basic image headers

  if (mimeType === 'image/png') {
    // PNG header: width at bytes 16-19, height at bytes 20-23 (big-endian)
    if (buffer.length >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
  } else if (mimeType === 'image/jpeg') {
    // JPEG: need to parse markers to find SOF0 frame
    // Simplified: look for 0xFFC0 marker
    let i = 2;
    while (i < buffer.length - 9) {
      if (buffer[i] === 0xFF) {
        const marker = buffer[i + 1];
        // SOF0-SOF2 markers contain dimensions
        if (marker >= 0xC0 && marker <= 0xC2) {
          const height = buffer.readUInt16BE(i + 5);
          const width = buffer.readUInt16BE(i + 7);
          return { width, height };
        }
        // Skip to next marker
        const length = buffer.readUInt16BE(i + 2);
        i += 2 + length;
      } else {
        i++;
      }
    }
  }

  // Default fallback
  return { width: 1024, height: 1024 };
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file provided in the upload request',
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!(UPLOAD.supportedFormats as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `Invalid file type: ${file.type}. Supported formats: JPEG, PNG, WebP`,
          },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > UPLOAD.maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of ${UPLOAD.maxFileSize / 1024 / 1024}MB`,
          },
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get image dimensions
    const dimensions = await getImageDimensions(buffer, file.type);

    // Validate minimum dimensions
    if (dimensions.width < UPLOAD.minImageDimension || dimensions.height < UPLOAD.minImageDimension) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `Image dimensions ${dimensions.width}x${dimensions.height} are below minimum ${UPLOAD.minImageDimension}x${UPLOAD.minImageDimension}px`,
          },
        },
        { status: 400 }
      );
    }

    // Generate unique ID and filename
    const imageId = generateImageId();
    const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const filename = `${imageId}.${extension}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory may already exist
    }

    // Write file to public/uploads
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Return success response
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        imageId,
        dimensions,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload image',
        },
      },
      { status: 500 }
    );
  }
}

// Note: Next.js 14 App Router handles multipart form data automatically
// No config needed - formData() method handles file uploads
