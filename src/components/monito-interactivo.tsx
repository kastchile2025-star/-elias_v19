"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, TrendingUp, BookOpen, Award, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

interface Sugerencia {
  texto: string;
  tipo: 'motivacion' | 'estudio' | 'mejora' | 'plan';
  icono: any;
  plan?: string[]; // listado de pasos concretos de refuerzo
}

export default function MonitoInteractivo() {
  const { user } = useAuth();
  const { translate, language } = useLanguage();
  const [sugerenciaActual, setSugerenciaActual] = useState<Sugerencia | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [posicionX, setPosicionX] = useState(0);
  const [posicionY, setPosicionY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false); // parpadeo cuando hay nueva propuesta
  const [hasAcknowledged, setHasAcknowledged] = useState(false); // usuario ya vio la recomendación
  const [lastFetchTime, setLastFetchTime] = useState<number>(0); // cacheo simple
  const [cachedGrades, setCachedGrades] = useState<any[] | null>(null);
  const [compactMode, setCompactMode] = useState(true); // Modo compacto por defecto
  const containerRef = useRef<HTMLDivElement>(null);

  // Sugerencias por defecto
  const sugerenciasMotivacion: Sugerencia[] = [
    {
      texto: language === 'es' 
        ? "¡Sigue así! Tu esfuerzo está dando frutos 🌟" 
        : "Keep it up! Your effort is paying off 🌟",
      tipo: 'motivacion',
      icono: Sparkles
    },
    {
      texto: language === 'es'
        ? "¡Eres increíble! Cada día mejoras más 🚀"
        : "You're amazing! You improve every day 🚀",
      tipo: 'motivacion',
      icono: Award
    },
    {
      texto: language === 'es'
        ? "No te rindas, ¡lo estás logrando! 💪"
        : "Don't give up, you're making it! 💪",
      tipo: 'motivacion',
      icono: TrendingUp
    }
  ];

  useEffect(() => {
    setMounted(true);
    console.log('[Monito] 🎯 Componente montado. Click en el monito para consultar calificaciones.');
  }, []);

  // Función para obtener sugerencia cuando el usuario hace click
  const obtenerSugerenciaPersonalizada = async () => {
    try {
      setIsLoading(true);
      console.log('[Monito] 🖱️ Usuario hizo click, consultando Firebase...');

      // Consultar Firebase
      const calificaciones = await obtenerCalificacionesUsuario(true); // forzar consulta nueva
      
      if (calificaciones && calificaciones.length > 0) {
        console.log('[Monito] 📊 Analizando calificaciones...');
        // Analizar calificaciones y generar sugerencia
        const sugerencia = await analizarCalificaciones(calificaciones);
        setSugerenciaActual(sugerencia);
        setShouldBlink(false); // detener parpadeo si estaba activo
        console.log('[Monito] ✅ Sugerencia generada y mostrada');
      } else {
        console.log('[Monito] ℹ️ No hay calificaciones, mostrando mensaje informativo');
        // Mostrar mensaje indicando que no hay datos
        setSugerenciaActual({
          texto: language === 'es'
            ? 'No se encontraron calificaciones en tu historial. Completa algunas evaluaciones para recibir sugerencias personalizadas.'
            : 'No grades found in your history. Complete some evaluations to receive personalized suggestions.',
          tipo: 'motivacion',
          icono: BookOpen,
          plan: []
        });
      }
    } catch (error) {
      console.error('[Monito] ❌ Error obteniendo sugerencia:', error);
      // Mostrar mensaje de error
      setSugerenciaActual({
        texto: language === 'es'
          ? 'Hubo un error al consultar tus calificaciones. Por favor intenta nuevamente.'
          : 'There was an error fetching your grades. Please try again.',
        tipo: 'motivacion',
        icono: Sparkles,
        plan: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Recalcular cuando se notifiquen cambios en calificaciones (evento global del sistema)
  useEffect(() => {
    if (!mounted || !user) return;
    const handler = async () => {
      try {
        console.log('[Monito] 🔄 Evento de actualización de calificaciones recibido');
        setIsLoading(true);
        const calificaciones = await obtenerCalificacionesUsuario(true); // forzar refresh
        if (calificaciones.length > 0) {
          const sugerencia = await analizarCalificaciones(calificaciones);
          setSugerenciaActual(sugerencia);
          // Activar parpadeo solo si es un nuevo consejo útil
          const adviceKey = `${sugerencia.tipo}|${sugerencia.texto}`;
          const lastKey = typeof window !== 'undefined' ? localStorage.getItem('monito-last-advice-key') : null;
          if (adviceKey !== lastKey && (sugerencia.tipo === 'plan' || sugerencia.plan?.length)) {
            setShouldBlink(true);
            setHasAcknowledged(false);
          }
        } else {
          console.log('[Monito] ℹ️ No hay calificaciones tras actualización, ocultando burbuja');
          setSugerenciaActual(null);
        }
        setIsLoading(false);
      } catch (e) {
        console.debug('[Monito] No se pudo recalcular sugerencia tras evento:', e);
        setIsLoading(false);
      }
    };
    window.addEventListener('sqlGradesUpdated', handler as any);
    return () => window.removeEventListener('sqlGradesUpdated', handler as any);
  }, [mounted, user, language]);

  // Detectar clicks fuera del componente para cerrar la burbuja
  useEffect(() => {
    if (!sugerenciaActual || isLoading) return; // solo activo cuando hay burbuja visible y no está cargando

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        console.log('[Monito] 🖱️ Click fuera detectado, cerrando burbuja');
        setSugerenciaActual(null);
        setShouldBlink(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sugerenciaActual, isLoading]);

  // Función para obtener calificaciones del usuario (forzado a Firebase con cache de 60s)
  const obtenerCalificacionesUsuario = async (forceRefresh = false) => {
    try {
      const now = Date.now();
      const cacheValid = cachedGrades && !forceRefresh && (now - lastFetchTime < 60000); // 60s cache
      
      if (cacheValid) {
        console.log('[Monito] 💾 Usando calificaciones en cache');
        return cachedGrades;
      }

      const { firestoreDB } = await import('@/lib/firestore-database');
      const { isFirebaseEnabled } = await import('@/lib/sql-config');
      const currentYear = new Date().getFullYear();

      if (isFirebaseEnabled()) {
        console.log('[Monito] 🔥 Consultando calificaciones en Firebase...');
        console.log('[Monito] 👤 Usuario actual:', { 
          username: user?.username, 
          displayName: user?.displayName,
          id: user?.id,
          email: user?.email,
          rut: user?.rut
        });
        const grades = await firestoreDB.getGradesByYear(currentYear);
        console.log(`[Monito] 📚 Total de calificaciones en Firebase (${currentYear}): ${grades.length}`);
        
        // Mostrar muestra de TODAS las calificaciones para debug
        if (grades.length > 0) {
          console.log('[Monito] 🔍 Muestra de TODAS las calificaciones en Firebase:', grades.slice(0, 5).map((g: any) => ({
            studentName: g.studentName,
            studentId: g.studentId,
            student: g.student,
            subject: g.subjectName || g.subject || g.subjectId,
            score: g.score,
            activity: g.activityName || g.activity,
            year: g.year
          })));
        }
        
        // Función helper para normalizar texto (quitar tildes, convertir a minúsculas, limpiar caracteres corruptos)
        const normalizar = (texto: string | undefined): string => {
          if (!texto) return '';
          return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // quitar tildes
            .replace(/�/g, '') // quitar caracteres corruptos
            .replace(/[^a-z0-9\s]/g, '') // solo letras, números y espacios
            .trim();
        };
        
        // Extraer primer nombre del displayName para comparación flexible
        const extractFirstName = (fullName: string | undefined): string => {
          if (!fullName) return '';
          return fullName.split(' ')[0].toLowerCase();
        };
        
        // Filtrar solo las del usuario actual (probando múltiples criterios MÁS FLEXIBLES)
        const userGrades = grades.filter((g: any) => {
          // PRIORIDAD 1: Match por RUT (más confiable)
          const matchByRut = user?.rut && g.studentId === user.rut;
          
          const matchById = g.studentId === user?.username || g.studentId === user?.id;
          const matchByName = g.studentName === user?.displayName || g.student === user?.displayName;
          const matchByEmail = g.studentEmail === user?.email || g.email === user?.email;
          
          // Match parcial por nombre (por si hay diferencias en formato)
          const matchByPartialName = user?.displayName && g.studentName && 
            g.studentName.toLowerCase().includes(user.displayName.toLowerCase());
          
          // Match normalizado (sin tildes ni mayúsculas ni caracteres corruptos)
          const userNameNorm = normalizar(user?.displayName);
          const studentNameNorm = normalizar(g.studentName || g.student);
          const matchByNormalizedName = userNameNorm && studentNameNorm && 
            (studentNameNorm.includes(userNameNorm) || userNameNorm.includes(studentNameNorm));
          
          // Match por primer nombre (más flexible)
          const userFirstName = extractFirstName(user?.displayName);
          const userFirstNameNorm = normalizar(userFirstName);
          const matchByFirstName = userFirstNameNorm && studentNameNorm && 
            studentNameNorm.startsWith(userFirstNameNorm);
          
          // Match por email normalizado
          const userEmailNorm = normalizar(user?.email);
          const studentEmailNorm = normalizar(g.studentEmail || g.email);
          const matchByNormalizedEmail = userEmailNorm && studentEmailNorm && 
            studentEmailNorm === userEmailNorm;
          
          const match = matchByRut || matchById || matchByName || matchByEmail || matchByPartialName || 
                       matchByNormalizedName || matchByFirstName || matchByNormalizedEmail;
          
          // Log detallado si hay match para debug
          if (match) {
            console.log('[Monito] ✅ Match encontrado:', {
              criterio: matchByRut ? 'RUT' : matchById ? 'ID' : matchByName ? 'Nombre exacto' : matchByEmail ? 'Email exacto' : 
                       matchByPartialName ? 'Nombre parcial' : matchByNormalizedName ? 'Nombre normalizado' : 
                       matchByFirstName ? 'Primer nombre' : 'Email normalizado',
              userRut: user?.rut,
              studentId: g.studentId,
              studentName: g.studentName,
              subject: g.subjectName
            });
          }
          
          return match;
        });
        
        console.log(`[Monito] ✅ Calificaciones filtradas del usuario: ${userGrades.length}`);
        
        // Debug: mostrar qué se está buscando normalizado
        if (userGrades.length === 0 && grades.length > 0) {
          const normalizar = (texto: string | undefined): string => {
            if (!texto) return '';
            return texto
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .trim();
          };
          console.log('[Monito] 🔍 DEBUG - Comparación normalizada:');
          console.log('  Usuario buscado (normalizado):', normalizar(user?.displayName));
          console.log('  Primeros 5 studentNames (normalizados):', 
            grades.slice(0, 5).map((g: any) => normalizar(g.studentName || g.student)));
          console.log('  Username actual:', user?.username);
          console.log('  Primeros 5 studentIds:', 
            grades.slice(0, 5).map((g: any) => g.studentId));
        }
        
        if (userGrades.length > 0) {
          // Log de muestra de las primeras 3 calificaciones del usuario
          console.log('[Monito] 📋 Muestra de calificaciones del usuario:', userGrades.slice(0, 3).map((g: any) => ({
            studentName: g.studentName,
            studentId: g.studentId,
            subject: g.subjectName || g.subjectId,
            score: g.score,
            activity: g.activityName || g.activity,
            description: g.description || g.activityDescription,
            topic: g.topic || g.theme,
            year: g.year
          })));
        } else if (grades.length > 0) {
          // Si hay grades pero ninguno coincide, mostrar muestra para debug
          console.log('[Monito] ⚠️ Hay calificaciones en Firebase pero ninguna coincide con el usuario');
          console.log('[Monito] 🔍 Intentando match con:', {
            buscando_studentId: [user?.username, user?.id],
            buscando_studentName: user?.displayName,
            buscando_email: user?.email
          });
          console.log('[Monito] 🔍 Valores únicos en Firebase:', {
            studentIds: [...new Set(grades.slice(0, 10).map((g: any) => g.studentId))],
            studentNames: [...new Set(grades.slice(0, 10).map((g: any) => g.studentName || g.student))]
          });
        }
        
        // Guardar en cache
        setCachedGrades(userGrades);
        setLastFetchTime(now);
        
        return userGrades;
      } else {
        console.log('[Monito] ℹ️ Firebase deshabilitado. No se consultarán calificaciones.');
      }
      return [];
    } catch (error) {
      console.error('[Monito] ❌ Error obteniendo calificaciones desde Firebase:', error);
      return [];
    }
  };

  // Determinar si debe mostrarse burbuja y parpadeo según sugerencia nueva
  useEffect(() => {
    if (!mounted || !sugerenciaActual) return;
    
    // Califica para mostrar si tiene plan
    const qualifies = sugerenciaActual.plan && sugerenciaActual.plan.length > 0;
    
    if (!qualifies) {
      console.log('[Monito] ⚠️ Sugerencia sin plan, no se muestra burbuja');
      setShouldBlink(false);
      return;
    }
    
    const adviceKey = `${sugerenciaActual.tipo}|${sugerenciaActual.texto}`;
    const lastKey = typeof window !== 'undefined' ? localStorage.getItem('monito-last-advice-key') : null;
    
    if (adviceKey !== lastKey) {
      console.log('[Monito] ✨ Nueva sugerencia detectada, activando parpadeo');
      setShouldBlink(true);
      setHasAcknowledged(false);
    } else {
      console.log('[Monito] ℹ️ Sugerencia ya vista anteriormente');
    }
  }, [mounted, sugerenciaActual]);

  // Analizar calificaciones y generar sugerencia personalizada
  const analizarCalificaciones = async (calificaciones: any[]): Promise<Sugerencia> => {
    console.log('[Monito] 📊 Iniciando análisis de calificaciones:', calificaciones.length);
    
    if (!calificaciones || calificaciones.length === 0) {
      console.log('[Monito] ⚠️ No hay calificaciones para analizar');
      return {
        texto: language === 'es'
          ? '¡Aún no tienes calificaciones! Cuando completes algunas actividades, podré darte sugerencias personalizadas.'
          : 'You don\'t have any grades yet! When you complete some activities, I can give you personalized suggestions.',
        tipo: 'motivacion',
        icono: TrendingUp,
        plan: []
      };
    }
    
    // Estructura para guardar cada calificación individual con sus detalles
    interface CalificacionDetalle {
      materia: string;
      score: number;
      actividades: string[];
    }
    
    const calificacionesDetalle: CalificacionDetalle[] = [];
    const materiaMap = new Map<string, { calificaciones: number[] }>();
    
    let totalScore = 0;
    let totalCount = 0;
    
    calificaciones.forEach((cal, index) => {
      // Usar subjectId como nombre de materia
      const materiaRaw = cal.subjectId || 'general';
      
      // Convertir de snake_case a formato legible
      const materia = materiaRaw
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Obtener calificación (score es el campo correcto)
      const score = cal.score || 0;
      
      // Obtener tema/actividad (topic o title)
      const tema = cal.topic || cal.title || '';
      const actividades = tema ? [tema] : [];
      
      if (score > 0) {
        // Guardar detalle de esta calificación individual
        calificacionesDetalle.push({
          materia,
          score,
          actividades
        });
        
        // Agregar al mapa de materias
        if (!materiaMap.has(materia)) {
          materiaMap.set(materia, { calificaciones: [] });
        }
        materiaMap.get(materia)!.calificaciones.push(score);
        
        totalScore += score;
        totalCount++;
      }
    });
    
    // Calcular promedio general
    const promedio = totalCount > 0 ? totalScore / totalCount : 0;
    console.log('[Monito] 📊 Promedio general:', promedio.toFixed(1));
    console.log('[Monito] 📊 Total calificaciones procesadas:', totalCount);
    console.log('[Monito] 📊 Total materias encontradas:', materiaMap.size);
    console.log('[Monito] 📊 Detalles de calificaciones individuales:', calificacionesDetalle.length);
    
    // Calcular promedio por materia y ordenar
    const materiasConPromedio = Array.from(materiaMap.entries())
      .map(([materia, info]) => {
        const prom = info.calificaciones.length > 0
          ? info.calificaciones.reduce((a, b) => a + b, 0) / info.calificaciones.length
          : 0;
        return { materia, promedio: prom };
      })
      .filter(m => m.materia !== 'General')
      .sort((a, b) => a.promedio - b.promedio);
    
    console.log('[Monito] 📈 Materias analizadas:', materiasConPromedio.map(m => ({
      materia: m.materia,
      promedio: m.promedio.toFixed(1)
    })));
    
    // Obtener las 2 materias con menor promedio
    const dosMateriasMasBajas = materiasConPromedio.slice(0, 2);
    
    console.log('[Monito] 🔍 Cantidad de materias con menor promedio:', dosMateriasMasBajas.length);

    console.log('[Monito] 🎯 Dos materias con menor promedio:', dosMateriasMasBajas.map(m => ({
      materia: m.materia,
      promedio: m.promedio.toFixed(1)
    })));
    
    // Función para obtener los temas de las calificaciones más bajas de una materia
    const obtenerTemasCalificacionesBajas = (nombreMateria: string): string => {
      // Filtrar todas las calificaciones de esta materia
      const calificacionesMateria = calificacionesDetalle
        .filter(c => c.materia === nombreMateria)
        .sort((a, b) => a.score - b.score); // Ordenar de menor a mayor
      
      if (calificacionesMateria.length === 0) {
        return language === 'es' ? 'conceptos básicos' : 'basic concepts';
      }
      
      // Tomar las 3 calificaciones más bajas
      const calificacionesBajas = calificacionesMateria.slice(0, 3);
      
      // Extraer todas las actividades de esas calificaciones bajas
      const temasUnicos = new Set<string>();
      calificacionesBajas.forEach(cal => {
        cal.actividades.forEach(act => {
          if (act && act.trim()) {
            temasUnicos.add(act.trim());
          }
        });
      });
      
      const temasArray = Array.from(temasUnicos);
      
      if (temasArray.length === 0) {
        return language === 'es' ? 'conceptos básicos' : 'basic concepts';
      }
      
      // Limitar a 3 temas y longitud total
      return temasArray.slice(0, 3).join(', ').slice(0, 80);
    };
    
    // Generar mensaje según cantidad de materias
    if (dosMateriasMasBajas.length >= 2) {
      const materia1 = dosMateriasMasBajas[0];
      const materia2 = dosMateriasMasBajas[1];
      
      // Obtener temas de las calificaciones más bajas de cada materia
      const tema1 = obtenerTemasCalificacionesBajas(materia1.materia);
      const tema2 = obtenerTemasCalificacionesBajas(materia2.materia);
      
      console.log('[Monito] 🎓 Temas de calificaciones más bajas:', { 
        materia1: materia1.materia,
        promedio1: materia1.promedio.toFixed(1),
        temas1: tema1,
        materia2: materia2.materia,
        promedio2: materia2.promedio.toFixed(1),
        temas2: tema2
      });
      
      // Limpiar caracteres especiales de los temas
      const limpiarTexto = (texto: string): string => {
        return texto
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
          .replace(/[^\w\s,]/g, '') // Eliminar caracteres especiales excepto comas
          .trim();
      };
      
      const tema1Limpio = limpiarTexto(tema1);
      const tema2Limpio = limpiarTexto(tema2);
      
      // Calcular tiempo sugerido basado en el promedio (cuanto más bajo, más tiempo)
      const calcularTiempo = (prom: number): number => {
        if (prom < 40) return 30;
        if (prom < 55) return 20;
        if (prom < 70) return 15;
        return 10;
      };
      
      const tiempo1 = calcularTiempo(materia1.promedio);
      const tiempo2 = calcularTiempo(materia2.promedio);
      
      // Construir mensaje con icono y tiempos
      const textoRefuerzo = language === 'es'
        ? `Refuerza ${materia1.materia} (${tema1Limpio}) - ${tiempo1} min/dia\ny ${materia2.materia} (${tema2Limpio}) - ${tiempo2} min/dia`
        : `Reinforce ${materia1.materia} (${tema1Limpio}) - ${tiempo1} min/day\nand ${materia2.materia} (${tema2Limpio}) - ${tiempo2} min/day`;
      
      const mensajeFinal = language === 'es'
        ? `Promedio General: ${promedio.toFixed(1)}\n\n💡 Cada dia es una oportunidad para aprender algo nuevo!\n\n${textoRefuerzo}`
        : `Overall Average: ${promedio.toFixed(1)}\n\n💡 Every day is an opportunity to learn something new!\n\n${textoRefuerzo}`;
      
      return {
        texto: mensajeFinal,
        tipo: 'plan',
        icono: promedio >= 70 ? BookOpen : TrendingUp,
        plan: [] // Sin plan, solo el mensaje
      };
    } else if (dosMateriasMasBajas.length === 1) {
      const materia = dosMateriasMasBajas[0];
      
      // Obtener temas de las calificaciones más bajas
      const tema = obtenerTemasCalificacionesBajas(materia.materia);
      
      // Limpiar caracteres especiales
      const limpiarTexto = (texto: string): string => {
        return texto
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
          .replace(/[^\w\s,]/g, '') // Eliminar caracteres especiales excepto comas
          .trim();
      };
      
      const temaLimpio = limpiarTexto(tema);
      
      // Calcular tiempo sugerido basado en el promedio
      const calcularTiempo = (prom: number): number => {
        if (prom < 40) return 30;
        if (prom < 55) return 20;
        if (prom < 70) return 15;
        return 10;
      };
      
      const tiempo = calcularTiempo(materia.promedio);
      
      const textoRefuerzo = language === 'es'
        ? `Refuerza ${materia.materia} (${temaLimpio}) - ${tiempo} min/dia`
        : `Reinforce ${materia.materia} (${temaLimpio}) - ${tiempo} min/day`;
      
      const mensajeFinal = language === 'es'
        ? `Promedio General: ${promedio.toFixed(1)}\n\n💡 Cada dia es una oportunidad para aprender algo nuevo!\n\n${textoRefuerzo}`
        : `Overall Average: ${promedio.toFixed(1)}\n\n💡 Every day is an opportunity to learn something new!\n\n${textoRefuerzo}`;
      
      return {
        texto: mensajeFinal,
        tipo: 'plan',
        icono: promedio >= 70 ? BookOpen : TrendingUp,
        plan: [] // Sin plan, solo el mensaje
      };
    } else {
      // Caso general - siempre dar plan
      const planGeneral = language === 'es' ? [
        `Establece horario fijo de estudio`,
        `Pide ayuda a profesores cuando necesites`,
        `Practica ejercicios adicionales`,
        `Descansa bien antes de evaluaciones`
      ] : [
        `Set fixed study schedule`,
        `Ask teachers for help when needed`,
        `Practice additional exercises`,
        `Rest well before evaluations`
      ];
      
      return {
        texto: language === 'es'
          ? "¡Cada esfuerzo cuenta! Te ayudo a mejorar con este plan 🚀"
          : "Every effort counts! I'll help you improve with this plan 🚀",
        tipo: 'plan',
        icono: Sparkles,
        plan: planGeneral
      };
    }
  };

  // Generar plan local simple
  const generarPlanLocal = (materiasDebiles: string[]): string[] => {
    return materiasDebiles.flatMap(m => {
      if (language === 'es') {
        return [
          `Revisa apuntes clave de ${m} (10 min)`,
          `Resuelve 3 ejercicios básicos de ${m}`,
          `Resume conceptos difíciles en una hoja`
        ];
      }
      return [
        `Review key notes of ${m} (10 min)`,
        `Solve 3 basic exercises of ${m}`,
        `Summarize hard concepts on one page`
      ];
    }).slice(0, 6); // limitar para no saturar
  };

  // Usar IA para mejorar plan de refuerzo
  // Analizar con IA las materias más bajas incluyendo actividades y temas
  const analizarConIA = async (
    materias: { materia: string, promedio: number, actividades: { nombre: string, descripcion: string, nota: number, tema: string }[] }[],
    promedioGeneral: number,
    lang: string
  ): Promise<string[]> => {
    try {
      // Construir contexto detallado para la IA
      const contextoMaterias = materias.map(m => {
        const actividadesTexto = m.actividades
          .map(a => `- ${a.nombre} (${a.nota}): ${a.tema || a.descripcion || 'Sin descripción'}`)
          .join('\n');
        
        return `**${m.materia}** (Promedio: ${m.promedio.toFixed(1)}):\n${actividadesTexto}`;
      }).join('\n\n');

      const prompt = lang === 'es'
        ? `Eres un tutor educativo experto. Analiza las siguientes asignaturas con menor rendimiento del estudiante:

${contextoMaterias}

Promedio general: ${promedioGeneral.toFixed(1)}

INSTRUCCIONES ESPECÍFICAS:
1. Identifica los TEMAS ESPECÍFICOS donde el estudiante tiene las notas más bajas en cada asignatura
2. Genera un plan de refuerzo con máximo 4 puntos concretos (2 por asignatura)
3. Cada punto debe mencionar el TEMA ESPECÍFICO a reforzar (por ejemplo: "Refuerza operaciones con fracciones" en lugar de solo "Refuerza Matemáticas")
4. Si el nombre de la actividad no indica claramente el tema, infiere el tema desde el contexto educativo típico del curso

FORMATO DE RESPUESTA:
- Lista simple sin numeración
- 1 línea por punto con el tema específico
- Máximo 10 palabras por punto (solo el tema, sin verbos de acción)
- Enfoque en temas específicos y concretos

Ejemplo de respuesta esperada:
Operaciones con fracciones y decimales
Resolución de problemas algebraicos
Conceptos de célula y tejidos
Ecosistemas y cadenas alimenticias`
        : `You are an expert educational tutor. Analyze the following lowest-performing subjects:

${contextoMaterias}

Overall average: ${promedioGeneral.toFixed(1)}

SPECIFIC INSTRUCTIONS:
1. Identify SPECIFIC TOPICS where the student has the lowest grades in each subject
2. Generate a reinforcement plan with maximum 4 concrete points (2 per subject)
3. Each point should mention the SPECIFIC TOPIC to reinforce (e.g., "Reinforce operations with fractions" instead of just "Reinforce Math")
4. If activity name doesn't clearly indicate the topic, infer the topic from typical educational context

RESPONSE FORMAT:
- Simple list without numbering
- 1 line per point with the specific topic
- Maximum 10 words per point (just the topic, no action verbs)
- Focus on specific and concrete topics

Expected response example:
Operations with fractions and decimals
Solving algebraic problems
Cell and tissue concepts
Ecosystems and food chains`;

      console.log('[Monito] 🤖 Consultando IA con contexto detallado...');
      
      const response = await fetch('/api/gemini/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        console.log('[Monito] ⚠️ IA no disponible, usando plan local');
        return [];
      }
      
      const data = await response.json();
      const raw = (data.suggestion || '').trim();
      
      // Separar por posibles delimitadores
      const lines = raw
        .split(/\n|•|\-|\*/)
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 5);
      
      console.log('[Monito] ✅ Plan generado por IA:', lines.slice(0, 4));
      return lines.slice(0, 4); // Máximo 4 puntos
    } catch (e) {
      console.debug('[Monito] ❌ Error en análisis IA:', e);
      return [];
    }
  };

  const generarPlanRefuerzoIA = async (materias: string[], promedio: number, lang: string): Promise<string[]> => {
    try {
      const prompt = lang === 'es'
        ? `Eres un tutor educativo. Genera un plan de refuerzo muy breve (bullet points cortos, máximo 2 por materia) para las materias: ${materias.join(', ')}. Promedio global: ${promedio.toFixed(1)}. Formato: lista sin numeración, 1 línea por punto, concisa.`
        : `You are an educational tutor. Generate a very short reinforcement plan (short bullet points, max 2 per subject) for subjects: ${materias.join(', ')}. Global average: ${promedio.toFixed(1)}. Format: list without numbers, 1 line per point, concise.`;
      const response = await fetch('/api/gemini/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) return [];
      const data = await response.json();
      const raw = (data.suggestion || '').trim();
      // Separar por posibles delimitadores
      const lines = raw
        .split(/\n|•|\-|\*/)
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 3);
      return lines.slice(0, materias.length * 2);
    } catch (e) {
      console.debug('IA plan fallback (error):', e);
      return [];
    }
  };

  // Obtener sugerencia de IA (Gemini)
  const obtenerSugerenciaIA = async (): Promise<Sugerencia> => {
    try {
      // Preparar el prompt
      const prompt = language === 'es'
        ? `Genera una sugerencia motivacional corta (máximo 80 caracteres) para un estudiante que está viendo su perfil. Debe ser positiva y animarlo a estudiar. Solo responde con la sugerencia, sin comillas ni explicaciones adicionales.`
        : `Generate a short motivational suggestion (maximum 80 characters) for a student viewing their profile. It should be positive and encourage them to study. Only respond with the suggestion, no quotes or additional explanations.`;

      // Llamar a la API de Gemini
      const response = await fetch('/api/gemini/suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          texto: data.suggestion || sugerenciasMotivacion[0].texto,
          tipo: 'motivacion',
          icono: Brain
        };
      }
    } catch (error) {
      console.error('Error obteniendo sugerencia de IA:', error);
    }

    // Fallback a sugerencia aleatoria por defecto
    return sugerenciasMotivacion[Math.floor(Math.random() * sugerenciasMotivacion.length)];
  };

  // Animación de flotación con movimiento controlado en esquina superior derecha
  useEffect(() => {
    if (!mounted) return;

    let direccionY = 1;
    let direccionX = 1;
    let velocidadY = Math.random() * 1.5 + 0.5; // Velocidad variable entre 0.5 y 2
    let velocidadX = Math.random() * 1 + 0.3; // Velocidad horizontal más lenta

    // Límites de movimiento (mantener en la parte superior derecha)
    const maxY = 140;  // no bajar demasiado
    const minY = -10;  // apenas subir por encima del centro
    const maxX = 0;    // no sobrepasar hacia la derecha
    const minX = -40;  // leve movimiento hacia la izquierda

    const intervalo = setInterval(() => {
      setPosicionY(prev => {
        const nueva = prev + velocidadY * direccionY;
        // Mantener dentro de los límites verticales
        if (nueva > maxY) {
          direccionY = -1;
          velocidadY = Math.random() * 1.5 + 0.5;
        } else if (nueva < minY) {
          direccionY = 1;
          velocidadY = Math.random() * 1.5 + 0.5;
        }
        return nueva;
      });

      setPosicionX(prev => {
        const nueva = prev + velocidadX * direccionX;
        // Mantener pegado al borde derecho, sin salirse
        if (nueva > maxX) {
          direccionX = -1;
          velocidadX = Math.random() * 1 + 0.3;
        } else if (nueva < minX) {
          direccionX = 1;
          velocidadX = Math.random() * 1 + 0.3;
        }
        return nueva;
      });
    }, 50);

    return () => clearInterval(intervalo);
  }, [mounted]);

  // Manejar click en el monito para consultar calificaciones
  const handleClick = () => {
    console.log('[Monito] 🖱️ Click detectado');
    obtenerSugerenciaPersonalizada();
  };

  // Cambiar sugerencia en hover
  const handleHover = () => {
    setIsHovered(true);
    // Al interactuar deja de parpadear
    setShouldBlink(false);
    setHasAcknowledged(true);
    // Persistir que el usuario ya vio esta recomendación
    if (sugerenciaActual) {
      const adviceKey = `${sugerenciaActual.tipo}|${sugerenciaActual.texto}`;
      try { localStorage.setItem('monito-last-advice-key', adviceKey); } catch {}
    }
  };

  if (!mounted) return null;

  const IconoActual = sugerenciaActual?.icono || Sparkles;
  // Mostrar burbuja cuando está cargando O cuando hay una sugerencia actual
  const mostrarBurbuja = isLoading || sugerenciaActual !== null;

  console.log('[Monito] 🎨 Render:', {
    tieneSugerencia: !!sugerenciaActual,
    tipoDeSugerencia: sugerenciaActual?.tipo,
    tienePlan: sugerenciaActual?.plan?.length || 0,
    compactMode
  });

  // Renderizado compacto (pequeño, mensaje en cabeza)
  return (
    <div ref={containerRef} className="relative">
      <motion.div
        className="relative cursor-pointer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Cuerpo de Monito - Versión más grande y expresiva */}
        <motion.div
          className="relative w-32 h-32 flex items-center justify-center"
          animate={{
            y: [0, -12, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Cuerpo principal */}
          <div className="relative w-24 h-28 bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-500 rounded-full shadow-2xl">
            {/* Ojos expresivos */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3">
              <motion.div
                className="w-3 h-3 bg-white rounded-full shadow-sm"
                animate={shouldBlink ? { scaleY: [1, 0.1, 1] } : {}}
                transition={{ duration: 0.2, repeat: shouldBlink ? Infinity : 0, repeatDelay: 3 }}
              >
                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-0.5 ml-0.5" />
              </motion.div>
              <motion.div
                className="w-3 h-3 bg-white rounded-full shadow-sm"
                animate={shouldBlink ? { scaleY: [1, 0.1, 1] } : {}}
                transition={{ duration: 0.2, repeat: shouldBlink ? Infinity : 0, repeatDelay: 3 }}
              >
                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-0.5 ml-0.5" />
              </motion.div>
            </div>

            {/* Boca sonriente */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-3 border-b-2 border-white rounded-full opacity-90"
              animate={{ scaleX: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />

            {/* Brazos animados */}
            <motion.div
              className="absolute -left-1 top-12 w-2 h-6 bg-indigo-500 rounded-full shadow-md"
              animate={{ rotate: [0, 20, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute -right-1 top-12 w-2 h-6 bg-indigo-500 rounded-full shadow-md"
              animate={{ rotate: [0, -20, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>

          {/* Mensaje a la izquierda de Monito */}
          <AnimatePresence mode="wait">
            {(isLoading || sugerenciaActual) && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-64 z-50"
              >
                <div className="relative">
                  {/* Burbuja de mensaje */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border-2 border-indigo-200 dark:border-indigo-600">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex gap-1.5">
                          <motion.div
                            className="w-2 h-2 bg-indigo-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-purple-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-pink-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 text-center">
                          {language === 'es' ? 'Analizando...' : 'Analyzing...'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-gray-800 dark:text-white leading-relaxed">
                        {sugerenciaActual?.texto}
                      </div>
                    )}
                  </div>
                  
                  {/* Cola de la burbuja apuntando hacia la derecha (hacia Monito) */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-indigo-200 dark:border-l-indigo-600" />
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white dark:border-l-gray-800" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Efecto de brillo */}
          <motion.div
            className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-60"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Partículas flotantes alrededor - más partículas para efecto visual rico */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-400 opacity-40"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2 + Math.random() * 1,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
