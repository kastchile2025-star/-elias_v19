const fs = require('fs');

// Leer estudiantes de 1° Básico del archivo CSV
const usersFile = fs.readFileSync('users-consolidated-2025-CORREGIDO.csv', 'utf8');
const usersLines = usersFile.split('\n').slice(1).filter(line => line.trim());

const students = usersLines
  .map(line => {
    const parts = line.split(',');
    return {
      nombre: parts[1],
      rut: parts[2],
      curso: parts[6],
      seccion: parts[7]
    };
  })
  .filter(s => s.curso === '1ro Básico'); // Solo 1° Básico A y B

console.log(`📚 Cargados ${students.length} estudiantes de 1° Básico`);

// Asignaturas específicas
const asignaturas = [
  'Ciencias Naturales',
  'Lenguaje y Comunicación',
  'Matemáticas',
  'Historia, Geografía y Ciencias Sociales'
];

// Profesores por asignatura y sección
const profesores = {
  'A': {
    'Ciencias Naturales': 'Prof. Ana Torres',
    'Lenguaje y Comunicación': 'Prof. Carmen López',
    'Matemáticas': 'Prof. Luis Morales',
    'Historia, Geografía y Ciencias Sociales': 'Prof. Roberto Muñoz'
  },
  'B': {
    'Ciencias Naturales': 'Prof. Rosa Vega',
    'Lenguaje y Comunicación': 'Prof. Pedro Silva',
    'Matemáticas': 'Prof. Isabel Ramírez',
    'Historia, Geografía y Ciencias Sociales': 'Prof. Marcela Fuentes'
  }
};

// Actividades para 1er Semestre (marzo - junio) - 6 actividades por asignatura
const actividades1erSemestre = [
  // Matemáticas (6)
  { asignatura: 'Matemáticas', fecha: '2025-03-10', tipo: 'tarea', tema: 'Números del 0 al 10' },
  { asignatura: 'Matemáticas', fecha: '2025-03-20', tipo: 'prueba', tema: 'Números hasta el 20' },
  { asignatura: 'Matemáticas', fecha: '2025-04-10', tipo: 'tarea', tema: 'Suma sin Reserva' },
  { asignatura: 'Matemáticas', fecha: '2025-04-25', tipo: 'prueba', tema: 'Suma y Resta Básica' },
  { asignatura: 'Matemáticas', fecha: '2025-05-15', tipo: 'tarea', tema: 'Figuras Geométricas' },
  { asignatura: 'Matemáticas', fecha: '2025-06-20', tipo: 'prueba', tema: 'Números hasta el 50' },
  
  // Lenguaje y Comunicación (6)
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-03-12', tipo: 'tarea', tema: 'Las Vocales' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-03-25', tipo: 'prueba', tema: 'Comprensión Lectora Inicial' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-04-15', tipo: 'tarea', tema: 'Consonantes M, P, L' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-05-05', tipo: 'prueba', tema: 'Lectura de Sílabas' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-05-28', tipo: 'tarea', tema: 'Escritura de Palabras' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-06-25', tipo: 'prueba', tema: 'Lectura de Palabras' },
  
  // Ciencias Naturales (6)
  { asignatura: 'Ciencias Naturales', fecha: '2025-03-14', tipo: 'tarea', tema: 'Los Seres Vivos' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-03-28', tipo: 'prueba', tema: 'Animales y Plantas' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-04-18', tipo: 'tarea', tema: 'Partes del Cuerpo Humano' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-05-10', tipo: 'prueba', tema: 'Los Sentidos' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-06-05', tipo: 'tarea', tema: 'Hábitos Saludables' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-06-27', tipo: 'prueba', tema: 'Los Animales y sus Características' },
  
  // Historia, Geografía y Ciencias Sociales (6)
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-03-17', tipo: 'tarea', tema: 'Mi Familia' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-04-05', tipo: 'prueba', tema: 'La Casa y la Familia' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-04-28', tipo: 'tarea', tema: 'Mi Escuela' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-05-20', tipo: 'prueba', tema: 'La Comunidad' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-06-10', tipo: 'tarea', tema: 'Oficios y Profesiones' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-06-28', tipo: 'prueba', tema: 'Símbolos Patrios' }
];

