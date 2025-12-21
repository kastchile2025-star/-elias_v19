console.log('🧪 Configurando datos de prueba para comunicaciones de estudiantes...');

// Función para generar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Datos de ejemplo para comunicaciones
const sampleCommunications = [
  {
    id: generateId(),
    title: "Importante: Cambio de horario de evaluación",
    content: "Estimados estudiantes,\n\nLes informo que la evaluación de Matemáticas programada para el jueves 15 de marzo ha sido reprogramada para el viernes 16 de marzo a las 10:00 AM.\n\nPor favor, asegúrense de traer:\n- Calculadora científica\n- Lápices HB y 2B\n- Borrador\n- Regla\n\nRecuerden que el temario incluye:\n- Funciones trigonométricas\n- Logaritmos\n- Ecuaciones cuadráticas\n\nSaludos cordiales,\nProfesor Juan López",
    type: "course",
    targetCourse: "course_matematicast",
    targetSection: "section_3ro_a",
    senderId: "teacher_001",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
    readBy: []
  },
  {
    id: generateId(),
    title: "Recordatorio: Entrega de proyecto de Historia",
    content: "Queridos estudiantes,\n\nEste es un recordatorio de que el proyecto sobre la Independencia de Chile debe ser entregado el próximo lunes 20 de marzo antes de las 23:59 horas.\n\nRequisitos del proyecto:\n- Mínimo 10 páginas\n- Incluir bibliografía\n- Formato PDF\n- Enviar por correo electrónico\n\nNo se aceptarán entregas tardías sin justificación médica.\n\nÉxito en sus trabajos,\nProfesora María González",
    type: "course",
    targetCourse: "course_historia",
    targetSection: "section_3ro_a",
    senderId: "teacher_002",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    readBy: []
  },
  {
    id: generateId(),
    title: "Felicitaciones por tu excelente desempeño",
    content: "Estimado Carlos,\n\nQuiero felicitarte por tu destacado desempeño en la última evaluación de Física. Tu calificación de 95/100 demuestra tu dedicación y comprensión profunda de los conceptos.\n\nEspecialmente destacable fue tu resolución del problema de cinemática, donde aplicaste correctamente las ecuaciones de movimiento rectilíneo uniformemente acelerado.\n\nSigue así, tienes un gran potencial en las ciencias.\n\nSaludos,\nProfesor Roberto Silva",
    type: "student",
    targetStudent: "student_carlos",
    senderId: "teacher_003",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
    readBy: []
  },
  {
    id: generateId(),
    title: "Invitación: Charla sobre Carreras Universitarias",
    content: "Estimados estudiantes de 4° Medio,\n\nTenemos el agrado de invitarlos a una charla informativa sobre carreras universitarias que se realizará el próximo miércoles 22 de marzo en el auditorio del colegio.\n\nHorario: 14:00 - 16:00 horas\n\nUniversidades participantes:\n- Universidad de Chile\n- Pontificia Universidad Católica\n- Universidad de Santiago\n- Universidad Técnica Federico Santa María\n\nSe abordarán temas como:\n- Proceso de admisión\n- Becas y financiamiento\n- Perfil de egreso por carrera\n- Campo laboral\n\nLa asistencia es obligatoria para todos los estudiantes de 4° Medio.\n\nConfirmen su asistencia respondiendo a este mensaje.\n\nSaludos,\nOrientadora Carmen Muñoz",
    type: "course",
    targetCourse: "course_orientacion",
    targetSection: "section_4to_a",
    senderId: "teacher_004",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
    readBy: []
  },
  {
    id: generateId(),
    title: "Material de apoyo para Química disponible",
    content: "Estimados estudiantes,\n\nHe subido material complementario para el tema de Enlaces Químicos en la plataforma del colegio.\n\nEl material incluye:\n- Presentación PowerPoint con ejemplos\n- Ejercicios resueltos paso a paso\n- Videos explicativos\n- Ejercicios para practicar en casa\n\nLes recomiendo revisar este material antes de la próxima clase del martes.\n\nCualquier duda, pueden escribirme o consultarme en la próxima clase.\n\nSaludos,\nProfesora Ana Torres",
    type: "course",
    targetCourse: "course_quimica",
    targetSection: "section_3ro_a",
    senderId: "teacher_005",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
    readBy: []
  },
  {
    id: generateId(),
    title: "Citación a entrevista con apoderado",
    content: "Estimado Carlos,\n\nNecesito solicitar una reunión con tu apoderado para conversar sobre tu rendimiento académico y algunas situaciones que han surgido en clases.\n\nPor favor, pide a tu apoderado que se comunique conmigo para coordinar una cita durante esta semana.\n\nPuede contactarme:\n- Por teléfono: 22-123-4567\n- Por correo: profesora.garcia@colegio.cl\n- Presencialmente en mi oficina (Sala 201)\n\nEs importante que esta reunión se realice a la brevedad.\n\nSaludos,\nProfesora Patricia García\nProfesora Jefe 3°A",
    type: "student",
    targetStudent: "student_carlos",
    senderId: "teacher_006",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
    readBy: []
  }
];

// Función para configurar los datos
function setupStudentCommunicationsTest() {
  try {
    // Verificar si ya existen comunicaciones
    const existingCommunications = localStorage.getItem('smart-student-communications');
    let currentCommunications = existingCommunications ? JSON.parse(existingCommunications) : [];
    
    // Agregar las nuevas comunicaciones evitando duplicados
    sampleCommunications.forEach(newComm => {
      const exists = currentCommunications.some(existing => existing.title === newComm.title);
      if (!exists) {
        currentCommunications.push(newComm);
      }
    });
    
    // Guardar en localStorage
    localStorage.setItem('smart-student-communications', JSON.stringify(currentCommunications));
    
    console.log(`✅ Se han configurado ${currentCommunications.length} comunicaciones de prueba`);
    console.log('📧 Comunicaciones disponibles:');
    
    currentCommunications.forEach((comm, index) => {
      console.log(`${index + 1}. "${comm.title}" (${comm.type === 'course' ? 'Curso' : 'Individual'}) - ${new Date(comm.createdAt).toLocaleDateString()}`);
    });
    
    // Verificar asignaciones de estudiantes para testing
    const studentAssignments = localStorage.getItem('smart-student-student-assignments');
    if (!studentAssignments) {
      const defaultAssignments = [
        {
          studentId: "student_carlos",
          sectionId: "section_3ro_a",
          courseId: "course_matematicast"
        },
        {
          studentId: "student_carlos", 
          sectionId: "section_3ro_a",
          courseId: "course_historia"
        },
        {
          studentId: "student_carlos",
          sectionId: "section_3ro_a", 
          courseId: "course_quimica"
        }
      ];
      
      localStorage.setItem('smart-student-student-assignments', JSON.stringify(defaultAssignments));
      console.log('📝 Asignaciones de estudiante configuradas para testing');
    }
    
    console.log('\n🎯 Para probar:');
    console.log('1. Inicia sesión como estudiante (student_carlos / password123)');
    console.log('2. Ve a la pestaña "Comunicaciones"');
    console.log('3. Revisa las comunicaciones recibidas');
    console.log('4. Haz clic en cualquier comunicación para ver los detalles');
    console.log('5. Las comunicaciones se marcarán como leídas automáticamente');
    
  } catch (error) {
    console.error('❌ Error configurando datos de prueba:', error);
  }
}

// Ejecutar configuración
setupStudentCommunicationsTest();
