/**
 * Generador de asistencia anual para todos los estudiantes
 * Genera un CSV con asistencia de marzo a diciembre 2025
 */

const fs = require('fs').promises;
const Papa = require('papaparse');

// Configuración
const YEAR = 2025;
const START_MONTH = 3; // Marzo
const END_MONTH = 12; // Diciembre

// Días festivos y vacaciones (no se marca asistencia)
const HOLIDAYS = [
  '2025-04-18', '2025-04-19', // Semana Santa
  '2025-05-01', // Día del Trabajo
  '2025-05-21', // Glorias Navales
  '2025-06-29', // San Pedro y San Pablo
  '2025-07-16', // Día de la Virgen del Carmen
  '2025-08-15', // Asunción de la Virgen
  '2025-09-18', '2025-09-19', // Fiestas Patrias
  '2025-10-12', // Día de la Raza
  '2025-10-31', // Día de las Iglesias Evangélicas
  '2025-11-01', // Todos los Santos
  '2025-12-08', // Inmaculada Concepción
];

// Vacaciones de invierno (2 semanas en julio)
const WINTER_VACATION_START = new Date(2025, 6, 14); // 14 julio
const WINTER_VACATION_END = new Date(2025, 6, 25); // 25 julio

// Vacaciones de verano (desde 20 diciembre)
const SUMMER_VACATION_START = new Date(2025, 11, 20); // 20 diciembre

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Domingo o Sábado
}

function isHoliday(dateStr) {
  return HOLIDAYS.includes(dateStr);
}

function isWinterVacation(date) {
  return date >= WINTER_VACATION_START && date <= WINTER_VACATION_END;
}

function isSummerVacation(date) {
  return date >= SUMMER_VACATION_START;
}

function isSchoolDay(date) {
  const dateStr = formatDate(date);
  
  if (isWeekend(date)) return false;
  if (isHoliday(dateStr)) return false;
  if (isWinterVacation(date)) return false;
  if (isSummerVacation(date)) return false;
  
  return true;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateAttendance(probability = 0.95) {
  // 95% de probabilidad de asistir, 5% de ausentarse
  const rand = Math.random();
  
  if (rand < probability) {
    return 'present'; // Presente
  } else if (rand < probability + 0.03) {
    return 'late'; // Tarde (3%)
  } else if (rand < probability + 0.04) {
    return 'excused'; // Justificado (1%)
  } else {
    return 'absent'; // Ausente (1%)
  }
}

function getSchoolDays(year, startMonth, endMonth) {
  const schoolDays = [];
  
  for (let month = startMonth - 1; month < endMonth; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      if (isSchoolDay(date)) {
        schoolDays.push(date);
      }
    }
  }
  
  return schoolDays;
}

async function generateAttendanceCSV() {
  try {
    console.log('📚 Leyendo archivo de estudiantes...');
    const studentsFile = await fs.readFile('users-consolidated-2025-CORREGIDO.csv', 'utf-8');
    const studentsData = Papa.parse(studentsFile, { header: true, skipEmptyLines: true });
    
    const students = studentsData.data.filter(row => row.role === 'student');
    console.log(`✅ Encontrados ${students.length} estudiantes`);
    
    console.log('📅 Generando días escolares marzo-diciembre 2025...');
    const schoolDays = getSchoolDays(YEAR, START_MONTH, END_MONTH);
    console.log(`✅ ${schoolDays.length} días escolares generados`);
    
    console.log('🎲 Generando registros de asistencia...');
    const attendanceRecords = [];
    
    for (const student of students) {
      // Probabilidad de asistencia por estudiante (entre 90% y 98%)
      const attendanceProbability = 0.90 + (Math.random() * 0.08);
      
      for (const date of schoolDays) {
        const status = generateAttendance(attendanceProbability);
        
        attendanceRecords.push({
          date: formatDate(date),
          course: student.course || '',
          section: student.section || '',
          studentUsername: student.username || '',
          rut: student.rut || '',
          name: student.name || '',
          status: status,
          comment: status === 'excused' ? 'Justificado por apoderado' : 
                   status === 'late' ? 'Atraso menor' : ''
        });
      }
    }
    
    console.log(`✅ ${attendanceRecords.length} registros generados`);
    
    // Generar CSV
    console.log('💾 Generando archivo CSV...');
    const csv = Papa.unparse(attendanceRecords, {
      quotes: true,
      header: true,
      columns: ['date', 'course', 'section', 'studentUsername', 'rut', 'name', 'status', 'comment']
    });
    
    const outputFile = 'attendance-full-year-2025.csv';
    await fs.writeFile(outputFile, csv, 'utf-8');
    
    console.log(`\n✅ Archivo generado: ${outputFile}`);
    console.log(`📊 Estadísticas:`);
    console.log(`   - Total estudiantes: ${students.length}`);
    console.log(`   - Días escolares: ${schoolDays.length}`);
    console.log(`   - Registros totales: ${attendanceRecords.length}`);
    
    // Estadísticas de asistencia
    const statusCount = {
      present: attendanceRecords.filter(r => r.status === 'present').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      excused: attendanceRecords.filter(r => r.status === 'excused').length,
    };
    
    console.log(`\n📈 Distribución de asistencia:`);
    console.log(`   - Presente: ${statusCount.present} (${(statusCount.present/attendanceRecords.length*100).toFixed(1)}%)`);
    console.log(`   - Ausente: ${statusCount.absent} (${(statusCount.absent/attendanceRecords.length*100).toFixed(1)}%)`);
    console.log(`   - Tarde: ${statusCount.late} (${(statusCount.late/attendanceRecords.length*100).toFixed(1)}%)`);
    console.log(`   - Justificado: ${statusCount.excused} (${(statusCount.excused/attendanceRecords.length*100).toFixed(1)}%)`);
    
    console.log(`\n🎯 Archivo listo para carga masiva en Firebase!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateAttendanceCSV();
