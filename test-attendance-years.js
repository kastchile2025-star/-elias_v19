// Script para probar el selector de año en el gráfico de Asistencia - Periodo
console.log('=== VERIFICANDO DATOS DE ASISTENCIA POR AÑO ===');

// Verificar datos de 2024
const attendance2024 = JSON.parse(localStorage.getItem('smart-student-attendance-2024') || '[]');
console.log('Datos 2024:', {
  total: attendance2024.length,
  sample: attendance2024.slice(0, 3)
});

// Verificar datos de 2023
const attendance2023 = JSON.parse(localStorage.getItem('smart-student-attendance-2023') || '[]');
console.log('Datos 2023:', {
  total: attendance2023.length,
  sample: attendance2023.slice(0, 3)
});

// Verificar LocalStorageManager
try {
  const { LocalStorageManager } = require('@/lib/education-utils');
  console.log('LocalStorageManager disponible:', !!LocalStorageManager);
  console.log('Datos 2024 via LSM:', (LocalStorageManager.getAttendanceForYear(2024) || []).length);
  console.log('Datos 2023 via LSM:', (LocalStorageManager.getAttendanceForYear(2023) || []).length);
} catch (e) {
  console.log('Error cargando LocalStorageManager:', e.message);
}

console.log('=== FIN VERIFICACIÓN ===');