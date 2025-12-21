// Script para limpiar y verificar el estado del localStorage
// Abrir las herramientas de desarrollador (F12) y pegar en la consola

console.log("=== VERIFICANDO ESTADO DE CONTRASEÑAS ===");

// Verificar qué hay en localStorage
const storedUsers = localStorage.getItem('smart-student-users');
if (storedUsers) {
    const users = JSON.parse(storedUsers);
    console.log("Usuarios en localStorage:", users);
    
    users.forEach(user => {
        console.log(`Usuario: ${user.username}, Contraseña: ${user.password}, Rol: ${user.role}`);
    });
} else {
    console.log("No hay usuarios en localStorage");
}

// Función para limpiar solo contraseñas duplicadas
function cleanDuplicatePasswords() {
    const storedUsers = localStorage.getItem('smart-student-users');
    if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log("Limpiando usuarios duplicados...");
        
        // Remover cualquier usuario que pueda estar duplicado
        const uniqueUsers = users.filter((user, index, self) => 
            index === self.findIndex(u => u.username === user.username)
        );
        
        localStorage.setItem('smart-student-users', JSON.stringify(uniqueUsers));
        console.log("Usuarios únicos guardados:", uniqueUsers);
    }
}

// Función para verificar login manual
function testLogin(username, password) {
    const storedUsers = localStorage.getItem('smart-student-users');
    if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const user = users.find(u => u.username === username.toLowerCase());
        
        if (user) {
            console.log(`Usuario ${username} encontrado en localStorage`);
            console.log(`Contraseña almacenada: ${user.password}`);
            console.log(`Contraseña ingresada: ${password}`);
            console.log(`¿Coincide?: ${user.password === password}`);
            return user.password === password;
        } else {
            console.log(`Usuario ${username} NO encontrado en localStorage`);
            return false;
        }
    }
    return false;
}

console.log("=== FUNCIONES DISPONIBLES ===");
console.log("cleanDuplicatePasswords() - Limpia usuarios duplicados");
console.log("testLogin('felipe', 'password') - Prueba login manual");
console.log("localStorage.clear() - Limpia todo el localStorage");
