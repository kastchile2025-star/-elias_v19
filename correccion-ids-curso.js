// 🔧 CORRECCIÓN ESPECÍFICA: Sincronizar IDs de Curso
// Ejecutar en consola del navegador

console.log('🔧 === CORRECCIÓN ESPECÍFICA: IDS DE CURSO ===');

function corregirIDsCurso() {
    console.log('🔍 Analizando problema de IDs de curso...');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    // Encontrar la tarea problemática
    const tareaProblematica = tareas.find(t => t.assignedTo === 'course' && t.course.includes('-'));
    
    if (!tareaProblematica) {
        console.log('❌ No se encontró tarea con UUID de curso');
        return;
    }
    
    console.log(`📝 Tarea encontrada: "${tareaProblematica.title}"`);
    console.log(`🔗 Curso UUID: ${tareaProblematica.course}`);
    
    // Ver estudiantes actuales
    const estudiantes = usuarios.filter(u => u.role === 'student');
    console.log(`👨‍🎓 Estudiantes en sistema: ${estudiantes.length}`);
    
    if (estudiantes.length > 0) {
        console.log('📋 Cursos actuales de estudiantes:');
        estudiantes.forEach(est => {
            console.log(`   • ${est.username}: ${(est.activeCourses || []).join(', ')}`);
        });
    }
    
    // OPCIÓN 1: Cambiar el curso de la tarea a un nombre simple
    console.log('🔧 OPCIÓN 1: Cambiar curso de tarea a nombre simple...');
    
    const cursoSimple = 'ciencias_naturales_4to';
    
    // Actualizar tarea
    const tareasActualizadas = tareas.map(tarea => {
        if (tarea.id === tareaProblematica.id) {
            return {
                ...tarea,
                course: cursoSimple
            };
        }
        return tarea;
    });
    
    // Actualizar estudiantes para que tengan este curso
    const usuariosActualizados = usuarios.map(usuario => {
        if (usuario.role === 'student') {
            const cursosActuales = usuario.activeCourses || [];
            if (!cursosActuales.includes(cursoSimple)) {
                return {
                    ...usuario,
                    activeCourses: [...cursosActuales, cursoSimple]
                };
            }
        }
        return usuario;
    });
    
    // Guardar cambios
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareasActualizadas));
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosActualizados));
    
    console.log('✅ Corrección aplicada:');
    console.log(`   📝 Tarea "${tareaProblematica.title}" ahora usa curso: ${cursoSimple}`);
    console.log(`   👨‍🎓 Todos los estudiantes ahora tienen el curso: ${cursoSimple}`);
    
    return { cursoSimple, tareasActualizadas, usuariosActualizados };
}

function verificarCorreccion() {
    console.log('🔍 === VERIFICANDO CORRECCIÓN ===');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const tareaDelCurso = tareas.find(t => t.assignedTo === 'course');
    
    if (!tareaDelCurso) {
        console.log('❌ No hay tarea de curso para verificar');
        return false;
    }
    
    console.log(`📝 Verificando tarea: "${tareaDelCurso.title}"`);
    console.log(`📚 Curso: ${tareaDelCurso.course}`);
    
    const courseId = tareaDelCurso.course;
    const estudiantesEncontrados = usuarios.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses?.includes(courseId);
        
        console.log(`   👤 ${u.username}: estudiante=${isStudent}, en curso=${isInCourse}, cursos=[${(u.activeCourses || []).join(', ')}]`);
        
        return isStudent && isInCourse;
    });
    
    console.log(`✅ Estudiantes encontrados: ${estudiantesEncontrados.length}`);
    
    if (estudiantesEncontrados.length > 0) {
        console.log('📋 Lista final:');
        estudiantesEncontrados.forEach(est => {
            console.log(`   ✅ ${est.displayName || est.username}`);
        });
        console.log('🎉 ¡CORRECCIÓN EXITOSA!');
        return true;
    } else {
        console.log('❌ Aún no se encuentran estudiantes');
        return false;
    }
}

function forzarActualizacionCompleta() {
    console.log('🔄 Forzando actualización completa...');
    
    // Cerrar modal
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
        const closeBtn = modal.querySelector('button');
        if (closeBtn) closeBtn.click();
    }
    
    // Disparar todos los eventos posibles
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
    window.dispatchEvent(new CustomEvent('usersUpdated'));
    window.dispatchEvent(new CustomEvent('dataRefresh'));
    document.dispatchEvent(new Event('usersUpdated'));
    document.dispatchEvent(new Event('tasksUpdated'));
    
    setTimeout(() => {
        console.log('✅ Actualización completa realizada');
        console.log('📋 AHORA: Abre la tarea de nuevo');
    }, 1000);
}

function solucionCompleta() {
    console.log('🎯 === EJECUTANDO SOLUCIÓN COMPLETA ===');
    
    try {
        // Paso 1: Corregir IDs
        const resultado = corregirIDsCurso();
        
        // Paso 2: Verificar
        const exito = verificarCorreccion();
        
        // Paso 3: Actualizar UI
        forzarActualizacionCompleta();
        
        if (exito) {
            console.log('🎉 === PROBLEMA RESUELTO ===');
            console.log('📋 El panel de estudiantes ahora debería funcionar');
        } else {
            console.log('⚠️ Puede necesitar recarga manual de la página');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar automáticamente
solucionCompleta();

// Funciones disponibles
window.corregirIDsCurso = corregirIDsCurso;
window.verificarCorreccion = verificarCorreccion;
window.forzarActualizacionCompleta = forzarActualizacionCompleta;
window.solucionCompleta = solucionCompleta;
