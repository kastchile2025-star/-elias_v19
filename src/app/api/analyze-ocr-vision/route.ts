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
    const { images, questionsCount, title, topic, subjectName } = (await request.json()) as {
      images: InputImage[]
      questionsCount?: number
      title?: string
      topic?: string
      subjectName?: string
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

    const qCount = typeof questionsCount === 'number' && questionsCount > 0 ? questionsCount : 0
    const contextLine = [title, subjectName, topic].filter(Boolean).join(' | ')

    const prompt = `ROL: Auditor Forense de Exámenes Escolares (Visión Artificial OMR).

CONTEXTO DE LA PRUEBA: ${contextLine || 'N/D'}
PREGUNTAS ESPERADAS: ${qCount || 'Se detectará automáticamente'}

## TAREA PRINCIPAL:
Analiza VISUALMENTE cada página para detectar TODAS las preguntas visibles.
⚠️ CRÍTICO: NO OMITAS NINGUNA PREGUNTA. Si hay 5 preguntas con marca, reporta las 5.
Si hay ${qCount > 0 ? qCount : 16} preguntas en el examen, debes reportar ${qCount > 0 ? qCount : 16} respuestas.

## 📋 PROTOCOLO DE DETECCIÓN:

### 1. BUSCAR MARCAS (X, ✓, círculo):
- Busca una X, check o círculo DENTRO del paréntesis de V o F
- Si ves "V (X)" → detected = "V"
- Si ves "F (X)" → detected = "F"
- Si AMBOS paréntesis están vacíos "V ( ) F ( )" → detected = null

### 2. NO OMITIR PREGUNTAS:
- Revisa CADA pregunta del 1 al ${qCount > 0 ? qCount : 'último número visible'}
- Si la pregunta 5 tiene "V (X)", DEBES reportarla como detected="V"
- NUNCA omitas una pregunta porque "parece igual" a otras
- Un paréntesis vacío ( ) es VACÍO, no una respuesta.

### 2. CLASIFICACIÓN DE MARCAS (debes identificar el tipo):
- "STRONG_X": Una X clara y fuerte dentro del paréntesis → VÁLIDA
- "CHECK": Un check/palomita ✓ visible → VÁLIDA
- "CIRCLE": Círculo alrededor de V o F → VÁLIDA
- "FILL": Paréntesis rellenado/sombreado → VÁLIDA
- "EMPTY": Espacio en blanco, sin tinta → detected = null (SIEMPRE)
- "WEAK_MARK": Garabato pequeño o dudoso → detected = null
- "DIRTY": Manchas de escáner → detected = null

### 3. REGLAS PARA V/F:
- "V (X) F ( )" → detected = "V" (marca fuerte en V, F vacío)
- "V ( ) F (X)" → detected = "F" (marca fuerte en F, V vacío)
- "V ( ) F ( )" → detected = null (AMBOS VACÍOS = SIN RESPUESTA)
- "V (X) F (X)" → detected = null (DOBLE MARCA = INVALIDADO)

### 4. REGLA DE ORO:
- Es MEJOR reportar null (no respondió) que INVENTAR una respuesta
- Si tienes DUDA → detected = null
- Cada pregunta es INDEPENDIENTE de las demás

### 5. DETECCIÓN DE ESTUDIANTE:
- Busca "Nombre:", "Estudiante:" en el encabezado
- Busca "RUT:" seguido de números

## FORMATO DE RESPUESTA (JSON PURO, SIN TEXTO ADICIONAL):

{
  "questionsFoundInDocument": número_total_de_preguntas_en_el_examen,
  "pages": [
    {
      "pageIndex": 0,
      "pageNum": 1,
      "student": {
        "name": "Nombre del estudiante o null",
        "rut": "RUT o null"
      },
      "answers": [
        {"questionNum": 1, "evidence": "STRONG_X en F", "detected": "F", "points": 5},
        {"questionNum": 2, "evidence": "STRONG_X en V", "detected": "V", "points": 5},
        {"questionNum": 3, "evidence": "STRONG_X en V", "detected": "V", "points": 5},
        {"questionNum": 4, "evidence": "STRONG_X en V", "detected": "V", "points": 5},
        {"questionNum": 5, "evidence": "EMPTY - ambos paréntesis vacíos", "detected": null, "points": null},
        {"questionNum": 6, "evidence": "EMPTY - sin marca", "detected": null, "points": null},
        {"questionNum": 7, "evidence": "STRONG_X en F", "detected": "F", "points": 5},
        ...continúa hasta la última pregunta visible...
      ]
    }
  ]
}

## ⚠️ REGLAS CRÍTICAS:
1. Devuelve TODAS las preguntas visibles en el examen, NO solo las respondidas
2. Las preguntas sin respuesta deben tener: "evidence": "EMPTY...", "detected": null
3. Si escribes "EMPTY" en evidence, detected DEBE ser null
- NO inventes respuestas para "completar" un patrón
- Revisa VISUALMENTE cada pregunta de forma INDEPENDIENTE
- Devuelve SOLO JSON válido, sin markdown ni explicaciones
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
      return NextResponse.json({ success: true, analysis, rawResponse: text })
    } catch (parseError) {
      console.error('Error parseando respuesta de Gemini (visión):', parseError)
      return NextResponse.json({ success: false, error: 'Error parseando respuesta de IA', rawResponse: text }, { status: 200 })
    }
  } catch (error: any) {
    console.error('Error en análisis OCR visión:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al analizar OCR', fallback: true },
      { status: 500 }
    )
  }
}
