
function normalizeCourseName(s) {
    let n = String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    n = n.replace(/\b1ro\b|\bprimero\b|\bprimer\b/g, '1')
            .replace(/\b2do\b|\bsegundo\b/g, '2')
            .replace(/\b3ro\b|\btercero\b|\btercer\b/g, '3')
            .replace(/\b4to\b|\bcuarto\b/g, '4')
            .replace(/\b5to\b|\bquinto\b/g, '5')
            .replace(/\b6to\b|\bsexto\b/g, '6')
            .replace(/\b7mo\b|\bseptimo\b|\bséptimo\b/g, '7')
            .replace(/\b8vo\b|\boctavo\b/g, '8')
            .replace(/°/g, '')
            .replace(/[^a-z0-9]/g, '');
    return n;
}

function normalizeSectionName(s) {
    return String(s||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\bseccion\b|\bsec\b/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function testNames() {
    const csvCourse = "1ro Básico";
    const csvSection = "A";
    
    const dbCourse = "1° Básico"; // Ejemplo de lo que podría haber en DB
    const dbSection = "A";

    const nCsvCourse = normalizeCourseName(csvCourse);
    const nCsvSection = normalizeSectionName(csvSection);
    
    const nDbCourse = normalizeCourseName(dbCourse);
    const nDbSection = normalizeSectionName(dbSection);

    console.log(`CSV: "${csvCourse}" -> "${nCsvCourse}"`);
    console.log(`DB:  "${dbCourse}"  -> "${nDbCourse}"`);
    console.log(`Match Curso: ${nCsvCourse === nDbCourse}`);

    console.log(`CSV: "${csvSection}" -> "${nCsvSection}"`);
    console.log(`DB:  "${dbSection}"  -> "${nDbSection}"`);
    console.log(`Match Sección: ${nCsvSection === nDbSection}`);
}

testNames();
