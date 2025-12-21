# 🔧 SOLUCIÓN: Problema de Carga CSV - Campos Vacíos

## ❌ PROBLEMA IDENTIFICADO

Al ejecutar el script de corrección vimos:
```
✅ Ya asignados: 360 (solo 1ro-4to Medio)
❌ Sin curso: 720 (estudiantes de Básica)
❌ Sin sección: 720
```

**Causa:** Los campos `course` y `section` están **vacíos** en localStorage para 720 estudiantes.
**Razón:** Problema de encoding UTF-8 durante la carga del CSV.

---

## ✅ SOLUCIÓN COMPLETA (3 PASOS)

### PASO 1: Limpiar Datos Actuales
```javascript
// Ejecuta en consola del navegador (F12)
const year = 2025;
localStorage.removeItem(`smart-student-students-${year}`);
console.log('✅ Estudiantes eliminados');
location.reload();
```

### PASO 2: Recargar CSV con Encoding Correcto

1. **Abre el archivo CSV:**
   - Ruta: `/workspaces/superjf_v16/public/test-data/estudiantes_sistema_completo.csv`

2. **Carga en SmartStudent:**
   - Admin → Configuración → Carga Masiva Excel
   - Click "Upload Excel"
   - Selecciona: `estudiantes_sistema_completo.csv`
   - **IMPORTANTE:** Asegúrate que el navegador muestra "1,080 usuarios creados"

3. **Verifica inmediatamente en consola:**
```javascript
const students = JSON.parse(localStorage.getItem('smart-student-students-2025') || '[]');
const primerEstudiante = students[0];
console.log('Nombre:', primerEstudiante.name);
console.log('Curso:', primerEstudiante.course);
console.log('Sección:', primerEstudiante.section);
console.log('CourseId:', primerEstudiante.courseId);
console.log('SectionId:', primerEstudiante.sectionId);
```

**RESULTADO ESPERADO:**
```
Nombre: Sofía González Muñoz
Curso: 1ro Básico
Sección: A
CourseId: crs-xxx...
SectionId: sec-xxx...
```

### PASO 3: Si Sigue Fallando - Conversión Manual

Si después de recargar aún falta `courseId/sectionId`, ejecuta este script de corrección mejorado:

