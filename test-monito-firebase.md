# Test del Monito Interactivo con Firebase

## Estado Actual

✅ **Configuración completada:**
- Firebase habilitado (`NEXT_PUBLIC_USE_FIREBASE=true`)
- Consulta exclusiva desde Firebase (no localStorage)
- Logs de diagnóstico implementados
- Cache de 60 segundos para evitar consultas repetidas
- Listener de eventos `sqlGradesUpdated`
- Parpadeo solo cuando hay plan/consejo útil
- Burbuja gris que aparece solo con consejos

## Cómo verificar en consola del navegador

1. Abre DevTools (F12) y ve a la pestaña Console
2. Busca logs con prefijo `[Monito]`
3. Deberías ver:

```
[Monito] 🔥 Consultando calificaciones en Firebase...
[Monito] 👤 Usuario actual: { username: "...", displayName: "...", id: "..." }
[Monito] 📚 Total de calificaciones en Firebase (2025): X
[Monito] ✅ Calificaciones filtradas del usuario: Y
```

## Casos posibles

### Caso 1: Sin calificaciones
```
[Monito] 📚 Total de calificaciones en Firebase (2025): 0
[Monito] ✅ Calificaciones filtradas del usuario: 0
```
**Resultado:** No aparece burbuja (correcto)

### Caso 2: Hay calificaciones pero no del usuario
```
[Monito] 📚 Total de calificaciones en Firebase (2025): 50
[Monito] ⚠️ Hay calificaciones en Firebase pero ninguna coincide con el usuario
[Monito] 🔍 Muestra de studentIds en Firebase: ["otro-usuario", "otro-mas"]
```
**Resultado:** No aparece burbuja (correcto)
**Acción:** Revisar que el `studentId` o `studentName` en Firebase coincida con el usuario logueado

### Caso 3: Hay calificaciones del usuario
```
[Monito] ✅ Calificaciones filtradas del usuario: 15
[Monito] 📋 Muestra de calificaciones: [...]
```
**Resultado:** 
- Si promedio < 75 en alguna materia → Aparece burbuja gris con plan de refuerzo + parpadeo
- Si promedio >= 85 → No aparece burbuja (solo motivación interna)
- Si 70 <= promedio < 85 con materia débil → Burbuja con plan

## Probar manualmente

### 1. Cargar calificaciones de prueba en Firebase

Usa la carga masiva o añade manualmente un documento en:
```
courses/{courseId}/grades/{gradeId}
```

Con estructura:
```json
{
  "studentId": "sofia.gonzalez",  // mismo que user.username
  "studentName": "Sofía González González",
  "score": 65,
  "subjectId": "MAT",
  "subjectName": "Matemáticas",
  "year": 2025,
  "gradedAt": "2025-11-11T10:00:00Z",
  "courseId": "1ro_basico_a",
  "sectionId": "a"
}
```

### 2. Forzar actualización

En la consola del navegador:
```javascript
window.dispatchEvent(new CustomEvent('sqlGradesUpdated'));
```

### 3. Ver el monito reaccionar

- Debería parpadear (opacity 1 → 0.5 → 1)
- Aparece burbuja gris a la izquierda con:
  - Texto del análisis
  - Lista de pasos del plan (bullets)

## Ajustes rápidos

### Cambiar umbral de "materia débil"
En `monito-interactivo.tsx`, línea ~180:
```typescript
const umbral = 75; // cambiar a 70, 65, etc.
```

### Desactivar cache (para testing)
Cambiar línea ~116:
```typescript
const cacheValid = false; // siempre consulta Firebase
```

### Forzar burbuja siempre (debug)
Cambiar línea ~398:
```typescript
const mostrarBurbuja = true; // forzar visible
```

## Resolución de problemas

### "No aparece nada"
1. Verificar que Firebase está habilitado
2. Confirmar que hay calificaciones en Firebase para el año actual
3. Revisar que el `studentId` coincide con `user.username`
4. Abrir consola y buscar warnings amarillos

### "Parpadea pero no hay burbuja"
- El tipo de sugerencia es `motivacion` sin plan
- Cambiar lógica en línea 398 para incluir motivación

### "Burbuja se corta"
- Verificar `overflow-visible` en contenedor padre
- Ajustar posición `-left-80` si es necesario

## Próximas mejoras opcionales

- [ ] Badge numérico con cantidad de materias débiles
- [ ] Botón "Ver detalles" que abra modal con gráfico
- [ ] Animación de entrada más dramática para el plan
- [ ] Sonido sutil cuando aparece nueva sugerencia
- [ ] Historial de consejos anteriores (carrusel)
- [ ] Integración con notificaciones push
