
const { Timestamp } = require('firebase-admin/firestore'); // Mock o similar si no tengo entorno
// Mock simple de Timestamp
const mockTimestamp = { toDate: () => new Date() };

function fromFirestoreAttendance(data) {
    const status = data.status || data.estado || 'present';
    const present = status === 'present' || status === 'Presente' || status === 'presente';
    
    return {
      id: data.id,
      date: new Date().toISOString(),
      courseId: data.courseId || null,
      sectionId: data.sectionId || null,
      course: data.course || data.curso || null,
      section: data.section || data.seccion || null,
      rut: data.rut || null,
      username: data.username || data.studentUsername || null,
      studentId: data.studentUsername || data.studentId || data.username || '',
      status: status,
      present: present,
      comment: data.comment || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      year: data.year || new Date().getFullYear(),
    };
}

function testLogic() {
    // Simular datos que podrían venir de Firebase
    const rawData = [
        { status: 'present' },
        { status: 'late' },
        { estado: 'Presente' }, // Caso CSV
        { estado: 'late' },
        { estado: '"present"' }, // Comillas
        { estado: 'present.' }, // Punto
        { estado: 'Ausente' },
        { status: undefined, estado: undefined } // Fallback
    ];

    const records = rawData.map(d => fromFirestoreAttendance(d));
    
    console.log('Registros procesados:', records.length);

    let present = 0, late = 0, absent = 0, excused = 0;
    let unknown = [];

    records.forEach(r => {
        const rawSt = r.status || r.estado;
        const st = String(rawSt || '').replace(/['"]/g, '').replace(/\.$/, '').trim().toLowerCase();

        if (st === 'present' || st === 'presente') present++;
        else if (st === 'late' || st === 'tarde' || st === 'atrasado') late++;
        else if (st === 'absent' || st === 'ausente') absent++;
        else if (st === 'excused' || st === 'justificado') excused++;
        else unknown.push(st);
    });

    const total = present + late + absent + excused;
    const positive = present + late;
    const avg = total > 0 ? Math.round((positive / total) * 100) : 0;

    console.log('Stats:', { avg, present, late, absent, excused, total });
    console.log('Unknown:', unknown);
}

testLogic();
