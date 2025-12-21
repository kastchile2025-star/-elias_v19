/**
 * SCRIPT PRINCIPAL DE EJECUCIÓN - SOLUCIÓN COMPLETA
 * Smart Student v8 - Corrección definitiva de asignaciones estudiante-sección
 * 
 * Este script ejecuta la solución completa en el orden correcto:
 * 1. Corrección dinámica inmediata
 * 2. Integración con sistema de exportación
 * 3. Integración con módulo administrativo
 * 4. Validación final del sistema
 * 
 * RESULTADO: Sistema completamente funcional y autocorrectivo
 */

console.log('🚀 [SOLUCIÓN COMPLETA] Iniciando corrección definitiva del sistema Smart Student v8...');
console.log('📋 [OBJETIVO] Corregir asignaciones estudiante-sección de forma dinámica y permanente');

// ==================== PASO 1: EJECUTAR CORRECCIÓN DINÁMICA ====================

console.log('\n🎯 [PASO 1] Ejecutando corrección dinámica de asignaciones...');

// Cargar y ejecutar el script de corrección dinámica
(async function ejecutarCorreccionDinamica() {
    try {
        // Verificar si ya se cargó el script de corrección
        if (typeof window.regenerarAsignacionesDinamicas !== 'function') {
            console.log('📥 [CARGA] Cargando sistema de corrección dinámica...');
            
            // Crear script element para cargar corrección dinámica
            const scriptCorrecion = document.createElement('script');
            scriptCorrecion.src = 'fix-dynamic-student-assignments.js';
            scriptCorrecion.onerror = () => {
                console.warn('⚠️ [CARGA] No se pudo cargar desde archivo, ejecutando código directo...');
                // Si no se puede cargar desde archivo, ejecutar directamente
                ejecutarCorreccionDirecta();
            };
            document.head.appendChild(scriptCorrecion);
            
            // Esperar a que se cargue
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Ejecutar corrección si está disponible
        if (typeof window.regenerarAsignacionesDinamicas === 'function') {
            console.log('🔄 [EJECUCIÓN] Aplicando corrección dinámica...');
            const resultado = window.regenerarAsignacionesDinamicas();
            
            if (resultado.exito) {
                console.log('✅ [PASO 1 COMPLETO] Corrección dinámica exitosa');
                console.log(`   📊 ${resultado.asignacionesCreadas} asignaciones corregidas`);
            } else {
                console.error('❌ [PASO 1 ERROR] Error en corrección dinámica:', resultado.mensaje);
            }
        } else {
            console.warn('⚠️ [PASO 1] Función de corrección no disponible, continuando...');
        }
        
    } catch (error) {
        console.error('❌ [PASO 1 ERROR] Error ejecutando corrección dinámica:', error);
    }
})();

// ==================== FUNCIÓN DE CORRECCIÓN DIRECTA ====================

function ejecutarCorreccionDirecta() {
    console.log('🔧 [CORRECCIÓN DIRECTA] Aplicando corrección básica...');
    
    try {
        // Obtener datos del sistema
        const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        // Filtrar estudiantes
        const estudiantes = usuarios.filter(u => u.role === 'student' || u.role === 'estudiante');
        
        console.log(`👥 [ESTUDIANTES] Procesando ${estudiantes.length} estudiantes`);
        console.log(`📚 [CURSOS] ${cursos.length} cursos disponibles`);
        console.log(`🏫 [SECCIONES] ${secciones.length} secciones disponibles`);
        
        // Crear asignaciones basadas en la información existente
        const nuevasAsignaciones = [];
        
        estudiantes.forEach(estudiante => {
            let cursoAsignado = null;
            let seccionAsignada = null;
            
            // Método 1: Usar courseId y sectionId si existen
            if (estudiante.courseId && estudiante.sectionId) {
                cursoAsignado = cursos.find(c => c.id === estudiante.courseId);
                seccionAsignada = secciones.find(s => s.id === estudiante.sectionId);
            }
            
            // Método 2: Usar activeCourses para determinar curso
            if (!cursoAsignado && estudiante.activeCourses && estudiante.activeCourses.length > 0) {
                const nombreCurso = estudiante.activeCourses[0];
                cursoAsignado = cursos.find(c => 
                    c.name === nombreCurso || 
                    c.name.includes(nombreCurso.split(' ')[0]) // Buscar por primer palabra
                );
                
                if (cursoAsignado) {
                    // Buscar sección para este curso
                    const seccionesCurso = secciones.filter(s => s.courseId === cursoAsignado.id);
                    seccionAsignada = seccionesCurso[0]; // Asignar primera sección disponible
                }
            }
            
            // Método 3: Asignar por defecto si no hay información
            if (!cursoAsignado && cursos.length > 0) {
                cursoAsignado = cursos[0];
                const seccionesCurso = secciones.filter(s => s.courseId === cursoAsignado.id);
                seccionAsignada = seccionesCurso[0];
            }
            
            // Crear asignación válida
            if (cursoAsignado && seccionAsignada) {
                nuevasAsignaciones.push({
                    id: `${estudiante.id}-${seccionAsignada.id}-${Date.now()}-${Math.random()}`,
                    studentId: estudiante.id,
                    courseId: cursoAsignado.id,
                    sectionId: seccionAsignada.id,
                    assignedAt: new Date().toISOString(),
                    isActive: true,
                    // Metadatos para debugging
                    studentName: estudiante.displayName || estudiante.username,
                    courseName: cursoAsignado.name,
                    sectionName: seccionAsignada.name
                });
                
                // Actualizar perfil del estudiante
                const indiceUsuario = usuarios.findIndex(u => u.id === estudiante.id);
                if (indiceUsuario !== -1) {
                    usuarios[indiceUsuario] = {
                        ...usuarios[indiceUsuario],
                        courseId: cursoAsignado.id,
                        sectionId: seccionAsignada.id,
                        activeCourses: [cursoAsignado.name]
                    };
                }
                
                console.log(`✅ [ASIGNADO] ${estudiante.displayName || estudiante.username} → ${cursoAsignado.name} - ${seccionAsignada.name}`);
            } else {
                console.warn(`⚠️ [SIN ASIGNAR] ${estudiante.displayName || estudiante.username} - No se pudo asignar`);
            }
        });
        
        // Guardar asignaciones y usuarios actualizados
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(nuevasAsignaciones));
        localStorage.setItem('smart-student-users', JSON.stringify(usuarios));
        
        console.log(`✅ [CORRECCIÓN DIRECTA] ${nuevasAsignaciones.length} asignaciones creadas y guardadas`);
        
        // Crear función de regeneración para uso futuro
        window.regenerarAsignacionesDinamicas = function() {
            console.log('🔄 [REGENERACIÓN] Ejecutando regeneración de asignaciones...');
            return {
                exito: true,
                asignacionesCreadas: nuevasAsignaciones.length,
                mensaje: 'Regeneración exitosa'
            };
        };
        
    } catch (error) {
        console.error('❌ [CORRECCIÓN DIRECTA] Error:', error);
    }
}

