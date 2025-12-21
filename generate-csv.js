#!/usr/bin/env node

const fs = require('fs');

// Configuración
const COURSES = ['1ro Básico', '2do Básico', '3ro Básico', '4to Básico'];
const SECTIONS = ['A', 'B'];
const STUDENTS_PER_SECTION = 45;
const SUBJECTS = [
  'Lenguaje y Comunicación',
  'Matemáticas',
  'Ciencias Naturales',
  'Historia, Geografía y Ciencias Sociales'
];

// 10 actividades por semestre
const ACTIVITIES_PER_SEMESTER = 10;

// Nombres chilenos comunes
const FIRST_NAMES = [
  'Sofía', 'Matías', 'Valentina', 'Sebastián', 'Isidora', 'Joaquín', 'Javiera',
  'Vicente', 'Martina', 'Benjamín', 'Fernanda', 'Tomás', 'Emilia', 'Agustín',
  'Maite', 'Lucas', 'Renata', 'Manuel', 'Trinidad', 'Santiago', 'María José',
  'Maximiliano', 'Nicolás', 'Constanza', 'Roberto', 'Catalina', 'Diego',
  'Amanda', 'Cristóbal', 'Ignacia', 'Felipe'
];

const LAST_NAMES = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva',
  'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández',
  'Torres', 'Araya', 'Flores', 'Espinoza', 'Valdés', 'Reyes', 'Gutiérrez',
  'Castro', 'Parra', 'Ramírez', 'Vargas', 'Cortés', 'Campos', 'Vásquez', 'Núñez'
];

