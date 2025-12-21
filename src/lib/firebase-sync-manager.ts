/**
 * 🔄 FIREBASE SYNC MANAGER
 * 
 * Sistema de sincronización automática entre LocalStorage y Firebase.
 * 
 * PROBLEMA RESUELTO:
 * - Los datos se guardaban solo en LocalStorage (temporal, se pierde al cerrar navegador)
 * - Cada vez que el usuario ingresaba tenía que cargar cursos, estudiantes, calificaciones, etc.
 * 
 * SOLUCIÓN:
 * - Sincronización automática bidireccional LocalStorage ↔ Firebase
 * - Los datos persisten en la nube y están disponibles desde cualquier dispositivo
 * - LocalStorage se usa como caché para velocidad
 * 
 * @author Sistema SuperJF
 * @date 2025-10-15
 */

import { getFirestoreInstance } from '@/lib/firebase-config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

const USE_FIREBASE = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';

// ============================================
// 📊 TIPOS DE DATOS
// ============================================

interface SyncOptions {
  silent?: boolean; // No mostrar logs
  force?: boolean; // Forzar sincronización aunque no haya cambios
}

// ============================================
// 🔄 SINCRONIZACIÓN: ESTRUCTURA ACADÉMICA
// ============================================

/**
 * Sincroniza cursos de LocalStorage a Firebase
 */
