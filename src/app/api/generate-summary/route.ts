import { NextRequest, NextResponse } from 'next/server';
import { generateSummary, type GenerateSummaryInput } from '@/ai/flows/generate-summary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    const input: GenerateSummaryInput = {
      bookTitle: body.bookTitle,
      topic: body.topic,
      includeKeyPoints: body.includeKeyPoints,
      language: body.language,
    };

    // Validate required fields
    if (!input.bookTitle || !input.topic) {
      return NextResponse.json(
        { error: 'Missing required fields: bookTitle and topic are required' },
        { status: 400 }
      );
    }

    // Generate the summary
    const result = await generateSummary(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-summary API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
