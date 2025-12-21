const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const OUTPUT_FILE = path.join(__dirname, 'asistencia-1ro-basico-A-2025.csv');

// Configuración
const YEAR = 2025;
const TARGET_COURSE = '1ro Básico';
const TARGET_SECTION = 'A';

// Probabilidades de asistencia
const PROBS = {
    present: 0.90,
    absent: 0.05,
    late: 0.03,
    excused: 0.02
};

function getRandomStatus() {
    const r = Math.random();
    if (r < PROBS.present) return 'present';
    if (r < PROBS.present + PROBS.absent) return 'absent';
    if (r < PROBS.present + PROBS.absent + PROBS.late) return 'late';
    return 'excused';
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0=Domingo, 6=Sábado
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function main() {
    console.log(`Leyendo archivo: ${INPUT_FILE}`);
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split('\n');
    
    // Parsear CSV simple (asumiendo sin comas en los campos por ahora, o manejo básico)
    const headers = lines[0].trim().split(',');
    const students = [];

    // Índices de columnas
    const idxRole = headers.indexOf('role');
    const idxName = headers.indexOf('name');
    const idxRut = headers.indexOf('rut');
    const idxUsername = headers.indexOf('username');
    const idxCourse = headers.indexOf('course');
    const idxSection = headers.indexOf('section');

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Manejo básico de CSV (split por coma)
        // Nota: Si hay comas dentro de comillas, esto fallaría, pero para este caso simple puede bastar.
        // Si el archivo es complejo, usaría una librería o regex mejor.
        const parts = line.split(','); 
        
        const role = parts[idxRole];
        const course = parts[idxCourse];
        const section = parts[idxSection];

        if (role === 'student' && course === TARGET_COURSE && section === TARGET_SECTION) {
            students.push({
                name: parts[idxName],
                rut: parts[idxRut],
                username: parts[idxUsername],
                course: course,
                section: section
            });
        }
    }

    console.log(`Encontrados ${students.length} estudiantes en ${TARGET_COURSE} ${TARGET_SECTION}`);

    if (students.length === 0) {
        console.error('No se encontraron estudiantes. Verifica los nombres de curso y sección.');
        return;
    }

    // Generar asistencia
    const outputLines = ['nombre,rut,username,curso,seccion,fecha,estado'];
    
    const startDate = new Date(YEAR, 2, 1); // 1 de Marzo (inicio clases aprox)
    const endDate = new Date(YEAR, 11, 15); // 15 de Diciembre (fin clases aprox)
    
    let currentDate = new Date(startDate);
    let totalRecords = 0;

    while (currentDate <= endDate) {
        if (!isWeekend(currentDate)) {
            const dateStr = formatDate(currentDate);
            
            students.forEach(student => {
                const status = getRandomStatus();
                // nombre,rut,username,curso,seccion,fecha,estado
                outputLines.push(`${student.name},${student.rut},${student.username},${student.course},${student.section},${dateStr},${status}`);
                totalRecords++;
            });
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generando ${totalRecords} registros de asistencia...`);
    fs.writeFileSync(OUTPUT_FILE, outputLines.join('\n'), 'utf-8');
    console.log(`Archivo generado exitosamente: ${OUTPUT_FILE}`);
}

main();
