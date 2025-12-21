import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de prueba simple para verificar que la API funciona
 */
export async function GET(request: NextRequest) {
  console.log('✅ [TEST] Endpoint GET llamado');
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Test endpoint funcionando correctamente',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('✅ [TEST] Endpoint POST llamado');
  
  try {
    const body = await request.json().catch(() => ({}));
    console.log('📦 [TEST] Body recibido:', body);
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Test endpoint POST funcionando correctamente',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [TEST] Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
