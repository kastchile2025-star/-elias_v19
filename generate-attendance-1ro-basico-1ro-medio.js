const fs = require('fs');

// Estudiantes 1ro Básico A (45 estudiantes)
const estudiantesBasicoA = [
  { nombre: "Sofía González González", rut: "10000000-8" },
  { nombre: "Matías González Díaz", rut: "10000001-6" },
  { nombre: "Valentina González Contreras", rut: "10000002-4" },
  { nombre: "Benjamín González Sepúlveda", rut: "10000003-2" },
  { nombre: "Martina González López", rut: "10000004-0" },
  { nombre: "Lucas González Torres", rut: "10000005-9" },
  { nombre: "Isidora González Espinoza", rut: "10000006-7" },
  { nombre: "Agustín González Vega", rut: "10000007-5" },
  { nombre: "Emilia González Gutiérrez", rut: "10000008-3" },
  { nombre: "Tomás González Ramírez", rut: "10000009-1" },
  { nombre: "Amanda González Cortés", rut: "10000010-5" },
  { nombre: "Diego González Figueroa", rut: "10000011-3" },
  { nombre: "Catalina González Jara", rut: "10000012-1" },
  { nombre: "Santiago González Campos", rut: "10000013-k" },
  { nombre: "Josefa González Alarcón", rut: "10000014-8" },
  { nombre: "Nicolás González González", rut: "10000015-6" },
  { nombre: "Florencia González Díaz", rut: "10000016-4" },
  { nombre: "Gabriel González Contreras", rut: "10000017-2" },
  { nombre: "Trinidad González Sepúlveda", rut: "10000018-0" },
  { nombre: "Maximiliano González López", rut: "10000019-9" },
  { nombre: "Antonia González Torres", rut: "10000020-2" },
  { nombre: "Joaquín González Espinoza", rut: "10000021-0" },
  { nombre: "Constanza González Vega", rut: "10000022-9" },
  { nombre: "Felipe González Gutiérrez", rut: "10000023-7" },
  { nombre: "María José González Ramírez", rut: "10000024-5" },
  { nombre: "Sebastián González Cortés", rut: "10000025-3" },
  { nombre: "Fernanda González Figueroa", rut: "10000026-1" },
  { nombre: "Vicente González Jara", rut: "10000027-k" },
  { nombre: "Javiera González Campos", rut: "10000028-8" },
  { nombre: "Cristóbal González Alarcón", rut: "10000029-6" },
  { nombre: "Maite González González", rut: "10000030-k" },
  { nombre: "Andrés González Díaz", rut: "10000031-8" },
  { nombre: "Ignacia González Contreras", rut: "10000032-6" },
  { nombre: "Manuel González Sepúlveda", rut: "10000033-4" },
  { nombre: "Renata González López", rut: "10000034-2" },
  { nombre: "Mateo González Torres", rut: "10000035-0" },
  { nombre: "Francisca González Espinoza", rut: "10000036-9" },
  { nombre: "Ángel González Vega", rut: "10000037-7" },
  { nombre: "Victoria González Gutiérrez", rut: "10000038-5" },
  { nombre: "Eduardo González Ramírez", rut: "10000039-3" },
  { nombre: "Carolina González Cortés", rut: "10000040-7" },
  { nombre: "Alberto González Figueroa", rut: "10000041-5" },
  { nombre: "Daniela González Jara", rut: "10000042-3" },
  { nombre: "Roberto González Campos", rut: "10000043-1" },
  { nombre: "Gabriela González Alarcón", rut: "10000044-k" }
];

