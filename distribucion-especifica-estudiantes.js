/**
 * 🎯 DISTRIBUCIÓN ESPECÍFICA DE ESTUDIANTES POR CURSO Y SECCIÓN
 * 
 * Este script distribuye los estudiantes exactamente como especificó el usuario:
 * - 4to A: Felipe y María
 * - 4to B: Karla y Sofía
 * - 5to A: Gustavo y Max
 */

console.log('🎯 INICIANDO DISTRIBUCIÓN ESPECÍFICA POR CURSO Y SECCIÓN...');

function distribucionEspecifica() {
    console.log('\n🎯 [DISTRIBUCIÓN ESPECÍFICA] Configurando estudiantes por curso y sección...');
    
    try {
        // Cargar datos
        let users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        let courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        let sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log(`📊 Estado inicial:`);
        console.log(`   • Estudiantes: ${students.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        
        // Mapeo de estudiantes según especificación
        const distribucion = [
            { nombre: 'felipe', curso: '4to Básico', seccion: 'A' },
            { nombre: 'maria', curso: '4to Básico', seccion: 'A' },
            { nombre: 'karla', curso: '4to Básico', seccion: 'B' },
            { nombre: 'sofia', curso: '4to Básico', seccion: 'B' },
            { nombre: 'gustavo', curso: '5to Básico', seccion: 'A' },
            { nombre: 'max', curso: '5to Básico', seccion: 'A' }
        ];
        
        console.log('\n📋 [DISTRIBUCIÓN PLANIFICADA]:');
        distribucion.forEach(item => {
            console.log(`   • ${item.nombre} → ${item.curso} Sección ${item.seccion}`);
        });
        
        // Crear cursos si no existen
        const cursosRequeridos = ['4to Básico', '5to Básico'];
        cursosRequeridos.forEach(nombreCurso => {
            let curso = courses.find(c => c.name === nombreCurso);
            if (!curso) {
                curso = {
                    id: `course-${nombreCurso.replace(' ', '-').toLowerCase()}-${Date.now()}`,
                    name: nombreCurso,
                    description: `Curso de ${nombreCurso}`,
                    level: nombreCurso.includes('4to') ? 'elementary' : 'intermediate',
                    createdAt: new Date().toISOString()
                };
                courses.push(curso);
                console.log(`✅ Curso creado: ${nombreCurso}`);
            }
        });
        
        // Crear secciones si no existen
        const seccionesRequeridas = [
            { curso: '4to Básico', seccion: 'A' },
            { curso: '4to Básico', seccion: 'B' },
            { curso: '5to Básico', seccion: 'A' }
        ];
        
        seccionesRequeridas.forEach(item => {
            const curso = courses.find(c => c.name === item.curso);
            if (curso) {
                let seccion = sections.find(s => s.courseId === curso.id && s.name === item.seccion);
                if (!seccion) {
                    seccion = {
                        id: `section-${curso.id}-${item.seccion.toLowerCase()}-${Date.now()}`,
                        name: item.seccion,
                        courseId: curso.id,
                        description: `Sección ${item.seccion} de ${item.curso}`,
                        maxStudents: 30,
                        createdAt: new Date().toISOString()
                    };
                    sections.push(seccion);
                    console.log(`✅ Sección creada: ${item.curso} - Sección ${item.seccion}`);
                }
            }
        });
        
        // Limpiar asignaciones existentes
        studentAssignments = [];
        
        console.log('\n🔄 [PROCESANDO ESTUDIANTES]:');
        
        // Procesar cada estudiante según la distribución
        distribucion.forEach(item => {
            const student = students.find(s => 
                s.username.toLowerCase() === item.nombre ||
                s.displayName?.toLowerCase() === item.nombre
            );
            
            if (student) {
                const curso = courses.find(c => c.name === item.curso);
                const seccion = sections.find(s => 
                    s.courseId === curso.id && s.name === item.seccion
                );
                
                if (curso && seccion) {
                    // Crear asignación
                    const assignment = {
                        id: `assignment-${student.id}-${Date.now()}`,
                        studentId: student.id,
                        courseId: curso.id,
                        sectionId: seccion.id,
                        createdAt: new Date().toISOString(),
                        createdBy: 'specific-distribution-script'
                    };
                    
                    studentAssignments.push(assignment);
                    
                    // Actualizar datos del estudiante
                    student.sectionName = seccion.name;
                    student.activeCourses = [`${item.curso} - Sección ${item.seccion}`];
                    student.assignedTeacher = 'admin'; // Temporalmente
                    
                    console.log(`✅ ${student.displayName || student.username} → ${item.curso} Sección ${item.seccion}`);
                    console.log(`      CourseId: ${curso.id}`);
                    console.log(`      SectionId: ${seccion.id}`);
                } else {
                    console.log(`❌ Error: No se encontró curso o sección para ${item.nombre}`);
                }
            } else {
                console.log(`❌ Error: No se encontró estudiante ${item.nombre}`);
            }
        });
        
        // Guardar todos los cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        
        console.log('\n🎉 [DISTRIBUCIÓN COMPLETADA]');
        
        // Verificar resultado
        console.log('\n📋 [VERIFICACIÓN FINAL]:');
        
        const gruposPorCursoSeccion = {};
        studentAssignments.forEach(assignment => {
            const student = students.find(s => s.id === assignment.studentId);
            const course = courses.find(c => c.id === assignment.courseId);
            const section = sections.find(s => s.id === assignment.sectionId);
            
            const key = `${course.name} - Sección ${section.name}`;
            if (!gruposPorCursoSeccion[key]) {
                gruposPorCursoSeccion[key] = [];
            }
            gruposPorCursoSeccion[key].push(student.displayName || student.username);
        });
        
        Object.keys(gruposPorCursoSeccion).forEach(grupo => {
            console.log(`\n📚 ${grupo}:`);
            gruposPorCursoSeccion[grupo].forEach(nombre => {
                console.log(`   • ${nombre}`);
            });
        });
        
        console.log('\n💡 [AHORA PUEDES PROBAR]:');
        console.log('   1. Recarga la página (F5)');
        console.log('   2. Crea una nueva tarea');
        console.log('   3. Selecciona "4to Básico Sección A"');
        console.log('   4. Elige "Estudiantes específicos"');
        console.log('   5. ¡Solo deberías ver: Felipe y María!');
        console.log('   6. Prueba con "4to Básico Sección B" → Karla y Sofía');
        console.log('   7. Prueba con "5to Básico Sección A" → Gustavo y Max');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error durante la distribución específica:', error);
        return false;
    }
}

// Función para verificar la distribución específica
function verificarDistribucionEspecifica() {
    console.log('\n🔍 [VERIFICACIÓN ESPECÍFICA] Verificando distribución...');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log(`📊 Resumen actual:`);
        console.log(`   • Total estudiantes: ${students.length}`);
        console.log(`   • Total asignaciones: ${studentAssignments.length}`);
        console.log(`   • Total cursos: ${courses.length}`);
        console.log(`   • Total secciones: ${sections.length}`);
        
        // Agrupar por curso y sección
        const grupos = {};
        
        studentAssignments.forEach(assignment => {
            const student = students.find(s => s.id === assignment.studentId);
            const course = courses.find(c => c.id === assignment.courseId);
            const section = sections.find(s => s.id === assignment.sectionId);
            
            if (student && course && section) {
                const key = `${course.name} - Sección ${section.name}`;
                if (!grupos[key]) {
                    grupos[key] = {
                        courseId: course.id,
                        sectionId: section.id,
                        estudiantes: []
                    };
                }
                grupos[key].estudiantes.push(student.displayName || student.username);
            }
        });
        
        console.log('\n📚 [GRUPOS ACTUALES]:');
        Object.keys(grupos).forEach(grupo => {
            const info = grupos[grupo];
            console.log(`\n📖 ${grupo}:`);
            console.log(`   • CourseId: ${info.courseId}`);
            console.log(`   • SectionId: ${info.sectionId}`);
            console.log(`   • Estudiantes (${info.estudiantes.length}):`);
            info.estudiantes.forEach(nombre => {
                console.log(`     - ${nombre}`);
            });
        });
        
        // Verificar distribución esperada
        const esperado = {
            '4to Básico - Sección A': ['felipe', 'maria'],
            '4to Básico - Sección B': ['karla', 'sofia'],
            '5to Básico - Sección A': ['gustavo', 'max']
        };
        
        console.log('\n✅ [VERIFICACIÓN DE DISTRIBUCIÓN]:');
        let correcto = true;
        
        Object.keys(esperado).forEach(grupo => {
            const actual = grupos[grupo]?.estudiantes.map(n => n.toLowerCase()) || [];
            const esperadoNombres = esperado[grupo];
            
            const coincide = esperadoNombres.every(nombre => actual.includes(nombre)) &&
                            actual.length === esperadoNombres.length;
            
            if (coincide) {
                console.log(`✅ ${grupo}: CORRECTO`);
            } else {
                console.log(`❌ ${grupo}: INCORRECTO`);
                console.log(`   Esperado: [${esperadoNombres.join(', ')}]`);
                console.log(`   Actual: [${actual.join(', ')}]`);
                correcto = false;
            }
        });
        
        if (correcto) {
            console.log('\n🎉 ¡DISTRIBUCIÓN PERFECTA! Todo está configurado correctamente.');
        } else {
            console.log('\n⚠️ Hay diferencias en la distribución. Ejecuta distribucionEspecifica() nuevamente.');
        }
        
        return correcto;
        
    } catch (error) {
        console.error('❌ Error en verificación específica:', error);
        return false;
    }
}

// Ejecutar automáticamente
console.log('🚀 Ejecutando distribución específica...');
const resultado = distribucionEspecifica();

if (resultado) {
    console.log('\n✅ DISTRIBUCIÓN ESPECÍFICA EXITOSA');
    console.log('\n🔧 FUNCIONES DISPONIBLES:');
    console.log('   • distribucionEspecifica() - Para redistribuir según especificación');
    console.log('   • verificarDistribucionEspecifica() - Para verificar la distribución');
    
    // Verificar automáticamente
    setTimeout(() => {
        verificarDistribucionEspecifica();
    }, 1000);
} else {
    console.log('\n❌ ERROR en la distribución específica');
}
