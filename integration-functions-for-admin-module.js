/**
 * INTEGRACIÓN EN MÓDULO DE CONFIGURACIONES
 * Agregar estas funciones al módulo admin para exportación/importación automática
 */

// FUNCIÓN PARA EXPORTAR (agregar al botón de exportar en configuraciones)
function exportarBBDDConAsignaciones() {
    console.log('📤 EXPORTANDO BBDD CON ASIGNACIONES...');
    
    // Crear exportación completa
    const exportacionCompleta = window.smartStudentAssignments?.crearExportacionCompleta() || crearExportacionCompleta();
    
    // Convertir a JSON
    const dataStr = JSON.stringify(exportacionCompleta, null, 2);
    
    // Crear archivo para descarga
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-student-complete-${new Date().toISOString().split('T')[0]}.json`;
    
    // Ejecutar descarga
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Exportación completa descargada');
    console.log('   • Incluye configuración de asignaciones dinámicas');
    console.log('   • Compatible con importación automática');
}

// FUNCIÓN PARA IMPORTAR (agregar al input de importar en configuraciones)
function importarBBDDConAsignaciones(file) {
    console.log('📥 IMPORTANDO BBDD CON ASIGNACIONES...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datosImportados = JSON.parse(e.target.result);
            
            console.log('✅ Archivo JSON válido cargado');
            
            // Guardar datos base
            if (datosImportados.users) {
                localStorage.setItem('smart-student-users', JSON.stringify(datosImportados.users));
                console.log('✅ Usuarios importados');
            }
            
            if (datosImportados.courses) {
                localStorage.setItem('smart-student-courses', JSON.stringify(datosImportados.courses));
                console.log('✅ Cursos importados');
            }
            
            if (datosImportados.sections) {
                localStorage.setItem('smart-student-sections', JSON.stringify(datosImportados.sections));
                console.log('✅ Secciones importadas');
            }
            
            if (datosImportados.teacherAssignments) {
                localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(datosImportados.teacherAssignments));
                console.log('✅ Asignaciones de profesores importadas');
            }
            
            // APLICAR CONFIGURACIÓN DE ASIGNACIONES AUTOMÁTICAMENTE
            if (window.smartStudentAssignments) {
                window.smartStudentAssignments.aplicarConfiguracionDesdeBBDD(datosImportados);
                console.log('✅ Configuración de asignaciones aplicada automáticamente');
                
                // Validar que todo quedó correcto
                setTimeout(() => {
                    const estadoValido = window.smartStudentAssignments.validarYCorregirAsignaciones();
                    if (estadoValido) {
                        console.log('🎉 IMPORTACIÓN COMPLETADA EXITOSAMENTE');
                        console.log('✅ Todas las asignaciones están correctas');
                        console.log('✅ Sistema listo para usar sin problemas');
                        
                        // Mostrar notificación de éxito
                        alert('✅ Importación completada exitosamente\n\nTodas las asignaciones se aplicaron automáticamente.\nEl sistema está listo para usar.');
                    }
                }, 1000);
                
            } else {
                console.log('⚠️ Sistema de asignaciones no disponible');
                console.log('   Ejecuta enhanced-database-export-with-assignments.js primero');
            }
            
        } catch (error) {
            console.error('❌ Error al importar:', error);
            alert('❌ Error al importar el archivo\n\nVerifica que sea un archivo JSON válido.');
        }
    };
    
    reader.readAsText(file);
}

// FUNCIÓN DE VALIDACIÓN MANUAL (botón adicional en configuraciones)
function validarAsignacionesManualmente() {
    console.log('🔍 VALIDACIÓN MANUAL DE ASIGNACIONES...');
    
    if (window.smartStudentAssignments) {
        const estadoValido = window.smartStudentAssignments.validarYCorregirAsignaciones();
        
        if (estadoValido) {
            alert('✅ Validación completada\n\nTodas las asignaciones están correctas.');
        } else {
            alert('🔧 Problemas detectados y corregidos\n\nLas asignaciones se han reparado automáticamente.');
        }
    } else {
        alert('❌ Sistema de validación no disponible\n\nEjecuta el script enhanced-database-export-with-assignments.js primero.');
    }
}

console.log('🔧 FUNCIONES DE INTEGRACIÓN LISTAS:');
console.log('✅ exportarBBDDConAsignaciones() - Para botón exportar');
console.log('✅ importarBBDDConAsignaciones(file) - Para input importar');
console.log('✅ validarAsignacionesManualmente() - Para validación manual');
