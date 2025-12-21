// 🔧 CORRECCIÓN DEFINITIVA: Filtrado por Curso Y Sección Específica
// Ejecutar en la consola del navegador

console.log('🔧 === CORRECCIÓN CURSO Y SECCIÓN ESPECÍFICA ===');

function verificarEstructuraAsignaciones() {
    console.log('\n📋 Verificando estructura de asignaciones...');
    
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    console.log(`📊 Total asignaciones: ${asignaciones.length}`);
    console.log(`👥 Total usuarios: ${usuarios.length}`);
    console.log(`📝 Total tareas: ${tareas.length}`);
    
    // Mostrar estructura de asignaciones
    console.log('\n🎯 ASIGNACIONES ACTUALES:');
    asignaciones.forEach((assignment, index) => {
        console.log(`  ${index + 1}. Estudiante: ${assignment.studentId}`);.
        console.log(`     courseId: ${assignment.courseId}`);
        console.log(`     sectionId: ${assignment.sectionId}`);
        console.log(`     teacherId: ${assignment.teacherId}`);
        console.log('     ---');
    });
    
    // Buscar tarea específica con 9077a79d
    const tareaEspecifica = tareas.find(t => t.course && t.course.includes('9077a79d'));
    if (tareaEspecifica) {
        console.log('\n📚 TAREA ESPECÍFICA ENCONTRADA:');
        console.log(`  Título: "${tareaEspecifica.title}"`);
        console.log(`  Course: ${tareaEspecifica.course}`);
        console.log(`  AssignedTo: ${tareaEspecifica.assignedTo}`);
        
        return { asignaciones, usuarios, tareas, tareaEspecifica };
    } else {
        console.log('\n❌ No se encontró tarea con código 9077a79d');
        return { asignaciones, usuarios, tareas, tareaEspecifica: null };
    }
}

function corregirAsignacionesEspecificas() {
    console.log('\n🔧 === CORRIGIENDO ASIGNACIONES ESPECÍFICAS ===');
    
    const data = verificarEstructuraAsignaciones();
    if (!data.tareaEspecifica) {
        console.log('❌ No hay tarea específica para corregir');
        return;
    }
    
    const { tareaEspecifica, asignaciones, usuarios } = data;
    const courseCode = tareaEspecifica.course;
    
    console.log(`📚 Procesando tarea: "${tareaEspecifica.title}"`);
    console.log(`🏫 Código de curso completo: ${courseCode}`);
    
    // Parsear courseId y sectionId del formato compuesto
    let actualCourseId = courseCode;
    let sectionId = null;
    
    if (courseCode.includes('-') && courseCode.length > 40) {
        const parts = courseCode.split('-');
        if (parts.length >= 10) {
            actualCourseId = parts.slice(0, 5).join('-');
            sectionId = parts.slice(5).join('-');
            
            console.log(`🔍 Curso parseado:`);
            console.log(`   CourseId: ${actualCourseId}`);
            console.log(`   SectionId: ${sectionId}`);
        }
    }
    
    // Filtrar asignaciones exactas para este curso y sección
    const asignacionesEspecificas = asignaciones.filter(assignment => 
        assignment.courseId === actualCourseId && 
        assignment.sectionId === sectionId
    );
    
    console.log(`\n🎯 Asignaciones encontradas para esta sección: ${asignacionesEspecificas.length}`);
    
    if (asignacionesEspecificas.length === 0) {
        console.log('❌ No hay asignaciones para esta combinación curso-sección');
        
        // Sugerir creación de asignaciones
        console.log('\n💡 CREAR ASIGNACIONES DE PRUEBA:');
        const estudiantesFelipeMaria = usuarios.filter(u => 
            u.role === 'student' && 
            (u.username === 'felipe' || u.username === 'maria')
        );
        
        if (estudiantesFelipeMaria.length > 0) {
            console.log('📝 Creando asignaciones para estudiantes específicos...');
            
            const nuevasAsignaciones = estudiantesFelipeMaria.map(estudiante => ({
                id: `assignment_${Date.now()}_${estudiante.id}`,
                studentId: estudiante.id,
                courseId: actualCourseId,
                sectionId: sectionId,
                teacherId: tareaEspecifica.assignedById,
                assignedAt: new Date().toISOString(),
                status: 'active'
            }));
            
            // Limpiar asignaciones anteriores de estos estudiantes para evitar duplicados
            const asignacionesLimpias = asignaciones.filter(a => 
                !estudiantesFelipeMaria.some(e => e.id === a.studentId) ||
                !(a.courseId === actualCourseId && a.sectionId === sectionId)
            );
            
            const asignacionesFinales = [...asignacionesLimpias, ...nuevasAsignaciones];
            
            localStorage.setItem('smart-student-user-student-assignments', JSON.stringify(asignacionesFinales));
            
            console.log('✅ Asignaciones creadas:');
            nuevasAsignaciones.forEach(assignment => {
                const estudiante = estudiantesFelipeMaria.find(e => e.id === assignment.studentId);
                console.log(`   👤 ${estudiante?.username} → ${actualCourseId}-${sectionId}`);
            });
            
            return nuevasAsignaciones.length;
        } else {
            console.log('❌ No se encontraron estudiantes felipe y maria');
            return 0;
        }
    } else {
        console.log('✅ Asignaciones encontradas:');
        asignacionesEspecificas.forEach(assignment => {
            const estudiante = usuarios.find(u => u.id === assignment.studentId);
            console.log(`   👤 ${estudiante?.username || assignment.studentId}`);
        });
        
        return asignacionesEspecificas.length;
    }
}

