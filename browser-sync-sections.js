/**
 * ⚡ HERRAMIENTA DE SINCRONIZACIÓN DE SECCIONES ⚡
 * 
 * 🎯 OBJETIVO: Corregir el problema donde los estudiantes no aparecen 
 *              filtrados correctamente por sección en "Estudiantes específicos"
 * 
 * 🚨 PROBLEMA: En "Gestión de Usuarios" se ven las secciones correctas, 
 *              pero en "Nueva Tarea" aparecen todos los estudiantes
 * 
 * 💡 SOLUCIÓN: Sincronizar datos de sección desde la interfaz visual 
 *              hacia los datos del sistema de filtrado
 * 
 * 📋 INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12 → Console)
 * 2. Copia y pega este código completo
 * 3. Presiona Enter para ejecutar
 * 4. Recarga la página después de ver "🎉 ¡Sincronización completada!"
 * 5. Prueba "Nueva Tarea" → "4to Básico Sección A" → "Estudiantes específicos"
 */

(function() {
    console.log('🔧 [SYNC] Iniciando sincronización de secciones de usuarios...');
    
    try {
        console.log('📊 [SYNC] Obteniendo usuarios del localStorage...');
        
        // Obtener usuarios actuales
        const usersText = localStorage.getItem('smart-student-users');
        if (!usersText) {
            console.error('❌ [SYNC] No se encontraron usuarios en localStorage');
            return;
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
        
        // Mostrar estado antes de la actualización
        console.log('📋 [SYNC] Estado ANTES de la sincronización:');
        users.forEach(user => {
            if (user.role === 'student' && sectionMapping[user.username]) {
                console.log(`   ${user.username}: sectionName="${user.sectionName}" (${typeof user.sectionName}), activeCourses=[${user.activeCourses?.join(', ') || 'vacío'}]`);
            }
        });
        
        // Actualizar cada usuario
        users.forEach(user => {
            if (user.role === 'student' && sectionMapping[user.username]) {
                const mapping = sectionMapping[user.username];
                
                console.log(`👤 [SYNC] Actualizando ${user.username}:`);
                console.log(`   • Antes: sectionName="${user.sectionName}" (${typeof user.sectionName})`);
                
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
                
                console.log(`   • Después: sectionName="${user.sectionName}"`);
                updatedCount++;
            }
        });
        
        console.log(`✅ [SYNC] Actualizados ${updatedCount} estudiantes`);
        
        // Guardar usuarios actualizados
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        console.log('💾 [SYNC] Usuarios guardados en localStorage');
        
        // Mostrar estado después de la actualización
        console.log('📋 [SYNC] Estado DESPUÉS de la sincronización:');
        users.forEach(user => {
            if (user.role === 'student' && sectionMapping[user.username]) {
                console.log(`   ✓ ${user.username}: sectionName="${user.sectionName}", activeCourses=[${user.activeCourses?.join(', ')}]`);
            }
        });
        
        console.log('');
        console.log('🎉 [SYNC] ¡Sincronización completada exitosamente!');
        console.log('');
        console.log('📋 [SYNC] Próximos pasos:');
        console.log('1. 🔄 Recargar la página para aplicar los cambios');
        console.log('2. 📝 Ir a "Nueva Tarea" → "4to Básico Sección A" → "Estudiantes específicos"');
        console.log('3. ✅ Verificar que solo aparezcan felipe y maria');
        console.log('4. 🧪 Probar también con "4to Básico Sección B" → debería mostrar sofia y karla');
        console.log('');
        console.log('🚀 ¡Ya puedes recargar la página!');
        
    } catch (error) {
        console.error('❌ [SYNC] Error durante la sincronización:', error);
    }
})();
