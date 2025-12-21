// Script para migrar usuarios antiguos al sistema de login
console.log('🔄 MIGRANDO USUARIOS ANTIGUOS AL SISTEMA...');

function migrarUsuariosAntiguos() {
    console.log('\n📋 INICIANDO MIGRACIÓN DE USUARIOS ANTIGUOS...');
    
    // Obtener todos los datos
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    const teachers = JSON.parse(localStorage.getItem('smart-student-teachers') || '[]');
    const administrators = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Usuarios principales: ${users.length}`);
    console.log(`   - Estudiantes: ${students.length}`);
    console.log(`   - Profesores: ${teachers.length}`);
    console.log(`   - Administradores: ${administrators.length}`);
    
    let usuariosMigrados = 0;
    let usuariosActualizados = 0;
    
    // Lista de usuarios antiguos que necesitamos arreglar
    const usuariosAntiguos = [
        'carlos', 'felipe', 'gustavo', 'jorge', 'karla', 
        'maria', 'max', 'pedro', 'sofia'
    ];
    
    console.log('\n🔍 Buscando usuarios antiguos...');
    
    // Función para migrar un usuario desde las categorías al principal
    function migrarUsuario(userData, rol) {
        const existeEnPrincipal = users.find(u => u.username === userData.username);
        
        if (!existeEnPrincipal) {
            // No existe en principal, crear nuevo
            const nuevoUsuario = {
                id: userData.id || crypto.randomUUID(),
                username: userData.username,
                name: userData.name,
                email: userData.email || `${userData.username}@${rol}.com`,
                role: rol,
                password: '1234', // Password por defecto
                displayName: userData.name,
                activeCourses: rol === 'admin' ? [] : ['4to Básico'],
                isActive: true,
                createdAt: userData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Agregar datos específicos por rol
            if (rol === 'student') {
                nuevoUsuario.assignedTeachers = {
                    'Matemáticas': 'jorge',
                    'Ciencias Naturales': 'carlos',
                    'Lenguaje y Comunicación': 'jorge',
                    'Historia, Geografía y Ciencias Sociales': 'carlos'
                };
            } else if (rol === 'teacher') {
                nuevoUsuario.teachingAssignments = [{
                    teacherUsername: userData.username,
                    teacherName: userData.name,
                    subject: 'Matemáticas',
                    courses: ['4to Básico']
                }];
            }
            
            users.push(nuevoUsuario);
            usuariosMigrados++;
            console.log(`✅ Usuario migrado: ${userData.username} (${rol})`);
            return nuevoUsuario;
        } else {
            // Existe en principal, verificar si tiene todos los campos
            let necesitaActualizacion = false;
            const usuarioActualizado = { ...existeEnPrincipal };
            
            if (!existeEnPrincipal.password) {
                usuarioActualizado.password = '1234';
                necesitaActualizacion = true;
            }
            
            if (!existeEnPrincipal.displayName) {
                usuarioActualizado.displayName = existeEnPrincipal.name || existeEnPrincipal.username;
                necesitaActualizacion = true;
            }
            
            if (!existeEnPrincipal.activeCourses || !Array.isArray(existeEnPrincipal.activeCourses)) {
                usuarioActualizado.activeCourses = rol === 'admin' ? [] : ['4to Básico'];
                necesitaActualizacion = true;
            }
            
            if (!existeEnPrincipal.email) {
                usuarioActualizado.email = `${existeEnPrincipal.username}@${rol}.com`;
                necesitaActualizacion = true;
            }
            
            // Agregar datos específicos por rol si faltan
            if (rol === 'student' && !existeEnPrincipal.assignedTeachers) {
                usuarioActualizado.assignedTeachers = {
                    'Matemáticas': 'jorge',
                    'Ciencias Naturales': 'carlos',
                    'Lenguaje y Comunicación': 'jorge',
                    'Historia, Geografía y Ciencias Sociales': 'carlos'
                };
                necesitaActualizacion = true;
            }
            
            if (rol === 'teacher' && !existeEnPrincipal.teachingAssignments) {
                usuarioActualizado.teachingAssignments = [{
                    teacherUsername: existeEnPrincipal.username,
                    teacherName: existeEnPrincipal.name || existeEnPrincipal.username,
                    subject: 'Matemáticas',
                    courses: ['4to Básico']
                }];
                necesitaActualizacion = true;
            }
            
            if (necesitaActualizacion) {
                // Actualizar el usuario en el array
                const index = users.findIndex(u => u.username === existeEnPrincipal.username);
                if (index !== -1) {
                    users[index] = usuarioActualizado;
                    usuariosActualizados++;
                    console.log(`🔄 Usuario actualizado: ${existeEnPrincipal.username} (${rol})`);
                }
            }
            
            return usuarioActualizado;
        }
    }
    
    // Migrar estudiantes
    console.log('\n📚 Migrando estudiantes...');
    students.forEach(student => {
        if (usuariosAntiguos.includes(student.username)) {
            migrarUsuario(student, 'student');
        }
    });
    
    // Migrar profesores
    console.log('\n👨‍🏫 Migrando profesores...');
    teachers.forEach(teacher => {
        if (usuariosAntiguos.includes(teacher.username)) {
            migrarUsuario(teacher, 'teacher');
        }
    });
    
    // Migrar administradores
    console.log('\n👑 Migrando administradores...');
    administrators.forEach(admin => {
        if (usuariosAntiguos.includes(admin.username)) {
            migrarUsuario(admin, 'admin');
        }
    });
    
    // Guardar usuarios actualizados
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    console.log(`\n🎉 MIGRACIÓN COMPLETADA:`);
    console.log(`   - Usuarios migrados: ${usuariosMigrados}`);
    console.log(`   - Usuarios actualizados: ${usuariosActualizados}`);
    console.log(`   - Total usuarios en sistema: ${users.length}`);
    
    return { usuariosMigrados, usuariosActualizados, total: users.length };
}

// Función para verificar específicamente los usuarios antiguos
function verificarUsuariosAntiguos() {
    console.log('\n🔍 VERIFICANDO USUARIOS ANTIGUOS...');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const usuariosAntiguos = [
        'carlos', 'felipe', 'gustavo', 'jorge', 'karla', 
        'maria', 'max', 'pedro', 'sofia'
    ];
    
    const resultados = usuariosAntiguos.map(username => {
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return {
                username,
                encontrado: false,
                puedeLogin: false,
                problemas: ['Usuario no encontrado en sistema principal']
            };
        }
        
        // Verificar campos requeridos
        const camposRequeridos = ['id', 'username', 'password', 'role', 'displayName', 'activeCourses', 'email'];
        const camposFaltantes = camposRequeridos.filter(campo => 
            !user[campo] || (campo === 'activeCourses' && !Array.isArray(user[campo]))
        );
        
        const puedeLogin = camposFaltantes.length === 0;
        
        return {
            username,
            encontrado: true,
            puedeLogin,
            problemas: camposFaltantes.length > 0 ? [`Faltan campos: ${camposFaltantes.join(', ')}`] : [],
            role: user.role,
            password: user.password
        };
    });
    
    console.log('\n📊 RESULTADOS POR USUARIO:');
    resultados.forEach(r => {
        const status = r.puedeLogin ? '✅' : '❌';
        const info = r.encontrado ? `(${r.role}) - ${r.password}` : '';
        console.log(`${status} ${r.username} ${info}`);
        if (r.problemas.length > 0) {
            r.problemas.forEach(p => console.log(`     └─ ${p}`));
        }
    });
    
    const exitosos = resultados.filter(r => r.puedeLogin).length;
    const fallidos = resultados.filter(r => !r.puedeLogin).length;
    
    console.log(`\n📈 RESUMEN:`);
    console.log(`   ✅ Pueden hacer login: ${exitosos}/${usuariosAntiguos.length}`);
    console.log(`   ❌ NO pueden hacer login: ${fallidos}/${usuariosAntiguos.length}`);
    
    return { exitosos, fallidos, resultados };
}

// Ejecutar migración automática
console.log('🚀 Ejecutando migración automática...');
const resultadoMigracion = migrarUsuariosAntiguos();

// Verificar resultados después de la migración
console.log('\n🔍 Verificando resultados después de la migración...');
const verificacion = verificarUsuariosAntiguos();

// Mensaje final
if (verificacion.fallidos === 0) {
    console.log('\n🎉 ¡ÉXITO TOTAL! Todos los usuarios antiguos pueden hacer login ahora');
    console.log('\n🔑 CREDENCIALES PARA USUARIOS ANTIGUOS:');
    verificacion.resultados.filter(r => r.puedeLogin).forEach(r => {
        console.log(`   - ${r.username} / ${r.password} (${r.role})`);
    });
    console.log('\n💡 Todos estos usuarios pueden hacer login con password: 1234');
} else {
    console.log('\n⚠️ Algunos usuarios aún tienen problemas');
    console.log('🔧 Revisa los detalles anteriores');
}

// Exponer funciones globalmente
window.migrarUsuariosAntiguos = migrarUsuariosAntiguos;
window.verificarUsuariosAntiguos = verificarUsuariosAntiguos;

console.log('\n💡 Funciones disponibles:');
console.log('- migrarUsuariosAntiguos() - Migrar usuarios antiguos');
console.log('- verificarUsuariosAntiguos() - Verificar estado de usuarios antiguos');
