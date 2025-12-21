// 🔍 DIAGNÓSTICO: 4to Básico Sección B
// Ejecutar en la consola del navegador después de crear la tarea

console.log('🔍 === DIAGNÓSTICO 4TO BÁSICO SECCIÓN B ===');

function analizarTarea4toBasicoB() {
    console.log('\n📚 Analizando tarea recién creada...');
    
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    
    // Buscar la tarea más reciente de 4to Básico
    const tareas4toBasico = tareas.filter(t => 
        t.course && (
            t.course.toLowerCase().includes('4to') || 
            t.course.toLowerCase().includes('basico') ||
            t.course.toLowerCase().includes('sección b') ||
            t.course.toLowerCase().includes('seccion b')
        )
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`📊 Tareas de 4to Básico encontradas: ${tareas4toBasico.length}`);
    
    if (tareas4toBasico.length > 0) {
        const tareaReciente = tareas4toBasico[0];
        console.log('\n📝 TAREA MÁS RECIENTE:');
        console.log(`  Título: "${tareaReciente.title}"`);
        console.log(`  Course: "${tareaReciente.course}"`);
        console.log(`  AssignedTo: "${tareaReciente.assignedTo}"`);
        console.log(`  Subject: "${tareaReciente.subject}"`);
        console.log(`  CreatedAt: ${tareaReciente.createdAt}`);
        console.log(`  AssignedById: ${tareaReciente.assignedById}`);
        
        return { tareas, usuarios, asignaciones, tareaReciente };
    } else {
        console.log('❌ No se encontraron tareas de 4to Básico');
        return { tareas, usuarios, asignaciones, tareaReciente: null };
    }
}

function analizarEstudiantesDelCurso() {
    console.log('\n👥 Analizando estudiantes del curso...');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    
    // Buscar estudiantes
    const todosLosEstudiantes = usuarios.filter(u => u.role === 'student');
    console.log(`📊 Total estudiantes en el sistema: ${todosLosEstudiantes.length}`);
    
    // Mostrar todos los estudiantes
    console.log('\n👤 ESTUDIANTES EN EL SISTEMA:');
    todosLosEstudiantes.forEach((estudiante, index) => {
        console.log(`  ${index + 1}. ${estudiante.username} (${estudiante.displayName})`);
        console.log(`     ID: ${estudiante.id}`);
        console.log(`     activeCourses: ${JSON.stringify(estudiante.activeCourses)}`);
        if (estudiante.assignedTeacher) {
            console.log(`     assignedTeacher: ${estudiante.assignedTeacher}`);
        }
        console.log('     ---');
    });
    
    // Analizar asignaciones
    console.log('\n📋 ASIGNACIONES ACTUALES:');
    if (asignaciones.length === 0) {
        console.log('❌ NO HAY ASIGNACIONES EN EL SISTEMA');
        console.log('💡 Este puede ser el problema principal');
    } else {
        asignaciones.forEach((assignment, index) => {
            const estudiante = usuarios.find(u => u.id === assignment.studentId);
            console.log(`  ${index + 1}. ${estudiante?.username || 'ID: ' + assignment.studentId}`);
            console.log(`     courseId: ${assignment.courseId}`);
            console.log(`     sectionId: ${assignment.sectionId}`);
            console.log(`     teacherId: ${assignment.teacherId}`);
            console.log('     ---');
        });
    }
    
    return { todosLosEstudiantes, asignaciones };
}

function buscarPatronesCurso() {
    console.log('\n🔍 Buscando patrones de curso y sección...');
    
    const data = analizarTarea4toBasicoB();
    if (!data.tareaReciente) {
        console.log('❌ No hay tarea para analizar patrones');
        return;
    }
    
    const courseCode = data.tareaReciente.course;
    console.log(`🏫 Código del curso: "${courseCode}"`);
    
    // Analizar formato del curso
    if (courseCode.includes('-')) {
        console.log('✅ Formato con guión detectado');
        
        const parts = courseCode.split('-');
        console.log(`📝 Partes del código: ${parts.length}`);
        parts.forEach((part, index) => {
            console.log(`   ${index + 1}: "${part}"`);
        });
        
        // Intentar parsear como courseId-sectionId
        if (parts.length >= 10) {
            const courseId = parts.slice(0, 5).join('-');
            const sectionId = parts.slice(5).join('-');
            
            console.log('\n🎯 PARSEO COMO UUID COMPUESTO:');
            console.log(`   CourseId: ${courseId}`);
            console.log(`   SectionId: ${sectionId}`);
            
            // Buscar asignaciones con estos IDs
            const asignacionesCoincidentes = data.asignaciones.filter(a => 
                a.courseId === courseId && a.sectionId === sectionId
            );
            
            console.log(`📋 Asignaciones encontradas: ${asignacionesCoincidentes.length}`);
            
            if (asignacionesCoincidentes.length === 0) {
                console.log('❌ NO HAY ASIGNACIONES PARA ESTE CURSO-SECCIÓN');
                console.log('💡 NECESARIO CREAR ASIGNACIONES');
            }
            
            return { courseId, sectionId, asignacionesCoincidentes };
        }
    } else {
        console.log('⚠️ Formato sin guión - puede ser problema de formato');
    }
}

