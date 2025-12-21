const fs = require('fs');

// Estudiantes de 1ro Básico A (extraídos del CSV)
const estudiantes = [
  { name: 'Sofía González González', rut: '10000000-8', username: 'sofia' },
  { name: 'Matías González Díaz', rut: '10000001-6', username: 'm.gonzalez0016' },
  { name: 'Valentina González Contreras', rut: '10000002-4', username: 'v.gonzalez0024' },
  { name: 'Benjamín González Sepúlveda', rut: '10000003-2', username: 'b.gonzalez0032' },
  { name: 'Martina González López', rut: '10000004-0', username: 'm.gonzalez0040' },
  { name: 'Lucas González Torres', rut: '10000005-9', username: 'l.gonzalez0059' },
  { name: 'Isidora González Espinoza', rut: '10000006-7', username: 'i.gonzalez0067' },
  { name: 'Agustín González Vega', rut: '10000007-5', username: 'a.gonzalez0075' },
  { name: 'Emilia González Gutiérrez', rut: '10000008-3', username: 'e.gonzalez0083' },
  { name: 'Tomás González Ramírez', rut: '10000009-1', username: 't.gonzalez0091' },
  { name: 'Amanda González Cortés', rut: '10000010-5', username: 'a.gonzalez0105' },
  { name: 'Diego González Figueroa', rut: '10000011-3', username: 'd.gonzalez0113' },
  { name: 'Catalina González Jara', rut: '10000012-1', username: 'c.gonzalez0121' },
  { name: 'Santiago González Campos', rut: '10000013-k', username: 's.gonzalez0013' },
  { name: 'Josefa González Alarcón', rut: '10000014-8', username: 'j.gonzalez0148' },
  { name: 'Nicolás González González', rut: '10000015-6', username: 'n.gonzalez0156' },
  { name: 'Florencia González Díaz', rut: '10000016-4', username: 'f.gonzalez0164' },
  { name: 'Gabriel González Contreras', rut: '10000017-2', username: 'g.gonzalez0172' },
  { name: 'Trinidad González Sepúlveda', rut: '10000018-0', username: 't.gonzalez0180' },
  { name: 'Maximiliano González López', rut: '10000019-9', username: 'm.gonzalez0199' },
  { name: 'Antonia González Torres', rut: '10000020-2', username: 'a.gonzalez0202' },
  { name: 'Joaquín González Espinoza', rut: '10000021-0', username: 'j.gonzalez0210' },
  { name: 'Constanza González Vega', rut: '10000022-9', username: 'c.gonzalez0229' },
  { name: 'Felipe González Gutiérrez', rut: '10000023-7', username: 'f.gonzalez0237' },
  { name: 'María José González Ramírez', rut: '10000024-5', username: 'm.gonzalez0245' },
  { name: 'Sebastián González Cortés', rut: '10000025-3', username: 's.gonzalez0253' },
  { name: 'Fernanda González Figueroa', rut: '10000026-1', username: 'f.gonzalez0261' },
  { name: 'Vicente González Jara', rut: '10000027-k', username: 'v.gonzalez0027' },
  { name: 'Javiera González Campos', rut: '10000028-8', username: 'j.gonzalez0288' },
  { name: 'Cristóbal González Alarcón', rut: '10000029-6', username: 'c.gonzalez0296' },
  { name: 'Maite González González', rut: '10000030-k', username: 'm.gonzalez0030' },
  { name: 'Andrés González Díaz', rut: '10000031-8', username: 'a.gonzalez0318' },
  { name: 'Ignacia González Contreras', rut: '10000032-6', username: 'i.gonzalez0326' },
  { name: 'Manuel González Sepúlveda', rut: '10000033-4', username: 'm.gonzalez0334' },
  { name: 'Renata González López', rut: '10000034-2', username: 'r.gonzalez0342' },
  { name: 'Mateo González Torres', rut: '10000035-0', username: 'm.gonzalez0350' },
  { name: 'Francisca González Espinoza', rut: '10000036-9', username: 'f.gonzalez0369' },
  { name: 'Ángel González Vega', rut: '10000037-7', username: 'a.gonzalez0377' },
  { name: 'Victoria González Gutiérrez', rut: '10000038-5', username: 'v.gonzalez0385' },
  { name: 'Eduardo González Ramírez', rut: '10000039-3', username: 'e.gonzalez0393' },
  { name: 'Carolina González Cortés', rut: '10000040-7', username: 'c.gonzalez0407' },
  { name: 'Alberto González Figueroa', rut: '10000041-5', username: 'a.gonzalez0415' },
  { name: 'Daniela González Jara', rut: '10000042-3', username: 'd.gonzalez0423' },
  { name: 'Roberto González Campos', rut: '10000043-1', username: 'r.gonzalez0431' },
  { name: 'Gabriela González Alarcón', rut: '10000044-k', username: 'g.gonzalez0044' }
];

// Generar días de lunes a viernes para 2025
// 1er Semestre: Marzo (3) a Junio (6)
// 2do Semestre: Julio (7) a Diciembre (12)
const diasClase = [];
const year = 2025;

// Función para verificar si es día de semana (lunes=1 a viernes=5)
function esLunesAViernes(date) {
  const dia = date.getDay();
  return dia >= 1 && dia <= 5;
}

// Generar fechas para ambos semestres (Marzo a Diciembre)
for (let mes = 3; mes <= 12; mes++) {
  const diasEnMes = new Date(year, mes, 0).getDate();
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(year, mes - 1, dia);
    if (esLunesAViernes(fecha)) {
      const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      diasClase.push(fechaStr);
    }
  }
}

console.log('=== Generador de Asistencia 1ro Básico A - 2025 ===');
console.log('Total días de clase (Lun-Vie, Marzo-Diciembre):', diasClase.length);
console.log('Total estudiantes:', estudiantes.length);
console.log('Total registros a generar:', diasClase.length * estudiantes.length);

// Generar CSV
const rows = ['date,course,section,username,rut,name,status'];

// Estados de asistencia con distribución realista:
// 80% presente, 10% ausente, 10% tarde
const statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'absent', 'late'];

for (const fecha of diasClase) {
  for (const est of estudiantes) {
    // Asignar estado aleatorio pero realista
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    rows.push(`${fecha},1ro Básico,A,${est.username},${est.rut},"${est.name}",${status}`);
  }
}

const outputPath = 'asistencia-1ro-basico-A-2025-completo.csv';
fs.writeFileSync(outputPath, rows.join('\n'), 'utf-8');

console.log('\n✅ Archivo creado:', outputPath);
console.log('Total filas (sin header):', rows.length - 1);
console.log('\nPrimeras fechas:', diasClase.slice(0, 5));
console.log('Últimas fechas:', diasClase.slice(-5));
