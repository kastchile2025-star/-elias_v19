// 🔍 SCRIPT DE DIAGNÓSTICO ESPECÍFICO PARA COMENTARIOS
// Ejecutar este código en la consola del navegador (F12 → Console)

(function() {
  console.log("🔍 DIAGNÓSTICO ESPECÍFICO DEL SISTEMA DE COMENTARIOS");
  console.log("=" .repeat(70));
  
  // 1. Obtener todos los datos
  const taskComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  
  console.log("📊 ESTADO DEL SISTEMA:");
  console.log(`   💬 Total comentarios: ${taskComments.length}`);
  console.log(`   👨‍🏫 Profesores: ${teachers.length} (${teachers.map(t => t.username).join(', ')})`);
  console.log(`   👩‍🎓 Estudiantes: ${students.length} (${students.map(s => s.username).join(', ')})`);
  console.log("");
  
  // 2. Analizar estructura de comentarios
  console.log("🔍 ANÁLISIS DETALLADO DE COMENTARIOS:");
  console.log("Primeros 3 comentarios como muestra:");
  taskComments.slice(0, 3).forEach((comment, index) => {
    console.log(`   ${index + 1}. Estructura del comentario:`, comment);
  });
  console.log("");
  
  // 3. Categorizar comentarios por autor
  console.log("📝 COMENTARIOS POR TIPO DE AUTOR:");
  
  const commentsByAuthorType = {
    fromTeachers: [],
    fromStudents: [],
    unknown: []
  };
  
  taskComments.forEach(comment => {
    // Verificar quién hizo el comentario usando diferentes campos posibles
    let authorUsername = comment.studentUsername || comment.username || comment.authorUsername;
    let isSubmission = comment.isSubmission || false;
    
    if (authorUsername) {
      const author = users.find(u => u.username === authorUsername);
      if (author) {
        if (author.role === 'teacher') {
          commentsByAuthorType.fromTeachers.push({...comment, authorRole: 'teacher'});
        } else if (author.role === 'student') {
          commentsByAuthorType.fromStudents.push({...comment, authorRole: 'student'});
        } else {
          commentsByAuthorType.unknown.push({...comment, authorRole: 'unknown'});
        }
      } else {
        commentsByAuthorType.unknown.push({...comment, authorRole: 'not_found'});
      }
    } else {
      commentsByAuthorType.unknown.push({...comment, authorRole: 'no_username'});
    }
  });
  
  console.log(`   👨‍🏫 Comentarios de profesores: ${commentsByAuthorType.fromTeachers.length}`);
  console.log(`   👩‍🎓 Comentarios de estudiantes: ${commentsByAuthorType.fromStudents.length}`);
  console.log(`   ❓ Comentarios sin identificar: ${commentsByAuthorType.unknown.length}`);
  console.log("");
  
  // 4. Mostrar comentarios de profesores detalladamente
  if (commentsByAuthorType.fromTeachers.length > 0) {
    console.log("👨‍🏫 COMENTARIOS DE PROFESORES:");
    commentsByAuthorType.fromTeachers.forEach((comment, index) => {
      const authorUsername = comment.studentUsername || comment.username || comment.authorUsername;
      console.log(`   ${index + 1}. Profesor: ${authorUsername}`);
      console.log(`      📄 Comentario: ${comment.comment?.substring(0, 50) || 'N/A'}...`);
      console.log(`      📋 Tarea: ${comment.taskId}`);
      console.log(`      📅 Fecha: ${comment.timestamp}`);
      console.log(`      👀 Leído por: ${comment.readBy ? comment.readBy.join(', ') : 'Nadie'}`);
      console.log(`      📝 Es entrega: ${comment.isSubmission ? 'Sí' : 'No'}`);
      console.log("");
    });
  }
  
  // 5. Simular lo que ve cada profesor
  console.log("👀 SIMULACIÓN: LO QUE VE CADA PROFESOR:");
  teachers.forEach(teacher => {
    console.log(`\\n👨‍🏫 PROFESOR: ${teacher.username} (ID: ${teacher.id})`);
    
    // Estudiantes asignados a este profesor
    const assignedStudents = students.filter(student => student.assignedTeacherId === teacher.id);
    console.log(`   👥 Estudiantes asignados: ${assignedStudents.map(s => s.username).join(', ')}`);
    
    // Comentarios que vería este profesor (simulando la lógica actual)
    const visibleComments = taskComments.filter(comment => {
      // Excluir comentarios propios
      if (comment.studentUsername === teacher.username) return false;
      
      // Excluir comentarios de entrega
      if (comment.isSubmission) return false;
      
      // Excluir si ya fue leído
      if (comment.readBy?.includes(teacher.username)) return false;
      
      // Solo incluir comentarios de estudiantes asignados
      const commentAuthor = users.find(u => u.username === comment.studentUsername);
      if (!commentAuthor || commentAuthor.role !== 'student') return false;
      if (commentAuthor.assignedTeacherId !== teacher.id) return false;
      
      return true;
    });
    
    console.log(`   📬 Comentarios no leídos que vería: ${visibleComments.length}`);
    visibleComments.forEach(comment => {
      const author = users.find(u => u.username === comment.studentUsername);
      console.log(`      - De: ${comment.studentUsername} (${author?.role || 'unknown'}) | Tarea: ${comment.taskId}`);
      console.log(`        Comentario: ${comment.comment?.substring(0, 30) || 'N/A'}...`);
    });
    
    // Buscar comentarios problemáticos que podría estar viendo
    const problematicComments = taskComments.filter(comment => {
      if (comment.readBy?.includes(teacher.username)) return false;
      if (comment.isSubmission) return false;
      if (comment.studentUsername === teacher.username) return false;
      
      const author = users.find(u => u.username === comment.studentUsername);
      return author && author.role === 'teacher' && author.username !== teacher.username;
    });
    
    if (problematicComments.length > 0) {
      console.log(`   🚨 COMENTARIOS PROBLEMÁTICOS que podría ver: ${problematicComments.length}`);
      problematicComments.forEach(comment => {
        const author = users.find(u => u.username === comment.studentUsername);
        console.log(`      ⚠️ De: ${comment.studentUsername} (${author?.role || 'unknown'}) | Tarea: ${comment.taskId}`);
      });
    }
  });
  
  console.log("");
  console.log("=" .repeat(70));
})();
