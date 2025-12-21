// Script de debug específico para el usuario "max"
console.log('🔍 DEBUGGING LOGIN USUARIO MAX');

// Verificar datos del usuario max
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const maxUser = users.find(u => u.username === 'max');

console.log('👤 Datos del usuario max:', maxUser);

if (!maxUser) {
    console.log('❌ Usuario max no encontrado');
} else {
    console.log('✅ Usuario max encontrado');
    console.log('   Username:', maxUser.username);
    console.log('   Password:', maxUser.password);
    console.log('   Role:', maxUser.role);
    console.log('   DisplayName:', maxUser.displayName);
    console.log('   ActiveCourses:', maxUser.activeCourses);
    console.log('   Email:', maxUser.email);
    console.log('   ID:', maxUser.id);
}

// Simular exactamente el proceso de login del auth-context
console.log('\n🔐 SIMULANDO PROCESO DE LOGIN...');

function simularLogin(username, password) {
    const userKey = username.toLowerCase();
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Usuario:', userKey);
    console.log('Contraseña ingresada:', password);
    
    // Intentar obtener del localStorage (como hace el auth-context)
    let userData = undefined;
    let userFoundInStorage = false;
    
    try {
        const storedUsers = localStorage.getItem('smart-student-users');
        console.log('Datos en localStorage:', storedUsers ? 'Existen' : 'No existen');
        
        if (storedUsers) {
            const users = JSON.parse(storedUsers);
            console.log('Usuarios en localStorage:', users.length);
            const storedUser = users.find(u => u.username === userKey);
            
            if (storedUser) {
                console.log('✅ Usuario encontrado en localStorage:', storedUser);
                console.log('Contraseña almacenada:', storedUser.password);
                userFoundInStorage = true;
                if (storedUser.password === password) {
                    console.log('✅ Contraseña correcta (localStorage)');
                    userData = storedUser;
                    return { success: true, user: userData };
                } else {
                    console.log('❌ Contraseña incorrecta (localStorage)');
                    console.log(`  Esperada: "${storedUser.password}"`);
                    console.log(`  Recibida: "${password}"`);
                    return { success: false, reason: 'Contraseña incorrecta' };
                }
            } else {
                console.log('❌ Usuario NO encontrado en localStorage');
                return { success: false, reason: 'Usuario no encontrado' };
            }
        }
    } catch (error) {
        console.warn('Error al cargar usuarios:', error);
        return { success: false, reason: 'Error al cargar datos' };
    }
    
    return { success: false, reason: 'Usuario no encontrado' };
}

// Probar login con max
console.log('\n🧪 PROBANDO LOGIN CON MAX...');
const resultado = simularLogin('max', '1234');
console.log('Resultado:', resultado);

// Verificar si hay otros problemas
console.log('\n🔍 VERIFICACIONES ADICIONALES...');

// 1. Verificar que no hay espacios o caracteres extraños
if (maxUser) {
    console.log('Username length:', maxUser.username.length);
    console.log('Password length:', maxUser.password.length);
    console.log('Username charCodes:', Array.from(maxUser.username).map(c => c.charCodeAt(0)));
    console.log('Password charCodes:', Array.from(maxUser.password).map(c => c.charCodeAt(0)));
}

// 2. Verificar localStorage keys
console.log('\nLocalStorage keys related to users:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('user')) {
        console.log(`  ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
    }
}

// Función para arreglar el usuario max
window.arreglarUsuarioMax = function() {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Eliminar usuario max si existe
    const filteredUsers = users.filter(u => u.username !== 'max');
    
    // Crear nuevo usuario max con todos los campos necesarios
    const maxUser = {
        id: crypto.randomUUID(),
        username: 'max',
        name: 'Max Usuario',
        email: 'max@test.com', 
        role: 'student',
        password: '1234',
        displayName: 'Max Usuario',
        activeCourses: ['4to Básico'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    filteredUsers.push(maxUser);
    localStorage.setItem('smart-student-users', JSON.stringify(filteredUsers));
    
    console.log('✅ Usuario max recreado:', maxUser);
    console.log('🔄 Intenta hacer login nuevamente');
    
    return maxUser;
};

console.log('\n💡 Si el login sigue fallando, ejecuta: arreglarUsuarioMax()');
