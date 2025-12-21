# Separación de Comentarios No Entrega para Profesores

## Problema
Un estudiante podía enviar únicamente un comentario dentro de una tarea (sin marcar como entrega), y aunque esta notificación aparecía correctamente para el estudiante, no aparecía en el panel de notificaciones del profesor como una sección separada de "Comentarios No Leídos".

## Solución Implementada

### 1. Nuevo estado en Dashboard (`page.tsx`)
```tsx
const [unreadStudentCommentsCount, setUnreadStudentCommentsCount] = useState(0);
```

### 2. Modificación de `loadPendingTaskSubmissions()`
Se agregó lógica para cargar comentarios de estudiantes que NO son entregas:

```tsx
// Cargar comentarios de estudiantes (NO entregas) para tareas de este profesor
// que no hayan sido leídos por el profesor
const studentComments = comments.filter((comment: any) => 
  !comment.isSubmission && // Solo comentarios, no entregas
  teacherTaskIds.includes(comment.taskId) &&
  (!comment.readBy?.includes(user.username)) // No leídos por el profesor
);

setUnreadStudentCommentsCount(studentComments.length);
```

### 3. Nuevo estado en NotificationsPanel (`notifications-panel.tsx`)
```tsx
const [unreadStudentComments, setUnreadStudentComments] = useState<(TaskComment & {task?: Task})[]>([]);
```

### 4. Modificación de `loadStudentSubmissions()`
Se agregó la carga de comentarios no leídos de estudiantes:

```tsx
// Cargar comentarios de estudiantes (NO entregas) para tareas de este profesor
// que no hayan sido leídos por el profesor
const studentComments = comments
  .filter(comment => 
    !comment.isSubmission && // Solo comentarios, no entregas
    teacherTaskIds.includes(comment.taskId) &&
    (!comment.readBy?.includes(user.username)) // No leídos por el profesor
  )
  .map(comment => {
    // Encontrar la tarea asociada para mostrar más información
    const task = tasks.find(t => t.id === comment.taskId);
    return { ...comment, task };
  });

setUnreadStudentComments(studentComments);
```

### 5. Nueva sección en el panel de notificaciones
Se agregó una nueva sección visual para profesores:

```tsx
{/* Sección de comentarios no leídos de estudiantes */}
{unreadStudentComments.length > 0 && (
  <>
    <div className="px-4 py-2 bg-muted/30">
      <h3 className="text-sm font-medium text-foreground">
        {translate('unreadStudentComments')}
      </h3>
    </div>
    {unreadStudentComments.map(comment => (
      <div key={comment.id} className="p-4 hover:bg-muted/50">
        <div className="flex items-start gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">
                {comment.studentName}
              </p>
              <Badge variant="outline" className="text-xs">
                {comment.task?.subject || translate('task')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {comment.comment}
            </p>
            <p className="text-xs font-medium mt-1">
              {translate('onTask')}: {comment.task?.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(comment.timestamp)}
            </p>
            <Link 
              href={`/dashboard/tareas?taskId=${comment.taskId}`}
              className="inline-block mt-2 text-xs text-primary hover:underline"
            >
              {translate('viewComment')}
            </Link>
          </div>
        </div>
      </div>
    ))}
  </>
)}
```

### 6. Actualización de contadores
Se actualizaron los contadores para incluir los comentarios no leídos:

```tsx
// Panel de notificaciones
const totalCount = user.role === 'teacher'
  ? pendingTaskSubmissionsCount + unreadStudentCommentsCount + taskNotificationsCount
  : pendingTasksCount + unreadCommentsCount + taskNotificationsCount;

// Burbuja de tareas
const totalTaskCount = user?.role === 'teacher'
  ? pendingTaskSubmissionsCount + unreadStudentCommentsCount + taskNotificationsCount
  : pendingTasksCount + unreadCommentsCount + taskNotificationsCount;
```

### 7. Traducciones agregadas
Se agregaron las siguientes traducciones:

**Español (`es.json`):**
- `"unreadStudentComments": "Comentarios No Leídos"`
- `"onTask": "En tarea"`

**Inglés (`en.json`):**
- `"unreadStudentComments": "Unread Comments"`
- `"onTask": "On task"`

## Resultado
Ahora cuando un estudiante envía un comentario (sin marcarlo como entrega), el profesor verá:

1. **En el panel de notificaciones:** Una sección separada llamada "Comentarios No Leídos"
2. **En la burbuja de notificaciones:** El contador incluye estos comentarios
3. **Información mostrada:**
   - Nombre del estudiante
   - Contenido del comentario
   - Tarea en la que se hizo el comentario
   - Fecha del comentario
   - Enlace para ver el comentario

## Diferenciación clara
- **Entregas (`isSubmission: true`):** Aparecen en "Entregas Pendientes"
- **Comentarios (`isSubmission: false`):** Aparecen en "Comentarios No Leídos"

Esta separación permite a los profesores distinguir claramente entre entregas formales de tareas y comentarios de discusión o consultas de los estudiantes.
