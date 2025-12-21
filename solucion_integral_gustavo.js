// Solución integral para crear y autenticar gustavo como estudiante
console.log('🛠️ SOLUCIONANDO PROBLEMAS DE GUSTAVO - CREACIÓN Y AUTENTICACIÓN');
console.log('================================================================');

// PASO 1: Crear usuario gustavo si no existe
console.log('\n📝 PASO 1: VERIFICANDO Y CREANDO USUARIO GUSTAVO');

let allUsers = [];
try {
  allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  console.log('Usuarios existentes:', allUsers.length);
} catch (error) {
  console.log('Error cargando usuarios, creando lista nueva');
  allUsers = [];
}

let gustavo = allUsers.find(u => u.username === 'gustavo');

if (!gustavo) {
  console.log('❌ Gustavo no existe, creándolo...');
  
  gustavo = {
    id: 'gustavo-' + Date.now(),
    username: 'gustavo',
    password: '1234',
    role: 'estudiante', // Usar rol en español
    displayName: 'Gustavo Estudiante',
    email: 'gustavo@student.com',
    activeCourses: ['5to-basico', '5to Básico'], // Múltiples formatos por compatibilidad
    createdAt: new Date().toISOString(),
    isActive: true,
    // Campos adicionales para compatibilidad
    assignedTeachers: {},
    teachingAssignments: []
  };
  
  allUsers.push(gustavo);
  localStorage.setItem('smart-student-users', JSON.stringify(allUsers));
  console.log('✅ Usuario gustavo creado:', gustavo);
} else {
  console.log('✅ Usuario gustavo ya existe:', gustavo);
  
  // Verificar que tenga el rol correcto
  if (gustavo.role !== 'estudiante' && gustavo.role !== 'student') {
    console.log('🔧 Corrigiendo rol de gustavo...');
    gustavo.role = 'estudiante';
    
    // Actualizar en la lista
    const userIndex = allUsers.findIndex(u => u.username === 'gustavo');
    if (userIndex !== -1) {
      allUsers[userIndex] = gustavo;
      localStorage.setItem('smart-student-users', JSON.stringify(allUsers));
      console.log('✅ Rol de gustavo corregido a "estudiante"');
    }
  }
}

// PASO 2: Autenticar gustavo correctamente
console.log('\n🔐 PASO 2: AUTENTICANDO GUSTAVO CORRECTAMENTE');

// Establecer autenticación en localStorage
localStorage.setItem('smart-student-auth', JSON.stringify(gustavo));
localStorage.setItem('smart-student-user', JSON.stringify(gustavo));

console.log('✅ Gustavo autenticado correctamente');
console.log('Datos de autenticación guardados:', {
  id: gustavo.id,
  username: gustavo.username,
  role: gustavo.role,
  displayName: gustavo.displayName
});

// PASO 3: Crear tareas de prueba para gustavo
console.log('\n📚 PASO 3: CREANDO TAREAS DE PRUEBA PARA GUSTAVO');

let allTasks = [];
try {
  allTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
} catch (error) {
  allTasks = [];
}

// Verificar si ya hay tareas para gustavo
const tasksForGustavo = allTasks.filter(task => {
  if (task.assignedTo === 'course') {
    return gustavo.activeCourses?.some(course => 
      course === task.course || 
      task.course.includes(course) || 
      course.includes(task.course)
    );
  } else if (task.assignedTo === 'student') {
    return task.assignedStudentIds?.includes(gustavo.id);
  }
  return false;
});

console.log(`Tareas existentes para gustavo: ${tasksForGustavo.length}`);

if (tasksForGustavo.length === 0) {
  console.log('🆕 Creando tareas de prueba...');
  
  // Tarea 1: Asignada a todo el curso
  const courseTask = {
    id: 'task-course-' + Date.now(),
    title: 'Tarea de Matemáticas - Todo el Curso',
    description: 'Resolver ejercicios de fracciones del capítulo 5.',
    subject: 'Matemáticas',
    course: '5to-basico',
    assignedById: 'admin',
    assignedByName: 'Administrador',
    assignedTo: 'course',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    priority: 'medium',
    taskType: 'tarea',
    attachments: []
  };
  
  // Tarea 2: Asignada específicamente a gustavo
  const specificTask = {
    id: 'task-specific-' + Date.now(),
    title: 'Tarea Personal para Gustavo',
    description: 'Investigación sobre historia de Chile - Independencia.',
    subject: 'Historia, Geografía y Ciencias Sociales',
    course: '5to-basico',
    assignedById: 'admin',
    assignedByName: 'Administrador',
    assignedTo: 'student',
    assignedStudentIds: [gustavo.id],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    priority: 'high',
    taskType: 'tarea',
    attachments: []
  };
  
  allTasks.push(courseTask, specificTask);
  localStorage.setItem('smart-student-tasks', JSON.stringify(allTasks));
  
  console.log('✅ Tareas de prueba creadas:');
  console.log('  1. Tarea para todo el curso 5to básico');
  console.log('  2. Tarea específica para gustavo');
}

// PASO 4: Forzar actualización de React
console.log('\n🔄 PASO 4: FORZANDO ACTUALIZACIÓN DE LA INTERFAZ');

try {
  // Disparar múltiples eventos para asegurar que React se actualice
  window.dispatchEvent(new CustomEvent('storage', {
    detail: { key: 'smart-student-auth', newValue: JSON.stringify(gustavo) }
  }));
  
  window.dispatchEvent(new CustomEvent('userAuthUpdated', {
    detail: { user: gustavo }
  }));
  
  window.dispatchEvent(new PopStateEvent('popstate'));
  
  console.log('✅ Eventos de actualización disparados');
} catch (error) {
  console.log('⚠️ Error disparando eventos:', error);
}

// PASO 5: Verificación final
console.log('\n✅ PASO 5: VERIFICACIÓN FINAL');
console.log('================================================================');
console.log('🎯 RESULTADOS ESPERADOS:');
console.log('  ✅ Usuario gustavo creado y autenticado');
console.log('  ✅ Rol configurado como "estudiante"');
console.log('  ✅ Tareas de prueba disponibles');
console.log('  ✅ Badge debe aparecer después de recargar la página');
console.log('');
console.log('📋 PRÓXIMOS PASOS:');
console.log('  1. Recarga la página (F5 o Ctrl+R)');
console.log('  2. Verifica que aparezca el badge verde "🎓 Estudiante"');
console.log('  3. Ve a la pestaña "Tareas" y verifica que veas al menos 2 tareas');
console.log('  4. Si el badge no aparece, ejecuta el script de corrección del badge');
console.log('');
console.log('================================================================');
console.log('🏁 SOLUCIÓN INTEGRAL COMPLETADA');
