// Script para crear usuario MAX con TODOS los campos necesarios
console.log('🔧 CREANDO USUARIO MAX COMPLETO...');

function crearUsuarioMaxCompleto() {
    // Obtener usuarios actuales
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Eliminar usuario max si existe
    const filteredUsers = users.filter(u => u.username !== 'max');
    
    // Crear usuario max con TODOS los campos que esperan los usuarios por defecto
    const maxUser = {
        // Campos básicos
        id: 'max', // ID simple como los usuarios por defecto
        username: 'max',
        password: '1234',
        role: 'student',
        displayName: 'Max Usuario',
        activeCourses: ['4to Básico'], // Estudiante solo 1 curso activo
        email: 'max@student.com',
        
        // Campos adicionales para estudiantes
        assignedTeachers: {
            'Matemáticas': 'jorge',
            'Ciencias Naturales': 'carlos',
            'Lenguaje y Comunicación': 'jorge',
            'Historia, Geografía y Ciencias Sociales': 'carlos'
        },
        
        // Campos de gestión
        name: 'Max Usuario',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Agregar a la lista
    filteredUsers.push(maxUser);
    localStorage.setItem('smart-student-users', JSON.stringify(filteredUsers));
    
    console.log('✅ Usuario MAX creado con estructura completa:', maxUser);
    
    // También agregarlo a la lista de estudiantes si es necesario
    const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    const existingStudent = students.find(s => s.username === 'max');
    if (!existingStudent) {
        const maxStudent = {
            ...maxUser,
            uniqueCode: 'EST-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            courseId: 'course-4to-basico',
            sectionId: 'section-a'
        };
        students.push(maxStudent);
        localStorage.setItem('smart-student-students', JSON.stringify(students));
        console.log('✅ Usuario MAX agregado a estudiantes');
    }
    
    return maxUser;
}

// Ejecutar la creación
const maxUser = crearUsuarioMaxCompleto();

// Probar login inmediatamente
console.log('\n🧪 PROBANDO LOGIN INMEDIATAMENTE...');

// Simular exactamente lo que hace el auth-context
function probarLoginCompleto() {
    const userKey = 'max';
    const pass = '1234';
    
    console.log('=== LOGIN DEBUG COMPLETO ===');
    console.log('Usuario:', userKey);
    console.log('Contraseña ingresada:', pass);
    
    try {
        const storedUsers = localStorage.getItem('smart-student-users');
        if (storedUsers) {
            const users = JSON.parse(storedUsers);
            console.log('Total usuarios:', users.length);
            
            const storedUser = users.find(u => u.username === userKey);
            
            if (storedUser) {
                console.log('✅ Usuario encontrado:', storedUser);
                console.log('Contraseña almacenada:', `"${storedUser.password}"`);
                console.log('Contraseña ingresada:', `"${pass}"`);
                console.log('¿Coinciden?:', storedUser.password === pass);
                
                if (storedUser.password === pass) {
                    console.log('🎉 ¡LOGIN EXITOSO!');
                    
                    // Verificar que tiene todos los campos necesarios
                    const camposRequeridos = ['id', 'username', 'role', 'displayName', 'activeCourses', 'email'];
                    const camposFaltantes = camposRequeridos.filter(campo => !storedUser[campo]);
                    
                    if (camposFaltantes.length > 0) {
                        console.log('⚠️ Campos faltantes:', camposFaltantes);
                    } else {
                        console.log('✅ Todos los campos requeridos están presentes');
                    }
                    
                    return true;
                } else {
                    console.log('❌ Contraseña incorrecta');
                    return false;
                }
            } else {
                console.log('❌ Usuario no encontrado');
                return false;
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

const loginExitoso = probarLoginCompleto();

if (loginExitoso) {
    console.log('\n🎯 El usuario MAX debería poder hacer login ahora');
    console.log('💡 Intenta hacer login en la página con: max / 1234');
} else {
    console.log('\n❌ Aún hay problemas con el login');
    console.log('🔍 Revisa los logs anteriores para más detalles');
}

// Función para verificar el estado actual
window.verificarEstadoMax = function() {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const maxUser = users.find(u => u.username === 'max');
    
    console.log('👤 Estado actual del usuario MAX:');
    console.log(maxUser || 'No encontrado');
    
    if (maxUser) {
        console.log('\n🔍 Verificando campos:');
        console.log('  ID:', maxUser.id);
        console.log('  Username:', maxUser.username);
        console.log('  Password:', maxUser.password);
        console.log('  Role:', maxUser.role);
        console.log('  DisplayName:', maxUser.displayName);
        console.log('  ActiveCourses:', maxUser.activeCourses);
        console.log('  Email:', maxUser.email);
    }
    
    return maxUser;
};

console.log('\n💡 Función disponible: verificarEstadoMax()');