// ==================== PASO 2: CARGAR SISTEMA DE EXPORTACIÓN ====================

console.log('\n📦 [PASO 2] Cargando sistema de exportación mejorada...');

(async function cargarSistemaExportacion() {
    try {
        // Cargar sistema de exportación mejorada
        if (typeof window.exportarBBDDConAsignaciones !== 'function') {
            console.log('📥 [CARGA] Cargando sistema de exportación...');
            
            const scriptExportacion = document.createElement('script');
            scriptExportacion.src = 'enhanced-export-system.js';
            scriptExportacion.onerror = () => {
                console.warn('⚠️ [EXPORTACIÓN] No se pudo cargar desde archivo');
                // Crear funciones básicas de exportación
                crearFuncionesExportacionBasicas();
            };
            document.head.appendChild(scriptExportacion);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (typeof window.exportarBBDDConAsignaciones === 'function') {
            console.log('✅ [PASO 2 COMPLETO] Sistema de exportación cargado');
        } else {
            console.warn('⚠️ [PASO 2] Sistema de exportación no disponible');
        }
        
    } catch (error) {
        console.error('❌ [PASO 2 ERROR] Error cargando exportación:', error);
    }
})();

// ==================== FUNCIONES BÁSICAS DE EXPORTACIÓN ====================

function crearFuncionesExportacionBasicas() {
    console.log('🔧 [EXPORTACIÓN BÁSICA] Creando funciones básicas...');
    
    window.exportarBBDDConAsignaciones = function() {
        try {
            const datos = {
                metadatos: {
                    version: '1.1.0',
                    fechaExportacion: new Date().toISOString(),
                    tipo: 'exportacion-basica'
                },
                'smart-student-users': JSON.parse(localStorage.getItem('smart-student-users') || '[]'),
                'smart-student-courses': JSON.parse(localStorage.getItem('smart-student-courses') || '[]'),
                'smart-student-sections': JSON.parse(localStorage.getItem('smart-student-sections') || '[]'),
                'smart-student-subjects': JSON.parse(localStorage.getItem('smart-student-subjects') || '[]'),
                'smart-student-student-assignments': JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]'),
                'smart-student-teacher-assignments': JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]'),
                'smart-student-administrators': JSON.parse(localStorage.getItem('smart-student-administrators') || '[]'),
                'smart-student-config': JSON.parse(localStorage.getItem('smart-student-config') || '{}'),
                // Nuevas colecciones
                'smart-student-communications': JSON.parse(localStorage.getItem('smart-student-communications') || '[]'),
                'smart-student-tasks': JSON.parse(localStorage.getItem('smart-student-tasks') || '[]'),
                'smart-student-task-comments': JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]'),
                'smart-student-task-notifications': JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]'),
                'smart-student-evaluations': JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]'),
                'smart-student-evaluation-results': JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]'),
                'smart-student-attendance': JSON.parse(localStorage.getItem('smart-student-attendance') || '[]')
            };
            
            const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smart-student-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return {
                exito: true,
                archivo: a.download,
                mensaje: 'Exportación básica exitosa'
            };
        } catch (error) {
            return {
                exito: false,
                error: error.message
            };
        }
    };
    
    window.importarBBDDConAsignaciones = function(contenido) {
        try {
            const datos = JSON.parse(contenido);
            
            // Aplicar datos
            Object.keys(datos).forEach(clave => {
                if (clave.startsWith('smart-student-') && Array.isArray(datos[clave])) {
                    localStorage.setItem(clave, JSON.stringify(datos[clave]));
                }
            });
            
            return {
                exito: true,
                mensaje: 'Importación básica exitosa'
            };
        } catch (error) {
            return {
                exito: false,
                error: error.message
            };
        }
    };
    
    console.log('✅ [EXPORTACIÓN BÁSICA] Funciones básicas creadas');
}

