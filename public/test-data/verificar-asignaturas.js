// Script para verificar y crear asignaturas faltantes

function verificarYCrearAsignaturas() {
    console.log('\n🔍 ==========================================');
    console.log('   VERIFICACIÓN DE ASIGNATURAS DEL SISTEMA');
    console.log('==========================================\n');
    
    const currentYear = new Date().getFullYear();
    
    // 1. Cargar datos
    const coursesKey = `smart-student-courses-${currentYear}`;
    const sectionsKey = `smart-student-sections-${currentYear}`;
    const subjectsKey = `smart-student-subjects-${currentYear}`;
    
    let courses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
    let sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
    let subjects = JSON.parse(localStorage.getItem(subjectsKey) || '[]');
    
    console.log('📊 ESTADO ACTUAL:');
    console.log(`   Cursos: ${courses.length}`);
    console.log(`   Secciones: ${sections.length}`);
    console.log(`   Asignaturas: ${subjects.length}`);
    
    // 2. Definir asignaturas por nivel
    const asignaturasBasica = [
        { 
            name: 'Ciencias Naturales', 
            abbreviation: 'CNT', 
            color: 'green',
            bgColor: '#bbf7d0',
            textColor: '#14532d'
        },
        { 
            name: 'Historia, Geografía y Ciencias Sociales', 
            abbreviation: 'HIS', 
            color: 'yellow',
            bgColor: '#fef3c7',
            textColor: '#78350f'
        },
        { 
            name: 'Lenguaje y Comunicación', 
            abbreviation: 'LEN', 
            color: 'red',
            bgColor: '#fecaca',
            textColor: '#7f1d1d'
        },
        { 
            name: 'Matemáticas', 
            abbreviation: 'MAT', 
            color: 'blue',
            bgColor: '#bfdbfe',
            textColor: '#1e3a8a'
        }
    ];
    
    const asignaturasMedia = [
        { 
            name: 'Biología', 
            abbreviation: 'BIO', 
            color: 'green',
            bgColor: '#bbf7d0',
            textColor: '#14532d'
        },
        { 
            name: 'Física', 
            abbreviation: 'FIS', 
            color: 'purple',
            bgColor: '#e9d5ff',
            textColor: '#581c87'
        },
        { 
            name: 'Química', 
            abbreviation: 'QUI', 
            color: 'pink',
            bgColor: '#fecdd3',
            textColor: '#831843'
        },
        { 
            name: 'Historia, Geografía y Ciencias Sociales', 
            abbreviation: 'HIS', 
            color: 'yellow',
            bgColor: '#fef3c7',
            textColor: '#78350f'
        },
        { 
            name: 'Lenguaje y Comunicación', 
            abbreviation: 'LEN', 
            color: 'red',
            bgColor: '#fecaca',
            textColor: '#7f1d1d'
        },
        { 
            name: 'Matemáticas', 
            abbreviation: 'MAT', 
            color: 'blue',
            bgColor: '#bfdbfe',
            textColor: '#1e3a8a'
        },
        { 
            name: 'Filosofía', 
            abbreviation: 'FIL', 
            color: 'gray',
            bgColor: '#e5e7eb',
            textColor: '#111827'
        },
        { 
            name: 'Educación Ciudadana', 
            abbreviation: 'EDC', 
            color: 'indigo',
            bgColor: '#c7d2fe',
            textColor: '#312e81'
        }
    ];
    
    // 3. Generar código único para asignatura
    function generateSubjectCode() {
        return 'SUB-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    
    // 4. Procesar cada curso
    console.log('\n📚 PROCESANDO CURSOS Y ASIGNATURAS:\n');
    
    let asignaturasCreadas = 0;
    const cursosBasica = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
    ];
    
    courses.forEach(course => {
        const esBasica = cursosBasica.includes(course.name);
        const nivel = esBasica ? 'BÁSICA' : 'MEDIA';
        const asignaturasNivel = esBasica ? asignaturasBasica : asignaturasMedia;
        
        console.log(`\n${course.name} (${nivel}):`);
        
        // Verificar qué asignaturas existen para este curso
        const asignaturasExistentes = subjects.filter(s => s.courseId === course.id);
        console.log(`   Asignaturas existentes: ${asignaturasExistentes.length}`);
        
        // Crear las asignaturas faltantes
        asignaturasNivel.forEach(asignaturaConfig => {
            const existe = asignaturasExistentes.find(s => s.name === asignaturaConfig.name);
            
            if (!existe) {
                const nuevaAsignatura = {
                    id: crypto.randomUUID(),
                    uniqueCode: generateSubjectCode(),
                    name: asignaturaConfig.name,
                    abbreviation: asignaturaConfig.abbreviation,
                    description: `Asignatura de ${asignaturaConfig.name} para ${course.name}`,
                    courseId: course.id,
                    color: asignaturaConfig.color,
                    bgColor: asignaturaConfig.bgColor,
                    textColor: asignaturaConfig.textColor,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                subjects.push(nuevaAsignatura);
                console.log(`   ✅ Creada: ${asignaturaConfig.abbreviation} - ${asignaturaConfig.name}`);
                asignaturasCreadas++;
            } else {
                console.log(`   ⏭️  Ya existe: ${asignaturaConfig.abbreviation} - ${asignaturaConfig.name}`);
            }
        });
    });
    
    // 5. Guardar cambios
    if (asignaturasCreadas > 0) {
        localStorage.setItem(subjectsKey, JSON.stringify(subjects));
        console.log(`\n✅ ${asignaturasCreadas} asignaturas creadas y guardadas`);
    } else {
        console.log('\n✅ Todas las asignaturas ya existen');
    }
    
    // 6. Resumen final
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   Total cursos: ${courses.length}`);
    console.log(`   Total secciones: ${sections.length}`);
    console.log(`   Total asignaturas: ${subjects.length}`);
    
    // 7. Desglose por curso
    console.log('\n📋 DESGLOSE POR CURSO:');
    courses.forEach(course => {
        const asignaturasCurso = subjects.filter(s => s.courseId === course.id);
        const seccionesCurso = sections.filter(s => s.courseId === course.id);
        console.log(`\n   ${course.name}:`);
        console.log(`      • Secciones: ${seccionesCurso.map(s => s.name).join(', ')}`);
        console.log(`      • Asignaturas (${asignaturasCurso.length}):`);
        asignaturasCurso.forEach(asig => {
            console.log(`         - ${asig.abbreviation}: ${asig.name}`);
        });
    });
    
    console.log('\n✨ ¡VERIFICACIÓN COMPLETADA!');
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('   1. Refresca la página del Admin');
    console.log('   2. Ve a: Admin → Gestión de Usuarios → Asignaciones');
    console.log('   3. Verifica que todas las asignaturas aparecen');
    
    return {
        cursosTotal: courses.length,
        seccionesTotal: sections.length,
        asignaturasTotal: subjects.length,
        asignaturasCreadas,
        exito: true
    };
}

// Ejecutar automáticamente
verificarYCrearAsignaturas();
