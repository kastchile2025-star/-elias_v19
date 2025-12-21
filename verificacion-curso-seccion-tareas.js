// 🔧 VERIFICACIÓN FINAL: Curso y Sección en Tareas
// Ejecutar en la consola del navegador para verificar los cambios implementados

console.log('🔧 === VERIFICACIÓN FINAL CURSO Y SECCIÓN EN TAREAS ===');

function verificarCursoSeccionTareas() {
    console.log('\n📋 Verificando información de curso y sección en tareas...');
    
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    console.log(`📊 Total tareas: ${tareas.length}`);
    console.log(`🏫 Total cursos: ${cursos.length}`);
    console.log(`📚 Total secciones: ${secciones.length}`);
    
    // Mostrar información de todas las tareas
    console.log('\n📝 INFORMACIÓN DE TAREAS:');
    tareas.forEach((tarea, index) => {
        console.log(`  ${index + 1}. "${tarea.title}"`);
        console.log(`     Course Code: ${tarea.course}`);
        console.log(`     AssignedTo: ${tarea.assignedTo}`);
        console.log(`     Subject: ${tarea.subject}`);
        
        // Probar la función getCourseAndSectionName simulada
        const nombreLegible = simularGetCourseAndSectionName(tarea.course);
        console.log(`     Nombre Legible: "${nombreLegible}"`);
        console.log('     ---');
    });
    
    return { tareas, cursos, secciones };
}

function simularGetCourseAndSectionName(courseCode) {
    try {
        const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log(`🔍 Procesando courseCode: "${courseCode}"`);
        
        // Método 1: Parsear código compuesto (courseId-sectionId)
        if (courseCode.includes('-') && courseCode.length > 40) {
            const parts = courseCode.split('-');
            console.log(`   Partes detectadas: ${parts.length}`);
            
            if (parts.length >= 10) {
                const actualCourseId = parts.slice(0, 5).join('-');
                const sectionId = parts.slice(5).join('-');
                
                console.log(`   CourseId: ${actualCourseId}`);
                console.log(`   SectionId: ${sectionId}`);
                
                const curso = cursos.find(c => c.id === actualCourseId);
                const seccion = secciones.find(s => s.id === sectionId);
                
                console.log(`   Curso encontrado: ${curso ? curso.name : 'NO'}`);
                console.log(`   Sección encontrada: ${seccion ? seccion.name : 'NO'}`);
                
                if (curso && seccion) {
                    return `${curso.name} Sección ${seccion.name}`;
                }
            }
        }
        
        // Método 2: Mapeo para códigos conocidos
        const conocidos = {
            '4to_basico_a': '4to Básico Sección A',
            '4to_basico_b': '4to Básico Sección B',
            '5to_basico_a': '5to Básico Sección A',
            '5to_basico_b': '5to Básico Sección B',
            'ciencias_naturales': 'Ciencias Naturales',
            'matematicas': 'Matemáticas',
            'historia': 'Historia, Geografía y Ciencias Sociales'
        };
        
        if (conocidos[courseCode]) {
            console.log(`   Encontrado en mapeo conocido: ${conocidos[courseCode]}`);
            return conocidos[courseCode];
        }
        
        // Método 3: Buscar solo por courseId
        const curso = cursos.find(c => c.id === courseCode);
        if (curso) {
            console.log(`   Curso directo encontrado: ${curso.name}`);
            return curso.name;
        }
        
        // Método 4: Fallback - limpiar código
        const limpio = courseCode.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
        console.log(`   Fallback limpio: ${limpio}`);
        return limpio;
        
    } catch (error) {
        console.warn('Error al procesar:', error);
        return courseCode;
    }
}

