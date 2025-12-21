// Cargar herramientas de reparación de usuarios en la consola
console.log('🔧 Cargando herramientas de reparación de usuarios...');

// Función principal para diagnosticar usuarios
window.diagnosticarUsuarios = function() {
    console.log('🔍 DIAGNÓSTICO DE USUARIOS - SMART STUDENT');
    console.log('==========================================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    if (users.length === 0) {
        console.log('❌ No hay usuarios en el sistema');
        return { problemas: 0, total: 0 };
    }
    
    console.log(`📊 Total de usuarios: ${users.length}`);
    
    const camposRequeridos = ['id', 'username', 'password', 'role', 'displayName', 'activeCourses', 'email'];
    let problemasEncontrados = 0;
    
    users.forEach((user, index) => {
        const camposFaltantes = camposRequeridos.filter(campo => {
            if (campo === 'activeCourses') {
                return !Array.isArray(user[campo]);
            }
            return !user[campo] || user[campo] === '';
        });
        
        if (camposFaltantes.length > 0) {
            problemasEncontrados++;
            console.log(`❌ Usuario ${index + 1}: ${user.username || 'SIN_USERNAME'}`);
            console.log(`   Campos faltantes: ${camposFaltantes.join(', ')}`);
        } else {
            console.log(`✅ Usuario ${index + 1}: ${user.username} (${user.role}) - OK`);
        }
    });
    
    console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:');
    console.log(`   ✅ Usuarios correctos: ${users.length - problemasEncontrados}`);
    console.log(`   ❌ Usuarios con problemas: ${problemasEncontrados}`);
    
    if (problemasEncontrados > 0) {
        console.log('\n💡 Ejecuta repararUsuarios() para corregir los problemas');
    } else {
        console.log('\n🎉 ¡Todos los usuarios están correctos!');
    }
    
    return { problemas: problemasEncontrados, total: users.length };
};

// Función para reparar usuarios automáticamente
window.repararUsuarios = function() {
    console.log('🔧 REPARANDO USUARIOS DEL SISTEMA');
    console.log('==================================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    if (users.length === 0) {
        console.log('❌ No hay usuarios para reparar');
        return { reparados: 0, total: 0 };
    }
    
    let contadorReparados = 0;
    
    const usuariosReparados = users.map((user, index) => {
        const usuarioOriginal = { ...user };
        let necesitaReparacion = false;
        
        // Reparar ID
        if (!user.id) {
            user.id = crypto.randomUUID();
            necesitaReparacion = true;
        }
        
        // Reparar username
        if (!user.username || user.username.trim() === '') {
            user.username = 'user_' + Math.random().toString(36).substr(2, 8);
            necesitaReparacion = true;
        }
        
        // Reparar password
        if (!user.password) {
            user.password = '1234';
            necesitaReparacion = true;
        }
        
        // Reparar role
        if (!user.role) {
            user.role = 'student';
            necesitaReparacion = true;
        }
        
        // Reparar displayName
        if (!user.displayName) {
            user.displayName = user.name || 'Usuario Sin Nombre';
            necesitaReparacion = true;
        }
        
        // Reparar activeCourses
        if (!Array.isArray(user.activeCourses)) {
            user.activeCourses = user.role === 'admin' ? [] : ['4to Básico'];
            necesitaReparacion = true;
        }
        
        // Reparar email
        if (!user.email) {
            user.email = `${user.username}@example.com`;
            necesitaReparacion = true;
        }
        
        // Reparar isActive
        if (user.isActive === undefined || user.isActive === null) {
            user.isActive = true;
            necesitaReparacion = true;
        }
        
        // Reparar fechas
        if (!user.createdAt) {
            user.createdAt = new Date().toISOString();
            necesitaReparacion = true;
        }
        
        if (!user.updatedAt) {
            user.updatedAt = new Date().toISOString();
            necesitaReparacion = true;
        }
        
        if (necesitaReparacion) {
            contadorReparados++;
            console.log(`🔧 Usuario ${index + 1} reparado: ${user.username}`);
        }
        
        return user;
    });
    
    // Guardar usuarios reparados
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosReparados));
    
    console.log('\n✅ REPARACIÓN COMPLETADA');
    console.log(`   🔧 Usuarios reparados: ${contadorReparados}`);
    console.log(`   📊 Total usuarios: ${users.length}`);
    console.log('\n💡 Ahora todos los usuarios deberían poder hacer login');
    
    return {
        reparados: contadorReparados,
        total: users.length,
        usuarios: usuariosReparados
    };
};

