const fs = require('fs');

// Leer estudiantes del archivo CSV
const usersFile = fs.readFileSync('users-consolidated-2025-CORREGIDO.csv', 'utf8');
const usersLines = usersFile.split('\n').slice(1).filter(line => line.trim());

const students = usersLines.map(line => {
  const parts = line.split(',');
  return {
    nombre: parts[1],
    rut: parts[2],
    curso: parts[6],
    seccion: parts[7]
  };
});

console.log(`📚 Cargados ${students.length} estudiantes del archivo`);

// Actividades para 1° Básico
const actividades1ro = [
  { asignatura: "Matemáticas", profesor: "Prof. Ana Torres", fecha: "2025-03-15", tipo: "prueba", tema: "Números hasta el 20" },
  { asignatura: "Lenguaje", profesor: "Prof. Carmen López", fecha: "2025-03-20", tipo: "tarea", tema: "Comprensión Lectora" },
  { asignatura: "Matemáticas", profesor: "Prof. Ana Torres", fecha: "2025-04-10", tipo: "prueba", tema: "Suma y Resta Básica" },
  { asignatura: "Ciencias", profesor: "Prof. Roberto Muñoz", fecha: "2025-04-15", tipo: "tarea", tema: "Los Seres Vivos" },
  { asignatura: "Lenguaje", profesor: "Prof. Carmen López", fecha: "2025-05-05", tipo: "prueba", tema: "Las Vocales y Consonantes" },
  { asignatura: "Matemáticas", profesor: "Prof. Ana Torres", fecha: "2025-05-12", tipo: "tarea", tema: "Figuras Geométricas" },
  { asignatura: "Historia", profesor: "Prof. Claudia Soto", fecha: "2025-05-20", tipo: "tarea", tema: "Mi Familia y Comunidad" },
  { asignatura: "Lenguaje", profesor: "Prof. Carmen López", fecha: "2025-06-03", tipo: "prueba", tema: "Lectura de Palabras" },
  { asignatura: "Matemáticas", profesor: "Prof. Ana Torres", fecha: "2025-06-10", tipo: "prueba", tema: "Números hasta el 50" },
  { asignatura: "Ciencias", profesor: "Prof. Roberto Muñoz", fecha: "2025-06-18", tipo: "tarea", tema: "El Cuerpo Humano" }
];

// Actividades para 2° Básico
const actividades2do = [
  { asignatura: "Matemáticas", profesor: "Prof. Pedro Silva", fecha: "2025-03-18", tipo: "prueba", tema: "Suma y Resta hasta el 100" },
  { asignatura: "Lenguaje", profesor: "Prof. Isabel Ramírez", fecha: "2025-03-22", tipo: "tarea", tema: "Lectura de Cuentos" },
  { asignatura: "Matemáticas", profesor: "Prof. Pedro Silva", fecha: "2025-04-12", tipo: "prueba", tema: "Multiplicación Básica" },
  { asignatura: "Ciencias", profesor: "Prof. Marcela Herrera", fecha: "2025-04-18", tipo: "tarea", tema: "Estados de la Materia" },
  { asignatura: "Lenguaje", profesor: "Prof. Isabel Ramírez", fecha: "2025-05-08", tipo: "prueba", tema: "Ortografía y Gramática" },
  { asignatura: "Matemáticas", profesor: "Prof. Pedro Silva", fecha: "2025-05-15", tipo: "tarea", tema: "Geometría Plana" },
  { asignatura: "Historia", profesor: "Prof. Andrés Lagos", fecha: "2025-05-22", tipo: "tarea", tema: "Pueblos Originarios" },
  { asignatura: "Lenguaje", profesor: "Prof. Isabel Ramírez", fecha: "2025-06-05", tipo: "prueba", tema: "Comprensión de Textos" },
  { asignatura: "Matemáticas", profesor: "Prof. Pedro Silva", fecha: "2025-06-12", tipo: "prueba", tema: "Números hasta el 200" },
  { asignatura: "Ciencias", profesor: "Prof. Marcela Herrera", fecha: "2025-06-20", tipo: "tarea", tema: "Ciclo del Agua" }
];

// Función para generar nota aleatoria entre 4.0 y 7.0
function generarNota() {
  return (Math.random() * 3 + 4.0).toFixed(1);
}

// Generar CSV
const rows = ['nombre,rut,curso,seccion,asignatura,profesor,fecha,tipo,nota,tema'];

students.forEach(student => {
  const actividades = student.curso === "1ro Básico" ? actividades1ro : actividades2do;
  
  // Ajustar profesor según sección
  const actividadesAjustadas = actividades.map(act => {
    if (student.curso === "1ro Básico") {
      if (act.asignatura === "Matemáticas") {
        return { ...act, profesor: student.seccion === "A" ? "Prof. Ana Torres" : "Prof. Luis Morales" };
      } else if (act.asignatura === "Lenguaje") {
        return { ...act, profesor: student.seccion === "A" ? "Prof. Carmen López" : "Prof. Rosa Vega" };
      }
    } else if (student.curso === "2do Básico") {
      if (act.asignatura === "Matemáticas") {
        return { ...act, profesor: student.seccion === "A" ? "Prof. Pedro Silva" : "Prof. Ricardo Díaz" };
      } else if (act.asignatura === "Lenguaje") {
        return { ...act, profesor: student.seccion === "A" ? "Prof. Isabel Ramírez" : "Prof. Marcela Fuentes" };
      }
    }
    return act;
  });
  
  actividadesAjustadas.forEach(actividad => {
    const nota = generarNota();
    rows.push(
      `${student.nombre},${student.rut},${student.curso},${student.seccion},${actividad.asignatura},${actividad.profesor},${actividad.fecha},${actividad.tipo},${nota},${actividad.tema}`
    );
  });
});

// Escribir archivo
fs.writeFileSync('calificaciones-2025-1ro-2do-basico.csv', rows.join('\n'), 'utf8');
console.log(`✅ Archivo generado con ${rows.length - 1} calificaciones`);
console.log(`   - ${students.length} estudiantes`);
console.log(`   - 10 actividades por estudiante`);
console.log(`   - Total: ${students.length * 10} registros de calificaciones`);
