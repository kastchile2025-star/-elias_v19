const fs = require('fs');

// Leer estudiantes
const csvContent = fs.readFileSync('/workspaces/Peloduro_v9/public/test-data/users-consolidated-2025-CORREGIDO_v2.csv', 'utf-8');
const lines = csvContent.split('\n');
const students = lines.slice(1).filter(l => l.trim()).map(line => {
  const parts = line.split(',');
  return {
    role: parts[0],  // IMPORTANTE: incluir rol para filtrar
    name: parts[1],
    rut: parts[2],
    course: parts[6],
    section: parts[7]
  };
}).filter(s => 
  s.role === 'student' &&  // ✅ CORREGIDO: Solo estudiantes, no profesores
  s.name && 
  ['1ro Básico', '2do Básico', '1ro Medio', '2do Medio'].includes(s.course)
);

// Asignaturas por nivel
const asignaturas = {
  '1ro Básico': ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
  '2do Básico': ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
  '1ro Medio': ['Biología', 'Educación Ciudadana', 'Filosofía', 'Física', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas', 'Química'],
  '2do Medio': ['Biología', 'Educación Ciudadana', 'Filosofía', 'Física', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas', 'Química']
};

// Temas por asignatura
const temas = {
  'Ciencias Naturales': ['Los seres vivos', 'Las plantas', 'Los animales', 'El agua', 'El aire', 'El ciclo del agua', 'Estados de la materia', 'El cuerpo humano', 'Ecosistemas', 'Energía'],
  'Historia, Geografía y Ciencias Sociales': ['Mi familia', 'Mi comunidad', 'Chile y sus regiones', 'Pueblos originarios', 'Símbolos patrios', 'Geografía de Chile', 'Historia de Chile', 'Derechos y deberes', 'Democracia', 'Economía'],
  'Lenguaje y Comunicación': ['Comprensión lectora', 'Escritura', 'Gramática', 'Ortografía', 'Expresión oral', 'Literatura', 'Textos narrativos', 'Textos informativos', 'Vocabulario', 'Redacción'],
  'Matemáticas': ['Números naturales', 'Operaciones básicas', 'Fracciones', 'Geometría', 'Medición', 'Patrones', 'Resolución de problemas', 'Datos y azar', 'Álgebra', 'Ecuaciones'],
  'Biología': ['Célula', 'Genética', 'Evolución', 'Ecosistemas', 'Biodiversidad', 'Sistema nervioso', 'Sistema circulatorio', 'Reproducción', 'Nutrición', 'Homeostasis'],
  'Educación Ciudadana': ['Democracia', 'Derechos humanos', 'Participación ciudadana', 'Constitución', 'Estado de derecho', 'Instituciones', 'Ciudadanía', 'Política', 'Valores cívicos', 'Responsabilidad social'],
  'Filosofía': ['Lógica', 'Ética', 'Metafísica', 'Epistemología', 'Estética', 'Filosofía política', 'Antropología filosófica', 'Argumentación', 'Pensamiento crítico', 'Filosofía antigua'],
  'Física': ['Mecánica', 'Ondas', 'Electricidad', 'Magnetismo', 'Termodinámica', 'Óptica', 'Cinemática', 'Dinámica', 'Energía', 'Física moderna'],
  'Química': ['Estructura atómica', 'Tabla periódica', 'Enlaces químicos', 'Reacciones químicas', 'Estequiometría', 'Soluciones', 'Ácidos y bases', 'Química orgánica', 'Gases', 'Termoquímica']
};

// Tipos de actividad
const tipos = ['prueba', 'tarea', 'evaluacion'];

// Fechas por mes para cada semestre (10 actividades cada uno)
// 1er semestre: marzo a junio
const fechas_s1 = [
  '2025-03-10', '2025-03-24',
  '2025-04-07', '2025-04-21',
  '2025-05-05', '2025-05-19',
  '2025-06-02', '2025-06-16', '2025-06-23', '2025-06-30'
];

// 2do semestre: julio a diciembre
const fechas_s2 = [
  '2025-07-14', '2025-07-28',
  '2025-08-11', '2025-08-25',
  '2025-09-08', '2025-09-22',
  '2025-10-06', '2025-10-20',
  '2025-11-03', '2025-11-17'
];

// Función para generar nota con distribución (10-20% reprobados)
function generarNota(isReprobado) {
  if (isReprobado) {
    // Nota reprobada: 1-59
    return Math.floor(Math.random() * 59) + 1;
  } else {
    // Nota aprobada: 60-100
    return Math.floor(Math.random() * 41) + 60;
  }
}

// Generar CSV
let csvOutput = 'nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema\n';
let rowCount = 0;

// Función para escapar campos CSV (agregar comillas si contiene comas)
function escapeCSV(field) {
  if (field && field.includes(',')) {
    return `"${field}"`;
  }
  return field;
}

// Agrupar estudiantes por sección
const studentsBySection = {};
students.forEach(s => {
  const key = s.course + '-' + s.section;
  if (!studentsBySection[key]) studentsBySection[key] = [];
  studentsBySection[key].push(s);
});

// Para cada sección, definir qué estudiantes serán reprobados (10-20%)
Object.keys(studentsBySection).forEach(sectionKey => {
  const sectionStudents = studentsBySection[sectionKey];
  const numReprobados = Math.floor(sectionStudents.length * (0.10 + Math.random() * 0.10)); // 10-20%
  
  // Marcar estudiantes que serán mayormente reprobados
  const reprobadosIndices = new Set();
  while (reprobadosIndices.size < numReprobados) {
    reprobadosIndices.add(Math.floor(Math.random() * sectionStudents.length));
  }
  
  sectionStudents.forEach((student, idx) => {
    const isLowPerformer = reprobadosIndices.has(idx);
    const curso = student.course;
    const asignaturasDelCurso = asignaturas[curso];
    
    asignaturasDelCurso.forEach(asignatura => {
      const temasAsignatura = temas[asignatura];
      
      // 10 actividades primer semestre
      fechas_s1.forEach((fecha, i) => {
        const tipo = tipos[i % 3];
        const tema = temasAsignatura[i % temasAsignatura.length];
        // Estudiantes de bajo rendimiento tienen 60% prob de reprobar, otros 5%
        const isReprobado = isLowPerformer ? Math.random() < 0.6 : Math.random() < 0.05;
        const nota = generarNota(isReprobado);
        
        csvOutput += `${escapeCSV(student.name)},${student.rut},${student.course},${student.section},${escapeCSV(asignatura)},${tipo},${fecha},${nota},${escapeCSV(tema)}\n`;
        rowCount++;
      });
      
      // 10 actividades segundo semestre
      fechas_s2.forEach((fecha, i) => {
        const tipo = tipos[i % 3];
        const tema = temasAsignatura[(i + 5) % temasAsignatura.length];
        const isReprobado = isLowPerformer ? Math.random() < 0.6 : Math.random() < 0.05;
        const nota = generarNota(isReprobado);
        
        csvOutput += `${escapeCSV(student.name)},${student.rut},${student.course},${student.section},${escapeCSV(asignatura)},${tipo},${fecha},${nota},${escapeCSV(tema)}\n`;
        rowCount++;
      });
    });
  });
});

// Guardar archivo
fs.writeFileSync('/workspaces/Peloduro_v9/calificaciones-carga-masiva-completa-2025.csv', csvOutput);

console.log('✅ Archivo generado exitosamente!');
console.log('📊 Total de registros:', rowCount);
console.log('📁 Ubicación: /workspaces/Peloduro_v9/calificaciones-carga-masiva-completa-2025.csv');

// Calcular estadísticas
const basicoStudents = students.filter(s => s.course.includes('Básico')).length;
const medioStudents = students.filter(s => s.course.includes('Medio')).length;
const basicoCount = basicoStudents * 4 * 20; // 4 asignaturas * 20 actividades
const medioCount = medioStudents * 8 * 20; // 8 asignaturas * 20 actividades

console.log('\n📋 Desglose:');
console.log(`- Estudiantes Básica: ${basicoStudents} (1ro y 2do Básico A/B)`);
console.log(`- Estudiantes Media: ${medioStudents} (1ro y 2do Medio A/B)`);
console.log(`- Calificaciones Básica (${basicoStudents} est x 4 asig x 20 act): ${basicoCount}`);
console.log(`- Calificaciones Media (${medioStudents} est x 8 asig x 20 act): ${medioCount}`);
console.log(`- Total esperado: ${basicoCount + medioCount}`);
