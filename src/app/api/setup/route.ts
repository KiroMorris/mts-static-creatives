import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET - Check if API key is configured
export async function GET() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  return NextResponse.json({
    configured: !!(apiKey && apiKey.length > 0 && apiKey !== 'your_gemini_api_key_here'),
  });
}

// POST - Save API key to .env.local
export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || !apiKey.startsWith('AIza')) {
      return NextResponse.json(
        { error: 'Invalid API key. It should start with "AIza"' },
        { status: 400 }
      );
    }

    // Write to .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = `GOOGLE_AI_API_KEY=${apiKey}\n`;

    await fs.writeFile(envPath, envContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'API key saved! Please restart the app for changes to take effect.',
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }
}