// Temas por asignatura y semestre
const TOPICS = {
  'Lenguaje y Comunicación': {
    '1ro Básico': {
      1: [
        'Comprensión lectora: Cuentos infantiles',
        'Reconocimiento de letras',
        'Escritura de oraciones simples',
        'Vocales y consonantes',
        'Sonidos iniciales y finales',
        'Lectura de sílabas',
        'Lectura de palabras frecuentes',
        'Escritura de oraciones',
        'Comprensión de textos narrativos',
        'Lectura de palabras con grupos consonánticos'
      ],
      2: [
        'Uso de signos de interrogación',
        'Escritura de textos breves',
        'Textos instructivos simples',
        'Uso de mayúsculas y punto final',
        'Producción de textos narrativos',
        'Rimas y trabalenguas',
        'Escritura de descripciones',
        'Acentuación de palabras simples',
        'Comprensión oral y escrita',
        'Lectura fluida y expresiva'
      ]
    },
    '2do Básico': {
      1: [
        'Lectura comprensiva de fábulas',
        'Escritura de cartas',
        'Sustantivos y adjetivos',
        'Comprensi��n de textos informativos',
        'Verbos y tiempos verbales',
        'Uso de la coma',
        'Textos descriptivos',
        'Orden alfabético',
        'Sinónimos y antónimos',
        'Comprensión de poemas'
      ],
      2: [
        'Escritura de diarios de vida',
        'Uso de artículos',
        'Lectura de noticias',
        'Pronombres personales',
        'Textos expositivos',
        'Uso del punto seguido',
        'Comprensión de instrucciones',
        'Palabras compuestas',
        'Lectura de historietas',
        'Producción de cuentos'
      ]
    },
    '3ro Básico': {
      1: [
        'Lectura de novelas cortas',
        'Uso de conectores',
        'Sujeto y predicado',
        'Comprensión de leyendas',
        'Uso de la b y v',
        'Textos argumentativos simples',
        'Adverbios de tiempo y lugar',
        'Lectura crítica de textos',
        'Uso de la h',
        'Comprensión de obras teatrales'
      ],
      2: [
        'Escritura de resúmenes',
        'Uso de la c, s y z',
        'Lectura de biografías',
        'Prefijos y sufijos',
        'Comprensión de textos científicos',
        'Uso de la g y j',
        'Escritura de cartas formales',
        'Palabras homófonas',
        'Lectura de mitos',
        'Producción de textos expositivos'
      ]
    },
    '4to Básico': {
      1: [
        'Análisis de textos literarios',
        'Uso de ll e y',
        'Comprensión de textos argumentativos',
        'Figuras literarias: comparación',
        'Lectura de ensayos simples',
        'Uso de r y rr',
        'Textos periodísticos',
        'Verbos irregulares',
        'Comprensión de entrevistas',
        'Análisis de personajes'
      ],
      2: [
        'Escritura de ensayos',
        'Uso de x',
        'Lectura de crónicas',
        'Figuras literarias: metáfora',
        'Comprensión de reseñas',
        'Uso de la tilde diacrítica',
        'Textos instructivos complejos',
        'Conectores causales',
        'Lectura de reportajes',
        'Producción de textos argumentativos'
      ]
    }
  },
  'Matemáticas': {
    '1ro Básico': {
      1: [
        'Números del 1 al 20',
        'Suma y resta hasta 10',
        'Figuras geométricas básicas',
        'Patrones numéricos',
        'Decenas y unidades',
        'Suma y resta hasta 20',
        'Comparación de números',
        'Medición con unidades no estándar',
        'Resolución de problemas simples',
        'Datos y gráficos pictóricos'
      ],
      2: [
        'Números hasta 100',
        'Suma con llevadas',
        'Resta con prestadas',
        'Figuras 2D y 3D',
        'Patrones de repetición',
        'Mitad y doble',
        'Medición del tiempo',
        'Uso de la regla',
        'Problemas de suma y resta',
        'Gráficos de barras simples'
      ]
    },
    '2do Básico': {
      1: [
        'Números hasta 1000',
        'Multiplicación como suma repetida',
        'División como reparto',
        'Valor posicional',
        'Tablas del 2 y 5',
        'Perímetro de figuras',
        'Medición de longitud',
        'Fracciones simples',
        'Problemas de multiplicación',
        'Datos y probabilidades'
      ],
      2: [
        'Multiplicación por una cifra',
        'División exacta',
        'Tablas del 3, 4 y 6',
        'Ángulos rectos',
        'Medición de masa',
        'Fracciones equivalentes',
        'Líneas paralelas y perpendiculares',
        'Problemas de división',
        'Secuencias numéricas',
        'Gráficos de línea'
      ]
    },
    '3ro Básico': {
      1: [
        'Números hasta 10.000',
        'Multiplicación por dos cifras',
        'División con residuo',
        'Tablas hasta el 10',
        'Área de rectángulos',
        'Fracciones propias e impropias',
        'Medición de capacidad',
        'Decimales simples',
        'Problemas combinados',
        'Análisis de datos'
      ],
      2: [
        'Números hasta 100.000',
        'Multiplicación por tres cifras',
        'División larga',
        'Perímetro y área',
        'Fracciones en la recta numérica',
        'Suma y resta de fracciones',
        'Decimales en medición',
        'Triángulos y cuadriláteros',
        'Problemas de lógica',
        'Probabilidad experimental'
      ]
    },
    '4to Básico': {
      1: [
        'Números hasta 1.000.000',
        'Multiplicación de decimales',
        'División de decimales',
        'Fracciones mixtas',
        'Porcentajes básicos',
        'Volumen de cubos',
        'Conversión de unidades',
        'Proporcionalidad directa',
        'Problemas de razones',
        'Estadística descriptiva'
      ],
      2: [
        'Números grandes y notación',
        'Operaciones combinadas',
        'Ecuaciones simples',
        'Razones y proporciones',
        'Porcentajes aplicados',
        'Transformaciones geométricas',
        'Área de triángulos',
        'Gráficos circulares',
        'Problemas de probabilidad',
        'Análisis de encuestas'
      ]
    }
  },
  'Ciencias Naturales': {
    '1ro Básico': {
      1: [
        'Los seres vivos y su entorno',
        'Partes del cuerpo humano',
        'Los cinco sentidos',
        'Animales y sus hábitats',
        'Plantas y sus partes',
        'El ciclo del agua',
        'Estados de la materia',
        'Luz y sombras',
        'El día y la noche',
        'Cuidado del medio ambiente'
      ],
      2: [
        'Clasificación de animales',
        'Necesidades de los seres vivos',
        'Hábitos saludables',
        'El sistema solar',
        'Estaciones del año',
        'Materiales y sus propiedades',
        'Sonidos y vibraciones',
        'Cadenas alimentarias simples',
        'El ciclo de vida',
        'Energía y movimiento'
      ]
    },
    '2do Básico': {
      1: [
        'Sistemas del cuerpo humano',
        'Alimentación saludable',
        'Vertebrados e invertebrados',
        'Reproducción de plantas',
        'Ecosistemas terrestres',
        'El agua en la naturaleza',
        'Mezclas y separaciones',
        'Fuerza y movimiento',
        'Recursos naturales',
        'Contaminación ambiental'
      ],
      2: [
        'Órganos y funciones',
        'Cadenas alimentarias complejas',
        'Adaptaciones de animales',
        'Fotosíntesis',
        'Ecosistemas acuáticos',
        'Propiedades del aire',
        'Cambios de estado',
        'Magnetismo',
        'Reducir, reutilizar, reciclar',
        'Efectos de la luz'
      ]
    },
    '3ro Básico': {
      1: [
        'Sistema digestivo',
        'Nutrientes y alimentos',
        'Clasificación de vertebrados',
        'Polinización',
        'Biomas de Chile',
        'Ciclo del carbono',
        'Propiedades de la materia',
        'Energía cinética y potencial',
        'Rocas y minerales',
        'Conservación de especies'
      ],
      2: [
        'Sistema respiratorio',
        'Sistema circulatorio',
        'Comportamiento animal',
        'Dispersión de semillas',
        'Factores bióticos y abióticos',
        'Cambios químicos',
        'Electricidad estática',
        'Suelos y su composición',
        'Fenómenos naturales',
        'Especies en peligro'
      ]
    },
    '4to Básico': {
      1: [
        'Sistema nervioso',
        'Sistema óseo y muscular',
        'Microorganismos',
        'Reproducción asexual',
        'Relaciones tróficas',
        'Reacciones químicas',
        'Circuitos eléctricos',
        'Estructura de la Tierra',
        'Clima y tiempo atmosférico',
        'Desarrollo sustentable'
      ],
      2: [
        'Sistema excretor',
        'Enfermedades y prevención',
        'Biotecnología',
        'Herencia y variación',
        'Pirámides tróficas',
        'Ácidos y bases',
        'Electromagnetismo',
        'Placas tectónicas',
        'Desastres naturales',
        'Impacto humano en ecosistemas'
      ]
    }
  },
  'Historia, Geografía y Ciencias Sociales': {
    '1ro Básico': {
      1: [
        'Mi familia y yo',
        'Normas de convivencia',
        'Derechos de los niños',
        'Mi escuela y comunidad',
        'Trabajos y oficios',
        'Ubicación espacial',
        'Días de la semana y meses',
        'Celebraciones y tradiciones',
        'Pasado, presente y futuro',
        'Símbolos patrios'
      ],
      2: [
        'Historia personal',
        'Grupos de pertenencia',
        'Responsabilidades en el hogar',
        'Servicios de la comunidad',
        'Planos y mapas simples',
        'Chile en el mapa',
        'Pueblos originarios básico',
        'Diversidad cultural',
        'Cuidado del patrimonio',
        'Fiestas Patrias'
      ]
    },
    '2do Básico': {
      1: [
        'Cultura de Chile',
        'Regiones naturales de Chile',
        'Ubicación de Chile en el mundo',
        'Zonas climáticas',
        'Recursos naturales de Chile',
        'Civilizaciones antiguas',
        'Griegos y romanos',
        'Línea de tiempo histórica',
        'Instituciones del país',
        'Democracia y participación'
      ],
      2: [
        'Norte, centro y sur de Chile',
        'Actividades económicas',
        'Comercio y moneda',
        'Grandes exploradores',
        'Descubrimiento de América',
        'Conquista de Chile',
        'Mestizaje cultural',
        'Derechos y deberes',
        'Organización del Estado',
        'Identidad nacional'
      ]
    },
    '3ro Básico': {
      1: [
        'Geografía de América',
        'Relieve y geografía física',
        'Climas de Chile',
        'Hidrografía de Chile',
        'Pueblos originarios de Chile',
        'Cultura mapuche',
        'Colonia en Chile',
        'Sociedad colonial',
        'Independencia de Chile',
        'Proceso de Independencia'
      ],
      2: [
        'República de Chile',
        'Organización territorial',
        'Regiones de Chile',
        'Recursos naturales por región',
        'Economía chilena',
        'Guerra del Pacífico',
        'Siglo XX en Chile',
        'Democracia y dictadura',
        'Chile actual',
        'Desafíos del país'
      ]
    },
    '4to Básico': {
      1: [
        'Civilizaciones precolombinas',
        'Mayas, aztecas e incas',
        'Legado cultural prehispánico',
        'Conquista española',
        'Colonización de América',
        'Virreinatos',
        'Sistema colonial',
        'Mestizaje en América',
        'Cultura colonial',
        'Arquitectura colonial'
      ],
      2: [
        'Independencias americanas',
        'Próceres de la independencia',
        'Formación de repúblicas',
        'Constitución y leyes',
        'Guerras de independencia',
        'Siglo XIX en América',
        'Modernización del Estado',
        'Desarrollo económico',
        'Conflictos territoriales',
        'Integración latinoamericana'
      ]
    }
  }
};

