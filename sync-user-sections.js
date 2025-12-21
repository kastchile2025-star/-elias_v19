/**
 * Herramienta de Sincronización de Secciones de Usuarios
 * 
 * Este script corrige el problema donde los estudiantes no tienen
 * información de sección sincronizada correctamente, causando que
 * el filtrado por sección no funcione en la creación de tareas.
 * 
 * Problema: En "Gestión de Usuarios" se ve la sección correcta,
 * pero en el filtrado de "Estudiantes específicos" aparecen todos.
 * 
 * Solución: Sincronizar datos de sección desde la interfaz visual
 * hacia los datos del sistema de filtrado.
 */

console.log('🔧 [SYNC] Iniciando sincronización de secciones de usuarios...');

// Función principal de sincronización
function syncUserSections() {
    try {
        console.log('📊 [SYNC] Obteniendo usuarios del localStorage...');
        
        // Obtener usuarios actuales
        const usersText = localStorage.getItem('smart-student-users');
        if (!usersText) {
            console.error('❌ [SYNC] No se encontraron usuarios en localStorage');
            return false;
        }
        
        const users = JSON.parse(usersText);
        console.log(`👥 [SYNC] Encontrados ${users.length} usuarios`);
        
        // Mapeo de secciones basado en la información visible en Gestión de Usuarios
        const sectionMapping = {
            'felipe': { courseName: '4to Básico', sectionName: 'A' },
            'maria': { courseName: '4to Básico', sectionName: 'A' },
            'sofia': { courseName: '4to Básico', sectionName: 'B' },
            'karla': { courseName: '4to Básico', sectionName: 'B' },
            'gustavo': { courseName: '5to Básico', sectionName: 'A' },
            'max': { courseName: '6to Básico', sectionName: 'A' }
        };
        
        console.log('🗂️ [SYNC] Mapeo de secciones:', sectionMapping);
        
        let updatedCount = 0;
        
        // Actualizar cada usuario
        users.forEach(user => {
            if (user.role === 'student' && sectionMapping[user.username]) {
                const mapping = sectionMapping[user.username];
                
                console.log(`👤 [SYNC] Actualizando ${user.username}:`);
                console.log(`   • Antes: sectionName="${user.sectionName}" (${typeof user.sectionName})`);
                console.log(`   • Después: sectionName="${mapping.sectionName}"`);
                
                // Actualizar información de sección
                user.sectionName = mapping.sectionName;
                
                // Asegurar que activeCourses tenga el formato correcto
                if (!user.activeCourses) {
                    user.activeCourses = [];
                }
                
                // Verificar que el curso esté en activeCourses
                if (!user.activeCourses.includes(mapping.courseName)) {
                    console.log(`   • Agregando curso "${mapping.courseName}" a activeCourses`);
                    user.activeCourses.push(mapping.courseName);
                }
                
                updatedCount++;
            }
        });
        
        console.log(`✅ [SYNC] Actualizados ${updatedCount} estudiantes`);
        
        // Guardar usuarios actualizados
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        console.log('💾 [SYNC] Usuarios guardados en localStorage');
        
        // Verificar la actualización
        console.log('🔍 [SYNC] Verificando actualización...');
        users.forEach(user => {
            if (user.role === 'student' && sectionMapping[user.username]) {
                console.log(`✓ ${user.username}: sectionName="${user.sectionName}", activeCourses=[${user.activeCourses?.join(', ')}]`);
            }
        });
        
        console.log('🎉 [SYNC] ¡Sincronización completada exitosamente!');
        console.log('');
        console.log('📋 [SYNC] Próximos pasos:');
        console.log('1. Recargar la página para aplicar los cambios');
        console.log('2. Ir a "Nueva Tarea" → "4to Básico Sección A" → "Estudiantes específicos"');
        console.log('3. Verificar que solo aparezcan felipe y maria');
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ [SYNC] Error durante la sincronización:', error);
        return false;
    }
}

// Ejecutar sincronización
const success = syncUserSections();

if (success) {
    console.log('🚀 [SYNC] ¡Ejecuta una recarga de página para ver los cambios!');
} else {
    console.log('💥 [SYNC] La sincronización falló. Revisa los logs para más detalles.');
}
