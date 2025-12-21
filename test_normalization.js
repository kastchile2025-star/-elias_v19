
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

console.log("1ro Básico ->", normalizeCourseName("1ro Básico"));
console.log("1° Básico ->", normalizeCourseName("1° Básico"));
console.log("Primero Básico ->", normalizeCourseName("Primero Básico"));
console.log("1ro Basico ->", normalizeCourseName("1ro Basico"));

console.log("Sección A ->", normalizeSectionName("Sección A"));
console.log("Sec A ->", normalizeSectionName("Sec A"));
console.log("A ->", normalizeSectionName("A"));
