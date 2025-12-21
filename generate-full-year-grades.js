/**
 * Generador de calificaciones completas para el año académico 2025
 * 
 * Especificaciones:
 * - Lee estudiantes desde users-consolidated-2025-CORREGIDO_v2.csv
 * - 10 actividades por asignatura por semestre (20 total por asignatura)
 * - 1er semestre: Marzo a Junio | 2do semestre: Julio a Diciembre
 * - 10% de notas reprobatorias (< 40)
 * - Escala: 1 a 100
 * - Campos con comas se encierran en comillas dobles
 */

const fs = require('fs');
const path = require('path');

// Función para escapar campos CSV con comas
function escapeCSV(value) {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// Asignaturas por nivel
const SUBJECTS = {
    basico: [
        'Ciencias Naturales',
        'Historia, Geografía y Ciencias Sociales',
        'Lenguaje y Comunicación',
        'Matemáticas'
    ],
    medio: [
        'Biología',
        'Educación Ciudadana',
        'Filosofía',
        'Física',
        'Historia, Geografía y Ciencias Sociales',
        'Lenguaje y Comunicación',
        'Matemáticas',
        'Química'
    ]
};

// Fechas de actividades por semestre (10 fechas cada uno)
const DATES = {
    semester1: [
        '2025-03-10', '2025-03-24',  // Marzo
        '2025-04-07', '2025-04-21',  // Abril
        '2025-05-05', '2025-05-19',  // Mayo
        '2025-06-02', '2025-06-16', '2025-06-23', '2025-06-30'  // Junio
    ],
    semester2: [
        '2025-07-14', '2025-07-28',  // Julio
        '2025-08-11', '2025-08-25',  // Agosto
        '2025-09-08', '2025-09-22',  // Septiembre
        '2025-10-06', '2025-10-20',  // Octubre
        '2025-11-03', '2025-11-17'   // Noviembre
    ]
};

// Generar nota aleatoria (1-100), con 10% de reprobados
function randomGrade() {
    const isReprobado = Math.random() < 0.10; // 10% reprobados
    if (isReprobado) {
        // Nota entre 1 y 39 (reprobado)
        return Math.floor(Math.random() * 39) + 1;
    } else {
        // Nota entre 40 y 100 (aprobado)
        return Math.floor(Math.random() * 61) + 40;
    }
}

// Leer archivo CSV de usuarios
function readUsersCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const students = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Parser simple para CSV (sin comillas en este archivo)
        const values = line.split(',');
        
        const role = values[0]?.trim();
        if (role !== 'student') continue;
        
        const name = values[1]?.trim();
        const rut = values[2]?.trim();
        const course = values[6]?.trim();
        const section = values[7]?.trim();
        
        if (name && rut && course && section) {
            students.push({ name, rut, course, section });
        }
    }
    
    return students;
}

// Determinar nivel del curso
function getCourseLevel(course) {
    if (course.includes('Básico') || course.includes('Basico')) {
        return 'basico';
    }
    return 'medio';
}

// Generar CSV de calificaciones
function generateGradesCSV(students, outputPath) {
    const rows = [];
    
    // Header
    rows.push('studentRut,studentName,course,section,subject,semester,activityNumber,activityDate,grade,topic');
    
    let totalRecords = 0;
    let reprobados = 0;
    
    // Filtrar solo los cursos que nos interesan
    const targetCourses = ['1ro Básico', '2do Básico', '1ro Medio', '2do Medio'];
    
    const filteredStudents = students.filter(s => {
        const courseNorm = s.course.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return targetCourses.some(tc => {
            const targetNorm = tc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return courseNorm === targetNorm;
        });
    });
    
    console.log(`📚 Procesando ${filteredStudents.length} estudiantes de los cursos objetivo...`);
    
    for (const student of filteredStudents) {
        const level = getCourseLevel(student.course);
        const subjects = SUBJECTS[level];
        
        for (const subject of subjects) {
            // Semestre 1
            for (let actNum = 1; actNum <= 10; actNum++) {
                const date = DATES.semester1[actNum - 1];
                const grade = randomGrade();
                if (grade < 40) reprobados++;
                
                const topic = `Evaluación ${actNum} - Unidad ${Math.ceil(actNum / 2)}`;
                
                const row = [
                    student.rut,
                    escapeCSV(student.name),
                    escapeCSV(student.course),
                    student.section,
                    escapeCSV(subject),
                    1,  // semestre
                    actNum,
                    date,
                    grade,
                    escapeCSV(topic)
                ].join(',');
                
                rows.push(row);
                totalRecords++;
            }
            
            // Semestre 2
            for (let actNum = 1; actNum <= 10; actNum++) {
                const date = DATES.semester2[actNum - 1];
                const grade = randomGrade();
                if (grade < 40) reprobados++;
                
                const topic = `Evaluación ${actNum} - Unidad ${Math.ceil(actNum / 2) + 5}`;
                
                const row = [
                    student.rut,
                    escapeCSV(student.name),
                    escapeCSV(student.course),
                    student.section,
                    escapeCSV(subject),
                    2,  // semestre
                    actNum,
                    date,
                    grade,
                    escapeCSV(topic)
                ].join(',');
                
                rows.push(row);
                totalRecords++;
            }
        }
    }
    
    // Escribir archivo
    fs.writeFileSync(outputPath, rows.join('\n'), 'utf-8');
    
    const reprobadoPercent = ((reprobados / totalRecords) * 100).toFixed(1);
    
    console.log(`\n✅ CSV generado exitosamente!`);
    console.log(`📁 Archivo: ${outputPath}`);
    console.log(`📊 Total de registros: ${totalRecords.toLocaleString()}`);
    console.log(`👥 Estudiantes procesados: ${filteredStudents.length}`);
    console.log(`❌ Notas reprobatorias: ${reprobados.toLocaleString()} (${reprobadoPercent}%)`);
    console.log(`✅ Notas aprobatorias: ${(totalRecords - reprobados).toLocaleString()} (${(100 - parseFloat(reprobadoPercent)).toFixed(1)}%)`);
    
    // Mostrar muestra
    console.log(`\n📋 Muestra de primeros 5 registros:`);
    for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
        console.log(`   ${rows[i]}`);
    }
    
    // Verificar que Historia tiene comillas
    const historiaRow = rows.find(r => r.includes('Historia'));
    if (historiaRow) {
        console.log(`\n🔍 Verificación de escape (Historia con comillas):`);
        console.log(`   ${historiaRow}`);
    }
}

// Main
const usersFile = path.join(__dirname, 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const outputFile = path.join(__dirname, 'public/test-data/calificaciones_ano_completo_2025.csv');

console.log('🚀 Iniciando generación de calificaciones del año completo 2025...\n');

const students = readUsersCSV(usersFile);
console.log(`📖 Leídos ${students.length} estudiantes del archivo de usuarios`);

// Mostrar distribución
const distribution = {};
for (const s of students) {
    const key = `${s.course} ${s.section}`;
    distribution[key] = (distribution[key] || 0) + 1;
}
console.log('\n📊 Distribución de estudiantes por curso:');
Object.entries(distribution).sort().forEach(([key, count]) => {
    console.log(`   ${key}: ${count} estudiantes`);
});

generateGradesCSV(students, outputFile);
