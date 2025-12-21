// Script para arreglar TODOS los usuarios de configuración
console.log('🔧 ARREGLANDO TODOS LOS USUARIOS DE CONFIGURACIÓN');

function arreglarTodosLosUsuarios() {
    // Obtener usuarios actuales
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    console.log(`📊 Total usuarios encontrados: ${users.length}`);
    
    let usuariosArreglados = 0;
    
    // Arreglar cada usuario
    const usuariosCorregidos = users.map(user => {
        let necesitaCorreccion = false;
        const usuarioCorregido = { ...user };
        
        // 1. Verificar campos obligatorios
        if (!user.displayName) {
            usuarioCorregido.displayName = user.name || user.username || 'Usuario';
            necesitaCorreccion = true;
        }
        
        if (!user.password) {
            usuarioCorregido.password = '1234'; // Password por defecto
            necesitaCorreccion = true;
        }
        
        if (!user.activeCourses || !Array.isArray(user.activeCourses)) {
            if (user.role === 'student') {
                usuarioCorregido.activeCourses = ['4to Básico'];
            } else if (user.role === 'teacher') {
                usuarioCorregido.activeCourses = ['4to Básico'];
            } else if (user.role === 'admin') {
                usuarioCorregido.activeCourses = [];
            } else {
                usuarioCorregido.activeCourses = [];
            }
            necesitaCorreccion = true;
        }
        
        if (!user.email) {
            usuarioCorregido.email = `${user.username}@${user.role}.com`;
            necesitaCorreccion = true;
        }
        
        // 2. Agregar datos específicos por rol si faltan
        if (user.role === 'student' && !user.assignedTeachers) {
            usuarioCorregido.assignedTeachers = {
                'Matemáticas': 'jorge',
                'Ciencias Naturales': 'carlos',
                'Lenguaje y Comunicación': 'jorge',
                'Historia, Geografía y Ciencias Sociales': 'carlos'
            };
            necesitaCorreccion = true;
        }
        
        if (user.role === 'teacher' && !user.teachingAssignments) {
            usuarioCorregido.teachingAssignments = [{
                teacherUsername: user.username,
                teacherName: user.displayName || user.name || user.username,
                subject: 'Matemáticas',
                courses: ['4to Básico']
            }];
            necesitaCorreccion = true;
        }
        
        // 3. Asegurar que el ID existe
        if (!user.id) {
            usuarioCorregido.id = user.username || crypto.randomUUID();
            necesitaCorreccion = true;
        }
        
        if (necesitaCorreccion) {
            usuariosArreglados++;
            console.log(`✅ Usuario arreglado: ${user.username} (${user.role})`);
        }
        
        return usuarioCorregido;
    });
    
    // Guardar usuarios corregidos
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosCorregidos));
    
    console.log(`🎉 Proceso completado:`);
    console.log(`   - Usuarios totales: ${usuariosCorregidos.length}`);
    console.log(`   - Usuarios arreglados: ${usuariosArreglados}`);
    console.log(`   - Sin cambios: ${usuariosCorregidos.length - usuariosArreglados}`);
    
    return {
        total: usuariosCorregidos.length,
        arreglados: usuariosArreglados,
        usuarios: usuariosCorregidos
    };
}

// Función para probar login de todos los usuarios
function probarLoginTodosLosUsuarios() {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    console.log('\n🧪 PROBANDO LOGIN DE TODOS LOS USUARIOS...');
    
    const resultados = users.map(user => {
        const loginExitoso = simularLoginUsuario(user.username, user.password);
        return {
            username: user.username,
            role: user.role,
            password: user.password,
            loginExitoso: loginExitoso.success,
            error: loginExitoso.error
        };
    });
    
    const exitosos = resultados.filter(r => r.loginExitoso);
    const fallidos = resultados.filter(r => !r.loginExitoso);
    
    console.log(`\n📊 RESULTADOS:`);
    console.log(`   ✅ Logins exitosos: ${exitosos.length}`);
    console.log(`   ❌ Logins fallidos: ${fallidos.length}`);
    
    if (exitosos.length > 0) {
        console.log('\n✅ Usuarios que SÍ pueden hacer login:');
        exitosos.forEach(u => console.log(`   - ${u.username} (${u.role}) - ${u.password}`));
    }
    
    if (fallidos.length > 0) {
        console.log('\n❌ Usuarios que NO pueden hacer login:');
        fallidos.forEach(u => console.log(`   - ${u.username} (${u.role}) - Error: ${u.error}`));
    }
    
    return { exitosos, fallidos };
}

function simularLoginUsuario(username, password) {
    try {
        const userKey = username.toLowerCase();
        const storedUsers = localStorage.getItem('smart-student-users');
        
        if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const storedUser = users.find(u => u.username === userKey);
            
            if (storedUser) {
                if (storedUser.password === password) {
                    // Verificar campos requeridos
                    const camposRequeridos = ['id', 'username', 'role', 'displayName', 'activeCourses', 'email'];
                    const camposFaltantes = camposRequeridos.filter(campo => !storedUser[campo]);
                    
                    if (camposFaltantes.length > 0) {
                        return { success: false, error: `Campos faltantes: ${camposFaltantes.join(', ')}` };
                    }
                    
                    return { success: true };
                } else {
                    return { success: false, error: 'Contraseña incorrecta' };
                }
            } else {
                return { success: false, error: 'Usuario no encontrado' };
            }
        }
    } catch (error) {
        return { success: false, error: `Error: ${error.message}` };
    }
    
    return { success: false, error: 'Error desconocido' };
}

// Ejecutar arreglo automáticamente
console.log('🚀 Ejecutando arreglo automático...');
const resultado = arreglarTodosLosUsuarios();

// Probar logins después del arreglo
const pruebasLogin = probarLoginTodosLosUsuarios();

// Mensaje final
if (pruebasLogin.fallidos.length === 0) {
    console.log('\n🎉 ¡ÉXITO! Todos los usuarios pueden hacer login ahora');
    console.log('💡 Puedes probar cualquiera de estos usuarios en la página de login');
} else {
    console.log('\n⚠️ Algunos usuarios aún tienen problemas');
    console.log('🔧 Revisa los errores anteriores para más detalles');
}

// Funciones globales para uso manual
window.arreglarTodosLosUsuarios = arreglarTodosLosUsuarios;
window.probarLoginTodosLosUsuarios = probarLoginTodosLosUsuarios;

console.log('\n💡 Funciones disponibles:');
console.log('- arreglarTodosLosUsuarios() - Arregla todos los usuarios');
console.log('- probarLoginTodosLosUsuarios() - Prueba login de todos');
