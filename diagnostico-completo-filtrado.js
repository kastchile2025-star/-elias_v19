/**
 * 🔍 DIAGNÓSTICO COMPLETO: Sistema de Filtrado de Estudiantes
 * 
 * Este script analiza todos los datos del sistema para encontrar
 * por qué no aparecen estudiantes cuando se selecciona "Estudiantes específicos"
 * 
 * 📋 INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12 → Console)
 * 2. Ejecuta: diagnosticoCompleto()
 * 3. Analiza los resultados para identificar el problema
 */

console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DEL SISTEMA DE FILTRADO');

function diagnosticoCompleto() {
    console.log('\n🔍 [DIAGNÓSTICO COMPLETO] Iniciando análisis del sistema...');
    
    try {
        // 1. Datos básicos del sistema
        const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log('\n📊 [DATOS BÁSICOS] Resumen del sistema:');
        console.log(`   • Total usuarios: ${allUsers.length}`);
        console.log(`   • Estudiantes: ${allUsers.filter(u => u.role === 'student').length}`);
        console.log(`   • Profesores: ${allUsers.filter(u => u.role === 'teacher').length}`);
        console.log(`   • Asignaciones de estudiantes: ${studentAssignments.length}`);
        console.log(`   • Asignaciones de profesores: ${teacherAssignments.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        
        // 2. Usuario actual
        const currentUser = JSON.parse(localStorage.getItem('smart-student-current-user') || '{}');
        console.log('\n👤 [USUARIO ACTUAL]:', currentUser);
        
        // 3. Análisis de estudiantes
        const students = allUsers.filter(u => u.role === 'student');
        console.log('\n👥 [ANÁLISIS DE ESTUDIANTES]:');
        
        if (students.length === 0) {
            console.log('❌ NO HAY ESTUDIANTES en el sistema');
            return;
        }
        
        students.forEach((student, index) => {
            console.log(`\n   ${index + 1}. 👤 ${student.displayName || student.username}:`);
            console.log(`      • ID: ${student.id}`);
            console.log(`      • Username: ${student.username}`);
            console.log(`      • Role: ${student.role}`);
            console.log(`      • ActiveCourses: [${student.activeCourses?.join(', ') || 'VACÍO'}]`);
            console.log(`      • SectionName: ${student.sectionName || 'UNDEFINED'}`);
            console.log(`      • AssignedTeacher: ${student.assignedTeacher || 'UNDEFINED'}`);
            
            if (student.assignedTeachers) {
                console.log(`      • AssignedTeachers:`, student.assignedTeachers);
            }
            
            // Buscar asignación oficial
            const assignment = studentAssignments.find(a => a.studentId === student.id);
            if (assignment) {
                const course = courses.find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                console.log(`      • ✅ Asignación oficial: ${course?.name || 'Curso desconocido'} - Sección ${section?.name || 'Sección desconocida'}`);
                console.log(`      • CourseId: ${assignment.courseId}`);
                console.log(`      • SectionId: ${assignment.sectionId}`);
            } else {
                console.log(`      • ❌ SIN ASIGNACIÓN OFICIAL`);
            }
        });
        
        // 4. Análisis de cursos disponibles para el profesor actual
        console.log('\n📚 [CURSOS DISPONIBLES PARA EL PROFESOR]:');
        
        if (typeof getAvailableCoursesWithNames === 'function') {
            const availableCourses = getAvailableCoursesWithNames();
            console.log(`   • Total cursos disponibles: ${availableCourses.length}`);
            
            availableCourses.forEach((course, index) => {
                console.log(`\n   ${index + 1}. 📖 ${course.name}:`);
                console.log(`      • ID: ${course.id}`);
                console.log(`      • CourseId: ${course.courseId || 'UNDEFINED'}`);
                console.log(`      • OriginalCourseName: ${course.originalCourseName || 'UNDEFINED'}`);
                console.log(`      • SectionName: ${course.sectionName || 'UNDEFINED'}`);
                
                // Simular búsqueda de estudiantes para este curso
                console.log(`      • 🔍 Simulando búsqueda de estudiantes...`);
                
                // Extraer sectionId si es ID combinado
                let sectionId = null;
                if (course.id.includes('-') && course.courseId !== course.id) {
                    const parts = course.id.split('-');
                    if (parts.length >= 2) {
                        const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)$/i;
                        const match = course.id.match(uuidPattern);
                        if (match) {
                            sectionId = match[2];
                        } else {
                            sectionId = parts[1];
                        }
                    }
                }
                
                if (sectionId) {
                    console.log(`      • SectionId extraído: ${sectionId}`);
                    const studentsInSection = studentAssignments.filter(a => a.sectionId === sectionId);
                    console.log(`      • Estudiantes en esta sección: ${studentsInSection.length}`);
                    
                    studentsInSection.forEach(assignment => {
                        const student = students.find(s => s.id === assignment.studentId);
                        if (student) {
                            console.log(`        - ${student.displayName || student.username}`);
                        }
                    });
                } else {
                    console.log(`      • ⚠️ No se pudo extraer sectionId del courseId`);
                }
            });
        } else {
            console.log('❌ Función getAvailableCoursesWithNames no está disponible');
        }
        
        // 5. Verificar configuración de asignaciones profesor-estudiante
        console.log('\n🎓 [ASIGNACIONES PROFESOR-ESTUDIANTE]:');
        
        if (currentUser.username) {
            const studentsAssignedToCurrentTeacher = students.filter(student => 
                student.assignedTeacher === currentUser.username ||
                (student.assignedTeachers && Object.values(student.assignedTeachers).includes(currentUser.username))
            );
            
            console.log(`   • Estudiantes asignados al profesor ${currentUser.username}: ${studentsAssignedToCurrentTeacher.length}`);
            
            studentsAssignedToCurrentTeacher.forEach(student => {
                console.log(`     - ${student.displayName || student.username}`);
            });
        }
        
        // 6. Recomendaciones
        console.log('\n💡 [RECOMENDACIONES]:');
        
        const problems = [];
        
        if (students.length === 0) {
            problems.push('No hay estudiantes en el sistema');
        }
        
        if (studentAssignments.length === 0) {
            problems.push('No hay asignaciones de estudiantes (student-assignments)');
        }
        
        if (courses.length === 0) {
            problems.push('No hay cursos configurados');
        }
        
        if (sections.length === 0) {
            problems.push('No hay secciones configuradas');
        }
        
        const studentsWithoutAssignment = students.filter(s => 
            !studentAssignments.some(a => a.studentId === s.id)
        );
        
        if (studentsWithoutAssignment.length > 0) {
            problems.push(`${studentsWithoutAssignment.length} estudiantes sin asignación de sección`);
        }
        
        const studentsWithoutTeacher = students.filter(s => 
            !s.assignedTeacher && (!s.assignedTeachers || Object.keys(s.assignedTeachers).length === 0)
        );
        
        if (studentsWithoutTeacher.length > 0) {
            problems.push(`${studentsWithoutTeacher.length} estudiantes sin profesor asignado`);
        }
        
        if (problems.length > 0) {
            console.log('❌ PROBLEMAS DETECTADOS:');
            problems.forEach(problem => console.log(`   • ${problem}`));
            
            console.log('\n🔧 PASOS PARA SOLUCIONAR:');
            console.log('   1. Ir a Gestión de Usuarios (modo Admin)');
            console.log('   2. Verificar que existan estudiantes, cursos y secciones');
            console.log('   3. Ir a la pestaña "Asignaciones"');
            console.log('   4. Asignar estudiantes a cursos y secciones específicos');
            console.log('   5. Asignar profesores a secciones y materias');
            console.log('   6. Volver a intentar crear la tarea');
        } else {
            console.log('✅ El sistema parece estar configurado correctamente');
            console.log('💡 Si el problema persiste, verifica la consola en tiempo real al crear la tarea');
        }
        
        console.log('\n🎯 [PRUEBA EN TIEMPO REAL]:');
        console.log('Para ver qué está pasando en tiempo real:');
        console.log('1. Abre las herramientas de desarrollador (F12)');
        console.log('2. Ve a la pestaña Console');
        console.log('3. Intenta crear una nueva tarea');
        console.log('4. Observa los logs que empiecen con [FILTRADO DINÁMICO]');
        
        return true;
        
    } catch (error) {
        console.error('❌ [ERROR] Error durante el diagnóstico:', error);
        return false;
    }
}

// Función para crear datos de prueba si no existen
function crearDatosDePrueba() {
    console.log('\n🛠️ [CREAR DATOS DE PRUEBA] Creando datos básicos para pruebas...');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        // Crear curso de prueba si no existe
        let testCourse = courses.find(c => c.name === '4to Básico');
        if (!testCourse) {
            testCourse = {
                id: `course-${Date.now()}`,
                name: '4to Básico',
                description: 'Cuarto año de educación básica',
                level: 'elementary',
                createdAt: new Date().toISOString()
            };
            courses.push(testCourse);
            localStorage.setItem('smart-student-courses', JSON.stringify(courses));
            console.log('✅ Curso de prueba creado: 4to Básico');
        }
        
        // Crear secciones de prueba si no existen
        let sectionA = sections.find(s => s.name === 'A' && s.courseId === testCourse.id);
        if (!sectionA) {
            sectionA = {
                id: `section-a-${Date.now()}`,
                name: 'A',
                courseId: testCourse.id,
                description: 'Sección A de 4to Básico',
                maxStudents: 30,
                createdAt: new Date().toISOString()
            };
            sections.push(sectionA);
            localStorage.setItem('smart-student-sections', JSON.stringify(sections));
            console.log('✅ Sección de prueba creada: 4to Básico - Sección A');
        }
        
        // Crear estudiantes de prueba si no existen
        const testStudentNames = ['Felipe', 'María', 'Carlos', 'Ana'];
        testStudentNames.forEach(name => {
            let student = users.find(u => u.displayName === name && u.role === 'student');
            if (!student) {
                const studentId = `student-${name.toLowerCase()}-${Date.now()}`;
                student = {
                    id: studentId,
                    username: name.toLowerCase(),
                    displayName: name,
                    role: 'student',
                    email: `${name.toLowerCase()}@test.com`,
                    activeCourses: [`${testCourse.name} - Sección ${sectionA.name}`],
                    sectionName: sectionA.name,
                    createdAt: new Date().toISOString()
                };
                users.push(student);
                
                // Crear asignación
                const assignment = {
                    id: `assignment-${studentId}`,
                    studentId: studentId,
                    courseId: testCourse.id,
                    sectionId: sectionA.id,
                    createdAt: new Date().toISOString()
                };
                studentAssignments.push(assignment);
                
                console.log(`✅ Estudiante de prueba creado: ${name}`);
            }
        });
        
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        
        console.log('🎉 Datos de prueba creados correctamente');
        console.log('💡 Recarga la página y vuelve a intentar crear una tarea');
        
    } catch (error) {
        console.error('❌ Error al crear datos de prueba:', error);
    }
}

// Ejecutar diagnóstico automáticamente
console.log('🚀 [INICIO] Ejecutando diagnóstico automático...');
const resultado = diagnosticoCompleto();

if (resultado) {
    console.log('\n✅ [COMPLETADO] Diagnóstico terminado');
    console.log('\n🔧 [FUNCIONES DISPONIBLES]:');
    console.log('   • diagnosticoCompleto() - Para re-ejecutar el diagnóstico');
    console.log('   • crearDatosDePrueba() - Para crear datos de prueba si no existen');
} else {
    console.log('\n❌ [ERROR] El diagnóstico falló. Revisa los logs anteriores.');
}
