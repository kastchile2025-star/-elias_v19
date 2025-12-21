// Script para generar archivo CSV de carga masiva de calificaciones
const fs = require('fs');

// Leer archivo de estudiantes
const studentsFile = fs.readFileSync('./public/test-data/users-consolidated-2025-CORREGIDO_v2.csv', 'utf-8');
const lines = studentsFile.split('\n').filter(line => line.trim());
const students = [];

// Parsear estudiantes
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts[0] === 'student') {
    students.push({
      name: parts[1],
      rut: parts[2],
      course: parts[6],
      section: parts[7]
    });
  }
}

// Definir secciones y asignaturas requeridas
const courseSubjects = {
  '1ro Básico': {
    sections: ['A', 'B'],
    subjects: ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas']
  },
  '2do Básico': {
    sections: ['A', 'B'],
    subjects: ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas']
  },
  '1ro Medio': {
    sections: ['A', 'B'],
    subjects: ['Biología', 'Educación Ciudadana', 'Filosofía', 'Física', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas', 'Química']
  },
  '2do Medio': {
    sections: ['A', 'B'],
    subjects: ['Biología', 'Educación Ciudadana', 'Filosofía', 'Física', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas', 'Química']
  }
};

// Temas por asignatura (10 temas para 1er semestre, 10 para 2do semestre)
const topicsBySubject = {
  'Ciencias Naturales': {
    sem1: [
      'Los seres vivos y su entorno',
      'El ciclo del agua',
      'Estados de la materia',
      'Las plantas y sus partes',
      'Los animales vertebrados',
      'La cadena alimenticia',
      'El sistema solar básico',
      'Los sentidos del cuerpo humano',
      'El clima y las estaciones',
      'Cuidado del medio ambiente'
    ],
    sem2: [
      'Los animales invertebrados',
      'La alimentación saludable',
      'El cuerpo humano: sistemas básicos',
      'Recursos naturales',
      'Energía y movimiento',
      'La luz y el sonido',
      'Ecosistemas terrestres',
      'Ecosistemas acuáticos',
      'Clasificación de los seres vivos',
      'Experimentos científicos básicos'
    ]
  },
  'Historia, Geografía y Ciencias Sociales': {
    sem1: [
      'Mi familia y mi comunidad',
      'El paso del tiempo',
      'Los mapas y la ubicación',
      'Las regiones de Chile',
      'Los pueblos originarios',
      'Símbolos patrios',
      'Derechos y deberes',
      'El trabajo en la comunidad',
      'Instituciones de la comunidad',
      'Fiestas y tradiciones chilenas'
    ],
    sem2: [
      'Historia de Chile colonial',
      'La Independencia de Chile',
      'Geografía física de Chile',
      'Recursos naturales de Chile',
      'La democracia y participación',
      'El gobierno de Chile',
      'Culturas del mundo',
      'Problemas ambientales',
      'Economía básica',
      'Proyecto de vida ciudadana'
    ]
  },
  'Lenguaje y Comunicación': {
    sem1: [
      'Comprensión lectora: cuentos',
      'El alfabeto y las vocales',
      'Escritura de oraciones',
      'Los sustantivos',
      'Los adjetivos',
      'Los verbos en presente',
      'La poesía infantil',
      'Textos informativos',
      'Comunicación oral',
      'Ortografía: uso de mayúsculas'
    ],
    sem2: [
      'Los verbos en pasado',
      'Comprensión lectora: fábulas',
      'Escritura de párrafos',
      'Los pronombres',
      'Signos de puntuación',
      'Textos narrativos',
      'El teatro y la dramatización',
      'Comprensión lectora: leyendas',
      'Producción de textos',
      'Ortografía: acentuación básica'
    ]
  },
  'Matemáticas': {
    sem1: [
      'Números del 1 al 100',
      'Suma de números naturales',
      'Resta de números naturales',
      'Figuras geométricas básicas',
      'Patrones y secuencias',
      'Medidas de longitud',
      'Resolución de problemas aditivos',
      'Comparación de cantidades',
      'Números ordinales',
      'Tablas y gráficos simples'
    ],
    sem2: [
      'Números hasta el 1000',
      'Multiplicación básica',
      'División básica',
      'Fracciones simples',
      'Medidas de tiempo',
      'Medidas de peso',
      'Geometría: perímetro',
      'Resolución de problemas multiplicativos',
      'Dinero y monedas',
      'Estadística básica'
    ]
  },
  'Biología': {
    sem1: [
      'La célula: estructura y función',
      'Organelos celulares',
      'División celular: mitosis',
      'Tejidos animales y vegetales',
      'Sistemas de órganos',
      'Sistema digestivo',
      'Sistema circulatorio',
      'Sistema respiratorio',
      'Nutrición y metabolismo',
      'Homeostasis'
    ],
    sem2: [
      'Sistema nervioso',
      'Sistema endocrino',
      'Sistema reproductor',
      'Genética mendeliana',
      'ADN y cromosomas',
      'Evolución biológica',
      'Ecología de poblaciones',
      'Ecosistemas y biomas',
      'Biodiversidad',
      'Biotecnología'
    ]
  },
  'Educación Ciudadana': {
    sem1: [
      'Derechos humanos fundamentales',
      'La Constitución Política',
      'Poderes del Estado',
      'Democracia y participación',
      'Sistema electoral chileno',
      'Derechos civiles y políticos',
      'Responsabilidad ciudadana',
      'Medios de comunicación',
      'Opinión pública',
      'Movimientos sociales'
    ],
    sem2: [
      'Derechos económicos y sociales',
      'Justicia social',
      'Igualdad de género',
      'Diversidad cultural',
      'Medio ambiente y ciudadanía',
      'Globalización',
      'Organizaciones internacionales',
      'Conflictos sociales',
      'Economía y ciudadanía',
      'Proyecto ciudadano'
    ]
  },
  'Filosofía': {
    sem1: [
      'Introducción a la filosofía',
      'Filosofía griega: presocráticos',
      'Sócrates y el método socrático',
      'Platón: teoría de las ideas',
      'Aristóteles: lógica y metafísica',
      'Ética aristotélica',
      'Filosofía helenística',
      'Filosofía medieval',
      'Epistemología básica',
      'Lógica formal'
    ],
    sem2: [
      'Filosofía moderna: Descartes',
      'Empirismo británico',
      'Kant y la crítica',
      'Ética kantiana',
      'Filosofía existencialista',
      'Filosofía del lenguaje',
      'Filosofía política',
      'Filosofía de la ciencia',
      'Bioética',
      'Filosofía latinoamericana'
    ]
  },
  'Física': {
    sem1: [
      'Magnitudes y unidades',
      'Cinemática: movimiento rectilíneo',
      'Cinemática: caída libre',
      'Dinámica: leyes de Newton',
      'Fuerza de rozamiento',
      'Trabajo y energía',
      'Energía cinética y potencial',
      'Conservación de la energía',
      'Momento lineal',
      'Colisiones'
    ],
    sem2: [
      'Movimiento circular',
      'Gravitación universal',
      'Hidrostática',
      'Termodinámica',
      'Ondas mecánicas',
      'Sonido',
      'Óptica geométrica',
      'Electricidad',
      'Magnetismo',
      'Electromagnetismo'
    ]
  },
  'Química': {
    sem1: [
      'Estructura atómica',
      'Tabla periódica',
      'Enlaces químicos',
      'Nomenclatura química',
      'Reacciones químicas',
      'Estequiometría',
      'Estados de la materia',
      'Soluciones y concentración',
      'Gases ideales',
      'Termoquímica'
    ],
    sem2: [
      'Cinética química',
      'Equilibrio químico',
      'Ácidos y bases',
      'pH y pOH',
      'Electroquímica',
      'Química orgánica: hidrocarburos',
      'Grupos funcionales',
      'Polímeros',
      'Bioquímica básica',
      'Química ambiental'
    ]
  }
};

// Tipos de evaluación
const evalTypes = ['Prueba', 'Tarea', 'Evaluación'];

// Fechas por semestre (10 fechas diferentes para cada tipo)
const generateDates = () => {
  // 1er semestre: Marzo a Junio 2025
  const sem1Dates = {
    'Prueba': ['2025-03-10', '2025-03-24', '2025-04-07', '2025-04-21', '2025-05-05', '2025-05-19', '2025-06-02', '2025-06-16', '2025-06-23', '2025-06-30'],
    'Tarea': ['2025-03-12', '2025-03-26', '2025-04-09', '2025-04-23', '2025-05-07', '2025-05-21', '2025-06-04', '2025-06-11', '2025-06-18', '2025-06-25'],
    'Evaluación': ['2025-03-14', '2025-03-28', '2025-04-11', '2025-04-25', '2025-05-09', '2025-05-23', '2025-06-06', '2025-06-13', '2025-06-20', '2025-06-27']
  };
  
  // 2do semestre: Julio a Diciembre 2025
  const sem2Dates = {
    'Prueba': ['2025-07-14', '2025-07-28', '2025-08-11', '2025-08-25', '2025-09-08', '2025-09-22', '2025-10-06', '2025-10-20', '2025-11-03', '2025-11-17'],
    'Tarea': ['2025-07-16', '2025-07-30', '2025-08-13', '2025-08-27', '2025-09-10', '2025-09-24', '2025-10-08', '2025-10-22', '2025-11-05', '2025-11-19'],
    'Evaluación': ['2025-07-18', '2025-08-01', '2025-08-15', '2025-08-29', '2025-09-12', '2025-09-26', '2025-10-10', '2025-10-24', '2025-11-07', '2025-11-21']
  };
  
  return { sem1: sem1Dates, sem2: sem2Dates };
};

// Generar notas para un grupo de estudiantes con 10-20% de reprobación
const generateGradesForGroup = (numStudents) => {
  const failRate = 0.1 + (Math.random() * 0.1); // 10-20%
  const numFailing = Math.round(numStudents * failRate);
  
  const grades = [];
  // Generar notas de reprobados
  for (let i = 0; i < numFailing; i++) {
    grades.push(Math.floor(Math.random() * 49) + 10); // 10-58 (reprobado)
  }
  // Generar notas de aprobados
  for (let i = numFailing; i < numStudents; i++) {
    grades.push(Math.floor(Math.random() * 41) + 60); // 60-100 (aprobado)
  }
  
  // Mezclar las notas
  for (let i = grades.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grades[i], grades[j]] = [grades[j], grades[i]];
  }
  
  return grades;
};

// Escapar campos CSV si contienen comas
const escapeCSV = (field) => {
  if (field && field.toString().includes(',')) {
    return `"${field}"`;
  }
  return field;
};

// Generar CSV
const generateCSV = () => {
  const dates = generateDates();
  const csvRows = ['nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema'];
  
  // Para cada curso definido
  for (const [courseName, courseData] of Object.entries(courseSubjects)) {
    for (const section of courseData.sections) {
      // Filtrar estudiantes de este curso y sección
      const courseStudents = students.filter(s => s.course === courseName && s.section === section);
      
      if (courseStudents.length === 0) {
        console.log(`No hay estudiantes para ${courseName} ${section}`);
        continue;
      }
      
      console.log(`Procesando ${courseName} ${section}: ${courseStudents.length} estudiantes`);
      
      for (const subject of courseData.subjects) {
        const topics = topicsBySubject[subject];
        if (!topics) {
          console.log(`  No hay temas definidos para: ${subject}`);
          continue;
        }
        
        // 10 actividades para cada semestre
        // Distribuir los tipos de evaluación
        const activityTypes = [];
        for (let i = 0; i < 10; i++) {
          activityTypes.push(evalTypes[i % 3]); // Rotar entre Prueba, Tarea, Evaluación
        }
        
        // Shuffle para variedad
        activityTypes.sort(() => Math.random() - 0.5);
        
        // 1er semestre
        const typeCountSem1 = { 'Prueba': 0, 'Tarea': 0, 'Evaluación': 0 };
        for (let i = 0; i < 10; i++) {
          const type = activityTypes[i];
          const dateIndex = typeCountSem1[type];
          typeCountSem1[type]++;
          
          const date = dates.sem1[type][dateIndex] || dates.sem1[type][0];
          const topic = topics.sem1[i];
          
          // Generar notas para todos los estudiantes de esta actividad
          const grades = generateGradesForGroup(courseStudents.length);
          
          for (let j = 0; j < courseStudents.length; j++) {
            const student = courseStudents[j];
            csvRows.push(`${escapeCSV(student.name)},${student.rut},${escapeCSV(courseName)},${section},${escapeCSV(subject)},${type},${date},${grades[j]},${escapeCSV(topic)}`);
          }
        }
        
        // 2do semestre
        const activityTypes2 = [...activityTypes].sort(() => Math.random() - 0.5);
        const typeCountSem2 = { 'Prueba': 0, 'Tarea': 0, 'Evaluación': 0 };
        for (let i = 0; i < 10; i++) {
          const type = activityTypes2[i];
          const dateIndex = typeCountSem2[type];
          typeCountSem2[type]++;
          
          const date = dates.sem2[type][dateIndex] || dates.sem2[type][0];
          const topic = topics.sem2[i];
          
          // Generar notas para todos los estudiantes de esta actividad
          const grades = generateGradesForGroup(courseStudents.length);
          
          for (let j = 0; j < courseStudents.length; j++) {
            const student = courseStudents[j];
            csvRows.push(`${escapeCSV(student.name)},${student.rut},${escapeCSV(courseName)},${section},${escapeCSV(subject)},${type},${date},${grades[j]},${escapeCSV(topic)}`);
          }
        }
      }
    }
  }
  
  return csvRows.join('\n');
};

// Ejecutar
console.log('Generando archivo CSV de calificaciones...\n');
const csv = generateCSV();
const outputPath = './public/test-data/calificaciones-carga-masiva-2025-completo.csv';
fs.writeFileSync(outputPath, csv);
console.log(`\nArchivo generado: ${outputPath}`);

// Contar registros
const totalRows = csv.split('\n').length - 1;
console.log(`Total de registros: ${totalRows}`);
