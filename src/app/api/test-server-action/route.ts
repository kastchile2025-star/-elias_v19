import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Server action test successful',
      received: body
    });
  } catch (error) {
    console.error('Server action test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server action test failed'
    }, { status: 500 });
  }
}
