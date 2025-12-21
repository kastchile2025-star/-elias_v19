/**
 * 💾 COMPONENTE: BOTÓN GUARDAR EN GESTIÓN DE USUARIOS
 * 
 * Este script añade un botón "Guardar Cambios" en la interfaz de
 * Gestión de Usuarios para sincronizar con Datos Académicos.
 */

console.log('💾 CREANDO BOTÓN GUARDAR EN GESTIÓN DE USUARIOS...');
console.log('================================================');

// Función para crear el botón de guardar
function crearBotonGuardar() {
    try {
        console.log('🔧 Creando botón de guardar...');
        
        // Buscar el contenedor de gestión de usuarios
        const userManagementContainer = document.querySelector('[data-testid="user-management"]') || 
                                      document.querySelector('.user-management') ||
                                      document.querySelector('#user-management') ||
                                      document.body;

        // Verificar si ya existe el botón
        if (document.getElementById('save-user-changes-btn')) {
            console.log('✅ Botón ya existe');
            return;
        }

        // Crear el botón
        const saveButton = document.createElement('button');
        saveButton.id = 'save-user-changes-btn';
        saveButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                <path d="M19 21H5C3.89 21 3 20.11 3 19V5C3 3.89 3.89 3 5 3H16L21 8V19C21 20.11 20.11 21 19 21Z" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            💾 Guardar Cambios en Perfiles
        `;
        
        // Estilos del botón
        Object.assign(saveButton.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        // Efectos hover
        saveButton.addEventListener('mouseenter', () => {
            saveButton.style.backgroundColor = '#059669';
            saveButton.style.transform = 'translateY(-2px)';
            saveButton.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
        });

        saveButton.addEventListener('mouseleave', () => {
            saveButton.style.backgroundColor = '#10b981';
            saveButton.style.transform = 'translateY(0px)';
            saveButton.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
        });

        // Función al hacer click
        saveButton.addEventListener('click', async () => {
            console.log('💾 Botón Guardar presionado...');
            await guardarCambiosGestion();
        });

        // Añadir al DOM
        document.body.appendChild(saveButton);
        
        console.log('✅ Botón de guardar creado exitosamente');
        
        // Mostrar notificación
        mostrarNotificacion('✅ Botón "Guardar Cambios" añadido. Úsalo después de modificar estudiantes.', 'success');

    } catch (error) {
        console.error('❌ Error creando botón:', error);
    }
}

// Función principal para guardar cambios
async function guardarCambiosGestion() {
    try {
        // Cambiar estado del botón
        const button = document.getElementById('save-user-changes-btn');
        const originalText = button.innerHTML;
        
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
            </svg>
            🔄 Guardando cambios...
        `;
        button.disabled = true;

        console.log('💾 GUARDANDO CAMBIOS EN GESTIÓN DE USUARIOS...');
        console.log('==============================================');

        // Leer datos actuales de gestión
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 Datos leídos:');
        console.log(`   Usuarios: ${users.length}`);
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);
        console.log(`   Asignaciones: ${assignments.length}`);

        // Detectar cambios necesarios basados en gestión actual
        console.log('\n🔍 Detectando cambios desde interfaz...');
        
        let cambiosAplicados = 0;
        const students = users.filter(u => u.role === 'student');
        
        // Procesar cada estudiante
        for (const student of students) {
            console.log(`\n👤 Procesando: ${student.username}`);
            
            const assignment = assignments.find(a => a.studentId === student.id);
            
            if (assignment) {
                const course = courses.find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                
                if (course && section) {
                    const expectedProfile = `${course.name} - Sección ${section.name}`;
                    const currentProfile = student.activeCourses?.[0] || 'Sin curso';
                    
                    console.log(`   📋 Gestión: ${expectedProfile}`);
                    console.log(`   👤 Perfil: ${currentProfile}`);
                    
                    if (currentProfile !== expectedProfile) {
                        // Actualizar perfil
                        student.activeCourses = [expectedProfile];
                        cambiosAplicados++;
                        console.log(`   ✅ ACTUALIZADO: "${currentProfile}" → "${expectedProfile}"`);
                    } else {
                        console.log(`   ✅ Ya sincronizado`);
                    }
                } else {
                    console.log(`   ⚠️ Datos incompletos`);
                }
            } else {
                console.log(`   ❌ Sin asignación`);
            }
        }

        // Guardar cambios
        if (cambiosAplicados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            
            console.log(`\n🎉 CAMBIOS GUARDADOS:`);
            console.log(`====================`);
            console.log(`✅ Perfiles actualizados: ${cambiosAplicados}`);
            
            // Disparar eventos
            window.dispatchEvent(new CustomEvent('userManagementSaved', {
                detail: { updatedCount: cambiosAplicados, timestamp: new Date().toISOString() }
            }));
            
            window.dispatchEvent(new CustomEvent('storage', {
                detail: { key: 'smart-student-users', source: 'user-management' }
            }));

            mostrarNotificacion(`✅ ${cambiosAplicados} perfil(es) actualizado(s) exitosamente`, 'success');
            
            // Opcional: recargar página si estamos en perfil
            if (window.location.pathname.includes('/perfil')) {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            
        } else {
            console.log('\n✅ No se necesitaron cambios');
            mostrarNotificacion('✅ Todos los perfiles ya estaban sincronizados', 'info');
        }

        // Restaurar botón
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);

        return cambiosAplicados;

    } catch (error) {
        console.error('❌ Error guardando cambios:', error);
        
        // Restaurar botón en caso de error
        const button = document.getElementById('save-user-changes-btn');
        if (button) {
            button.innerHTML = `💾 Guardar Cambios en Perfiles`;
            button.disabled = false;
        }
        
        mostrarNotificacion('❌ Error al guardar cambios. Revisa la consola.', 'error');
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    try {
        // Crear notificación
        const notification = document.createElement('div');
        notification.innerHTML = mensaje;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444', 
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: '10000',
            backgroundColor: colors[tipo] || colors.info,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out'
        });

        // Añadir animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);

    } catch (error) {
        console.error('❌ Error mostrando notificación:', error);
    }
}