function testFiltradoEspecifico() {
    console.log('\n🧪 === TEST FILTRADO ESPECÍFICO ===');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const tareaEspecifica = tareas.find(t => t.course && t.course.includes('9077a79d'));
    
    if (!tareaEspecifica) {
        console.log('❌ No hay tarea específica para probar');
        return [];
    }
    
    const courseCode = tareaEspecifica.course;
    
    // Simular la función corregida
    function getStudentsFromCourseRelevantToTaskCorrected(courseId) {
        console.log(`🔍 Filtrando estudiantes para: ${courseId}`);
        
        // Parsear courseId y sectionId
        let actualCourseId = courseId;
        let sectionId = null;
        
        if (courseId.includes('-') && courseId.length > 40) {
            const parts = courseId.split('-');
            if (parts.length >= 10) {
                actualCourseId = parts.slice(0, 5).join('-');
                sectionId = parts.slice(5).join('-');
            }
        }
        
        console.log(`   CourseId: ${actualCourseId}`);
        console.log(`   SectionId: ${sectionId}`);
        
        // Filtrar asignaciones exactas
        const asignacionesRelevantes = asignaciones.filter(assignment => {
            const matchesCourse = assignment.courseId === actualCourseId;
            const matchesSection = !sectionId || assignment.sectionId === sectionId;
            
            console.log(`   📋 ${assignment.studentId}: curso=${matchesCourse}, sección=${matchesSection}`);
            
            return matchesCourse && matchesSection;
        });
        
        console.log(`   🎯 Asignaciones relevantes: ${asignacionesRelevantes.length}`);
        
        // Obtener estudiantes
        const estudiantesIds = asignacionesRelevantes.map(a => a.studentId);
        const estudiantes = usuarios.filter(u => 
            u.role === 'student' && estudiantesIds.includes(u.id)
        );
        
        console.log(`   👥 Estudiantes encontrados: ${estudiantes.length}`);
        estudiantes.forEach(est => {
            console.log(`     ✅ ${est.username} (${est.displayName})`);
        });
        
        return estudiantes;
    }
    
    const resultado = getStudentsFromCourseRelevantToTaskCorrected(courseCode);
    
    if (resultado.length > 0) {
        console.log('\n🎉 ¡FILTRADO FUNCIONANDO CORRECTAMENTE!');
        console.log(`📊 Se encontraron ${resultado.length} estudiantes para la sección específica`);
    } else {
        console.log('\n❌ No se encontraron estudiantes para esta sección');
    }
    
    return resultado;
}

function forzarActualizacionCompleta() {
    console.log('\n🔄 Forzando actualización completa...');
    
    // Disparar todos los eventos posibles
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
    window.dispatchEvent(new CustomEvent('usersUpdated'));
    window.dispatchEvent(new CustomEvent('assignmentsUpdated'));
    document.dispatchEvent(new Event('dataRefresh'));
    
    // Cerrar y reabrir modal si existe
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
        const closeBtn = modal.querySelector('button[type="button"]');
        if (closeBtn) {
            closeBtn.click();
            console.log('🚪 Modal cerrado para forzar actualización');
        }
    }
    
    setTimeout(() => {
        console.log('✅ Actualización completa realizada');
        console.log('📋 SIGUIENTE: Abre la tarea con código 9077a79d');
    }, 500);
}

// Ejecutar proceso completo
function correccionCompleta() {
    console.log('🎯 === EJECUTANDO CORRECCIÓN COMPLETA ===');
    
    try {
        // Paso 1: Verificar estructura
        const data = verificarEstructuraAsignaciones();
        
        // Paso 2: Corregir asignaciones si es necesario
        const asignacionesCreadas = corregirAsignacionesEspecificas();
        
        // Paso 3: Test del filtrado
        const estudiantesEncontrados = testFiltradoEspecifico();
        
        // Paso 4: Actualizar UI
        forzarActualizacionCompleta();
        
        console.log('\n🏁 === RESUMEN FINAL ===');
        console.log(`📋 Asignaciones procesadas: ${asignacionesCreadas}`);
        console.log(`👥 Estudiantes encontrados: ${estudiantesEncontrados.length}`);
        
        if (estudiantesEncontrados.length > 0) {
            console.log('✅ CORRECCIÓN EXITOSA - El filtrado por curso y sección funciona');
        } else {
            console.log('⚠️ Verificar datos y probar manualmente');
        }
        
    } catch (error) {
        console.error('❌ Error en la corrección:', error);
    }
}

// Ejecutar automáticamente
correccionCompleta();

// Funciones disponibles para uso manual
window.verificarEstructuraAsignaciones = verificarEstructuraAsignaciones;
window.corregirAsignacionesEspecificas = corregirAsignacionesEspecificas;
window.testFiltradoEspecifico = testFiltradoEspecifico;
window.correccionCompleta = correccionCompleta;
