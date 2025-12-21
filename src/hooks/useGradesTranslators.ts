/**
 * Hook para traducción de IDs entre formatos de Firebase y LocalStorage/UI
 * 
 * Este hook maneja:
 * - RUT → userId (para studentId)
 * - courseId slug → UUID
 * - sectionId letra → UUID
 */

import { useMemo } from 'react';

interface User {
  id: string;
  rut?: string;
  username?: string;
  displayName?: string;
}

interface Section {
  id: string;
  courseId: string;
  name: string;
  letter?: string;
}

interface Course {
  id: string;
  name: string;
}

interface TranslatorMaps {
  /** Mapa RUT → userId */
  rutToUserId: Map<string, string>;
  /** Mapa userId → RUT */
  userIdToRut: Map<string, string>;
  /** Mapa slug del nombre del curso → UUID del curso */
  courseSlugToUuid: Map<string, string>;
  /** Mapa "courseId|letter" → UUID de la sección */
  sectionIdTranslator: Map<string, string>;
  /** Función para normalizar nombre de curso a slug */
  slugifyCourse: (name?: string) => string;
  /** Función para extraer letra de nombre de sección */
  extractLetter: (name?: string) => string | null;
}

/**
 * Normaliza un nombre de curso a un slug (sin acentos, lowercase, underscores)
 */
function slugifyCourse(name?: string): string {
  if (!name) return '';
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Extrae la letra de una sección del nombre (ej: "1ro Básico A" → "a")
 */
function extractLetter(name?: string): string | null {
  if (!name) return null;
  const trimmed = String(name).trim();
  // Caso 1: nombre es solo la letra
  if (/^[A-Za-zÑñ]$/.test(trimmed)) return trimmed.toLowerCase();
  // Caso 2: última palabra/letra del nombre ("1ro Básico A", "Sección B")
  const m = trimmed.match(/([A-Za-zÑñ])\s*$/);
  if (m) return m[1].toLowerCase();
  // Caso 3: tomar última letra si es alfabética
  const last = trimmed.split(/\s+/).pop() || '';
  if (/^[A-Za-zÑñ]$/.test(last)) return last.toLowerCase();
  if (/^[A-Za-zÑñ]$/.test(last.slice(-1))) return last.slice(-1).toLowerCase();
  return null;
}

/**
 * Hook que genera mapas de traducción de IDs
 */
export function useGradesTranslators(
  users: User[],
  courses: Course[],
  sections: Section[]
): TranslatorMaps {
  // Mapa RUT → userId y viceversa
  const { rutToUserId, userIdToRut } = useMemo(() => {
    const rutToUserId = new Map<string, string>();
    const userIdToRut = new Map<string, string>();
    
    users.forEach((u) => {
      const uid = String(u.id || '');
      const rut = String(u.rut || '').trim();
      if (uid && rut) {
        rutToUserId.set(rut, uid);
        userIdToRut.set(uid, rut);
      }
    });
    
    return { rutToUserId, userIdToRut };
  }, [users]);

  // Mapa de cursos: slug → UUID
  const courseSlugToUuid = useMemo(() => {
    const map = new Map<string, string>();
    
    courses.forEach(c => {
      const slug = slugifyCourse(c.name);
      if (slug) {
        map.set(slug, String(c.id));
        // Alias sin vocales comunes de importación masiva (legacy)
        map.set(slug.replace('_basico', '_bsico'), String(c.id));
        map.set(slug.replace('_medio', '_mdio'), String(c.id));
      }
    });
    
    return map;
  }, [courses]);

  // Mapa de secciones: "courseId|letter" → UUID
  const sectionIdTranslator = useMemo(() => {
    const map = new Map<string, string>();
    
    sections.forEach(sec => {
      const courseUuid = String(sec.courseId || '');
      const letter = sec.letter 
        ? String(sec.letter).trim().toLowerCase() 
        : extractLetter(sec.name);
      const uuid = String(sec.id || '');
      
      if (courseUuid && letter && uuid) {
        // Clave por UUID del curso (flujo normal)
        map.set(`${courseUuid}|${letter}`, uuid);
        
        // Clave por slug del nombre del curso (para datos importados)
        const courseObj = courses.find(c => String(c.id) === courseUuid);
        const slug = courseObj ? slugifyCourse(courseObj.name) : '';
        if (slug) {
          map.set(`${slug}|${letter}`, uuid);
        }
      }
    });
    
    return map;
  }, [sections, courses]);

  return {
    rutToUserId,
    userIdToRut,
    courseSlugToUuid,
    sectionIdTranslator,
    slugifyCourse,
    extractLetter,
  };
}

/**
 * Traduce un sectionId de letra a UUID usando el courseId
 */
export function translateSectionId(
  sectionId: string,
  courseId: string,
  sectionIdTranslator: Map<string, string>,
  courseSlugToUuid: Map<string, string>,
  slugifyFn: (name?: string) => string = slugifyCourse
): string | null {
  if (!sectionId || sectionId.length > 2) {
    // Ya es un UUID o está vacío
    return null;
  }
  
  const letterKey = sectionId.trim().toLowerCase();
  
  // 1) Intentar con courseId tal cual (si es UUID)
  let translatedId = sectionIdTranslator.get(`${courseId}|${letterKey}`);
  if (translatedId) return translatedId;
  
  // 2) Intentar con slug del courseId
  const slug = slugifyFn(courseId);
  if (slug) {
    translatedId = sectionIdTranslator.get(`${slug}|${letterKey}`);
    if (translatedId) return translatedId;
  }
  
  // 3) Si courseId no parece UUID, mapear a UUID vía courseSlugToUuid
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId)) {
    const maybeUuid = courseSlugToUuid.get(slugifyFn(courseId));
    if (maybeUuid) {
      translatedId = sectionIdTranslator.get(`${maybeUuid}|${letterKey}`);
      if (translatedId) return translatedId;
    }
  }
  
  return null;
}

export { slugifyCourse, extractLetter };
