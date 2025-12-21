/**
 * 🔧 CORRECCIÓN FORMATO CURSO EN PERFILES PERSONALES 🔧
 * 
 * 🎯 OBJETIVO: Corregir el formato duplicado en perfiles personales
 * 
 * 🚨 PROBLEMA DETECTADO: 
 * - gustavo: Perfil muestra "5to Básico - Sección A - Sección A" (duplicado)
 * - max: Perfil muestra "6to Básico - Sección A - Sección A" (duplicado)
 * 
 * 💡 SOLUCIÓN: Corregir activeCourses para que use formato estándar "X Básico - Sección Y"
 * 
 * 📋 INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12 → Console)
 * 2. Copia y pega este código completo
 * 3. Presiona Enter para ejecutar
 * 4. Recarga la página después de ver "🎉 ¡Corrección completada!"
 * 5. Verifica los perfiles personales de gustavo y max
 */

(function() {
    console.log('🔧 [PROFILE FIX] Iniciando corrección de formato en perfiles...');
    
    try {
        const usersText = localStorage.getItem('smart-student-users');
        if (!usersText) {
            console.error('❌ [PROFILE FIX] No se encontraron usuarios en localStorage');
            return;
        }
        
        const users = JSON.parse(usersText);
        console.log(`👥 [PROFILE FIX] Encontrados ${users.length} usuarios`);
        
        console.log('📋 [PROFILE FIX] Estado ANTES de la corrección:');
        users.forEach(user => {
            if (user.role === 'student') {
                console.log(`   ${user.username}:`);
                console.log(`     • activeCourses: [${user.activeCourses?.join(', ') || 'vacío'}]`);
                console.log(`     • assignedCourse: "${user.assignedCourse || 'undefined'}"`);
                console.log(`     • sectionName: "${user.sectionName}"`);
            }
        });
        
        let changesCount = 0;
        
        // Corregir formatos duplicados y inconsistentes
        users.forEach(user => {
            if (user.role === 'student' && user.activeCourses && Array.isArray(user.activeCourses)) {
                let needsUpdate = false;
                const correctedCourses = [];
                
                for (const course of user.activeCourses) {
                    if (typeof course === 'string') {
                        // Detectar y corregir formatos duplicados como "5to Básico - Sección A - Sección A"
                        if (course.includes('- Sección') && course.split('- Sección').length > 2) {
                            console.log(`🔧 [PROFILE FIX] Corrigiendo formato duplicado en ${user.username}: "${course}"`);
                            
                            // Extraer el curso base y la primera sección
                            const parts = course.split(' - Sección ');
                            const baseCourseName = parts[0]; // Ej: "5to Básico"
                            const sectionName = parts[1] ? parts[1].split(' - ')[0] : 'A'; // Primera sección mencionada
                            
                            const correctedFormat = `${baseCourseName} - Sección ${sectionName}`;
                            correctedCourses.push(correctedFormat);
                            needsUpdate = true;
                            
                            console.log(`   ↪️ Nuevo formato: "${correctedFormat}"`);
                        } 
                        // Detectar formatos que no tienen "Sección" pero deberían tenerlo
                        else if (course.match(/^\d+to Básico - [AB]$/)) {
                            console.log(`🔧 [PROFILE FIX] Añadiendo "Sección" a ${user.username}: "${course}"`);
                            
                            const correctedFormat = course.replace(/ - ([AB])$/, ' - Sección $1');
                            correctedCourses.push(correctedFormat);
                            needsUpdate = true;
                            
                            console.log(`   ↪️ Nuevo formato: "${correctedFormat}"`);
                        }
                        else {
                            // Mantener el formato si ya está correcto
                            correctedCourses.push(course);
                        }
                    } else {
                        // Si no es string, mantener como está
                        correctedCourses.push(course);
                    }
                }
                
                if (needsUpdate) {
                    user.activeCourses = correctedCourses;
                    changesCount++;
                    console.log(`✅ [PROFILE FIX] ${user.username} corregido`);
                }
                
                // También corregir assignedCourse si tiene el mismo problema
                if (user.assignedCourse && typeof user.assignedCourse === 'string') {
                    if (user.assignedCourse.includes('- Sección') && user.assignedCourse.split('- Sección').length > 2) {
                        console.log(`🔧 [PROFILE FIX] Corrigiendo assignedCourse duplicado en ${user.username}: "${user.assignedCourse}"`);
                        
                        const parts = user.assignedCourse.split(' - Sección ');
                        const baseCourseName = parts[0];
                        const sectionName = parts[1] ? parts[1].split(' - ')[0] : 'A';
                        
                        user.assignedCourse = `${baseCourseName} - Sección ${sectionName}`;
                        needsUpdate = true;
                        
                        console.log(`   ↪️ assignedCourse corregido: "${user.assignedCourse}"`);
                    }
                }
            }
        });
        
        if (changesCount > 0) {
            // Guardar cambios
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            console.log(`💾 [PROFILE FIX] Guardados ${changesCount} cambios en localStorage`);
            
            console.log('📋 [PROFILE FIX] Estado DESPUÉS de la corrección:');
            users.forEach(user => {
                if (user.role === 'student') {
                    console.log(`   ${user.username}:`);
                    console.log(`     • activeCourses: [${user.activeCourses?.join(', ') || 'vacío'}]`);
                    console.log(`     • assignedCourse: "${user.assignedCourse || 'undefined'}"`);
                }
            });
            
            console.log('🎉 [PROFILE FIX] ¡Corrección completada! Recarga la página (F5) para ver los cambios.');
            console.log('🔍 [PROFILE FIX] Verifica los perfiles personales de gustavo y max.');
        } else {
            console.log('ℹ️ [PROFILE FIX] No se encontraron formatos duplicados que corregir.');
        }
        
    } catch (error) {
        console.error('❌ [PROFILE FIX] Error durante la corrección:', error);
    }
})();
