// 🔍 DEPURACIÓN CRÍTICA: Verificar cursos reales de Felipe
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔍 [DEBUG] Verificando cursos reales de Felipe...');
    console.log('=' .repeat(70));
    
    // 1. Verificar datos de usuarios
    console.log('📊 VERIFICANDO DATOS DE USUARIOS:');
    const storedUsers = localStorage.getItem('smart-student-users');
    if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log(`Total usuarios: ${users.length}`);
        
        const felipe = users.find(u => u.username === 'felipe');
        if (felipe) {
            console.log('👤 DATOS DE FELIPE ENCONTRADOS:');
            console.log('   - Username:', felipe.username);
            console.log('   - Role:', felipe.role);
            console.log('   - ID:', felipe.id);
            console.log('   - Active Courses:', felipe.activeCourses);
            console.log('   - Estructura completa:', felipe);
        } else {
            console.log('❌ Felipe no encontrado en usuarios');
        }
    }
    
    // 2. Verificar datos de cursos
    console.log('\n📚 VERIFICANDO DATOS DE CURSOS:');
    const storedCourses = localStorage.getItem('smart-student-courses');
    if (storedCourses) {
        const courses = JSON.parse(storedCourses);
        console.log(`Total cursos: ${courses.length}`);
        
        courses.forEach((course, index) => {
            console.log(`\n${index + 1}. Curso:`);
            console.log(`   - ID: "${course.id}"`);
            console.log(`   - Nombre: "${course.name}"`);
            console.log(`   - Código: "${course.code}"`);
            console.log(`   - Estudiantes:`, course.students);
            
            // Verificar si Felipe está inscrito
            if (course.students && course.students.includes('felipe')) {
                console.log(`   🎯 ¡FELIPE ESTÁ INSCRITO EN ESTE CURSO!`);
            }
        });
    }
    
    // 3. Buscar en inscripciones
    console.log('\n📝 VERIFICANDO INSCRIPCIONES:');
    const storedEnrollments = localStorage.getItem('smart-student-enrollments');
    if (storedEnrollments) {
        const enrollments = JSON.parse(storedEnrollments);
        console.log(`Total inscripciones: ${enrollments.length}`);
        
        enrollments.forEach((enrollment, index) => {
            console.log(`\n${index + 1}. Inscripción:`);
            console.log(`   - Usuario: "${enrollment.username}"`);
            console.log(`   - Curso ID: "${enrollment.courseId}"`);
            console.log(`   - Fecha: ${enrollment.enrolledAt}`);
            
            if (enrollment.username === 'felipe') {
                console.log(`   🎯 ¡INSCRIPCIÓN DE FELIPE!`);
            }
        });
    }
    
    // 4. Recopilar todos los cursos reales de Felipe
    console.log('\n🎯 DETERMINANDO CURSOS REALES DE FELIPE:');
    
    let felipeCourses = [];
    
    // Método 1: Desde datos de usuario
    if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const felipe = users.find(u => u.username === 'felipe');
        if (felipe && felipe.activeCourses) {
            felipeCourses = [...felipeCourses, ...felipe.activeCourses];
        }
    }
    
    // Método 2: Desde inscripciones
    if (storedEnrollments) {
        const enrollments = JSON.parse(storedEnrollments);
        const felipeEnrollments = enrollments.filter(e => e.username === 'felipe');
        felipeEnrollments.forEach(e => {
            if (!felipeCourses.includes(e.courseId)) {
                felipeCourses.push(e.courseId);
            }
        });
    }
    
    // Método 3: Desde cursos donde aparece como estudiante
    if (storedCourses) {
        const courses = JSON.parse(storedCourses);
        courses.forEach(course => {
            if (course.students && course.students.includes('felipe')) {
                if (!felipeCourses.includes(course.id)) {
                    felipeCourses.push(course.id);
                }
            }
        });
    }
    
    console.log('📊 CURSOS REALES DE FELIPE:');
    console.log('   Cursos encontrados:', felipeCourses);
    
    // 5. Verificar tareas con los cursos reales
    console.log('\n🔍 VERIFICANDO TAREAS CON CURSOS REALES:');
    const storedTasks = localStorage.getItem('smart-student-tasks');
    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        
        const felipeRealTasks = tasks.filter(task => 
            task.course && felipeCourses.includes(task.course)
        );
        
        console.log(`📊 Tareas reales de Felipe: ${felipeRealTasks.length}`);
        felipeRealTasks.forEach((task, index) => {
            console.log(`   ${index + 1}. "${task.title}" (${task.taskType}) - Curso: ${task.course}`);
        });
        
        // Verificar específicamente "dfsdfds"
        const dfsdfdsTask = tasks.find(t => t.title === 'dfsdfds');
        if (dfsdfdsTask) {
            const isInFelipeCourses = felipeCourses.includes(dfsdfdsTask.course);
            console.log(`\n🎯 EVALUACIÓN "dfsdfds":`);
            console.log(`   - Curso de la tarea: ${dfsdfdsTask.course}`);
            console.log(`   - ¿Está en cursos de Felipe?: ${isInFelipeCourses}`);
            
            if (!isInFelipeCourses) {
                console.log(`   ❌ ¡ESTA ES LA CAUSA DEL PROBLEMA!`);
            }
        }
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 Verificación de cursos completada`);
    
    return {
        felipeCourses: felipeCourses,
        totalCourses: felipeCourses.length
    };
})();