function crearAsignacionesPrueba() {
    console.log('\n🔧 === CREANDO ASIGNACIONES DE PRUEBA ===');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    
    // Buscar la tarea reciente
    const data = analizarTarea4toBasicoB();
    if (!data.tareaReciente) {
        console.log('❌ No hay tarea para crear asignaciones');
        return;
    }
    
    const courseCode = data.tareaReciente.course;
    
    // Parsear curso
    let courseId = courseCode;
    let sectionId = null;
    
    if (courseCode.includes('-') && courseCode.length > 40) {
        const parts = courseCode.split('-');
        if (parts.length >= 10) {
            courseId = parts.slice(0, 5).join('-');
            sectionId = parts.slice(5).join('-');
        }
    }
    
    console.log(`📚 Creando asignaciones para:`);
    console.log(`   CourseId: ${courseId}`);
    console.log(`   SectionId: ${sectionId}`);
    
    // Buscar estudiantes para asignar
    const estudiantes = usuarios.filter(u => u.role === 'student');
    
    if (estudiantes.length === 0) {
        console.log('❌ No hay estudiantes en el sistema');
        
        // Crear estudiantes de prueba
        const estudiantesPrueba = [
            {
                id: `student_4to_b_001`,
                username: 'ana_martinez',
                displayName: 'Ana Martínez',
                role: 'student',
                activeCourses: ['4to_basico_b'],
                assignedTeacher: currentUser.username,
                assignedTeacherId: currentUser.id
            },
            {
                id: `student_4to_b_002`,
                username: 'carlos_rodriguez',
                displayName: 'Carlos Rodríguez',
                role: 'student',
                activeCourses: ['4to_basico_b'],
                assignedTeacher: currentUser.username,
                assignedTeacherId: currentUser.id
            }
        ];
        
        const usuariosActualizados = [...usuarios, ...estudiantesPrueba];
        localStorage.setItem('smart-student-users', JSON.stringify(usuariosActualizados));
        
        console.log('✅ Estudiantes de prueba creados');
        estudiantesPrueba.forEach(est => {
            console.log(`   👤 ${est.username} (${est.displayName})`);
        });
        
        // Usar estudiantes recién creados
        estudiantes.push(...estudiantesPrueba);
    }
    
    // Crear asignaciones para todos los estudiantes
    const nuevasAsignaciones = estudiantes.map(estudiante => ({
        id: `assignment_${Date.now()}_${estudiante.id}`,
        studentId: estudiante.id,
        courseId: courseId,
        sectionId: sectionId,
        teacherId: data.tareaReciente.assignedById || currentUser.id,
        assignedAt: new Date().toISOString(),
        status: 'active'
    }));
    
    // Limpiar asignaciones duplicadas
    const asignacionesLimpias = asignaciones.filter(a => 
        !(a.courseId === courseId && a.sectionId === sectionId)
    );
    
    const asignacionesFinales = [...asignacionesLimpias, ...nuevasAsignaciones];
    localStorage.setItem('smart-student-user-student-assignments', JSON.stringify(asignacionesFinales));
    
    console.log(`✅ ${nuevasAsignaciones.length} asignaciones creadas`);
    nuevasAsignaciones.forEach(assignment => {
        const estudiante = estudiantes.find(e => e.id === assignment.studentId);
        console.log(`   📋 ${estudiante?.username} → ${courseId}-${sectionId}`);
    });
    
    return nuevasAsignaciones.length;
}