export async function syncCoursesToFirebase(year: number, courses: any[], options: SyncOptions = {}) {
  if (!USE_FIREBASE) return;
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    if (!options.silent) {
      console.log(`🔄 Sincronizando ${courses.length} cursos del año ${year} a Firebase...`);
    }
    
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();
    
    for (const course of courses) {
      const courseRef = doc(db, 'courses', course.id);
      batch.set(courseRef, {
        ...course,
        year,
        syncedAt: timestamp,
        updatedAt: timestamp
      }, { merge: true });
    }
    
    await batch.commit();
    
    if (!options.silent) {
      console.log(`✅ ${courses.length} cursos sincronizados a Firebase`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando cursos a Firebase:', error);
    throw error;
  }
}

/**
 * Sincroniza secciones de LocalStorage a Firebase
 */
export async function syncSectionsToFirebase(year: number, sections: any[], options: SyncOptions = {}) {
  if (!USE_FIREBASE) return;
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    if (!options.silent) {
      console.log(`🔄 Sincronizando ${sections.length} secciones del año ${year} a Firebase...`);
    }
    
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();
    
    for (const section of sections) {
      const sectionRef = doc(db, 'sections', section.id);
      batch.set(sectionRef, {
        ...section,
        year,
        syncedAt: timestamp,
        updatedAt: timestamp
      }, { merge: true });
    }
    
    await batch.commit();
    
    if (!options.silent) {
      console.log(`✅ ${sections.length} secciones sincronizadas a Firebase`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando secciones a Firebase:', error);
    throw error;
  }
}

/**
 * Sincroniza estudiantes de LocalStorage a Firebase
 */
export async function syncStudentsToFirebase(year: number, students: any[], options: SyncOptions = {}) {
  if (!USE_FIREBASE) return;
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    if (!options.silent) {
      console.log(`🔄 Sincronizando ${students.length} estudiantes del año ${year} a Firebase...`);
    }
    
    // Dividir en lotes de 500 (límite de Firestore)
    const BATCH_SIZE = 500;
    const timestamp = Timestamp.now();
    
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = students.slice(i, i + BATCH_SIZE);
      
      for (const student of chunk) {
        const studentRef = doc(db, 'students', student.id);
        batch.set(studentRef, {
          ...student,
          year,
          syncedAt: timestamp,
          updatedAt: timestamp
        }, { merge: true });
      }
      
      await batch.commit();
      
      if (!options.silent && students.length > BATCH_SIZE) {
        console.log(`   📦 Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(students.length / BATCH_SIZE)} sincronizado`);
      }
    }
    
    if (!options.silent) {
      console.log(`✅ ${students.length} estudiantes sincronizados a Firebase`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando estudiantes a Firebase:', error);
    throw error;
  }
}

/**
 * Sincroniza profesores de LocalStorage a Firebase
 */
export async function syncTeachersToFirebase(year: number, teachers: any[], options: SyncOptions = {}) {
  if (!USE_FIREBASE) return;
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    if (!options.silent) {
      console.log(`🔄 Sincronizando ${teachers.length} profesores del año ${year} a Firebase...`);
    }
    
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();
    
    for (const teacher of teachers) {
      const teacherRef = doc(db, 'teachers', teacher.id);
      batch.set(teacherRef, {
        ...teacher,
        year,
        syncedAt: timestamp,
        updatedAt: timestamp
      }, { merge: true });
    }
    
    await batch.commit();
    
    if (!options.silent) {
      console.log(`✅ ${teachers.length} profesores sincronizados a Firebase`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando profesores a Firebase:', error);
    throw error;
  }
}

/**
 * Sincroniza asignaturas de LocalStorage a Firebase
 */
export async function syncSubjectsToFirebase(year: number, subjects: any[], options: SyncOptions = {}) {
  if (!USE_FIREBASE) return;
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    if (!options.silent) {
      console.log(`🔄 Sincronizando ${subjects.length} asignaturas del año ${year} a Firebase...`);
    }
    
    const batch = writeBatch(db);
    const timestamp = Timestamp.now();
    
    for (const subject of subjects) {
      const subjectRef = doc(db, 'subjects', subject.id);
      batch.set(subjectRef, {
        ...subject,
        year,
        syncedAt: timestamp,
        updatedAt: timestamp
      }, { merge: true });
    }
    
    await batch.commit();
    
    if (!options.silent) {
      console.log(`✅ ${subjects.length} asignaturas sincronizadas a Firebase`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando asignaturas a Firebase:', error);
    throw error;
  }
}

/**
 * Sincroniza asignaciones de estudiantes de LocalStorage a Firebase
 */
export async function syncStudentAssignmentsToFirebase(year: number, assignments: any[], options: SyncOptions = {}) {
  if (!USE_FIREBASE) return;
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    if (!options.silent) {
      console.log(`🔄 Sincronizando ${assignments.length} asignaciones de estudiantes del año ${year} a Firebase...`);
    }
    
    // Dividir en lotes de 500
    const BATCH_SIZE = 500;
    const timestamp = Timestamp.now();
    
    for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = assignments.slice(i, i + BATCH_SIZE);
      
      for (const assignment of chunk) {
        const assignmentRef = doc(db, 'studentAssignments', assignment.id);
        batch.set(assignmentRef, {
          ...assignment,
          year,
          syncedAt: timestamp,
          updatedAt: timestamp
        }, { merge: true });
      }
      
      await batch.commit();
      
      if (!options.silent && assignments.length > BATCH_SIZE) {
        console.log(`   📦 Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(assignments.length / BATCH_SIZE)} sincronizado`);
      }
    }
    
    if (!options.silent) {
      console.log(`✅ ${assignments.length} asignaciones sincronizadas a Firebase`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando asignaciones a Firebase:', error);
    throw error;
  }
}

/**
 * Sincroniza asignaciones de profesores de LocalStorage a Firebase
 */
export async function syncTeacherAssignmentsToFirebase(year: number, assignments: any[], options: SyncOptions = {}) {
  if (!USE_FIREBASE) return;
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    if (!options.silent) {
      console.log(`🔄 Sincronizando ${assignments.length} asignaciones de profesores del año ${year} a Firebase...`);
    }
    
    const BATCH_SIZE = 500;
    const timestamp = Timestamp.now();
    
    for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = assignments.slice(i, i + BATCH_SIZE);
      
      for (const assignment of chunk) {
        const assignmentRef = doc(db, 'teacherAssignments', assignment.id);
        batch.set(assignmentRef, {
          ...assignment,
          year,
          syncedAt: timestamp,
          updatedAt: timestamp
        }, { merge: true });
      }
      
      await batch.commit();
      
      if (!options.silent && assignments.length > BATCH_SIZE) {
        console.log(`   📦 Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(assignments.length / BATCH_SIZE)} sincronizado`);
      }
    }
    
    if (!options.silent) {
      console.log(`✅ ${assignments.length} asignaciones de profesores sincronizadas a Firebase`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando asignaciones de profesores a Firebase:', error);
    throw error;
  }
}

// ============================================
// 📥 CARGA DESDE FIREBASE
// ============================================

/**
 * Carga cursos desde Firebase para un año específico
 */
export async function loadCoursesFromFirebase(year: number): Promise<any[]> {
  if (!USE_FIREBASE) return [];
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    console.log(`📥 Cargando cursos del año ${year} desde Firebase...`);
    
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('year', '==', year));
    const snapshot = await getDocs(q);
    
    const courses = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    console.log(`✅ ${courses.length} cursos cargados desde Firebase`);
    return courses;
  } catch (error) {
    console.error('❌ Error cargando cursos desde Firebase:', error);
    return [];
  }
}

/**
 * Carga secciones desde Firebase para un año específico
 */
export async function loadSectionsFromFirebase(year: number): Promise<any[]> {
  if (!USE_FIREBASE) return [];
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    console.log(`📥 Cargando secciones del año ${year} desde Firebase...`);
    
    const sectionsRef = collection(db, 'sections');
    const q = query(sectionsRef, where('year', '==', year));
    const snapshot = await getDocs(q);
    
    const sections = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    console.log(`✅ ${sections.length} secciones cargadas desde Firebase`);
    return sections;
  } catch (error) {
    console.error('❌ Error cargando secciones desde Firebase:', error);
    return [];
  }
}

/**
 * Carga estudiantes desde Firebase para un año específico
 */
export async function loadStudentsFromFirebase(year: number): Promise<any[]> {
  if (!USE_FIREBASE) return [];
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    console.log(`📥 Cargando estudiantes del año ${year} desde Firebase...`);
    
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('year', '==', year));
    const snapshot = await getDocs(q);
    
    const students = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    console.log(`✅ ${students.length} estudiantes cargados desde Firebase`);
    return students;
  } catch (error) {
    console.error('❌ Error cargando estudiantes desde Firebase:', error);
    return [];
  }
}

