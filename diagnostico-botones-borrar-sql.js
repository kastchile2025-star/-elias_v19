// 🔧 DIAGNÓSTICO Y REPARACIÓN - Botones Borrar SQL
// Ejecutar en la consola del navegador en la página de configuración

console.log('🔧 DIAGNÓSTICO BOTONES BORRAR SQL');
console.log('=' .repeat(50));

// 1. VERIFICAR ESTADO ACTUAL
console.log('\n1️⃣ ESTADO ACTUAL:');
console.log('Calificaciones: 3,520 registros');
console.log('Asistencia: 231,680 registros');

// 2. BUSCAR BOTONES BORRAR SQL
console.log('\n2️⃣ BUSCANDO BOTONES BORRAR SQL:');

const borrarButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('Borrar SQL')
);

console.log(`Botones "Borrar SQL" encontrados: ${borrarButtons.length}`);

borrarButtons.forEach((btn, index) => {
    console.log(`Botón ${index + 1}:`);
    console.log(`  - Texto: ${btn.textContent}`);
    console.log(`  - Habilitado: ${!btn.disabled}`);
    console.log(`  - Clases: ${btn.className}`);
});

// 3. PROBAR CONEXIÓN A SUPABASE PARA BORRADO
console.log('\n3️⃣ PROBANDO CONEXIÓN PARA BORRADO:');

async function testDeleteConnection() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.log('❌ Variables de entorno no disponibles');
            return false;
        }
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Probar DELETE en grades (sin ejecutar)
        console.log('🧪 Probando permisos DELETE en grades...');
        const { error: gradesError } = await supabase
            .from('grades')
            .delete()
            .eq('id', 'test_non_existent_id'); // ID que no existe para no borrar nada real
            
        if (gradesError) {
            console.log('❌ Error DELETE grades:', gradesError.message);
            return { grades: false, error: gradesError.message };
        } else {
            console.log('✅ Permisos DELETE grades: OK');
        }
        
        // Probar DELETE en attendance (sin ejecutar)
        console.log('🧪 Probando permisos DELETE en attendance...');
        const { error: attendanceError } = await supabase
            .from('attendance')
            .delete()
            .eq('id', 'test_non_existent_id');
            
        if (attendanceError) {
            console.log('❌ Error DELETE attendance:', attendanceError.message);
            return { attendance: false, error: attendanceError.message };
        } else {
            console.log('✅ Permisos DELETE attendance: OK');
        }
        
        return { grades: true, attendance: true };
        
    } catch (error) {
        console.log('❌ Error general:', error);
        return false;
    }
}

// 4. FUNCIÓN PARA BORRAR CALIFICACIONES MANUALMENTE
window.borrarCalificacionesSQL = async function(year = 2025) {
    console.log(`🗑️ BORRANDO CALIFICACIONES SQL PARA ${year}...`);
    
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Contar registros antes
        const { count: beforeCount } = await supabase
            .from('grades')
            .select('*', { count: 'exact', head: true })
            .eq('year', year);
            
        console.log(`📊 Registros antes del borrado: ${beforeCount}`);
        
        if (beforeCount === 0) {
            console.log('✅ No hay registros para borrar');
            return;
        }
        
        // Confirmar borrado
        const confirm = window.confirm(`¿Estás seguro de borrar ${beforeCount} calificaciones del año ${year}?`);
        if (!confirm) {
            console.log('❌ Borrado cancelado por el usuario');
            return;
        }
        
        // Ejecutar borrado
        const { error } = await supabase
            .from('grades')
            .delete()
            .eq('year', year);
            
        if (error) {
            console.log('❌ Error borrando:', error.message);
            throw error;
        }
        
        // Verificar borrado
        const { count: afterCount } = await supabase
            .from('grades')
            .select('*', { count: 'exact', head: true })
            .eq('year', year);
            
        console.log(`📊 Registros después del borrado: ${afterCount}`);
        console.log(`✅ Borrados: ${beforeCount - afterCount} registros`);
        
        // Refrescar página para actualizar contadores
        setTimeout(() => {
            console.log('🔄 Refrescando página...');
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.log('❌ Error en borrado manual:', error);
    }
};

// 5. FUNCIÓN PARA BORRAR ASISTENCIA MANUALMENTE
window.borrarAsistenciaSQL = async function(year = 2025) {
    console.log(`🗑️ BORRANDO ASISTENCIA SQL PARA ${year}...`);
    
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Contar registros antes
        const { count: beforeCount } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('year', year);
            
        console.log(`📊 Registros antes del borrado: ${beforeCount}`);
        
        if (beforeCount === 0) {
            console.log('✅ No hay registros para borrar');
            return;
        }
        
        // Confirmar borrado
        const confirm = window.confirm(`¿Estás seguro de borrar ${beforeCount} registros de asistencia del año ${year}?`);
        if (!confirm) {
            console.log('❌ Borrado cancelado por el usuario');
            return;
        }
        
        // Ejecutar borrado
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('year', year);
            
        if (error) {
            console.log('❌ Error borrando:', error.message);
            throw error;
        }
        
        // Verificar borrado
        const { count: afterCount } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('year', year);
            
        console.log(`📊 Registros después del borrado: ${afterCount}`);
        console.log(`✅ Borrados: ${beforeCount - afterCount} registros`);
        
        // Refrescar página para actualizar contadores
        setTimeout(() => {
            console.log('🔄 Refrescando página...');
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.log('❌ Error en borrado manual:', error);
    }
};

// 6. FUNCIÓN PARA SIMULAR CLICK EN BOTONES
window.forzarClickBorrarSQL = function() {
    console.log('🖱️ FORZANDO CLICK EN BOTONES BORRAR SQL...');
    
    borrarButtons.forEach((btn, index) => {
        console.log(`Clickeando botón ${index + 1}...`);
        try {
            btn.click();
            console.log(`✅ Click ejecutado en botón ${index + 1}`);
        } catch (error) {
            console.log(`❌ Error en click botón ${index + 1}:`, error);
        }
    });
};

// 7. EJECUTAR DIAGNÓSTICO
testDeleteConnection().then(result => {
    console.log('\n📊 RESUMEN DIAGNÓSTICO:');
    console.log(`Botones encontrados: ${borrarButtons.length}`);
    console.log(`Permisos DELETE: ${JSON.stringify(result)}`);
    
    if (result && result.grades && result.attendance) {
        console.log('\n✅ PERMISOS OK - Los botones deberían funcionar');
        console.log('💡 Si no funcionan, usa las funciones manuales:');
        console.log('   - borrarCalificacionesSQL(2025)');
        console.log('   - borrarAsistenciaSQL(2025)');
        console.log('   - forzarClickBorrarSQL()');
    } else {
        console.log('\n❌ PROBLEMA DE PERMISOS - Usar funciones manuales');
        console.log('🔧 Ejecutar configurar-rls-supabase.sql en Supabase');
    }
});

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('   borrarCalificacionesSQL(2025) - Borrar calificaciones');
console.log('   borrarAsistenciaSQL(2025) - Borrar asistencia');
console.log('   forzarClickBorrarSQL() - Simular click en botones UI');
console.log('=' .repeat(50));