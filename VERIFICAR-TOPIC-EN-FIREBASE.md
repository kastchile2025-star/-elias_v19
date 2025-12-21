# 🔍 Verificar campo `topic` en Firebase

## Método 1: Consola del Navegador (Después de cargar calificaciones)

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver las calificaciones cargadas desde localStorage
const grades = JSON.parse(localStorage.getItem('testGrades_2025') || '[]');

console.log(`📊 Total de calificaciones: ${grades.length}`);

// Filtrar las que tienen el campo topic
const withTopic = grades.filter(g => g.topic);
const withoutTopic = grades.filter(g => !g.topic);

console.log(`✅ Con campo 'topic': ${withTopic.length}`);
console.log(`❌ Sin campo 'topic': ${withoutTopic.length}`);

// Mostrar ejemplos
if (withTopic.length > 0) {
  console.log('\n📝 Ejemplos CON topic:');
  withTopic.slice(0, 3).forEach((g, i) => {
    console.log(`${i + 1}. ${g.studentName} - ${g.topic || 'Sin tema'}`);
  });
}

if (withoutTopic.length > 0) {
  console.log('\n⚠️ Ejemplos SIN topic:');
  withoutTopic.slice(0, 3).forEach((g, i) => {
    console.log(`${i + 1}. ${g.studentName} - ${g.title}`);
  });
}

// Ver un registro completo
if (grades.length > 0) {
  console.log('\n🔍 Primer registro completo:');
  console.log(grades[0]);
}
```

## Método 2: Verificar en Firebase Console

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto: `superjf1234`
3. Ve a **Firestore Database**
4. Navega a: `courses → 1ro_basico → grades`
5. Abre cualquier documento
6. Busca el campo `topic` en la lista de campos

**Deberías ver:**
```
title: "Comprensión lectora: Cuentos infantiles"
topic: "Comprensión lectora: Cuentos infantiles"  ← ESTE CAMPO
```

## Método 3: Durante la carga masiva

Cuando subas el CSV, observa los logs en la consola del navegador. Deberías ver:

```
📤 Insertados X/Y registros
✅ Procesamiento completamente exitoso
```

Luego ejecuta en la consola:

```javascript
// Inmediatamente después de la carga
const lastUpload = JSON.parse(localStorage.getItem('testGrades_2025') || '[]');
const recent = lastUpload.slice(-5); // Últimos 5

console.log('🆕 Últimas 5 calificaciones cargadas:');
recent.forEach((g, i) => {
  console.log(`${i + 1}. ${g.studentName}`);
  console.log(`   Título: ${g.title}`);
  console.log(`   Topic: ${g.topic || '❌ NO PRESENTE'}`);
  console.log('');
});
```

## ¿Qué hacer si NO aparece el campo `topic`?

1. **Verifica que el CSV tenga la columna `tema`** en la posición 9
2. **Refresca el navegador** con Ctrl+Shift+R (hard reload)
3. **Sube el CSV nuevamente** desde Admin → Carga Masiva → Calificaciones
4. **Verifica los logs** en la consola del navegador durante la carga

## Registro de ejemplo esperado:

```javascript
{
  id: "10000004-0_1ro_basico_lenguaje-y-comunicacion_tarea_1744243200000",
  testId: "lenguaje-y-comunicacion_tarea_1744243200000",
  studentId: "10000004-0",
  studentName: "Martina González López",
  score: 95,
  courseId: "1ro_basico",
  sectionId: "a",
  subjectId: "lenguaje-y-comunicacion",
  title: "Escritura de oraciones simples",
  topic: "Escritura de oraciones simples",  // ← DEBE ESTAR AQUÍ
  gradedAt: "2025-04-10T00:00:00.000Z",
  year: 2025,
  type: "tarea",
  createdAt: "2025-11-08T...",
  updatedAt: "2025-11-08T..."
}
```
