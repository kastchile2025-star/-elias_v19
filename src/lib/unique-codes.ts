// Sistema de generación de códigos únicos para el sistema
export class UniqueCodeGenerator {
  private static readonly PREFIXES = {
    COURSE: 'CRS',
    TEACHER: 'TCH',
    STUDENT: 'STU',
    TASK: 'TSK',
    EVALUATION: 'EVL'
  };

  private static readonly CODE_LENGTH = 8; // Longitud del código alfanumérico
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  /**
   * Genera un código único con el prefijo especificado
   */
  private static generateCode(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Array.from(
      { length: this.CODE_LENGTH - timestamp.length },
      () => this.CHARACTERS.charAt(Math.floor(Math.random() * this.CHARACTERS.length))
    ).join('');
    
    return `${prefix}-${timestamp}${randomPart}`;
  }

  /**
   * Verifica si un código ya existe en el sistema
   */
  private static isCodeUnique(code: string, existingCodes: string[]): boolean {
    return !existingCodes.includes(code);
  }

  /**
   * Genera un código único para un curso
   */
  static generateCourseCode(existingCodes: string[] = []): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = this.generateCode(this.PREFIXES.COURSE);
      attempts++;
    } while (!this.isCodeUnique(code, existingCodes) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('No se pudo generar un código único para el curso');
    }

    return code;
  }

  /**
   * Genera un código único para un profesor
   */
  static generateTeacherCode(existingCodes: string[] = []): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = this.generateCode(this.PREFIXES.TEACHER);
      attempts++;
    } while (!this.isCodeUnique(code, existingCodes) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('No se pudo generar un código único para el profesor');
    }

    return code;
  }

  /**
   * Genera un código único para un estudiante
   */
  static generateStudentCode(existingCodes: string[] = []): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = this.generateCode(this.PREFIXES.STUDENT);
      attempts++;
    } while (!this.isCodeUnique(code, existingCodes) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('No se pudo generar un código único para el estudiante');
    }

    return code;
  }

  /**
   * Genera un código único para una tarea
   */
  static generateTaskCode(existingCodes: string[] = []): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = this.generateCode(this.PREFIXES.TASK);
      attempts++;
    } while (!this.isCodeUnique(code, existingCodes) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('No se pudo generar un código único para la tarea');
    }

    return code;
  }

  /**
   * Genera un código único para una evaluación
   */
  static generateEvaluationCode(existingCodes: string[] = []): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = this.generateCode(this.PREFIXES.EVALUATION);
      attempts++;
    } while (!this.isCodeUnique(code, existingCodes) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('No se pudo generar un código único para la evaluación');
    }

    return code;
  }

  /**
   * Genera un código único para un usuario basado en su rol
   */
  static generateUserCode(username: string, role: 'student' | 'teacher' | 'admin', existingCodes: string[] = []): string {
    let prefix: string;
    
    switch (role) {
      case 'student':
        prefix = this.PREFIXES.STUDENT;
        break;
      case 'teacher':
        prefix = this.PREFIXES.TEACHER;
        break;
      case 'admin':
        // Los administradores pueden usar el prefijo de profesor
        prefix = this.PREFIXES.TEACHER;
        break;
      default:
        throw new Error(`Rol de usuario no válido: ${role}`);
    }

    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = this.generateCode(prefix);
      attempts++;
    } while (!this.isCodeUnique(code, existingCodes) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error(`No se pudo generar un código único para el usuario ${username}`);
    }

    return code;
  }

  /**
   * Obtiene todos los códigos únicos existentes en el sistema
   */
  static getAllExistingCodes(): string[] {
    const codes: string[] = [];

    // Obtener códigos de usuarios
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    users.forEach((user: any) => {
      if (user.uniqueCode) {
        codes.push(user.uniqueCode);
      }
    });

    // Obtener códigos de tareas
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    tasks.forEach((task: any) => {
      if (task.uniqueCode) {
        codes.push(task.uniqueCode);
      }
    });

    // Obtener códigos de cursos (si se implementan en el futuro)
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    courses.forEach((course: any) => {
      if (course.uniqueCode) {
        codes.push(course.uniqueCode);
      }
    });

    return codes;
  }

  /**
   * Migra todos los datos existentes para asignar códigos únicos
   */
  static migrateExistingData(): void {
    const existingCodes = this.getAllExistingCodes();

    // Migrar usuarios
    this.migrateUsers(existingCodes);

    // Migrar tareas
    this.migrateTasks(existingCodes);

    // Migrar cursos (si es necesario)
    this.migrateCourses(existingCodes);

    console.log('✅ Migración de códigos únicos completada');
  }

  /**
   * Migra usuarios existentes para asignar códigos únicos
   */
  private static migrateUsers(existingCodes: string[]): void {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    let updated = false;

    users.forEach((user: any) => {
      if (!user.uniqueCode) {
        user.uniqueCode = this.generateUserCode(user.username, user.role, existingCodes);
        existingCodes.push(user.uniqueCode);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('smart-student-users', JSON.stringify(users));
      console.log('✅ Usuarios migrados con códigos únicos');
    }
  }

  /**
   * Migra tareas existentes para asignar códigos únicos
   */
  private static migrateTasks(existingCodes: string[]): void {
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    let updated = false;

    tasks.forEach((task: any) => {
      if (!task.uniqueCode) {
        if (task.taskType === 'evaluacion') {
          task.uniqueCode = this.generateEvaluationCode(existingCodes);
        } else {
          task.uniqueCode = this.generateTaskCode(existingCodes);
        }
        existingCodes.push(task.uniqueCode);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
      console.log('✅ Tareas migradas con códigos únicos');
    }
  }

  /**
   * Migra cursos existentes para asignar códigos únicos
   */
  private static migrateCourses(existingCodes: string[]): void {
    // Esta función se puede implementar cuando se tenga un sistema de cursos
    // Por ahora, los cursos son strings simples
    console.log('ℹ️ Migración de cursos pendiente de implementación');
  }

  /**
   * Valida que un código tenga el formato correcto
   */
  static validateCode(code: string): boolean {
    const validPrefixes = Object.values(this.PREFIXES);
    const pattern = new RegExp(`^(${validPrefixes.join('|')})-[A-Z0-9]{8}$`);
    return pattern.test(code);
  }

  /**
   * Obtiene el tipo de entidad basado en el código
   */
  static getEntityType(code: string): 'course' | 'teacher' | 'student' | 'task' | 'evaluation' | 'unknown' {
    if (!this.validateCode(code)) {
      return 'unknown';
    }

    const prefix = code.split('-')[0];
    switch (prefix) {
      case this.PREFIXES.COURSE:
        return 'course';
      case this.PREFIXES.TEACHER:
        return 'teacher';
      case this.PREFIXES.STUDENT:
        return 'student';
      case this.PREFIXES.TASK:
        return 'task';
      case this.PREFIXES.EVALUATION:
        return 'evaluation';
      default:
        return 'unknown';
    }
  }

  /**
   * Genera un código único para cualquier entidad
   */
  static generateForEntity(entityType: 'course' | 'teacher' | 'student' | 'task' | 'evaluation', existingCodes: string[] = []): string {
    switch (entityType) {
      case 'course':
        return this.generateCourseCode(existingCodes);
      case 'teacher':
        return this.generateTeacherCode(existingCodes);
      case 'student':
        return this.generateStudentCode(existingCodes);
      case 'task':
        return this.generateTaskCode(existingCodes);
      case 'evaluation':
        return this.generateEvaluationCode(existingCodes);
      default:
        throw new Error(`Tipo de entidad no válido: ${entityType}`);
    }
  }
}
