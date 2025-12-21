#!/usr/bin/env node
/**
 * 🔄 EJECUTOR DE SINCRONIZACIÓN DE DATOS ACADÉMICOS
 * 
 * Este script simula el localStorage del navegador y ejecuta la sincronización
 */

// Simulación del localStorage para Node.js
class LocalStorageSimulator {
    constructor() {
        this.data = {};
    }
    
    getItem(key) {
        return this.data[key] || null;
    }
    
    setItem(key, value) {
        this.data[key] = value;
    }
    
    removeItem(key) {
        delete this.data[key];
    }
    
    clear() {
        this.data = {};
    }
}

// Configurar localStorage global
global.localStorage = new LocalStorageSimulator();

// Datos de ejemplo para probar (simulando datos actuales problemáticos)
const datosProblematicos = {
    'smart-student-users': JSON.stringify([
        {
            username: 'felipe',
            displayName: 'Felipe Estudiante',
            email: 'felipe@example.com',
            role: 'student',
            activeCourses: ['4to Básico'], // Problema: datos por defecto
            password: '1234',
            // Faltan courseId y sectionId específicos
        },
        {
            username: 'maria',
            displayName: 'María Estudiante',
            email: 'maria@student.com',
            role: 'student',
            activeCourses: ['1ro Básico'],
            password: '1234',
        },
        {
            username: 'jorge',
            displayName: 'Jorge Profesor',
            email: 'jorge@teacher.com',
            role: 'teacher',
            activeCourses: ['4to Básico', '5to Básico'],
            password: '1234',
            // Faltan teachingAssignments detalladas
        },
        {
            username: 'carlos',
            displayName: 'Carlos Profesor',
            email: 'carlos@teacher.com',
            role: 'teacher',
            activeCourses: ['1ro Básico', '2do Básico'],
            password: '1234',
        },
        {
            username: 'admin',
            displayName: 'Administrador del Sistema',
            email: 'admin@smartstudent.com',
            role: 'admin',
            activeCourses: [],
            password: '1234'
        }
    ]),
    'smart-student-courses': JSON.stringify([
        { id: 'curso-1ro-basico', name: '1ro Básico', level: 'básica', description: 'Primer año básico' },
        { id: 'curso-2do-basico', name: '2do Básico', level: 'básica', description: 'Segundo año básico' },
        { id: 'curso-3ro-basico', name: '3ro Básico', level: 'básica', description: 'Tercer año básico' },
        { id: 'curso-4to-basico', name: '4to Básico', level: 'básica', description: 'Cuarto año básico' },
        { id: 'curso-5to-basico', name: '5to Básico', level: 'básica', description: 'Quinto año básico' }
    ]),
    'smart-student-sections': JSON.stringify([
        { id: 'seccion-1ro-a', courseId: 'curso-1ro-basico', name: 'A', studentCount: 0, maxStudents: 30, subjects: [], uniqueCode: 'SEC-1A001' },
        { id: 'seccion-2do-a', courseId: 'curso-2do-basico', name: 'A', studentCount: 0, maxStudents: 30, subjects: [], uniqueCode: 'SEC-2A001' },
        { id: 'seccion-3ro-a', courseId: 'curso-3ro-basico', name: 'A', studentCount: 0, maxStudents: 30, subjects: [], uniqueCode: 'SEC-3A001' },
        { id: 'seccion-4to-a', courseId: 'curso-4to-basico', name: 'A', studentCount: 0, maxStudents: 30, subjects: [], uniqueCode: 'SEC-4A001' },
        { id: 'seccion-5to-a', courseId: 'curso-5to-basico', name: 'A', studentCount: 0, maxStudents: 30, subjects: [], uniqueCode: 'SEC-5A001' }
    ]),
    'smart-student-teacher-assignments': JSON.stringify([
        { id: 'assign1', teacherId: 'jorge', teacherUsername: 'jorge', sectionId: 'seccion-4to-a', subjectName: 'Matemáticas' },
        { id: 'assign2', teacherId: 'jorge', teacherUsername: 'jorge', sectionId: 'seccion-4to-a', subjectName: 'Lenguaje y Comunicación' },
        { id: 'assign3', teacherId: 'jorge', teacherUsername: 'jorge', sectionId: 'seccion-5to-a', subjectName: 'Matemáticas' },
        { id: 'assign4', teacherId: 'carlos', teacherUsername: 'carlos', sectionId: 'seccion-1ro-a', subjectName: 'Ciencias Naturales' },
        { id: 'assign5', teacherId: 'carlos', teacherUsername: 'carlos', sectionId: 'seccion-2do-a', subjectName: 'Historia, Geografía y Ciencias Sociales' }
    ])
};

