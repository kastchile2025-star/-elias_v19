// 🔍 DIAGNÓSTICO: Curso y Sección
// Ejecutar en la consola del navegador

console.log('🔍 === DIAGNÓSTICO CURSO Y SECCIÓN ===');

function analizarEstructuraCursoSeccion() {
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    console.log('\n📊 ESTRUCTURA DE USUARIOS:');
    usuarios.filter(u => u.role === 'student').forEach(user => {
        console.log(`  👤 ${user.username}:`);
        console.log(`     activeCourses: ${JSON.stringify(user.activeCourses)}`);
        console.log(`     assignedTeacher: ${user.assignedTeacher}`);
        if (user.courseSection) {
            console.log(`     courseSection: ${user.courseSection}`);
        }
    });
    
    console.log('\n📋 ESTRUCTURA DE ASIGNACIONES:');
    if (asignaciones.length > 0) {
        asignaciones.forEach(assignment => {
            console.log(`  🎯 Estudiante: ${assignment.studentId}`);
            console.log(`     courseId: ${assignment.courseId}`);
            console.log(`     sectionId: ${assignment.sectionId}`);
            console.log(`     teacherId: ${assignment.teacherId}`);
            console.log('     ---');
        });
    } else {
        console.log('  ❌ No hay asignaciones registradas');
    }
    
    console.log('\n📝 TAREAS CON CÓDIGO 9077a79d:');
    const tareasConCodigo = tareas.filter(t => 
        t.course && (t.course.includes('9077a79d') || JSON.stringify(t).includes('9077a79d'))
    );
    
    if (tareasConCodigo.length > 0) {
        tareasConCodigo.forEach(tarea => {
            console.log(`  📚 "${tarea.title}"`);
            console.log(`     course: ${tarea.course}`);
            console.log(`     assignedTo: ${tarea.assignedTo}`);
            console.log(`     subject: ${tarea.subject}`);
            console.log('     ---');
        });
    } else {
        console.log('  ❌ No hay tareas con el código 9077a79d');
    }
    
    console.log('\n🔍 BÚSQUEDA GENERAL DEL CÓDIGO 9077a79d:');
    
    // Buscar en todas las estructuras
    const enUsuarios = usuarios.filter(u => JSON.stringify(u).includes('9077a79d'));
    const enAsignaciones = asignaciones.filter(a => JSON.stringify(a).includes('9077a79d'));
    const enTareas = tareas.filter(t => JSON.stringify(t).includes('9077a79d'));
    
    console.log(`  👥 En usuarios: ${enUsuarios.length} coincidencias`);
    enUsuarios.forEach(u => console.log(`     ${u.username}: ${JSON.stringify(u.activeCourses)}`));
    
    console.log(`  📋 En asignaciones: ${enAsignaciones.length} coincidencias`);
    enAsignaciones.forEach(a => console.log(`     ${a.studentId}: ${a.courseId}-${a.sectionId}`));
    
    console.log(`  📝 En tareas: ${enTareas.length} coincidencias`);
    enTareas.forEach(t => console.log(`     "${t.title}": ${t.course}`));
    
    return { usuarios, asignaciones, tareas, tareasConCodigo };
}

function identificarFormatoCursoSeccion() {
    console.log('\n🎯 === IDENTIFICANDO FORMATO CURSO-SECCIÓN ===');
    
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    // Analizar patrones en asignaciones
    console.log('\n📋 PATRONES EN ASIGNACIONES:');
    const patrones = new Set();
    asignaciones.forEach(a => {
        if (a.courseId && a.sectionId) {
            const patron = `${a.courseId}-${a.sectionId}`;
            patrones.add(patron);
            console.log(`  🎯 ${patron} (estudiante: ${a.studentId})`);
        }
    });
    
    // Analizar patrones en tareas
    console.log('\n📝 PATRONES EN TAREAS:');
    tareas.forEach(t => {
        if (t.course) {
            console.log(`  📚 "${t.title}": course="${t.course}"`);
            
            // Verificar si es formato compuesto
            if (t.course.includes('-')) {
                const partes = t.course.split('-');
                console.log(`     → Posible courseId: ${partes[0]}, sectionId: ${partes[1]}`);
            }
        }
    });
    
    return Array.from(patrones);
}

function propuestaCorreccion() {
    console.log('\n🔧 === PROPUESTA DE CORRECCIÓN ===');
    
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    
    // Buscar tarea problemática
    const tareaProblematica = tareas.find(t => 
        t.course && t.course.includes('9077a79d') && t.assignedTo === 'course'
    );
    
    if (tareaProblematica) {
        console.log(`📚 Tarea encontrada: "${tareaProblematica.title}"`);
        console.log(`   course: ${tareaProblematica.course}`);
        
        // Analizar formato
        if (tareaProblematica.course.includes('-')) {
            const [courseId, sectionId] = tareaProblematica.course.split('-');
            console.log(`   → courseId: ${courseId}`);
            console.log(`   → sectionId: ${sectionId}`);
            
            // Buscar estudiantes en esta combinación
            const estudiantesEnSeccion = asignaciones.filter(a => 
                a.courseId === courseId && a.sectionId === sectionId
            );
            
            console.log(`\n👥 Estudiantes en esta sección: ${estudiantesEnSeccion.length}`);
            estudiantesEnSeccion.forEach(a => {
                console.log(`   ✅ ${a.studentId}`);
            });
            
            console.log('\n💡 FUNCIÓN CORREGIDA SUGERIDA:');
            console.log(`
function getStudentsFromCourseRelevantToTask(selectedTask) {
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    
    if (!selectedTask || !selectedTask.course) return [];
    
    // Parsear courseId y sectionId del formato "courseId-sectionId"
    const [courseId, sectionId] = selectedTask.course.split('-');
    
    if (!courseId || !sectionId) return [];
    
    // Filtrar por asignaciones exactas
    const estudiantesAsignados = asignaciones.filter(assignment => 
        assignment.courseId === courseId && assignment.sectionId === sectionId
    );
    
    // Obtener usuarios completos
    return usuarios.filter(user => 
        user.role === 'student' && 
        estudiantesAsignados.some(a => a.studentId === user.id)
    );
}
            `);
        } else {
            console.log('❌ El formato del curso no es courseId-sectionId');
        }
    } else {
        console.log('❌ No se encontró tarea con el código 9077a79d');
    }
}

// Ejecutar análisis completo
const datos = analizarEstructuraCursoSeccion();
const patrones = identificarFormatoCursoSeccion();
propuestaCorreccion();

// Hacer funciones disponibles globalmente
window.analizarEstructuraCursoSeccion = analizarEstructuraCursoSeccion;
window.identificarFormatoCursoSeccion = identificarFormatoCursoSeccion;
window.propuestaCorreccion = propuestaCorreccion;
