import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'El prompt es requerido' },
        { status: 400 }
      );
    }

    // Verificar que existe la API key de Gemini (orden unificado con el resto del proyecto)
    const apiKey =
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
  console.warn('⚠️ Clave de Gemini no configurada (GOOGLE_AI_API_KEY/GOOGLE_API_KEY/GEMINI_API_KEY). Usando sugerencia por defecto.');
      // Retornar una sugerencia por defecto si no hay API key
      return NextResponse.json({
        suggestion: '¡Sigue adelante! Tu esfuerzo vale la pena 🌟',
        isDefault: true
      });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Generar sugerencia
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpiar el texto (remover comillas, saltos de línea extras, etc.)
    const cleanText = text
      .replace(/^["']|["']$/g, '') // Remover comillas al inicio/fin
      .replace(/\n/g, ' ') // Remover saltos de línea
      .trim()
      .slice(0, 120); // Limitar a 120 caracteres

    return NextResponse.json({
      suggestion: cleanText,
      isDefault: false
    });

  } catch (error) {
    console.error('Error en API de Gemini:', error);
    
    // En caso de error, retornar una sugerencia por defecto
    return NextResponse.json({
      suggestion: '¡Cada día es una oportunidad para aprender algo nuevo! 📚',
      isDefault: true,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
