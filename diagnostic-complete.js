/**
 * 🔧 DIAGNÓSTICO COMPLETO DE SINCRONIZACIÓN
 * 
 * Este script diagnostica por qué los cambios en Gestión de Usuarios
 * no se reflejan en localStorage y los Datos Académicos.
 */

console.log('🔧 DIAGNÓSTICO COMPLETO DE SINCRONIZACIÓN...');
console.log('=============================================');

// 1. Función para revisar estado completo de localStorage
function diagnosticarLocalStorage() {
    try {
        console.log('📊 REVISIÓN COMPLETA DE LOCALSTORAGE:');
        console.log('====================================');
        
        const keys = [
            'smart-student-users',
            'smart-student-courses', 
            'smart-student-sections',
            'smart-student-student-assignments'
        ];
        
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                console.log(`\n📋 ${key}:`);
                console.log(`   Elementos: ${Array.isArray(parsed) ? parsed.length : 'No es array'}`);
                
                if (key === 'smart-student-users') {
                    const students = parsed.filter(u => u.role === 'student');
                    console.log(`   Estudiantes: ${students.length}`);
                    students.forEach(s => {
                        console.log(`     - ${s.username}: ${s.activeCourses?.[0] || 'Sin curso'}`);
                    });
                }
                
                if (key === 'smart-student-student-assignments') {
                    console.log(`   Asignaciones: ${parsed.length}`);
                    parsed.forEach(a => {
                        console.log(`     - StudentID: ${a.studentId?.substring(0, 8)}... → CourseID: ${a.courseId?.substring(0, 8)}...`);
                    });
                }
            } else {
                console.log(`\n❌ ${key}: NO EXISTE`);
            }
        });

    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

// 2. Función para verificar relaciones específicas
function verificarRelacionesGusταvoMax() {
    try {
        console.log('\n🎯 VERIFICACIÓN ESPECÍFICA GUSTAVO Y MAX:');
        console.log('========================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        ['gustavo', 'max'].forEach(username => {
            console.log(`\n👤 ${username.toUpperCase()}:`);
            
            const user = users.find(u => u.username === username);
            if (user) {
                console.log(`   ID: ${user.id}`);
                console.log(`   Perfil curso: ${user.activeCourses?.[0] || 'Sin curso'}`);
                
                const assignment = assignments.find(a => a.studentId === user.id);
                if (assignment) {
                    console.log(`   Asignación encontrada:`);
                    console.log(`     CourseID: ${assignment.courseId}`);
                    console.log(`     SectionID: ${assignment.sectionId}`);
                    
                    const course = courses.find(c => c.id === assignment.courseId);
                    const section = sections.find(s => s.id === assignment.sectionId);
                    
                    if (course) {
                        console.log(`     Curso: ${course.name}`);
                    } else {
                        console.log(`     ❌ Curso no encontrado con ID: ${assignment.courseId}`);
                    }
                    
                    if (section) {
                        console.log(`     Sección: ${section.name}`);
                    } else {
                        console.log(`     ❌ Sección no encontrada con ID: ${assignment.sectionId}`);
                    }
                    
                    if (course && section) {
                        const expectedCourse = `${course.name} - Sección ${section.name}`;
                        console.log(`   📋 Debería mostrar: ${expectedCourse}`);
                        
                        if (user.activeCourses?.[0] === expectedCourse) {
                            console.log(`   ✅ SINCRONIZADO`);
                        } else {
                            console.log(`   ❌ DESINCRONIZADO`);
                        }
                    }
                } else {
                    console.log(`   ❌ Sin asignación en student-assignments`);
                }
            } else {
                console.log(`   ❌ Usuario no encontrado`);
            }
        });

    } catch (error) {
        console.error('❌ Error verificando relaciones:', error);
    }
}

// 3. Función para buscar inconsistencias
function buscarInconsistencias() {
    try {
        console.log('\n🔍 BÚSQUEDA DE INCONSISTENCIAS:');
        console.log('==============================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log(`📊 ESTADÍSTICAS:`);
        console.log(`   Usuarios: ${users.length}`);
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);
        console.log(`   Asignaciones: ${assignments.length}`);

        // Verificar cursos huérfanos
        const coursesInSections = new Set(sections.map(s => s.courseId));
        const orphanCourses = courses.filter(c => !coursesInSections.has(c.id));
        if (orphanCourses.length > 0) {
            console.log(`\n⚠️ CURSOS SIN SECCIONES: ${orphanCourses.length}`);
            orphanCourses.forEach(c => console.log(`   - ${c.name} (${c.id})`));
        }

        // Verificar asignaciones rotas
        const brokenAssignments = assignments.filter(a => {
            const courseExists = courses.find(c => c.id === a.courseId);
            const sectionExists = sections.find(s => s.id === a.sectionId);
            const userExists = users.find(u => u.id === a.studentId);
            return !courseExists || !sectionExists || !userExists;
        });
        
        if (brokenAssignments.length > 0) {
            console.log(`\n⚠️ ASIGNACIONES ROTAS: ${brokenAssignments.length}`);
            brokenAssignments.forEach(a => {
                console.log(`   - StudentID: ${a.studentId?.substring(0, 8)}...`);
                console.log(`     CourseID: ${a.courseId?.substring(0, 8)}...`);
                console.log(`     SectionID: ${a.sectionId?.substring(0, 8)}...`);
            });
        }

        // Buscar datos que debería tener según Gestión de Usuarios
        console.log(`\n🔍 VERIFICANDO DATOS ESPERADOS:`);
        console.log(`==============================`);
        
        // Buscar si existe "4to Medio" para Gustavo
        const cuartoMedio = courses.find(c => c.name === '4to Medio');
        if (cuartoMedio) {
            console.log(`✅ Curso "4to Medio" existe: ${cuartoMedio.id}`);
            const seccionA = sections.find(s => s.courseId === cuartoMedio.id && s.name === 'A');
            if (seccionA) {
                console.log(`✅ Sección A de 4to Medio existe: ${seccionA.id}`);
            } else {
                console.log(`❌ Sección A de 4to Medio NO existe`);
            }
        } else {
            console.log(`❌ Curso "4to Medio" NO existe en localStorage`);
        }

        // Buscar si existe "5to Básico - A" para Max
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        if (quintoBasico) {
            console.log(`✅ Curso "5to Básico" existe: ${quintoBasico.id}`);
            const seccionA = sections.find(s => s.courseId === quintoBasico.id && s.name === 'A');
            if (seccionA) {
                console.log(`✅ Sección A de 5to Básico existe: ${seccionA.id}`);
            } else {
                console.log(`❌ Sección A de 5to Básico NO existe`);
            }
        } else {
            console.log(`❌ Curso "5to Básico" NO existe en localStorage`);
        }

    } catch (error) {
        console.error('❌ Error buscando inconsistencias:', error);
    }
}

