# 🔍 DIAGNÓSTICO - Estudiantes sin Asignación

## Problema Reportado
Los estudiantes se cargan (1,080 creados) pero aparecen como:
- ❌ "Sin curso asignado - Sin sección asignada"
- ❌ Contadores en secciones: "0/45" (0 estudiantes asignados)

## Causas Posibles

### 1. **Problema con el año escolar**
El CSV carga estudiantes para un año, pero la UI está mostrando otro año.

**Solución:**
- Verifica que estés en el año correcto (2025)
- El selector de año está en: Admin → Configuración → Año: 2025

### 2. **Cache del navegador**
El navegador tiene datos antiguos en caché y no refleja los nuevos.

**Solución:**
- Presiona F5 para refrescar la página
- O Ctrl+Shift+R (forzar recarga sin caché)
- O cierra y abre el navegador

### 3. **LocalStorage corrupto**
Los datos se guardaron pero con estructura incorrecta.

**Solución - Verificar en consola del navegador:**
```javascript
// Abrir DevTools (F12) y ejecutar:

const year = 2025;

// 1. Ver estudiantes guardados
const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
console.log(`📊 Estudiantes en ${year}:`, students.length);

// 2. Ver primeros 3 estudiantes con sus asignaciones
students.slice(0, 3).forEach((s, i) => {
  console.log(`\n👤 Estudiante ${i+1}:`, s.name);
  console.log(`   courseId: ${s.courseId}`);
  console.log(`   sectionId: ${s.sectionId}`);
  console.log(`   course: ${s.course || 'N/A'}`);
  console.log(`   section: ${s.section || 'N/A'}`);
});

// 3. Contar cuántos tienen courseId asignado
const conAsignacion = students.filter(s => s.courseId && s.sectionId).length;
console.log(`\n✅ Estudiantes con asignación: ${conAsignacion}/${students.length}`);

// 4. Ver cursos y secciones
const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');
console.log(`\n📚 Cursos: ${courses.length}`);
console.log(`📖 Secciones: ${sections.length}`);
```

## Solución Paso a Paso

### PASO 1: Limpiar datos existentes
```javascript
// En consola del navegador (F12):
const year = 2025;

// Borrar estudiantes del año actual
localStorage.removeItem(`smart-student-students-${year}`);

// Borrar usuarios (opcional si quieres empezar de cero)
// localStorage.removeItem('smart-student-users');

console.log('✅ Datos limpiados. Refresca la página (F5)');
```

### PASO 2: Verificar que los cursos y secciones existen
Antes de cargar estudiantes, asegúrate de que los cursos estén creados:

1. Ve a: **Admin → Cursos y Secciones**
2. Verifica que veas:
   - 1ro Básico (A, B)
   - 2do Básico (A, B)
   - ... hasta ...
   - 4to Medio (A, B)
3. Si NO existen, usa el botón **"Crea Cursos"** y **"Crear Secciones"**

### PASO 3: Cargar el CSV correcto
1. Ve a: **Admin → Configuración → Carga Masiva Excel**
2. Selecciona: `estudiantes_sistema_completo.csv` (el que tiene usernames)
3. Espera el mensaje: "✅ 1,080 usuarios creados"

### PASO 4: Verificar la asignación
Ejecuta en consola:
```javascript
const year = 2025;
const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
const withAssignment = students.filter(s => s.courseId && s.sectionId);

console.log(`Total: ${students.length}`);
console.log(`Con asignación: ${withAssignment.length}`);
console.log(`Sin asignación: ${students.length - withAssignment.length}`);

// Ver ejemplo de estudiante asignado
if (withAssignment.length > 0) {
  const example = withAssignment[0];
  console.log('\n📝 Ejemplo de estudiante asignado:');
  console.log(JSON.stringify(example, null, 2));
}
```

### PASO 5: Forzar recálculo de contadores
```javascript
// En consola del navegador:
const year = 2025;
const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');

// Contar estudiantes por sección
const countsBySectionId = new Map();
students.forEach(s => {
  if (s.sectionId) {
    const current = countsBySectionId.get(s.sectionId) || 0;
    countsBySectionId.set(s.sectionId, current + 1);
  }
});

// Actualizar secciones con el conteo
sections.forEach(sec => {
  sec.studentCount = countsBySectionId.get(sec.id) || 0;
});

// Guardar secciones actualizadas
localStorage.setItem(`smart-student-sections-${year}`, JSON.stringify(sections));

console.log('✅ Contadores actualizados. Refresca la página (F5)');
```

## Verificación Final

Después de estos pasos, deberías ver:

✅ En **Gestión de Usuarios**:
- 1,080 estudiantes listados
- Cada uno con su curso y sección asignados (no "Sin curso asignado")

✅ En **Cursos y Secciones**:
- Cada sección mostrando "0/45" → debe cambiar a "45/45"
- O el número real de estudiantes asignados

## Si el problema persiste

Ejecuta este comando para ver detalles del error:
```javascript
const year = 2025;
const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');

console.log('=== DIAGNÓSTICO COMPLETO ===');
console.log(`Estudiantes: ${students.length}`);
console.log(`Cursos: ${courses.length}`);
console.log(`Secciones: ${sections.length}`);

// Ver estructura del primer estudiante
if (students.length > 0) {
  console.log('\n📝 Estructura del primer estudiante:');
  console.log(Object.keys(students[0]));
  console.log(students[0]);
}

// Ver IDs de cursos/secciones
const courseIds = courses.map(c => ({ id: c.id, name: c.name }));
const sectionIds = sections.map(s => ({ id: s.id, name: s.name, courseId: s.courseId }));

console.log('\n📚 IDs de Cursos:', courseIds);
console.log('\n📖 IDs de Secciones (primeras 5):', sectionIds.slice(0, 5));

// Ver si los courseId/sectionId de estudiantes coinciden con los existentes
const studentCourseIds = [...new Set(students.map(s => s.courseId).filter(Boolean))];
const studentSectionIds = [...new Set(students.map(s => s.sectionId).filter(Boolean))];

console.log('\n🔍 CourseIds en estudiantes:', studentCourseIds);
console.log('🔍 SectionIds en estudiantes (primeros 10):', studentSectionIds.slice(0, 10));
```

Este comando mostrará si hay algún problema de coincidencia entre los IDs.
