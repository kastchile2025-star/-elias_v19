// Diagnóstico específico para encontrar las notas 80 y 55
console.log('🔍 DIAGNÓSTICO ESPECÍFICO: Buscando notas 80 y 55...\n');

function buscarNotasEspecificas() {
    console.log('📊 Buscando notas específicas (80 y 55) en toda la aplicación...\n');
    
    // Buscar en todas las claves del localStorage
    const resultados = [];
    const notasObjetivo = [80, 55, 8.0, 5.5, '80', '55', '8.0', '5.5'];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        try {
            const value = localStorage.getItem(key);
            if (!value) continue;
            
            const data = JSON.parse(value);
            
            // Buscar en arrays
            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    buscarNotasEnObjeto(item, `${key}[${index}]`, resultados, notasObjetivo);
                });
            } else if (typeof data === 'object' && data !== null) {
                buscarNotasEnObjeto(data, key, resultados, notasObjetivo);
            }
            
        } catch (e) {
            // Ignorar claves que no son JSON
        }
    }
    
    // Mostrar resultados
    console.log(`🎯 Encontradas ${resultados.length} referencias a las notas buscadas:`);
    resultados.forEach(resultado => {
        console.log(`  📍 ${resultado.ubicacion}: ${resultado.campo} = ${resultado.valor}`);
        if (resultado.contexto) {
            console.log(`    📝 Contexto: ${JSON.stringify(resultado.contexto, null, 2).substring(0, 200)}...`);
        }
    });
    
    return resultados;
}

function buscarNotasEnObjeto(obj, ubicacion, resultados, notasObjetivo, profundidad = 0) {
    if (profundidad > 5) return; // Evitar recursión infinita
    
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.entries(obj).forEach(([key, value]) => {
        // Verificar si el valor es una de las notas que buscamos
        if (notasObjetivo.includes(value)) {
            resultados.push({
                ubicacion: `${ubicacion}.${key}`,
                campo: key,
                valor: value,
                contexto: obj
            });
        }
        
        // Buscar en objetos anidados
        if (typeof value === 'object' && value !== null) {
            buscarNotasEnObjeto(value, `${ubicacion}.${key}`, resultados, notasObjetivo, profundidad + 1);
        }
        
        // Buscar en arrays
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (notasObjetivo.includes(item)) {
                    resultados.push({
                        ubicacion: `${ubicacion}.${key}[${index}]`,
                        campo: `${key}[${index}]`,
                        valor: item,
                        contexto: obj
                    });
                }
                if (typeof item === 'object' && item !== null) {
                    buscarNotasEnObjeto(item, `${ubicacion}.${key}[${index}]`, resultados, notasObjetivo, profundidad + 1);
                }
            });
        }
    });
}

function analizarDatosRevisar() {
    console.log('\n🔍 ANÁLISIS: Datos de la vista "revisar" del profesor...\n');
    
    // Buscar todas las claves relacionadas con evaluaciones y pruebas
    const claves = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.includes('test') || 
            key.includes('evaluation') || 
            key.includes('prueba') || 
            key.includes('review') ||
            key.includes('result') ||
            key.includes('response') ||
            key.includes('submission')
        )) {
            claves.push(key);
        }
    }
    
    console.log(`🔑 Claves relevantes encontradas: ${claves.length}`);
    claves.forEach(key => console.log(`  • ${key}`));
    
    // Analizar cada clave
    claves.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            console.log(`\n📋 Analizando: ${key}`);
            
            if (Array.isArray(data)) {
                console.log(`  📊 Array con ${data.length} elementos`);
                data.forEach((item, index) => {
                    if (item && typeof item === 'object') {
                        console.log(`    [${index}] ${item.title || item.name || 'Sin título'}`);
                        
                        // Buscar campos que podrían contener notas
                        ['score', 'grade', 'nota', 'points', 'result', 'percentage', 'responses', 'answers', 'submissions'].forEach(campo => {
                            if (item[campo] !== undefined) {
                                console.log(`      ${campo}: ${JSON.stringify(item[campo]).substring(0, 100)}`);
                            }
                        });
                    }
                });
            } else if (data && typeof data === 'object') {
                console.log(`  📊 Objeto con campos:`, Object.keys(data));
                
                // Si es un objeto con usuarios/estudiantes
                Object.entries(data).forEach(([userKey, userData]) => {
                    if (userData && typeof userData === 'object') {
                        console.log(`    👤 ${userKey}:`, userData);
                    }
                });
            }
            
        } catch (e) {
            console.warn(`  ⚠️ Error procesando ${key}:`, e.message);
        }
    });
}

function buscarEnUserTasks() {
    console.log('\n🔍 ANÁLISIS: userTasks específicos de estudiantes...\n');
    
    // Buscar claves userTasks_*
    const userTaskKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('userTasks_')) {
            userTaskKeys.push(key);
        }
    }
    
    console.log(`👥 userTasks encontrados: ${userTaskKeys.length}`);
    
    userTaskKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            const username = key.replace('userTasks_', '');
            
            console.log(`\n👤 Usuario: ${username}`);
            console.log(`  📝 Tareas: ${data.length}`);
            
            data.forEach((task, index) => {
                if (task && (task.score || task.result || task.grade || task.nota)) {
                    console.log(`    [${index}] ${task.title || 'Sin título'}`);
                    console.log(`      🎯 Score: ${task.score}`);
                    console.log(`      📊 Result: ${JSON.stringify(task.result || task.grade || task.nota)}`);
                    
                    // Buscar específicamente 80 y 55
                    const valores = [task.score, task.result, task.grade, task.nota].filter(v => v !== undefined);
                    if (valores.some(v => v === 80 || v === 55 || v === 8.0 || v === 5.5)) {
                        console.log(`      🎯 ¡ENCONTRADA NOTA OBJETIVO!`);
                    }
                }
            });
            
        } catch (e) {
            console.warn(`  ⚠️ Error procesando ${key}:`, e.message);
        }
    });
}

// Ejecutar diagnósticos
buscarNotasEspecificas();
analizarDatosRevisar();
buscarEnUserTasks();

console.log('\n✅ DIAGNÓSTICO COMPLETADO');
console.log('💡 Revisa los resultados arriba para localizar exactamente dónde están las notas 80 y 55');

// Función para ejecutar manualmente
window.diagnosticarNotas = function() {
    buscarNotasEspecificas();
    analizarDatosRevisar(); 
    buscarEnUserTasks();
};