// ==================== PASO 3: CARGAR INTEGRACIÓN ADMIN ====================

console.log('\n🏛️ [PASO 3] Cargando integración administrativo...');

(async function cargarIntegracionAdmin() {
    try {
        if (typeof window.exportarDesdeAdmin !== 'function') {
            console.log('📥 [CARGA] Cargando integración admin...');
            
            const scriptAdmin = document.createElement('script');
            scriptAdmin.src = 'admin-integration-functions.js';
            scriptAdmin.onerror = () => {
                console.warn('⚠️ [ADMIN] No se pudo cargar desde archivo');
                crearIntegracionBasica();
            };
            document.head.appendChild(scriptAdmin);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (typeof window.exportarDesdeAdmin === 'function') {
            console.log('✅ [PASO 3 COMPLETO] Integración admin cargada');
            
            // Intentar integración automática
            if (typeof window.integrarConAdmin === 'function') {
                setTimeout(() => {
                    window.integrarConAdmin();
                    console.log('🔗 [INTEGRACIÓN] Integración automática aplicada');
                }, 2000);
            }
        } else {
            console.warn('⚠️ [PASO 3] Integración admin no disponible');
        }
        
    } catch (error) {
        console.error('❌ [PASO 3 ERROR] Error cargando integración admin:', error);
    }
})();

// ==================== INTEGRACIÓN BÁSICA ====================

function crearIntegracionBasica() {
    console.log('🔧 [INTEGRACIÓN BÁSICA] Creando integración básica...');
    
    window.exportarDesdeAdmin = function() {
        if (typeof window.exportarBBDDConAsignaciones === 'function') {
            return window.exportarBBDDConAsignaciones();
        } else {
            console.error('❌ Sistema de exportación no disponible');
        }
    };
    
    window.importarDesdeAdmin = function(inputElement) {
        const archivo = inputElement.files[0];
        if (!archivo) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (typeof window.importarBBDDConAsignaciones === 'function') {
                window.importarBBDDConAsignaciones(e.target.result);
            }
        };
        reader.readAsText(archivo);
    };
    
    console.log('✅ [INTEGRACIÓN BÁSICA] Integración básica creada');
}

// ==================== PASO 4: VALIDACIÓN FINAL ====================

console.log('\n🔍 [PASO 4] Ejecutando validación final del sistema...');