/**
 * Carga profesores desde Firebase para un año específico
 */
export async function loadTeachersFromFirebase(year: number): Promise<any[]> {
  if (!USE_FIREBASE) return [];
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    console.log(`📥 Cargando profesores del año ${year} desde Firebase...`);
    
    const teachersRef = collection(db, 'teachers');
    const q = query(teachersRef, where('year', '==', year));
    const snapshot = await getDocs(q);
    
    const teachers = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    console.log(`✅ ${teachers.length} profesores cargados desde Firebase`);
    return teachers;
  } catch (error) {
    console.error('❌ Error cargando profesores desde Firebase:', error);
    return [];
  }
}

/**
 * Carga asignaturas desde Firebase para un año específico
 */
export async function loadSubjectsFromFirebase(year: number): Promise<any[]> {
  if (!USE_FIREBASE) return [];
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    console.log(`📥 Cargando asignaturas del año ${year} desde Firebase...`);
    
    const subjectsRef = collection(db, 'subjects');
    const q = query(subjectsRef, where('year', '==', year));
    const snapshot = await getDocs(q);
    
    const subjects = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    console.log(`✅ ${subjects.length} asignaturas cargadas desde Firebase`);
    return subjects;
  } catch (error) {
    console.error('❌ Error cargando asignaturas desde Firebase:', error);
    return [];
  }
}

/**
 * Carga asignaciones de estudiantes desde Firebase
 */
export async function loadStudentAssignmentsFromFirebase(year: number): Promise<any[]> {
  if (!USE_FIREBASE) return [];
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    console.log(`📥 Cargando asignaciones de estudiantes del año ${year} desde Firebase...`);
    
    const assignmentsRef = collection(db, 'studentAssignments');
    const q = query(assignmentsRef, where('year', '==', year));
    const snapshot = await getDocs(q);
    
    const assignments = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    console.log(`✅ ${assignments.length} asignaciones cargadas desde Firebase`);
    return assignments;
  } catch (error) {
    console.error('❌ Error cargando asignaciones desde Firebase:', error);
    return [];
  }
}

/**
 * Carga asignaciones de profesores desde Firebase
 */
export async function loadTeacherAssignmentsFromFirebase(year: number): Promise<any[]> {
  if (!USE_FIREBASE) return [];
  
  try {
    const db = getFirestoreInstance();
    if (!db) throw new Error('Firestore no inicializado');
    
    console.log(`📥 Cargando asignaciones de profesores del año ${year} desde Firebase...`);
    
    const assignmentsRef = collection(db, 'teacherAssignments');
    const q = query(assignmentsRef, where('year', '==', year));
    const snapshot = await getDocs(q);
    
    const assignments = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    console.log(`✅ ${assignments.length} asignaciones de profesores cargadas desde Firebase`);
    return assignments;
  } catch (error) {
    console.error('❌ Error cargando asignaciones de profesores desde Firebase:', error);
    return [];
  }
}

// ============================================
// 🔄 SINCRONIZACIÓN COMPLETA
// ============================================

/**
 * Sincroniza TODOS los datos de un año desde LocalStorage a Firebase
 */
