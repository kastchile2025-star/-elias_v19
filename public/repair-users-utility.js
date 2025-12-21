// ✅ UTILIDAD PARA REPARAR USUARIOS - Smart Student
console.log('🔧 UTILIDAD DE REPARACIÓN DE USUARIOS CARGADA');

// Función para diagnosticar usuarios
window.diagnosticarUsuarios = function() {
    console.log('\n🔍 DIAGNÓSTICO DE USUARIOS');
    console.log('===============================');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        
        if (users.length === 0) {
            console.log('❌ No se encontraron usuarios en el sistema');
            return { total: 0, problemas: 0, usuarios: [] };
        }
        
        console.log(`📊 Total de usuarios: ${users.length}`);
        
        const camposRequeridos = ['id', 'username', 'role', 'displayName', 'activeCourses', 'password', 'email'];
        let usuariosConProblemas = 0;
        const detallesUsuarios = [];
        
        users.forEach((user, index) => {
            const problemas = [];
            
            // Verificar campos requeridos
            camposRequeridos.forEach(campo => {
                if (!user[campo]) {
                    problemas.push(`Falta ${campo}`);
                } else if (campo === 'activeCourses' && !Array.isArray(user[campo])) {
                    problemas.push(`${campo} no es un array`);
                } else if (campo === 'username' && typeof user[campo] !== 'string') {
                    problemas.push(`${campo} no es string`);
                }
            });
            
            const tieneProblemas = problemas.length > 0;
            if (tieneProblemas) usuariosConProblemas++;
            
            const detalle = {
                index: index + 1,
                username: user.username || 'SIN_USERNAME',
                role: user.role || 'SIN_ROLE',
                tieneProblemas,
                problemas,
                puedeLogin: !tieneProblemas
            };
            
            detallesUsuarios.push(detalle);
            
            if (tieneProblemas) {
                console.log(`❌ Usuario ${index + 1}: ${user.username || 'SIN_USERNAME'}`);
                console.log(`   Problemas: ${problemas.join(', ')}`);
            } else {
                console.log(`✅ Usuario ${index + 1}: ${user.username} (${user.role}) - OK`);
            }
        });
        
        console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:');
        console.log(`   ✅ Usuarios sin problemas: ${users.length - usuariosConProblemas}`);
        console.log(`   ❌ Usuarios con problemas: ${usuariosConProblemas}`);
        console.log(`   📊 Total usuarios: ${users.length}`);
        
        if (usuariosConProblemas > 0) {
            console.log('\n💡 EJECUTA repararUsuarios() PARA CORREGIR LOS PROBLEMAS');
        }
        
        return {
            total: users.length,
            problemas: usuariosConProblemas,
            usuarios: detallesUsuarios
        };
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
        return { total: 0, problemas: 0, usuarios: [], error: error.message };
    }
};

// Función para reparar usuarios automáticamente
window.repararUsuarios = function() {
    console.log('\n🔧 REPARACIÓN AUTOMÁTICA DE USUARIOS');
    console.log('====================================');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios para reparar');
            return { reparados: 0, total: 0 };
        }
        
        let contadorReparados = 0;
        
        const usuariosReparados = users.map((user, index) => {
            const userOriginal = { ...user };
            let necesitaReparacion = false;
            
            // Reparar ID
            if (!user.id) {
                user.id = crypto.randomUUID();
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Agregado ID a ${user.username || 'usuario'}`);
            }
            
            // Reparar username
            if (!user.username || user.username.trim() === '') {
                user.username = 'user_' + Math.random().toString(36).substr(2, 8);
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Generado username: ${user.username}`);
            }
            
            // Reparar displayName
            if (!user.displayName) {
                user.displayName = user.name || 'Usuario Sin Nombre';
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Agregado displayName: ${user.displayName}`);
            }
            
            // Reparar password
            if (!user.password) {
                user.password = '1234';
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Asignada password por defecto a ${user.username}`);
            }
            
            // Reparar role
            if (!user.role) {
                user.role = 'student';
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Asignado role por defecto: ${user.role}`);
            }
            
            // Reparar activeCourses
            if (!Array.isArray(user.activeCourses)) {
                user.activeCourses = user.role === 'admin' ? [] : ['4to Básico'];
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Reparado activeCourses: ${JSON.stringify(user.activeCourses)}`);
            }
            
            // Reparar email
            if (!user.email) {
                user.email = `${user.username}@example.com`;
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Generado email: ${user.email}`);
            }
            
            // Reparar isActive
            if (user.isActive === undefined || user.isActive === null) {
                user.isActive = true;
                necesitaReparacion = true;
                console.log(`🔧 ${index + 1}. Activado usuario: ${user.username}`);
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
        
    } catch (error) {
        console.error('❌ Error en reparación:', error);
        return { reparados: 0, total: 0, error: error.message };
    }
};

// Función para probar login de todos los usuarios
window.probarLoginTodos = function() {
    console.log('\n🧪 PRUEBA DE LOGIN DE TODOS LOS USUARIOS');
    console.log('==========================================');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios para probar');
            return { exitosos: 0, fallidos: 0, total: 0 };
        }
        
        let exitosos = 0;
        let fallidos = 0;
        
        users.forEach((user, index) => {
            const puedeLogin = user.id && user.username && user.password && 
                             user.role && user.displayName && Array.isArray(user.activeCourses);
            
            if (puedeLogin) {
                exitosos++;
                console.log(`✅ ${index + 1}. ${user.username} (${user.role}) - Puede hacer login`);
            } else {
                fallidos++;
                console.log(`❌ ${index + 1}. ${user.username} - NO puede hacer login`);
            }
        });
        
        console.log('\n📊 RESULTADOS DE PRUEBA:');
        console.log(`   ✅ Logins exitosos: ${exitosos}`);
        console.log(`   ❌ Logins fallidos: ${fallidos}`);
        console.log(`   📊 Total usuarios: ${users.length}`);
        
        return { exitosos, fallidos, total: users.length };
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
        return { exitosos: 0, fallidos: 0, total: 0, error: error.message };
    }
};

// Función para limpiar todos los usuarios (PELIGROSO - usar con cuidado)
window.limpiarTodosLosUsuarios = function() {
    if (confirm('⚠️ ¿Estás seguro de que quieres ELIMINAR TODOS LOS USUARIOS? Esta acción no se puede deshacer.')) {
        localStorage.setItem('smart-student-users', '[]');
        localStorage.setItem('smart-student-students', '[]');
        localStorage.setItem('smart-student-teachers', '[]');
        localStorage.setItem('smart-student-administrators', '[]');
        
        console.log('🗑️ Todos los usuarios han sido eliminados');
        console.log('🔄 El sistema está limpio');
        
        return true;
    }
    return false;
};

// Mostrar ayuda
console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('========================');
console.log('📊 diagnosticarUsuarios() - Analiza problemas en usuarios');
console.log('🔧 repararUsuarios() - Repara automáticamente usuarios con problemas');
console.log('🧪 probarLoginTodos() - Prueba si todos los usuarios pueden hacer login');
console.log('🗑️ limpiarTodosLosUsuarios() - ELIMINA todos los usuarios (PELIGROSO)');
console.log('\n🚀 EJECUTA diagnosticarUsuarios() PARA EMPEZAR');
