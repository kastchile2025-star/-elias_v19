// Script para limpiar completamente todos los datos relacionados con chat
// Ejecutar en la consola del navegador

console.log('🧹 ELIMINANDO TODOS LOS DATOS DE CHAT');
console.log('═══════════════════════════════════════');

function eliminarTodoChat() {
  try {
    console.log('\n🗑️  LIMPIANDO DATOS DE CHAT...\n');
    
    // 1. Eliminar mensajes de chat
    const chatMessages = localStorage.getItem('smart-student-chat-messages');
    if (chatMessages) {
      localStorage.removeItem('smart-student-chat-messages');
      console.log('✅ Mensajes de chat eliminados');
    } else {
      console.log('ℹ️  No había mensajes de chat almacenados');
    }
    
    // 2. Limpiar configuraciones de chat
    const chatConfig = localStorage.getItem('smart-student-chat-config');
    if (chatConfig) {
      localStorage.removeItem('smart-student-chat-config');
      console.log('✅ Configuración de chat eliminada');
    }
    
    // 3. Limpiar notificaciones de chat
    const chatNotifications = localStorage.getItem('smart-student-chat-notifications');
    if (chatNotifications) {
      localStorage.removeItem('smart-student-chat-notifications');
      console.log('✅ Notificaciones de chat eliminadas');
    }
    
    // 4. Limpiar datos de usuarios relacionados con chat (opcional)
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    let usuariosModificados = false;
    
    const usuariosLimpios = users.map(user => {
      const userCopy = { ...user };
      
      // Mantener assignedTeachers para funcionalidad académica, pero limpiar propiedades específicas de chat
      if (userCopy.chatSettings) {
        delete userCopy.chatSettings;
        usuariosModificados = true;
      }
      
      if (userCopy.lastChatActivity) {
        delete userCopy.lastChatActivity;
        usuariosModificados = true;
      }
      
      if (userCopy.chatPreferences) {
        delete userCopy.chatPreferences;
        usuariosModificados = true;
      }
      
      return userCopy;
    });
    
    if (usuariosModificados) {
      localStorage.setItem('smart-student-users', JSON.stringify(usuariosLimpios));
      console.log('✅ Propiedades de chat eliminadas de usuarios');
    } else {
      console.log('ℹ️  No había propiedades de chat en usuarios');
    }
    
    // 5. Verificar limpieza
    console.log('\n🔍 VERIFICANDO LIMPIEZA...\n');
    
    const keysRelacionadasChat = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes('chat')) {
        keysRelacionadasChat.push(key);
      }
    }
    
    if (keysRelacionadasChat.length > 0) {
      console.log('⚠️  Aún quedan estas claves relacionadas con chat:');
      keysRelacionadasChat.forEach(key => {
        console.log(`   • ${key}`);
        // Opcionalmente eliminar
        localStorage.removeItem(key);
      });
      console.log('✅ Claves restantes eliminadas');
    } else {
      console.log('✅ No quedan datos de chat en localStorage');
    }
    
    console.log('\n🎉 LIMPIEZA COMPLETA REALIZADA');
    console.log('═══════════════════════════════════════');
    console.log('✅ Mensajes de chat eliminados');
    console.log('✅ Configuraciones de chat eliminadas');
    console.log('✅ Notificaciones de chat eliminadas');
    console.log('✅ Propiedades de chat en usuarios eliminadas');
    console.log('✅ Sistema limpio de funcionalidad de chat');
    
    console.log('\n💡 RESULTADO:');
    console.log('• La funcionalidad de chat ha sido completamente eliminada');
    console.log('• Los datos académicos (profesores, estudiantes, cursos) se mantienen');
    console.log('• El sistema está limpio y listo para usar sin chat');
    
    return {
      chatMessagesRemoved: !!chatMessages,
      chatConfigRemoved: !!chatConfig,
      chatNotificationsRemoved: !!chatNotifications,
      userPropertiesCleaned: usuariosModificados,
      additionalKeysRemoved: keysRelacionadasChat.length
    };
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    return { error: error.message };
  }
}