export async function syncAllDataToFirebase(
  year: number,
  data: {
    courses?: any[];
    sections?: any[];
    students?: any[];
    teachers?: any[];
    subjects?: any[];
    studentAssignments?: any[];
    teacherAssignments?: any[];
  },
  options: SyncOptions = {}
): Promise<void> {
  if (!USE_FIREBASE) {
    console.warn('⚠️ Firebase no está habilitado. Los datos solo se guardarán en LocalStorage.');
    return;
  }
  
  console.log(`\n🔄 ========== SINCRONIZACIÓN COMPLETA A FIREBASE ==========`);
  console.log(`📅 Año: ${year}`);
  console.log(`📊 Datos a sincronizar:`);
  if (data.courses) console.log(`   • Cursos: ${data.courses.length}`);
  if (data.sections) console.log(`   • Secciones: ${data.sections.length}`);
  if (data.students) console.log(`   • Estudiantes: ${data.students.length}`);
  if (data.teachers) console.log(`   • Profesores: ${data.teachers.length}`);
  if (data.subjects) console.log(`   • Asignaturas: ${data.subjects.length}`);
  if (data.studentAssignments) console.log(`   • Asignaciones estudiantes: ${data.studentAssignments.length}`);
  if (data.teacherAssignments) console.log(`   • Asignaciones profesores: ${data.teacherAssignments.length}`);
  
  try {
    if (data.courses && data.courses.length > 0) {
      await syncCoursesToFirebase(year, data.courses, { silent: true });
    }
    
    if (data.sections && data.sections.length > 0) {
      await syncSectionsToFirebase(year, data.sections, { silent: true });
    }
    
    if (data.students && data.students.length > 0) {
      await syncStudentsToFirebase(year, data.students, { silent: true });
    }
    
    if (data.teachers && data.teachers.length > 0) {
      await syncTeachersToFirebase(year, data.teachers, { silent: true });
    }
    
    if (data.subjects && data.subjects.length > 0) {
      await syncSubjectsToFirebase(year, data.subjects, { silent: true });
    }
    
    if (data.studentAssignments && data.studentAssignments.length > 0) {
      await syncStudentAssignmentsToFirebase(year, data.studentAssignments, { silent: true });
    }
    
    if (data.teacherAssignments && data.teacherAssignments.length > 0) {
      await syncTeacherAssignmentsToFirebase(year, data.teacherAssignments, { silent: true });
    }
    
    console.log(`✅ ========== SINCRONIZACIÓN COMPLETADA ==========\n`);
  } catch (error) {
    console.error(`❌ Error en sincronización completa:`, error);
    throw error;
  }
}

/**
 * Carga TODOS los datos de un año desde Firebase a LocalStorage
 */
export async function loadAllDataFromFirebase(year: number): Promise<{
  courses: any[];
  sections: any[];
  students: any[];
  teachers: any[];
  subjects: any[];
  studentAssignments: any[];
  teacherAssignments: any[];
}> {
  if (!USE_FIREBASE) {
    console.warn('⚠️ Firebase no está habilitado.');
    return {
      courses: [],
      sections: [],
      students: [],
      teachers: [],
      subjects: [],
      studentAssignments: [],
      teacherAssignments: []
    };
  }
  
  console.log(`\n📥 ========== CARGA COMPLETA DESDE FIREBASE ==========`);
  console.log(`📅 Año: ${year}`);
  
  try {
    const [
      courses,
      sections,
      students,
      teachers,
      subjects,
      studentAssignments,
      teacherAssignments
    ] = await Promise.all([
      loadCoursesFromFirebase(year),
      loadSectionsFromFirebase(year),
      loadStudentsFromFirebase(year),
      loadTeachersFromFirebase(year),
      loadSubjectsFromFirebase(year),
      loadStudentAssignmentsFromFirebase(year),
      loadTeacherAssignmentsFromFirebase(year)
    ]);
    
    console.log(`\n📊 Datos cargados desde Firebase:`);
    console.log(`   • Cursos: ${courses.length}`);
    console.log(`   • Secciones: ${sections.length}`);
    console.log(`   • Estudiantes: ${students.length}`);
    console.log(`   • Profesores: ${teachers.length}`);
    console.log(`   • Asignaturas: ${subjects.length}`);
    console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
    console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
    console.log(`✅ ========== CARGA COMPLETADA ==========\n`);
    
    return {
      courses,
      sections,
      students,
      teachers,
      subjects,
      studentAssignments,
      teacherAssignments
    };
  } catch (error) {
    console.error(`❌ Error en carga completa desde Firebase:`, error);
    throw error;
  }
}
