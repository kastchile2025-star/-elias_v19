// ============================================================================
// 📋 GENERADOR CSV CONSOLIDADO 2025 - Estudiantes + Profesores
// ============================================================================
// Genera un archivo CSV con:
// - 1,080 estudiantes (1ro Básico A/B hasta 4to Medio A/B, 45 por sección)
// - 32 profesores (8 materias × 4 profesores, cada uno con 4 clases)
// ============================================================================

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const YEAR = 2025;
const STUDENTS_PER_SECTION = 45;

const COURSES = [
  '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
  '5to Básico', '6to Básico', '7mo Básico', '8vo Básico',
  '1ro Medio', '2do Medio', '3ro Medio', '4to Medio'
];

const SECTIONS = ['A', 'B'];

// Materias de Básica (1ro-8vo)
const SUBJECTS_BASICA = ['MAT', 'LEN', 'HIS', 'CNT', 'ING', 'EFI', 'MUS', 'ART'];

// Materias adicionales de Media (1ro-4to)
const SUBJECTS_MEDIA = ['BIO', 'FIS', 'QUI', 'FIL', 'EDC'];

// Todas las materias
const SUBJECTS = [...SUBJECTS_BASICA, ...SUBJECTS_MEDIA];

const NOMBRES = [
  'Sofía', 'Matías', 'Valentina', 'Benjamín', 'Martina', 'Lucas', 'Isidora', 'Agustín',
  'Emilia', 'Tomás', 'Amanda', 'Diego', 'Catalina', 'Santiago', 'Josefa', 'Nicolás',
  'Florencia', 'Gabriel', 'Trinidad', 'Maximiliano', 'Antonia', 'Joaquín', 'Constanza', 'Felipe',
  'María José', 'Sebastián', 'Fernanda', 'Vicente', 'Javiera', 'Cristóbal', 'Maite', 'Andrés',
  'Ignacia', 'Manuel', 'Renata', 'Mateo', 'Francisca', 'Ángel', 'Victoria', 'Eduardo',
  'Carolina', 'Alberto', 'Daniela', 'Roberto', 'Gabriela'
];

const APELLIDOS = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva',
  'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres',
  'Araya', 'Flores', 'Espinoza', 'Valenzuela', 'Castillo', 'Vega', 'Parra', 'Núñez',
  'Gutiérrez', 'Reyes', 'Castro', 'Ramírez', 'Vargas', 'Herrera', 'Cortés', 'Medina',
  'Bravo', 'Figueroa', 'Sandoval', 'Rivera', 'Jara', 'Miranda', 'Cáceres', 'Campos',
  'Santana', 'Carrasco', 'Alarcón', 'Tapia', 'Vera'
];

const NOMBRES_PROFESORES = [
  'Ana', 'Carlos', 'Patricia', 'Jorge', 'María', 'Francisco', 'Carmen', 'Ricardo',
  'Elena', 'Luis', 'Rosa', 'Miguel', 'Isabel', 'Pablo', 'Laura', 'Andrés',
  'Gloria', 'Fernando', 'Mónica', 'Alejandro', 'Teresa', 'Rodrigo', 'Cecilia', 'Manuel',
  'Claudia', 'Daniel', 'Verónica', 'Sergio', 'Marcela', 'Raúl', 'Soledad', 'Héctor'
];

// ============================================================================
// UTILIDADES
// ============================================================================

// Generar RUT chileno válido
function generarRUT(seed) {
  const numero = 10000000 + seed;
  const dv = calcularDV(numero);
  return `${numero}-${dv}`;
}

