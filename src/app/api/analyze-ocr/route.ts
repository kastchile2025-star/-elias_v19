import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumentar límite para imágenes grandes
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, questions, pageNumber, focusQuestionNums } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'La imagen es requerida' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Clave de Gemini no configurada para análisis OMR');
      return NextResponse.json({ success: false, error: 'API key no configurada', fallback: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 1. LIMPIEZA CRÍTICA DEL BASE64
    // Si el string viene con "data:image/png;base64,..." hay que quitarlo.
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    // 2. CONSTRUCCIÓN DEL CONTEXTO (PREGUNTAS)
    const questionsContext = Array.isArray(questions) && questions.length > 0
      ? `ESTRUCTURA ESPERADA DE LA PRUEBA (Úsala como guía de ubicación):
         ${questions.map((q: any, i: number) => {
           if (q.type === 'tf') {
             return `P${i+1}: [Verdadero/Falso] - "${q.text?.substring(0, 50)}..."`
           } else if (q.type === 'mc') {
             const opts = (q.options || []).map((o: string, j: number) => `${String.fromCharCode(65+j)}) ${o?.substring(0, 15)}`).join(', ')
             return `P${i+1}: [Opción Múltiple: ${opts}] - "${q.text?.substring(0, 40)}..."`
           }
           return `P${i+1}: [Otro tipo]`
         }).join('\n         ')}`
      : 'Estructura genérica: Busca preguntas numeradas.';

    const focusNums: number[] = Array.isArray(focusQuestionNums)
      ? focusQuestionNums.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n) && n > 0)
      : [];
    const focusLine = focusNums.length > 0
      ? `\n\nMODO RE-CHEQUEO (FOCO): Analiza SOLO estas preguntas: ${focusNums.join(', ')}.\n- Ignora el resto del documento.\n- NO devuelvas preguntas fuera del foco.\n- Devuelve exactamente esas preguntas en "answers" (una entrada por cada número solicitado).\n`
      : '';

    // 3. PROMPT CON "CHAIN OF THOUGHT" - Obliga a describir antes de clasificar
    const prompt = `
ROL: Auditor Forense de Exámenes Escolares (Visión Artificial).

TAREA: Analizar la imagen y extraer TODAS las preguntas visibles.
⚠️ CRÍTICO: NO OMITAS NINGUNA PREGUNTA. Si ves 5 preguntas con marca, reporta las 5.

${focusLine}

${questionsContext}

📋 PROTOCOLO DE DETECCIÓN:

1. BUSCAR MARCAS EN CADA PREGUNTA:
   - Revisa CADA pregunta del 1 al último número visible
   - Si ves "V (X)" → val = "V"
   - Si ves "F (X)" → val = "F"
   - Si AMBOS están vacíos "V ( ) F ( )" → val = null

2. NO OMITIR PREGUNTAS:
   - Si la pregunta 5 tiene "V (X)", DEBES reportarla como val="V"
   - NUNCA omitas una pregunta porque "parece similar" a otras
   - Cada pregunta es INDEPENDIENTE

3. CLASIFICACIÓN DE MARCAS:
   - "STRONG_X": Una X clara dentro del paréntesis → VÁLIDA
   - "CHECK": Un check/palomita ✓ → VÁLIDA
   - "CIRCLE": Círculo alrededor de V o F → VÁLIDA
   - "EMPTY": Espacio en blanco → val = null

4. REGLA DE LA DUDA:
   - Si NO ves una marca clara (STRONG_X, CHECK, CIRCLE, FILL) → val = null.
   - Si ves "EMPTY" o "WEAK_MARK" → val = null.
   - Es MEJOR reportar que el alumno no respondió que inventar un dato falso.
   - Ante la duda → null. SIEMPRE null.

4. DETECCIÓN DE ESTUDIANTE:
   - Busca "Nombre:", "Estudiante:" seguido de texto.
   - Busca "RUT:" seguido de números.

FORMATO DE SALIDA (JSON PURO, SIN TEXTO ADICIONAL):
{
  "studentName": "Nombre detectado o null",
  "rut": "RUT detectado o null",
  "questionsFound": número_total_de_preguntas_visibles,
  "answers": [
    { "q": 1, "evidence": "STRONG_X en paréntesis de F", "val": "F" },
    { "q": 2, "evidence": "STRONG_X en paréntesis de V", "val": "V" },
    { "q": 3, "evidence": "STRONG_X en paréntesis de V", "val": "V" },
    { "q": 4, "evidence": "STRONG_X en paréntesis de F", "val": "F" },
    { "q": 5, "evidence": "EMPTY - ambos paréntesis vacíos", "val": null },
    { "q": 6, "evidence": "EMPTY - sin marca visible", "val": null },
    { "q": 7, "evidence": "STRONG_X en paréntesis de V", "val": "V" },
    ...continúa hasta la última pregunta visible...
  ],
  "confidence": "High" | "Low"
}

⚠️ REGLAS CRÍTICAS:
1. Devuelve TODAS las preguntas visibles, NO solo las respondidas.
2. Las preguntas sin respuesta deben tener: "evidence": "EMPTY...", "val": null
3. Si escribes "EMPTY" en evidence, val DEBE ser null.
4. NO inventes respuestas para "completar" un patrón.
5. Cada pregunta es INDEPENDIENTE de las demás.
`;

    // 4. PREPARACIÓN MULTIMODAL
    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/jpeg',
      },
    };

    // 5. GENERACIÓN
    console.log(`[OMR] 🔍 Analizando página ${pageNumber || 'N/A'} con Gemini Vision...`);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log(`[OMR] 📝 Respuesta raw:`, text.substring(0, 500));

    // 6. PARSEO SEGURO
    try {
      const jsonString = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(jsonString);
      
      console.log(`[OMR] ✅ Página ${pageNumber}: ${analysis.questionsFound || 0} preguntas, ${analysis.answers?.filter((a: any) => a.val !== null).length || 0} respondidas`);
      
      return NextResponse.json({
        success: true,
        analysis,
        pageNumber
      });
    } catch (parseError: any) {
      console.error('[OMR] ❌ Error parseando JSON:', parseError.message);
      console.error('[OMR] Texto recibido:', text);
      return NextResponse.json({
        success: false,
        error: 'Error parseando respuesta de IA',
        rawResponse: text
      });
    }

  } catch (error: any) {
    console.error('[OMR] ❌ Error general:', error);
    return NextResponse.json(
      { success: false, error: error.message, fallback: true },
      { status: 500 }
    );
  }
}
