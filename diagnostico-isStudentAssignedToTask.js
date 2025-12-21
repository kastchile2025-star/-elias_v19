/**
 * 🔧 DIAGNÓSTICO ESPECÍFICO: isStudentAssignedToTask para "Todo el Curso"
 * 
 * Script para diagnosticar exactamente por qué la función isStudentAssignedToTask
 * no está funcionando correctamente para tareas asignadas a "Todo el Curso"
 */

console.log('🔧 DIAGNÓSTICO ESPECÍFICO: isStudentAssignedToTask');
console.log('='.repeat(60));

class DiagnosticoIsStudentAssignedToTask {
    constructor() {
        this.datos = this.cargarDatos();
    }

    cargarDatos() {
        return {
            users: JSON.parse(localStorage.getItem('smart-student-users') || '[]'),
            courses: JSON.parse(localStorage.getItem('smart-student-courses') || '[]'),
            sections: JSON.parse(localStorage.getItem('smart-student-sections') || '[]'),
            tasks: JSON.parse(localStorage.getItem('smart-student-tasks') || '[]'),
            studentAssignments: JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]'),
            teacherAssignments: JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]'),
            currentUser: JSON.parse(localStorage.getItem('smart-student-current-user') || 'null')
        };
    }

    // 🎯 Simular la función getAvailableCoursesWithNames
    simularGetAvailableCoursesWithNames() {
        console.log('\n🎯 SIMULANDO getAvailableCoursesWithNames()...');
        
        const { teacherAssignments, courses, sections } = this.datos;
        
        // Buscar un profesor para simular
        const profesores = this.datos.users.filter(u => u.role === 'teacher' || u.role === 'profesor');
        if (profesores.length === 0) {
            console.log('❌ No hay profesores en el sistema');
            return [];
        }
        
        const profesor = profesores[0]; // Usar el primer profesor
        console.log(`👨‍🏫 Simulando con profesor: ${profesor.username}`);
        
        // Simular la lógica de getAvailableCoursesWithNames
        const userAssignments = teacherAssignments.filter(assignment => 
            assignment.teacherId === profesor.id
        );
        
        console.log(`📋 Asignaciones del profesor encontradas: ${userAssignments.length}`);
        
        const courseSectionsMap = new Map();
        
        userAssignments.forEach((assignment, index) => {
            console.log(`\n${index + 1}. Procesando asignación:`);
            console.log(`   TeacherId: ${assignment.teacherId}`);
            console.log(`   SectionId: ${assignment.sectionId}`);
            
            const section = sections.find(s => s.id === assignment.sectionId);
            console.log(`   Sección encontrada: ${section ? section.name : 'NO ENCONTRADA'}`);
            
            if (section) {
                const course = courses.find(c => c.id === section.courseId);
                console.log(`   Curso encontrado: ${course ? course.name : 'NO ENCONTRADO'}`);
                
                if (course) {
                    const key = `${course.id}-${section.id}`;
                    console.log(`   Clave combinada: ${key}`);
                    
                    if (!courseSectionsMap.has(key)) {
                        const courseSection = {
                            id: key,
                            courseId: course.id,
                            sectionId: section.id,
                            name: `${course.name} Sección ${section.name}`,
                            originalCourseName: course.name,
                            sectionName: section.name
                        };
                        
                        courseSectionsMap.set(key, courseSection);
                        console.log(`   ✅ Agregado a mapa: ${courseSection.name}`);
                    } else {
                        console.log(`   ⚠️ Ya existe en mapa`);
                    }
                }
            }
        });
        
        const resultado = Array.from(courseSectionsMap.values());
        
        console.log(`\n📊 RESULTADO FINAL: ${resultado.length} combinaciones curso-sección`);
        resultado.forEach((cs, index) => {
            console.log(`   ${index + 1}. ${cs.name} (ID: ${cs.id})`);
        });
        
        return resultado;
    }

    // 🧪 Probar isStudentAssignedToTask paso a paso
    probarIsStudentAssignedToTaskPasoPaso() {
        console.log('\n🧪 PROBANDO isStudentAssignedToTask PASO A PASO...');
        
        // Datos necesarios
        const { tasks, users, studentAssignments } = this.datos;
        
        // Buscar tarea de "Todo el Curso"
        const tareasCurso = tasks.filter(t => t.assignedTo === 'course');
        
        if (tareasCurso.length === 0) {
            console.log('❌ No hay tareas de "Todo el Curso" para probar');
            return;
        }
        
        const tarea = tareasCurso[0];
        console.log(`\n📝 PROBANDO CON TAREA: "${tarea.title}"`);
        console.log(`🎯 Asignada a: ${tarea.courseSectionId || tarea.course}`);
        
        // Buscar estudiantes
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        
        console.log(`\n👥 PROBANDO CON ${estudiantes.length} ESTUDIANTES:`);
        
        estudiantes.forEach((estudiante, index) => {
            console.log(`\n${index + 1}. ESTUDIANTE: ${estudiante.username}`);
            console.log('='.repeat(40));
            
            // PASO 1: Verificar datos básicos
            console.log('📋 PASO 1: Datos básicos');
            console.log(`   ID: ${estudiante.id}`);
            console.log(`   Username: ${estudiante.username}`);
            console.log(`   Role: ${estudiante.role}`);
            
            // PASO 2: Obtener taskCourseId
            const taskCourseId = tarea.courseSectionId || tarea.course;
            console.log(`\n🎯 PASO 2: TaskCourseId`);
            console.log(`   TaskCourseId: ${taskCourseId}`);
            
            if (!taskCourseId) {
                console.log('   ❌ Tarea sin courseId definido');
                return;
            }
            
            // PASO 3: Simular getAvailableCoursesWithNames
            console.log(`\n📚 PASO 3: Simular getAvailableCoursesWithNames`);
            const availableCourses = this.simularGetAvailableCoursesWithNames();
            const taskCourseData = availableCourses.find(c => c.id === taskCourseId);
            
            console.log(`   Cursos disponibles: ${availableCourses.length}`);
            console.log(`   TaskCourseData encontrado: ${taskCourseData ? '✅' : '❌'}`);
            
            if (taskCourseData) {
                console.log(`   CourseId: ${taskCourseData.courseId}`);
                console.log(`   SectionId: ${taskCourseData.sectionId}`);
                console.log(`   Name: ${taskCourseData.name}`);
            } else {
                console.log('   ❌ No se encontró taskCourseData');
                console.log('   🔍 Buscando en cursos disponibles:');
                availableCourses.forEach(course => {
                    console.log(`      - ${course.id} (${course.name})`);
                });
                console.log(`   🎯 Buscando: ${taskCourseId}`);
            }
            
            // PASO 4: Verificar asignaciones del estudiante
            console.log(`\n👤 PASO 4: Asignaciones del estudiante`);
            const asignacionesEstudiante = studentAssignments.filter(a => a.studentId === estudiante.id);
            console.log(`   Asignaciones encontradas: ${asignacionesEstudiante.length}`);
            
            asignacionesEstudiante.forEach((asig, i) => {
                console.log(`   ${i + 1}. CourseId: ${asig.courseId}, SectionId: ${asig.sectionId}`);
            });
            
            // PASO 5: Verificar coincidencia con taskCourseData
            if (taskCourseData) {
                console.log(`\n🔍 PASO 5: Verificar coincidencia`);
                
                const isAssignedToTaskSection = asignacionesEstudiante.some(assignment => {
                    const matchStudentId = assignment.studentId === estudiante.id;
                    const matchSectionId = assignment.sectionId === taskCourseData.sectionId;
                    const matchCourseId = assignment.courseId === taskCourseData.courseId;
                    
                    console.log(`     Asignación: ${assignment.courseId}-${assignment.sectionId}`);
                    console.log(`       StudentId match: ${matchStudentId}`);
                    console.log(`       SectionId match: ${matchSectionId} (${assignment.sectionId} === ${taskCourseData.sectionId})`);
                    console.log(`       CourseId match: ${matchCourseId} (${assignment.courseId} === ${taskCourseData.courseId})`);
                    
                    return matchStudentId && matchSectionId && matchCourseId;
                });
                
                console.log(`   📊 RESULTADO: ${isAssignedToTaskSection ? '✅ PUEDE VER' : '❌ NO PUEDE VER'}`);
                
                if (isAssignedToTaskSection) {
                    console.log('   🎉 ¡ESTUDIANTE DEBERÍA VER LA TAREA!');
                } else {
                    console.log('   💡 Probando fallback con activeCourses...');
                    const isInActiveCourses = estudiante.activeCourses?.includes(taskCourseId) || false;
                    console.log(`   📚 ActiveCourses: [${(estudiante.activeCourses || []).join(', ')}]`);
                    console.log(`   🔍 Contiene "${taskCourseId}": ${isInActiveCourses}`);
                    console.log(`   📊 RESULTADO FALLBACK: ${isInActiveCourses ? '✅ PUEDE VER' : '❌ NO PUEDE VER'}`);
                }
            }
        });
    }

    // 📊 Resumen de problemas encontrados
    resumenProblemas() {
        console.log('\n📊 RESUMEN DE POSIBLES PROBLEMAS:');
        console.log('='.repeat(50));
        
        console.log('🔍 PROBLEMAS COMUNES EN isStudentAssignedToTask:');
        console.log('');
        console.log('1. 🚨 getAvailableCoursesWithNames() no devuelve datos');
        console.log('   - Verificar asignaciones de profesores');
        console.log('   - Verificar estructura de cursos y secciones');
        console.log('');
        console.log('2. 🚨 taskCourseData no se encuentra');
        console.log('   - El taskCourseId no coincide con ningún ID en availableCourses');
        console.log('   - Problema en formato de IDs combinados');
        console.log('');
        console.log('3. 🚨 Asignaciones de estudiantes incorrectas');
        console.log('   - studentAssignments no tiene datos');
        console.log('   - IDs no coinciden exactamente');
        console.log('');
        console.log('4. 🚨 Fallback activeCourses no funciona');
        console.log('   - activeCourses no contiene el formato correcto');
        console.log('   - Inconsistencia entre formatos');
    }

    // 🚀 Ejecutar diagnóstico completo
    ejecutarDiagnosticoCompleto() {
        console.log('🚀 EJECUTANDO DIAGNÓSTICO COMPLETO...');
        
        this.simularGetAvailableCoursesWithNames();
        this.probarIsStudentAssignedToTaskPasoPaso();
        this.resumenProblemas();
        
        console.log('\n💡 SIGUIENTE PASO:');
        console.log('1. Analiza los resultados de arriba');
        console.log('2. Identifica en qué PASO falla la lógica');
        console.log('3. Reporta el problema específico encontrado');
    }
}

// 🚀 EJECUTAR DIAGNÓSTICO
const diagnosticoISAT = new DiagnosticoIsStudentAssignedToTask();
diagnosticoISAT.ejecutarDiagnosticoCompleto();

// Hacer disponible globalmente
window.diagnosticoISAT = diagnosticoISAT;

console.log('\n🔧 DIAGNÓSTICO COMPLETADO');
console.log('💡 Usa: diagnosticoISAT.ejecutarDiagnosticoCompleto() para repetir');
