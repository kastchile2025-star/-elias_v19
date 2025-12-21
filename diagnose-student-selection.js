/**
 * 🔍 SCRIPT DIAGNÓSTICO PARA SELECCIÓN DE ESTUDIANTES 🔍
 * 
 * 🎯 OBJETIVO: Verificar por qué aparecen 4 estudiantes al seleccionar "4to Básico Sección A"
 * 
 * 📋 INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12 → Console)
 * 2. Copia y pega este código completo
 * 3. Presiona Enter para ejecutar
 * 4. Analiza la información que muestra
 */

(function() {
    console.log('🔍 [DIAGNÓSTICO] Iniciando análisis de selección de estudiantes...');
    
    try {
        const usersText = localStorage.getItem('smart-student-users');
        if (!usersText) {
            console.error('❌ [DIAGNÓSTICO] No se encontraron usuarios en localStorage');
            return;
        }
        
        const users = JSON.parse(usersText);
        const students = users.filter(u => u.role === 'student');
        
        console.log(`👥 [DIAGNÓSTICO] Total estudiantes en el sistema: ${students.length}`);
        console.log('📊 [DIAGNÓSTICO] Detalles de TODOS los estudiantes:');
        
        students.forEach(student => {
            console.log(`\n   👤 ${student.username}:`);
            console.log(`     • sectionName: "${student.sectionName}"`);
            console.log(`     • activeCourses: [${student.activeCourses?.join(', ') || 'vacío'}]`);
            console.log(`     • assignedCourse: "${student.assignedCourse || 'undefined'}"`);
        });
        
        console.log('\n🎯 [DIAGNÓSTICO] Análisis específico para "4to Básico Sección A":');
        
        // Simular los diferentes métodos de filtrado
        const targetSection = 'A';
        const targetCourse = '4to Básico';
        const targetFullCourse = '4to Básico - Sección A';
        
        console.log(`🔍 Buscando estudiantes para: "${targetFullCourse}"`);
        
        // Método 1: Por sectionName = 'A' Y activeCourses contiene '4to Básico'
        console.log('\n📋 Método 1: sectionName="A" Y activeCourses contiene "4to Básico"');
        const method1 = students.filter(s => {
            const hasCorrectSection = s.sectionName === targetSection;
            const hasCorrectCourse = s.activeCourses && s.activeCourses.some(course => 
                course.includes(targetCourse)
            );
            
            console.log(`   ${s.username}: sección=${hasCorrectSection}, curso=${hasCorrectCourse}`);
            return hasCorrectSection && hasCorrectCourse;
        });
        console.log(`✅ Método 1 encontró: ${method1.length} estudiantes:`, method1.map(s => s.username));
        
        // Método 2: Por activeCourses contiene exactamente '4to Básico - Sección A'
        console.log('\n📋 Método 2: activeCourses contiene exactamente "4to Básico - Sección A"');
        const method2 = students.filter(s => {
            const hasExactCourse = s.activeCourses && s.activeCourses.includes(targetFullCourse);
            console.log(`   ${s.username}: cursoExacto=${hasExactCourse}`);
            return hasExactCourse;
        });
        console.log(`✅ Método 2 encontró: ${method2.length} estudiantes:`, method2.map(s => s.username));
        
        // Método 3: Por assignedCourse exacto
        console.log('\n📋 Método 3: assignedCourse = "4to Básico - Sección A"');
        const method3 = students.filter(s => {
            const hasCorrectAssignment = s.assignedCourse === targetFullCourse;
            console.log(`   ${s.username}: asignaciónCorrecta=${hasCorrectAssignment}`);
            return hasCorrectAssignment;
        });
        console.log(`✅ Método 3 encontró: ${method3.length} estudiantes:`, method3.map(s => s.username));
        
        // Análisis de inconsistencias
        console.log('\n🚨 [DIAGNÓSTICO] Análisis de inconsistencias:');
        
        students.forEach(student => {
            const problems = [];
            
            // Problema 1: sectionName no coincide con activeCourses
            if (student.sectionName && student.activeCourses) {
                const sectionInCourses = student.activeCourses.some(course => 
                    course.includes(`Sección ${student.sectionName}`) || 
                    course.includes(`- ${student.sectionName}`)
                );
                if (!sectionInCourses) {
                    problems.push(`sectionName "${student.sectionName}" no coincide con activeCourses`);
                }
            }
            
            // Problema 2: assignedCourse no coincide con activeCourses
            if (student.assignedCourse && student.activeCourses) {
                if (!student.activeCourses.includes(student.assignedCourse)) {
                    problems.push(`assignedCourse "${student.assignedCourse}" no está en activeCourses`);
                }
            }
            
            if (problems.length > 0) {
                console.log(`   ⚠️ ${student.username}: ${problems.join(', ')}`);
            }
        });
        
        console.log('\n🎉 [DIAGNÓSTICO] Análisis completado.');
        console.log('📝 [DIAGNÓSTICO] Ahora ve a "Crear Nueva Tarea" → "4to Básico Sección A" → "Estudiantes específicos"');
        console.log('🔍 [DIAGNÓSTICO] Y compara estos resultados con lo que aparece en la interfaz.');
        
    } catch (error) {
        console.error('❌ [DIAGNÓSTICO] Error durante el análisis:', error);
    }
})();
