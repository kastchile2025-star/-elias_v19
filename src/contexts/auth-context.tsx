"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initializeSQL } from '@/lib/sql-init';

export type UserRole = 'admin' | 'student' | 'teacher' | 'estudiante';

// Interface for teacher-subject assignment
export interface TeacherSubjectAssignment {
  teacherUsername: string;
  teacherName: string;
  subject: string;
  courses: string[]; // Courses where this teacher teaches this subject
}

// Extended user interface
export interface User {
  id: string; // Unique identifier
  username: string;
  role: UserRole;
  displayName: string;
  activeCourses: string[]; // Cursos a los que tiene acceso (will become array of course IDs)
  email?: string;
  rut?: string; // RUT del estudiante para vincular con calificaciones en Firebase
  // For students: their assigned teachers by subject
  assignedTeachers?: Record<string, string>; // { subject: teacherUsername } (will become teacher IDs)
  // For teachers: subjects they teach and in which courses
  teachingAssignments?: TeacherSubjectAssignment[]; // This might also need to reference course IDs
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasAccessToCourse: (course: string) => boolean;
  isAdmin: () => boolean;
  getAccessibleCourses: () => string[];
  refreshUser: () => void; // Nueva función para actualizar el usuario
}

// Mock users database
const USERS: Record<string, {
  id: string; // Added ID
  password: string; 
  role: UserRole; 
  displayName: string; 
  activeCourses: string[]; 
  email?: string;
  assignedTeachers?: Record<string, string>;
  teachingAssignments?: TeacherSubjectAssignment[];
}> = {
  'admin': {
    id: 'admin', // Added ID
    password: '1234',
    role: 'admin',
    displayName: 'Administrador',
    activeCourses: [], // Admin tiene acceso a todos los cursos
    email: 'admin@smartstudent.com'
  },
  'felipe': {
    id: 'felipe', // Added ID
    password: '1234',
    role: 'student',
    displayName: 'Felipe',
    activeCourses: ['4to Básico'], // Estudiante solo 1 curso activo
    email: 'felipe@student.com',
    assignedTeachers: {
      'Matemáticas': 'jorge',
      'Ciencias Naturales': 'carlos',
      'Lenguaje y Comunicación': 'jorge',
      'Historia, Geografía y Ciencias Sociales': 'carlos'
    }
  },
  'jorge': {
    id: 'jorge', // Added ID
    password: '1234',
    role: 'teacher',
    displayName: 'Jorge Profesor',
    activeCourses: ['4to Básico', '5to Básico'], // Profesor con múltiples cursos
    email: 'jorge@teacher.com',
    teachingAssignments: [
      {
        teacherUsername: 'jorge',
        teacherName: 'Jorge Profesor',
        subject: 'Matemáticas',
        courses: ['4to Básico', '5to Básico']
      },
      {
        teacherUsername: 'jorge',
        teacherName: 'Jorge Profesor',
        subject: 'Lenguaje y Comunicación',
        courses: ['4to Básico', '5to Básico']
      }
    ]
  },
  'maria': {
    id: 'maria', // Added ID
    password: '1234',
    role: 'student',
    displayName: 'María Estudiante',
    activeCourses: ['1ro Básico'], // Estudiante de primer año
    email: 'maria@student.com',
    assignedTeachers: {
      'Matemáticas': 'carlos',
      'Ciencias Naturales': 'carlos',
      'Lenguaje y Comunicación': 'carlos',
      'Historia, Geografía y Ciencias Sociales': 'carlos'
    }
  },
  'carlos': {
    id: 'carlos', // Added ID
    password: '1234',
    role: 'teacher',
    displayName: 'Carlos Profesor',
    activeCourses: ['1ro Básico', '2do Básico', '4to Básico'], // Profesor de múltiples años
    email: 'carlos@teacher.com',
    teachingAssignments: [
      {
        teacherUsername: 'carlos',
        teacherName: 'Carlos Profesor',
        subject: 'Ciencias Naturales',
        courses: ['1ro Básico', '2do Básico', '4to Básico']
      },
      {
        teacherUsername: 'carlos',
        teacherName: 'Carlos Profesor',
        subject: 'Historia, Geografía y Ciencias Sociales',
        courses: ['1ro Básico', '2do Básico', '4to Básico']
      },
      {
        teacherUsername: 'carlos',
        teacherName: 'Carlos Profesor',
        subject: 'Matemáticas',
        courses: ['1ro Básico']
      },
      {
        teacherUsername: 'carlos',
        teacherName: 'Carlos Profesor',
        subject: 'Lenguaje y Comunicación',
        courses: ['1ro Básico']
      }
    ]
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === Helpers de normalización de cursos ===
// Normaliza un nombre de curso con sección ("4to Básico A") a su nombre base ("4to Básico").
function normalizeToBaseCourseName(name: string | undefined | null): string {
  if (!name) return '';
  const str = String(name).trim();
  // Buscar los tokens clave "Básico"/"Basico" o "Medio" y cortar desde el inicio hasta el final del token
  const lower = str.toLowerCase();
  const basicIdx = lower.indexOf('básico') >= 0 ? lower.indexOf('básico') : lower.indexOf('basico');
  const medioIdx = lower.indexOf('medio');
  let cutIdx = -1;
  let tokenLen = 0;
  if (basicIdx >= 0 && (medioIdx < 0 || basicIdx < medioIdx)) {
    cutIdx = basicIdx; tokenLen = 'básico'.length; // longitud no afecta para slice por índice inicial encontrado en lower
  } else if (medioIdx >= 0) {
    cutIdx = medioIdx; tokenLen = 'medio'.length;
  }
  if (cutIdx >= 0) {
    // Determinar el fin real del token respetando el case original
    const end = cutIdx + tokenLen;
    // Tomar substring respetando los índices del string original
    const base = str.substring(0, end).replace(/\s+/g, ' ').trim();
    return base;
  }
  return str;
}

// Resuelve un ID de sección o curso a nombre de curso base, usando localStorage de Gestión de Usuario
function resolveIdToCourseName(id: string): string | null {
  try {
    const sectionsRaw = localStorage.getItem('smart-student-sections');
    const coursesRaw = localStorage.getItem('smart-student-courses');
    const sections = sectionsRaw ? JSON.parse(sectionsRaw) : [];
    const courses = coursesRaw ? JSON.parse(coursesRaw) : [];

    // Intentar como sección primero
    const section = Array.isArray(sections) ? sections.find((s: any) => String(s.id) === String(id)) : null;
    if (section) {
      const course = Array.isArray(courses) ? courses.find((c: any) => String(c.id) === String(section.courseId)) : null;
      return course?.name || null;
    }

    // Intentar como curso directamente
    const course = Array.isArray(courses) ? courses.find((c: any) => String(c.id) === String(id)) : null;
    if (course) return course.name;
  } catch (e) {
    console.warn('[Auth] No se pudo resolver ID a nombre de curso:', e);
  }
  return null;
}

// Obtiene nombres de cursos base normalizados desde activeCourses (que puede contener nombres con sección o IDs)
function computeNormalizedCoursesFromActive(activeCourses: any[]): string[] {
  if (!Array.isArray(activeCourses)) return [];
  const result = new Set<string>();
  for (const entry of activeCourses) {
    // Soportar distintos formatos en activeCourses
    let candidateIdOrName: string;
    if (entry && typeof entry === 'object') {
      const obj: any = entry;
      const possibleId = obj.sectionId ?? obj.courseId ?? obj.id ?? obj.value ?? obj.key;
      const possibleName = obj.name ?? obj.courseName ?? obj.label;
      candidateIdOrName = possibleId != null ? String(possibleId) : String(possibleName ?? '');
    } else {
      candidateIdOrName = String(entry);
    }

    // Intentar resolver como ID a nombre de curso
    const resolvedName = resolveIdToCourseName(candidateIdOrName);
    const nameOrId = resolvedName || candidateIdOrName;
    const base = normalizeToBaseCourseName(nameOrId);
    if (base) result.add(base);
  }
  return Array.from(result);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Perfil actual para namespacing de sesión (por pestaña)
  // Se inicializa SINCRÓNICAMENTE para evitar escribir en 'default' y perder sesión al refrescar
  const [profile, setProfile] = useState<string>(() => {
    const makeAutoProfile = () => {
      try {
        return 'tab-' + (crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10));
      } catch {
        return 'tab-' + Math.random().toString(36).slice(2, 10);
      }
    };

    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('profile')?.trim();
      const fromSession = sessionStorage.getItem('ss-active-profile') || undefined;
      const resolvedRaw = (fromUrl || fromSession || makeAutoProfile());
      const resolved = String(resolvedRaw).toLowerCase();
      try { sessionStorage.setItem('ss-active-profile', resolved); } catch {}
      return resolved;
    } catch {
      const auto = makeAutoProfile();
      try { sessionStorage.setItem('ss-active-profile', auto); } catch {}
      return auto;
    }
  });
  const router = useRouter();

  // Asegurar que la URL incluya el perfil actual sin romper el historial
  useEffect(() => {
    if (!profile) return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('profile') !== profile) {
        url.searchParams.set('profile', profile);
        window.history.replaceState(window.history.state, '', url.toString());
      }
    } catch { /* noop */ }
  }, [profile]);

  // Helper de clave namespaced
  const sessionKey = (key: string) => `smart-student:${profile}:${key}`;

  // Shim: redirigir accesos legacy (smart-student-user/auth) a claves namespaced del perfil actual EN ESTA PESTAÑA
  useEffect(() => {
    if (!profile) return;
    try {
      const sym = '__SS_STORAGE_PATCHED__';
      // Evitar doble parcheo
      if ((window as any)[sym] === profile) return;
      const origGet = Storage.prototype.getItem;
      const origSet = Storage.prototype.setItem;
      const origRem = Storage.prototype.removeItem;
      const isLegacyKey = (k: string) => k === 'smart-student-user' || k === 'smart-student-auth';
      const toNsKey = (k: string) => (k === 'smart-student-user' ? sessionKey('user') : sessionKey('auth'));

      // GET: prioriza namespaced; si no existe, devuelve la clave legacy real
      Storage.prototype.getItem = function(this: Storage, key: string) {
        try {
          const k = String(key);
          if (isLegacyKey(k)) {
            const nsKey = toNsKey(k);
            const nsVal = origGet.call(this, nsKey);
            if (nsVal != null) return nsVal;
            return origGet.call(this, k);
          }
          return origGet.call(this, k);
        } catch { return origGet.call(this, key); }
      } as any;

      // SET: escribe en ambas (namespaced + legacy) para máxima compatibilidad
      Storage.prototype.setItem = function(this: Storage, key: string, value: string) {
        try {
          const k = String(key);
          if (isLegacyKey(k)) {
            try { origSet.call(this, toNsKey(k), value); } catch {}
            try { origSet.call(this, k, value); } catch {}
            return;
          }
          return origSet.call(this, k, value);
        } catch { return origSet.call(this, key, value); }
      } as any;

      // REMOVE: elimina en ambas (namespaced + legacy)
      Storage.prototype.removeItem = function(this: Storage, key: string) {
        try {
          const k = String(key);
          if (isLegacyKey(k)) {
            try { origRem.call(this, toNsKey(k)); } catch {}
            try { origRem.call(this, k); } catch {}
            return;
          }
          return origRem.call(this, k);
        } catch { return origRem.call(this, key); }
      } as any;
      (window as any)[sym] = profile;
    } catch {
      // no-op
    }
  }, [profile]);

  // Cargar estado de sesión respetando el perfil (con migración desde legacy)
  useEffect(() => {
    if (!profile) return;
    try {
      // Primero intentar claves namespaced
      let storedAuth = localStorage.getItem(sessionKey('auth'));
      let storedUser = localStorage.getItem(sessionKey('user'));

      // Fallback/migración desde claves legacy sin namespace
      const legacyAuth = localStorage.getItem('smart-student-auth');
      const legacyUser = localStorage.getItem('smart-student-user');

      if ((storedAuth == null || storedUser == null) && legacyAuth && legacyUser) {
        // Migrar a namespaced para este perfil
        localStorage.setItem(sessionKey('auth'), legacyAuth);
        localStorage.setItem(sessionKey('user'), legacyUser);
        storedAuth = legacyAuth;
        storedUser = legacyUser;
      }

      if (storedAuth === 'true' && storedUser) {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(userData);
      }
    } catch (error) {
      // Si falla parsing, limpiar claves corruptas
      try {
        localStorage.removeItem(sessionKey('auth'));
        localStorage.removeItem(sessionKey('user'));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  // Efecto para actualizar automáticamente los datos del usuario desde localStorage
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const refreshUserData = () => {
      try {
        const storedUsers = localStorage.getItem('smart-student-users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const updatedUser = users.find((u: any) => u.username === user.username);
          
          if (updatedUser) {
            const newUser: User = {
              id: updatedUser.id,
              username: updatedUser.username,
              role: updatedUser.role,
              displayName: updatedUser.displayName,
              activeCourses: updatedUser.activeCourses,
              email: updatedUser.email,
              rut: updatedUser.rut, // 🔑 RUT para vincular con calificaciones
              assignedTeachers: updatedUser.assignedTeachers,
              teachingAssignments: updatedUser.teachingAssignments
            };
            
            // Solo actualizar si hay cambios
            if (JSON.stringify(user.activeCourses) !== JSON.stringify(newUser.activeCourses)) {
              console.log('🔄 Actualizando datos del usuario desde localStorage');
              setUser(newUser);
              localStorage.setItem(sessionKey('user'), JSON.stringify(newUser));
            }
          }
        }
      } catch (error) {
        console.warn('Error al actualizar datos del usuario:', error);
      }
    };

    // Actualizar inmediatamente
    refreshUserData();

    // Configurar un intervalo para verificar cambios cada 2 segundos
    const interval = setInterval(refreshUserData, 2000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.username]);

  const login = async (username: string, pass: string): Promise<boolean> => {
    const userKey = username.toLowerCase();
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Usuario:', userKey);
    console.log('Contraseña ingresada:', pass);
    
    // First try to get user from localStorage (updated by user management)
    let userData: any = undefined;
    let userFoundInStorage = false;
    
    try {
      const storedUsers = localStorage.getItem('smart-student-users');
      console.log('Datos en localStorage:', storedUsers);
      
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log('Usuarios en localStorage:', users);
        const storedUser = users.find((u: any) => u.username === userKey);
        
        if (storedUser) {
          console.log('Usuario encontrado en localStorage:', storedUser);
          console.log('Contraseña almacenada:', storedUser.password);
          userFoundInStorage = true;
          if (storedUser.password === pass) {
            console.log('✅ Contraseña correcta (localStorage)');
            userData = storedUser;
          } else {
            console.log('❌ Contraseña incorrecta (localStorage)');
            // User exists in localStorage but password is wrong
            return false;
          }
        } else {
          console.log('Usuario NO encontrado en localStorage');
        }
      }
    } catch (error) {
      console.warn('Could not load users from localStorage:', error);
    }
    
    // Fallback to static USERS only if user is NOT in localStorage
    if (!userData && !userFoundInStorage) {
      console.log('Intentando con usuarios estáticos...');
      userData = USERS[userKey];
      if (!userData || userData.password !== pass) {
        console.log('❌ Usuario no encontrado o contraseña incorrecta (estático)');
        return false;
      }
      console.log('✅ Login exitoso con usuario estático');
    }
    
    // Validate student course assignment (only one course allowed)
    const safeActiveCourses = Array.isArray(userData.activeCourses) ? userData.activeCourses : [];
    if (userData.role === 'student') {
      if (safeActiveCourses.length > 1) {
        // Fix the data: keep only the first course
        userData.activeCourses = [safeActiveCourses[0]];
        // Update in localStorage if it exists there (only when we fixed data)
        try {
          const storedUsers = localStorage.getItem('smart-student-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const updatedUsers = users.map((u: any) => 
              u.username === userKey ? { ...u, activeCourses: userData.activeCourses } : u
            );
            localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
          }
        } catch (error) {
          console.warn('Could not update user data in localStorage:', error);
        }
      } else if (!Array.isArray(userData.activeCourses)) {
        // Ensure array shape to avoid runtime errors
        userData.activeCourses = [];
      }
    }
    
    const user: User = {
      id: userData.id, // Ensure ID is passed
      username: userKey,
      role: userData.role,
      displayName: userData.displayName,
      activeCourses: Array.isArray(userData.activeCourses) ? userData.activeCourses : [],
      email: userData.email,
      rut: userData.rut, // 🔑 RUT para vincular con calificaciones
      // Ensure assignedTeachers and teachingAssignments are also passed if they exist on userData
      assignedTeachers: userData.assignedTeachers,
      teachingAssignments: userData.teachingAssignments
    };
    
    setIsAuthenticated(true);
    setUser(user);
    // Persistir en claves namespaced y legacy para evitar pérdida de sesión
    try {
      localStorage.setItem(sessionKey('auth'), 'true');
      localStorage.setItem(sessionKey('user'), JSON.stringify(user));
      // También legacy (el shim escribirá en ambas si está activo; esto es redundante pero seguro)
      localStorage.setItem('smart-student-auth', 'true');
      localStorage.setItem('smart-student-user', JSON.stringify(user));
    } catch {}
    
    // Migrate global evaluation history to user-specific key if it exists
    try {
      const globalHistoryKey = 'evaluationHistory';
      const userSpecificHistoryKey = `evaluationHistory_${userKey}`;
      
      const globalHistory = localStorage.getItem(globalHistoryKey);
      const userHistory = localStorage.getItem(userSpecificHistoryKey);
      
      // Only migrate if global history exists and user doesn't have history yet
      if (globalHistory && !userHistory) {
        localStorage.setItem(userSpecificHistoryKey, globalHistory);
        console.log(`Migrated evaluation history for user: ${userKey}`);
      }
    } catch (error) {
      console.warn('Failed to migrate evaluation history:', error);
    }

    // 🚀 INICIALIZAR SQL. La precarga masiva de calificaciones por año puede saturar Firestore
    // en contextos con muchos datos. Por defecto la deshabilitamos y delegamos la carga
    // a consultas optimizadas según filtros dentro de la pestaña Calificaciones.
    console.log('🔌 Iniciando conexión SQL post-login...');
    initializeSQL().then(async (success) => {
      if (success) {
        console.log('✅ SQL conectado inmediatamente post-login');
        
        // 🔕 Precarga global DESHABILITADA por defecto
        // Habilítala solo si configuraste explícitamente la flag
        const prefetchEnabled = (
          (typeof window !== 'undefined' && localStorage.getItem('prefetch-grades-on-login') === '1') ||
          (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PREFETCH_GRADES === '1')
        );
        if (prefetchEnabled) {
          // 🔥 Precarga opcional (bajo flag)
          try {
            const currentYear = new Date().getFullYear();
            console.log(`📊 [Prefetch] Cargando calificaciones del año ${currentYear} desde Firebase...`);
            const { firestoreDB } = await import('@/lib/firestore-database');
            const { isFirebaseEnabled } = await import('@/lib/sql-config');
            if (isFirebaseEnabled()) {
              const grades = await firestoreDB.getGradesByYear(currentYear);
              if (grades && grades.length > 0) {
                console.log(`✅ [Prefetch] ${grades.length} calificaciones`);
                const { LocalStorageManager } = await import('@/lib/education-utils');
                LocalStorageManager.setTestGradesForYear(currentYear, grades, { preferSession: false });
                window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
                  detail: { year: currentYear, count: grades.length, timestamp: Date.now(), skipFirebaseReload: true } 
                }));
              }
            }
          } catch (error) {
            console.warn('⚠️ [Prefetch] Error precargando calificaciones:', error);
          }
        } else {
          console.log('⏭️ Prefetch de calificaciones deshabilitado (usaremos consultas por filtros).');
        }
      } else {
        console.warn('⚠️ SQL no pudo conectarse post-login, usará fallback');
      }
    }).catch(e => {
      console.warn('❌ Error en inicialización SQL post-login:', e);
    });
    
  // Preservar el perfil en la navegación
  router.push(`/dashboard?profile=${encodeURIComponent(profile)}`);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem(sessionKey('auth'));
      localStorage.removeItem(sessionKey('user'));
  // También limpiar legacy para coherencia
  localStorage.removeItem('smart-student-auth');
  localStorage.removeItem('smart-student-user');
    } catch {}
    // Mantener el perfil al ir a login
    router.push(`/login?profile=${encodeURIComponent(profile)}`);
  };

  // Funciones de permisos
  const hasAccessToCourse = (course: string): boolean => {
  if (!user) return false;

  // Admin tiene acceso a todos los cursos
  if (user.role === 'admin') return true;

  // Conjunto normalizado de cursos accesibles (base, sin sección)
  const normalized = computeNormalizedCoursesFromActive(user.activeCourses || []);
  const wanted = normalizeToBaseCourseName(course);
  return normalized.includes(wanted);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || false;
  };

  const getAccessibleCourses = (): string[] => {
    if (!user) return [];

    // Admin ve todos los cursos disponibles (base)
    if (user.role === 'admin') {
      return [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico', '5to Básico',
        '6to Básico', '7mo Básico', '8vo Básico', '1ro Medio', '2do Medio',
        '3ro Medio', '4to Medio'
      ];
    }

    // Normalizar desde activeCourses (nombres con sección o IDs) a nombres base
    return computeNormalizedCoursesFromActive(user.activeCourses || []);
  };

  const refreshUser = () => {
    if (!user) return;
    
    try {
      const storedUsers = localStorage.getItem('smart-student-users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUser = users.find((u: any) => u.username === user.username);
        
        if (updatedUser) {
          const newUser: User = {
            id: updatedUser.id,
            username: updatedUser.username,
            role: updatedUser.role,
            displayName: updatedUser.displayName,
            activeCourses: updatedUser.activeCourses,
            email: updatedUser.email,
            assignedTeachers: updatedUser.assignedTeachers,
            teachingAssignments: updatedUser.teachingAssignments
          };
          
          setUser(newUser);
          localStorage.setItem(sessionKey('user'), JSON.stringify(newUser));
        }
      }
    } catch (error) {
      console.warn('Could not refresh user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      isLoading,
      hasAccessToCourse,
      isAdmin,
      getAccessibleCourses,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

