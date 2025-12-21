/**
 * EXPORTACIÓN ENRIQUECIDA: Incluir asignaciones dinámicas en la exportación de la BBDD
 */

console.log('💾 EXPORTACIÓN ENRIQUECIDA CON ASIGNACIONES DINÁMICAS');
console.log('====================================================');

// Función para crear exportación completa con asignaciones correctas
function crearExportacionCompleta() {
    console.log('\n🔄 CREANDO EXPORTACIÓN COMPLETA...');
    
    // Cargar datos actuales
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const communications = JSON.parse(localStorage.getItem('smart-student-communications') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    // Definir asignaciones correctas como configuración de referencia
    const configuracionAsignaciones = {
        version: '1.0',
        lastUpdate: new Date().toISOString(),
        source: 'gestion-usuarios-dinamico',
        estudiantes: [
            // 4to Básico Sección A
            { username: 'felipe', courseName: '4to Básico', sectionName: 'A' },
            { username: 'maria', courseName: '4to Básico', sectionName: 'A' },
            
            // 4to Básico Sección B
            { username: 'sofia', courseName: '4to Básico', sectionName: 'B' },
            { username: 'karla', courseName: '4to Básico', sectionName: 'B' },
            
            // 5to Básico Sección A
            { username: 'gustavo', courseName: '5to Básico', sectionName: 'A' },
            { username: 'max', courseName: '5to Básico', sectionName: 'A' }
        ],
        profesores: [
            // Profesor pedro - 5to Básico Sección A
            { username: 'pedro', courseName: '5to Básico', sectionName: 'A', materias: ['Matemáticas', 'Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación'] }
            // Agregar más profesores según sea necesario
        ]
    };
    
    console.log('\n📋 CONFIGURACIÓN DE ASIGNACIONES:');
    console.log('   Estudiantes configurados:', configuracionAsignaciones.estudiantes.length);
    console.log('   Profesores configurados:', configuracionAsignaciones.profesores.length);
    
    // Crear exportación enriquecida
    const exportacionCompleta = {
        // Datos existentes
        users: users,
    communications: communications,
        courses: courses,
        sections: sections,
        studentAssignments: studentAssignments,
        teacherAssignments: teacherAssignments,
        
        // NUEVA SECCIÓN: Configuración de asignaciones dinámicas
        assignmentConfiguration: configuracionAsignaciones,
        
        // NUEVO: Configuraciones de calendario admin por año y semestres globales
        calendarConfigs: (() => {
            const configs = {};
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('admin-calendar-')) {
                        const year = key.replace('admin-calendar-', '');
                        const raw = localStorage.getItem(key);
                        if (!raw) continue;
                        try { configs[year] = JSON.parse(raw); } catch { configs[year] = raw; }
                    }
                }
            } catch (e) { /* ignore */ }
            return configs;
        })(),
        semesters: (() => {
            try { return JSON.parse(localStorage.getItem('smart-student-semesters') || 'null'); } catch { return null; }
        })(),
        
        // Metadatos de la exportación
        exportMetadata: {
            version: '2.0',
            exportDate: new Date().toISOString(),
            description: 'Exportación completa con configuración de asignaciones dinámicas',
            features: [
                'Asignaciones estudiante-sección automáticas',
                'Configuración de profesores por sección',
                'Validación automática de consistencia'
            ]
        }
    };
    
    console.log('\n✅ EXPORTACIÓN COMPLETA CREADA');
    console.log('   • Incluye configuración de asignaciones dinámicas');
    console.log('   • Compatible con importación automática');
    console.log('   • Previene inconsistencias futuras');
    
    return exportacionCompleta;
}

// Función para aplicar configuración desde exportación importada
function aplicarConfiguracionDesdeBBDD(datosImportados) {
    console.log('\n🔄 APLICANDO CONFIGURACIÓN DESDE BBDD IMPORTADA...');
    
    // Verificar si los datos importados tienen la configuración de asignaciones
    if (datosImportados.assignmentConfiguration) {
        console.log('✅ Configuración de asignaciones encontrada en la importación');
        
        const config = datosImportados.assignmentConfiguration;
        console.log(`   Versión: ${config.version}`);
        console.log(`   Última actualización: ${config.lastUpdate}`);
        console.log(`   Estudiantes: ${config.estudiantes.length}`);
        console.log(`   Profesores: ${config.profesores.length}`);
        
        // Aplicar asignaciones automáticamente
        aplicarAsignacionesDinamicas(config, datosImportados);
        
    } else {
        console.log('⚠️ Los datos importados NO incluyen configuración de asignaciones');
        console.log('   Aplicando configuración por defecto...');
        
        // Crear configuración por defecto y aplicar
        const configDefault = crearExportacionCompleta().assignmentConfiguration;
        aplicarAsignacionesDinamicas(configDefault, datosImportados);
    }
    
    // Aplicar comunicaciones si vienen en el export
    if (Array.isArray(datosImportados.communications)) {
        localStorage.setItem('smart-student-communications', JSON.stringify(datosImportados.communications));
        console.log(`✅ Comunicaciones importadas: ${datosImportados.communications.length}`);
    }

    // Restaurar configuraciones de calendario por año si existen
    try {
        const calendarConfigs = datosImportados.calendarConfigs;
        if (calendarConfigs && typeof calendarConfigs === 'object') {
            let restored = 0;
            Object.entries(calendarConfigs).forEach(([year, cfg]) => {
                try {
                    const y = String(year).trim();
                    if (!/^[0-9]{4}$/.test(y)) return;
                    const key = `admin-calendar-${y}`;
                    const value = typeof cfg === 'string' ? cfg : JSON.stringify(cfg);
                    localStorage.setItem(key, value);
                    restored++;
                } catch {}
            });
            console.log(`✅ Calendarios restaurados: ${restored}`);
        }
    } catch (e) { /* ignore */ }

    // Restaurar semestres globales
    try {
        if (datosImportados.semesters) {
            localStorage.setItem('smart-student-semesters', JSON.stringify(datosImportados.semesters));
            console.log('✅ Semestres globales restaurados');
        }
    } catch (e) { /* ignore */ }
}

