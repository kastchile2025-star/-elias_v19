// Script para monitorear y arreglar la creación de usuarios en tiempo real
console.log('🔧 MONITOR DE CREACIÓN DE USUARIOS ACTIVADO');

// Función para verificar el estado actual
function verificarEstadoUsuarios() {
    console.log('\n📊 ESTADO ACTUAL DE USUARIOS:');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    const teachers = JSON.parse(localStorage.getItem('smart-student-teachers') || '[]');
    const administrators = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');
    
    console.log(`   - smart-student-users: ${users.length}`);
    console.log(`   - smart-student-students: ${students.length}`);
    console.log(`   - smart-student-teachers: ${teachers.length}`);
    console.log(`   - smart-student-administrators: ${administrators.length}`);
    
    // Verificar si hay discrepancias
    const totalEnCategorias = students.length + teachers.length + administrators.length;
    if (totalEnCategorias > users.length) {
        console.log('⚠️ HAY MÁS USUARIOS EN CATEGORÍAS QUE EN EL PRINCIPAL');
        console.log('🔧 Esto indica que no se están sincronizando correctamente');
        return { necesitaReparacion: true, users, students, teachers, administrators };
    }
    
    return { necesitaReparacion: false, users, students, teachers, administrators };
}

// Función para sincronizar todos los usuarios
function sincronizarTodosLosUsuarios() {
    console.log('\n🔄 SINCRONIZANDO TODOS LOS USUARIOS...');
    
    const estado = verificarEstadoUsuarios();
    let usuariosSincronizados = 0;
    
    // Obtener usuarios principales
    let allUsers = [...estado.users];
    
    // Función auxiliar para agregar usuario al principal si no existe
    function agregarSiNoExiste(userData, role) {
        const existeEnPrincipal = allUsers.find(u => u.username === userData.username);
        if (!existeEnPrincipal) {
            const nuevoUsuario = {
                id: userData.id || crypto.randomUUID(),
                username: userData.username,
                name: userData.name,
                email: userData.email,
                role: role,
                password: userData.password || '1234',
                displayName: userData.displayName || userData.name,
                activeCourses: role === 'admin' ? [] : ['4to Básico'],
                isActive: true,
                createdAt: userData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Agregar datos específicos por rol
            if (role === 'student') {
                nuevoUsuario.assignedTeachers = {
                    'Matemáticas': 'jorge',
                    'Ciencias Naturales': 'carlos',
                    'Lenguaje y Comunicación': 'jorge',
                    'Historia, Geografía y Ciencias Sociales': 'carlos'
                };
            } else if (role === 'teacher') {
                nuevoUsuario.teachingAssignments = [{
                    teacherUsername: userData.username,
                    teacherName: userData.name,
                    subject: 'Matemáticas',
                    courses: ['4to Básico']
                }];
            }
            
            allUsers.push(nuevoUsuario);
            usuariosSincronizados++;
            console.log(`✅ ${role} sincronizado: ${userData.username}`);
            return nuevoUsuario;
        }
        return existeEnPrincipal;
    }
    
    // Sincronizar estudiantes
    estado.students.forEach(student => agregarSiNoExiste(student, 'student'));
    
    // Sincronizar profesores
    estado.teachers.forEach(teacher => agregarSiNoExiste(teacher, 'teacher'));
    
    // Sincronizar administradores
    estado.administrators.forEach(admin => agregarSiNoExiste(admin, 'admin'));
    
    // Guardar usuarios sincronizados
    localStorage.setItem('smart-student-users', JSON.stringify(allUsers));
    
    console.log(`\n🎉 SINCRONIZACIÓN COMPLETADA:`);
    console.log(`   - Usuarios sincronizados: ${usuariosSincronizados}`);
    console.log(`   - Total usuarios: ${allUsers.length}`);
    
    return allUsers;
}

// Función para probar login de todos los usuarios
function probarLoginDeTodos() {
    console.log('\n🧪 PROBANDO LOGIN DE TODOS LOS USUARIOS...');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    if (users.length === 0) {
        console.log('❌ No hay usuarios para probar');
        return [];
    }
    
    const resultados = users.map(user => {
        // Verificar campos requeridos
        const camposRequeridos = ['id', 'username', 'password', 'role', 'displayName', 'activeCourses', 'email'];
        const camposFaltantes = camposRequeridos.filter(campo => 
            !user[campo] || (campo === 'activeCourses' && !Array.isArray(user[campo]))
        );
        
        const puedeLogin = camposFaltantes.length === 0;
        
        if (puedeLogin) {
            console.log(`✅ ${user.username} (${user.role}) - Password: ${user.password}`);
        } else {
            console.log(`❌ ${user.username} (${user.role}) - Faltan: ${camposFaltantes.join(', ')}`);
        }
        
        return {
            username: user.username,
            role: user.role,
            password: user.password,
            puedeLogin,
            camposFaltantes
        };
    });
    
    const exitosos = resultados.filter(r => r.puedeLogin);
    const fallidos = resultados.filter(r => !r.puedeLogin);
    
    console.log(`\n📊 RESUMEN FINAL:`);
    console.log(`   ✅ Pueden hacer login: ${exitosos.length}`);
    console.log(`   ❌ No pueden hacer login: ${fallidos.length}`);
    
    return { exitosos, fallidos };
}

// Función principal para arreglar todo
function arreglarSistemCompleto() {
    console.log('🚀 INICIANDO REPARACIÓN COMPLETA DEL SISTEMA...');
    
    // 1. Verificar estado
    const estado = verificarEstadoUsuarios();
    
    // 2. Sincronizar usuarios
    const usuariosSincronizados = sincronizarTodosLosUsuarios();
    
    // 3. Probar logins
    const resultadosLogin = probarLoginDeTodos();
    
    // 4. Resultado final
    if (resultadosLogin.fallidos.length === 0) {
        console.log('\n🎉 ¡SISTEMA COMPLETAMENTE REPARADO!');
        console.log('💡 Todos los usuarios pueden hacer login ahora');
        console.log('\n🔑 USUARIOS DISPONIBLES:');
        resultadosLogin.exitosos.forEach(u => {
            console.log(`   - ${u.username} / ${u.password} (${u.role})`);
        });
    } else {
        console.log('\n⚠️ Algunos usuarios aún tienen problemas');
        console.log('🔧 Revisa los campos faltantes e intenta nuevamente');
    }
    
    return {
        usuariosSincronizados: usuariosSincronizados.length,
        exitosos: resultadosLogin.exitosos.length,
        fallidos: resultadosLogin.fallidos.length
    };
}

// Ejecutar reparación automática
console.log('🔄 Ejecutando verificación inicial...');
const estadoInicial = verificarEstadoUsuarios();

if (estadoInicial.necesitaReparacion) {
    console.log('🚨 SE DETECTARON PROBLEMAS - EJECUTANDO REPARACIÓN...');
    arreglarSistemCompleto();
} else {
    console.log('✅ Sistema parece estar bien, pero verificando logins...');
    probarLoginDeTodos();
}

// Exponer funciones globalmente
window.verificarEstadoUsuarios = verificarEstadoUsuarios;
window.sincronizarTodosLosUsuarios = sincronizarTodosLosUsuarios;
window.probarLoginDeTodos = probarLoginDeTodos;
window.arreglarSistemCompleto = arreglarSistemCompleto;

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('- verificarEstadoUsuarios() - Ver estado actual');
console.log('- sincronizarTodosLosUsuarios() - Sincronizar usuarios');
console.log('- probarLoginDeTodos() - Probar todos los logins');
console.log('- arreglarSistemCompleto() - Reparación completa');
