import { useState } from 'react';

interface ProgressStep {
  percent: number;
  text: string;
}

export function useAIProgress() {
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startProgress = (type: 'summary' | 'mindmap' | 'quiz' | 'evaluation', totalDuration: number = 8000) => {
    setIsLoading(true);
    setProgress(0);
    
    const steps: Record<string, ProgressStep[]> = {
      summary: [
        { percent: 15, text: 'Conectando con IA...' },
        { percent: 35, text: 'Analizando contenido...' },
        { percent: 55, text: 'Generando resumen...' },
        { percent: 75, text: 'Procesando información...' },
        { percent: 90, text: 'Finalizando...' },
        { percent: 100, text: 'Completado' }
      ],
      mindmap: [
        { percent: 15, text: 'Conectando con IA...' },
        { percent: 30, text: 'Analizando estructura...' },
        { percent: 50, text: 'Creando mapa mental...' },
        { percent: 70, text: 'Generando imagen...' },
        { percent: 90, text: 'Finalizando...' },
        { percent: 100, text: 'Completado' }
      ],
      quiz: [
        { percent: 15, text: 'Conectando con IA...' },
        { percent: 35, text: 'Analizando tema...' },
        { percent: 55, text: 'Generando preguntas...' },
        { percent: 75, text: 'Creando cuestionario...' },
        { percent: 90, text: 'Finalizando...' },
        { percent: 100, text: 'Completado' }
      ],
      evaluation: [
        { percent: 15, text: 'Conectando con IA...' },
        { percent: 35, text: 'Preparando evaluación...' },
        { percent: 55, text: 'Generando preguntas...' },
        { percent: 75, text: 'Configurando respuestas...' },
        { percent: 90, text: 'Finalizando...' },
        { percent: 100, text: 'Completado' }
      ]
    };

    const currentSteps = steps[type];
    let currentStep = 0;
    const stepDuration = totalDuration / currentSteps.length;

    const progressInterval = setInterval(() => {
      if (currentStep < currentSteps.length) {
        setProgress(currentSteps[currentStep].percent);
        setProgressText(currentSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(progressInterval);
      }
    }, stepDuration);

    return progressInterval;
  };

  const stopProgress = (progressInterval?: NodeJS.Timeout) => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    setProgress(0);
    setProgressText('');
    setIsLoading(false);
  };

  return {
    progress,
    progressText,
    isLoading,
    startProgress,
    stopProgress
  };
}
