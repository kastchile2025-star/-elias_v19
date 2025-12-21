/**
 * 🔄 SCRIPT PARA HACER EL PERFIL COMPLETAMENTE DINÁMICO
 * 
 * Este script actualiza automáticamente los perfiles cuando cambias
 * asignaciones en Gestión de Usuarios.
 */

console.log('🔄 CONFIGURANDO SISTEMA DINÁMICO...');
console.log('===================================');

// 1. Función para disparar evento cuando cambien los datos
function triggerProfileUpdate() {
    console.log('📡 Disparando actualización de perfiles...');
    
    // Disparar evento personalizado para que los componentes se actualicen
    const event = new CustomEvent('localStorageUpdate', {
        detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    console.log('✅ Evento de actualización disparado');
}

// 2. Sobrescribir las funciones de localStorage para disparar eventos automáticamente
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    const result = originalSetItem.call(this, key, value);
    
    // Solo disparar para keys relevantes del sistema
    if (key && [
        'smart-student-users',
        'smart-student-student-assignments', 
        'smart-student-teacher-assignments',
        'smart-student-courses',
        'smart-student-sections'
    ].includes(key)) {
        setTimeout(() => triggerProfileUpdate(), 100); // Pequeño delay para que se procese el cambio
    }
    
    return result;
};

console.log('✅ Sistema de localStorage interceptado');

// 3. Función para actualizar asignaciones de estudiante y disparar actualización
function updateStudentAssignment(username, newCourse, newSection) {
    try {
        console.log(`🎯 Actualizando ${username} a ${newCourse} - Sección ${newSection}`);
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        // Buscar usuario
        const usuario = users.find(u => u.username === username);
        if (!usuario) {
            console.error(`❌ Usuario ${username} no encontrado`);
            return false;
        }

        // Buscar o crear curso
        let curso = courses.find(c => c.name === newCourse);
        if (!curso) {
            curso = {
                id: `curso-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: newCourse,
                description: `Curso ${newCourse}`,
                createdAt: new Date().toISOString(),
                autoCreated: true
            };
            courses.push(curso);
            console.log(`➕ Curso creado: ${curso.name}`);
        }

        // Buscar o crear sección
        let seccion = sections.find(s => s.name === newSection && s.courseId === curso.id);
        if (!seccion) {
            seccion = {
                id: `seccion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: newSection,
                courseId: curso.id,
                description: `Sección ${newSection} de ${curso.name}`,
                createdAt: new Date().toISOString(),
                autoCreated: true
            };
            sections.push(seccion);
            console.log(`➕ Sección creada: ${seccion.name} para ${curso.name}`);
        }

        // Eliminar asignación anterior del estudiante
        studentAssignments = studentAssignments.filter(a => a.studentId !== usuario.id);

        // Crear nueva asignación
        const nuevaAsignacion = {
            id: `dynamic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentId: usuario.id,
            courseId: curso.id,
            sectionId: seccion.id,
            createdAt: new Date().toISOString(),
            dynamicUpdate: true,
            source: 'dynamic-system'
        };

        studentAssignments.push(nuevaAsignacion);

        // Actualizar perfil del usuario
        const cursoCompleto = `${curso.name} - Sección ${seccion.name}`;
        usuario.activeCourses = [cursoCompleto];

        // Guardar todos los cambios (esto disparará automáticamente la actualización)
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));

        console.log(`✅ ${username} actualizado a: ${cursoCompleto}`);
        console.log('🔄 Los perfiles se actualizarán automáticamente');
        
        return true;

    } catch (error) {
        console.error('❌ Error actualizando asignación:', error);
        return false;
    }
}

// 4. Función para sincronizar todos los estudiantes con sus nuevas asignaciones
function syncAllStudentsWithNewAssignments() {
    try {
        console.log('🔄 SINCRONIZANDO TODOS LOS ESTUDIANTES...');
        console.log('=========================================');

        // Asignaciones basadas en lo que configuraste en gestión de usuarios
        const newAssignments = [
            { username: 'felipe', curso: '4to Básico', seccion: 'A' },
            { username: 'maria', curso: '4to Básico', seccion: 'A' },
            { username: 'sofia', curso: '4to Básico', seccion: 'B' },
            { username: 'karla', curso: '4to Básico', seccion: 'B' },
            { username: 'gustavo', curso: '5to Básico', seccion: 'B' },
            { username: 'max', curso: '5to Básico', seccion: 'B' }
        ];

        console.log('📋 Nuevas asignaciones a aplicar:');
        newAssignments.forEach(asig => {
            console.log(`- ${asig.username}: ${asig.curso} - Sección ${asig.seccion}`);
        });

        let success = 0;
        newAssignments.forEach(asig => {
            if (updateStudentAssignment(asig.username, asig.curso, asig.seccion)) {
                success++;
            }
        });

        console.log(`\n🎉 SINCRONIZACIÓN COMPLETADA:`);
        console.log(`✅ Estudiantes actualizados: ${success}/${newAssignments.length}`);
        console.log('🔄 Los perfiles ya se están actualizando automáticamente');
        
        return true;

    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        return false;
    }
}

// 5. Función para verificar que todo esté funcionando dinámicamente
function verifyDynamicSystem() {
    try {
        console.log('\n🔍 VERIFICANDO SISTEMA DINÁMICO...');
        console.log('==================================');

        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const estudiantes = users.filter(u => u.role === 'student');
        
        console.log('📊 Estado actual de estudiantes:');
        estudiantes.forEach(estudiante => {
            const curso = estudiante.activeCourses?.[0] || 'Sin curso';
            console.log(`${estudiante.username}: ${curso}`);
        });

        console.log('\n💡 PRUEBA DINÁMICA:');
        console.log('Para probar que funciona dinámicamente, ejecuta:');
        console.log('updateStudentAssignment("gustavo", "6to Básico", "C")');
        console.log('(Y verás que su perfil se actualiza automáticamente)');

        return true;

    } catch (error) {
        console.error('❌ Error verificando sistema:', error);
        return false;
    }
}

// Ejecutar configuración automáticamente
console.log('🚀 INICIANDO CONFIGURACIÓN DINÁMICA...');
syncAllStudentsWithNewAssignments();

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('- updateStudentAssignment(username, curso, seccion) - Cambiar asignación específica');
console.log('- syncAllStudentsWithNewAssignments() - Sincronizar todos los estudiantes');
console.log('- verifyDynamicSystem() - Verificar estado del sistema');
console.log('- triggerProfileUpdate() - Forzar actualización manual de perfiles');

console.log('\n🎯 RESULTADO:');
console.log('=============');
console.log('✅ Sistema dinámico configurado');
console.log('✅ Los perfiles se actualizarán automáticamente');
console.log('✅ Gustavo y Max ahora mostrarán "5to Básico - Sección B"');
console.log('🔄 Recarga la página y ve a sus perfiles para verificar');
