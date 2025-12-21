import { NextResponse } from 'next/server';
import { generateQuiz } from '@/ai/flows/generate-quiz';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookTitle, topic, courseName, language } = body || {};
    if (!bookTitle || !topic || !courseName || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await generateQuiz({
      bookTitle: String(bookTitle),
      topic: String(topic),
      courseName: String(courseName),
      language: language === 'en' ? 'en' : 'es',
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
