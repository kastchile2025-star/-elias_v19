
const fs = require('fs');
const path = require('path');

// Simular la lógica del componente
function testNormalization() {
    const csvPath = path.join(process.cwd(), 'asistencia-1ro-basico-A-2025.csv');
    try {
        const content = fs.readFileSync(csvPath, 'utf-8');
        const lines = content.split('\n').slice(1); // Ignorar header

        console.log(`Procesando ${lines.length} líneas del CSV...`);

        let present = 0, late = 0, absent = 0, excused = 0;
        let unknown = new Set();

        lines.forEach(line => {
            if (!line.trim()) return;
            // Parseo CSV simple (asumiendo sin comas en campos por ahora, o última columna)
            const parts = line.split(',');
            const rawSt = parts[parts.length - 1]; 
            
            // Lógica del componente EXACTA
            const st = String(rawSt || '').replace(/['"]/g, '').replace(/\.$/, '').trim().toLowerCase();

            if (st === 'present' || st === 'presente') present++;
            else if (st === 'late' || st === 'tarde' || st === 'atrasado') late++;
            else if (st === 'absent' || st === 'ausente') absent++;
            else if (st === 'excused' || st === 'justificado') excused++;
            else unknown.add(`'${rawSt}' -> '${st}'`);
        });

        const total = present + late + absent + excused;
        const positive = present + late;
        const avg = total > 0 ? Math.round((positive / total) * 100) : 0;

        console.log('Resultados:');
        console.log(`Present: ${present}`);
        console.log(`Late: ${late}`);
        console.log(`Absent: ${absent}`);
        console.log(`Excused: ${excused}`);
        console.log(`Total reconocidos: ${total}`);
        console.log(`Promedio calculado: ${avg}%`);
        
        if (unknown.size > 0) {
            console.log('Estados desconocidos (muestra):', Array.from(unknown).slice(0, 10));
        }
    } catch (e) {
        console.error("Error leyendo archivo:", e.message);
    }
}

testNormalization();