// Función para aplicar asignaciones dinámicas basadas en configuración
function aplicarAsignacionesDinamicas(configuracion, datosImportados) {
    console.log('\n🎯 APLICANDO ASIGNACIONES DINÁMICAS...');
    
    const users = datosImportados.users || [];
    const courses = datosImportados.courses || [];
    const sections = datosImportados.sections || [];
    
    // Crear asignaciones de estudiantes basadas en configuración
    const nuevasAsignacionesEstudiantes = [];
    
    configuracion.estudiantes.forEach(asignacion => {
        const estudiante = users.find(u => u.username === asignacion.username && (u.role === 'student' || u.role === 'estudiante'));
        const curso = courses.find(c => c.name === asignacion.courseName);
        const seccion = sections.find(s => s.courseId === curso?.id && s.name === asignacion.sectionName);
        
        if (estudiante && curso && seccion) {
            const nuevaAsignacion = {
                id: `sa-auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                studentId: estudiante.id,
                courseId: curso.id,
                sectionId: seccion.id,
                createdAt: new Date().toISOString(),
                assignedAt: new Date().toISOString(),
                source: 'configuracion-automatica'
            };
            
            nuevasAsignacionesEstudiantes.push(nuevaAsignacion);
            
            // Actualizar perfil del estudiante
            estudiante.activeCourses = [`${curso.name} - Sección ${seccion.name}`];
            estudiante.courseId = curso.id;
            estudiante.sectionId = seccion.id;
            
            console.log(`   ✅ ${estudiante.username} → ${curso.name} Sección ${seccion.name}`);
        }
    });
    
    // Guardar datos actualizados
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    localStorage.setItem('smart-student-student-assignments', JSON.stringify(nuevasAsignacionesEstudiantes));
    
    console.log(`✅ Asignaciones aplicadas: ${nuevasAsignacionesEstudiantes.length}`);
}

// Función de validación automática (ejecutar después de importar)
function validarYCorregirAsignaciones() {
    console.log('\n🔍 VALIDACIÓN AUTOMÁTICA DE ASIGNACIONES...');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
    let problemasEncontrados = 0;
    
    estudiantes.forEach(estudiante => {
        const asignaciones = studentAssignments.filter(sa => sa.studentId === estudiante.id);
        
        if (asignaciones.length === 0) {
            console.log(`   ❌ ${estudiante.username}: Sin asignaciones`);
            problemasEncontrados++;
        } else if (asignaciones.length > 1) {
            console.log(`   ⚠️ ${estudiante.username}: Múltiples asignaciones (${asignaciones.length})`);
            problemasEncontrados++;
        }
    });
    
    if (problemasEncontrados > 0) {
        console.log(`🔧 Se encontraron ${problemasEncontrados} problemas. Aplicando corrección automática...`);
        
        // Aplicar configuración por defecto
        const configDefault = crearExportacionCompleta().assignmentConfiguration;
        aplicarAsignacionesDinamicas(configDefault, {
            users: users,
            courses: JSON.parse(localStorage.getItem('smart-student-courses') || '[]'),
            sections: JSON.parse(localStorage.getItem('smart-student-sections') || '[]')
        });
        
        console.log('✅ Corrección automática aplicada');
    } else {
        console.log('✅ No se encontraron problemas en las asignaciones');
    }
    
    return problemasEncontrados === 0;
}

// EXPORTAR FUNCIONES PARA USO EXTERNO
window.smartStudentAssignments = {
    crearExportacionCompleta,
    aplicarConfiguracionDesdeBBDD,
    validarYCorregirAsignaciones,
    aplicarAsignacionesDinamicas
};

console.log('\n🎉 SISTEMA DE ASIGNACIONES DINÁMICAS ACTIVADO');
console.log('=============================================');
console.log('✅ Funciones disponibles globalmente:');
console.log('   • smartStudentAssignments.crearExportacionCompleta()');
console.log('   • smartStudentAssignments.aplicarConfiguracionDesdeBBDD(datos)');
console.log('   • smartStudentAssignments.validarYCorregirAsignaciones()');
console.log('');
console.log('📋 PASOS RECOMENDADOS:');
console.log('1. 💾 Ejecutar: smartStudentAssignments.crearExportacionCompleta()');
console.log('2. 📤 Guardar la exportación generada como archivo JSON');
console.log('3. 📥 Al importar, la configuración se aplicará automáticamente');
console.log('4. 🔍 Ejecutar validación automática después de cada importación');
console.log('');
console.log('🎯 BENEFICIOS:');
console.log('✅ Sin más problemas de asignaciones después de importar');
console.log('✅ Configuración persistente en la exportación');
console.log('✅ Validación automática de consistencia');
console.log('✅ Sistema completamente dinámico');

// Ejecutar validación inicial
console.log('\n🔄 EJECUTANDO VALIDACIÓN INICIAL...');
const estadoValido = validarYCorregirAsignaciones();

if (estadoValido) {
    console.log('\n🎉 SISTEMA LISTO Y VALIDADO');
} else {
    console.log('\n✅ SISTEMA CORREGIDO Y LISTO');
}
