#!/usr/bin/env node

/**
 * Generador de Calificaciones CSV para 2025
 * Crea 10 calificaciones por asignatura para cada estudiante
 * Semestre 1: Marzo - Junio (5 calificaciones)
 * Semestre 2: Julio - Diciembre (5 calificaciones)
 */

const fs = require('fs');
const path = require('path');

// Tipos de calificación
const TYPES = ['tarea', 'evaluacion', 'prueba'];

// Asignaturas comunes
const SUBJECTS = [
  'Matemáticas',
  'Lenguaje y Comunicación',
  'Historia, Geografía y Ciencias Sociales',
  'Ciencias Naturales',
  'Educación Física',
  'Artes Visuales',
  'Música',
  'Inglés',
  'Tecnología',
  'Orientación'
];

// Profesores por asignatura
const TEACHERS = {
  'Matemáticas': ['Ana González Muñoz', 'Pedro Rodríguez Silva', 'María López García'],
  'Lenguaje y Comunicación': ['Carmen López Valenzuela', 'Juan García Torres', 'Sofía Martínez Vega'],
  'Historia, Geografía y Ciencias Sociales': ['Roberto Fernández Castro', 'Gabriela Sánchez Rojas', 'Carlos Herrera Núñez'],
  'Ciencias Naturales': ['Valentina Torres Díaz', 'Diego Morales Soto', 'Catalina Reyes Guzmán'],
  'Educación Física': ['Sebastián Silva Morales', 'Francisco Vargas Jiménez', 'Antonia Castro Campos'],
  'Artes Visuales': ['Isidora Flores Paredes', 'Manuel Romero Cortés', 'Josefa Ruiz Sepúlveda'],
  'Música': ['Vicente Tapia Iglesias', 'Francisca Medina Aros', 'Nicolás Valenzuela Cruz'],
  'Inglés': ['Maximiliano Espinoza Molina', 'Renata Contreras Vera', 'Joaquín Araya Peña'],
  'Tecnología': ['Gabriel Vergara Pacheco', 'Trinidad Santana Ibarra', 'Samuel Jara Bustos'],
  'Orientación': ['Cristóbal Cortés Sandoval', 'Constanza Riquelme Carvajal', 'Andrés Poblete Oyarzún']
};

// Leer archivo de estudiantes
function readStudents(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return [];
  
  // Saltar encabezado
  const headers = lines[0].split(',');
  const students = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parsear CSV simple (sin comillas)
    const parts = line.split(',');
    if (parts.length < 8) continue;
    
    const role = parts[0]?.trim();
    if (role !== 'student') continue;
    
    const name = parts[1]?.trim();
    const rut = parts[2]?.trim();
    const email = parts[3]?.trim();
    const course = parts[6]?.trim();
    const section = parts[7]?.trim();
    
    if (name && rut && course && section) {
      students.push({ name, rut, email, course, section });
    }
  }
  
  return students;
}

// Generar calificación aleatoria (60-100)
function generateGrade() {
  return Math.floor(Math.random() * 41) + 60;
}

