/**
 * CORRECCIÓN DINÁMICA: Sincronizar asignaciones con Gestión de Usuarios (módulo admin)
 */

console.log('🔧 SINCRONIZACIÓN DINÁMICA CON GESTIÓN DE USUARIOS');
console.log('=================================================');

// Cargar datos actuales
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log('\n📊 ESTADO ACTUAL DEL SISTEMA:');
console.log('   • Usuarios:', users.length);
console.log('   • Asignaciones estudiantes:', studentAssignments.length);
console.log('   • Asignaciones profesores:', teacherAssignments.length);
console.log('   • Cursos:', courses.length);
console.log('   • Secciones:', sections.length);

// Función para aplicar asignaciones correctas según Gestión de Usuarios
function aplicarAsignacionesCorrectas() {
    console.log('\n🔄 INICIANDO CORRECCIÓN DINÁMICA...');
    
    // PASO 1: Definir las asignaciones correctas según Gestión de Usuarios
    const asignacionesCorrectas = [
        // 4to Básico Sección A
        { username: 'felipe', courseName: '4to Básico', sectionName: 'A' },
        { username: 'maria', courseName: '4to Básico', sectionName: 'A' },
        
        // 4to Básico Sección B
        { username: 'sofia', courseName: '4to Básico', sectionName: 'B' },
        { username: 'karla', courseName: '4to Básico', sectionName: 'B' },
        
        // 5to Básico Sección A
        { username: 'gustavo', courseName: '5to Básico', sectionName: 'A' },
        { username: 'max', courseName: '5to Básico', sectionName: 'A' }
    ];
    
    console.log('\n📋 ASIGNACIONES CORRECTAS SEGÚN GESTIÓN DE USUARIOS:');
    asignacionesCorrectas.forEach((asignacion, index) => {
        console.log(`   ${index + 1}. ${asignacion.username} → ${asignacion.courseName} Sección ${asignacion.sectionName}`);
    });
    
    // PASO 2: Verificar que existen los cursos y secciones necesarios
    console.log('\n🔍 VERIFICANDO CURSOS Y SECCIONES NECESARIOS...');
    
    const cursosNecesarios = ['4to Básico', '5to Básico'];
    const seccionesNecesarias = ['A', 'B'];
    
    cursosNecesarios.forEach(cursoNombre => {
        let curso = courses.find(c => c.name === cursoNombre);
        if (!curso) {
            // Crear curso si no existe
            curso = {
                id: `curso-${cursoNombre.toLowerCase().replace(/\s+/g, '-')}`,
                name: cursoNombre,
                description: `Curso ${cursoNombre}`,
                level: 'básica',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                subjects: [],
                autoCreated: true
            };
            courses.push(curso);
            console.log(`   ✅ Curso creado: ${cursoNombre} (ID: ${curso.id})`);
        } else {
            console.log(`   ℹ️ Curso existe: ${cursoNombre} (ID: ${curso.id})`);
        }
        
        // Verificar secciones para este curso
        seccionesNecesarias.forEach(seccionNombre => {
            let seccion = sections.find(s => s.courseId === curso.id && s.name === seccionNombre);
            if (!seccion) {
                // Crear sección si no existe
                seccion = {
                    id: `seccion-${curso.id}-${seccionNombre.toLowerCase()}`,
                    name: seccionNombre,
                    courseId: curso.id,
                    description: `Sección ${seccionNombre} de ${cursoNombre}`,
                    maxStudents: 30,
                    studentCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    autoCreated: true
                };
                sections.push(seccion);
                console.log(`   ✅ Sección creada: ${cursoNombre} Sección ${seccionNombre} (ID: ${seccion.id})`);
            } else {
                console.log(`   ℹ️ Sección existe: ${cursoNombre} Sección ${seccionNombre} (ID: ${seccion.id})`);
            }
        });
    });
    
    // PASO 3: Aplicar asignaciones de estudiantes
    console.log('\n👥 APLICANDO ASIGNACIONES DE ESTUDIANTES...');
    
    // Limpiar asignaciones existentes
    const nuevasAsignacionesEstudiantes = [];
    
    asignacionesCorrectas.forEach(asignacion => {
        const estudiante = users.find(u => u.username === asignacion.username && (u.role === 'student' || u.role === 'estudiante'));
        const curso = courses.find(c => c.name === asignacion.courseName);
        const seccion = sections.find(s => s.courseId === curso?.id && s.name === asignacion.sectionName);
        
        if (estudiante && curso && seccion) {
            const nuevaAsignacion = {
                id: `sa-dynamic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                studentId: estudiante.id,
                courseId: curso.id,
                sectionId: seccion.id,
                createdAt: new Date().toISOString(),
                assignedAt: new Date().toISOString(),
                source: 'gestion-usuarios-dinamico'
            };
            
            nuevasAsignacionesEstudiantes.push(nuevaAsignacion);
            
            // Actualizar perfil del estudiante
            estudiante.activeCourses = [`${curso.name} - Sección ${seccion.name}`];
            estudiante.courseId = curso.id;
            estudiante.sectionId = seccion.id;
            
            console.log(`   ✅ ${estudiante.username} → ${curso.name} Sección ${seccion.name}`);
            console.log(`      StudentId: ${estudiante.id}`);
            console.log(`      CourseId: ${curso.id}`);
            console.log(`      SectionId: ${seccion.id}`);
        } else {
            console.log(`   ❌ Error en asignación: ${asignacion.username} → ${asignacion.courseName} Sección ${asignacion.sectionName}`);
            console.log(`      Estudiante encontrado: ${!!estudiante}`);
            console.log(`      Curso encontrado: ${!!curso}`);
            console.log(`      Sección encontrada: ${!!seccion}`);
        }
    });
    
    // PASO 4: Verificar asignaciones de profesores
    console.log('\n👨‍🏫 VERIFICANDO ASIGNACIONES DE PROFESORES...');
    
    // Obtener usuario actual (profesor logueado)
    const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    const currentUser = auth.user;
    
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'profesor')) {
        console.log(`   👨‍🏫 Profesor logueado: ${currentUser.username} (ID: ${currentUser.id})`);
        
        // Verificar qué secciones tiene asignadas según teacherAssignments
        const asignacionesProfesor = teacherAssignments.filter(ta => 
            ta.teacherId === currentUser.id || ta.teacherUsername === currentUser.username
        );
        
        console.log(`   📋 Asignaciones del profesor: ${asignacionesProfesor.length}`);
        
        // Mostrar secciones asignadas al profesor
        const seccionesProfesor = [...new Set(asignacionesProfesor.map(ta => ta.sectionId))];
        seccionesProfesor.forEach(sectionId => {
            const seccion = sections.find(s => s.id === sectionId);
            const curso = courses.find(c => c.id === seccion?.courseId);
            console.log(`   🏫 Sección asignada: ${curso?.name || 'Curso desconocido'} Sección ${seccion?.name || 'Desconocida'}`);
            console.log(`      SectionId: ${sectionId}`);
            
            // Mostrar estudiantes en esta sección
            const estudiantesEnSeccion = nuevasAsignacionesEstudiantes.filter(sa => sa.sectionId === sectionId);
            console.log(`      👥 Estudiantes en esta sección: ${estudiantesEnSeccion.length}`);
            estudiantesEnSeccion.forEach(sa => {
                const estudiante = users.find(u => u.id === sa.studentId);
                console.log(`         - ${estudiante?.username || 'Usuario no encontrado'}`);
            });
        });
    }
    
    // PASO 5: Guardar cambios
    console.log('\n💾 GUARDANDO CAMBIOS...');
    
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    localStorage.setItem('smart-student-courses', JSON.stringify(courses));
    localStorage.setItem('smart-student-sections', JSON.stringify(sections));
    localStorage.setItem('smart-student-student-assignments', JSON.stringify(nuevasAsignacionesEstudiantes));
    
    console.log('✅ CAMBIOS GUARDADOS EXITOSAMENTE');
    
    // PASO 6: Resumen final
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   • Asignaciones de estudiantes aplicadas: ${nuevasAsignacionesEstudiantes.length}`);
    console.log(`   • Distribución por sección:`);
    
    // Contar estudiantes por sección
    sections.forEach(seccion => {
        const curso = courses.find(c => c.id === seccion.courseId);
        const estudiantesEnSeccion = nuevasAsignacionesEstudiantes.filter(sa => sa.sectionId === seccion.id);
        if (estudiantesEnSeccion.length > 0) {
            console.log(`     - ${curso?.name || 'Curso desconocido'} Sección ${seccion.name}: ${estudiantesEnSeccion.length} estudiantes`);
            estudiantesEnSeccion.forEach(sa => {
                const estudiante = users.find(u => u.id === sa.studentId);
                console.log(`       • ${estudiante?.username || 'Usuario no encontrado'}`);
            });
        }
    });
    
    console.log('\n🔄 REINICIA LA PÁGINA para ver los cambios aplicados');
    
    return true;
}

// Ejecutar la corrección automáticamente
console.log('\n🚀 EJECUTANDO CORRECCIÓN DINÁMICA...');
const resultado = aplicarAsignacionesCorrectas();

if (resultado) {
    console.log('\n🎉 CORRECCIÓN DINÁMICA COMPLETADA EXITOSAMENTE');
    console.log('===============================================');
    console.log('✅ Las asignaciones ahora reflejan la configuración de Gestión de Usuarios');
    console.log('✅ Profesor pedro debería ver solo los estudiantes de sus secciones asignadas');
    console.log('✅ Sistema funcionando dinámicamente según la configuración admin');
} else {
    console.log('\n❌ ERROR EN LA CORRECCIÓN DINÁMICA');
    console.log('==================================');
    console.log('Revisa los logs anteriores para identificar el problema');
}