function testInterfazUsuario() {
    console.log('\n🎨 === TEST INTERFAZ DE USUARIO ===');
    
    // Verificar que las tareas se muestren correctamente
    const tarjetasTareas = document.querySelectorAll('[class*="card"]');
    console.log(`📋 Tarjetas de tareas encontradas: ${tarjetasTareas.length}`);
    
    // Buscar elementos que muestren información de estudiantes
    const elementosUsuarios = document.querySelectorAll('[class*="Users"], [class*="User"]');
    console.log(`👥 Elementos de usuarios encontrados: ${elementosUsuarios.length}`);
    
    // Buscar texto que contenga "estudiantes"
    const todosLosTextos = document.querySelectorAll('*');
    let elementosConEstudiantes = 0;
    
    todosLosTextos.forEach(elemento => {
        if (elemento.textContent && elemento.textContent.includes('estudiante')) {
            elementosConEstudiantes++;
            console.log(`   📝 Texto encontrado: "${elemento.textContent.trim()}"`);
        }
    });
    
    console.log(`📊 Total elementos con "estudiante": ${elementosConEstudiantes}`);
    
    return {
        tarjetasTareas: tarjetasTareas.length,
        elementosUsuarios: elementosUsuarios.length,
        elementosConEstudiantes
    };
}

function crearTareaPrueba() {
    console.log('\n🔧 === CREANDO TAREA DE PRUEBA ===');
    
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    // Crear tarea de prueba para 4to Básico B
    const tareaPrueba = {
        id: `task_test_curso_seccion_${Date.now()}`,
        title: 'Tarea Test - Mostrar Curso y Sección',
        description: 'Tarea de prueba para verificar que se muestre el curso y sección',
        subject: 'Historia, Geografía y Ciencias Sociales',
        course: '4to_basico_b', // Usar código conocido
        assignedById: currentUser.id,
        assignedByName: currentUser.displayName || currentUser.username,
        assignedTo: 'course', // Importante: asignada a todo el curso
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        attachments: [],
        taskType: 'tarea'
    };
    
    // Agregar tarea sin duplicar
    const tareasLimpias = tareas.filter(t => !t.id.includes('task_test_curso_seccion'));
    const tareasActualizadas = [...tareasLimpias, tareaPrueba];
    
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareasActualizadas));
    
    console.log('✅ Tarea de prueba creada:');
    console.log(`   📝 Título: "${tareaPrueba.title}"`);
    console.log(`   🏫 Curso: ${tareaPrueba.course}`);
    console.log(`   📚 Nombre esperado: "${simularGetCourseAndSectionName(tareaPrueba.course)}"`);
    
    return tareaPrueba;
}

function verificacionCompleta() {
    console.log('🎯 === EJECUTANDO VERIFICACIÓN COMPLETA ===');
    
    try {
        // Paso 1: Verificar datos
        const datos = verificarCursoSeccionTareas();
        
        // Paso 2: Crear tarea de prueba
        const tareaPrueba = crearTareaPrueba();
        
        // Paso 3: Test interfaz
        const interfaz = testInterfazUsuario();
        
        // Paso 4: Forzar actualización
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
        
        console.log('\n🏁 === RESUMEN VERIFICACIÓN ===');
        console.log(`📝 Tareas en sistema: ${datos.tareas.length}`);
        console.log(`🎯 Tarea de prueba: "${tareaPrueba.title}"`);
        console.log(`🎨 Elementos en interfaz: ${interfaz.tarjetasTareas} tarjetas`);
        
        console.log('\n💡 === INSTRUCCIONES ===');
        console.log('1. Refresca la página si es necesario');
        console.log('2. Ve a la pestaña de Tareas');
        console.log('3. Busca la tarea "Tarea Test - Mostrar Curso y Sección"');
        console.log('4. Verifica que aparezca "4to Básico Sección B • X estudiantes"');
        console.log('5. Si no aparece, revisa la consola para errores');
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

// Ejecutar automáticamente
verificacionCompleta();

// Funciones disponibles
window.verificarCursoSeccionTareas = verificarCursoSeccionTareas;
window.simularGetCourseAndSectionName = simularGetCourseAndSectionName;
window.testInterfazUsuario = testInterfazUsuario;
window.crearTareaPrueba = crearTareaPrueba;
