/**
 * 🔍 DIAGNÓSTICO ESPECÍFICO PARA MAX
 * 
 * Script para diagnosticar exactamente qué está pasando con los datos de Max
 * y forzar la corrección específica.
 */

console.log('🔍 DIAGNÓSTICO ESPECÍFICO PARA MAX...');
console.log('===================================');

function diagnosticarYCorregirMax() {
    try {
        // Obtener datos actuales
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 ESTADO ACTUAL DEL SISTEMA:');
        console.log(`Total usuarios: ${users.length}`);
        console.log(`Total cursos: ${courses.length}`);
        console.log(`Total secciones: ${sections.length}`);
        console.log(`Total asignaciones estudiantes: ${studentAssignments.length}`);

        // Buscar a Max
        const max = users.find(u => u.username === 'max');
        
        if (!max) {
            console.error('❌ Usuario "max" no encontrado');
            return false;
        }

        console.log('\n👤 INFORMACIÓN ACTUAL DE MAX:');
        console.log('=============================');
        console.log(`ID: ${max.id}`);
        console.log(`Username: ${max.username}`);
        console.log(`Nombre completo: ${max.fullName || 'No definido'}`);
        console.log(`Role: ${max.role}`);
        console.log(`Cursos activos: ${JSON.stringify(max.activeCourses || [])}`);

        // Buscar asignación actual de Max
        console.log('\n🎯 ASIGNACIÓN EN GESTIÓN DE USUARIOS:');
        console.log('====================================');
        const asignacionMax = studentAssignments.find(a => a.studentId === max.id);
        
        if (asignacionMax) {
            const curso = courses.find(c => c.id === asignacionMax.courseId);
            const seccion = sections.find(s => s.id === asignacionMax.sectionId);
            
            console.log(`✅ Asignación encontrada:`);
            console.log(`   ID de asignación: ${asignacionMax.id}`);
            console.log(`   Curso ID: ${asignacionMax.courseId}`);
            console.log(`   Sección ID: ${asignacionMax.sectionId}`);
            console.log(`   Curso nombre: ${curso?.name || 'Curso no encontrado'}`);
            console.log(`   Sección nombre: ${seccion?.name || 'Sección no encontrada'}`);
            console.log(`   Creado: ${asignacionMax.createdAt || 'No definido'}`);
            console.log(`   Auto-creado: ${asignacionMax.autoCreated || false}`);

            // Verificar qué debería mostrar el perfil
            if (curso && seccion) {
                const cursoEsperado = `${curso.name} - Sección ${seccion.name}`;
                console.log(`\n🎯 CURSO ESPERADO EN PERFIL: "${cursoEsperado}"`);
                
                const cursosActuales = max.activeCourses || [];
                console.log(`📱 CURSO ACTUAL EN PERFIL: ${JSON.stringify(cursosActuales)}`);
                
                if (cursosActuales.includes(cursoEsperado)) {
                    console.log(`✅ Los datos del perfil YA están correctos`);
                    console.log(`❓ Si sigues viendo "1ro Básico - Sección A", puede ser un problema de caché`);
                    console.log(`💡 Intenta: Ctrl+F5 para recargar completamente la página`);
                } else {
                    console.log(`❌ DESINCRONIZACIÓN DETECTADA - CORRIGIENDO...`);
                    
                    // Forzar corrección
                    max.activeCourses = [cursoEsperado];
                    
                    // Guardar cambios
                    localStorage.setItem('smart-student-users', JSON.stringify(users));
                    
                    console.log(`🔧 CORRECCIÓN APLICADA:`);
                    console.log(`   Antes: ${JSON.stringify(cursosActuales)}`);
                    console.log(`   Ahora: ${JSON.stringify(max.activeCourses)}`);
                }
            } else {
                console.log(`⚠️ Problema: La asignación apunta a curso/sección inexistente`);
            }
            
        } else {
            console.log(`❌ Max NO tiene asignación en gestión de usuarios`);
            
            // Mostrar todos los cursos disponibles
            console.log(`\n📋 CURSOS DISPONIBLES PARA ASIGNAR:`);
            courses.forEach((curso, index) => {
                const seccionesCurso = sections.filter(s => s.courseId === curso.id);
                console.log(`${index + 1}. ${curso.name} (ID: ${curso.id})`);
                seccionesCurso.forEach(seccion => {
                    console.log(`   - Sección ${seccion.name} (ID: ${seccion.id})`);
                });
            });
            
            // Crear asignación automática al primer curso disponible
            if (courses.length > 0) {
                const primerCurso = courses[0];
                const primerSeccion = sections.find(s => s.courseId === primerCurso.id);
                
                if (primerSeccion) {
                    console.log(`\n➕ CREANDO ASIGNACIÓN AUTOMÁTICA:`);
                    console.log(`   Curso: ${primerCurso.name}`);
                    console.log(`   Sección: ${primerSeccion.name}`);
                    
                    const nuevaAsignacion = {
                        id: `fix-max-${Date.now()}`,
                        studentId: max.id,
                        courseId: primerCurso.id,
                        sectionId: primerSeccion.id,
                        createdAt: new Date().toISOString(),
                        autoCreated: true,
                        fixedBy: 'diagnóstico-max'
                    };
                    
                    studentAssignments.push(nuevaAsignacion);
                    max.activeCourses = [`${primerCurso.name} - Sección ${primerSeccion.name}`];
                    
                    // Guardar cambios
                    localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
                    localStorage.setItem('smart-student-users', JSON.stringify(users));
                    
                    console.log(`✅ ASIGNACIÓN CREADA Y PERFIL ACTUALIZADO`);
                }
            }
        }

        // Verificación final
        console.log('\n🎉 VERIFICACIÓN FINAL:');
        console.log('=====================');
        const maxActualizado = JSON.parse(localStorage.getItem('smart-student-users')).find(u => u.username === 'max');
        console.log(`Datos finales de Max: ${JSON.stringify(maxActualizado.activeCourses || [])}`);
        
        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. Recarga la página completamente (Ctrl+F5)');
        console.log('2. Ve al perfil de Max');
        console.log('3. Los datos académicos deberían mostrar la información correcta');
        console.log('4. Si sigue igual, puede ser que el componente esté usando caché');

        return true;

    } catch (error) {
        console.error('❌ ERROR en diagnóstico de Max:', error);
        return false;
    }
}

// Función para limpiar caché del perfil
function limpiarCachePerfilMax() {
    try {
        // Limpiar posibles cachés relacionados con el perfil
        const keysToCheck = [
            'smart-student-profile-cache',
            'smart-student-user-cache', 
            'smart-student-academic-cache'
        ];
        
        console.log('🧹 LIMPIANDO CACHÉ...');
        keysToCheck.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Eliminado: ${key}`);
            }
        });
        
        console.log('✅ Caché limpiado. Recarga la página ahora.');
        
    } catch (error) {
        console.error('❌ Error al limpiar caché:', error);
    }
}

// Ejecutar diagnóstico automáticamente
diagnosticarYCorregirMax();

console.log('\n💡 COMANDOS ADICIONALES:');
console.log('- limpiarCachePerfilMax() - Limpiar caché del perfil');
console.log('- diagnosticarYCorregirMax() - Ejecutar diagnóstico nuevamente');
