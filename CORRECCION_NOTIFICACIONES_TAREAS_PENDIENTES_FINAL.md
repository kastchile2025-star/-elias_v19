# Corrección Notificaciones de Tareas Pendientes - Profesor

## Problema
En el panel de notificaciones del profesor, las notificaciones de tareas pendientes mostraban:
1. **Problema de formato**: "taskPending" y fecha aparecían en líneas separadas
2. **Texto genérico**: Mostraba "taskPending" en lugar del nombre del curso
3. **Campo no obligatorio**: La asignatura no era obligatoria al crear tareas

## Solución Implementada

### 1. Formato de Notificaciones
**Antes:**
```
taskPending
9/07/25, 12:31
```

**Después:**
```
Curso • 9/07/25, 12:31
```

### 2. Cambios en el Código

#### A. Panel de Notificaciones (`/src/components/common/notifications-panel.tsx`)
- **Línea ~1303**: Cambié formato de notificaciones de tareas pendientes del sistema
- **Línea ~1167**: Cambié formato de notificaciones de evaluaciones pendientes del sistema

```tsx
// Antes:
<p className="text-sm text-muted-foreground mt-1">
  {translate('taskPending') || 'Tarea pendiente de finalizar'}
</p>
<p className="text-xs text-muted-foreground mt-1">
  {formatDate(notif.timestamp)}
</p>

// Después:
<p className="text-sm text-muted-foreground mt-1">
  {TaskNotificationManager.getCourseNameById(notif.course)} • {formatDate(notif.timestamp)}
</p>
```

#### B. Validación de Formularios (`/src/app/dashboard/tareas/page.tsx`)
- **Línea ~600**: Agregué validación de `subject` en `handleCreateTask`
- **Línea ~841**: Agregué validación de `subject` en `handleUpdateTask`
- **Línea ~1926**: Agregué asterisco rojo y `required` al campo de asignatura (crear)
- **Línea ~2797**: Agregué asterisco rojo y `required` al campo de asignatura (editar)

```tsx
// Validación agregada:
if (!formData.title || !formData.description || !formData.course || !formData.dueDate || !formData.subject) {
  // Error...
}

// Campo marcado como obligatorio:
<Label htmlFor="subject" className="text-right">
  {translate('taskSubject')} <span className="text-red-500">*</span>
</Label>
<Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))} required>
```

### 3. Resultado
- ✅ **Formato mejorado**: Curso y fecha en una sola línea
- ✅ **Información clara**: Muestra el nombre del curso en lugar de "taskPending"
- ✅ **Campo obligatorio**: La asignatura es ahora obligatoria con indicador visual (*)
- ✅ **Validación**: Error si no se completa la asignatura al crear/editar tareas

### 4. Colores Mantenidos
- **Naranja**: Tareas pendientes (creadas y por calificar)
- **Púrpura**: Evaluaciones pendientes (creadas y por calificar)

## Archivos Modificados
1. `/src/components/common/notifications-panel.tsx` - Formato de notificaciones
2. `/src/app/dashboard/tareas/page.tsx` - Validación de asignatura obligatoria

## Fecha de Implementación
9 de julio de 2025
