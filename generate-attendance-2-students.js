/**
 * Genera archivo CSV de asistencia para 2 estudiantes de 1ro Básico A
 * Año 2025 completo (marzo a diciembre)
 * Solo días lunes a viernes
 */

const fs = require('fs');

// Estudiantes de 1ro Básico A
const students = [
  {
    username: 's.gonzalez0000',
    rut: '10000000-8',
    name: 'Sofía González Martínez',
    course: '1ro Básico',
    section: 'A'
  },
  {
    username: 'm.lopez0001',
    rut: '10000001-6',
    name: 'Matías López Silva',
    course: '1ro Básico',
    section: 'A'
  }
];

// Estados de asistencia con sus probabilidades
const statuses = [
  { status: 'present', weight: 85, comment: '' },
  { status: 'late', weight: 8, comment: 'Llegó tarde' },
  { status: 'absent', weight: 5, comment: 'Inasistencia justificada' },
  { status: 'excused', weight: 2, comment: 'Con justificativo médico' }
];

// Función para obtener un estado aleatorio ponderado
function getRandomStatus() {
  const random = Math.random() * 100;
  let accumulated = 0;
  
  for (const s of statuses) {
    accumulated += s.weight;
    if (random <= accumulated) {
      return { status: s.status, comment: s.comment };
    }
  }
  
  return { status: 'present', comment: '' };
}

// Función para verificar si es día hábil (lunes a viernes)
function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5; // 1 = lunes, 5 = viernes
}

// Función para formatear fecha YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generar registros de asistencia
function generateAttendanceRecords() {
  const records = [];
  
  // Definir períodos del año escolar 2025
  const periods = [
    // Primer Semestre: Marzo a Junio
    { start: new Date(2025, 2, 1), end: new Date(2025, 5, 30) },  // Marzo a Junio
    // Segundo Semestre: Julio a Diciembre
    { start: new Date(2025, 6, 1), end: new Date(2025, 11, 20) }  // Julio a Diciembre
  ];
  
  // Feriados y días no lectivos 2025 Chile
  const holidays = [
    '2025-03-29', // Viernes Santo
    '2025-04-18', // Viernes Santo (ajustado)
    '2025-05-01', // Día del Trabajo
  '2025-05-21', // Día de las Glorias Navales
    '2025-06-29', // San Pedro y San Pablo
    '2025-07-16', // Virgen del Carmen
    '2025-08-15', // Asunción de la Virgen
    '2025-09-18', // Fiestas Patrias
    '2025-09-19', // Fiestas Patrias
    '2025-10-12', // Encuentro de Dos Mundos
    '2025-10-31', // Día Nacional de las Iglesias Evangélicas
    '2025-11-01', // Todos los Santos
    '2025-12-08', // Inmaculada Concepción
  ];
  
  // Recorrer cada período
  for (const period of periods) {
    const currentDate = new Date(period.start);
    
    while (currentDate <= period.end) {
      // Solo días hábiles (lunes a viernes)
      if (isWeekday(currentDate)) {
        const dateStr = formatDate(currentDate);
        
        // Saltar feriados
        if (!holidays.includes(dateStr)) {
          // Generar registro para cada estudiante
          for (const student of students) {
            const { status, comment } = getRandomStatus();
            
            records.push({
              date: dateStr,
              course: student.course,
              section: student.section,
              studentUsername: student.username,
              rut: student.rut,
              name: student.name,
              status: status,
              comment: comment
            });
          }
        }
      }
      
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return records;
}

// Generar CSV
function generateCSV() {
  console.log('📋 Generando archivo de asistencia para 2 estudiantes de 1ro Básico A...');
  
  const records = generateAttendanceRecords();
  
  // Crear contenido CSV
  const header = 'date,course,section,studentUsername,rut,name,status,comment';
  const rows = records.map(r => 
    `${r.date},${r.course},${r.section},${r.studentUsername},${r.rut},${r.name},${r.status},${r.comment}`
  );
  
  const csvContent = [header, ...rows].join('\n');
  
  // Guardar archivo
  const filename = 'asistencia-2-estudiantes-1ro-basico-A-2025.csv';
  fs.writeFileSync(filename, csvContent, 'utf-8');
  
  console.log(`✅ Archivo generado: ${filename}`);
  console.log(`📊 Total de registros: ${records.length}`);
  console.log(`👥 Estudiantes: ${students.length}`);
  console.log(`📅 Primer registro: ${records[0].date}`);
  console.log(`📅 Último registro: ${records[records.length - 1].date}`);
  
  // Estadísticas por estudiante
  console.log('\n📈 Estadísticas por estudiante:');
  for (const student of students) {
    const studentRecords = records.filter(r => r.studentUsername === student.username);
    const present = studentRecords.filter(r => r.status === 'present').length;
    const late = studentRecords.filter(r => r.status === 'late').length;
    const absent = studentRecords.filter(r => r.status === 'absent').length;
    const excused = studentRecords.filter(r => r.status === 'excused').length;
    
    console.log(`\n  👤 ${student.name}`);
    console.log(`     Total días: ${studentRecords.length}`);
    console.log(`     ✅ Presente: ${present} (${((present/studentRecords.length)*100).toFixed(1)}%)`);
    console.log(`     ⏰ Atrasado: ${late} (${((late/studentRecords.length)*100).toFixed(1)}%)`);
    console.log(`     ❌ Ausente: ${absent} (${((absent/studentRecords.length)*100).toFixed(1)}%)`);
    console.log(`     📋 Justificado: ${excused} (${((excused/studentRecords.length)*100).toFixed(1)}%)`);
  }
}

// Ejecutar
generateCSV();
