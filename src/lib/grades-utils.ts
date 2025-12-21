/**
 * Utilidades para procesamiento de calificaciones
 * 
 * Contiene funciones de:
 * - Normalización de asignaturas
 * - Filtrado de calificaciones
 * - Cálculo de promedios
 */

/**
 * Normaliza una cadena eliminando acentos y caracteres especiales
 */
export function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza nombre de asignatura con mapeo de alias conocidos
 */
export function normSubject(name: string): string {
  const n = norm(name);
  
  // Mapeo de alias comunes
  const aliases: Record<string, string> = {
    'lenguaje y comunicacion': 'lenguaje y comunicacion',
    'lenguaje': 'lenguaje y comunicacion',
    'lengua': 'lenguaje y comunicacion',
    'castellano': 'lenguaje y comunicacion',
    'matematicas': 'matematicas',
    'matematica': 'matematicas',
    'mate': 'matematicas',
    'historia y geografia': 'historia y geografia',
    'historia': 'historia y geografia',
    'historia geografia y ciencias sociales': 'historia y geografia',
    'ciencias naturales': 'ciencias naturales',
    'ciencias': 'ciencias naturales',
    'ingles': 'ingles',
    'english': 'ingles',
    'educacion fisica': 'educacion fisica',
    'ed fisica': 'educacion fisica',
    'educacion fisica y salud': 'educacion fisica',
    'artes visuales': 'artes visuales',
    'arte': 'artes visuales',
    'musica': 'musica',
    'tecnologia': 'tecnologia',
    'orientacion': 'orientacion',
  };
  
  return aliases[n] || n;
}

/**
 * Nombre canónico para asignaturas (elimina sufijos descriptivos)
 */
export function canonicalSubject(name: string): string {
  let n = normSubject(name);
  
  // Quitar sufijos comunes que no son parte del nombre base
  n = n.replace(/\s*\(.*\)$/, ''); // (Básica), (Media), etc.
  n = n.replace(/\s*-\s*\d+.*$/, ''); // - 1, - 2do, etc.
  
  return n.trim();
}

/**
 * Compara dos nombres de asignatura de forma flexible
 */
export function nearEqual(a: string, b: string): boolean {
  const na = canonicalSubject(a);
  const nb = canonicalSubject(b);
  
  if (na === nb) return true;
  
  // Comparación parcial (uno contiene al otro)
  if (na.includes(nb) || nb.includes(na)) return true;
  
  // Comparar palabras clave
  const wordsA = na.split(/\s+/).filter(w => w.length > 2);
  const wordsB = nb.split(/\s+/).filter(w => w.length > 2);
  
  // Si comparten al menos 2 palabras clave, considerarlos iguales
  const shared = wordsA.filter(w => wordsB.includes(w));
  if (shared.length >= 2) return true;
  
  return false;
}

/**
 * Determina el nivel de un curso por su nombre
 */
export function getCourseLevel(courseName?: string): 'basica' | 'media' | null {
  if (!courseName) return null;
  const n = norm(courseName);
  
  if (n.includes('basico') || n.includes('básico')) return 'basica';
  if (n.includes('medio') || n.includes('media')) return 'media';
  
  return null;
}

/**
 * Extrae el número ordinal de un curso (1ro → 1, 2do → 2, etc.)
 */
export function getCourseNumber(courseName?: string): number | null {
  if (!courseName) return null;
  
  const match = courseName.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Calcula el semestre de una fecha
 * @param date Fecha a evaluar
 * @returns '1' para primer semestre (marzo-junio), '2' para segundo (julio-diciembre)
 */
export function getSemesterFromDate(date: Date | number | string): '1' | '2' {
  const d = new Date(date);
  const month = d.getMonth(); // 0-indexed
  
  // Marzo (2) - Junio (5) = 1er semestre
  // Julio (6) - Diciembre (11) = 2do semestre
  return month >= 2 && month <= 5 ? '1' : '2';
}

/**
 * Verifica si una fecha está dentro de un rango de semestre
 */
export function isInSemester(
  date: Date | number | string,
  semester: '1' | '2' | 'all',
  year: number
): boolean {
  if (semester === 'all') return true;
  
  const d = new Date(date);
  if (d.getFullYear() !== year) return false;
  
  return getSemesterFromDate(d) === semester;
}

/**
 * Calcula el promedio de un array de notas
 */
export function calculateAverage(scores: number[]): number | null {
  if (!scores || scores.length === 0) return null;
  
  const validScores = scores.filter(s => typeof s === 'number' && !isNaN(s));
  if (validScores.length === 0) return null;
  
  const sum = validScores.reduce((acc, s) => acc + s, 0);
  return sum / validScores.length;
}

/**
 * Convierte una nota de escala 1-100 a 1.0-7.0
 */
export function convertTo7Scale(score: number): number {
  // Fórmula: nota = 1 + (score / 100) * 6
  return 1 + (score / 100) * 6;
}

/**
 * Convierte una nota de escala 1.0-7.0 a 1-100
 */
export function convertTo100Scale(score: number): number {
  // Fórmula: score = (nota - 1) / 6 * 100
  return ((score - 1) / 6) * 100;
}

/**
 * Determina si una nota es aprobatoria
 * @param score Nota (puede ser escala 1-100 o 1-7)
 * @returns true si aprueba
 */
export function isPassing(score: number): boolean {
  // Detectar escala automáticamente
  if (score > 7) {
    // Escala 1-100: aprueba con 60+
    return score >= 60;
  } else {
    // Escala 1-7: aprueba con 4.0+
    return score >= 4.0;
  }
}