// Actividades para 2do Semestre (julio - diciembre) - 6 actividades por asignatura
const actividades2doSemestre = [
  // Matemáticas (6)
  { asignatura: 'Matemáticas', fecha: '2025-07-15', tipo: 'tarea', tema: 'Números hasta el 70' },
  { asignatura: 'Matemáticas', fecha: '2025-08-05', tipo: 'prueba', tema: 'Números hasta el 100' },
  { asignatura: 'Matemáticas', fecha: '2025-08-28', tipo: 'tarea', tema: 'Suma con Reserva' },
  { asignatura: 'Matemáticas', fecha: '2025-09-25', tipo: 'prueba', tema: 'Resta sin Reserva' },
  { asignatura: 'Matemáticas', fecha: '2025-10-23', tipo: 'tarea', tema: 'Problemas Matemáticos' },
  { asignatura: 'Matemáticas', fecha: '2025-11-27', tipo: 'prueba', tema: 'Evaluación Final Matemáticas' },
  
  // Lenguaje y Comunicación (6)
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-07-18', tipo: 'tarea', tema: 'Lectura de Oraciones' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-08-08', tipo: 'prueba', tema: 'Comprensión de Textos Breves' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-09-05', tipo: 'tarea', tema: 'La Oración Simple' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-09-30', tipo: 'prueba', tema: 'Artículos y Sustantivos' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-10-28', tipo: 'tarea', tema: 'Escritura Creativa' },
  { asignatura: 'Lenguaje y Comunicación', fecha: '2025-11-28', tipo: 'prueba', tema: 'Evaluación Final Lenguaje' },
  
  // Ciencias Naturales (6)
  { asignatura: 'Ciencias Naturales', fecha: '2025-07-22', tipo: 'tarea', tema: 'Las Plantas y sus Partes' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-08-12', tipo: 'prueba', tema: 'Ciclo de Vida de las Plantas' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-09-10', tipo: 'tarea', tema: 'El Agua en la Naturaleza' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-10-08', tipo: 'prueba', tema: 'Estados del Agua' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-11-05', tipo: 'tarea', tema: 'El Sol y la Tierra' },
  { asignatura: 'Ciencias Naturales', fecha: '2025-12-03', tipo: 'prueba', tema: 'Evaluación Final Ciencias' },
  
  // Historia, Geografía y Ciencias Sociales (6)
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-07-25', tipo: 'tarea', tema: 'Mi País Chile' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-08-15', tipo: 'prueba', tema: 'Regiones de Chile' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-09-12', tipo: 'tarea', tema: 'Fiestas Patrias' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-10-10', tipo: 'prueba', tema: 'Pueblos Originarios' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-11-14', tipo: 'tarea', tema: 'Derechos y Deberes' },
  { asignatura: 'Historia, Geografía y Ciencias Sociales', fecha: '2025-12-05', tipo: 'prueba', tema: 'Evaluación Final Historia' }
];

// Combinar ambos semestres
const todasActividades = [...actividades1erSemestre, ...actividades2doSemestre];

// Función para generar nota aleatoria entre 40 y 100
function generarNota() {
  return Math.floor(Math.random() * 61 + 40); // 40-100
}

// Generar CSV
const rows = ['nombre,rut,curso,seccion,asignatura,profesor,fecha,tipo,nota,tema'];

students.forEach(student => {
  todasActividades.forEach(actividad => {
    const profesor = profesores[student.seccion][actividad.asignatura];
    const nota = generarNota();
    
    rows.push(
      `${student.nombre},${student.rut},${student.curso},${student.seccion},${actividad.asignatura},${profesor},${actividad.fecha},${actividad.tipo},${nota},${actividad.tema}`
    );
  });
});

// Escribir archivo
fs.writeFileSync('calificaciones-1ro-basico-completo-2025.csv', rows.join('\n'), 'utf8');

console.log(`✅ Archivo generado: calificaciones-1ro-basico-completo-2025.csv`);
console.log(`   - Estudiantes: ${students.length}`);
console.log(`   - Actividades por estudiante: ${todasActividades.length}`);
console.log(`   - Total calificaciones: ${students.length * todasActividades.length}`);
console.log(`   - 1er Semestre: ${actividades1erSemestre.length} actividades`);
console.log(`   - 2do Semestre: ${actividades2doSemestre.length} actividades`);
console.log(`   - Asignaturas: ${asignaturas.join(', ')}`);
console.log(`   - Notas: escala 0-100`);
