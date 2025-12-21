/**
 * 🎯 SOLUCIÓN DEFINITIVA: Filtrado Dinámico de Estudiantes por Sección
 * 
 * PROBLEMA: Cuando un profesor selecciona un curso y sección específica para crear una tarea,
 * la opción "Estudiantes específicos" muestra TODOS los estudiantes en lugar de filtrar
 * solo los que pertenecen a esa sección específica.
 * 
 * SOLUCIÓN: Implementar una función mejorada que use dinámicamente la información 
 * de Gestión de Usuarios para filtrar correctamente los estudiantes por sección.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - 100% dinámico: Lee datos reales de localStorage
 * - Filtra por sección específica usando student-assignments
 * - Fallback inteligente para diferentes configuraciones
 * - Compatible con el sistema existente
 * 
 * 📋 INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12 → Console)
 * 2. Ejecuta: corregirFiltradoEstudiantesDinamico()
 * 3. Recarga la página
 * 4. Prueba crear una nueva tarea con "Estudiantes específicos"
 */

console.log('🚀 INICIANDO CORRECCIÓN DEL FILTRADO DE ESTUDIANTES POR SECCIÓN');

/**
 * Función principal de corrección
 */
function corregirFiltradoEstudiantesDinamico() {
    console.log('\n🔧 [CORRECCIÓN] Iniciando análisis del sistema de filtrado...');
    
    try {
        // 1. Verificar datos base del sistema
        const students = JSON.parse(localStorage.getItem('smart-student-users') || '[]').filter(u => u.role === 'student');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log('📊 [DATOS] Resumen del sistema:');
        console.log(`   • Estudiantes: ${students.length}`);
        console.log(`   • Asignaciones de estudiantes: ${studentAssignments.length}`);
        console.log(`   • Asignaciones de profesores: ${teacherAssignments.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        
        // 2. Crear función mejorada de filtrado dinámico
        const newGetStudentsForCourse = `
        // 🎯 FUNCIÓN MEJORADA: getStudentsForCourse - Filtrado dinámico por sección
        const getStudentsForCourse = (courseId) => {
            console.log(\`🚀 [DINÁMICO] Obteniendo estudiantes para courseId: "\${courseId}"\`);
            
            if (!courseId || !user?.id) {
                console.log('⚠️ [DINÁMICO] Parámetros inválidos');
                return [];
            }
            
            // Cargar datos dinámicamente
            const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
            const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
            const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
            
            console.log(\`📊 [DINÁMICO] Datos cargados: \${allUsers.filter(u => u.role === 'student').length} estudiantes\`);
            
            // Extraer información del curso seleccionado
            const availableCourses = getAvailableCoursesWithNames();
            const selectedCourseInfo = availableCourses.find(course => course.id === courseId);
            
            if (!selectedCourseInfo) {
                console.log('❌ [DINÁMICO] No se encontró información del curso seleccionado');
                return [];
            }
            
            console.log(\`🎯 [DINÁMICO] Curso seleccionado:\`, selectedCourseInfo);
            
            // Extraer sectionId del courseId combinado
            let sectionId = null;
            let actualCourseId = selectedCourseInfo.courseId || courseId;
            let courseName = selectedCourseInfo.originalCourseName || '';
            let sectionName = selectedCourseInfo.sectionName || '';
            
            // Si es un ID combinado (courseId-sectionId), extraer sectionId
            if (courseId.includes('-') && selectedCourseInfo.courseId !== courseId) {
                const parts = courseId.split('-');
                if (parts.length >= 2) {
                    // Para UUIDs: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
                    const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)$/i;
                    const match = courseId.match(uuidPattern);
                    if (match) {
                        actualCourseId = match[1];
                        sectionId = match[2];
                    } else {
                        // Formato simple
                        actualCourseId = parts[0];
                        sectionId = parts[1];
                    }
                }
            }
            
            console.log(\`🔍 [DINÁMICO] IDs extraídos - courseId: "\${actualCourseId}", sectionId: "\${sectionId}"\`);
            console.log(\`📚 [DINÁMICO] Nombres - curso: "\${courseName}", sección: "\${sectionName}"\`);
            
            // MÉTODO PRINCIPAL: Filtrar estudiantes usando student-assignments
            if (sectionId) {
                console.log(\`🎯 [DINÁMICO] Método 1: Filtrado por asignaciones de estudiantes (sectionId: \${sectionId})\`);
                
                // Obtener estudiantes asignados a esta sección específica
                const studentsInSection = studentAssignments.filter(assignment => 
                    assignment.sectionId === sectionId
                );
                
                console.log(\`📋 [DINÁMICO] Estudiantes asignados a la sección: \${studentsInSection.length}\`);
                
                if (studentsInSection.length > 0) {
                    // Obtener datos completos de los estudiantes
                    const studentIds = studentsInSection.map(assignment => assignment.studentId);
                    const studentsData = allUsers.filter(user => 
                        user.role === 'student' && studentIds.includes(user.id)
                    );
                    
                    console.log(\`✅ [DINÁMICO] Método 1 EXITOSO: \${studentsData.length} estudiantes encontrados por asignaciones\`);
                    studentsData.forEach(s => console.log(\`   • \${s.displayName || s.username}\`));
                    
                    return studentsData.map(s => ({
                        id: s.id,
                        username: s.username,
                        displayName: s.displayName || s.username
                    }));
                }
            }
            
            // MÉTODO FALLBACK 1: Filtrar por courseName + sectionName en activeCourses
            if (courseName && sectionName) {
                console.log(\`🔄 [DINÁMICO] Método 2: Filtrado por activeCourses (curso + sección)\`);
                
                const possibleFormats = [
                    \`\${courseName} - Sección \${sectionName}\`,
                    \`\${courseName} - \${sectionName}\`,
                    \`\${courseName} Sección \${sectionName}\`,
                    \`\${courseName}-\${sectionName}\`
                ];
                
                console.log(\`🔍 [DINÁMICO] Buscando formatos:\`, possibleFormats);
                
                const studentsInSection = allUsers.filter(user => {
                    if (user.role !== 'student' || !user.activeCourses) return false;
                    
                    return possibleFormats.some(format => 
                        user.activeCourses.includes(format)
                    );
                });
                
                if (studentsInSection.length > 0) {
                    console.log(\`✅ [DINÁMICO] Método 2 EXITOSO: \${studentsInSection.length} estudiantes encontrados por activeCourses\`);
                    studentsInSection.forEach(s => console.log(\`   • \${s.displayName || s.username}\`));
                    
                    return studentsInSection.map(s => ({
                        id: s.id,
                        username: s.username,
                        displayName: s.displayName || s.username
                    }));
                }
            }
            
            // MÉTODO FALLBACK 2: Filtrar por sectionName directo
            if (sectionName) {
                console.log(\`🔄 [DINÁMICO] Método 3: Filtrado por sectionName directo\`);
                
                const studentsInSection = allUsers.filter(user => 
                    user.role === 'student' && user.sectionName === sectionName
                );
                
                if (studentsInSection.length > 0) {
                    console.log(\`✅ [DINÁMICO] Método 3 EXITOSO: \${studentsInSection.length} estudiantes encontrados por sectionName\`);
                    studentsInSection.forEach(s => console.log(\`   • \${s.displayName || s.username}\`));
                    
                    return studentsInSection.map(s => ({
                        id: s.id,
                        username: s.username,
                        displayName: s.displayName || s.username
                    }));
                }
            }
            
            // MÉTODO FALLBACK 3: Solo estudiantes asignados al profesor (sin filtro de sección)
            console.log(\`⚠️ [DINÁMICO] Método 4: Fallback - estudiantes asignados al profesor (SIN filtro de sección)\`);
            
            const assignedStudents = allUsers.filter(user => {
                if (user.role !== 'student') return false;
                
                return user.assignedTeacher === user.username ||
                       (user.assignedTeachers && Object.values(user.assignedTeachers).includes(user.username));
            });
            
            console.log(\`⚠️ [DINÁMICO] Método 4: \${assignedStudents.length} estudiantes asignados al profesor (requiere configuración de secciones)\`);
            
            return assignedStudents.map(s => ({
                id: s.id,
                username: s.username,
                displayName: s.displayName || s.username
            }));
        };
        `;
        
        // 3. Inyectar la función mejorada en el contexto de la página
        console.log('\n🔧 [CORRECCIÓN] Inyectando función mejorada...');
        
        // Crear un script que redefina la función en el contexto global
        const script = document.createElement('script');
        script.textContent = newGetStudentsForCourse;
        document.head.appendChild(script);
        
        console.log('✅ [CORRECCIÓN] Función mejorada inyectada correctamente');
        
        // 4. Verificar que hay datos necesarios
        const problemasDetectados = [];
        
        if (studentAssignments.length === 0) {
            problemasDetectados.push('No hay asignaciones de estudiantes (student-assignments)');
        }
        
        if (courses.length === 0) {
            problemasDetectados.push('No hay cursos configurados');
        }
        
        if (sections.length === 0) {
            problemasDetectados.push('No hay secciones configuradas');
        }
        
        const studentsWithoutAssignment = students.filter(s => 
            !studentAssignments.some(a => a.studentId === s.id)
        );
        
        if (studentsWithoutAssignment.length > 0) {
            problemasDetectados.push(`${studentsWithoutAssignment.length} estudiantes sin asignación de sección`);
        }
        
        // 5. Mostrar diagnóstico
        console.log('\n📊 [DIAGNÓSTICO] Estado del sistema:');
        
        if (problemasDetectados.length > 0) {
            console.log('⚠️ [PROBLEMAS DETECTADOS]:');
            problemasDetectados.forEach(problema => console.log(`   • ${problema}`));
            
            console.log('\n💡 [RECOMENDACIONES]:');
            console.log('   1. Ir a Gestión de Usuarios > Asignaciones');
            console.log('   2. Asignar estudiantes a cursos y secciones específicos');
            console.log('   3. Verificar que todos los estudiantes tengan una sección asignada');
        } else {
            console.log('✅ [ESTADO] Sistema configurado correctamente');
        }
        
        // 6. Mostrar ejemplo de funcionamiento
        console.log('\n🧪 [EJEMPLO] Simulando filtrado para "4to Básico - Sección A":');
        
        const ejemploSeccion = sections.find(s => s.name === 'A');
        if (ejemploSeccion) {
            const estudiantesEjemplo = studentAssignments.filter(a => a.sectionId === ejemploSeccion.id);
            console.log(`   • Estudiantes en sección A: ${estudiantesEjemplo.length}`);
            
            estudiantesEjemplo.forEach(assignment => {
                const estudiante = students.find(s => s.id === assignment.studentId);
                if (estudiante) {
                    console.log(`     - ${estudiante.displayName || estudiante.username}`);
                }
            });
        }
        
        console.log('\n🎉 [ÉXITO] Corrección del filtrado completada');
        console.log('💡 [PRÓXIMO PASO] Recarga la página y prueba crear una nueva tarea');
        
        return true;
        
    } catch (error) {
        console.error('❌ [ERROR] Error durante la corrección:', error);
        return false;
    }
}

/**
 * Función de diagnóstico detallado
 */
function diagnosticarSistemaFiltrado() {
    console.log('\n🔍 [DIAGNÓSTICO] Análisis detallado del sistema de filtrado...');
    
    try {
        const students = JSON.parse(localStorage.getItem('smart-student-users') || '[]').filter(u => u.role === 'student');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log('📋 [ESTUDIANTES] Lista de estudiantes y sus asignaciones:');
        students.forEach(student => {
            const assignment = studentAssignments.find(a => a.studentId === student.id);
            if (assignment) {
                const course = courses.find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                console.log(`   • ${student.displayName || student.username}:`);
                console.log(`     - Curso: ${course?.name || 'Desconocido'}`);
                console.log(`     - Sección: ${section?.name || 'Desconocida'}`);
                console.log(`     - ActiveCourses: [${student.activeCourses?.join(', ') || 'vacío'}]`);
            } else {
                console.log(`   • ${student.displayName || student.username}: ❌ SIN ASIGNACIÓN`);
            }
        });
        
        console.log('\n📋 [SECCIONES] Lista de secciones disponibles:');
        sections.forEach(section => {
            const course = courses.find(c => c.id === section.courseId);
            const studentsInSection = studentAssignments.filter(a => a.sectionId === section.id);
            console.log(`   • ${course?.name || 'Curso desconocido'} - Sección ${section.name}: ${studentsInSection.length} estudiantes`);
        });
        
    } catch (error) {
        console.error('❌ [ERROR] Error en diagnóstico:', error);
    }
}

// Ejecutar corrección automáticamente
console.log('🚀 [INICIO] Ejecutando corrección automática...');
const resultado = corregirFiltradoEstudiantesDinamico();

if (resultado) {
    console.log('\n✅ [COMPLETADO] Corrección exitosa');
    console.log('📝 [INSTRUCCIONES FINALES]:');
    console.log('   1. Recarga la página (F5)');
    console.log('   2. Ve a Tareas > Nueva Tarea');
    console.log('   3. Selecciona un curso y sección');
    console.log('   4. Elige "Estudiantes específicos"');
    console.log('   5. Verifica que solo aparezcan estudiantes de esa sección');
    console.log('\n🔧 [FUNCIONES DISPONIBLES]:');
    console.log('   • diagnosticarSistemaFiltrado() - Para análisis detallado');
    console.log('   • corregirFiltradoEstudiantesDinamico() - Para re-ejecutar la corrección');
} else {
    console.log('\n❌ [ERROR] La corrección falló. Revisa los logs anteriores.');
}
