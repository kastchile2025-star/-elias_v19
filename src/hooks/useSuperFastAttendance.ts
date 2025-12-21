import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  timestamp?: string;
}

interface ProcessingStats {
  processed: number;
  total: number;
  percentage: number;
  errors: number;
  duplicates: number;
  estimatedTimeRemaining: number;
  rate: number;
}

interface OptimizationConfig {
  batchSize: number;
  maxConcurrentBatches: number;
  enablePreValidation: boolean;
  enableBulkInsert: boolean;
  skipDuplicateChecks: boolean;
}

interface SuperFastResult {
  processed: number;
  total: number;
  errors: number;
  duplicates: number;
  timeElapsed: number;
  rate: number;
}

export const useSuperFastAttendance = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingStats | null>(null);
  const [result, setResult] = useState<SuperFastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const { toast } = useToast();

  const defaultConfig: OptimizationConfig = {
    batchSize: 25000,
    maxConcurrentBatches: 4,
    enablePreValidation: true,
    enableBulkInsert: true,
    skipDuplicateChecks: false
  };

  const processAttendanceFile = useCallback(async (
    file: File, 
    config: OptimizationConfig = defaultConfig
  ) => {
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    setIsProcessing(true);
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      // Leer archivo
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('El archivo está vacío');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validar headers requeridos
      const requiredHeaders = ['studentid', 'courseid', 'date', 'status'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
      }

      // Parsear datos
      const data: AttendanceRecord[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const record: any = {};
        
        headers.forEach((header, i) => {
          record[header] = values[i] || '';
        });

        // Mapear a la estructura esperada
        return {
          studentId: record.studentid || record.student_id || '',
          courseId: record.courseid || record.course_id || '',
          date: record.date || '',
          status: (record.status || '').toLowerCase() as 'present' | 'absent' | 'late'
        };
      }).filter(record => 
        record.studentId && 
        record.courseId && 
        record.date && 
        ['present', 'absent', 'late'].includes(record.status)
      );

      if (data.length === 0) {
        throw new Error('No se encontraron registros válidos en el archivo');
      }

      console.log(`🚀 Iniciando procesamiento súper rápido de ${data.length} registros`);

      // Crear worker optimizado
      workerRef.current = new Worker(
        new URL('../workers/superFastAttendanceImport.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Configurar listeners
      workerRef.current.onmessage = (event) => {
        const { type, data: workerData, error: workerError } = event.data;

        switch (type) {
          case 'progress':
            setProgress(workerData);
            break;
            
          case 'complete':
            setResult(workerData);
            setIsProcessing(false);
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }
            
            toast({
              title: '🎉 Carga completada exitosamente',
              description: `Procesados: ${workerData.processed.toLocaleString()} registros en ${Math.round(workerData.timeElapsed / 1000)}s (${workerData.rate} reg/s)`,
              variant: 'default'
            });
            break;
            
          case 'error':
            setError(workerError);
            setIsProcessing(false);
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }
            
            toast({
              title: '❌ Error en procesamiento',
              description: workerError,
              variant: 'destructive'
            });
            break;
        }
      };

      workerRef.current.onerror = (err) => {
        const errorMsg = `Error del worker: ${err.message}`;
        setError(errorMsg);
        setIsProcessing(false);
        
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
        
        toast({
          title: '❌ Error crítico',
          description: errorMsg,
          variant: 'destructive'
        });
      };

      // Enviar datos al worker
      workerRef.current.postMessage({
        type: 'process',
        data: data,
        config: config
      });

    } catch (err: any) {
      const errorMsg = `Error procesando archivo: ${err.message}`;
      setError(errorMsg);
      setIsProcessing(false);
      
      toast({
        title: '❌ Error de archivo',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  }, [toast]);

  const testPerformance = useCallback(async (config: OptimizationConfig = defaultConfig) => {
    setIsProcessing(true);
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      console.log('🧪 Iniciando prueba de rendimiento...');

      workerRef.current = new Worker(
        new URL('../workers/superFastAttendanceImport.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        const { type, data: workerData, error: workerError } = event.data;

        switch (type) {
          case 'progress':
            setProgress(workerData);
            break;
            
          case 'complete':
            setResult(workerData);
            setIsProcessing(false);
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }
            
            toast({
              title: '🧪 Prueba completada',
              description: `Velocidad: ${workerData.rate} registros/segundo`,
              variant: 'default'
            });
            break;
            
          case 'error':
            setError(workerError);
            setIsProcessing(false);
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }
            break;
        }
      };

      workerRef.current.postMessage({
        type: 'test-performance',
        config: config
      });

    } catch (err: any) {
      setError(`Error en prueba: ${err.message}`);
      setIsProcessing(false);
    }
  }, [toast]);

  const cancelProcessing = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    setIsProcessing(false);
    setProgress(null);
    setError('Procesamiento cancelado por el usuario');
    
    toast({
      title: '⏹️ Procesamiento cancelado',
      description: 'La carga de asistencia fue cancelada',
      variant: 'default'
    });
  }, [toast]);

  const resetState = useCallback(() => {
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    // Estado
    isProcessing,
    progress,
    result,
    error,
    
    // Acciones  
    processAttendanceFile,
    testPerformance,
    cancelProcessing,
    resetState,
    
    // Configuración por defecto
    defaultConfig
  };
};