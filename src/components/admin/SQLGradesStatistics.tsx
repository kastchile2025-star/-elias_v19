"use client";

import React, { useEffect, useState } from 'react';
import { useGradesSQL } from '@/hooks/useGradesSQL';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GraduationCap, BarChart2 } from 'lucide-react';

export default function SQLGradesStatistics({ year, className = '' }: { year: number; className?: string }) {
  const { getGradesByYear, totalGrades, isConnected } = useGradesSQL();
  const [yearCount, setYearCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isConnected) { setYearCount(0); return; }
      try {
        const arr = await getGradesByYear(year);
        if (mounted) setYearCount(arr.length);
      } catch {
        if (mounted) setYearCount(0);
      }
    };
    load();
    return () => { mounted = false; };
  }, [year, isConnected, getGradesByYear]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart2 className="w-4 h-4" /> Estadísticas SQL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3 h-3" />
            <span><strong>{year}:</strong> {yearCount.toLocaleString()} calificaciones</span>
          </div>
          <div>
            <span><strong>Total:</strong> {totalGrades.toLocaleString()} registros</span>
          </div>
          <div className="text-muted-foreground">Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