// Tipos de evaluación
const ACTIVITY_TYPES = ['prueba', 'tarea', 'evaluacion'];

// Generar nombre aleatorio
function generateName() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName1 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const lastName2 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName1} ${lastName2}`;
}

// Generar RUT chileno (simplificado, sin validación real)
function generateRUT(index) {
  const base = 10000000 + index;
  const dv = Math.floor(Math.random() * 10);
  return `${base}-${dv}`;
}

// Generar nota aleatoria
function generateGrade() {
  return Math.floor(Math.random() * 36) + 65; // 65-100
}

// Generar fecha dentro de un rango
function generateDate(month, year = 2025) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Generar estudiantes
function generateStudents() {
  const students = [];
  let index = 0;

  for (const course of COURSES) {
    for (const section of SECTIONS) {
      for (let i = 0; i < STUDENTS_PER_SECTION; i++) {
        students.push({
          nombre: generateName(),
          rut: generateRUT(index++),
          curso: course,
          seccion: section
        });
      }
    }
  }

  return students;
}

// Generar actividades para una asignatura
function generateActivitiesForSubject(subject, course, section, semester) {
  const activities = [];
  const courseKey = course;
  const topics = TOPICS[subject]?.[courseKey]?.[semester] || [];
  
  // Fechas por semestre
  const months = semester === 1 ? [3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
  
  for (let i = 0; i < ACTIVITIES_PER_SEMESTER; i++) {
    const month = months[Math.floor(Math.random() * months.length)];
    const type = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];
    const topic = topics[i] || `Actividad ${i + 1} de ${subject}`;
    
    activities.push({
      fecha: generateDate(month),
      tipo: type,
      tema: topic
    });
  }
  
  return activities;
}

// Generar CSV
function generateCSV() {
  const students = generateStudents();
  console.log(`📊 Generando CSV con ${students.length} estudiantes...`);
  
  const rows = [];
  
  // Header
  rows.push('nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema');
  
  let totalRows = 0;
  
  // Por cada estudiante
  for (const student of students) {
    // Por cada asignatura
    for (const subject of SUBJECTS) {
      // Por cada semestre (1 y 2)
      for (const semester of [1, 2]) {
        const activities = generateActivitiesForSubject(
          subject,
          student.curso,
          student.seccion,
          semester
        );
        
        // Por cada actividad
        for (const activity of activities) {
          const grade = generateGrade();
          
          rows.push([
            student.nombre,
            student.rut,
            student.curso,
            student.seccion,
            subject,
            activity.tipo,
            activity.fecha,
            grade,
            activity.tema
          ].join(','));
          
          totalRows++;
        }
      }
    }
  }
  
  console.log(`✅ Generadas ${totalRows} calificaciones`);
  console.log(`📈 Distribución:`);
  console.log(`   - ${students.length} estudiantes`);
  console.log(`   - ${COURSES.length} cursos × ${SECTIONS.length} secciones = ${COURSES.length * SECTIONS.length} secciones`);
  console.log(`   - ${SUBJECTS.length} asignaturas`);
  console.log(`   - ${ACTIVITIES_PER_SEMESTER} actividades × 2 semestres = ${ACTIVITIES_PER_SEMESTER * 2} actividades por asignatura`);
  
  return rows.join('\n');
}

// Escribir archivo
const csv = generateCSV();
const filename = 'public/test-data/calificaciones_carga_masiva_completa.csv';

fs.writeFileSync(filename, csv, 'utf-8');
console.log(`\n✨ Archivo generado: ${filename}`);
console.log(`📏 Tamaño: ${(csv.length / 1024 / 1024).toFixed(2)} MB`);
