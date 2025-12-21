import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicEvaluationContent } from '@/ai/flows/generate-evaluation-content';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Dynamic Evaluation API called');
    
    const body = await request.json();
    console.log('📥 API Request body:', {
      bookTitle: body.bookTitle,
      topic: body.topic,
      language: body.language,
      pdfContent: body.pdfContent ? `${body.pdfContent.length} chars` : 'No PDF content',
      questionCount: body.questionCount,
      timeLimit: body.timeLimit
    });

  const { bookTitle, topic, language, pdfContent, questionCount, timeLimit, course, subject } = body;

    // Validate required fields
    if (!bookTitle || !topic || !language) {
      console.error('❌ Missing required fields:', { bookTitle: !!bookTitle, topic: !!topic, language: !!language });
      return NextResponse.json(
        { error: 'Missing required fields: bookTitle, topic, and language are required' },
        { status: 400 }
      );
    }

    // Validate language
    if (language !== 'es' && language !== 'en') {
      console.error('❌ Invalid language:', language);
      return NextResponse.json(
        { error: 'Language must be either "es" or "en"' },
        { status: 400 }
      );
    }

    console.log('✅ All validations passed, generating evaluation...');
    console.log('🌍 Language being processed:', language);

    // Generate dynamic evaluation content
    const evaluationData = await generateDynamicEvaluationContent({
      bookTitle,
      course,
      subject,
      topic,
      language: language as 'es' | 'en',
      pdfContent: pdfContent || '',
      timestamp: Date.now(),
      randomSeed: Math.random(),
      questionCount: questionCount || 15,
      timeLimit: timeLimit || 120,
    });

    console.log('✅ Evaluation generated successfully:', {
      title: evaluationData.evaluationTitle,
      questionsCount: evaluationData.questions.length,
      language: language,
      firstQuestionPreview: evaluationData.questions[0]?.questionText?.substring(0, 100)
    });

    return NextResponse.json({
      success: true,
      data: evaluationData,
    });

  } catch (error) {
    console.error('❌ Error in dynamic evaluation API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
