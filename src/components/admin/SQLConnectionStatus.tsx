"use client";

import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGradesSQL } from '@/hooks/useGradesSQL';
import { isFirebaseEnabled } from '@/lib/sql-config';

export default function SQLConnectionStatus({ className = '' }: { className?: string }) {
  const { isConnected, checkConnection } = useGradesSQL();
  const [loading, setLoading] = React.useState(false);

  const reconnect = async () => {
    setLoading(true);
    try {
      await checkConnection();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Database className="w-4 h-4" />
      {isConnected ? (
        <Badge className="bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40">{isFirebaseEnabled() ? 'Firebase Conectado' : 'SQL Conectado'}</Badge>
      ) : (
        <Badge className="bg-red-600/20 text-red-700 dark:text-red-300 border border-red-400/40">SQL Desconectado</Badge>
      )}
      <Button size="sm" variant="outline" className="h-7 px-2" onClick={reconnect} disabled={loading}>
        <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Conectando…' : 'Reconectar'}
      </Button>
    </div>
  );
}