// 4. Función para aplicar correcciones manuales
function aplicarCorreccionManual() {
    try {
        console.log('\n🔧 APLICANDO CORRECCIÓN MANUAL...');
        console.log('=================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        let courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        let sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        // Correcciones basadas en la imagen de gestión que mostraste
        const correcciones = [
            { username: 'gustavo', curso: '4to Medio', seccion: 'A' },
            { username: 'max', curso: '5to Básico', seccion: 'A' }
        ];

        correcciones.forEach(correccion => {
            const user = users.find(u => u.username === correccion.username);
            if (!user) {
                console.log(`❌ Usuario ${correccion.username} no encontrado`);
                return;
            }

            console.log(`\n🔧 Corrigiendo ${correccion.username}:`);

            // Buscar o crear curso
            let course = courses.find(c => c.name === correccion.curso);
            if (!course) {
                course = {
                    id: `curso-${Date.now()}-${correccion.curso.replace(/\s+/g, '-').toLowerCase()}`,
                    name: correccion.curso,
                    description: `Curso ${correccion.curso}`,
                    createdAt: new Date().toISOString(),
                    manuallyCreated: true
                };
                courses.push(course);
                console.log(`   ➕ Curso creado: ${course.name}`);
            }

            // Buscar o crear sección
            let section = sections.find(s => s.courseId === course.id && s.name === correccion.seccion);
            if (!section) {
                section = {
                    id: `seccion-${Date.now()}-${correccion.seccion.toLowerCase()}`,
                    name: correccion.seccion,
                    courseId: course.id,
                    description: `Sección ${correccion.seccion} de ${course.name}`,
                    createdAt: new Date().toISOString(),
                    manuallyCreated: true
                };
                sections.push(section);
                console.log(`   ➕ Sección creada: ${section.name}`);
            }

            // Eliminar asignación anterior
            assignments = assignments.filter(a => a.studentId !== user.id);

            // Crear nueva asignación
            const newAssignment = {
                id: `assignment-${Date.now()}-${correccion.username}`,
                studentId: user.id,
                courseId: course.id,
                sectionId: section.id,
                createdAt: new Date().toISOString(),
                manualCorrection: true
            };
            assignments.push(newAssignment);

            // Actualizar perfil del usuario
            const fullCourseName = `${course.name} - Sección ${section.name}`;
            user.activeCourses = [fullCourseName];

            console.log(`   ✅ ${user.username}: ${fullCourseName}`);
        });

        // Guardar todos los cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(assignments));

        console.log(`\n🎉 CORRECCIÓN MANUAL COMPLETADA`);
        console.log(`===============================`);
        console.log(`✅ Datos actualizados en localStorage`);
        console.log(`📡 Disparando eventos de actualización...`);

        // Disparar eventos para actualizar la UI
        window.dispatchEvent(new CustomEvent('storage', { 
            detail: { key: 'smart-student-users', manual: true } 
        }));
        
        window.dispatchEvent(new CustomEvent('localStorageUpdate', {
            detail: { type: 'manual-correction', users: ['gustavo', 'max'] }
        }));

        // Recargar si estamos en perfil
        if (window.location.pathname.includes('/perfil')) {
            console.log(`🔄 Recargando página en 2 segundos...`);
            setTimeout(() => {
                location.reload();
            }, 2000);
        }

        return true;

    } catch (error) {
        console.error('❌ Error en corrección manual:', error);
        return false;
    }
}

// ===============================
// 🚀 EJECUTAR DIAGNÓSTICO COMPLETO
// ===============================

console.log('🚀 INICIANDO DIAGNÓSTICO...');

// 1. Revisar localStorage completo
diagnosticarLocalStorage();

// 2. Verificar relaciones específicas
verificarRelacionesGusταvoMax();

// 3. Buscar inconsistencias
buscarInconsistencias();

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('- diagnosticarLocalStorage() - Ver todo localStorage');
console.log('- verificarRelacionesGusταvoMax() - Verificar Gustavo y Max específicamente');
console.log('- buscarInconsistencias() - Buscar problemas en los datos');
console.log('- aplicarCorreccionManual() - APLICAR CORRECCIÓN MANUAL AHORA');

console.log('\n🎯 PARA CORREGIR INMEDIATAMENTE:');
console.log('===============================');
console.log('Ejecuta: aplicarCorreccionManual()');
console.log('Esto creará los cursos faltantes y actualizará los perfiles.');
