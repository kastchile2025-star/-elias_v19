/**
 * 🔍 VERIFICACIÓN DE SINCRONIZACIÓN DE DATOS
 * 
 * Este script verifica si los datos están sincronizados entre:
 * - Gestión de Usuarios (asignaciones)
 * - Pestaña Tareas (filtrado de estudiantes)
 */

console.log('🔍 VERIFICANDO SINCRONIZACIÓN DE DATOS...');

function verificarSincronizacionCompleta() {
    console.log('\n📊 [ANÁLISIS] Estado actual de sincronización...');
    
    try {
        // Cargar todos los datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        const teachers = users.filter(u => u.role === 'teacher');
        
        console.log('\n📋 [DATOS BASE]:');
        console.log(`   • Usuarios totales: ${users.length}`);
        console.log(`   • Estudiantes: ${students.length}`);
        console.log(`   • Profesores: ${teachers.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
        
        // Verificar timestamp de última modificación
        const lastModified = localStorage.getItem('smart-student-last-modified');
        console.log(`   • Última modificación: ${lastModified || 'No registrada'}`);
        
        // Analizar asignaciones de estudiantes
        console.log('\n👥 [ASIGNACIONES ESTUDIANTES - DETALLE]:');
        if (studentAssignments.length === 0) {
            console.log('   ❌ NO HAY ASIGNACIONES DE ESTUDIANTES');
            console.log('   💡 Esto explicaría por qué no se actualiza el filtrado');
        } else {
            const asignacionesPorSeccion = {};
            
            studentAssignments.forEach(assignment => {
                const student = students.find(s => s.id === assignment.studentId);
                const course = courses.find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                
                if (student && course && section) {
                    const key = `${course.name} - Sección ${section.name}`;
                    if (!asignacionesPorSeccion[key]) {
                        asignacionesPorSeccion[key] = [];
                    }
                    asignacionesPorSeccion[key].push({
                        nombre: student.displayName || student.username,
                        asignacionId: assignment.id,
                        fechaCreacion: assignment.createdAt
                    });
                }
            });
            
            Object.keys(asignacionesPorSeccion).forEach(grupo => {
                console.log(`\n📚 ${grupo}:`);
                asignacionesPorSeccion[grupo].forEach(item => {
                    console.log(`   • ${item.nombre} (ID: ${item.asignacionId})`);
                    console.log(`     Creado: ${item.fechaCreacion || 'Sin fecha'}`);
                });
            });
        }
        
        // Verificar datos en users vs assignments
        console.log('\n🔄 [CONSISTENCIA] Comparando datos...');
        students.forEach(student => {
            const assignmentsForStudent = studentAssignments.filter(a => a.studentId === student.id);
            console.log(`\n👤 ${student.displayName || student.username}:`);
            console.log(`   • Datos en users.activeCourses: ${JSON.stringify(student.activeCourses || [])}`);
            console.log(`   • Asignaciones en tabla: ${assignmentsForStudent.length}`);
            
            if (assignmentsForStudent.length > 0) {
                assignmentsForStudent.forEach(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const section = sections.find(s => s.id === assignment.sectionId);
                    console.log(`     - ${course?.name || 'Curso desconocido'} Sección ${section?.name || 'Sección desconocida'}`);
                });
            } else {
                console.log(`     ❌ SIN ASIGNACIONES EN TABLA`);
            }
        });
        
        return {
            users,
            students,
            courses,
            sections,
            studentAssignments,
            teacherAssignments
        };
        
    } catch (error) {
        console.error('❌ Error verificando sincronización:', error);
        return null;
    }
}

// Función para forzar actualización de cache
function forzarActualizacionCache() {
    console.log('\n🔄 [CACHE] Forzando actualización...');
    
    // Actualizar timestamp
    localStorage.setItem('smart-student-last-modified', new Date().toISOString());
    
    // Limpiar posibles cache de componentes
    const keysToUpdate = [
        'smart-student-users',
        'smart-student-student-assignments',
        'smart-student-teacher-assignments'
    ];
    
    keysToUpdate.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            // Re-guardar para triggear eventos de storage
            localStorage.setItem(key, data);
            console.log(`   ✅ Actualizado: ${key}`);
        }
    });
    
    console.log('\n💡 [SIGUIENTE PASO]: Recarga la página (F5) para aplicar cambios');
}

// Función para mostrar qué estudiantes deberían aparecer en cada filtro
function simularFiltradoEsperado() {
    console.log('\n🎯 [SIMULACIÓN] ¿Qué estudiantes deberían aparecer en cada curso-sección?');
    
    const data = verificarSincronizacionCompleta();
    if (!data) return;
    
    const { studentAssignments, students, courses, sections } = data;
    
    // Simular el filtrado como lo hace el sistema
    courses.forEach(course => {
        const sectionsForCourse = sections.filter(s => s.courseId === course.id);
        
        sectionsForCourse.forEach(section => {
            console.log(`\n🔍 Filtro: ${course.name} - Sección ${section.name}`);
            
            const assignmentsForSection = studentAssignments.filter(a => 
                a.courseId === course.id && a.sectionId === section.id
            );
            
            if (assignmentsForSection.length === 0) {
                console.log(`   ❌ Sin estudiantes asignados`);
            } else {
                console.log(`   ✅ Estudiantes esperados:`);
                assignmentsForSection.forEach(assignment => {
                    const student = students.find(s => s.id === assignment.studentId);
                    console.log(`     • ${student?.displayName || student?.username || 'Estudiante desconocido'}`);
                });
            }
        });
    });
}

// Ejecutar verificación completa
console.log('🚀 Iniciando verificación...');
verificarSincronizacionCompleta();

console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   • forzarActualizacionCache() - Para forzar actualización');
console.log('   • simularFiltradoEsperado() - Para ver qué debería mostrar cada filtro');
console.log('   • verificarSincronizacionCompleta() - Para repetir análisis');

// Hacer funciones disponibles globalmente
window.forzarActualizacionCache = forzarActualizacionCache;
window.simularFiltradoEsperado = simularFiltradoEsperado;
window.verificarSincronizacionCompleta = verificarSincronizacionCompleta;
