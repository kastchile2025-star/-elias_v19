import { NextResponse } from 'next/server'
import { generateEvaluationContent } from '@/ai/flows/generate-evaluation-content'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      topic,
      bookTitle,
      language = 'es',
      questionCount = 15,
      timeLimit = 120,
    } = body || {}

    if (!topic || !bookTitle) {
      return NextResponse.json({ error: 'Missing topic or bookTitle' }, { status: 400 })
    }

    const result = await generateEvaluationContent({
      topic: String(topic),
      bookTitle: String(bookTitle),
      language: language === 'en' ? 'en' : 'es',
      questionCount: Number(questionCount) || 15,
      timeLimit: Number(timeLimit) || 120,
    })

    return NextResponse.json({ ok: true, data: result })
  } catch (err: any) {
    console.error('[API/tests/generate] Error:', err)
    return NextResponse.json({ ok: false, error: err?.message || 'Internal error' }, { status: 500 })
  }
}