// Cargar datos problemáticos
Object.keys(datosProblematicos).forEach(key => {
    localStorage.setItem(key, datosProblematicos[key]);
});

console.log('🔄 INICIANDO SINCRONIZACIÓN DE DATOS ACADÉMICOS (Node.js)...\n');

// === FUNCIONES DE SINCRONIZACIÓN ===

function syncStudentAcademicData(student, courses, sections) {
    let actualizado = false;
    const datosActualizados = { ...student };

    // Verificar si tiene datos académicos por defecto problemáticos
    const tieneDatosPorDefecto = 
        student.activeCourses?.includes('4to Básico') ||
        !student.courseId ||
        !student.sectionId ||
        student.activeCourses?.length === 0;

    if (tieneDatosPorDefecto) {
        // Asignar curso y sección reales del sistema
        const cursoAsignado = courses.find(c => c.name === '4to Básico') || courses[0];
        const seccionAsignada = sections.find(s => s.courseId === cursoAsignado?.id && s.name === 'A');

        if (cursoAsignado && seccionAsignada) {
            datosActualizados.courseId = cursoAsignado.id;
            datosActualizados.sectionId = seccionAsignada.id;
            datosActualizados.activeCourses = [cursoAsignado.name];
            
            // Asignar profesores por defecto basados en el sistema de gestión
            datosActualizados.assignedTeachers = {
                'Matemáticas': 'jorge',
                'Ciencias Naturales': 'carlos',
                'Lenguaje y Comunicación': 'jorge',
                'Historia, Geografía y Ciencias Sociales': 'carlos'
            };

            actualizado = true;
        }
    }

    return { actualizado, datos: datosActualizados };
}

function syncTeacherAcademicData(teacher, courses, sections, teacherAssignments) {
    let actualizado = false;
    const datosActualizados = { ...teacher };

    // Obtener asignaciones reales del profesor desde el sistema de gestión
    const asignacionesProfesor = teacherAssignments.filter(a => 
        a.teacherId === teacher.username || a.teacherUsername === teacher.username
    );

    if (asignacionesProfesor.length > 0) {
        // Extraer cursos únicos de las asignaciones
        const cursosAsignados = [];
        const asignaturasCompletas = [];

        asignacionesProfesor.forEach(asignacion => {
            const seccion = sections.find(s => s.id === asignacion.sectionId);
            const curso = courses.find(c => c.id === seccion?.courseId);
            
            if (curso && !cursosAsignados.includes(curso.name)) {
                cursosAsignados.push(curso.name);
            }

            // Crear estructura de teachingAssignments actualizada
            const asignacionExistente = asignaturasCompletas.find(a => 
                a.subject === asignacion.subjectName && 
                a.teacherUsername === teacher.username
            );

            if (asignacionExistente) {
                if (!asignacionExistente.courses.includes(curso.name)) {
                    asignacionExistente.courses.push(curso.name);
                }
            } else {
                asignaturasCompletas.push({
                    teacherUsername: teacher.username,
                    teacherName: teacher.displayName,
                    subject: asignacion.subjectName,
                    courses: [curso.name]
                });
            }
        });

        // Actualizar datos del profesor
        if (cursosAsignados.length > 0) {
            datosActualizados.activeCourses = cursosAsignados.sort();
            datosActualizados.teachingAssignments = asignaturasCompletas;
            actualizado = true;
        }
    } else if (!teacher.teachingAssignments || teacher.teachingAssignments.length === 0) {
        // Si no tiene asignaciones, asignar configuración por defecto
        datosActualizados.activeCourses = ['4to Básico'];
        datosActualizados.teachingAssignments = [{
            teacherUsername: teacher.username,
            teacherName: teacher.displayName,
            subject: 'Matemáticas',
            courses: ['4to Básico']
        }];
        actualizado = true;
    }

    return { actualizado, datos: datosActualizados };
}

