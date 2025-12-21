/**
 * 🎯 REDISTRIBUCIÓN DINÁMICA PARA GESTIÓN DE USUARIOS
 * 
 * Este script simula lo que harías manualmente en "Gestión de Usuarios" → "Asignaciones"
 * pero de forma automatizada y completamente dinámica.
 */

console.log('🎯 INICIANDO REDISTRIBUCIÓN DINÁMICA...');

function redistribuirEstudiantesDinamicamente() {
    console.log('\n🎯 [REDISTRIBUCIÓN] Simulando cambios en Gestión de Usuarios...');
    
    try {
        // Cargar datos actuales
        let users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        let courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        let sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log('📊 Estado actual: Todos en 4to Básico - Sección A');
        console.log('🎯 Objetivo: Distribuir en diferentes cursos y secciones');
        
        // Limpiar asignaciones actuales
        studentAssignments = [];
        
        // Definir nueva distribución (ejemplo)
        const nuevaDistribucion = [
            { estudiante: 'felipe', curso: '4to Básico', seccion: 'A' },
            { estudiante: 'maria', curso: '4to Básico', seccion: 'A' },
            { estudiante: 'karla', curso: '4to Básico', seccion: 'B' },
            { estudiante: 'sofia', curso: '4to Básico', seccion: 'B' },
            { estudiante: 'gustavo', curso: '5to Básico', seccion: 'A' },
            { estudiante: 'max', curso: '5to Básico', seccion: 'A' }
        ];
        
        console.log('\n📋 [NUEVA DISTRIBUCIÓN PROPUESTA]:');
        nuevaDistribucion.forEach(item => {
            console.log(`   • ${item.estudiante} → ${item.curso} Sección ${item.seccion}`);
        });
        
        // Preguntar al usuario si quiere aplicar esta distribución
        console.log('\n❓ ¿QUIERES APLICAR ESTA DISTRIBUCIÓN?');
        console.log('   Escribe: aplicarDistribucion() para confirmar');
        console.log('   O modifica manualmente en "Gestión de Usuarios"');
        
        // Función para aplicar la distribución
        window.aplicarDistribucion = function() {
            console.log('\n🔄 [APLICANDO] Redistribuyendo estudiantes...');
            
            let asignacionesCreadas = 0;
            
            nuevaDistribucion.forEach(item => {
                // Buscar estudiante
                const student = students.find(s => 
                    s.username.toLowerCase() === item.estudiante.toLowerCase() ||
                    s.displayName?.toLowerCase() === item.estudiante.toLowerCase()
                );
                
                if (!student) {
                    console.log(`❌ No se encontró estudiante: ${item.estudiante}`);
                    return;
                }
                
                // Buscar curso
                const course = courses.find(c => c.name === item.curso);
                if (!course) {
                    console.log(`❌ No se encontró curso: ${item.curso}`);
                    return;
                }
                
                // Buscar sección
                const section = sections.find(s => 
                    s.courseId === course.id && s.name === item.seccion
                );
                if (!section) {
                    console.log(`❌ No se encontró sección ${item.seccion} para curso ${item.curso}`);
                    return;
                }
                
                // Crear nueva asignación
                const newAssignment = {
                    id: `assignment-${student.id}-${Date.now()}-${asignacionesCreadas}`,
                    studentId: student.id,
                    courseId: course.id,
                    sectionId: section.id,
                    createdAt: new Date().toISOString(),
                    createdBy: 'dynamic-redistribution'
                };
                
                studentAssignments.push(newAssignment);
                
                // Actualizar datos del estudiante
                student.activeCourses = [`${item.curso} - Sección ${item.seccion}`];
                student.sectionName = item.seccion;
                
                console.log(`✅ ${student.displayName || student.username} → ${item.curso} Sección ${item.seccion}`);
                asignacionesCreadas++;
            });
            
            // Guardar cambios
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
            
            console.log(`\n🎉 [COMPLETADO] ${asignacionesCreadas} estudiantes redistribuidos`);
            console.log('\n💡 [SIGUIENTE PASO]:');
            console.log('   1. Recarga la página (F5)');
            console.log('   2. Crea una nueva tarea');
            console.log('   3. Prueba seleccionar diferentes cursos-secciones');
            console.log('   4. ¡Ahora "Estudiantes específicos" mostrará solo los de esa sección!');
            
            // Verificar resultado
            verificarNuevaDistribucion();
        };
        
        // Función para verificar la nueva distribución
        window.verificarNuevaDistribucion = function() {
            console.log('\n🔍 [VERIFICANDO] Nueva distribución...');
            
            const updatedAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            const groupedBySection = {};
            
            updatedAssignments.forEach(assignment => {
                const student = students.find(s => s.id === assignment.studentId);
                const course = courses.find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                
                if (student && course && section) {
                    const key = `${course.name} - Sección ${section.name}`;
                    if (!groupedBySection[key]) {
                        groupedBySection[key] = [];
                    }
                    groupedBySection[key].push(student.displayName || student.username);
                }
            });
            
            console.log('\n📚 [DISTRIBUCIÓN ACTUAL]:');
            Object.keys(groupedBySection).forEach(grupo => {
                console.log(`\n📖 ${grupo}:`);
                groupedBySection[grupo].forEach(nombre => {
                    console.log(`   • ${nombre}`);
                });
            });
        };
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en redistribución dinámica:', error);
        return false;
    }
}

// Función alternativa: Redistribución personalizada
function redistribucionPersonalizada() {
    console.log('\n🎨 [PERSONALIZADA] Para hacer tu propia distribución:');
    console.log('1. Ve a "Gestión de Usuarios" (modo Admin)');
    console.log('2. Selecciona la pestaña "Asignaciones"');
    console.log('3. Para cada estudiante:');
    console.log('   - Selecciona el estudiante');
    console.log('   - Elige el curso deseado');
    console.log('   - Elige la sección deseada');
    console.log('   - Guarda la asignación');
    console.log('4. Repite para todos los estudiantes');
    console.log('5. ¡El filtrado dinámico funcionará automáticamente!');
}

// Ejecutar
console.log('🚀 Ejecutando redistribución dinámica...');
const resultado = redistribuirEstudiantesDinamicamente();

if (resultado) {
    console.log('\n✅ REDISTRIBUCIÓN DINÁMICA LISTA');
    console.log('\n🔧 OPCIONES DISPONIBLES:');
    console.log('   • aplicarDistribucion() - Para aplicar la distribución sugerida');
    console.log('   • verificarNuevaDistribucion() - Para verificar cambios');
    console.log('   • redistribucionPersonalizada() - Para instrucciones manuales');
} else {
    console.log('\n❌ ERROR en redistribución dinámica');
}
