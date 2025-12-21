import { NextResponse } from 'next/server';

// Pequeño PNG transparente de 1x1 como fallback
const TRANSPARENT_PNG = Uint8Array.from([
  137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,8,153,99,96,0,0,0,2,0,1,226,33,185,88,0,0,0,0,73,69,78,68,174,66,96,130
]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const u = searchParams.get('u') || searchParams.get('url');
    if (!u) {
      return new NextResponse(TRANSPARENT_PNG, { status: 400, headers: { 'Content-Type': 'image/png' } });
    }

    // Seguridad básica: solo http/https
    if (!/^https?:\/\//i.test(u)) {
      return new NextResponse(TRANSPARENT_PNG, { status: 400, headers: { 'Content-Type': 'image/png' } });
    }

    // Traer la imagen remota desde el servidor para evitar CORS en el cliente
    const upstream = await fetch(u, {
      redirect: 'follow',
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        // Algunos CDNs requieren un User-Agent "realista"
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        // Referer amistoso para Unsplash
        ...(u.includes('unsplash.com') ? { Referer: 'https://unsplash.com/' } : {}),
      },
    });
    if (!upstream.ok) {
      // Fallback amigable para Unsplash/source si el CDN bloquea el fetch del servidor
      if (u.includes('unsplash.com')) {
        // Forzar PNG para que el cliente no reciba SVG (pptxgenjs no admite SVG)
        const ph = await fetch('https://placehold.co/1280x720.png?text=Image+unavailable&background=0b1220&foreground=ffffff', { cache: 'no-store' });
        if (ph.ok) {
          const buf = await ph.arrayBuffer();
          return new NextResponse(buf, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=600' } });
        }
      }
      return new NextResponse(TRANSPARENT_PNG, { status: 502, headers: { 'Content-Type': 'image/png' } });
    }

    let contentType = upstream.headers.get('content-type') || 'image/jpeg';
    let arrayBuffer = await upstream.arrayBuffer();
    // Si el servidor devolvió SVG, responder PNG de placeholder para compatibilidad con pptxgenjs
    if (/image\/(svg|svg\+xml)/i.test(contentType)) {
      const ph = await fetch('https://placehold.co/1280x720.png?text=Image+unavailable&background=0b1220&foreground=ffffff', { cache: 'no-store' });
      if (ph.ok) {
        arrayBuffer = await ph.arrayBuffer();
        contentType = 'image/png';
      }
    }
    const resp = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache corto en el edge/navegador para suavizar carga
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
    return resp;
  } catch (e) {
    return new NextResponse(TRANSPARENT_PNG, { status: 500, headers: { 'Content-Type': 'image/png' } });
  }
}
