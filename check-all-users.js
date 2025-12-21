// Función para revisar todos los usuarios en todas las ubicaciones posibles
window.revisarTodosLosUsuarios = function() {
    console.log('🔍 REVISIÓN COMPLETA DE USUARIOS EN EL SISTEMA');
    console.log('===============================================');
    
    // Revisar ubicación principal
    const mainUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    console.log(`📊 smart-student-users: ${mainUsers.length} usuarios`);
    mainUsers.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.username} (${user.role}) - ${user.displayName || user.name || 'Sin nombre'}`);
    });
    
    // Revisar ubicaciones específicas por rol
    const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    console.log(`\n👨‍🎓 smart-student-students: ${students.length} estudiantes`);
    students.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.username || user.name || 'Sin username'} - ${user.displayName || user.name || 'Sin nombre'}`);
    });
    
    const teachers = JSON.parse(localStorage.getItem('smart-student-teachers') || '[]');
    console.log(`\n��‍🏫 smart-student-teachers: ${teachers.length} profesores`);
    teachers.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.username || user.name || 'Sin username'} - ${user.displayName || user.name || 'Sin nombre'}`);
    });
    
    const admins = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');
    console.log(`\n👨‍💼 smart-student-administrators: ${admins.length} administradores`);
    admins.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.username || user.name || 'Sin username'} - ${user.displayName || user.name || 'Sin nombre'}`);
    });
    
    // Buscar otras claves que puedan contener usuarios
    console.log('\n🔍 Buscando otras ubicaciones...');
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(key => key.toLowerCase().includes('user') || key.toLowerCase().includes('student') || key.toLowerCase().includes('teacher'));
    
    userKeys.forEach(key => {
        if (!['smart-student-users', 'smart-student-students', 'smart-student-teachers', 'smart-student-administrators'].includes(key)) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`📦 ${key}: ${data.length} elementos`);
                    if (data[0].username || data[0].name) {
                        console.log(`   Parece contener usuarios...`);
                    }
                }
            } catch (e) {
                // No es JSON, ignorar
            }
        }
    });
    
    return {
        main: mainUsers.length,
        students: students.length,
        teachers: teachers.length,
        admins: admins.length,
        total: mainUsers.length + students.length + teachers.length + admins.length
    };
};

// Función para consolidar todos los usuarios en la ubicación principal
window.consolidarUsuarios = function() {
    console.log('🔄 CONSOLIDANDO TODOS LOS USUARIOS');
    console.log('==================================');
    
    const mainUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    const teachers = JSON.parse(localStorage.getItem('smart-student-teachers') || '[]');
    const admins = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');
    
    console.log(`📊 Usuarios encontrados:`);
    console.log(`   Principal: ${mainUsers.length}`);
    console.log(`   Estudiantes: ${students.length}`);
    console.log(`   Profesores: ${teachers.length}`);
    console.log(`   Administradores: ${admins.length}`);
    
    let todosLosUsuarios = [...mainUsers];
    let agregados = 0;
    
    // Agregar estudiantes
    students.forEach(student => {
        const existe = todosLosUsuarios.find(u => u.username === student.username || u.name === student.name);
        if (!existe) {
            const usuarioCompleto = {
                id: student.id || crypto.randomUUID(),
                username: student.username || student.name || `student_${Date.now()}`,
                password: student.password || '1234',
                role: 'student',
                displayName: student.displayName || student.name || 'Estudiante',
                activeCourses: Array.isArray(student.activeCourses) ? student.activeCourses : ['4to Básico'],
                email: student.email || `${student.username || student.name}@example.com`,
                isActive: true,
                createdAt: student.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...student
            };
            todosLosUsuarios.push(usuarioCompleto);
            agregados++;
            console.log(`✅ Agregado estudiante: ${usuarioCompleto.username}`);
        }
    });
    
    // Agregar profesores
    teachers.forEach(teacher => {
        const existe = todosLosUsuarios.find(u => u.username === teacher.username || u.name === teacher.name);
        if (!existe) {
            const usuarioCompleto = {
                id: teacher.id || crypto.randomUUID(),
                username: teacher.username || teacher.name || `teacher_${Date.now()}`,
                password: teacher.password || '1234',
                role: 'teacher',
                displayName: teacher.displayName || teacher.name || 'Profesor',
                activeCourses: Array.isArray(teacher.activeCourses) ? teacher.activeCourses : ['4to Básico'],
                email: teacher.email || `${teacher.username || teacher.name}@example.com`,
                isActive: true,
                createdAt: teacher.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...teacher
            };
            todosLosUsuarios.push(usuarioCompleto);
            agregados++;
            console.log(`✅ Agregado profesor: ${usuarioCompleto.username}`);
        }
    });
    
    // Agregar administradores
    admins.forEach(admin => {
        const existe = todosLosUsuarios.find(u => u.username === admin.username || u.name === admin.name);
        if (!existe) {
            const usuarioCompleto = {
                id: admin.id || crypto.randomUUID(),
                username: admin.username || admin.name || `admin_${Date.now()}`,
                password: admin.password || '1234',
                role: 'admin',
                displayName: admin.displayName || admin.name || 'Administrador',
                activeCourses: [],
                email: admin.email || `${admin.username || admin.name}@example.com`,
                isActive: true,
                createdAt: admin.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...admin
            };
            todosLosUsuarios.push(usuarioCompleto);
            agregados++;
            console.log(`✅ Agregado administrador: ${usuarioCompleto.username}`);
        }
    });
    
    // Guardar todos los usuarios consolidados
    localStorage.setItem('smart-student-users', JSON.stringify(todosLosUsuarios));
    
    console.log(`\n✅ CONSOLIDACIÓN COMPLETADA:`);
    console.log(`   📊 Total usuarios: ${todosLosUsuarios.length}`);
    console.log(`   ➕ Usuarios agregados: ${agregados}`);
    console.log(`   🔄 Usuarios ya existentes: ${todosLosUsuarios.length - agregados}`);
    
    return { total: todosLosUsuarios.length, agregados, usuarios: todosLosUsuarios };
};

console.log('✅ Herramientas de revisión cargadas!');
console.log('📖 NUEVOS COMANDOS:');
console.log('   revisarTodosLosUsuarios() - Ve todos los usuarios en todas las ubicaciones');
console.log('   consolidarUsuarios() - Unifica todos los usuarios en la ubicación principal');