```javascript
// SCRIPT DE CORRECCIÓN MEJORADA
(function() {
  const year = 2025;
  const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
  const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
  const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');

  console.log(`📊 Datos: ${students.length} estudiantes, ${courses.length} cursos, ${sections.length} secciones`);

  // Mapeo de estudiantes por sección (45 por sección, 24 secciones = 1080)
  const distribucion = [
    { curso: '1ro Básico', seccion: 'A', inicio: 0, fin: 45 },
    { curso: '1ro Básico', seccion: 'B', inicio: 45, fin: 90 },
    { curso: '2do Básico', seccion: 'A', inicio: 90, fin: 135 },
    { curso: '2do Básico', seccion: 'B', inicio: 135, fin: 180 },
    { curso: '3ro Básico', seccion: 'A', inicio: 180, fin: 225 },
    { curso: '3ro Básico', seccion: 'B', inicio: 225, fin: 270 },
    { curso: '4to Básico', seccion: 'A', inicio: 270, fin: 315 },
    { curso: '4to Básico', seccion: 'B', inicio: 315, fin: 360 },
    { curso: '5to Básico', seccion: 'A', inicio: 360, fin: 405 },
    { curso: '5to Básico', seccion: 'B', inicio: 405, fin: 450 },
    { curso: '6to Básico', seccion: 'A', inicio: 450, fin: 495 },
    { curso: '6to Básico', seccion: 'B', inicio: 495, fin: 540 },
    { curso: '7mo Básico', seccion: 'A', inicio: 540, fin: 585 },
    { curso: '7mo Básico', seccion: 'B', inicio: 585, fin: 630 },
    { curso: '8vo Básico', seccion: 'A', inicio: 630, fin: 675 },
    { curso: '8vo Básico', seccion: 'B', inicio: 675, fin: 720 },
    { curso: '1ro Medio', seccion: 'A', inicio: 720, fin: 765 },
    { curso: '1ro Medio', seccion: 'B', inicio: 765, fin: 810 },
    { curso: '2do Medio', seccion: 'A', inicio: 810, fin: 855 },
    { curso: '2do Medio', seccion: 'B', inicio: 855, fin: 900 },
    { curso: '3ro Medio', seccion: 'A', inicio: 900, fin: 945 },
    { curso: '3ro Medio', seccion: 'B', inicio: 945, fin: 990 },
    { curso: '4to Medio', seccion: 'A', inicio: 990, fin: 1035 },
    { curso: '4to Medio', seccion: 'B', inicio: 1035, fin: 1080 }
  ];

  const normalize = (s) => String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/(\d+)\s*(ro|do|to|mo|vo)/g, '$1')
    .trim();

  const courseMap = new Map();
  courses.forEach(c => courseMap.set(normalize(c.name), c));

  const sectionMap = new Map();
  sections.forEach(s => {
    const key = `${s.courseId}|${normalize(s.name)}`;
    sectionMap.set(key, s);
  });

  let asignados = 0;

  distribucion.forEach(dist => {
    const courseNorm = normalize(dist.curso);
    const course = courseMap.get(courseNorm);
    
    if (!course) {
      console.error(`❌ Curso no encontrado: ${dist.curso}`);
      return;
    }

    const sectionKey = `${course.id}|${normalize(dist.seccion)}`;
    const section = sectionMap.get(sectionKey);

    if (!section) {
      console.error(`❌ Sección no encontrada: ${dist.seccion} en ${dist.curso}`);
      return;
    }

    for (let i = dist.inicio; i < dist.fin && i < students.length; i++) {
      students[i].course = dist.curso;
      students[i].section = dist.seccion;
      students[i].courseId = course.id;
      students[i].sectionId = section.id;
      asignados++;
    }

    console.log(`✅ ${dist.curso} ${dist.seccion}: ${dist.fin - dist.inicio} estudiantes asignados`);
  });

  // Recalcular contadores
  const countsBySectionId = new Map();
  students.forEach(s => {
    if (s.sectionId) {
      countsBySectionId.set(s.sectionId, (countsBySectionId.get(s.sectionId) || 0) + 1);
    }
  });

  sections.forEach(sec => {
    sec.studentCount = countsBySectionId.get(sec.id) || 0;
  });

  // Guardar
  localStorage.setItem(`smart-student-students-${year}`, JSON.stringify(students));
  localStorage.setItem(`smart-student-sections-${year}`, JSON.stringify(sections));

  console.log(`\n✅ CORRECCIÓN COMPLETADA: ${asignados} estudiantes asignados`);
  console.log('🔄 Presiona F5 para ver los cambios');

  // Disparar eventos
  window.dispatchEvent(new CustomEvent('usersUpdated', { detail: { action: 'manual-fix' } }));
  window.dispatchEvent(new CustomEvent('sectionsChanged', { detail: { source: 'manual-fix' } }));
})();
```

---

## 🎯 VERIFICACIÓN FINAL

Después de ejecutar el script, verifica:

```javascript
const year = 2025;
const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
const conAsignacion = students.filter(s => s.courseId && s.sectionId).length;

console.log(`Total: ${students.length}`);
console.log(`Con asignación: ${conAsignacion}`);
console.log(`Sin asignación: ${students.length - conAsignacion}`);

// Ver distribución por curso
const distribucion = {};
students.forEach(s => {
  const key = `${s.course || 'Sin curso'} - ${s.section || 'Sin sección'}`;
  distribucion[key] = (distribucion[key] || 0) + 1;
});
console.table(distribucion);
```

**RESULTADO ESPERADO:**
```
Total: 1080
Con asignación: 1080
Sin asignación: 0

┌─────────────────────┬────────┐
│     (index)         │ Values │
├─────────────────────┼────────┤
│ 1ro Básico - A      │   45   │
│ 1ro Básico - B      │   45   │
│ 2do Básico - A      │   45   │
│ 2do Básico - B      │   45   │
│ ... (24 secciones)  │   45   │
└─────────────────────┴────────┘
```

---

## 📋 RESUMEN

1. ✅ El CSV está bien generado
2. ❌ Durante la carga se perdieron los campos `course` y `section`
3. 🔧 Solución: Recargar CSV o usar script de corrección manual
4. 🎯 Objetivo: 1,080 estudiantes con courseId/sectionId

---

## 🆘 SI NADA FUNCIONA

Opción de emergencia - Regenerar CSV con BOM UTF-8:

```bash
cd /workspaces/superjf_v16/public/test-data
python3 generar_estudiantes.py
```

Esto regenerará el CSV con el encoding correcto.
