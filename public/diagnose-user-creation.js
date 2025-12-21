// Script para diagnosticar el problema de usuarios recién creados
console.log('🔍 DIAGNOSTICANDO USUARIOS RECIÉN CREADOS...');

// Verificar todos los usuarios en localStorage
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
console.log(`📊 Total usuarios en smart-student-users: ${users.length}`);

if (users.length === 0) {
    console.log('❌ NO HAY USUARIOS EN EL SISTEMA');
    console.log('Esto significa que los usuarios no se están guardando correctamente');
} else {
    console.log('\n👥 USUARIOS ENCONTRADOS:');
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.role})`);
        console.log(`   - Password: ${user.password || 'SIN PASSWORD'}`);
        console.log(`   - DisplayName: ${user.displayName || 'SIN DISPLAYNAME'}`);
        console.log(`   - Email: ${user.email || 'SIN EMAIL'}`);
        console.log(`   - ActiveCourses: ${user.activeCourses ? JSON.stringify(user.activeCourses) : 'SIN CURSOS'}`);
        console.log(`   - ID: ${user.id || 'SIN ID'}`);
        console.log('');
    });
}

// Verificar otras categorías de usuarios
const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
const teachers = JSON.parse(localStorage.getItem('smart-student-teachers') || '[]');
const administrators = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');

console.log('\n📊 USUARIOS POR CATEGORÍA:');
console.log(`   - Estudiantes: ${students.length}`);
console.log(`   - Profesores: ${teachers.length}`);
console.log(`   - Administradores: ${administrators.length}`);

// Verificar si hay usuarios en categorías pero no en el principal
if (students.length > 0 || teachers.length > 0 || administrators.length > 0) {
    console.log('\n⚠️ HAY USUARIOS EN CATEGORÍAS PERO POSIBLEMENTE NO EN EL PRINCIPAL');
    
    // Mostrar usuarios en categorías
    if (students.length > 0) {
        console.log('\n📚 ESTUDIANTES:');
        students.forEach(s => console.log(`   - ${s.username || s.name} (${s.email})`));
    }
    
    if (teachers.length > 0) {
        console.log('\n👨‍🏫 PROFESORES:');
        teachers.forEach(t => console.log(`   - ${t.username || t.name} (${t.email})`));
    }
    
    if (administrators.length > 0) {
        console.log('\n👑 ADMINISTRADORES:');
        administrators.forEach(a => console.log(`   - ${a.username || a.name} (${a.email})`));
    }
}

// Función para migrar usuarios de categorías al principal
window.migrarUsuariosAlPrincipal = function() {
    console.log('\n🔄 MIGRANDO USUARIOS AL ARRAY PRINCIPAL...');
    
    const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    const teachers = JSON.parse(localStorage.getItem('smart-student-teachers') || '[]');
    const administrators = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');
    
    let migrados = 0;
    
    // Migrar estudiantes
    students.forEach(student => {
        const existeEnPrincipal = allUsers.find(u => u.username === student.username);
        if (!existeEnPrincipal) {
            const userForMain = {
                id: student.id || crypto.randomUUID(),
                username: student.username,
                name: student.name,
                email: student.email,
                role: 'student',
                password: student.password || '1234',
                displayName: student.name,
                activeCourses: ['4to Básico'],
                assignedTeachers: {
                    'Matemáticas': 'jorge',
                    'Ciencias Naturales': 'carlos'
                },
                isActive: true,
                createdAt: student.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            allUsers.push(userForMain);
            migrados++;
            console.log(`✅ Estudiante migrado: ${student.username}`);
        }
    });
    
    // Migrar profesores
    teachers.forEach(teacher => {
        const existeEnPrincipal = allUsers.find(u => u.username === teacher.username);
        if (!existeEnPrincipal) {
            const userForMain = {
                id: teacher.id || crypto.randomUUID(),
                username: teacher.username,
                name: teacher.name,
                email: teacher.email,
                role: 'teacher',
                password: teacher.password || '1234',
                displayName: teacher.name,
                activeCourses: ['4to Básico'],
                teachingAssignments: [{
                    teacherUsername: teacher.username,
                    teacherName: teacher.name,
                    subject: 'Matemáticas',
                    courses: ['4to Básico']
                }],
                isActive: true,
                createdAt: teacher.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            allUsers.push(userForMain);
            migrados++;
            console.log(`✅ Profesor migrado: ${teacher.username}`);
        }
    });
    
    // Migrar administradores
    administrators.forEach(admin => {
        const existeEnPrincipal = allUsers.find(u => u.username === admin.username);
        if (!existeEnPrincipal) {
            const userForMain = {
                id: admin.id || crypto.randomUUID(),
                username: admin.username,
                name: admin.name,
                email: admin.email,
                role: 'admin',
                password: admin.password || '1234',
                displayName: admin.displayName || admin.name,
                activeCourses: [],
                isActive: true,
                createdAt: admin.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            allUsers.push(userForMain);
            migrados++;
            console.log(`✅ Administrador migrado: ${admin.username}`);
        }
    });
    
    // Guardar usuarios migrados
    localStorage.setItem('smart-student-users', JSON.stringify(allUsers));
    
    console.log(`\n🎉 MIGRACIÓN COMPLETADA:`);
    console.log(`   - Usuarios migrados: ${migrados}`);
    console.log(`   - Total usuarios ahora: ${allUsers.length}`);
    
    if (migrados > 0) {
        console.log('\n💡 Ahora todos los usuarios deberían poder hacer login');
        console.log('🔐 Password por defecto para usuarios sin password: 1234');
    }
    
    return { migrados, total: allUsers.length };
};

// Ejecutar migración automática si es necesario
if (users.length === 0 && (students.length > 0 || teachers.length > 0 || administrators.length > 0)) {
    console.log('\n🚀 EJECUTANDO MIGRACIÓN AUTOMÁTICA...');
    migrarUsuariosAlPrincipal();
} else if (users.length > 0) {
    console.log('\n💡 Función disponible: migrarUsuariosAlPrincipal()');
    console.log('💡 Si algunos usuarios no pueden hacer login, ejecuta esta función');
}

console.log('\n🔍 DIAGNÓSTICO COMPLETADO');
