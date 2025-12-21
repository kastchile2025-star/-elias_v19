// Colores pasteles y abreviaciones para asignaturas - basado en los datos de libros
import { getAllSubjects } from './books-data';

export interface SubjectColor {
  name: string;
  abbreviation: string; // 3 letras
  color: string;
  bgColor: string;
  textColor: string;
}

// Mapeo manual de asignaturas con abreviaciones de 3 letras y colores pasteles característicos
const SUBJECT_MAPPINGS: Record<string, Omit<SubjectColor, 'name'>> = {
  // Asignaturas de Educación Básica
  'Ciencias Naturales': {
    abbreviation: 'CNT',
    color: 'green',
    bgColor: '#bbf7d0', // bg-green-200
    textColor: '#14532d'  // text-green-900
  },
  'Historia, Geografía y Ciencias Sociales': {
    abbreviation: 'HIS',
    color: 'yellow',
    bgColor: '#fef3c7', // bg-yellow-200
    textColor: '#78350f'  // text-yellow-900
  },
  'Lenguaje y Comunicación': {
    abbreviation: 'LEN',
    color: 'red',
    bgColor: '#fecaca', // bg-red-200
    textColor: '#7f1d1d'  // text-red-900
  },
  'Matemáticas': {
    abbreviation: 'MAT',
    color: 'blue',
    bgColor: '#bfdbfe', // bg-blue-200
    textColor: '#1e3a8a'  // text-blue-900
  },
  
  // Asignaturas de Educación Media
  'Biología': {
    abbreviation: 'BIO',
    color: 'green',
    bgColor: '#bbf7d0', // bg-green-200
    textColor: '#14532d'  // text-green-900
  },
  'Física': {
    abbreviation: 'FIS',
    color: 'purple',
    bgColor: '#e9d5ff', // bg-purple-200
    textColor: '#581c87'  // text-purple-900
  },
  'Química': {
    abbreviation: 'QUI',
    color: 'pink',
    bgColor: '#fecdd3', // bg-pink-200
    textColor: '#831843'  // text-pink-900
  },
  'Ciencias para la Ciudadanía': {
    abbreviation: 'CPC',
    color: 'teal',
    bgColor: '#99f6e4', // bg-teal-200
    textColor: '#134e4a'  // text-teal-900
  },
  'Educación Ciudadana': {
    abbreviation: 'EDC',
    color: 'indigo',
    bgColor: '#c7d2fe', // bg-indigo-200
    textColor: '#312e81'  // text-indigo-900
  },
  'Filosofía': {
    abbreviation: 'FIL',
    color: 'gray',
    bgColor: '#e5e7eb', // bg-gray-200
    textColor: '#111827'  // text-gray-900
  }
};

// Color por defecto para asignaturas no mapeadas
const DEFAULT_SUBJECT_COLOR = {
  abbreviation: 'ASG',
  color: 'gray',
  bgColor: 'bg-gray-100',
  textColor: 'text-gray-800'
};

// Función para generar abreviación automática de 3 letras si no está mapeada
function generateAbbreviation(subjectName: string): string {
  const words = subjectName.split(' ');
  
  if (words.length >= 3) {
    // Tomar primera letra de las primeras 3 palabras
    return words.slice(0, 3).map(word => word[0]?.toUpperCase() || '').join('');
  } else if (words.length === 2) {
    // Primera letra + primera letra + segunda letra de segunda palabra
    const first = words[0][0]?.toUpperCase() || '';
    const second = words[1][0]?.toUpperCase() || '';
    const third = words[1][1]?.toUpperCase() || words[0][1]?.toUpperCase() || '';
    return first + second + third;
  } else {
    // Primera palabra: primeras 3 letras
    return subjectName.substring(0, 3).toUpperCase();
  }
}

// Función para obtener el color y abreviación de una asignatura
export function getSubjectColor(subjectName: string): SubjectColor {
  const mapping = SUBJECT_MAPPINGS[subjectName];
  
  if (mapping) {
    return {
      name: subjectName,
      ...mapping
    };
  }
  
  // Generar automáticamente para asignaturas no mapeadas
  return {
    name: subjectName,
    abbreviation: generateAbbreviation(subjectName),
    color: DEFAULT_SUBJECT_COLOR.color,
    bgColor: DEFAULT_SUBJECT_COLOR.bgColor,
    textColor: DEFAULT_SUBJECT_COLOR.textColor
  };
}

// Función para obtener todas las asignaturas con sus colores y abreviaciones
export function getAllSubjectsWithColors(): SubjectColor[] {
  const subjects = getAllSubjects();
  return subjects.map(subject => getSubjectColor(subject));
}

// Función para obtener asignaturas específicas para un curso con colores y abreviaciones
export function getSubjectsForCourseWithColors(course: string): SubjectColor[] {
  const { getSubjectsForCourse } = require('./books-data');
  const courseSubjects: string[] = getSubjectsForCourse(course);
  return courseSubjects.map((subject: string) => getSubjectColor(subject));
}

// Función para verificar si una asignatura existe en el sistema de libros
export function isValidSubject(subjectName: string): boolean {
  const subjects = getAllSubjects();
  return subjects.includes(subjectName);
}

// Función para obtener todas las asignaturas disponibles (para selectors)
export function getAvailableSubjects(): { value: string; label: string; abbreviation: string; colors: SubjectColor }[] {
  const subjects = getAllSubjects();
  return subjects.map(subject => {
    const colors = getSubjectColor(subject);
    return {
      value: subject,
      label: subject,
      abbreviation: colors.abbreviation,
      colors
    };
  });
}

// Función para obtener asignaturas por nivel educativo
export function getSubjectsForLevel(level: 'basica' | 'media'): SubjectColor[] {
  const basicSubjects = [
    'Ciencias Naturales',
    'Historia, Geografía y Ciencias Sociales', 
    'Lenguaje y Comunicación',
    'Matemáticas'
  ];
  
  const mediaSubjects = [
    'Biología',
    'Física',
    'Química',
    'Historia, Geografía y Ciencias Sociales',
    'Lenguaje y Comunicación',
    'Matemáticas',
    'Filosofía',
    'Educación Ciudadana'
  ];
  
  const subjects = level === 'basica' ? basicSubjects : mediaSubjects;
  return subjects.map(subject => getSubjectColor(subject));
}

// Función para obtener todas las asignaturas disponibles (básica + media sin duplicados)
export function getAllAvailableSubjects(): SubjectColor[] {
  // Unir: asignaturas desde libros + claves explícitas mapeadas (asegura incluir CPC, etc.)
  const fromBooks = getAllSubjects();
  const fromMappings = Object.keys(SUBJECT_MAPPINGS);

  const unique = new Set<string>([...fromBooks, ...fromMappings]);
  return [...unique].map(subject => getSubjectColor(subject));
}
