console.log('🔧 HERRAMIENTAS DE REPARACIÓN DE USUARIOS - SMART STUDENT');
console.log('=======================================================');

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

// Función para reparar usuarios con problemas
window.repararUsuarios = function() {
    console.log('🔧 REPARANDO USUARIOS...');
    console.log('========================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    if (users.length === 0) {
        console.log('❌ No hay usuarios para reparar');
        return;
    }
    
    let usuariosReparados = 0;
    
    const usersReparados = users.map((user, index) => {
        let usuarioReparado = false;
        
        // Asegurar campos básicos
        if (!user.id) {
            user.id = `user_${Date.now()}_${index}`;
            usuarioReparado = true;
        }
        
        if (!user.username || user.username === '') {
            user.username = `usuario${index + 1}`;
            usuarioReparado = true;
        }
        
        if (!user.password || user.password === '') {
            user.password = '1234';
            usuarioReparado = true;
        }
        
        if (!user.displayName || user.displayName === '') {
            user.displayName = user.name || user.username || `Usuario ${index + 1}`;
            usuarioReparado = true;
        }
        
        if (!user.email || user.email === '') {
            user.email = `${user.username}@example.com`;
            usuarioReparado = true;
        }
        
        if (!Array.isArray(user.activeCourses)) {
            user.activeCourses = [];
            usuarioReparado = true;
        }
        
        if (!user.role || user.role === '') {
            user.role = 'student';
            usuarioReparado = true;
        }
        
        // Campos adicionales para compatibilidad
        if (!user.createdAt) {
            user.createdAt = new Date().toISOString();
            usuarioReparado = true;
        }
        
        if (!user.updatedAt) {
            user.updatedAt = new Date().toISOString();
            usuarioReparado = true;
        }
        
        if (usuarioReparado) {
            usuariosReparados++;
            console.log(`🔧 Reparado: ${user.username} (${user.role})`);
        }
        
        return user;
    });
    
    // Guardar usuarios reparados
    localStorage.setItem('smart-student-users', JSON.stringify(usersReparados));
    
    console.log(`\n✅ Proceso completado:`);
    console.log(`   🔧 Usuarios reparados: ${usuariosReparados}`);
    console.log(`   📊 Total de usuarios: ${users.length}`);
    
    if (usuariosReparados > 0) {
        console.log('\n💡 Ejecuta probarLoginTodos() para verificar que todos puedan hacer login');
    }
    
    return { reparados: usuariosReparados, total: users.length };
};

// Función para probar login de todos los usuarios
window.probarLoginTodos = function() {
    console.log('🧪 PROBANDO LOGIN DE TODOS LOS USUARIOS');
    console.log('=======================================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    if (users.length === 0) {
        console.log('❌ No hay usuarios para probar');
        return;
    }
    
    let loginExitosos = 0;
    let loginFallidos = 0;
    
    users.forEach((user, index) => {
        const camposRequeridos = ['id', 'username', 'password', 'role', 'displayName', 'activeCourses', 'email'];
        const tieneTodasLasPropiedades = camposRequeridos.every(campo => {
            if (campo === 'activeCourses') {
                return Array.isArray(user[campo]);
            }
            return user[campo] && user[campo] !== '';
        });
        
        if (tieneTodasLasPropiedades) {
            loginExitosos++;
            console.log(`✅ ${user.username} (${user.role}) - LOGIN OK`);
        } else {
            loginFallidos++;
            console.log(`❌ ${user.username} (${user.role}) - LOGIN FALLÓ`);
        }
    });
    
    console.log(`\n📊 RESULTADOS DE PRUEBA:`);
    console.log(`   ✅ Logins exitosos: ${loginExitosos}`);
    console.log(`   ❌ Logins fallidos: ${loginFallidos}`);
    console.log(`   📊 Total usuarios: ${users.length}`);
    
    if (loginFallidos > 0) {
        console.log('\n💡 Ejecuta repararUsuarios() para corregir los usuarios con fallas');
    }
    
    return { exitosos: loginExitosos, fallidos: loginFallidos, total: users.length };
};

// Función para limpiar todos los usuarios (usar con cuidado)
window.limpiarTodosLosUsuarios = function() {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los usuarios? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('smart-student-users');
        console.log('🗑️ Todos los usuarios han sido eliminados');
        return true;
    }
    console.log('❌ Operación cancelada');
    return false;
};

// Función para mostrar información detallada de un usuario
window.verUsuario = function(username) {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const user = users.find(u => u.username === username);
    
    if (!user) {
        console.log(`❌ Usuario "${username}" no encontrado`);
        return null;
    }
    
    console.log(`👤 INFORMACIÓN DE USUARIO: ${username}`);
    console.log('================================');
    console.table(user);
    
    return user;
};

console.log('✅ Herramientas cargadas exitosamente!');
console.log('\n📖 COMANDOS DISPONIBLES:');
console.log('   diagnosticarUsuarios() - Diagnostica problemas en usuarios');
console.log('   repararUsuarios() - Repara usuarios con campos faltantes');
console.log('   probarLoginTodos() - Prueba login de todos los usuarios');
console.log('   verUsuario("username") - Muestra información de un usuario');
console.log('   limpiarTodosLosUsuarios() - Elimina todos los usuarios');
console.log('\n🚀 ¡Listo para usar!');
