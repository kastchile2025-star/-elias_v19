/**
 * 🎯 ASIGNACIONES CORRECTAS BASADAS EN GESTIÓN DE USUARIOS
 * 
 * Script directo con las asignaciones correctas de la imagen que mostraste.
 */

console.log('🎯 APLICANDO ASIGNACIONES CORRECTAS...');
console.log('====================================');

function aplicarAsignacionesCorrectas() {
    try {
        // Asignaciones correctas basadas en tu imagen de gestión de usuarios
        const asignacionesCorrectas = [
            { username: 'felipe', curso: '4to Básico', seccion: 'A' },
            { username: 'maria', curso: '4to Básico', seccion: 'A' },
            { username: 'sofia', curso: '4to Básico', seccion: 'B' },
            { username: 'karla', curso: '4to Básico', seccion: 'B' },
            { username: 'gustavo', curso: '5to Básico', seccion: 'B' },
            { username: 'max', curso: '5to Básico', seccion: 'B' }
        ];

        console.log('📋 ASIGNACIONES A APLICAR:');
        console.log('==========================');
        asignacionesCorrectas.forEach((asig, index) => {
            console.log(`${index + 1}. ${asig.username}: ${asig.curso} - Sección ${asig.seccion}`);
        });

        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('\n🔧 APLICANDO CAMBIOS...');
        console.log('=======================');

        let aplicadas = 0;

        asignacionesCorrectas.forEach(asignacionReal => {
            const usuario = users.find(u => u.username === asignacionReal.username);
            if (!usuario) {
                console.log(`❌ Usuario ${asignacionReal.username} no encontrado`);
                return;
            }

            // Buscar o crear curso
            let curso = courses.find(c => c.name === asignacionReal.curso);
            if (!curso) {
                curso = {
                    id: `curso-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: asignacionReal.curso,
                    description: `Curso ${asignacionReal.curso}`,
                    createdAt: new Date().toISOString(),
                    autoCreated: true
                };
                courses.push(curso);
                console.log(`➕ Curso creado: ${curso.name}`);
            }

            // Buscar o crear sección
            let seccion = sections.find(s => s.name === asignacionReal.seccion && s.courseId === curso.id);
            if (!seccion) {
                seccion = {
                    id: `seccion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: asignacionReal.seccion,
                    courseId: curso.id,
                    description: `Sección ${asignacionReal.seccion} de ${curso.name}`,
                    createdAt: new Date().toISOString(),
                    autoCreated: true
                };
                sections.push(seccion);
                console.log(`➕ Sección creada: ${seccion.name} para ${curso.name}`);
            }

            // Eliminar asignación anterior del estudiante
            studentAssignments = studentAssignments.filter(a => a.studentId !== usuario.id);

            // Crear nueva asignación
            const nuevaAsignacion = {
                id: `correct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                studentId: usuario.id,
                courseId: curso.id,
                sectionId: seccion.id,
                createdAt: new Date().toISOString(),
                correctedAssignment: true,
                source: 'manual-correction'
            };

            studentAssignments.push(nuevaAsignacion);

            // Actualizar perfil del usuario
            const cursoCompleto = `${curso.name} - Sección ${seccion.name}`;
            usuario.activeCourses = [cursoCompleto];

            console.log(`✅ ${usuario.username}: ${cursoCompleto}`);
            aplicadas++;
        });

        // Guardar todos los cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));

        console.log(`\n🎉 CORRECCIÓN COMPLETADA:`);
        console.log(`========================`);
        console.log(`✅ Asignaciones aplicadas: ${aplicadas}`);
        console.log(`📚 Cursos en sistema: ${courses.length}`);
        console.log(`🏫 Secciones en sistema: ${sections.length}`);

        console.log('\n📊 VERIFICACIÓN FINAL:');
        console.log('======================');
        
        // Mostrar estado final de cada estudiante
        const usuariosFinales = JSON.parse(localStorage.getItem('smart-student-users'));
        const estudiantesFinales = usuariosFinales.filter(u => u.role === 'student');
        
        estudiantesFinales.forEach((estudiante, index) => {
            console.log(`${index + 1}. ${estudiante.username}: ${JSON.stringify(estudiante.activeCourses)}`);
        });

        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. 🔄 Recarga la página completamente (Ctrl+F5)');
        console.log('2. 👤 Ve al perfil de Gustavo - debería mostrar "5to Básico - Sección B"');
        console.log('3. 👤 Ve al perfil de Max - debería mostrar "5to Básico - Sección B"');
        console.log('4. ✅ Verifica que todos los estudiantes muestren sus cursos correctos');

        return true;

    } catch (error) {
        console.error('❌ ERROR aplicando asignaciones correctas:', error);
        return false;
    }
}

function verificarResultadoFinal() {
    try {
        console.log('\n🔍 VERIFICACIÓN ESPECÍFICA DE GUSTAVO Y MAX:');
        console.log('============================================');

        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        
        ['gustavo', 'max'].forEach(username => {
            const usuario = users.find(u => u.username === username);
            if (usuario) {
                const cursoActual = usuario.activeCourses?.[0] || 'Sin curso asignado';
                console.log(`👤 ${username.toUpperCase()}: ${cursoActual}`);
                
                if (cursoActual === '5to Básico - Sección B') {
                    console.log(`   ✅ CORRECTO - Asignación exitosa`);
                } else {
                    console.log(`   ❌ INCORRECTO - Debería ser "5to Básico - Sección B"`);
                }
            } else {
                console.log(`❌ Usuario ${username} no encontrado`);
            }
        });

        console.log('\n📋 TODOS LOS ESTUDIANTES:');
        console.log('=========================');
        const estudiantes = users.filter(u => u.role === 'student');
        estudiantes.forEach(estudiante => {
            const curso = estudiante.activeCourses?.[0] || 'Sin curso';
            console.log(`${estudiante.username}: ${curso}`);
        });

    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

// Ejecutar automáticamente
aplicarAsignacionesCorrectas();

console.log('\n💡 COMANDO ADICIONAL:');
console.log('=====================');
console.log('- verificarResultadoFinal() - Verificar que Gustavo y Max estén correctos');
