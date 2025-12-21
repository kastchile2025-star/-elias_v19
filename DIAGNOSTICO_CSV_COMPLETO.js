// =====================================================
// 🔍 DIAGNÓSTICO COMPLETO DE CSV - Carga Masiva de Calificaciones
// =====================================================
// Este script te ayudará a identificar exactamente por qué falla la carga del CSV
//
// INSTRUCCIONES:
// 1. Abre la consola del navegador (F12 → Console)
// 2. Copia y pega TODO este código
// 3. Sube tu archivo CSV en la interfaz
// 4. El script mostrará un diagnóstico detallado

console.log('🔍 INICIANDO DIAGNÓSTICO DE CSV...');

// Función auxiliar para parsear CSV
function parseCSVDiagnostico(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(/[;,\t]/).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cells.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = cells[idx]; });
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

// Función get() ORIGINAL del código
function getOriginal(obj, keys) {
  const key = Object.keys(obj).find(k => 
    keys.some(searchKey => 
      String(k).toLowerCase().trim().includes(searchKey.toLowerCase())
    )
  );
  const value = key ? String(obj[key]).trim() : '';
  return value;
}

// Función get() MEJORADA (más precisa)
function getMejorado(obj, keys) {
  // Primero intenta coincidencia exacta (sin case)
  for (const searchKey of keys) {
    const exactKey = Object.keys(obj).find(k => 
      String(k).toLowerCase().trim() === searchKey.toLowerCase()
    );
    if (exactKey && obj[exactKey]) {
      return String(obj[exactKey]).trim();
    }
  }
  
  // Luego intenta coincidencia con includes
  const key = Object.keys(obj).find(k => 
    keys.some(searchKey => 
      String(k).toLowerCase().trim().includes(searchKey.toLowerCase())
    )
  );
  const value = key ? String(obj[key]).trim() : '';
  return value;
}