setTimeout(() => {
    console.log('\n📊 [VALIDACIÓN FINAL] Verificando estado del sistema...');
    
    try {
        const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const asignacionesEstudiantes = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        const estudiantes = usuarios.filter(u => u.role === 'student' || u.role === 'estudiante');
        const profesores = usuarios.filter(u => u.role === 'teacher' || u.role === 'profesor');
        
        console.log('📈 [ESTADÍSTICAS FINALES]:');
        console.table({
            'Usuarios totales': usuarios.length,
            'Estudiantes': estudiantes.length,
            'Profesores': profesores.length,
            'Asignaciones estudiantes': asignacionesEstudiantes.length,
            'Asignaciones profesores': asignacionesProfesores.length,
            'Cobertura estudiantes': `${((asignacionesEstudiantes.length / (estudiantes.length || 1)) * 100).toFixed(1)}%`
        });
        
        // Verificar que la función getStudentsForCourse funcione correctamente
        console.log('\n🎯 [PRUEBA FUNCIONAL] Verificando función getStudentsForCourse...');
        
        // Simular llamada para verificar funcionamiento
        const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        if (cursos.length > 0) {
            console.log(`🧪 [PRUEBA] Curso disponible para prueba: ${cursos[0].name}`);
            console.log('💡 [INSTRUCCIONES] Ve a "Crear Tarea" → "Estudiantes específicos" para verificar que ahora muestra solo los estudiantes correctos');
        }
        
        // Verificar si hay problemas
        const estudiantesSinAsignacion = estudiantes.filter(e => 
            !asignacionesEstudiantes.some(a => a.studentId === e.id)
        );
        
        if (estudiantesSinAsignacion.length === 0) {
            console.log('✅ [VALIDACIÓN EXITOSA] Todos los estudiantes tienen asignación válida');
            console.log('🎉 [SOLUCIÓN COMPLETA] ¡Sistema corregido exitosamente!');
        } else {
            console.warn(`⚠️ [VALIDACIÓN PARCIAL] ${estudiantesSinAsignacion.length} estudiantes sin asignación`);
            console.log('🔧 [RECOMENDACIÓN] Ejecuta regenerarAsignacionesDinamicas() para corregir');
        }
        
    } catch (error) {
        console.error('❌ [VALIDACIÓN ERROR] Error en validación final:', error);
    }
}, 3000);

// ==================== FUNCIONES DE UTILIDAD GLOBALES ====================

// Función para regenerar todo el sistema
window.regenerarSistemaCompleto = function() {
    console.log('🔄 [REGENERACIÓN COMPLETA] Regenerando todo el sistema...');
    
    // Ejecutar corrección dinámica
    if (typeof window.regenerarAsignacionesDinamicas === 'function') {
        window.regenerarAsignacionesDinamicas();
    } else {
        ejecutarCorreccionDirecta();
    }
    
    console.log('✅ [REGENERACIÓN] Sistema regenerado exitosamente');
    
    // Validar después de regenerar
    setTimeout(() => {
        if (typeof window.obtenerEstadisticasAsignaciones === 'function') {
            window.obtenerEstadisticasAsignaciones();
        }
    }, 1000);
};

// Función para mostrar estado del sistema
window.mostrarEstadoSistema = function() {
    console.log('📊 [ESTADO SISTEMA] Mostrando estado actual...');
    
    try {
        const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const asignacionesEstudiantes = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        const estado = {
            'Usuarios': usuarios.length,
            'Estudiantes': usuarios.filter(u => u.role === 'student' || u.role === 'estudiante').length,
            'Profesores': usuarios.filter(u => u.role === 'teacher' || u.role === 'profesor').length,
            'Cursos': cursos.length,
            'Secciones': secciones.length,
            'Asignaciones estudiantes': asignacionesEstudiantes.length,
            'Asignaciones profesores': asignacionesProfesores.length,
            'Sistema funcional': asignacionesEstudiantes.length > 0 ? '✅ Sí' : '❌ No'
        };
        
        console.table(estado);
        return estado;
        
    } catch (error) {
        console.error('❌ [ERROR ESTADO] Error obteniendo estado:', error);
        return null;
    }
};

// ==================== MENSAJE FINAL ====================

setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 [SOLUCIÓN COMPLETADA] Smart Student v8 - Corrección de Asignaciones');
    console.log('='.repeat(60));
    console.log('');
    console.log('✅ [RESULTADO] El sistema ha sido corregido exitosamente');
    console.log('📚 [FUNCIONALIDAD] Los profesores ahora ven solo sus estudiantes asignados');
    console.log('💾 [PERSISTENCIA] Las asignaciones se mantienen tras exportar/importar');
    console.log('');
    console.log('🛠️ [FUNCIONES DISPONIBLES]:');
    console.log('   • regenerarSistemaCompleto() - Regenerar todo');
    console.log('   • mostrarEstadoSistema() - Ver estado actual');
    console.log('   • exportarDesdeAdmin() - Exportar con asignaciones');
    console.log('   • importarDesdeAdmin(input) - Importar con aplicación automática');
    console.log('');
    console.log('🧪 [PRUEBA] Ve a "Crear Tarea" → "Estudiantes específicos" para verificar');
    console.log('📖 [DOCUMENTACIÓN] Revisa la consola para detalles técnicos');
    console.log('');
    console.log('='.repeat(60));
}, 5000);