// Estudiantes 1ro Medio B (45 estudiantes)
const estudiantesMedioB = [
  { nombre: "Sofía Flores González", rut: "10000765-7" },
  { nombre: "Matías Flores Díaz", rut: "10000766-5" },
  { nombre: "Valentina Flores Contreras", rut: "10000767-3" },
  { nombre: "Benjamín Flores Sepúlveda", rut: "10000768-1" },
  { nombre: "Martina Flores López", rut: "10000769-k" },
  { nombre: "Lucas Flores Torres", rut: "10000770-3" },
  { nombre: "Isidora Flores Espinoza", rut: "10000771-1" },
  { nombre: "Agustín Flores Vega", rut: "10000772-k" },
  { nombre: "Emilia Flores Gutiérrez", rut: "10000773-8" },
  { nombre: "Tomás Flores Ramírez", rut: "10000774-6" },
  { nombre: "Amanda Flores Cortés", rut: "10000775-4" },
  { nombre: "Diego Flores Figueroa", rut: "10000776-2" },
  { nombre: "Catalina Flores Jara", rut: "10000777-0" },
  { nombre: "Santiago Flores Campos", rut: "10000778-9" },
  { nombre: "Josefa Flores Alarcón", rut: "10000779-7" },
  { nombre: "Nicolás Flores González", rut: "10000780-0" },
  { nombre: "Florencia Flores Díaz", rut: "10000781-9" },
  { nombre: "Gabriel Flores Contreras", rut: "10000782-7" },
  { nombre: "Trinidad Flores Sepúlveda", rut: "10000783-5" },
  { nombre: "Maximiliano Flores López", rut: "10000784-3" },
  { nombre: "Antonia Flores Torres", rut: "10000785-1" },
  { nombre: "Joaquín Flores Espinoza", rut: "10000786-k" },
  { nombre: "Constanza Flores Vega", rut: "10000787-8" },
  { nombre: "Felipe Flores Gutiérrez", rut: "10000788-6" },
  { nombre: "María José Flores Ramírez", rut: "10000789-4" },
  { nombre: "Sebastián Flores Cortés", rut: "10000790-8" },
  { nombre: "Fernanda Flores Figueroa", rut: "10000791-6" },
  { nombre: "Vicente Flores Jara", rut: "10000792-4" },
  { nombre: "Javiera Flores Campos", rut: "10000793-2" },
  { nombre: "Cristóbal Flores Alarcón", rut: "10000794-0" },
  { nombre: "Maite Flores González", rut: "10000795-9" },
  { nombre: "Andrés Flores Díaz", rut: "10000796-7" },
  { nombre: "Ignacia Flores Contreras", rut: "10000797-5" },
  { nombre: "Manuel Flores Sepúlveda", rut: "10000798-3" },
  { nombre: "Renata Flores López", rut: "10000799-1" },
  { nombre: "Mateo Flores Torres", rut: "10000800-9" },
  { nombre: "Francisca Flores Espinoza", rut: "10000801-7" },
  { nombre: "Ángel Flores Vega", rut: "10000802-5" },
  { nombre: "Victoria Flores Gutiérrez", rut: "10000803-3" },
  { nombre: "Eduardo Flores Ramírez", rut: "10000804-1" },
  { nombre: "Carolina Flores Cortés", rut: "10000805-k" },
  { nombre: "Alberto Flores Figueroa", rut: "10000806-8" },
  { nombre: "Daniela Flores Jara", rut: "10000807-6" },
  { nombre: "Roberto Flores Campos", rut: "10000808-4" },
  { nombre: "Gabriela Flores Alarcón", rut: "10000809-2" }
];

// Estados de asistencia
const estados = ["presente", "ausente", "tardanza", "justificado"];

// Generar estado aleatorio con pesos realistas
// ~85% presente, ~8% ausente, ~5% tardanza, ~2% justificado
function randomEstado() {
  const rand = Math.random() * 100;
  if (rand < 85) return "presente";
  if (rand < 93) return "ausente";
  if (rand < 98) return "tardanza";
  return "justificado";
}

