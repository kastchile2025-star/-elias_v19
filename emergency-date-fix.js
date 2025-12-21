/**
 * CORRECCIÓN URGENTE: RangeError por fechas inválidas
 * Script simple y directo para resolver el problema inmediatamente
 */

console.log('🚨 CORRECCIÓN URGENTE: RangeError por fechas inválidas');
console.log('====================================================');

// Ejecutar corrección inmediatamente
(function() {
    try {
        const ahoraValido = new Date().toISOString();
        let cambiosRealizados = 0;

        console.log('🧹 Limpiando fechas inválidas en todas las tablas...');

        // 1. Limpiar usuarios
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        users.forEach(user => {
            if (!user.createdAt || isNaN(new Date(user.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en usuario: ${user.username}`);
                user.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!user.updatedAt || isNaN(new Date(user.updatedAt).getTime())) {
                console.log(`   Corrigiendo updatedAt en usuario: ${user.username}`);
                user.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // 2. Limpiar cursos
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        courses.forEach(course => {
            if (!course.createdAt || isNaN(new Date(course.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en curso: ${course.name}`);
                course.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!course.updatedAt || isNaN(new Date(course.updatedAt).getTime())) {
                console.log(`   Corrigiendo updatedAt en curso: ${course.name}`);
                course.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // 3. Limpiar secciones
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        sections.forEach(section => {
            if (!section.createdAt || isNaN(new Date(section.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en sección: ${section.name}`);
                section.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!section.updatedAt || isNaN(new Date(section.updatedAt).getTime())) {
                console.log(`   Corrigiendo updatedAt en sección: ${section.name}`);
                section.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // 4. Limpiar asignaciones de estudiantes
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        studentAssignments.forEach((assignment, index) => {
            if (!assignment.createdAt || isNaN(new Date(assignment.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en asignación estudiante ${index + 1}`);
                assignment.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!assignment.assignedAt || isNaN(new Date(assignment.assignedAt).getTime())) {
                console.log(`   Corrigiendo assignedAt en asignación estudiante ${index + 1}`);
                assignment.assignedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // 5. Limpiar asignaciones de profesores
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        teacherAssignments.forEach((assignment, index) => {
            if (!assignment.createdAt || isNaN(new Date(assignment.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en asignación profesor ${index + 1}`);
                assignment.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!assignment.assignedAt || isNaN(new Date(assignment.assignedAt).getTime())) {
                console.log(`   Corrigiendo assignedAt en asignación profesor ${index + 1}`);
                assignment.assignedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // 6. Limpiar tareas
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        tasks.forEach((task, index) => {
            if (!task.createdAt || isNaN(new Date(task.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en tarea ${index + 1}: ${task.title || 'Sin título'}`);
                task.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!task.updatedAt || isNaN(new Date(task.updatedAt).getTime())) {
                console.log(`   Corrigiendo updatedAt en tarea ${index + 1}: ${task.title || 'Sin título'}`);
                task.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
            if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
                console.log(`   Corrigiendo dueDate en tarea ${index + 1}: ${task.title || 'Sin título'}`);
                task.dueDate = ahoraValido;
                cambiosRealizados++;
            }
        });

        // 7. Limpiar evaluaciones si existen
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        evaluations.forEach((evaluation, index) => {
            if (evaluation.createdAt && isNaN(new Date(evaluation.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en evaluación ${index + 1}`);
                evaluation.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (evaluation.updatedAt && isNaN(new Date(evaluation.updatedAt).getTime())) {
                console.log(`   Corrigiendo updatedAt en evaluación ${index + 1}`);
                evaluation.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // 8. Limpiar entregas si existen
        const submissions = JSON.parse(localStorage.getItem('smart-student-submissions') || '[]');
        submissions.forEach((submission, index) => {
            if (submission.submittedAt && isNaN(new Date(submission.submittedAt).getTime())) {
                console.log(`   Corrigiendo submittedAt en entrega ${index + 1}`);
                submission.submittedAt = ahoraValido;
                cambiosRealizados++;
            }
            if (submission.createdAt && isNaN(new Date(submission.createdAt).getTime())) {
                console.log(`   Corrigiendo createdAt en entrega ${index + 1}`);
                submission.createdAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // Guardar todos los cambios
        if (cambiosRealizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-courses', JSON.stringify(courses));
            localStorage.setItem('smart-student-sections', JSON.stringify(sections));
            localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
            localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
            localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
            localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
            localStorage.setItem('smart-student-submissions', JSON.stringify(submissions));

            console.log(`\n✅ CORRECCIÓN COMPLETADA: Se corrigieron ${cambiosRealizados} fechas inválidas`);
            console.log('🎉 Todas las fechas problemáticas han sido reparadas');
        } else {
            console.log('\nℹ️ No se encontraron fechas inválidas que corregir');
        }

        console.log('\n🔄 PRÓXIMO PASO CRÍTICO:');
        console.log('========================');
        console.log('1. 🔄 RECARGA LA PÁGINA AHORA (Ctrl+F5)');
        console.log('2. 👨‍🏫 Haz login como profesor');
        console.log('3. 📝 Ve a la sección Tareas');
        console.log('4. 🎯 El RangeError debería estar resuelto');
        
        return true;

    } catch (error) {
        console.error('❌ ERROR durante la corrección:', error);
        console.log('\n🆘 Si persiste el error, prueba:');
        console.log('   1. Recargar la página');
        console.log('   2. Ejecutar el script nuevamente');
        console.log('   3. O contactar para soporte adicional');
        return false;
    }
})();

console.log('\n💡 NOTA IMPORTANTE:');
console.log('===================');
console.log('Este script se ejecuta automáticamente al cargarse.');
console.log('Si necesitas ejecutarlo nuevamente, recarga esta página y pega el script otra vez.');
