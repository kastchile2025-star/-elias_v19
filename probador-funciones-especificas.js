/**
 * 🧪 PROBADOR DE FUNCIONES ESPECÍFICAS
 * 
 * Script para probar las funciones críticas del sistema de tareas
 * Completamente dinámico - no usa valores hardcodeados
 */

console.log('🧪 PROBADOR DE FUNCIONES ESPECÍFICAS');
console.log('='.repeat(50));

class ProbadorFunciones {
    constructor() {
        this.datos = this.cargarDatos();
    }

    cargarDatos() {
        return {
            users: JSON.parse(localStorage.getItem('smart-student-users') || '[]'),
            tasks: JSON.parse(localStorage.getItem('smart-student-tasks') || '[]'),
            studentAssignments: JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]'),
            currentUser: JSON.parse(localStorage.getItem('smart-student-current-user') || 'null')
        };
    }

    // 🎯 Probar función isStudentAssignedToTask directamente
    probarIsStudentAssignedToTask() {
        console.log('\n🎯 PROBANDO isStudentAssignedToTask DIRECTAMENTE...');
        
        if (!this.datos.currentUser || this.datos.currentUser.role !== 'student') {
            console.log('⚠️ Necesitas estar logueado como estudiante');
            return;
        }

        const estudiante = this.datos.currentUser;
        const tareasCurso = this.datos.tasks.filter(t => t.assignedTo === 'course');

        console.log(`👤 Probando con: ${estudiante.username}`);
        console.log(`📝 Tareas de curso encontradas: ${tareasCurso.length}`);

        tareasCurso.forEach((tarea, index) => {
            console.log(`\n${index + 1}. Tarea: "${tarea.title}"`);
            console.log(`   🎯 Asignada a: ${tarea.courseSectionId || tarea.course}`);
            
            // Intentar llamar a la función real si está disponible
            if (typeof window.isStudentAssignedToTask === 'function') {
                try {
                    const resultado = window.isStudentAssignedToTask(tarea.id, estudiante.id, estudiante.username);
                    console.log(`   📊 Resultado: ${resultado ? '✅ PUEDE VER' : '❌ NO PUEDE VER'}`);
                } catch (error) {
                    console.log(`   ❌ Error al ejecutar función: ${error.message}`);
                }
            } else {
                console.log('   ⚠️ Función isStudentAssignedToTask no disponible en window');
                console.log('   💡 Para probar, ejecuta en la consola de la página de Tareas:');
                console.log(`      isStudentAssignedToTask("${tarea.id}", "${estudiante.id}", "${estudiante.username}")`);
            }
        });
    }

    // 📊 Probar función getFilteredTasks
    probarGetFilteredTasks() {
        console.log('\n📊 PROBANDO getFilteredTasks...');
        
        if (!this.datos.currentUser) {
            console.log('⚠️ No hay usuario logueado');
            return;
        }

        console.log(`👤 Usuario: ${this.datos.currentUser.username} (${this.datos.currentUser.role})`);

        if (typeof window.getFilteredTasks === 'function') {
            try {
                const tareasVisibles = window.getFilteredTasks();
                console.log(`📝 Tareas visibles: ${tareasVisibles.length}`);
                
                tareasVisibles.forEach((tarea, index) => {
                    console.log(`   ${index + 1}. "${tarea.title}" (${tarea.courseSectionId || tarea.course})`);
                });
            } catch (error) {
                console.log(`❌ Error al ejecutar getFilteredTasks: ${error.message}`);
            }
        } else {
            console.log('⚠️ Función getFilteredTasks no disponible en window');
            console.log('💡 Esta función solo está disponible dentro del componente React');
        }
    }

    // 🔄 Simular cambio de usuario para detectar problemas de useEffect
    simularCambioUsuario() {
        console.log('\n🔄 SIMULANDO CAMBIO DE USUARIO...');
        
        const estudiantes = this.datos.users.filter(u => u.role === 'student' || u.role === 'estudiante');
        
        if (estudiantes.length < 2) {
            console.log('⚠️ Necesitas al menos 2 estudiantes para probar cambios');
            return;
        }

        console.log(`👥 Estudiantes disponibles: ${estudiantes.length}`);
        estudiantes.forEach((est, index) => {
            console.log(`   ${index + 1}. ${est.username} (${est.displayName || est.name})`);
        });

        console.log('\n🧪 SECUENCIA DE PRUEBA:');
        console.log('1. Anota las tareas visibles para el usuario actual');
        console.log('2. Ejecuta: probador.cambiarUsuario("otro_username")');
        console.log('3. Ve a la pestaña Tareas y verifica si cambiaron');
        console.log('4. Si no cambian automáticamente, hay problema en useEffect');
    }

    // 🔄 Cambiar usuario y monitorear
    cambiarUsuario(username) {
        console.log(`\n🔄 CAMBIANDO A USUARIO: ${username}`);
        
        const usuario = this.datos.users.find(u => u.username === username);
        
        if (!usuario) {
            console.log(`❌ Usuario "${username}" no encontrado`);
            return;
        }

        // Guardar estado anterior
        const usuarioAnterior = this.datos.currentUser;
        
        console.log(`📊 ANTES: ${usuarioAnterior?.username || 'Sin usuario'}`);
        console.log(`📊 DESPUÉS: ${usuario.username}`);

        // Cambiar usuario
        localStorage.setItem('smart-student-current-user', JSON.stringify(usuario));
        this.datos.currentUser = usuario;

        console.log('✅ Usuario cambiado en localStorage');
        console.log('💡 AHORA:');
        console.log('   1. Ve a la pestaña "Tareas"');
        console.log('   2. Verifica si las tareas cambiaron automáticamente');
        console.log('   3. Si no cambiaron, recarga la página (problema en useEffect)');
        console.log('   4. Ejecuta probador.verificarTareasActuales() para comparar');

        // Esperar y verificar
        setTimeout(() => {
            this.verificarTareasActuales();
        }, 2000);
    }

    // ✅ Verificar tareas actuales vs esperadas
    verificarTareasActuales() {
        console.log('\n✅ VERIFICANDO TAREAS ACTUALES...');
        
        if (!this.datos.currentUser) {
            console.log('❌ No hay usuario actual');
            return;
        }

        const estudiante = this.datos.currentUser;
        console.log(`👤 Usuario actual: ${estudiante.username}`);

        // Determinar qué tareas debería ver según las asignaciones
        const tareasEsperadas = this.calcularTareasEsperadas(estudiante);
        
        console.log(`📝 Tareas que DEBERÍA ver: ${tareasEsperadas.length}`);
        tareasEsperadas.forEach((tarea, index) => {
            console.log(`   ${index + 1}. "${tarea.title}" (${tarea.courseSectionId || tarea.course})`);
        });

        console.log('\n💡 COMPARA ESTO CON LO QUE VES EN LA INTERFAZ:');
        console.log('   • ¿Aparecen tareas que no están en la lista de arriba?');
        console.log('   • ¿Faltan tareas que deberían aparecer?');
        console.log('   • ¿Las tareas coinciden exactamente?');

        return tareasEsperadas;
    }

    // 🧮 Calcular tareas esperadas para un estudiante
    calcularTareasEsperadas(estudiante) {
        const { tasks, studentAssignments } = this.datos;
        
        // Obtener asignaciones del estudiante
        const asignacionesEstudiante = studentAssignments.filter(a => a.studentId === estudiante.id);
        
        // Obtener tareas de curso
        const tareasCurso = tasks.filter(t => t.assignedTo === 'course');
        
        // Filtrar tareas que el estudiante debería ver
        const tareasEsperadas = tareasCurso.filter(tarea => {
            const cursoTarea = tarea.courseSectionId || tarea.course;
            
            // Verificar si tiene asignación que coincida
            const tieneAsignacion = asignacionesEstudiante.some(asig => {
                const codigoCompleto = `${asig.courseId}-${asig.sectionId}`;
                return codigoCompleto === cursoTarea || 
                       asig.courseId === cursoTarea || 
                       asig.sectionId === cursoTarea;
            });

            // Verificar activeCourses como fallback
            const tieneActiveCourse = estudiante.activeCourses?.includes(cursoTarea);

            return tieneAsignacion || tieneActiveCourse;
        });

        return tareasEsperadas;
    }

    // 🔍 Analizar discrepancias
    analizarDiscrepancias() {
        console.log('\n🔍 ANALIZANDO DISCREPANCIAS...');
        
        if (!this.datos.currentUser || this.datos.currentUser.role !== 'student') {
            console.log('⚠️ Necesitas estar logueado como estudiante');
            return;
        }

        const tareasEsperadas = this.calcularTareasEsperadas(this.datos.currentUser);
        
        console.log('📊 ANÁLISIS COMPARATIVO:');
        console.log(`👤 Usuario: ${this.datos.currentUser.username}`);
        console.log(`📝 Tareas esperadas: ${tareasEsperadas.length}`);
        
        console.log('\n💡 PARA COMPLETAR EL ANÁLISIS:');
        console.log('1. Ve a la pestaña "Tareas" en la interfaz');
        console.log('2. Cuenta cuántas tareas ves realmente');
        console.log('3. Compara con el número esperado de arriba');
        console.log('4. Ejecuta probador.reportarDiscrepancia(numTareasVistas) con el número real');
    }

    // 📝 Reportar discrepancia encontrada
    reportarDiscrepancia(numTareasVistas) {
        const tareasEsperadas = this.calcularTareasEsperadas(this.datos.currentUser);
        const numEsperadas = tareasEsperadas.length;

        console.log('\n📝 REPORTE DE DISCREPANCIA:');
        console.log(`👤 Usuario: ${this.datos.currentUser.username}`);
        console.log(`📊 Tareas esperadas: ${numEsperadas}`);
        console.log(`📊 Tareas vistas: ${numTareasVistas}`);

        if (numTareasVistas === numEsperadas) {
            console.log('✅ ¡PERFECTO! No hay discrepancia');
        } else if (numTareasVistas > numEsperadas) {
            console.log('🚨 PROBLEMA: El estudiante ve MÁS tareas de las que debería');
            console.log('💡 CAUSA PROBABLE: isStudentAssignedToTask permite acceso incorrecto');
            console.log('🔧 SOLUCIÓN: Revisar lógica de coincidencias en isStudentAssignedToTask');
        } else {
            console.log('🚨 PROBLEMA: El estudiante ve MENOS tareas de las que debería');
            console.log('💡 CAUSA PROBABLE: getFilteredTasks o isStudentAssignedToTask demasiado restrictivo');
            console.log('🔧 SOLUCIÓN: Revisar lógica de filtrado');
        }

        return {
            esperadas: numEsperadas,
            vistas: numTareasVistas,
            discrepancia: numTareasVistas - numEsperadas
        };
    }

    // 📋 Mostrar menú de funciones
    mostrarMenu() {
        console.log('\n📋 FUNCIONES DISPONIBLES:');
        console.log('   • probador.probarIsStudentAssignedToTask() - Probar función de asignación');
        console.log('   • probador.probarGetFilteredTasks() - Probar función de filtrado');
        console.log('   • probador.cambiarUsuario("username") - Cambiar usuario y monitorear');
        console.log('   • probador.verificarTareasActuales() - Verificar tareas del usuario actual');
        console.log('   • probador.analizarDiscrepancias() - Analizar diferencias');
        console.log('   • probador.reportarDiscrepancia(num) - Reportar número de tareas vistas');
        console.log('\n💡 FLUJO RECOMENDADO:');
        console.log('1. probador.cambiarUsuario("gustavo")');
        console.log('2. Ve a Tareas y cuenta las que aparecen');
        console.log('3. probador.reportarDiscrepancia(numeroContado)');
    }
}

// 🚀 CREAR INSTANCIA Y MOSTRAR MENÚ
const probador = new ProbadorFunciones();
probador.mostrarMenu();

// Hacer disponible globalmente
window.probador = probador;

console.log('\n🎯 LISTO PARA PROBAR - Usa: probador.mostrarMenu() para ver opciones');
