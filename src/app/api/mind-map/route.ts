import { NextRequest, NextResponse } from 'next/server';
import { createMindMapAction } from '@/actions/mind-map-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { centralTheme, bookTitle, language = 'es', isHorizontal = false } = body;
    
    if (!centralTheme || !bookTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: centralTheme and bookTitle' },
        { status: 400 }
      );
    }
    
    console.log('🧠 API: Generating mind map with:', { centralTheme, bookTitle, language, isHorizontal });
    
    const result = await createMindMapAction({
      centralTheme,
      bookTitle,
      language: language as 'es' | 'en',
      isHorizontal
    });
    
    console.log('🧠 API: Mind map generated successfully');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ API Error generating mind map:', error);
    return NextResponse.json(
      { error: 'Failed to generate mind map', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
