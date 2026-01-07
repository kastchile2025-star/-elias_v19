import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type InputImage = { pageNum?: number; dataUrl: string }

function safeJsonParse(text: string): any {
  const clean = String(text)
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    return JSON.parse(clean)
  } catch {}

  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return JSON.parse(clean.slice(start, end + 1))
  }
  throw new Error('No se pudo parsear JSON desde la respuesta del modelo')
}

function getApiKey() {
  return (
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  )
}

function stripDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (m) return { mimeType: m[1], base64: m[2] }
  // fallback: asumir PNG
  return { mimeType: 'image/png', base64: dataUrl }
}

export async function POST(request: NextRequest) {
  try {
    const { images } = (await request.json()) as {
      images: InputImage[]
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ success: false, error: 'Se requieren imágenes' }, { status: 400 })
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key no configurada', fallback: true }, { status: 200 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `Analiza estas IMÁGENES (páginas) de pruebas escolares escaneadas.

OBJETIVO: SOLO identificar el NOMBRE DEL ESTUDIANTE y el RUT en cada página.

INSTRUCCIONES:
- Para CADA página, busca en el ENCABEZADO el nombre del estudiante y su RUT
- El nombre suele estar cerca de palabras como "Nombre:", "Estudiante:", "Alumno:" o similar
- El RUT puede estar cerca de "RUT:", "R.U.T:", "Rut:" o similar
- IMPORTANTE: Si ves que aparece "Pregunta 1" nuevamente después de haber visto preguntas anteriores,
  significa que empezó el examen de OTRO estudiante. Busca su nombre en esa página.
- Si no encuentras el nombre o RUT en una página, retorna null para ese campo
- NO analices las respuestas de las preguntas en esta fase, solo identifica estudiantes

FORMATO:
- Devuelve SOLO JSON válido (sin markdown)
- Devuelve una entrada por página en el mismo orden de las imágenes

JSON:
{
  "pages": [
    {
      "pageIndex": 0,
      "student": {"name": string|null, "rut": string|null}
    }
  ]
}
`

    const parts: any[] = [{ text: prompt }]
    for (const img of images) {
      const { mimeType, base64 } = stripDataUrl(img.dataUrl)
      parts.push({
        inlineData: {
          mimeType,
          data: base64,
        },
      })
    }

    const result = await model.generateContent(parts)
    const response = await result.response
    const text = response.text()

    try {
      const analysis = safeJsonParse(text)
      return NextResponse.json({ success: true, pages: analysis.pages || [], rawResponse: text })
    } catch (parseError) {
      console.error('Error parseando respuesta de Gemini (identificación):', parseError)
      return NextResponse.json({ success: false, error: 'Error parseando respuesta de IA', rawResponse: text }, { status: 200 })
    }
  } catch (error: any) {
    console.error('Error en identificación de estudiantes:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al identificar estudiantes', fallback: true },
      { status: 500 }
    )
  }
}
