/**
 * ⚡ CORRECCIÓN COMPLETA DE SINCRONIZACIÓN DE CURSOS ⚡
 * 
 * 🎯 OBJETIVO: Corregir inconsistencias entre perfil personal y gestión de usuarios
 * 
 * 🚨 PROBLEMA DETECTADO: 
 * - gustavo: Gestión = "5to Básico A", Perfil = "4to Básico A" 
 * - max: Gestión = "6to Básico A", Perfil = "4to Básico A"
 * 
 * 💡 SOLUCIÓN: Sincronizar TODOS los datos de curso/sección correctamente
 * 
 * 📋 INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12 → Console)
 * 2. Copia y pega este código completo
 * 3. Presiona Enter para ejecutar
 * 4. Recarga la página después de ver "🎉 ¡Corrección completada!"
 * 5. Verifica que solo aparezcan felipe y maria en "4to Básico Sección A"
 */

(function() {
    console.log('🔧 [FIX] Iniciando corrección completa de sincronización...');
    
    try {
        const usersText = localStorage.getItem('smart-student-users');
        if (!usersText) {
            console.error('❌ [FIX] No se encontraron usuarios en localStorage');
            return;
        }
        
        const users = JSON.parse(usersText);
        console.log(`👥 [FIX] Encontrados ${users.length} usuarios`);
        
        // Mapeo CORRECTO basado en la información real de gestión de usuarios
        const correctMapping = {
            'felipe': { courseName: '4to Básico', sectionName: 'A', courseDisplay: '4to Básico - Sección A' },
            'maria': { courseName: '4to Básico', sectionName: 'A', courseDisplay: '4to Básico - Sección A' },
            'sofia': { courseName: '4to Básico', sectionName: 'B', courseDisplay: '4to Básico - Sección B' },
            'karla': { courseName: '4to Básico', sectionName: 'B', courseDisplay: '4to Básico - Sección B' },
            'gustavo': { courseName: '5to Básico', sectionName: 'A', courseDisplay: '5to Básico - Sección A' },
            'max': { courseName: '6to Básico', sectionName: 'A', courseDisplay: '6to Básico - Sección A' }
        };
        
        console.log('🗂️ [FIX] Mapeo correcto de cursos:', correctMapping);
        
        console.log('📋 [FIX] Estado ANTES de la corrección:');
        users.forEach(user => {
            if (user.role === 'student' && correctMapping[user.username]) {
                console.log(`   ${user.username}:`);
                console.log(`     • sectionName: "${user.sectionName}"`);
                console.log(`     • activeCourses: [${user.activeCourses?.join(', ') || 'vacío'}]`);
                console.log(`     • assignedCourse: "${user.assignedCourse || 'undefined'}"`);
            }
        });
        
        let updatedCount = 0;
        
        // Actualizar cada usuario con información COMPLETA
        users.forEach(user => {
            if (user.role === 'student' && correctMapping[user.username]) {
                const mapping = correctMapping[user.username];
                
                console.log(`👤 [FIX] Corrigiendo ${user.username}:`);
                
                // 1. Actualizar sectionName
                user.sectionName = mapping.sectionName;
                console.log(`   ✓ sectionName: "${mapping.sectionName}"`);
                
                // 2. Actualizar activeCourses (para el filtrado)
                user.activeCourses = [mapping.courseName];
                console.log(`   ✓ activeCourses: ["${mapping.courseName}"]`);
                
                // 3. Actualizar assignedCourse (para el perfil personal)
                user.assignedCourse = mapping.courseDisplay;
                console.log(`   ✓ assignedCourse: "${mapping.courseDisplay}"`);
                
                // 4. Limpiar cualquier dato conflictivo
                if (user.courseId) {
                    delete user.courseId;
                    console.log(`   ✓ Eliminado courseId conflictivo`);
                }
                
                updatedCount++;
            }
        });
        
        console.log(`✅ [FIX] Corregidos ${updatedCount} estudiantes`);
        
        // Guardar usuarios corregidos
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        console.log('💾 [FIX] Usuarios guardados en localStorage');
        
        console.log('📋 [FIX] Estado DESPUÉS de la corrección:');
        users.forEach(user => {
            if (user.role === 'student' && correctMapping[user.username]) {
                console.log(`   ✓ ${user.username}:`);
                console.log(`     • sectionName: "${user.sectionName}"`);
                console.log(`     • activeCourses: [${user.activeCourses?.join(', ')}]`);
                console.log(`     • assignedCourse: "${user.assignedCourse}"`);
            }
        });
        
        console.log('');
        console.log('🎉 [FIX] ¡Corrección completada exitosamente!');
        console.log('');
        console.log('📋 [FIX] Próximos pasos:');
        console.log('1. 🔄 Recargar la página para aplicar los cambios');
        console.log('2. 📝 Probar "Nueva Tarea" → "4to Básico Sección A" → "Estudiantes específicos"');
        console.log('3. ✅ Verificar que SOLO aparezcan felipe y maria');
        console.log('4. 👤 Verificar perfiles de gustavo y max (deberían mostrar sus cursos correctos)');
        console.log('');
        console.log('🚀 ¡Recarga la página ahora!');
        
    } catch (error) {
        console.error('❌ [FIX] Error durante la corrección:', error);
    }
})();