// Función para detectar si estamos en gestión de usuarios
function detectarGestionUsuarios() {
    // Detectar por URL, texto, o elementos específicos
    const isUserManagement = 
        window.location.pathname.includes('admin') ||
        window.location.pathname.includes('usuarios') ||
        window.location.pathname.includes('management') ||
        document.querySelector('[data-testid="user-management"]') ||
        document.querySelector('.user-management') ||
        document.body.textContent.includes('Gestión de Usuarios') ||
        document.body.textContent.includes('User Management');
    
    return isUserManagement;
}

// ===============================
// 🚀 EJECUTAR AUTOMÁTICAMENTE
// ===============================

console.log('🚀 INICIANDO SISTEMA DE BOTÓN GUARDAR...');

// Esperar a que la página cargue completamente
function inicializar() {
    if (detectarGestionUsuarios()) {
        console.log('✅ Gestión de Usuarios detectada');
        crearBotonGuardar();
    } else {
        console.log('ℹ️ No estamos en Gestión de Usuarios - Botón no necesario aquí');
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

// También ejecutar si la página cambia (para SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(inicializar, 1000);
    }
}).observe(document, { subtree: true, childList: true });

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('- crearBotonGuardar() - Crear botón manualmente');
console.log('- guardarCambiosGestion() - Ejecutar guardado directo');

console.log('\n🎯 RESULTADO:');
console.log('=============');
console.log('✅ Sistema de botón guardar activado');
console.log('💾 Busca el botón "Guardar Cambios" en la esquina superior derecha');
console.log('📝 Úsalo después de hacer cambios en Gestión de Usuarios');