function testFuncionFinal() {
    console.log('\n🧪 === TEST FUNCIÓN FINAL ===');
    
    const data = analizarTarea4toBasicoB();
    if (!data.tareaReciente) {
        console.log('❌ No hay tarea para probar');
        return;
    }
    
    const courseCode = data.tareaReciente.course;
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const asignaciones = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    
    console.log(`🔍 Probando con courseCode: "${courseCode}"`);
    
    // Simular función corregida
    function simularGetStudentsFromCourse(courseId) {
        let actualCourseId = courseId;
        let sectionId = null;
        
        if (courseId.includes('-') && courseId.length > 40) {
            const parts = courseId.split('-');
            if (parts.length >= 10) {
                actualCourseId = parts.slice(0, 5).join('-');
                sectionId = parts.slice(5).join('-');
            }
        }
        
        console.log(`   CourseId parseado: ${actualCourseId}`);
        console.log(`   SectionId parseado: ${sectionId}`);
        
        const asignacionesExactas = asignaciones.filter(assignment => {
            const exactCourseMatch = assignment.courseId === actualCourseId;
            const exactSectionMatch = sectionId ? assignment.sectionId === sectionId : true;
            
            console.log(`   📋 ${assignment.studentId}: curso=${exactCourseMatch}, sección=${exactSectionMatch}`);
            
            return exactCourseMatch && exactSectionMatch;
        });
        
        const estudiantesIds = asignacionesExactas.map(a => a.studentId);
        const estudiantes = usuarios.filter(u => 
            u.role === 'student' && estudiantesIds.includes(u.id)
        );
        
        console.log(`   👥 Estudiantes encontrados: ${estudiantes.length}`);
        estudiantes.forEach(est => {
            console.log(`     ✅ ${est.username} (${est.displayName})`);
        });
        
        return estudiantes;
    }
    
    const resultado = simularGetStudentsFromCourse(courseCode);
    
    if (resultado.length > 0) {
        console.log('\n🎉 ¡FUNCIÓN FUNCIONANDO CORRECTAMENTE!');
        console.log('🔄 Actualiza la página y abre la tarea');
    } else {
        console.log('\n❌ Función no encuentra estudiantes');
        console.log('💡 Verifica las asignaciones creadas');
    }
    
    return resultado;
}

// Ejecutar diagnóstico completo
function diagnosticoCompleto4toBasicoB() {
    console.log('🎯 === EJECUTANDO DIAGNÓSTICO COMPLETO 4TO BÁSICO B ===');
    
    try {
        // Paso 1: Analizar tarea
        const dataTarea = analizarTarea4toBasicoB();
        
        // Paso 2: Analizar estudiantes
        const dataEstudiantes = analizarEstudiantesDelCurso();
        
        // Paso 3: Buscar patrones
        buscarPatronesCurso();
        
        // Paso 4: Crear asignaciones si es necesario
        const asignacionesCreadas = crearAsignacionesPrueba();
        
        // Paso 5: Test final
        const estudiantesEncontrados = testFuncionFinal();
        
        console.log('\n🏁 === RESUMEN DIAGNÓSTICO ===');
        console.log(`📝 Tarea encontrada: ${dataTarea.tareaReciente ? 'SÍ' : 'NO'}`);
        console.log(`👥 Estudiantes en sistema: ${dataEstudiantes.todosLosEstudiantes.length}`);
        console.log(`📋 Asignaciones creadas: ${asignacionesCreadas}`);
        console.log(`✅ Estudiantes encontrados: ${estudiantesEncontrados.length}`);
        
        if (estudiantesEncontrados.length > 0) {
            console.log('\n🎉 PROBLEMA RESUELTO');
            console.log('📋 SIGUIENTE: Actualiza la página y abre la tarea');
        } else {
            console.log('\n⚠️ REQUIERE VERIFICACIÓN MANUAL');
        }
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

// Ejecutar automáticamente
diagnosticoCompleto4toBasicoB();

// Funciones disponibles
window.analizarTarea4toBasicoB = analizarTarea4toBasicoB;
window.analizarEstudiantesDelCurso = analizarEstudiantesDelCurso;
window.crearAsignacionesPrueba = crearAsignacionesPrueba;
window.testFuncionFinal = testFuncionFinal;
window.diagnosticoCompleto4toBasicoB = diagnosticoCompleto4toBasicoB;
