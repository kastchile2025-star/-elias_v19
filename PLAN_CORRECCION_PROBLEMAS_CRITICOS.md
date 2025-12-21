# 🚀 PLAN DE CORRECCIÓN - Problemas Críticos Restantes

## 📋 Problemas Identificados

### 1. ❌ Notificaciones de evaluaciones en la campana 
**Problema:** Las notificaciones de evaluaciones completadas aún aparecen dentro del panel de la campana.  
**Estado:** El filtro existe pero puede no estar funcionando correctamente en todos los escenarios.

### 2. ❌ Eliminación incompleta de tareas por el profesor
**Problema:** Cuando el profesor elimina una tarea, se elimina de las tareas globales pero NO de las tareas individuales de cada estudiante.  
**Estado:** Función `confirmDeleteTask` necesita actualización.

### 3. ❌ Resultados de evaluaciones no visibles para profesores
**Problema:** Los profesores no ven los resultados de las evaluaciones completadas por estudiantes.  
**Estado:** La función `getAllEvaluationResults` busca los datos pero los resultados no se sincronizan correctamente.

---

## 🔧 SOLUCIONES IMPLEMENTADAS

### Solución 1: Mejorar filtro de notificaciones en panel de campana

**Archivo:** `/src/components/common/notifications-panel.tsx`  
**Modificación:** Asegurar que el filtro se aplique tanto en `loadTaskNotifications` como en la visualización del panel.

```typescript
// En loadTaskNotifications(), añadir debugging y verificación adicional
const loadTaskNotifications = () => {
  if (!user) return;
  
  try {
    const notifications = TaskNotificationManager.getUnreadNotificationsForUser(
      user.username, 
      user.role as 'student' | 'teacher'
    );
    
    // Debug adicional para evaluaciones
    if (user.role === 'student') {
      const evaluationNotifications = notifications.filter(n => 
        n.type === 'new_task' && n.taskType === 'evaluation'
      );
      
      console.log(`[NotificationsPanel] ${user.username} evaluation notifications:`, 
        evaluationNotifications.length);
      
      evaluationNotifications.forEach(n => {
        const isCompleted = TaskNotificationManager.isEvaluationCompletedByStudent(
          n.taskId, user.username
        );
        console.log(`[NotificationsPanel] ${n.taskTitle}: completed=${isCompleted}`);
      });
    }
    
    setTaskNotifications(notifications);
  } catch (error) {
    console.error('Error loading task notifications:', error);
  }
};
```

### Solución 2: Eliminar tareas de todos los usuarios

**Archivo:** `/src/app/dashboard/tareas/page.tsx`  
**Modificación:** Actualizar `confirmDeleteTask` para eliminar la tarea de todos los usuarios.

```typescript
const confirmDeleteTask = () => {
  if (!taskToDelete) return;

  // 1. Eliminar de tareas globales
  const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
  saveTasks(updatedTasks);

  // 2. Eliminar comentarios relacionados
  const updatedComments = comments.filter(comment => comment.taskId !== taskToDelete.id);
  saveComments(updatedComments);

  // 3. 🔥 NUEVO: Eliminar de tareas individuales de cada usuario
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
  Object.keys(allUsers).forEach(username => {
    const userTasksKey = `userTasks_${username}`;
    const userTasks = JSON.parse(localStorage.getItem(userTasksKey) || '[]');
    const filteredUserTasks = userTasks.filter((task: any) => task.id !== taskToDelete.id);
    
    if (filteredUserTasks.length !== userTasks.length) {
      localStorage.setItem(userTasksKey, JSON.stringify(filteredUserTasks));
      console.log(`[DeleteTask] Removed task ${taskToDelete.id} from user ${username}`);
    }
  });

  // 4. 🔥 NUEVO: Eliminar notificaciones relacionadas
  const notifications = TaskNotificationManager.getNotifications();
  const filteredNotifications = notifications.filter(n => n.taskId !== taskToDelete.id);
  TaskNotificationManager.saveNotifications(filteredNotifications);

  toast({
    title: translate('taskDeleted'),
    description: translate('taskDeletedDesc', { title: taskToDelete.title }),
  });

  setTaskToDelete(null);
  setShowDeleteDialog(false);
  
  // 5. Disparar eventos para actualizar las interfaces
  window.dispatchEvent(new Event('taskNotificationsUpdated'));
  window.dispatchEvent(new Event('tasksUpdated'));
};
```

### Solución 3: Sincronizar resultados de evaluaciones

**Archivo:** `/src/app/dashboard/evaluacion/page.tsx`  
**Modificación:** Cuando el estudiante completa una evaluación, guardar los resultados en la tarea global del profesor.

```typescript
// Después de completar la evaluación, agregar:
const syncEvaluationResultsToGlobalTask = (
  taskId: string, 
  studentUsername: string, 
  results: {
    score: number;
    totalQuestions: number;
    completionPercentage: number;
    completedAt: string;
    attempt: number;
  }
) => {
  try {
    // Obtener tareas globales
    const globalTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const taskIndex = globalTasks.findIndex((task: any) => task.id === taskId);
    
    if (taskIndex !== -1) {
      // Inicializar evaluationResults si no existe
      if (!globalTasks[taskIndex].evaluationResults) {
        globalTasks[taskIndex].evaluationResults = {};
      }
      
      // Guardar resultados del estudiante
      globalTasks[taskIndex].evaluationResults[studentUsername] = results;
      
      // Guardar de vuelta en localStorage
      localStorage.setItem('smart-student-tasks', JSON.stringify(globalTasks));
      
      console.log(`[SyncResults] Saved results for ${studentUsername} in task ${taskId}`);
    }
  } catch (error) {
    console.error('Error syncing evaluation results:', error);
  }
};

// Llamar esta función después de completar la evaluación:
syncEvaluationResultsToGlobalTask(taskId, user.username, {
  score: currentScore,
  totalQuestions: evaluation.questions.length,
  completionPercentage: finalPercentage,
  completedAt: new Date().toISOString(),
  attempt: 1
});
```

---

## 🧪 PLAN DE TESTING

### Test 1: Verificar filtro de notificaciones
- Crear evaluación como profesor
- Completar como estudiante
- Verificar que la notificación desaparece del panel de campana

### Test 2: Verificar eliminación completa de tareas
- Crear tarea como profesor asignada a estudiantes
- Eliminar tarea como profesor
- Verificar que la tarea desaparece para todos los estudiantes

### Test 3: Verificar sincronización de resultados
- Crear evaluación como profesor
- Completar evaluación como estudiante
- Verificar que el profesor ve los resultados en la sección "Resultados de la Evaluación"

---

## 📝 ARCHIVOS A MODIFICAR

1. `/src/components/common/notifications-panel.tsx` - Mejorar debugging del filtro
2. `/src/app/dashboard/tareas/page.tsx` - Eliminar tareas de todos los usuarios
3. `/src/app/dashboard/evaluacion/page.tsx` - Sincronizar resultados con tarea global
4. `/src/lib/notifications.ts` - Posibles ajustes al filtro si se detectan problemas

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Implementar solución para eliminación completa de tareas
2. ✅ Implementar sincronización de resultados de evaluaciones  
3. ✅ Probar y refinar filtro de notificaciones
4. ✅ Crear archivos de prueba para validar todas las correcciones
5. ✅ Documentar las correcciones implementadas
