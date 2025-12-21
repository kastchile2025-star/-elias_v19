"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Carga dinámica con manejo de errores
const PerfilClient = dynamic(() => import('./perfil-client'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <PerfilClient />
    </Suspense>
  );
}