// Generar todas las fechas de días hábiles (lunes a viernes) del año escolar 2025
// Marzo a Noviembre (excluyendo vacaciones de invierno: 2 semanas de Julio)
function generarFechasEscolares() {
  const fechas = [];
  
  // Vacaciones de invierno: del 7 al 18 de Julio 2025
  const inicioVacacionesInvierno = new Date(2025, 6, 7); // 7 de Julio
  const finVacacionesInvierno = new Date(2025, 6, 18);   // 18 de Julio
  
  // Feriados Chile 2025 (fechas aproximadas)
  const feriados = [
    '2025-03-31', // Semana Santa (Lunes)
    '2025-04-18', // Viernes Santo
    '2025-05-01', // Día del Trabajador
    '2025-05-21', // Glorias Navales
    '2025-06-20', // Día del Padre (algunos colegios)
    '2025-06-29', // San Pedro y San Pablo
    '2025-07-16', // Virgen del Carmen
    '2025-08-15', // Asunción de la Virgen
    '2025-09-18', // Fiestas Patrias
    '2025-09-19', // Día del Ejército
    '2025-10-12', // Día del Respeto a la Diversidad Cultural
    '2025-10-31', // Día de las Iglesias Evangélicas
    '2025-11-01', // Día de Todos los Santos
  ];
  
  // Inicio: 3 de Marzo 2025 (primer lunes de marzo)
  // Fin: 28 de Noviembre 2025
  let fecha = new Date(2025, 2, 3); // 3 de Marzo 2025
  const fechaFin = new Date(2025, 10, 28); // 28 de Noviembre 2025
  
  while (fecha <= fechaFin) {
    const diaSemana = fecha.getDay();
    const fechaStr = fecha.toISOString().split('T')[0];
    
    // Solo días hábiles (lunes=1 a viernes=5)
    if (diaSemana >= 1 && diaSemana <= 5) {
      // Excluir vacaciones de invierno
      if (fecha < inicioVacacionesInvierno || fecha > finVacacionesInvierno) {
        // Excluir feriados
        if (!feriados.includes(fechaStr)) {
          fechas.push(fechaStr);
        }
      }
    }
    
    // Avanzar al siguiente día
    fecha.setDate(fecha.getDate() + 1);
  }
  
  return fechas;
}

// Generar registros de asistencia
let registros = [];
const header = "nombre,rut,curso,seccion,fecha,estado";
registros.push(header);

const fechasEscolares = generarFechasEscolares();
console.log("Días escolares generados: " + fechasEscolares.length);

// 1ro Básico A
estudiantesBasicoA.forEach(est => {
  fechasEscolares.forEach(fecha => {
    const estado = randomEstado();
    registros.push(est.nombre + "," + est.rut + ",1ro Básico,A," + fecha + "," + estado);
  });
});

// 1ro Medio B
estudiantesMedioB.forEach(est => {
  fechasEscolares.forEach(fecha => {
    const estado = randomEstado();
    registros.push(est.nombre + "," + est.rut + ",1ro Medio,B," + fecha + "," + estado);
  });
});

// Escribir archivo
const contenido = registros.join('\n');
fs.writeFileSync('asistencia-1ro-basico-A-1ro-medio-B-2025.csv', contenido);

console.log('✅ Archivo generado: asistencia-1ro-basico-A-1ro-medio-B-2025.csv');
console.log('📊 Total registros: ' + (registros.length - 1));
console.log('   - Días escolares: ' + fechasEscolares.length);
console.log('   - 1ro Básico A: ' + (45 * fechasEscolares.length) + ' registros (45 estudiantes × ' + fechasEscolares.length + ' días)');
console.log('   - 1ro Medio B: ' + (45 * fechasEscolares.length) + ' registros (45 estudiantes × ' + fechasEscolares.length + ' días)');
console.log('\nDistribución esperada de estados:');
console.log('   - ~85% Presente');
console.log('   - ~8% Ausente');
console.log('   - ~5% Tardanza');
console.log('   - ~2% Justificado');
