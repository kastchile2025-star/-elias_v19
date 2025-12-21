import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Aceptar varias variables: preferir privadas de servidor
    const apiKey = process.env.GOOGLE_AI_API_KEY
      || process.env.GOOGLE_API_KEY
      || process.env.GEMINI_API_KEY
      || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    // Validación resiliente: muchas claves de Google comienzan con 'AIza', pero no forzamos esa regla
    const hasApiKey = !!(apiKey && apiKey !== 'your_google_api_key_here' && apiKey.length >= 30);

    console.log('🔍 Checking AI status...');
    console.log('📊 API Key configured:', hasApiKey ? 'Yes' : 'No');
    console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
    console.log('🎯 Expected key format:', apiKey ? (apiKey.startsWith('AIza') ? 'Valid' : 'Invalid') : 'None');

    if (!hasApiKey) {
      const reason = !apiKey
        ? 'Variables GOOGLE_AI_API_KEY / GOOGLE_API_KEY / GEMINI_API_KEY (o NEXT_PUBLIC_GOOGLE_API_KEY) no encontradas'
        : apiKey === 'your_google_api_key_here'
          ? 'API key no configurada (valor por defecto)'
          : apiKey.length < 30
            ? 'Formato de API key posiblemente inválido'
            : 'API key vacía';

      console.log('❌ AI inactive:', reason);
      return NextResponse.json({
        isActive: false,
        reason,
        instructions: 'Configura GOOGLE_AI_API_KEY (recomendado) o GOOGLE_API_KEY/GEMINI_API_KEY en Vercel (Production/Preview) y redeploy. En local usa .env.local. Ej: GOOGLE_API_KEY=AIza... ',
        timestamp: new Date().toISOString()
      });
    }

    // Test basic connectivity (without making actual API call to avoid quota usage)
    console.log('✅ AI is configured and ready');
    return NextResponse.json({ 
      isActive: true,
      reason: 'IA configurada y lista para usar',
      model: 'gemini-2.0-flash',
      keyLength: apiKey.length,
      timestamp: new Date().toISOString(),
      features: [
        'Generación de resúmenes',
        'Creación de mapas mentales', 
        'Generación de cuestionarios',
        'Contenido de evaluaciones'
      ]
    });

  } catch (error) {
    console.error('💥 Error checking AI status:', error);
    // Modo resiliente: considerar activo si existe alguna de las dos claves
  const anyKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const hasApiKey = !!(anyKey && anyKey !== 'your_google_api_key_here' && anyKey.length > 0);
    
    return NextResponse.json({
      isActive: hasApiKey,
      reason: hasApiKey ? 'IA configurada (modo de respaldo)' : 'Error de configuración',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
}