// Normalización de texto
function norm(s) {
  return String(s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\bsecci[oó]n\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Obtener año seleccionado
const selectedYear = parseInt(localStorage.getItem('selectedYear') || new Date().getFullYear());
console.log(`📅 Año seleccionado: ${selectedYear}`);

// Cargar datos del LocalStorage
const courses = JSON.parse(localStorage.getItem(`courses_${selectedYear}`) || '[]');
const students = JSON.parse(localStorage.getItem(`students_${selectedYear}`) || '[]');
const subjects = JSON.parse(localStorage.getItem(`subjects_${selectedYear}`) || '[]');

console.log(`📚 Datos cargados del LocalStorage:`);
console.log(`  - ${courses.length} cursos`);
console.log(`  - ${students.length} estudiantes`);
console.log(`  - ${subjects.length} asignaturas`);

if (courses.length === 0) {
  console.error('❌ NO HAY CURSOS REGISTRADOS para el año', selectedYear);
  console.log('💡 Necesitas crear cursos primero en la sección de Configuración');
}

if (students.length === 0) {
  console.error('❌ NO HAY ESTUDIANTES REGISTRADOS para el año', selectedYear);
  console.log('💡 Necesitas importar estudiantes primero');
}

// Crear mapas de búsqueda
const courseByName = new Map(courses.map(c => [norm(c.name), c]));
const studentByName = new Map(students.map(s => [norm(s.name), s]));
const subjectByName = new Map(subjects.map(s => [norm(s.name), s]));

console.log(`🗺️ Mapas de búsqueda creados:`);
console.log(`  - ${courseByName.size} cursos únicos`);
console.log(`  - ${studentByName.size} estudiantes únicos`);
console.log(`  - ${subjectByName.size} asignaturas únicas`);

// Mostrar algunos ejemplos
if (courseByName.size > 0) {
  console.log(`📋 Primeros 5 cursos:`, Array.from(courseByName.keys()).slice(0, 5));
}
if (studentByName.size > 0) {
  console.log(`👨‍🎓 Primeros 5 estudiantes:`, Array.from(studentByName.keys()).slice(0, 5));
}
if (subjectByName.size > 0) {
  console.log(`📖 Primeras 5 asignaturas:`, Array.from(subjectByName.keys()).slice(0, 5));
}

// Interceptar el input file para analizar el CSV
console.log('⏳ Esperando que subas un archivo CSV...');
console.log('💡 Sube tu archivo CSV en la interfaz "Carga Masiva: Calificaciones"');

// Función de análisis
window.analizarCSV = function(texto) {
  console.log('\n📊 ============================================');
  console.log('📊 ANÁLISIS DE CSV INICIADO');
  console.log('📊 ============================================\n');
  
  const { headers, rows } = parseCSVDiagnostico(texto);
  
  console.log(`✅ Headers encontrados (${headers.length}):`, headers);
  console.log(`✅ Filas parseadas: ${rows.length}`);
  
  if (rows.length === 0) {
    console.error('❌ NO SE ENCONTRARON FILAS EN EL CSV');
    return;
  }
  
  // Analizar primera fila en detalle
  console.log('\n🔍 ANÁLISIS DE LA PRIMERA FILA:');
  const primeraFila = rows[0];
  console.log('📋 Contenido completo:', primeraFila);
  
  // Intentar extraer campos con ambas funciones
  const campos = [
    { nombre: 'Nombre', keys: ['nombre', 'name', 'estudiante', 'student', 'alumno'] },
    { nombre: 'RUT', keys: ['rut', 'id', 'dni', 'run'] },
    { nombre: 'Curso', keys: ['curso', 'course', 'clase', 'class', 'grado', 'grade'] },
    { nombre: 'Sección', keys: ['seccion', 'sección', 'section', 'letra', 'paralelo'] },
    { nombre: 'Asignatura', keys: ['asignatura', 'subject', 'materia', 'disciplina', 'subject_name'] },
    { nombre: 'Nota', keys: ['nota', 'score', 'calificacion', 'grade', 'puntos', 'calificación'] },
    { nombre: 'Tipo', keys: ['tipo', 'type', 'categoria', 'category'] },
    { nombre: 'Fecha', keys: ['fecha', 'date', 'timestamp'] }
  ];
  
  console.log('\n📝 EXTRACCIÓN DE CAMPOS:');
  campos.forEach(({ nombre, keys }) => {
    const valorOriginal = getOriginal(primeraFila, keys);
    const valorMejorado = getMejorado(primeraFila, keys);
    
    if (!valorOriginal && !valorMejorado) {
      console.error(`❌ ${nombre}: NO ENCONTRADO`);
      console.log(`   Buscado en: ${keys.join(', ')}`);
    } else if (valorOriginal !== valorMejorado) {
      console.warn(`⚠️ ${nombre}: DIFERENCIA DETECTADA`);
      console.log(`   Original: "${valorOriginal}"`);
      console.log(`   Mejorado: "${valorMejorado}"`);
    } else {
      console.log(`✅ ${nombre}: "${valorOriginal}"`);
    }
  });
  
  // Validar si los datos extraídos existen en el sistema
  console.log('\n🔍 VALIDACIÓN DE DATOS:');
  
  const nombre = getMejorado(primeraFila, ['nombre', 'name', 'estudiante', 'student', 'alumno']);
  const curso = getMejorado(primeraFila, ['curso', 'course', 'clase', 'class', 'grado', 'grade']);
  const asignatura = getMejorado(primeraFila, ['asignatura', 'subject', 'materia', 'disciplina', 'subject_name']);
  const nota = getMejorado(primeraFila, ['nota', 'score', 'calificacion', 'grade', 'puntos', 'calificación']);
  
  // Validar estudiante
  if (nombre) {
    const estudianteEncontrado = studentByName.get(norm(nombre));
    if (estudianteEncontrado) {
      console.log(`✅ Estudiante "${nombre}" ENCONTRADO en el sistema`);
    } else {
      console.error(`❌ Estudiante "${nombre}" NO ENCONTRADO`);
      console.log(`   🔍 Estudiantes similares:`, 
        Array.from(studentByName.keys())
          .filter(n => n.includes(norm(nombre).split(' ')[0]))
          .slice(0, 5)
      );
    }
  } else {
    console.error('❌ NO SE PUDO EXTRAER EL NOMBRE DEL ESTUDIANTE');
  }
  
  // Validar curso
  if (curso) {
    const cursoEncontrado = courseByName.get(norm(curso));
    if (cursoEncontrado) {
      console.log(`✅ Curso "${curso}" ENCONTRADO en el sistema`);
    } else {
      console.error(`❌ Curso "${curso}" NO ENCONTRADO`);
      console.log(`   📚 Cursos disponibles:`, Array.from(courseByName.keys()));
    }
  } else {
    console.error('❌ NO SE PUDO EXTRAER EL CURSO');
  }
  
  // Validar asignatura
  if (asignatura) {
    const asignaturaEncontrada = subjectByName.get(norm(asignatura));
    if (asignaturaEncontrada) {
      console.log(`✅ Asignatura "${asignatura}" ENCONTRADA en el sistema`);
    } else {
      console.warn(`⚠️ Asignatura "${asignatura}" NO ENCONTRADA (se creará automáticamente)`);
    }
  } else {
    console.error('❌ NO SE PUDO EXTRAER LA ASIGNATURA');
  }
  
  // Validar nota
  if (nota) {
    const notaNum = parseFloat(nota.replace(',', '.'));
    if (isFinite(notaNum)) {
      if (notaNum >= 0 && notaNum <= 100) {
        console.log(`✅ Nota "${nota}" es válida (${notaNum})`);
      } else {
        console.warn(`⚠️ Nota "${nota}" fuera de rango 0-100 (${notaNum})`);
      }
    } else {
      console.error(`❌ Nota "${nota}" NO ES UN NÚMERO VÁLIDO`);
    }
  } else {
    console.error('❌ NO SE PUDO EXTRAER LA NOTA');
  }
  
  // Análisis de todas las filas
  console.log('\n📊 ANÁLISIS COMPLETO DE TODAS LAS FILAS:');
  
  let erroresNombre = 0;
  let erroresCurso = 0;
  let erroresAsignatura = 0;
  let erroresNota = 0;
  let exitosas = 0;
  
  rows.forEach((row, idx) => {
    const n = getMejorado(row, ['nombre', 'name', 'estudiante', 'student', 'alumno']);
    const c = getMejorado(row, ['curso', 'course', 'clase', 'class', 'grado', 'grade']);
    const a = getMejorado(row, ['asignatura', 'subject', 'materia', 'disciplina', 'subject_name']);
    const nt = getMejorado(row, ['nota', 'score', 'calificacion', 'grade', 'puntos', 'calificación']);
    
    let tieneError = false;
    
    if (!n || !studentByName.has(norm(n))) {
      erroresNombre++;
      tieneError = true;
    }
    if (!c || !courseByName.has(norm(c))) {
      erroresCurso++;
      tieneError = true;
    }
    if (!a) {
      erroresAsignatura++;
      tieneError = true;
    }
    if (!nt || !isFinite(parseFloat(nt.replace(',', '.')))) {
      erroresNota++;
      tieneError = true;
    }
    
    if (!tieneError) exitosas++;
  });
  
  console.log(`\n📈 RESUMEN DE VALIDACIÓN:`);
  console.log(`  ✅ Filas exitosas: ${exitosas} (${((exitosas/rows.length)*100).toFixed(1)}%)`);
  console.log(`  ❌ Filas con errores: ${rows.length - exitosas}`);
  console.log(`     - Nombre/Estudiante no encontrado: ${erroresNombre}`);
  console.log(`     - Curso no encontrado: ${erroresCurso}`);
  console.log(`     - Asignatura vacía: ${erroresAsignatura}`);
  console.log(`     - Nota inválida: ${erroresNota}`);
  
  if (exitosas === 0) {
    console.error('\n❌❌❌ NINGUNA FILA SE PROCESARÁ CORRECTAMENTE ❌❌❌');
    console.log('\n💡 SOLUCIONES POSIBLES:');
    
    if (erroresNombre > rows.length * 0.5) {
      console.log('1️⃣ Los nombres de estudiantes no coinciden con los registrados');
      console.log('   → Verifica que los estudiantes estén importados para el año', selectedYear);
      console.log('   → Compara los nombres del CSV con los del sistema (ver arriba)');
    }
    
    if (erroresCurso > rows.length * 0.5) {
      console.log('2️⃣ Los cursos no coinciden con los registrados');
      console.log('   → Cursos en tu CSV:', Array.from(new Set(rows.map(r => getMejorado(r, ['curso', 'course'])))).slice(0, 5));
      console.log('   → Cursos en el sistema:', Array.from(courseByName.keys()).slice(0, 5));
    }
    
    if (erroresAsignatura > rows.length * 0.5) {
      console.log('3️⃣ Las asignaturas están vacías');
      console.log('   → Verifica que tu CSV tenga una columna de asignatura/materia');
    }
    
    if (erroresNota > rows.length * 0.5) {
      console.log('4️⃣ Las notas no son válidas');
      console.log('   → Ejemplos de notas en tu CSV:', 
        rows.slice(0, 5).map(r => getMejorado(r, ['nota', 'score', 'calificacion']))
      );
    }
  } else {
    console.log('\n✅ El CSV tiene filas válidas que se procesarán correctamente');
  }
  
  console.log('\n📊 ============================================');
  console.log('📊 ANÁLISIS COMPLETADO');
  console.log('📊 ============================================\n');
};

// Auto-detectar cuando se sube un archivo
const originalFileText = FileReader.prototype.readAsText;
FileReader.prototype.readAsText = function(...args) {
  const result = originalFileText.apply(this, args);
  
  this.addEventListener('load', function(e) {
    const texto = e.target.result;
    if (typeof texto === 'string' && texto.includes('\n')) {
      setTimeout(() => window.analizarCSV(texto), 100);
    }
  });
  
  return result;
};

console.log('✅ Diagnóstico configurado correctamente');
console.log('📤 Ahora sube tu archivo CSV y verás el análisis automáticamente');
console.log('\n💡 También puedes ejecutar manualmente:');
console.log('   window.analizarCSV("contenido del CSV...")');