function syncAcademicData() {
    try {
        // 1. Cargar datos actuales del sistema
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');

        console.log('📊 DATOS ACTUALES DEL SISTEMA:');
        console.log(`   - Usuarios: ${users.length}`);
        console.log(`   - Cursos: ${courses.length}`);
        console.log(`   - Secciones: ${sections.length}`);
        console.log(`   - Asignaciones de profesores: ${teacherAssignments.length}\n`);

        let usuariosActualizados = 0;
        let estudiantesActualizados = 0;
        let profesoresActualizados = 0;

        // 2. Actualizar datos académicos de cada usuario
        const updatedUsers = users.map(user => {
            const userBackup = { ...user };
            let actualizado = false;

            if (user.role === 'student') {
                // ESTUDIANTES: Sincronizar con asignaciones del sistema de gestión
                const datosPorDefecto = syncStudentAcademicData(user, courses, sections);
                if (datosPorDefecto.actualizado) {
                    Object.assign(user, datosPorDefecto.datos);
                    actualizado = true;
                    estudiantesActualizados++;
                }
            } else if (user.role === 'teacher') {
                // PROFESORES: Sincronizar con asignaciones reales del sistema
                const datosPorDefecto = syncTeacherAcademicData(user, courses, sections, teacherAssignments);
                if (datosPorDefecto.actualizado) {
                    Object.assign(user, datosPorDefecto.datos);
                    actualizado = true;
                    profesoresActualizados++;
                }
            }

            if (actualizado) {
                usuariosActualizados++;
                console.log(`✅ Actualizado: ${user.displayName} (${user.role})`);
                mostrarCambios(userBackup, user);
            }

            return user;
        });

        // 3. Guardar usuarios actualizados
        localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));

        // 4. Mostrar resumen
        console.log('\n🎉 SINCRONIZACIÓN COMPLETADA:');
        console.log(`   - Usuarios totales: ${users.length}`);
        console.log(`   - Usuarios actualizados: ${usuariosActualizados}`);
        console.log(`   - Estudiantes actualizados: ${estudiantesActualizados}`);
        console.log(`   - Profesores actualizados: ${profesoresActualizados}\n`);

        // 5. Mostrar usuarios finales
        console.log('👥 USUARIOS DESPUÉS DE LA SINCRONIZACIÓN:');
        updatedUsers.forEach(user => {
            console.log(`\n📋 ${user.displayName} (${user.role}):`);
            console.log(`   - Username: ${user.username}`);
            console.log(`   - Active Courses: ${user.activeCourses?.join(', ') || 'ninguno'}`);
            console.log(`   - Course ID: ${user.courseId || 'no asignado'}`);
            console.log(`   - Section ID: ${user.sectionId || 'no asignado'}`);
            if (user.teachingAssignments) {
                console.log(`   - Teaching Assignments: ${user.teachingAssignments.length} materias`);
                user.teachingAssignments.forEach(ta => {
                    console.log(`     * ${ta.subject}: ${ta.courses.join(', ')}`);
                });
            }
            if (user.assignedTeachers) {
                console.log(`   - Assigned Teachers: ${Object.keys(user.assignedTeachers).length} materias`);
            }
        });

        return {
            success: true,
            totalUsers: users.length,
            updatedUsers: usuariosActualizados,
            updatedStudents: estudiantesActualizados,
            updatedTeachers: profesoresActualizados,
            finalData: updatedUsers
        };

    } catch (error) {
        console.error('❌ Error en la sincronización:', error);
        return { success: false, error: error.message };
    }
}

function mostrarCambios(antes, despues) {
    console.log(`   📝 Cambios en ${despues.displayName}:`);
    
    if (antes.activeCourses?.join(',') !== despues.activeCourses?.join(',')) {
        console.log(`      🔄 Cursos: ${antes.activeCourses?.join(', ') || 'ninguno'} → ${despues.activeCourses?.join(', ')}`);
    }
    
    if (antes.courseId !== despues.courseId) {
        console.log(`      🔄 Course ID: ${antes.courseId || 'ninguno'} → ${despues.courseId}`);
    }
    
    if (antes.sectionId !== despues.sectionId) {
        console.log(`      🔄 Section ID: ${antes.sectionId || 'ninguno'} → ${despues.sectionId}`);
    }

    if (despues.role === 'teacher' && despues.teachingAssignments) {
        console.log(`      🔄 Asignaciones académicas actualizadas: ${despues.teachingAssignments.length} materias`);
    }
}

// === EJECUTAR SINCRONIZACIÓN ===
const resultado = syncAcademicData();

if (resultado.success) {
    console.log('\n🎉 ¡SINCRONIZACIÓN EXITOSA!');
    console.log('\n💡 SIGUIENTE PASO: Aplicar estos datos al navegador');
    console.log('   1. Copia el resultado de localStorage generado');
    console.log('   2. Pégalo en la consola del navegador');
    console.log('   3. Recarga la página para ver los cambios\n');
    
    // Generar script para aplicar en el navegador
    console.log('📋 SCRIPT PARA APLICAR EN EL NAVEGADOR:');
    console.log('// Copia y pega este código en la consola del navegador (F12)');
    console.log('// Luego recarga la página');
    console.log('localStorage.setItem("smart-student-users", `' + localStorage.getItem('smart-student-users') + '`);');
    console.log('console.log("✅ Datos académicos sincronizados - Recarga la página");');
    console.log('window.location.reload();');
} else {
    console.log('\n❌ Error en la sincronización:', resultado.error);
}
