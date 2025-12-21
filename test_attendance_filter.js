
const records = [
    { nombre: 'Sofía', curso: '1ro Básico', seccion: 'A', fecha: '2025-03-03', estado: 'late' },
    { nombre: 'Matías', curso: '1ro Básico', seccion: 'A', fecha: '2025-03-03', estado: 'present' }
];

const targetSectionId = 'some-uuid';
const targetCourseName = '1basico';
const targetSecName = 'a';
const semester = '1';

const normalizeCourseName = (s) => {
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
};

const normalizeSectionName = (s) => {
    return String(s||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\bseccion\b|\bsec\b/g, '')
        .replace(/[^a-z0-9]/g, '');
};

const checkSemester = (r) => {
    const semFilter = semester;
    if (!semFilter) return true;
    
    let d;
    const rawDate = r.date || r.fecha || r.timestamp;
    
    // Soporte explícito para DD-MM-YYYY y DD/MM/YYYY (común en CSVs latinos)
    if (typeof rawDate === 'string') {
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(rawDate)) {
        const [day, month, year] = rawDate.split('-').map(Number);
        d = new Date(year, month - 1, day);
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
        const [day, month, year] = rawDate.split('/').map(Number);
        d = new Date(year, month - 1, day);
    } else {
        d = new Date(rawDate);
    }
    } else {
        d = new Date(rawDate);
    }

    if (isNaN(d.getTime())) return false;
    
    const m = d.getMonth(); // 0=Ene, 11=Dic
    // Semestre 1: Enero a Julio (0-6)
    // Semestre 2: Agosto a Diciembre (7-11)
    const rSem = (m <= 6) ? '1' : '2';
    console.log(`Date: ${rawDate}, Month: ${m}, Sem: ${rSem}, Filter: ${semFilter}`);
    return semFilter === rSem;
};

const sectionRecords = records.filter((r) => {
    // 1. Filtro de semestre
    if (!checkSemester(r)) return false;

    // 2. Filtro por ID de sección (si existe en el registro)
    if (r.sectionId && r.sectionId === targetSectionId) return true;

    // 3. Filtro por pertenencia del estudiante a la sección
    // (Simulamos que no hay match por ID para probar el fallback de nombre)
    // if (r.studentId && sectionStudents.has(r.studentId)) return true;

    // 4. Fallback: Coincidencia por nombre de curso/sección (para CSVs planos)
    // Normalizamos lo que viene en el registro
    const rCurso = normalizeCourseName(r.course || r.curso);
    const rSeccion = normalizeSectionName(r.section || r.seccion);

    console.log(`Record: ${r.curso} ${r.seccion} -> ${rCurso} ${rSeccion}`);
    console.log(`Target: ${targetCourseName} ${targetSecName}`);

    // Si el registro tiene curso, debe coincidir con el seleccionado
    if (rCurso && rCurso !== targetCourseName) {
        console.log('Course mismatch');
        return false;
    }
    
    // Si el registro tiene sección, debe coincidir con la seleccionada
    if (rSeccion && rSeccion !== targetSecName) {
        console.log('Section mismatch');
        return false;
    }

    // Si llegamos aquí, es porque no contradice ni curso ni sección.
    // Pero para evitar falsos positivos de registros vacíos, exigimos que tenga AL MENOS curso o sección
    if (!rCurso && !rSeccion) return false;

    return true;
});

console.log('Filtered records:', sectionRecords.length);
