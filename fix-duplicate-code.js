// Script para eliminar código duplicado en page.tsx
const fs = require('fs');

const filePath = '/workspaces/superjf_v8/src/app/dashboard/tareas/page.tsx';

// Leer el archivo
let content = fs.readFileSync(filePath, 'utf8');

console.log('📊 Total de líneas antes:', content.split('\n').length);

// Buscar el final de la primera función getStudentsForCourse
const lines = content.split('\n');

// Encontrar donde termina la primera función (línea 1162: "});")
let firstFunctionEnd = -1;
let secondFunctionStart = -1;

for (let i = 0; i < lines.length; i++) {
  // Buscar el final de la primera función
  if (lines[i].includes('displayName: s.displayName || s.username') && 
      lines[i+1] && lines[i+1].includes('}));') &&
      lines[i+2] && lines[i+2].includes('};') &&
      firstFunctionEnd === -1) {
    firstFunctionEnd = i + 2; // La línea con "};", esto es el final de la primera función
    console.log(`🔍 Primera función termina en línea: ${firstFunctionEnd + 1}`);
  }
  
  // Buscar donde empieza la segunda función getStudentsFromCourseRelevantToTask
  if (lines[i].includes('const getStudentsFromCourseRelevantToTask = (courseId: string, teacherId: string | undefined) => {') &&
      secondFunctionStart === -1) {
    // Buscar el comentario antes de la función
    let commentLine = i - 1;
    while (commentLine >= 0 && !lines[commentLine].includes('// Get students from a specific course')) {
      commentLine--;
    }
    secondFunctionStart = commentLine >= 0 ? commentLine : i;
    console.log(`🔍 Segunda función empieza en línea: ${secondFunctionStart + 1}`);
    break;
  }
}

if (firstFunctionEnd !== -1 && secondFunctionStart !== -1) {
  console.log(`🔧 Eliminando líneas ${firstFunctionEnd + 2} hasta ${secondFunctionStart}`);
  
  // Crear el nuevo contenido eliminando las líneas duplicadas
  const beforeDuplication = lines.slice(0, firstFunctionEnd + 1);
  const afterDuplication = lines.slice(secondFunctionStart);
  
  const newContent = [...beforeDuplication, '', ...afterDuplication].join('\n');
  
  // Escribir el archivo corregido
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log('✅ Código duplicado eliminado exitosamente');
  console.log('📊 Total de líneas después:', newContent.split('\n').length);
  console.log(`📉 Líneas eliminadas: ${lines.length - newContent.split('\n').length}`);
} else {
  console.log('❌ No se pudieron encontrar los puntos de inicio y fin del código duplicado');
  console.log('firstFunctionEnd:', firstFunctionEnd);
  console.log('secondFunctionStart:', secondFunctionStart);
}
