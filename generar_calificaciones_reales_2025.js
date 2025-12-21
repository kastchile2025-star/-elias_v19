const fs = require('fs');
const path = require('path');

// Leer archivos de entrada
const usersPath = path.join(__dirname, 'public/test-data/users-consolidated-2025-CORREGIDO.csv');
const gradesExamplePath = path.join(__dirname, 'public/test-data/grades-consolidated-2025-FIXED.csv');

const usersData = fs.readFileSync(usersPath, 'utf-8');
const gradesExampleData = fs.readFileSync(gradesExamplePath, 'utf-8');

// Parsear CSV de usuarios
function parseCSV(data) {
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    rows.push(row);
  }
  return rows;
}

const usuarios = parseCSV(usersData);
const estudiantes = usuarios
  .filter(u => String(u.role).toLowerCase() === 'student' && u.username);

console.log(`✅ Estudiantes encontrados: ${estudiantes.length}`);
console.log(`📝 Primeros 5: ${estudiantes.slice(0, 5).map(e => e.username).join(', ')}`);

// Definir asignaturas según el proyecto
const asignaturasBasica = [
  { codigo: 'MAT', nombre: 'Matemáticas' },
  { codigo: 'LEN', nombre: 'Lenguaje y Comunicación' },
  { codigo: 'CNT', nombre: 'Ciencias Naturales' },
  { codigo: 'HIS', nombre: 'Historia, Geografía y Ciencias Sociales' }
];

const asignaturasMedia = [
  { codigo: 'MAT', nombre: 'Matemáticas' },
  { codigo: 'LEN', nombre: 'Lenguaje y Comunicación' },
  { codigo: 'BIO', nombre: 'Biología' },
  { codigo: 'FIS', nombre: 'Física' },
  { codigo: 'QUI', nombre: 'Química' },
  { codigo: 'HIS', nombre: 'Historia, Geografía y Ciencias Sociales' },
  { codigo: 'FIL', nombre: 'Filosofía' },
  { codigo: 'EDC', nombre: 'Educación Ciudadana' }
];

// Determinar nivel del estudiante
function getNivelYAsignaturas(course) {
  if (!course) return { nivel: 'basica', asignaturas: asignaturasBasica };
  
  const courseName = String(course).toLowerCase();
  if (courseName.includes('medio')) {
    return { nivel: 'media', asignaturas: asignaturasMedia };
  }
  return { nivel: 'basica', asignaturas: asignaturasBasica };
}

// Tipos de actividades (tareas, evaluaciones, pruebas)
const tipos = ['tarea', 'evaluacion', 'prueba'];

// Funciones auxiliares
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomScore() {
  return getRandomInt(50, 100);
}

function generateCalifications() {
  const calificaciones = [];
  const header = 'studentId,studentName,course,section,subject,subjectId,taskType,score,gradedAt,taskId,title';
  calificaciones.push(header);

  let taskIdCounter = 1;

  estudiantes.forEach((usuario, userIdx) => {
    const { nivel, asignaturas } = getNivelYAsignaturas(usuario.course);
    const studentId = usuario.username;
    const studentName = usuario.name || usuario.username || 'Estudiante';
    const course = usuario.course || 'Curso';
    const section = usuario.section || 'A';

    // Por cada asignatura: 10 calificaciones totales
    // 5 en 1er semestre (marzo-junio)
    // 5 en 2do semestre (julio-diciembre)
    asignaturas.forEach((asignatura) => {
      // 1er Semestre: 5 calificaciones (marzo-junio)
      for (let i = 1; i <= 5; i++) {
        const dayInSemester = getRandomInt(1, 122); // 122 días en Mar-Jun
        const date = new Date(2025, 2, 1); // Marzo 1
        date.setDate(date.getDate() + dayInSemester - 1);

        const tipo = tipos[getRandomInt(0, 2)];
        const score = getRandomScore();
        const gradedAt = date.toISOString();

        const taskId = `task-${taskIdCounter}`;
        const title = `${asignatura.nombre} - ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${i} (1er Sem)`;

        calificaciones.push(
          `${studentId},"${studentName}","${course}","${section}","${asignatura.nombre}","${asignatura.codigo}","${tipo}",${score},${gradedAt},"${taskId}","${title}"`
        );

        taskIdCounter++;
      }

      // 2do Semestre: 5 calificaciones (julio-diciembre)
      for (let i = 1; i <= 5; i++) {
        const dayInSemester = getRandomInt(1, 184); // 184 días en Jul-Dic
        const date = new Date(2025, 6, 1); // Julio 1
        date.setDate(date.getDate() + dayInSemester - 1);

        const tipo = tipos[getRandomInt(0, 2)];
        const score = getRandomScore();
        const gradedAt = date.toISOString();

        const taskId = `task-${taskIdCounter}`;
        const title = `${asignatura.nombre} - ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${i} (2do Sem)`;

        calificaciones.push(
          `${studentId},"${studentName}","${course}","${section}","${asignatura.nombre}","${asignatura.codigo}","${tipo}",${score},${gradedAt},"${taskId}","${title}"`
        );

        taskIdCounter++;
      }
    });
  });

  return calificaciones.join('\n');
}

// Generar el CSV
console.log('\n📊 Generando calificaciones del año 2025...');
const csvContent = generateCalifications();

// Guardar el archivo
const outputPath = path.join(__dirname, 'public/test-data/grades-2025-COMPLETO-REAL.csv');
fs.writeFileSync(outputPath, csvContent, 'utf-8');

console.log(`✅ Archivo creado: ${outputPath}`);
console.log(`📈 Total de líneas: ${csvContent.split('\n').length}`);
console.log(`\n📋 Estructura:`);
console.log(`   - Estudiantes: ${estudiantes.length}`);
console.log(`   - Asignaturas por Básica: 4 (MAT, LEN, CNT, HIS)`);
console.log(`   - Asignaturas por Media: 8 (MAT, LEN, BIO, FIS, QUI, HIS, FIL, EDC)`);
console.log(`   - Calificaciones por asignatura: 10 (5 1er sem + 5 2do sem)`);
console.log(`   - Tipos de actividades: Tarea, Evaluación, Prueba`);

// Mostrar ejemplo
const lines = csvContent.split('\n');
console.log(`\n📌 Primeras 6 líneas (header + 5 datos):`);
for (let i = 0; i < Math.min(6, lines.length); i++) {
  console.log(lines[i]);
}

console.log(`\n✨ ¡Archivo listo para cargar!`);