function calcularDV(rut) {
  let suma = 0;
  let multiplicador = 2;
  const rutStr = rut.toString().split('').reverse();
  
  for (let digito of rutStr) {
    suma += parseInt(digito) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dv = 11 - resto;
  
  if (dv === 11) return '0';
  if (dv === 10) return 'k';
  return dv.toString();
}

// Generar username desde nombre
function generarUsername(nombre, apellido, rut) {
  const inicial = nombre.charAt(0).toLowerCase();
  const apellidoLimpio = apellido
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const rutNumeros = rut.replace(/[^0-9]/g, '');
  const ultimosCuatro = rutNumeros.slice(-4);
  return `${inicial}.${apellidoLimpio}${ultimosCuatro}`;
}

// Escapar CSV
function escaparCSV(valor) {
  const str = String(valor || '');
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ============================================================================
// GENERADOR DE ESTUDIANTES
// ============================================================================

function generarEstudiantes() {
  const estudiantes = [];
  let contador = 0;

  for (const course of COURSES) {
    for (const section of SECTIONS) {
      for (let i = 0; i < STUDENTS_PER_SECTION; i++) {
        const nombre = NOMBRES[contador % NOMBRES.length];
        const apellido1 = APELLIDOS[Math.floor(contador / NOMBRES.length) % APELLIDOS.length];
        const apellido2 = APELLIDOS[(contador * 3) % APELLIDOS.length];
        const nombreCompleto = `${nombre} ${apellido1} ${apellido2}`;
        
        const rut = generarRUT(contador);
        const email = `${nombre.toLowerCase()}.${apellido1.toLowerCase()}@student.cl`;
        const username = generarUsername(nombre, apellido1, rut);
        
        estudiantes.push({
          role: 'student',
          name: nombreCompleto,
          rut: rut,
          email: email,
          username: username,
          password: 'temporal123',
          course: course,
          section: section,
          subjects: ''
        });
        
        contador++;
      }
    }
  }

  return estudiantes;
}

// ============================================================================
// GENERADOR DE PROFESORES
// ============================================================================

function generarProfesores() {
  const profesores = [];
  let contadorProfesor = 0;
  let seedRUT = 50000;

  // Asignación de cursos para cada profesor (4 clases = 2 cursos × 2 secciones A/B)
  // Cada profesor cubre 2 cursos consecutivos (4 clases totales con A/B)
  
  const asignacionesPorMateria = {
    // === MATERIAS DE BÁSICA Y MEDIA ===
    'MAT': [
      ['1ro Básico', '2do Básico'],  // Ana González
      ['3ro Básico', '4to Básico'],  // Carlos Rojas
      ['5to Básico', '6to Básico'],  // Patricia Pérez
      ['7mo Básico', '8vo Básico'],  // Jorge Contreras
      ['1ro Medio', '2do Medio'],    // Profesor MAT Media 1-2
      ['3ro Medio', '4to Medio']     // Profesor MAT Media 3-4
    ],
    'LEN': [
      ['1ro Básico', '2do Básico'],  // María Martínez
      ['3ro Básico', '4to Básico'],  // Francisco Morales
      ['5to Básico', '6to Básico'],  // Carmen López
      ['7mo Básico', '8vo Básico'],  // Ricardo Hernández
      ['1ro Medio', '2do Medio'],    // Profesor LEN Media 1-2
      ['3ro Medio', '4to Medio']     // Profesor LEN Media 3-4
    ],
    'HIS': [
      ['1ro Básico', '2do Básico'],  // Rosa Castillo
      ['3ro Básico', '4to Básico'],  // Miguel Parra
      ['5to Básico', '6to Básico'],  // Profesor HIS 5-6
      ['7mo Básico', '8vo Básico'],  // Profesor HIS 7-8
      ['1ro Medio', '2do Medio'],    // Elena Araya (ya existe)
      ['3ro Medio', '4to Medio']     // Luis Espinoza (ya existe)
    ],
    'CNT': [
      ['1ro Básico', '2do Básico'],  // Isabel Gutiérrez
      ['3ro Básico', '4to Básico'],  // Pablo Castro
      ['5to Básico', '6to Básico'],  // Laura Vargas
      ['7mo Básico', '8vo Básico']   // Andrés Cortés
    ],
    'ING': [
      ['1ro Básico', '2do Básico'],
      ['3ro Básico', '4to Básico'],
      ['5to Básico', '6to Básico'],
      ['7mo Básico', '8vo Básico'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ],
    'EFI': [
      ['1ro Básico', '2do Básico'],
      ['3ro Básico', '4to Básico'],
      ['5to Básico', '6to Básico'],
      ['7mo Básico', '8vo Básico'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ],
    'MUS': [
      ['1ro Básico', '2do Básico'],
      ['3ro Básico', '4to Básico'],
      ['5to Básico', '6to Básico'],
      ['7mo Básico', '8vo Básico'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ],
    'ART': [
      ['1ro Básico', '2do Básico'],
      ['3ro Básico', '4to Básico'],
      ['5to Básico', '6to Básico'],
      ['7mo Básico', '8vo Básico'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ],
    
    // === MATERIAS EXCLUSIVAS DE MEDIA (1ro-4to) ===
    'BIO': [
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio'],
      ['1ro Medio', '2do Medio'],  // Duplicado para cubrir necesidad
      ['3ro Medio', '4to Medio']
    ],
    'FIS': [
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ],
    'QUI': [
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ],
    'FIL': [
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ],
    'EDC': [
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio'],
      ['1ro Medio', '2do Medio'],
      ['3ro Medio', '4to Medio']
    ]
  };

  // Generar profesores con sus asignaciones específicas
  for (const subject of SUBJECTS) {
    const cursosParaMateria = asignacionesPorMateria[subject];
    const numProfesores = cursosParaMateria.length; // Ahora puede ser 4 o 6
    
    for (let p = 0; p < numProfesores; p++) {
      const nombre = NOMBRES_PROFESORES[contadorProfesor % NOMBRES_PROFESORES.length];
      const apellido1 = APELLIDOS[(contadorProfesor * 2) % APELLIDOS.length];
      const apellido2 = APELLIDOS[(contadorProfesor * 3 + 1) % APELLIDOS.length];
      const nombreCompleto = `${nombre} ${apellido1} ${apellido2}`;
      
      const rut = generarRUT(seedRUT + contadorProfesor);
      const email = `${nombre.toLowerCase()}.${apellido1.toLowerCase()}@school.cl`;
      const username = `${nombre.toLowerCase()}.${apellido1.toLowerCase()}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      // Obtener los 2 cursos asignados a este profesor
      const cursosAsignados = cursosParaMateria[p];
      
      // Crear 4 filas (1 por cada clase): curso1-A, curso1-B, curso2-A, curso2-B
      for (const curso of cursosAsignados) {
        for (const seccion of ['A', 'B']) {
          profesores.push({
            role: 'teacher',
            name: nombreCompleto,
            rut: rut,
            email: email,
            username: username,
            password: 'temporal123',
            course: curso,
            section: seccion,
            subjects: subject
          });
        }
      }
      
      contadorProfesor++;
    }
  }

  return profesores;
}

// ============================================================================
// GENERADOR CSV
// ============================================================================

function generarCSV() {
  console.log('🚀 Generando CSV consolidado 2025...\n');

  const estudiantes = generarEstudiantes();
  const profesores = generarProfesores();

  console.log(`✅ Generados: ${estudiantes.length} estudiantes`);
  console.log(`✅ Generados: ${profesores.length} profesores\n`);

  // Headers
  const headers = ['role', 'name', 'rut', 'email', 'username', 'password', 'course', 'section', 'subjects'];
  
  // Todas las filas
  const rows = [...estudiantes, ...profesores];

  // Generar CSV con BOM UTF-8
  const csvLines = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(h => escaparCSV(row[h])).join(',')
    )
  ];

  const csv = '\uFEFF' + csvLines.join('\r\n');

  // Guardar archivo
  const filename = `users-consolidated-${YEAR}.csv`;
  const filepath = path.join(__dirname, filename);
  
  fs.writeFileSync(filepath, csv, 'utf8');
  
  console.log(`💾 Archivo generado: ${filename}`);
  console.log(`📂 Ubicación: ${filepath}\n`);
  console.log('📊 RESUMEN:');
  console.log(`   • Total estudiantes: ${estudiantes.length}`);
  console.log(`   • Total profesores (personas): 32`);
  console.log(`   • Total filas profesores (clases): ${profesores.length}`);
  console.log(`   • Total registros CSV: ${rows.length}`);
  console.log(`   • Cursos: ${COURSES.length}`);
  console.log(`   • Secciones por curso: ${SECTIONS.length}`);
  console.log(`   • Estudiantes por sección: ${STUDENTS_PER_SECTION}`);
  console.log(`   • Materias: ${SUBJECTS.length}`);
  console.log(`   • Profesores por materia: 4`);
  console.log(`   • Clases por profesor: 4 (cada fila = 1 clase)\n`);
  console.log('✅ CSV listo para importar en Configuración → Carga Masiva Excel');
}

// ============================================================================
// EJECUTAR
// ============================================================================

try {
  generarCSV();
} catch (error) {
  console.error('❌ Error al generar CSV:', error);
  process.exit(1);
}
