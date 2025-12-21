/**
 * 🎯 DISTRIBUIR ESTUDIANTES EN DIFERENTES SECCIONES
 * 
 * Este script toma los estudiantes actuales y los distribuye
 * en diferentes secciones para que el filtrado funcione correctamente.
 */

console.log('🎯 INICIANDO DISTRIBUCIÓN DE ESTUDIANTES EN SECCIONES...');

function distribuirEstudiantesEnSecciones() {
    console.log('\n🎯 [DISTRIBUCIÓN] Redistribuyendo estudiantes en diferentes secciones...');
    
    try {
        // Cargar datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log(`📊 Estado actual:`);
        console.log(`   • Estudiantes: ${students.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones: ${studentAssignments.length}`);
        
        // Buscar curso "4to Básico"
        const cuartoCurso = courses.find(c => c.name === '4to Básico');
        if (!cuartoCurso) {
            console.log('❌ No se encontró el curso "4to Básico"');
            return false;
        }
        
        console.log(`\n📚 Curso encontrado: ${cuartoCurso.name} (ID: ${cuartoCurso.id})`);
        
        // Buscar secciones de 4to Básico
        const seccionesCuarto = sections.filter(s => s.courseId === cuartoCurso.id);
        console.log(`\n📋 Secciones disponibles para 4to Básico:`);
        seccionesCuarto.forEach((section, index) => {
            console.log(`   ${index + 1}. Sección ${section.name} (ID: ${section.id})`);
        });
        
        if (seccionesCuarto.length < 2) {
            console.log('⚠️ Necesitamos al menos 2 secciones para distribuir estudiantes');
            
            // Crear sección B si no existe
            const seccionB = {
                id: `section-b-${Date.now()}`,
                name: 'B',
                courseId: cuartoCurso.id,
                description: 'Sección B de 4to Básico',
                maxStudents: 30,
                createdAt: new Date().toISOString()
            };
            sections.push(seccionB);
            seccionesCuarto.push(seccionB);
            
            localStorage.setItem('smart-student-sections', JSON.stringify(sections));
            console.log(`✅ Sección B creada: ${seccionB.id}`);
        }
        
        // Distribuir estudiantes en secciones
        console.log(`\n🎯 Distribuyendo ${students.length} estudiantes en ${seccionesCuarto.length} secciones...`);
        
        // Limpiar asignaciones existentes de estos estudiantes
        studentAssignments = studentAssignments.filter(a => 
            !students.some(s => s.id === a.studentId)
        );
        
        students.forEach((student, index) => {
            // Alternar entre secciones disponibles
            const sectionIndex = index % seccionesCuarto.length;
            const targetSection = seccionesCuarto[sectionIndex];
            
            // Crear nueva asignación
            const newAssignment = {
                id: `assignment-${student.id}-${Date.now()}-${index}`,
                studentId: student.id,
                courseId: cuartoCurso.id,
                sectionId: targetSection.id,
                createdAt: new Date().toISOString(),
                createdBy: 'distribution-script'
            };
            
            studentAssignments.push(newAssignment);
            
            // Actualizar datos del estudiante
            student.sectionName = targetSection.name;
            student.activeCourses = [`4to Básico - Sección ${targetSection.name}`];
            
            console.log(`✅ ${student.displayName || student.username} → Sección ${targetSection.name}`);
        });
        
        // Guardar cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        
        // Mostrar resultado final
        console.log(`\n🎉 DISTRIBUCIÓN COMPLETADA:`);
        
        seccionesCuarto.forEach(section => {
            const estudiantesEnSeccion = studentAssignments.filter(a => a.sectionId === section.id);
            console.log(`\n📋 Sección ${section.name}:`);
            estudiantesEnSeccion.forEach(assignment => {
                const student = students.find(s => s.id === assignment.studentId);
                if (student) {
                    console.log(`   • ${student.displayName || student.username}`);
                }
            });
        });
        
        console.log(`\n💡 AHORA PUEDES PROBAR:`);
        console.log(`   1. Recarga la página (F5)`);
        console.log(`   2. Crea una nueva tarea`);
        console.log(`   3. Selecciona "4to Básico Sección A"`);
        console.log(`   4. Elige "Estudiantes específicos"`);
        console.log(`   5. ¡Solo deberías ver estudiantes de la Sección A!`);
        console.log(`   6. Repite con "4to Básico Sección B" para verificar`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error durante la distribución:', error);
        return false;
    }
}

// Función para verificar la distribución
function verificarDistribucion() {
    console.log('\n🔍 [VERIFICACIÓN] Verificando distribución de estudiantes...');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        const cuartoCurso = courses.find(c => c.name === '4to Básico');
        
        if (!cuartoCurso) {
            console.log('❌ No se encontró el curso 4to Básico');
            return false;
        }
        
        const seccionesCuarto = sections.filter(s => s.courseId === cuartoCurso.id);
        
        console.log(`📊 Resumen de distribución:`);
        console.log(`   • Total estudiantes: ${students.length}`);
        console.log(`   • Total secciones: ${seccionesCuarto.length}`);
        
        seccionesCuarto.forEach(section => {
            const estudiantesEnSeccion = studentAssignments.filter(a => a.sectionId === section.id);
            console.log(`\n📋 Sección ${section.name} (${estudiantesEnSeccion.length} estudiantes):`);
            
            estudiantesEnSeccion.forEach(assignment => {
                const student = students.find(s => s.id === assignment.studentId);
                if (student) {
                    console.log(`   • ${student.displayName || student.username}`);
                }
            });
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
        return false;
    }
}

// Ejecutar automáticamente
console.log('🚀 Ejecutando distribución de estudiantes...');
const resultado = distribuirEstudiantesEnSecciones();

if (resultado) {
    console.log('\n✅ DISTRIBUCIÓN EXITOSA');
    console.log('\n🔧 FUNCIONES DISPONIBLES:');
    console.log('   • distribuirEstudiantesEnSecciones() - Para redistribuir');
    console.log('   • verificarDistribucion() - Para verificar el estado');
} else {
    console.log('\n❌ ERROR en la distribución');
}