// Función para probar login de todos los usuarios
window.probarLoginTodos = function() {
    console.log('🧪 PROBANDO LOGIN DE TODOS LOS USUARIOS');
    console.log('=======================================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    if (users.length === 0) {
        console.log('❌ No hay usuarios para probar');
        return { exitosos: 0, fallidos: 0, total: 0 };
    }
    
    let exitosos = 0;
    let fallidos = 0;
    
    console.log('🔐 Probando acceso de cada usuario...\n');
    
    users.forEach((user, index) => {
        const camposRequeridos = ['id', 'username', 'password', 'role', 'displayName', 'activeCourses', 'email'];
        const camposFaltantes = camposRequeridos.filter(campo => {
            if (campo === 'activeCourses') {
                return !Array.isArray(user[campo]);
            }
            return !user[campo] || user[campo] === '';
        });
        
        if (camposFaltantes.length === 0) {
            exitosos++;
            console.log(`✅ ${user.username} (${user.role}) - Puede hacer login`);
        } else {
            fallidos++;
            console.log(`❌ ${user.username} (${user.role}) - NO puede hacer login`);
            console.log(`   Problemas: ${camposFaltantes.join(', ')}`);
        }
    });
    
    console.log('\n📊 RESULTADOS DEL TEST:');
    console.log(`   ✅ Pueden hacer login: ${exitosos}`);
    console.log(`   ❌ NO pueden hacer login: ${fallidos}`);
    console.log(`   📈 Tasa de éxito: ${((exitosos / users.length) * 100).toFixed(1)}%`);
    
    if (fallidos > 0) {
        console.log('\n💡 Ejecuta repararUsuarios() para corregir los problemas');
    } else {
        console.log('\n🎉 ¡Todos los usuarios pueden hacer login correctamente!');
    }
    
    return { exitosos, fallidos, total: users.length };
};

// Función de emergencia para limpiar todo
window.limpiarTodosLosUsuarios = function() {
    if (confirm('⚠️ PELIGRO: ¿Estás seguro de que quieres eliminar TODOS los usuarios?\n\nEsta acción NO se puede deshacer.')) {
        localStorage.setItem('smart-student-users', '[]');
        localStorage.setItem('smart-student-students', '[]');
        localStorage.setItem('smart-student-teachers', '[]');
        localStorage.setItem('smart-student-administrators', '[]');
        
        console.log('🗑️ TODOS LOS USUARIOS HAN SIDO ELIMINADOS');
        console.log('   El sistema está ahora completamente limpio');
        return true;
    }
    return false;
};

// Función para validar datos antes de exportar
window.validarDatosParaExportar = function() {
    console.log('🔍 VALIDANDO DATOS PARA EXPORTACIÓN');
    console.log('=====================================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const camposRequeridos = ['id', 'username', 'password', 'role', 'displayName', 'activeCourses', 'email'];
    
    console.log(`📊 Total usuarios a exportar: ${users.length}`);
    
    let usuariosConProblemas = 0;
    let camposProblematicos = new Set();
    
    users.forEach((user, index) => {
        const camposFaltantes = camposRequeridos.filter(campo => {
            if (campo === 'activeCourses') {
                return !Array.isArray(user[campo]);
            }
            return !user[campo] || user[campo] === '';
        });
        
        if (camposFaltantes.length > 0) {
            usuariosConProblemas++;
            camposFaltantes.forEach(campo => camposProblematicos.add(campo));
            console.log(`❌ Usuario ${index + 1}: ${user.username || 'SIN_USERNAME'} - Faltan: ${camposFaltantes.join(', ')}`);
        } else {
            console.log(`✅ Usuario ${index + 1}: ${user.username} (${user.role}) - Listo para exportar`);
        }
    });
    
    console.log('\n📋 RESUMEN DE VALIDACIÓN:');
    console.log(`   ✅ Usuarios listos: ${users.length - usuariosConProblemas}`);
    console.log(`   ❌ Usuarios con problemas: ${usuariosConProblemas}`);
    
    if (usuariosConProblemas > 0) {
        console.log(`   🔧 Campos que necesitan reparación: ${Array.from(camposProblematicos).join(', ')}`);
        console.log('\n💡 RECOMENDACIÓN: Ejecuta repararUsuarios() antes de exportar');
        return false;
    } else {
        console.log('\n🎉 ¡Todos los usuarios están listos para exportar!');
        console.log('✅ La exportación incluirá todos los campos necesarios para login');
        return true;
    }
};

console.log('✅ Herramientas de reparación cargadas exitosamente!');
console.log('\n🛠️ FUNCIONES DISPONIBLES:');
console.log('📋 diagnosticarUsuarios() - Analiza problemas en usuarios');
console.log('🔧 repararUsuarios() - Corrige automáticamente problemas');
console.log('🧪 probarLoginTodos() - Verifica que todos puedan hacer login');
console.log('🔍 validarDatosParaExportar() - Valida usuarios antes de exportar');
console.log('🗑️ limpiarTodosLosUsuarios() - ELIMINA TODOS los usuarios (PELIGROSO)');
console.log('\n💡 Empieza ejecutando: diagnosticarUsuarios()');
