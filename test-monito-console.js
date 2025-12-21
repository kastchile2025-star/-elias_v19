// Script de prueba para el Monito Interactivo
// Ejecuta esto en la consola del navegador (F12 → Console)

// 1. Verificar estado actual del monito
console.log('=== DIAGNÓSTICO MONITO INTERACTIVO ===');
console.log('Usuario actual:', {
  username: localStorage.getItem('currentUser'),
  isLoggedIn: !!localStorage.getItem('currentUser')
});

// 2. Verificar Firebase
console.log('Firebase habilitado:', process.env.NEXT_PUBLIC_USE_FIREBASE);

// 3. Simular evento de actualización de calificaciones
console.log('\n🔄 Forzando actualización de calificaciones...');
window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
  detail: { source: 'manual-test', count: 10 }
}));

// 4. Función helper para crear calificaciones de prueba
function crearCalificacionPrueba(score, subject = 'Matemáticas') {
  return {
    studentId: 'sofia.gonzalez', // Ajusta según tu usuario
    studentName: 'Sofía González González',
    score: score,
    subjectId: subject.substring(0, 3).toUpperCase(),
    subjectName: subject,
    year: 2025,
    gradedAt: new Date().toISOString(),
    courseId: '1ro_basico_a',
    sectionId: 'a'
  };
}

// 5. Ver logs del monito
console.log('\n📋 Busca en la consola logs con prefijo [Monito] para ver el diagnóstico');
console.log('Deberías ver:');
console.log('  [Monito] 🔥 Consultando calificaciones en Firebase...');
console.log('  [Monito] 📊 Total de calificaciones...');
console.log('  [Monito] ✅ Calificaciones filtradas...');

// 6. Forzar recarga si es necesario
setTimeout(() => {
  console.log('\n✨ Si no ves la burbuja gris, verifica:');
  console.log('1. Que haya calificaciones en Firebase para el usuario actual');
  console.log('2. Que el studentId coincida con el username del usuario');
  console.log('3. Que las calificaciones sean del año 2025');
  console.log('4. Revisa los logs [Monito] para ver qué está pasando');
}, 2000);

// 7. Limpiar cache si es necesario
// localStorage.removeItem('monito-last-advice-key');
// console.log('Cache del monito limpiado');
