'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export interface InsightsCardProps {
  insights: string[];
  aiInsights: string[];
  isGeneratingInsights: boolean;
  insightsSync: boolean;
  prioritizeCharts: boolean;
  onRefreshInsights: () => void;
}

/**
 * Formatea un insight para mostrar con formato visual mejorado
 */
function formatInsight(insight: string): React.ReactNode {
  // Remover emojis al inicio y aplicar formato básico
  const cleaned = insight.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '');
  return cleaned;
}

/**
 * Componente modular para la tarjeta de Insights Rápidos
 * Muestra análisis inteligentes generados por IA sobre los datos académicos
 */
export default function InsightsCard({
  insights,
  aiInsights,
  isGeneratingInsights,
  insightsSync,
  prioritizeCharts,
  onRefreshInsights,
}: InsightsCardProps) {
  const { translate } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  return (
    <Card className="flex flex-col min-h-[400px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> {t('quickInsights', 'Insights Rápidos')}
          </div>
          <div className="flex items-center gap-2">
            {/* Luz de estado */}
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                aiInsights.length === 0
                  ? 'bg-gray-400 border-gray-500' // Sin insights aún
                  : insightsSync
                  ? 'bg-green-500 border-green-600' // Insights actualizados
                  : 'bg-orange-500 border-orange-600' // Insights desactualizados
              }`}
              title={
                aiInsights.length === 0
                  ? 'Sin insights generados - presiona actualizar para generar con IA'
                  : insightsSync
                  ? 'Insights sincronizados con los filtros actuales'
                  : 'Insights pueden estar desactualizados - presiona actualizar para regenerar'
              }
            />
            {/* Botón actualizar */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshInsights}
              className="h-8 w-8 p-0"
              title="Actualizar insights con IA"
              disabled={isGeneratingInsights}
            >
              <RefreshCw className={`h-4 w-4 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {prioritizeCharts ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted/30 rounded animate-pulse" />
          </div>
        ) : isGeneratingInsights ? (
          <div className="relative bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/30 p-4 h-[288px]">
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm text-blue-500 font-medium mb-2">
                  {t('generatingWithAI', 'Generando análisis con IA...')}
                </p>
                <p className="text-xs text-muted-foreground/70 max-w-[280px]">
                  {t(
                    'analyzingData',
                    'Analizando datos académicos para identificar puntos fuertes y áreas de mejora'
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : aiInsights && aiInsights.length > 0 ? (
          <ol className="text-sm list-decimal pl-5 space-y-3 text-justify">
            {aiInsights.map((insight, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300 text-justify">
                {formatInsight(insight)}
              </li>
            ))}
          </ol>
        ) : insights && insights.length > 0 ? (
          <ol className="text-sm list-decimal pl-5 space-y-3 text-justify">
            {insights.map((it, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300 text-justify">
                {formatInsight(it)}
              </li>
            ))}
          </ol>
        ) : (
          <div className="relative bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/30 p-4 h-[288px]">
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  {t('noInsightsAvailable', 'Sin insights disponibles')}
                </p>
                <p className="text-xs text-muted-foreground/70 max-w-[280px]">
                  {t(
                    'noInsightsDescription',
                    'Carga estudiantes, cursos y datos académicos para generar análisis inteligentes'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