function verificarEstadoSinChat() {
  console.log('\n🔍 VERIFICANDO ESTADO DEL SISTEMA SIN CHAT...\n');
  
  // Verificar que no hay datos de chat
  const chatData = [
    'smart-student-chat-messages',
    'smart-student-chat-config', 
    'smart-student-chat-notifications'
  ];
  
  let todoLimpio = true;
  
  chatData.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`❌ Aún existe: ${key}`);
      todoLimpio = false;
    } else {
      console.log(`✅ Limpio: ${key}`);
    }
  });
  
  // Verificar usuarios
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  console.log(`\n👥 USUARIOS: ${users.length} encontrados`);
  
  const roles = {
    admin: 0,
    teacher: 0,
    student: 0
  };
  
  users.forEach(user => {
    roles[user.role]++;
  });
  
  console.log(`   📊 Administradores: ${roles.admin}`);
  console.log(`   📊 Profesores: ${roles.teacher}`);
  console.log(`   📊 Estudiantes: ${roles.student}`);
  
  // Verificar funcionalidades disponibles
  console.log('\n🛠️  FUNCIONALIDADES DISPONIBLES:');
  console.log('   ✅ Biblioteca Digital');
  console.log('   ✅ Generador de Resúmenes');
  console.log('   ✅ Mapas Mentales');
  console.log('   ✅ Cuestionarios');
  console.log('   ✅ Evaluaciones');
  console.log('   ✅ Gestión de Usuarios (Admin)');
  console.log('   ✅ Solicitudes de Contraseña (Admin)');
  console.log('   ❌ Chat (Eliminado)');
  
  if (todoLimpio) {
    console.log('\n🎉 SISTEMA COMPLETAMENTE LIMPIO');
    console.log('El chat ha sido eliminado exitosamente');
  } else {
    console.log('\n⚠️  LIMPIEZA INCOMPLETA');
    console.log('Ejecuta eliminarTodoChat() nuevamente');
  }
  
  return {
    isClean: todoLimpio,
    userCount: users.length,
    roles: roles
  };
}

function restaurarSistemaLimpio() {
  console.log('\n🔄 RESTAURANDO SISTEMA A ESTADO LIMPIO...\n');
  
  // Eliminar todo y crear solo usuarios básicos
  const usuariosBasicos = [
    {
      username: 'admin',
      displayName: 'Administrador del Sistema',
      email: 'admin@smartstudent.com',
      role: 'admin',
      activeCourses: [],
      password: '1234'
    },
    {
      username: 'profesor1',
      displayName: 'Profesor Demo',
      email: 'profesor@teacher.com',
      role: 'teacher',
      activeCourses: ['4to Básico', '5to Básico'],
      teachingSubjects: ['Matemáticas', 'Ciencias Naturales'],
      password: '1234'
    },
    {
      username: 'estudiante1',
      displayName: 'Estudiante Demo',
      email: 'estudiante@student.com',
      role: 'student',
      activeCourses: ['4to Básico'],
      password: '1234'
    }
  ];
  
  // Limpiar todo
  eliminarTodoChat();
  
  // Restaurar usuarios básicos
  localStorage.setItem('smart-student-users', JSON.stringify(usuariosBasicos));
  
  console.log('✅ Sistema restaurado con usuarios básicos');
  console.log('✅ Sin funcionalidad de chat');
  console.log('✅ Listo para usar');
  
  console.log('\n👥 USUARIOS DISPONIBLES:');
  console.log('   • admin / 1234 (Administrador)');
  console.log('   • profesor1 / 1234 (Profesor)');
  console.log('   • estudiante1 / 1234 (Estudiante)');
  
  return { restored: true, users: usuariosBasicos.length };
}

// Exportar funciones
window.eliminarTodoChat = eliminarTodoChat;
window.verificarEstadoSinChat = verificarEstadoSinChat;
window.restaurarSistemaLimpio = restaurarSistemaLimpio;

console.log('\n🚀 FUNCIONES DISPONIBLES:');
console.log('   • eliminarTodoChat() - Eliminar todos los datos de chat');
console.log('   • verificarEstadoSinChat() - Verificar que el sistema está limpio');
console.log('   • restaurarSistemaLimpio() - Restaurar sistema sin chat');

console.log('\n💡 RECOMENDACIÓN:');
console.log('1. Ejecuta: eliminarTodoChat()');
console.log('2. Recarga la página');
console.log('3. Verifica que no aparezca Chat en el dashboard');

// Auto-ejecutar
console.log('\n🚀 Ejecutando limpieza automática...');
eliminarTodoChat();