// Generar fecha aleatoria en un rango
function generateDate(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = Math.random() * (end - start) + start;
  const date = new Date(randomTime);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Obtener profesor aleatorio para una asignatura
function getRandomTeacher(subject) {
  const teachers = TEACHERS[subject] || ['Profesor Genérico'];
  return teachers[Math.floor(Math.random() * teachers.length)];
}

// Generar tipo de calificación (distribuido)
function generateType(index) {
  // Distribuir tipos: índices 0,1 = tarea; 2,3 = evaluación; 4 = prueba (ambos semestres)
  if (index % 5 < 2) return 'tarea';
  if (index % 5 < 4) return 'evaluacion';
  return 'prueba';
}

// Generar calificaciones para un estudiante
function generateStudentGrades(student) {
  const grades = [];
  
  SUBJECTS.forEach(subject => {
    // 5 calificaciones en semestre 1 (marzo-junio)
    for (let i = 0; i < 5; i++) {
      const date = generateDate('2025-03-01', '2025-06-30');
      const type = generateType(i);
      const note = generateGrade();
      const teacher = getRandomTeacher(subject);
      
      grades.push({
        nombre: student.name,
        rut: student.rut,
        curso: student.course,
        seccion: student.section,
        asignatura: subject,
        profesor: teacher,
        fecha: date,
        tipo: type,
        nota: note
      });
    }
    
    // 5 calificaciones en semestre 2 (julio-diciembre)
    for (let i = 0; i < 5; i++) {
      const date = generateDate('2025-07-01', '2025-12-31');
      const type = generateType(i);
      const note = generateGrade();
      const teacher = getRandomTeacher(subject);
      
      grades.push({
        nombre: student.name,
        rut: student.rut,
        curso: student.course,
        seccion: student.section,
        asignatura: subject,
        profesor: teacher,
        fecha: date,
        tipo: type,
        nota: note
      });
    }
  });
  
  return grades;
}

// Convertir objeto a CSV line
function objectToCSVLine(obj, headers) {
  return headers.map(header => {
    const value = obj[header] || '';
    // Escapar comillas y envolover en comillas si contiene comas
    if (String(value).includes(',') || String(value).includes('"')) {
      return `"${String(value).replace(/"/g, '""')}"`;
    }
    return value;
  }).join(',');
}

// Main
function main() {
  console.log('📚 Generando calificaciones para 2025...');
  
  // Leer estudiantes
  const studentsFile = '/workspaces/superjf_v16/public/test-data/users-consolidated-2025-CORREGIDO.csv';
  const students = readStudents(studentsFile);
  
  console.log(`✅ Se leyeron ${students.length} estudiantes`);
  
  if (students.length === 0) {
    console.error('❌ No se encontraron estudiantes');
    process.exit(1);
  }
  
  // Headers del CSV
  const headers = ['Nombre', 'RUT', 'Curso', 'Sección', 'Asignatura', 'Profesor', 'Fecha', 'Tipo', 'Nota'];
  
  // Generar todas las calificaciones
  let allGrades = [];
  
  students.forEach((student, index) => {
    const studentGrades = generateStudentGrades(student);
    allGrades = allGrades.concat(studentGrades);
    
    if ((index + 1) % 100 === 0) {
      console.log(`⏳ Procesados ${index + 1} estudiantes...`);
    }
  });
  
  console.log(`✅ Total de calificaciones generadas: ${allGrades.length}`);
  console.log(`   (${students.length} estudiantes × ${SUBJECTS.length} asignaturas × 10 calificaciones)`);
  
  // Crear CSV
  const outputPath = '/workspaces/superjf_v16/public/test-data/grades-consolidated-2025-COMPLETO.csv';
  
  let csvContent = headers.join(',') + '\n';
  
  allGrades.forEach(grade => {
    const line = objectToCSVLine(
      {
        Nombre: grade.nombre,
        RUT: grade.rut,
        Curso: grade.curso,
        Sección: grade.seccion,
        Asignatura: grade.asignatura,
        Profesor: grade.profesor,
        Fecha: grade.fecha,
        Tipo: grade.tipo,
        Nota: grade.nota
      },
      headers
    );
    csvContent += line + '\n';
  });
  
  // Guardar archivo
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  
  console.log(`\n✅ Archivo generado: ${path.basename(outputPath)}`);
  console.log(`📊 Líneas totales: ${allGrades.length + 1} (incluyendo encabezado)`);
  console.log(`📁 Ubicación: ${outputPath}`);
  
  // Estadísticas
  const typeStats = {};
  const subjectStats = {};
  
  allGrades.forEach(grade => {
    typeStats[grade.tipo] = (typeStats[grade.tipo] || 0) + 1;
    subjectStats[grade.asignatura] = (subjectStats[grade.asignatura] || 0) + 1;
  });
  
  console.log('\n📈 Estadísticas:');
  console.log('Tipos de calificación:');
  Object.entries(typeStats).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
  
  console.log('\nCalificaciones por asignatura:');
  SUBJECTS.forEach(subject => {
    console.log(`  - ${subject}: ${subjectStats[subject] || 0}`);
  });
}

main();
