// SCRIPT DE PRUEBA - CARGA MASIVA CALIFICACIONES
// Ejecutar en la consola del navegador en la página de configuración

console.log('🧪 SCRIPT DE PRUEBA - CARGA MASIVA CALIFICACIONES');
console.log('=' .repeat(60));

// 1. Verificar estado actual
console.log('\n1️⃣ VERIFICANDO ESTADO ACTUAL:');
console.log('isSQLConnected:', window.sqlGlobal?.isConnected || 'N/A');
console.log('Year seleccionado:', document.querySelector('[data-year]')?.textContent || 'N/A');

// 2. Crear CSV de prueba
console.log('\n2️⃣ CREANDO CSV DE PRUEBA:');

const csvContent = `nombre,rut,curso,seccion,asignatura,fecha,tipo,nota,profesor
Juan Pérez,12345678-9,4to Básico,A,Matemáticas,2025-10-09,prueba,85,María López
Ana González,98765432-1,4to Básico,A,Matemáticas,2025-10-09,prueba,92,María López
Carlos Silva,11111111-1,4to Básico,A,Ciencias Naturales,2025-10-09,tarea,78,Pedro Ramirez
María Torres,22222222-2,4to Básico,A,Lenguaje,2025-10-09,evaluacion,95,Sofía Martinez`;

console.log('✅ CSV de prueba creado');
console.log('📄 Contenido del CSV:');
console.log(csvContent);

// 3. Función para simular carga de archivo
window.testUploadGrades = function() {
    console.log('\n3️⃣ SIMULANDO CARGA DE ARCHIVO...');
    
    // Crear blob con el CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'test-grades.csv', { type: 'text/csv' });
    
    // Buscar el input de archivo
    const fileInput = document.getElementById('sql-grades-file');
    if (!fileInput) {
        console.error('❌ No se encontró el input de archivo SQL');
        return;
    }
    
    console.log('✅ Input de archivo encontrado');
    
    // Crear evento de cambio
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    
    // Disparar evento
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
    
    console.log('✅ Evento de carga disparado');
    console.log('⏳ Observa la consola para logs de procesamiento...');
};

// 4. Función para verificar datos después de la carga
window.verifyUploadResult = async function() {
    console.log('\n4️⃣ VERIFICANDO RESULTADO DE LA CARGA...');
    
    try {
        // Importar módulos SQL
        const { sqlDatabase } = await import('/src/lib/sql-database.ts');
        
        // Contar registros
        const totalCount = await sqlDatabase.countAllGrades();
        console.log('📊 Total de calificaciones:', totalCount.total);
        
        const yearCount = await sqlDatabase.countGradesByYear(2025);
        console.log('📊 Calificaciones 2025:', yearCount.count);
        
        // Obtener muestra
        const sample = await sqlDatabase.getGradesByYear(2025);
        console.log('📋 Muestra de registros:', sample.slice(0, 3));
        
        return { totalCount, yearCount, sample: sample.slice(0, 3) };
        
    } catch (error) {
        console.error('❌ Error verificando resultado:', error);
        return null;
    }
};

// 5. Función para limpiar datos de prueba
window.cleanTestData = async function() {
    console.log('\n5️⃣ LIMPIANDO DATOS DE PRUEBA...');
    
    try {
        const { sqlDatabase } = await import('/src/lib/sql-database.ts');
        
        // Obtener registros del año actual
        const grades = await sqlDatabase.getGradesByYear(2025);
        const testGrades = grades.filter(g => 
            g.studentName.includes('Juan Pérez') || 
            g.studentName.includes('Ana González') ||
            g.studentName.includes('Carlos Silva') ||
            g.studentName.includes('María Torres')
        );
        
        console.log(`🗑️ Encontrados ${testGrades.length} registros de prueba para eliminar`);
        
        if (testGrades.length > 0) {
            // Eliminar usando la función de borrado por año (solo los de prueba)
            const result = await sqlDatabase.deleteGradesByYear(2025);
            console.log('✅ Datos de prueba eliminados:', result);
        }
        
    } catch (error) {
        console.error('❌ Error limpiando datos:', error);
    }
};

// 6. Función completa de prueba
window.runFullTest = async function() {
    console.log('\n🚀 EJECUTANDO PRUEBA COMPLETA...');
    
    // Paso 1: Verificar estado inicial
    const initialResult = await verifyUploadResult();
    console.log('📊 Estado inicial:', initialResult);
    
    // Paso 2: Cargar datos de prueba
    testUploadGrades();
    
    // Paso 3: Esperar y verificar
    setTimeout(async () => {
        console.log('\n⏰ Verificando después de 5 segundos...');
        const finalResult = await verifyUploadResult();
        console.log('📊 Estado final:', finalResult);
        
        // Comparar resultados
        if (initialResult && finalResult) {
            const newRecords = finalResult.totalCount.total - initialResult.totalCount.total;
            console.log(`📈 Nuevos registros agregados: ${newRecords}`);
            
            if (newRecords > 0) {
                console.log('✅ PRUEBA EXITOSA: Se agregaron registros');
            } else {
                console.log('❌ PRUEBA FALLIDA: No se agregaron registros');
            }
        }
    }, 5000);
};

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('📁 testUploadGrades() - Simular carga de archivo');
console.log('🔍 verifyUploadResult() - Verificar resultado');
console.log('🗑️ cleanTestData() - Limpiar datos de prueba');
console.log('🚀 runFullTest() - Ejecutar prueba completa');

console.log('\n🎯 PARA PROBAR:');
console.log('1. Ejecuta: runFullTest()');
console.log('2. Observa los logs en la consola');
console.log('3. Si hay errores, revisa los detalles');

console.log('\n✅ Script de prueba listo');
console.log('=' .repeat(60));