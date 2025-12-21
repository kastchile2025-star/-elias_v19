  "use client";

  import { useState, useEffect } from 'react';
  import { useAuth, User as UserType } from '@/contexts/auth-context';
  import { useLanguage } from '@/contexts/language-context';
  import { useRouter } from 'next/navigation';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
  import { Checkbox } from '@/components/ui/checkbox';
  import { Input } from '@/components/ui/input';
  import { TaskNotificationManager } from '@/lib/notifications';
  import { Label } from '@/components/ui/label';
  import { Textarea } from '@/components/ui/textarea';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  import { Badge } from '@/components/ui/badge';
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Separator } from '@/components/ui/separator';
  import { ClipboardList, Plus, Calendar, User, Users, MessageSquare, Eye, Send, Edit, Trash2, Paperclip, Download, X, Upload, Star, Lock, ClipboardCheck, Timer, ChevronRight, Award } from 'lucide-react';
  import { useToast } from '@/hooks/use-toast';

  // Extended User interface with teacher assignment
  interface ExtendedUser extends UserType {
    password: string;
    assignedTeacherId?: string;
    teachingSubjects?: string[];
  }

  interface Task {
    id: string;
    title: string;
    description: string;
    subject: string; // This might become subjectId if subjects get their own store
    course: string; // This will become courseId
    assignedById: string; // Changed from assignedBy (teacher username)
    assignedByName: string; // teacher display name (can be kept for convenience or fetched)
    assignedTo: 'course' | 'student'; // type of assignment
    assignedStudentIds?: string[]; // Changed from assignedStudents (specific student IDs)
    dueDate: string;
    createdAt: string;
    status: 'pending' | 'submitted' | 'reviewed' | 'delivered' | 'finished';
    priority: 'low' | 'medium' | 'high';
    attachments?: TaskFile[]; // Files attached by teacher
    taskType: 'tarea' | 'evaluacion'; // New field for task type
    // Evaluation specific fields
    topic?: string; // Topic for evaluation
    numQuestions?: number; // Number of questions
    timeLimit?: number; // Time limit in minutes
  }

  interface TaskComment {
    id: string;
    taskId: string;
    studentId: string; // Changed from studentUsername
    studentUsername: string; // ✅ NUEVO: Necesario para filtros de notificaciones
    studentName: string; // Can be kept for convenience or fetched using studentId
    comment: string;
    timestamp: string;
    isSubmission: boolean; // true if this is the student's submission
    attachments?: TaskFile[]; // Files attached to this comment/submission
    grade?: number; // Calificación del profesor (opcional)
    teacherComment?: string; // Comentario del profesor (opcional)
    reviewedAt?: string; // Fecha de revisión (opcional)
    readBy?: string[]; // ✅ NUEVO: Lista de usernames que han leído este comentario
  }

  interface TaskFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string; // Base64 data URL or external URL
    uploadedBy: string;
    uploadedAt: string;
  }

  export default function TareasPage() {
    const { user } = useAuth();
    const { translate } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();

    // Agregar estilos inline para centrado de encabezados (additive approach)
    const tableHeaderStyle = {
      textAlign: 'center' as const,
      fontWeight: '600' as const,
      paddingLeft: '1rem',
      paddingRight: '1rem'
    };

    const [tasks, setTasks] = useState<Task[]>([]);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showGradeDialog, setShowGradeDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [submissionToGrade, setSubmissionToGrade] = useState<TaskComment | null>(null);
    const [gradeForm, setGradeForm] = useState({
      grade: '',
      teacherComment: ''
    });
    const [newComment, setNewComment] = useState('');
    const [isSubmission, setIsSubmission] = useState(false);
    const [taskAttachments, setTaskAttachments] = useState<TaskFile[]>([]);
    const [commentAttachments, setCommentAttachments] = useState<TaskFile[]>([]);
    const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'course'>('list');

    // En las tablas existentes, aplicar el estilo directamente a los th
    // Esto se aplicará automáticamente cuando el componente se renderice
    const applyHeaderCentering = () => {
      const headers = document.querySelectorAll('thead th');
      headers.forEach(header => {
        (header as HTMLElement).style.textAlign = 'center';
        (header as HTMLElement).style.fontWeight = '600';
        (header as HTMLElement).style.paddingLeft = '1rem';
        (header as HTMLElement).style.paddingRight = '1rem';
      });
    };

    // Agregar useEffect para aplicar estilos automáticamente
    useEffect(() => {
      applyHeaderCentering();
    }, [showTaskDialog, selectedTask]);

    // Estados para el diálogo de revisión mejorado
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showEvaluationReviewDialog, setShowEvaluationReviewDialog] = useState(false);
    const [selectedEvaluationResult, setSelectedEvaluationResult] = useState<any>(null);
    const [currentReview, setCurrentReview] = useState<{
      studentId: string; // Changed from studentUsername
      studentDisplayName: string;
      taskId: string;
      submission?: TaskComment;
      grade: number;
      feedback: string;
      isGraded: boolean;
    }>({
      studentId: '', // Changed from studentUsername
      studentDisplayName: '',
      taskId: '',
      submission: undefined,
      grade: 0,
      feedback: '',
      isGraded: false
    });

    const [formData, setFormData] = useState({
      title: '',
      description: '',
      subject: '', // This might become subjectId
      course: '', // This will hold courseId during form input
      assignedTo: 'course' as 'course' | 'student',
      assignedStudentIds: [] as string[], // Changed from assignedStudents
      dueDate: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      taskType: 'tarea' as 'tarea' | 'evaluacion',
      // Evaluation specific fields - valores por defecto
      topic: '',
      numQuestions: 5, // Por defecto 5 preguntas
      timeLimit: 1 // Por defecto 1 minuto
    });

    // Estados para evaluación mejorada
    const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
    const [showLoadingDialog, setShowLoadingDialog] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [currentEvaluation, setCurrentEvaluation] = useState<{
      task: Task | null;
      questions: any[];
      startTime: Date | null;
      answers: { [key: string]: any };
      timeRemaining: number;
      currentQuestionIndex: number;
    }>({
      task: null,
      questions: [],
      startTime: null,
      answers: {},
      timeRemaining: 0,
      currentQuestionIndex: 0
    });

    // Estado para resultados de evaluación
    const [evaluationResults, setEvaluationResults] = useState<{[taskId: string]: any}>({});

    // Estado para revisión de evaluación
    const [showReviewEvaluationDialog, setShowReviewEvaluationDialog] = useState(false);
    const [currentEvaluationReview, setCurrentEvaluationReview] = useState<any>(null);

    // Estado para modal de tiempo agotado
    const [showTimeExpiredDialog, setShowTimeExpiredDialog] = useState(false);
    const [timeExpiredResult, setTimeExpiredResult] = useState<any>(null);
    const [evaluationTimeExpired, setEvaluationTimeExpired] = useState(false);

    // Debug: Monitor cambios en el modal de tiempo agotado
    useEffect(() => {
      console.log('🔥 [useEffect] showTimeExpiredDialog cambió a:', showTimeExpiredDialog);
      console.log('🔥 [useEffect] timeExpiredResult:', !!timeExpiredResult);
      console.log('🔥 [useEffect] evaluationTimeExpired:', evaluationTimeExpired);
    }, [showTimeExpiredDialog, timeExpiredResult, evaluationTimeExpired]);

    // Nuevo useEffect para detectar cuando el tiempo llega a 0
    useEffect(() => {
      if (currentEvaluation.timeRemaining === 0 && 
          currentEvaluation.task && 
          !showTimeExpiredDialog &&
          !timeExpiredResult) {
        console.log('🔥 [useEffect] Tiempo llegó a 0, forzando completion');
        handleCompleteEvaluation(true);
      }
    }, [currentEvaluation.timeRemaining]);

    // Cargar resultados de evaluaciones existentes
    useEffect(() => {
      loadEvaluationResults();
    }, [user]);

    // Function to get task status for current user, considering evaluations
    const getTaskStatusForCurrentUser = (task: Task) => {
      if (task.taskType === 'evaluacion') {
        if (user?.role === 'student') {
          const evaluationResult = evaluationResults[task.id];
          if (evaluationResult) {
            return {
              status: 'reviewed',
              statusText: `Finalizado (${evaluationResult.percentage}%)`,
              statusClass: 'bg-green-500 hover:bg-green-600 text-white'
            };
          } else {
            return {
              status: 'pending',
              statusText: translate('statusPending'),
              statusClass: getStatusColor('pending')
            };
          }
        } else if (user?.role === 'teacher') {
          // Para profesores, mostrar el estado real de la evaluación
          return {
            status: task.status,
            statusText: task.status === 'pending' ? translate('statusPending') : 
                        task.status === 'finished' ? translate('statusFinished') : 
                        translate('statusPending'),
            statusClass: getStatusColor(task.status)
          };
        }
      }

      // Para tareas normales, usar el estado original
      return {
        status: task.status,
        statusText: task.status === 'pending' ? translate('statusPending') : 
                    task.status === 'delivered' ? translate('underReview') :
                    task.status === 'submitted' ? translate('underReview') : 
                    task.status === 'finished' ? translate('statusFinished') : translate('statusFinished'),
        statusClass: getStatusColor(task.status)
      };
    };

    const loadEvaluationResults = () => {
      if (user) {
        const storedResults = localStorage.getItem('smart-student-evaluation-results');
        if (storedResults) {
          const results = JSON.parse(storedResults);
          const userResults = results.filter((result: any) => result.studentId === user.id);
          const resultsMap: {[taskId: string]: any} = {};
          userResults.forEach((result: any) => {
            resultsMap[result.taskId] = result;
          });
          setEvaluationResults(resultsMap);

          // Si es profesor, verificar y actualizar estados de evaluaciones
          if (user.role === 'teacher') {
            // Verificar todas las evaluaciones creadas por este profesor
            const teacherEvaluations = tasks.filter(task => 
              task.taskType === 'evaluacion' && 
              task.assignedById === user.id &&
              task.status === 'pending'
            );
            
            teacherEvaluations.forEach(task => {
              checkAndUpdateEvaluationStatus(task.id);
            });
          }
        }
      }
    };

    // Load tasks and comments
    useEffect(() => {
      loadTasks();
      loadComments();
      loadEvaluationResults();
      
      // 🧹 LIMPIEZA AUTOMÁTICA SÚPER AGRESIVA: Eliminar TODAS las notificaciones "task_completed"
      // Ejecuta en cada carga de página y se repite para mantener el panel limpio
      const cleanupTaskCompletedNotifications = () => {
        if (user?.role === 'teacher') {
          try {
            const notifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
            const taskCompletedNotifications = notifications.filter((n: any) => n.type === 'task_completed');
            
            console.log(`🔍 [CLEANUP] VERIFICANDO: ${notifications.length} notificaciones totales`);
            console.log(`🎯 [CLEANUP] ENCONTRADAS: ${taskCompletedNotifications.length} notificaciones task_completed`);
            
            if (taskCompletedNotifications.length > 0) {
              // Mostrar detalles de las notificaciones que se van a eliminar
              console.log('📋 [CLEANUP] ELIMINANDO notificaciones task_completed:', 
                taskCompletedNotifications.map((n: any) => ({
                  id: n.id,
                  title: n.taskTitle || n.title,
                  timestamp: n.timestamp
                }))
              );
              
              const cleanedNotifications = notifications.filter((n: any) => n.type !== 'task_completed');
              localStorage.setItem('smart-student-notifications', JSON.stringify(cleanedNotifications));
              
              // Disparar evento para actualizar la UI inmediatamente
              window.dispatchEvent(new CustomEvent('notificationsUpdated', {
                detail: { 
                  type: 'cleanup', 
                  action: 'auto_cleanup_task_completed',
                  removed: taskCompletedNotifications.length 
                }
              }));
              
              console.log(`✅ [CLEANUP] ELIMINADAS: ${taskCompletedNotifications.length} notificaciones task_completed`);
              console.log(`📊 [CLEANUP] RESTANTES: ${cleanedNotifications.length} notificaciones en total`);
            } else {
              console.log(`✅ [CLEANUP] PANEL LIMPIO: No hay notificaciones task_completed`);
            }
          } catch (error) {
            console.warn('⚠️ [CLEANUP] Error al limpiar notificaciones automáticamente:', error);
          }
        }
      };

      // Ejecutar limpieza inicial
      cleanupTaskCompletedNotifications();
      
      // Ejecutar limpieza cada 2 segundos para mantener el panel limpio
      const cleanupInterval = setInterval(cleanupTaskCompletedNotifications, 2000);
      
      // Forzar refresco de tareas para asegurar que el panel de estudiantes se actualice con las entregas
      loadTasks && loadTasks();
      // Si hay un selectedTask, forzar su recarga desde localStorage para obtener la versión más reciente
      if (selectedTask) {
        const storedTasks = localStorage.getItem('smart-student-tasks');
        if (storedTasks) {
          const tasksArr = JSON.parse(storedTasks);
          const updated = tasksArr.find((t: any) => t.id === selectedTask.id);
          if (updated) setSelectedTask(updated);
        }
      }
      
      // Limpiar interval cuando el componente se desmonte
      return () => {
        clearInterval(cleanupInterval);
      };
    }, []);
    
    // Maneja la navegación desde notificaciones (separado para ejecutarse después de cargar las tareas)
    useEffect(() => {
      if (tasks.length > 0) {
        // Lee los parámetros de la URL para manejar navegación desde notificaciones
        const urlParams = new URLSearchParams(window.location.search);
        const taskIdParam = urlParams.get('taskId');
        const commentIdParam = urlParams.get('commentId');
        const highlightParam = urlParams.get('highlight');
        
        if (taskIdParam) {
          // Busca la tarea por ID y ábrela
          const task = tasks.find(t => t.id === taskIdParam);
          if (task) {
            setSelectedTask(task);
            setShowTaskDialog(true);
            
            // 🔥 ESCENARIO 2: Eliminar notificaciones de comentarios cuando el profesor abre la tarea
            if (user?.role === 'teacher' && user?.username) {
              console.log('🔔 [ESCENARIO 2] Profesor abrió la tarea, eliminando notificaciones de comentarios...');
              
              // 🎯 CAMBIO: NO eliminar automáticamente las notificaciones de evaluaciones completadas
              // Las notificaciones de evaluaciones completadas deben eliminarse solo cuando el profesor
              // hace clic específicamente en "Ver Resultados" desde el panel de notificaciones
              if (task.taskType === 'evaluacion') {
                console.log('🔔 [EVALUACION_VISTA] Profesor abrió evaluación - MANTENIENDO notificaciones de evaluaciones completadas');
                // TaskNotificationManager.removeEvaluationCompletedNotifications(taskIdParam, user.username); // COMENTADO
              }
              
              // Obtener comentarios de esta tarea
              const storedComments = localStorage.getItem('smart-student-task-comments');
              if (storedComments) {
                const allComments: TaskComment[] = JSON.parse(storedComments);
                let hasChanges = false;
                
                // Marcar como leídos todos los comentarios de estudiantes para esta tarea
                const updatedComments = allComments.map(comment => {
                  if (comment.taskId === taskIdParam && 
                      !comment.isSubmission && 
                      comment.studentUsername !== user.username &&
                      !comment.readBy?.includes(user.username)) {
                    
                    console.log(`📖 [ESCENARIO 2] Marcando como leído comentario de ${comment.studentName}: ${comment.comment?.substring(0, 30)}...`);
                    hasChanges = true;
                    
                    return {
                      ...comment,
                      readBy: [...(comment.readBy || []), user.username]
                    };
                  }
                  return comment;
                });
                
                // Guardar cambios si hubo modificaciones
                if (hasChanges) {
                  localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
                  
                  // Eliminar notificaciones de comentarios para esta tarea
                  TaskNotificationManager.removeCommentNotifications(taskIdParam, user.username);
                  
                  // Disparar evento para actualizar notificaciones
                  window.dispatchEvent(new CustomEvent('taskNotificationsUpdated', {
                    detail: { 
                      type: 'task_opened',
                      taskId: taskIdParam,
                      action: 'remove_comment_notifications'
                    }
                  }));
                  
                  // ✅ NUEVA MEJORA: También disparar evento para actualizar contadores del dashboard
                  window.dispatchEvent(new CustomEvent('updateDashboardCounts', {
                    detail: { userRole: user.role, action: 'task_opened', taskId: taskIdParam }
                  }));
                  
                  console.log('✅ [ESCENARIO 2] Comentarios marcados como leídos y notificaciones eliminadas');
                }
              }
            }
            
            // Si hay un ID de comentario para destacar
            if (commentIdParam && highlightParam === 'true') {
              setHighlightedCommentId(commentIdParam);
              // Programar un desplazamiento al comentario después de que se abra el diálogo
              setTimeout(() => {
                const commentElement = document.getElementById(`comment-${commentIdParam}`);
                if (commentElement) {
                  commentElement.scrollIntoView({ behavior: 'smooth' });
                }
              }, 500); // Pequeño retraso para asegurar que el diálogo esté completamente abierto
            }
          }
        }
      }
    }, [tasks]);

    // Limpiar highlightedCommentId cuando se cierra el diálogo y recargar comentarios cuando se abre
    useEffect(() => {
      if (!showTaskDialog) {
        setHighlightedCommentId(null);
        
        // 🔥 NUEVA MEJORA: Disparar evento cuando se cierra el diálogo para actualizar el dashboard
        if (user?.role === 'student') {
          console.log('🔔 [TaskDialog] Closed - dispatching dashboard update event');
          window.dispatchEvent(new CustomEvent('taskDialogClosed', { 
            detail: { 
              userRole: user.role,
              username: user.username,
              action: 'task_dialog_closed'
            } 
          }));
        }
      } else {
        // Recargar comentarios cuando se abre el diálogo para tener datos frescos
        console.log('🔄 Reloading comments because task dialog opened');
        loadComments();
        
        // Si el usuario es estudiante y hay una tarea seleccionada, marcar TODOS los comentarios como leídos
        if (user?.role === 'student' && selectedTask && user.username) {
          console.log('🔔 Marking ALL comments as read for task', selectedTask.id);
          
          // Usar setTimeout para asegurar que los comentarios se cargan primero
          setTimeout(() => {
            // Marcar directamente en localStorage todos los comentarios de la tarea como leídos
            const storedComments = localStorage.getItem('smart-student-task-comments');
            if (storedComments) {
              const comments = JSON.parse(storedComments);
              let updated = false;
              
              const updatedComments = comments.map((comment: any) => {
                if (
                  comment.taskId === selectedTask.id && 
                  comment.studentUsername !== user.username && // No marcar comentarios propios
                  (!comment.readBy?.includes(user.username))
                ) {
                  updated = true;
                  console.log(`🔔 Marking comment ${comment.id} as read`);
                  return {
                    ...comment,
                    isNew: false,
                    readBy: [...(comment.readBy || []), user.username]
                  };
                }
                return comment;
              });
              
              if (updated) {
                localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
                console.log(`🔔 ✅ Marked all comments for task ${selectedTask.id} as read`);
                
                // Disparar eventos para actualizar la UI
                document.dispatchEvent(new Event('commentsUpdated'));
                window.dispatchEvent(new CustomEvent('studentCommentsUpdated', { 
                  detail: { 
                    username: user.username,
                    taskId: selectedTask.id,
                    action: 'marked_as_read_bulk'
                  } 
                }));
                
                // Disparar evento para actualizar dashboard
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('updateDashboardCounts', {
                    detail: { userRole: 'student', action: 'task_opened' }
                  }));
                }, 100);
              }
            }
          }, 200);
          
          // También usar la función del TaskNotificationManager como respaldo
          TaskNotificationManager.markCommentsAsReadForTask(selectedTask.id, user.username);
        }
      }
    }, [showTaskDialog, selectedTask, user]);

    // Listener para actualizar el panel de estudiantes cuando hay entregas
    useEffect(() => {
      const handleStudentPanelUpdate = (event: CustomEvent) => {
        console.log('🔄 Student panel update event:', event.detail);
        // Recargar comentarios para actualizar el estado de los estudiantes
        loadComments();
        // Si el diálogo está abierto, forzar re-render del panel
        if (showTaskDialog && selectedTask) {
          setTimeout(() => {
            console.log('🔄 Forcing panel refresh after student submission');
            setSelectedTask({...selectedTask}); // Trigger re-render
          }, 500);
        }
      };

      window.addEventListener('studentPanelUpdate', handleStudentPanelUpdate as EventListener);
      
      return () => {
        window.removeEventListener('studentPanelUpdate', handleStudentPanelUpdate as EventListener);
      };
    }, [showTaskDialog, selectedTask]);

    // Verificación periódica del estado de evaluaciones (solo para profesores)
    useEffect(() => {
      if (user?.role !== 'teacher') return;

      const checkEvaluationsInterval = setInterval(() => {
        const allEvaluations = tasks.filter(task => 
          task.taskType === 'evaluacion' && 
          task.assignedById === user.id
        );

        console.log(`🔄 Verificación periódica: ${allEvaluations.length} evaluaciones del profesor`);
        allEvaluations.forEach(task => {
          console.log(`⏰ Verificando evaluación "${task.title}" - Estado: ${task.status}`);
          checkAndUpdateEvaluationStatus(task.id);
        });
      }, 30000); // Verificar cada 30 segundos

      return () => clearInterval(checkEvaluationsInterval);
    }, [user, tasks]);

    const loadTasks = () => {
      const storedTasks = localStorage.getItem('smart-student-tasks');
      const usersText = localStorage.getItem('smart-student-users');
      const allUsers: ExtendedUser[] = usersText ? JSON.parse(usersText) : [];

      if (storedTasks) {
        let tasksData = JSON.parse(storedTasks) as Partial<Task>[];
        let tasksModified = false;

        tasksData = tasksData.map(task => {
          const migratedTask: Partial<Task> = { ...task };
          // Migrate assignedBy to assignedById
          if ((task as any).assignedBy && !task.assignedById) {
            const teacher = allUsers.find(u => u.username === (task as any).assignedBy && u.role === 'teacher');
            if (teacher && teacher.id) {
              migratedTask.assignedById = teacher.id;
              delete (migratedTask as any).assignedBy; // Remove old field
              tasksModified = true;
            } else {
              // console.warn(`Teacher username ${(task as any).assignedBy} not found for task ${task.title}`);
              migratedTask.assignedById = (task as any).assignedBy; // Keep old value if no ID found, mark for review
            }
          }

          // Migrate assignedStudents (usernames) to assignedStudentIds
          if ((task as any).assignedStudents && !task.assignedStudentIds) {
            migratedTask.assignedStudentIds = (task as any).assignedStudents
              .map((username: string) => {
                const student = allUsers.find(u => u.username === username && u.role === 'student');
                if (student && student.id) return student.id;
                // console.warn(`Student username ${username} not found for task ${task.title}`);
                return null;
              })
              .filter((id: string | null) => id !== null) as string[];
            delete (migratedTask as any).assignedStudents;
            tasksModified = true;
          }
          // Course is expected to be courseId, no direct migration here, assumed to be correct from creation
          return migratedTask;
        });

        setTasks(tasksData as Task[]);
        if (tasksModified) {
          // console.log("Migrating tasks in localStorage due to ID changes...");
          localStorage.setItem('smart-student-tasks', JSON.stringify(tasksData));
        }

        // Verificar y corregir el estado de evaluaciones al cargar tareas
        const evaluationTasks = (tasksData as Task[]).filter(task => 
          task.taskType === 'evaluacion'
        );
        
        console.log(`🔍 Verificando estados de ${evaluationTasks.length} evaluaciones al cargar...`);
        evaluationTasks.forEach(task => {
          console.log(`📋 Evaluación "${task.title}" - Estado actual: ${task.status}`);
          // Usar setTimeout para evitar problemas de estado
          setTimeout(() => checkAndUpdateEvaluationStatus(task.id), 100);
        });

        // 🔥 NUEVO: Limpiar notificaciones obsoletas de evaluaciones ya finalizadas
        if (user?.role === 'teacher') {
          setTimeout(() => {
            console.log('🧹 Limpiando notificaciones obsoletas de evaluaciones finalizadas...');
            const finishedEvaluations = (tasksData as Task[]).filter(task => 
              task.taskType === 'evaluacion' && 
              task.status === 'finished' &&
              task.assignedById === user.id
            );
            
            finishedEvaluations.forEach(task => {
              TaskNotificationManager.removeNotificationsForTask(task.id, ['pending_grading']);
              console.log(`🗑️ Removed obsolete notifications for finished evaluation: ${task.title}`);
            });
            
            if (finishedEvaluations.length > 0) {
              window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
              console.log(`✅ Cleaned up notifications for ${finishedEvaluations.length} finished evaluations`);
            }
          }, 500);
        }
      }
    };

    const loadComments = () => {
      const storedComments = localStorage.getItem('smart-student-task-comments');
      const usersText = localStorage.getItem('smart-student-users');
      const allUsers: ExtendedUser[] = usersText ? JSON.parse(usersText) : [];

      if (storedComments) {
        let commentsData = JSON.parse(storedComments) as Partial<TaskComment>[];
        let commentsModified = false;

        commentsData = commentsData.map(comment => {
          const migratedComment: Partial<TaskComment> = { ...comment };
          if ((comment as any).studentUsername && !comment.studentId) {
            const student = allUsers.find(u => u.username === (comment as any).studentUsername && u.role === 'student');
            if (student && student.id) {
              migratedComment.studentId = student.id;
              // studentName can be kept or re-fetched based on studentId if needed for consistency
              // migratedComment.studentName = student.displayName;
              delete (migratedComment as any).studentUsername;
              commentsModified = true;
            } else {
              // console.warn(`Student username ${(comment as any).studentUsername} not found for comment ${comment.id}`);
              migratedComment.studentId = (comment as any).studentUsername; // Keep old value if no ID found
            }
          }
          return migratedComment;
        });

        console.log('📥 Loading comments from localStorage:', {
          totalComments: commentsData.length,
          // submissions: commentsData.filter((c: any) => c.isSubmission),
          // allComments: commentsData
        });
        setComments(commentsData as TaskComment[]);
        if (commentsModified) {
          // console.log("Migrating comments in localStorage due to ID changes...");
          localStorage.setItem('smart-student-task-comments', JSON.stringify(commentsData));
        }

      } else {
        console.log('📥 No comments found in localStorage');
        setComments([]);
      }
    };

    const saveTasks = (newTasks: Task[]) => {
      localStorage.setItem('smart-student-tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    };

    const saveComments = (newComments: TaskComment[]) => {
      localStorage.setItem('smart-student-task-comments', JSON.stringify(newComments));
      setComments(newComments);
    };

    // Get available courses and subjects for teacher
    const getAvailableCourses = () => {
      if (user?.role === 'teacher') {
        return user.activeCourses || [];
      }
      return [];
    };

    // Function to get course name from course ID
    const getCourseNameById = (courseId: string): string => {
      const coursesText = localStorage.getItem('smart-student-courses');
      if (coursesText) {
        const courses = JSON.parse(coursesText);
        const course = courses.find((c: any) => c.id === courseId);
        return course ? course.name : courseId; // Return name if found, otherwise return ID
      }
      return courseId;
    };

    // Function to get teacher username from teacher ID
    const getTeacherUsernameById = (teacherId: string): string => {
      const usersText = localStorage.getItem('smart-student-users');
      if (usersText) {
        const users = JSON.parse(usersText);
        const teacher = users.find((u: any) => u.id === teacherId && u.role === 'teacher');
        return teacher ? teacher.username : teacherId;
      }
      return teacherId;
    };

    // Function to get all courses with their names for dropdown
    const getAvailableCoursesWithNames = () => {
      if (user?.role === 'teacher') {
        const courseIds = user.activeCourses || [];
        return courseIds.map(courseId => ({
          id: courseId,
          name: getCourseNameById(courseId)
        }));
      }
      return [];
    };

    const getAvailableSubjects = () => {
      if (user?.role === 'teacher' && user.teachingAssignments) {
        return [...new Set(user.teachingAssignments.map(ta => ta.subject))];
      }
      return ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales'];
    };

    // Get students for selected course
    const getStudentsForCourse = (courseId: string): { id: string, username: string, displayName: string }[] => {
      if (!courseId) return [];
      const usersText = localStorage.getItem('smart-student-users');
      const allUsers: ExtendedUser[] = usersText ? JSON.parse(usersText) : [];

      return allUsers
        .filter(u => u.role === 'student' && u.activeCourses && u.activeCourses.includes(courseId))
        .map(u => ({ id: u.id, username: u.username, displayName: u.displayName }));
    };

    // Get students from a specific course, ensuring they are assigned to the current teacher for that task
    const getStudentsFromCourseRelevantToTask = (courseId: string, teacherId: string | undefined) => {
      if (!courseId) {
        console.log(`⚠️ getStudentsFromCourseRelevantToTask: courseId es null`);
        return [];
      }
      
      console.log(`🏫 getStudentsFromCourseRelevantToTask: courseId=${courseId}, teacherId=${teacherId}`);
      
      const usersText = localStorage.getItem('smart-student-users');
      const allUsers: ExtendedUser[] = usersText ? JSON.parse(usersText) : [];
      console.log(`👥 Total usuarios: ${allUsers.length}`);

      const studentUsers = allUsers.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses?.includes(courseId);
        
        // 🔧 PARCHE: Ser más flexible con la asignación de profesor
        // Si no existe assignedTeacherId, incluir todos los estudiantes del curso
        const isAssignedToTeacher = !teacherId || !u.assignedTeacherId || u.assignedTeacherId === teacherId;
        
        console.log(`👤 Usuario ${u.username}: estudiante=${isStudent}, en curso=${isInCourse}, asignado a profesor=${isAssignedToTeacher} (teacherId=${u.assignedTeacherId})`);
        
        return isStudent && isInCourse && isAssignedToTeacher;
      }).map(u => ({
        id: u.id, // Include ID
        username: u.username,
        displayName: u.displayName || u.username
      }));

      console.log(`🎓 Students from course "${courseId}" for teacher "${teacherId}":`, {
        studentsInCourse: studentUsers,
        count: studentUsers.length
      });
      
      return studentUsers;
    };

    // Función para obtener los estudiantes asignados a una tarea
    const getAssignedStudentsForTask = (task: Task | null): { id: string, username: string, displayName: string }[] => {
      if (!task || !task.id) {
        console.log(`⚠️ getAssignedStudentsForTask: task es null o no tiene ID`);
        return [];
      }
      
      console.log(`🔍 getAssignedStudentsForTask: Procesando tarea "${task.title}"`);
      console.log(`📋 Detalles de la tarea:`, {
        id: task.id,
        assignedTo: task.assignedTo,
        course: task.course,
        assignedById: task.assignedById,
        assignedStudentIds: task.assignedStudentIds
      });
      
      const usersText = localStorage.getItem('smart-student-users');
      const allUsers: ExtendedUser[] = usersText ? JSON.parse(usersText) : [];
      console.log(`👥 Total usuarios en sistema: ${allUsers.length}`);

      let students: { id: string, username: string, displayName: string }[] = [];

      // Si la tarea está asignada a estudiantes específicos
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        console.log(`🎯 Tarea asignada a estudiantes específicos: ${task.assignedStudentIds.join(', ')}`);
        students = task.assignedStudentIds.map(studentId => {
          const userData = allUsers.find(u => u.id === studentId);
          const student = {
            id: studentId,
            username: userData?.username || `user-${studentId}`,
            displayName: userData?.displayName || `Estudiante ${studentId}`
          };
          console.log(`👤 Estudiante mapeado: ${student.displayName} (${student.id})`);
          return student;
        }).filter(s => s.id); // Filter out any potential nulls if a studentId wasn't found
      }
      // Si la tarea está asignada a todo un curso
      else if (task.assignedTo === 'course' && task.course) { // task.course is courseId
        console.log(`🏫 Tarea asignada a curso completo: ${task.course}`);
        students = getStudentsFromCourseRelevantToTask(task.course, task.assignedById);
        console.log(`👥 Estudiantes encontrados en curso: ${students.length}`);
      }
      else {
        console.log(`⚠️ Configuración de asignación no reconocida`);
      }

      // Solo mostrar los estudiantes que están explícitamente asignados
      // Sin agregar estudiantes adicionales que hayan entregado por error

      // Specific filtering for "luis" is removed as it's not ID-based and generally not robust.
      // If specific exclusions are needed, they should be handled by a more generic mechanism.

      console.log(`📋 Students assigned to task "${task.title}":`, {
        taskAssignedTo: task.assignedTo,
        courseId: task.course, // task.course is courseId
        studentsFound: students,
        studentsCount: students.length,
        studentUsernames: students.map(s => s.username),
        studentDisplayNames: students.map(s => s.displayName)
      });

      return students;
    };

    // Función para obtener la entrega de un estudiante por su ID
    const getStudentSubmission = (taskId: string, studentId: string): TaskComment | undefined => {
      if (!taskId || !studentId) return undefined;

      // console.log(`🔍 getStudentSubmission searching for studentId: "${studentId}" in task: "${taskId}"`);
      
      const submission = comments.find(c =>
        c.taskId === taskId &&
        c.studentId === studentId &&
        c.isSubmission
      );
      
      if (submission) {
        // console.log(`✅ Submission found for studentId "${studentId}":`, submission);
        return {
          ...submission,
          grade: submission.grade || undefined,
          teacherComment: submission.teacherComment || '',
          reviewedAt: submission.reviewedAt || (submission.grade !== undefined && !submission.reviewedAt ? new Date().toISOString() : undefined)
        };
      }
      
      // console.log(`❌ No submission found for studentId "${studentId}" in task "${taskId}"`);
      return undefined;
    };

    // Función para obtener el resultado de una evaluación de un estudiante
    const getStudentEvaluationResult = (taskId: string, studentId: string) => { // Changed studentUsername to studentId
      // En un entorno real, esta información vendría de una tabla específica en la base de datos
      // Por ahora, para propósitos de demostración, no devolvemos nada ya que no hay evaluaciones completadas
      
      // Buscar si existe algún resultado de evaluación guardado en localStorage
      const storedResults = localStorage.getItem('smart-student-evaluation-results');
      if (storedResults) {
        const results = JSON.parse(storedResults);
        return results.find((result: any) => result.taskId === taskId && result.studentId === studentId);
      }
      
      // Si no hay resultados guardados, el estudiante no ha completado la evaluación
      return undefined;
    };

    // Función para verificar si todos los estudiantes han completado la evaluación
    const checkAndUpdateEvaluationStatus = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || task.taskType !== 'evaluacion') return;

      const assignedStudents = getAssignedStudentsForTask(task);
      console.log(`🔍 Verificando estado de evaluación para tarea "${task.title}" (ID: ${taskId})`);
      console.log(`� Estado actual de la tarea: "${task.status}"`);
      console.log(`�👥 Estudiantes asignados: ${assignedStudents.length}`, assignedStudents.map(s => s.displayName));

      const completedStudents = assignedStudents.filter(student => {
        const result = getStudentEvaluationResult(taskId, student.id);
        console.log(`📊 Estudiante ${student.displayName} (ID: ${student.id}) - Resultado:`, result ? 'Completado' : 'Pendiente');
        return result !== undefined;
      });

      const completedCount = completedStudents.length;
      console.log(`📈 Progreso: ${completedCount}/${assignedStudents.length} estudiantes han completado la evaluación`);

      // Si todos los estudiantes han completado la evaluación, actualizar el estado a 'finished'
      if (completedCount === assignedStudents.length && assignedStudents.length > 0) {
        if (task.status !== 'finished') {
          console.log(`✅ ¡Todos los estudiantes completaron la evaluación! Cambiando estado de "${task.status}" a 'finished'`);
          const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, status: 'finished' as const } : t
          );
          saveTasks(updatedTasks);
          
          // 🔥 NUEVO: Limpiar notificaciones pendientes del profesor para esta evaluación completada
          TaskNotificationManager.removeNotificationsForTask(taskId, ['pending_grading']);
          console.log('🧹 Removed pending evaluation notifications for teacher after all students completed');
          
          // Disparar evento para actualizar notificaciones en tiempo real
          window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
          
          // Mostrar notificación al profesor
          toast({
            title: "Evaluación Finalizada",
            description: `La evaluación "${task.title}" ha sido completada por todos los estudiantes.`,
            duration: 5000,
          });
        } else {
          console.log(`✅ Evaluación ya está marcada como 'finished' correctamente`);
        }
      } else {
        console.log(`⏳ Evaluación pendiente: ${assignedStudents.length - completedCount} estudiantes aún no han completado`);
        
        // CORRECCIÓN IMPORTANTE: Asegurar que el estado se mantenga como 'pending' si no todos han completado
        if (task.status !== 'pending') {
          console.log(`🔄 CORRIGIENDO: Restaurando estado de "${task.status}" a 'pending' porque no todos han completado`);
          const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, status: 'pending' as const } : t
          );
          saveTasks(updatedTasks);
        } else {
          console.log(`✅ Estado 'pending' es correcto`);
        }
      }
    };

    // Filter tasks based on user role
    // Genera la fecha mínima en formato ISO para el input datetime-local
    const getMinDateTimeString = () => {
      const now = new Date();
      return now.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM requerido para datetime-local
    };
    
    // Utilidad para añadir el atributo min a los inputs de fecha
    useEffect(() => {
      // Aplicar el atributo min a todos los inputs de tipo datetime-local
      const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
      const minDate = getMinDateTimeString();
      
      dateInputs.forEach(input => {
        input.setAttribute('min', minDate);
      });
    }, [showCreateDialog, showEditDialog]); // Se ejecuta cuando se abre un diálogo

    const getFilteredTasks = () => {
      if (user?.role === 'teacher') {
        // Los profesores ven solo las tareas que crearon
        let filtered = tasks.filter(task => task.assignedById === user.id);
        if (selectedCourseFilter !== 'all') {
          filtered = filtered.filter(task => task.course === selectedCourseFilter);
        }

        // Verificar estado de evaluaciones pendientes para actualizar automáticamente
        filtered
          .filter(task => task.taskType === 'evaluacion' && task.status === 'pending')
          .forEach(task => {
            // Realizar verificación asíncrona para no bloquear el renderizado
            setTimeout(() => checkAndUpdateEvaluationStatus(task.id), 0);
          });

        return filtered;
      } else if (user?.role === 'student') {
        // Los estudiantes solo ven tareas que existen actualmente y que están asignadas a su curso o usuario
        // Además, solo deben ver tareas activas (no eliminadas ni antiguas)
        // Si el profesor elimina una tarea, ya no debe aparecer para el estudiante
        return tasks.filter(task => {
          // Solo tareas asignadas por un profesor válido y que existan
          if (!task.assignedById) return false;
          if (task.assignedTo === 'course') {
            return user.activeCourses?.includes(task.course);
          } else {
            return task.assignedStudentIds?.includes(user.id);
          }
        });
      }
      return [];
    };

    // Group tasks by course for teacher view
    const getTasksByCourse = () => {
      const filtered = getFilteredTasks();
      const grouped: { [course: string]: Task[] } = {};
      
      filtered.forEach(task => {
        if (!grouped[task.course]) {
          grouped[task.course] = [];
        }
        grouped[task.course].push(task);
      });
      
      return grouped;
    };

    // Get course statistics for teacher
    const getCourseStats = () => {
      const tasksByCourse = getTasksByCourse();
      const stats: { [course: string]: { total: number; pending: number; submitted: number; reviewed: number } } = {};
      
      Object.keys(tasksByCourse).forEach(course => {
        const courseTasks = tasksByCourse[course];
        stats[course] = {
          total: courseTasks.length,
          pending: 0,
          submitted: 0,
          reviewed: 0
        };
        
        // Calculate statistics based on actual task status and student submissions
        courseTasks.forEach(task => {
          // Obtener todos los estudiantes asignados a esta tarea
          const assignedStudents = getAssignedStudentsForTask(task);
          
          // Verificar si todos los estudiantes han entregado la tarea
          const allSubmitted = assignedStudents.length > 0 && 
            assignedStudents.every(student => 
              hasStudentSubmitted(task.id, student.username)
            );
          
          // Verificar si al menos un estudiante ha entregado
          const someSubmitted = assignedStudents.some(student => 
            hasStudentSubmitted(task.id, student.username)
          );
          
          if (allSubmitted) {
            if (task.status === 'reviewed') {
              stats[course].reviewed++;
            } else {
              stats[course].submitted++;
            }
          } else if (someSubmitted) {
            // Si hay entregas parciales, sigue siendo pendiente
            stats[course].pending++;
          } else {
            stats[course].pending++;
          }
        });
      });
      
      return stats;
    };

    const handleCreateTask = () => {
      if (!formData.title || !formData.description || !formData.course || !formData.dueDate || !formData.subject) {
        toast({
          title: translate('error'),
          description: translate('completeAllFields'),
          variant: 'destructive'
        });
        return;
      }

      // Validación específica para evaluaciones
      if (formData.taskType === 'evaluacion') {
        if (!formData.topic || !formData.numQuestions || !formData.timeLimit) {
          toast({
            title: 'Error',
            description: 'Para las evaluaciones debe especificar: Tema, Cantidad de Preguntas y Tiempo límite',
            variant: 'destructive'
          });
          return;
        }
        
        if (![5, 10, 15, 20, 25, 30].includes(formData.numQuestions)) {
          toast({
            title: 'Error', 
            description: 'La cantidad de preguntas debe ser una de las opciones disponibles: 5, 10, 15, 20, 25 o 30',
            variant: 'destructive'
          });
          return;
        }
        
        if (formData.timeLimit < 1 || formData.timeLimit > 180) {
          toast({
            title: 'Error',
            description: 'El tiempo límite debe estar entre 1 y 180 minutos',
            variant: 'destructive'
          });
          return;
        }
      }
      
      // Validar que la fecha límite sea en el futuro
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        toast({
          title: translate('error'),
          description: translate('dueDateMustBeFuture'),
          variant: 'destructive'
        });
        return;
      }

      const taskId = `task_${Date.now()}`;
      const newTask: Task = {
        id: taskId,
        title: formData.title,
        description: formData.description,
        subject: formData.subject, // This might become subjectId later
        course: formData.course, // This is expected to be courseId from the form
        assignedById: user?.id || '', // Use user ID
        assignedByName: user?.displayName || '', // Keep for display convenience
        assignedTo: formData.assignedTo,
        assignedStudentIds: formData.assignedTo === 'student' ? formData.assignedStudentIds : undefined, // Use assignedStudentIds
        dueDate: formData.dueDate,
        createdAt: new Date().toISOString(),
        status: 'pending',
        priority: formData.priority,
        attachments: taskAttachments,
        taskType: formData.taskType,
        // Include evaluation fields if it's an evaluation
        topic: formData.taskType === 'evaluacion' ? formData.topic : undefined,
        numQuestions: formData.taskType === 'evaluacion' ? formData.numQuestions : undefined,
        timeLimit: formData.taskType === 'evaluacion' ? formData.timeLimit : undefined
      };

      const updatedTasks = [...tasks, newTask];
      saveTasks(updatedTasks);
      
      // 🔔 NUEVA FUNCIONALIDAD: Crear notificación de "Tarea Pendiente" para el profesor
      TaskNotificationManager.createPendingGradingNotification(
        taskId,
        formData.title,
        formData.course, // This is courseId
        formData.subject,
        user?.username || '', // Pass user.username, not user.id
        user?.displayName || '',
        formData.taskType === 'evaluacion' ? 'evaluation' : 'assignment'
      );

      // Crear notificaciones para los estudiantes sobre la nueva tarea
      TaskNotificationManager.createNewTaskNotifications(
        taskId,
        formData.title,
        formData.course, // This is courseId
        formData.subject,
        user?.id || '', // Pass user.id as teacherId
        user?.displayName || '',
        formData.taskType === 'evaluacion' ? 'evaluation' : 'assignment'
      );

      toast({
        title: translate('taskCreated'),
        description: translate('taskCreatedDesc', { title: formData.title }),
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        course: '',
        assignedTo: 'course',
        assignedStudentIds: [],
        dueDate: '',
        priority: 'medium',
        taskType: 'tarea',
        topic: '',
        numQuestions: 5, // Por defecto 5 preguntas
        timeLimit: 1 // Por defecto 1 minuto
      });
      setTaskAttachments([]);
      setShowCreateDialog(false);
    };

    const handleAddComment = () => {
      if (!newComment.trim() || !selectedTask) return;

      // Check if student already made a submission for this task
      if (isSubmission && user?.role === 'student' && user.id) {
        const existingSubmission = comments.find(comment => 
          comment.taskId === selectedTask.id && 
          comment.studentId === user.id && 
          comment.isSubmission
        );
        
        if (existingSubmission) {
          toast({
            title: translate('error'),
            description: translate('alreadySubmitted'),
            variant: 'destructive'
          });
          return;
        }
      }

      // Asegurarse de que los archivos adjuntos se incluyan correctamente
      const attachmentsToSave = [...commentAttachments];
      
      // Verificación de archivos adjuntos
      if (user?.role === 'student' && isSubmission && attachmentsToSave.length === 0) {
        console.log('⚠️ Advertencia: Entrega sin archivos adjuntos');
      }

      const comment: TaskComment = {
        id: `comment_${Date.now()}`,
        taskId: selectedTask.id,
        studentId: user?.id || '', // Use user.id
        studentUsername: user?.username || '', // ✅ NUEVO: Agregar studentUsername para las notificaciones
        studentName: user?.displayName || user?.username || '', // Keep displayName
        comment: newComment,
        timestamp: new Date().toISOString(),
        isSubmission: isSubmission,
        attachments: attachmentsToSave, // Usar la copia de archivos adjuntos
        readBy: [] // ✅ NUEVO: Inicializar como array vacío para tracking de lectura
      };

      const updatedComments = [...comments, comment];
      saveComments(updatedComments);
      // Forzar recarga de comentarios desde localStorage para refrescar panel
      loadComments();

      console.log('💾 Comment saved:', {
        isSubmission,
        studentId: user?.id,
        taskId: selectedTask.id,
        commentId: comment.id,
        totalComments: updatedComments.length,
        attachmentsCount: commentAttachments.length,
        attachments: commentAttachments.map(a => a.name)
      });

      // Si es una entrega, notificar al profesor inmediatamente
      if (isSubmission && user?.role === 'student') {
        console.log(`📝 Estudiante ${user.displayName} entregando tarea "${selectedTask.title}"`);
        
        // Crear notificación usando TaskNotificationManager
        TaskNotificationManager.createTaskSubmissionNotification(
          selectedTask.id,
          selectedTask.title,
          selectedTask.course,
          selectedTask.subject,
          user.username,
          user.displayName || user.username,
          getTeacherUsernameById(selectedTask.assignedById)
        );

        toast({
          title: translate('taskSubmitted'),
          description: 'Tu tarea ha sido entregada y el profesor ha sido notificado.',
          variant: 'default'
        });
        
        // Disparar evento para actualizar notificaciones
        window.dispatchEvent(new CustomEvent('notificationsUpdated', {
          detail: { type: 'task_submission', taskId: selectedTask.id, studentId: user.id }
        }));
        
        // Forzar actualización del panel de estudiantes del profesor
        window.dispatchEvent(new CustomEvent('studentPanelUpdate', {
          detail: { taskId: selectedTask.id, studentId: user.id, submissionTime: new Date().toISOString() }
        }));
      }

      // Update task status only if ALL students have submitted - UPDATED para estados mejorados
      if (isSubmission) {
        // Obtener todos los estudiantes asignados a la tarea
        let assignedStudents = getAssignedStudentsForTask(selectedTask);
        
        console.log(`🔍 DEBUG: Verificando entregas para tarea "${selectedTask.title}"`);
        console.log(`👥 Estudiantes asignados: ${assignedStudents.length}`);
        console.log(`📋 Lista de estudiantes:`, assignedStudents);
        console.log(`👤 Usuario actual: ${user?.id} (${user?.username})`);
        
        // Verificar si ahora todos los estudiantes han entregado la tarea
        // Incluimos el comentario actual en la verificación
        console.log(`🔍 Verificando si todos los estudiantes han entregado...`);
        console.log(`📋 Estudiantes asignados:`, assignedStudents);
        
        // 🔥 PARCHE: Si no hay estudiantes asignados, intentar obtenerlos directamente del curso
        if (assignedStudents.length === 0 && selectedTask.course) {
          console.log(`⚠️ No hay estudiantes asignados, obteniendo del curso: ${selectedTask.course}`);
          const courseStudents = getStudentsFromCourseRelevantToTask(selectedTask.course, selectedTask.assignedById);
          console.log(`👥 Estudiantes del curso encontrados: ${courseStudents.length}`, courseStudents);
          assignedStudents = courseStudents;
        }
        
        const allStudentsSubmitted = assignedStudents.length > 0 && 
          assignedStudents.every(student => {
            const hasSubmitted = student.id === user?.id || hasStudentSubmitted(selectedTask.id, student.id);
            console.log(`✅ Estudiante ${student.displayName} (${student.id}): ${hasSubmitted ? 'ENTREGADO' : 'PENDIENTE'}`);
            return hasSubmitted;
          });
        
        // 🔥 CORRECCIÓN: NO cambiar el estado cuando los estudiantes entregan
        // La tarea debe mantenerse en 'pending' hasta que el profesor califique TODAS las entregas
        // El estado solo cambia a 'reviewed' (Finalizada) cuando el profesor termina de calificar a todos
        
        // Log para debug - mostrar cuántos estudiantes han entregado
        const submittedCount = assignedStudents.filter(student => 
          student.id === user?.id || hasStudentSubmitted(selectedTask.id, student.id)
        ).length;
        
        console.log(`📊 Entregas: ${submittedCount}/${assignedStudents.length} estudiantes han entregado la tarea "${selectedTask.title}"`);
        console.log(`⏳ Estado de la tarea mantiene: "pending" hasta que profesor califique todas las entregas`);
        console.log(`🎯 Todos entregaron: ${allStudentsSubmitted ? 'SÍ' : 'NO'}`);
        
        // 🔥 NUEVO: Si todos los estudiantes entregaron, crear notificación de tarea completa
        if (allStudentsSubmitted) {
          console.log(`🚀 Verificando si crear notificación de tarea completa...`);
          console.log(`📋 Detalles para notificación:`, {
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            course: selectedTask.course,
            subject: selectedTask.subject,
            assignedById: selectedTask.assignedById,
            taskType: selectedTask.taskType
          });
          
          // � TEMPORALMENTE DESHABILITADO: Bloquear TODAS las notificaciones task_completed hasta resolver duplicados
          console.log(`⚠️ NOTIFICACIÓN BLOQUEADA: Creación de task_completed temporalmente deshabilitada`);
          console.log(`📝 Razón: Evitar duplicados mientras se investiga el problema`);
          
          /* 
          // �🔧 CORRECCIÓN CRÍTICA: NO crear notificaciones para evaluaciones aquí
          // Las evaluaciones ya se manejan en la página de evaluaciones con createEvaluationCompletedNotification
          if (selectedTask.taskType !== 'evaluacion') {
            console.log(`✅ Creando notificación para tarea de tipo: ${selectedTask.taskType}`);
            
            // 🔧 CORRECCIÓN CRÍTICA: Obtener el username del profesor, no usar el ID
            const teacherUsername = getTeacherUsernameById(selectedTask.assignedById);
            
            TaskNotificationManager.createTaskCompletedNotification(
              selectedTask.id,
              selectedTask.title,
              selectedTask.course,
              selectedTask.subject,
              teacherUsername, // Usar username del profesor, no ID
              'assignment' // Solo para assignments, no evaluations
            );
            
            console.log(`✅ Tarea completa: Todos los estudiantes han entregado "${selectedTask.title}"`);
            
            // 🔥 FORZAR REFRESCO DE NOTIFICACIONES
            // Disparar evento personalizado para actualizar el panel de notificaciones
            window.dispatchEvent(new CustomEvent('notificationsUpdated', {
              detail: { type: 'task_completed', taskId: selectedTask.id }
            }));
          } else {
            console.log(`ℹ️ Saltando notificación para evaluación - ya se maneja en página de evaluaciones`);
            console.log(`📝 Evaluación "${selectedTask.title}" completada por todos los estudiantes`);
          }
          */
        }
        
        // NO actualizar el estado aquí - se mantiene en 'pending' hasta calificación completa
      }

      setNewComment('');
      setIsSubmission(false);
      
      // Registrar que estamos limpiando los archivos adjuntos después de guardar el comentario
      console.log('🧹 Limpiando archivos adjuntos después de guardar', commentAttachments.length);
      setCommentAttachments([]);

      if (!isSubmission) {
        toast({
          title: translate('commentAdded'),
          description: translate('commentAddedDesc'),
        });
      }
    };

    // FUNCIÓN PARA GENERAR PREGUNTAS ÚNICAS CONSULTANDO IA REAL
    const fetchAIQuestions = async (topic: string, numQuestions: number, language: string) => {
      console.log(`🤖 Consultando IA para generar ${numQuestions} preguntas únicas sobre '${topic}' en ${language === 'es' ? 'español' : 'inglés'}...`);
      
      try {
        // Prompt optimizado para generar preguntas educativas específicas
        const prompt = language === 'es' 
          ? `Genera exactamente ${numQuestions} preguntas de opción múltiple sobre el tema "${topic}" en español. Cada pregunta debe ser educativa, específica del tema y única. 

Formato requerido - Responde SOLO con un array JSON válido:
[
  {
    "question": "Pregunta específica sobre ${topic}",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correct": 0,
    "explanation": "Explicación detallada de por qué esta respuesta es correcta"
  }
]

Requisitos:
- Preguntas educativas y precisas sobre ${topic}
- 4 opciones de respuesta cada una
- Una sola respuesta correcta (índice 0-3)
- Explicación clara y educativa
- Contenido apropiado para estudiantes
- NO repetir preguntas
- Variedad en dificultad y aspectos del tema`
          : `Generate exactly ${numQuestions} multiple-choice questions about "${topic}" in English. Each question must be educational, topic-specific and unique.

Required format - Respond ONLY with a valid JSON array:
[
  {
    "question": "Specific question about ${topic}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Detailed explanation of why this answer is correct"
  }
]

Requirements:
- Educational and accurate questions about ${topic}
- 4 answer options each
- One correct answer (index 0-3)
- Clear educational explanation
- Student-appropriate content
- NO repeated questions
- Variety in difficulty and topic aspects`;

        // Simular llamada a IA - En producción, reemplazar con llamada real a OpenAI, Claude, etc.
        console.log('📡 Enviando prompt a IA:', prompt.substring(0, 100) + '...');
        
        // Simular latencia de API real
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
        
        // AQUÍ ES DONDE SE HARÍA LA LLAMADA REAL A LA IA
        // const response = await fetch('https://api.openai.com/v1/chat/completions', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     model: 'gpt-4',
        //     messages: [{
        //       role: 'user',
        //       content: prompt
        //     }],
        //     temperature: 0.7,
        //     max_tokens: 2000
        //   })
        // });
        
        // const aiData = await response.json();
        // const generatedQuestions = JSON.parse(aiData.choices[0].message.content);

        // SIMULACIÓN DE RESPUESTA DE IA CON PREGUNTAS EDUCATIVAS ESPECÍFICAS Y ÚNICAS
        const generateUniqueQuestions = () => {
          const timestamp = Date.now();
          const random = Math.random();
          const topicLower = topic.toLowerCase();
          
          const uniqueQuestions = [];
          
          for (let i = 0; i < numQuestions; i++) {
            // Generar preguntas únicas basadas en el tema, índice y timestamp
            const questionSeed = timestamp + i + Math.floor(random * 1000);
            
            let questionData;
            
            if (topicLower.includes('matemáticas') || topicLower.includes('mathematics') || topicLower.includes('math')) {
              questionData = generateMathQuestion(i, questionSeed, isSpanish);
            } else if (topicLower.includes('ciencias') || topicLower.includes('science') || topicLower.includes('biología') || topicLower.includes('biology')) {
              questionData = generateScienceQuestion(i, questionSeed, isSpanish);
            } else if (topicLower.includes('historia') || topicLower.includes('history')) {
              questionData = generateHistoryQuestion(i, questionSeed, isSpanish);
            } else if (topicLower.includes('geografía') || topicLower.includes('geography')) {
              questionData = generateGeographyQuestion(i, questionSeed, isSpanish);
            } else if (topicLower.includes('literatura') || topicLower.includes('literature') || topicLower.includes('español') || topicLower.includes('english')) {
              questionData = generateLiteratureQuestion(i, questionSeed, isSpanish);
            } else {
              questionData = generateGenericQuestion(topic, i, questionSeed, isSpanish);
            }
            
            uniqueQuestions.push({
              id: `ai_${questionSeed}_${i}`,
              question: questionData.question,
              options: questionData.options,
              correct: questionData.correct,
              explanation: questionData.explanation,
              type: "multiple-choice",
              aiGenerated: true,
              timestamp: questionSeed
            });
          }
          
          return uniqueQuestions;
        };

        const generatedQuestions = generateUniqueQuestions();
        
        console.log(`✅ IA generó ${generatedQuestions.length} preguntas únicas para ${topic}`);
        console.log('🔍 Vista previa de preguntas:', generatedQuestions.slice(0, 2).map(q => ({ 
          id: q.id,
          question: q.question.substring(0, 60) + '...', 
          optionsCount: q.options.length,
          aiGenerated: q.aiGenerated,
          timestamp: q.timestamp
        })));
        
        return generatedQuestions;
        
      } catch (error) {
        console.error('❌ Error consultando IA:', error);
        
        // Fallback: generar preguntas básicas si la IA falla
        const fallbackQuestions = Array.from({ length: numQuestions }, (_, i) => ({
          id: `fallback_${Date.now()}_${i}`,
          question: language === 'es' 
            ? `Pregunta ${i + 1} sobre ${topic}: ¿Cuál es un aspecto importante de este tema?`
            : `Question ${i + 1} about ${topic}: What is an important aspect of this topic?`,
          options: language === 'es'
            ? [`Aspecto A de ${topic}`, `Aspecto B de ${topic}`, `Aspecto C de ${topic}`, `Aspecto D de ${topic}`]
            : [`Aspect A of ${topic}`, `Aspect B of ${topic}`, `Aspect C of ${topic}`, `Aspect D of ${topic}`],
          correct: i % 4,
          explanation: language === 'es'
            ? `Esta es una pregunta generada automáticamente sobre ${topic}.`
            : `This is an automatically generated question about ${topic}.`,
          type: "multiple-choice",
          fallback: true
        }));
        
        return fallbackQuestions;
      }
    };

    // Funciones auxiliares para generar preguntas específicas por materia
    const generateMathQuestion = (index: number, seed: number, isSpanish: boolean) => {
      const mathConcepts = [
        { type: 'arithmetic', difficulty: 'basic' },
        { type: 'algebra', difficulty: 'intermediate' },
        { type: 'geometry', difficulty: 'intermediate' },
        { type: 'fractions', difficulty: 'basic' },
        { type: 'percentages', difficulty: 'intermediate' }
      ];
      
      const concept = mathConcepts[seed % mathConcepts.length];
      const num1 = (seed % 50) + 1;
      const num2 = (seed % 20) + 1;
      
      if (concept.type === 'arithmetic') {
        const result = num1 + num2;
        return isSpanish ? {
          question: `¿Cuánto es ${num1} + ${num2}?`,
          options: [`${result - 2}`, `${result}`, `${result + 1}`, `${result + 3}`],
          correct: 1,
          explanation: `${num1} + ${num2} = ${result}`
        } : {
          question: `What is ${num1} + ${num2}?`,
          options: [`${result - 2}`, `${result}`, `${result + 1}`, `${result + 3}`],
          correct: 1,
          explanation: `${num1} + ${num2} = ${result}`
        };
      } else if (concept.type === 'geometry') {
        const area = num1 * num2;
        return isSpanish ? {
          question: `¿Cuál es el área de un rectángulo de ${num1} cm por ${num2} cm?`,
          options: [`${area - 5} cm²`, `${area} cm²`, `${area + 5} cm²`, `${area * 2} cm²`],
          correct: 1,
          explanation: `Área = largo × ancho = ${num1} × ${num2} = ${area} cm²`
        } : {
          question: `What is the area of a rectangle ${num1} cm by ${num2} cm?`,
          options: [`${area - 5} cm²`, `${area} cm²`, `${area + 5} cm²`, `${area * 2} cm²`],
          correct: 1,
          explanation: `Area = length × width = ${num1} × ${num2} = ${area} cm²`
        };
      }
      
      // Fallback
      return isSpanish ? {
        question: `En matemáticas, ¿cuál es el resultado de multiplicar ${num1} por 2?`,
        options: [`${num1}`, `${num1 * 2}`, `${num1 + 2}`, `${num1 * 3}`],
        correct: 1,
        explanation: `${num1} × 2 = ${num1 * 2}`
      } : {
        question: `In mathematics, what is the result of multiplying ${num1} by 2?`,
        options: [`${num1}`, `${num1 * 2}`, `${num1 + 2}`, `${num1 * 3}`],
        correct: 1,
        explanation: `${num1} × 2 = ${num1 * 2}`
      };
    };

    const generateScienceQuestion = (index: number, seed: number, isSpanish: boolean) => {
      const scienceTopics = [
        'photosynthesis', 'gravity', 'atoms', 'ecosystems', 'weather', 'human_body', 'plants', 'animals'
      ];
      
      const selectedTopic = scienceTopics[seed % scienceTopics.length];
      
      if (selectedTopic === 'photosynthesis') {
        return isSpanish ? {
          question: "¿Qué gas producen las plantas durante la fotosíntesis?",
          options: ["Dióxido de carbono", "Oxígeno", "Nitrógeno", "Hidrógeno"],
          correct: 1,
          explanation: "Durante la fotosíntesis, las plantas producen oxígeno como subproducto al convertir dióxido de carbono y agua en glucosa."
        } : {
          question: "What gas do plants produce during photosynthesis?",
          options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
          correct: 1,
          explanation: "During photosynthesis, plants produce oxygen as a byproduct when converting carbon dioxide and water into glucose."
        };
      } else if (selectedTopic === 'gravity') {
        return isSpanish ? {
          question: "¿Qué pasa cuando dejas caer una pelota?",
          options: ["Flota en el aire", "Cae hacia abajo", "Se mueve hacia arriba", "Desaparece"],
          correct: 1,
          explanation: "La pelota cae hacia abajo debido a la fuerza de gravedad que atrae todos los objetos hacia la Tierra."
        } : {
          question: "What happens when you drop a ball?",
          options: ["It floats in air", "It falls down", "It moves up", "It disappears"],
          correct: 1,
          explanation: "The ball falls down due to the force of gravity that pulls all objects toward Earth."
        };
      }
      
      // Fallback para otros temas de ciencias
      return isSpanish ? {
        question: `En ciencias, ¿cuál es una característica importante de ${selectedTopic}?`,
        options: [`Característica A`, `Característica principal`, `Característica C`, `Característica D`],
        correct: 1,
        explanation: `Esta es una característica fundamental en el estudio de ${selectedTopic}.`
      } : {
        question: `In science, what is an important characteristic of ${selectedTopic}?`,
        options: [`Characteristic A`, `Main characteristic`, `Characteristic C`, `Characteristic D`],
        correct: 1,
        explanation: `This is a fundamental characteristic in the study of ${selectedTopic}.`
      };
    };

    const generateHistoryQuestion = (index: number, seed: number, isSpanish: boolean) => {
      const historicalPeriods = [
        'ancient_civilizations', 'middle_ages', 'renaissance', 'industrial_revolution', 'world_wars'
      ];
      
      const period = historicalPeriods[seed % historicalPeriods.length];
      
      return isSpanish ? {
        question: `¿Qué caracteriza al período histórico conocido como ${period.replace('_', ' ')}?`,
        options: [`Avances tecnológicos`, `Cambios sociales importantes`, `Conflictos significativos`, `Desarrollo cultural`],
        correct: (seed % 4),
        explanation: `El ${period.replace('_', ' ')} se caracteriza por importantes transformaciones en la sociedad humana.`
      } : {
        question: `What characterizes the historical period known as ${period.replace('_', ' ')}?`,
        options: [`Technological advances`, `Important social changes`, `Significant conflicts`, `Cultural development`],
        correct: (seed % 4),
        explanation: `The ${period.replace('_', ' ')} is characterized by important transformations in human society.`
      };
    };

    const generateGeographyQuestion = (index: number, seed: number, isSpanish: boolean) => {
      const countries = ['España', 'Francia', 'Italia', 'México', 'Argentina', 'Brasil', 'Chile', 'Colombia'];
      const selectedCountry = countries[seed % countries.length];
      
      return isSpanish ? {
        question: `¿En qué continente se encuentra ${selectedCountry}?`,
        options: [`Asia`, `Europa`, `América`, `África`],
        correct: selectedCountry === 'España' || selectedCountry === 'Francia' || selectedCountry === 'Italia' ? 1 : 2,
        explanation: `${selectedCountry} se encuentra en ${selectedCountry === 'España' || selectedCountry === 'Francia' || selectedCountry === 'Italia' ? 'Europa' : 'América'}.`
      } : {
        question: `In which continent is ${selectedCountry} located?`,
        options: [`Asia`, `Europe`, `America`, `Africa`],
        correct: selectedCountry === 'España' || selectedCountry === 'Francia' || selectedCountry === 'Italia' ? 1 : 2,
        explanation: `${selectedCountry} is located in ${selectedCountry === 'España' || selectedCountry === 'Francia' || selectedCountry === 'Italia' ? 'Europe' : 'America'}.`
      };
    };

    const generateLiteratureQuestion = (index: number, seed: number, isSpanish: boolean) => {
      const literaryGenres = ['novela', 'poesía', 'teatro', 'ensayo', 'cuento'];
      const selectedGenre = literaryGenres[seed % literaryGenres.length];
      
      return isSpanish ? {
        question: `¿Cuál es una característica principal de la ${selectedGenre}?`,
        options: [`Narrativa extensa`, `Estructura específica`, `Uso del lenguaje`, `Temática particular`],
        correct: (seed % 4),
        explanation: `La ${selectedGenre} tiene características literarias específicas que la distinguen de otros géneros.`
      } : {
        question: `What is a main characteristic of ${selectedGenre}?`,
        options: [`Extensive narrative`, `Specific structure`, `Language use`, `Particular themes`],
        correct: (seed % 4),
        explanation: `${selectedGenre} has specific literary characteristics that distinguish it from other genres.`
      };
    };

    const generateGenericQuestion = (topic: string, index: number, seed: number, isSpanish: boolean) => {
      const questionTypes = ['definition', 'application', 'importance', 'characteristics', 'examples'];
      const selectedType = questionTypes[seed % questionTypes.length];
      
      return isSpanish ? {
        question: `Sobre ${topic}, ¿cuál es ${selectedType === 'definition' ? 'su definición' : selectedType === 'application' ? 'una aplicación práctica' : selectedType === 'importance' ? 'su importancia' : selectedType === 'characteristics' ? 'una característica' : 'un ejemplo'}?`,
        options: [`Opción A sobre ${topic}`, `Respuesta correcta sobre ${topic}`, `Opción C sobre ${topic}`, `Opción D sobre ${topic}`],
        correct: 1,
        explanation: `Esta respuesta aborda correctamente el aspecto de ${selectedType} relacionado con ${topic}.`
      } : {
        question: `About ${topic}, what is ${selectedType === 'definition' ? 'its definition' : selectedType === 'application' ? 'a practical application' : selectedType === 'importance' ? 'its importance' : selectedType === 'characteristics' ? 'a characteristic' : 'an example'}?`,
        options: [`Option A about ${topic}`, `Correct answer about ${topic}`, `Option C about ${topic}`, `Option D about ${topic}`],
        correct: 1,
        explanation: `This answer correctly addresses the ${selectedType} aspect related to ${topic}.`
      };
    };
              options: ["30 cm", "300 cm", "3000 cm", "30000 cm"],
              correct: 1,
              explanation: "1 metro = 100 centímetros. Entonces 3 metros = 3 × 100 = 300 centímetros."
            },
            {
              question: "¿Cuál es el área de un rectángulo de 5 cm de largo y 3 cm de ancho?",
              options: ["8 cm²", "15 cm²", "16 cm²", "25 cm²"],
              correct: 1,
              explanation: "Área = largo × ancho = 5 cm × 3 cm = 15 cm²."
            },
            {
              question: "¿Cuánto es 45 + 29?",
              options: ["64", "74", "84", "94"],
              correct: 1,
              explanation: "45 + 29: sumamos 45 + 30 = 75, luego restamos 1 = 74."
            }
          ] : [
            {
              question: "If you have 24 apples and share them equally among 6 children, how many apples does each child get?",
              options: ["3 apples", "4 apples", "5 apples", "6 apples"],
              correct: 1,
              explanation: "24 ÷ 6 = 4. Each child gets 4 apples."
            },
            {
              question: "What is the result of 7 × 8?",
              options: ["54", "56", "64", "72"],
              correct: 1,
              explanation: "7 × 8 = 56. You can verify: 7 × 8 = (7 × 10) - (7 × 2) = 70 - 14 = 56."
            },
            {
              question: "How many centimeters are in 3 meters?",
              options: ["30 cm", "300 cm", "3000 cm", "30000 cm"],
              correct: 1,
              explanation: "1 meter = 100 centimeters. So 3 meters = 3 × 100 = 300 centimeters."
            },
            {
              question: "What is the area of a rectangle 5 cm long and 3 cm wide?",
              options: ["8 cm²", "15 cm²", "16 cm²", "25 cm²"],
              correct: 1,
              explanation: "Area = length × width = 5 cm × 3 cm = 15 cm²."
            },
            {
              question: "What is 45 + 29?",
              options: ["64", "74", "84", "94"],
              correct: 1,
              explanation: "45 + 29: we add 45 + 30 = 75, then subtract 1 = 74."
            }
          ];
          return mathQuestions[questionIndex % mathQuestions.length];
        }
        
        // CIENCIAS NATURALES
        if (topicLower.includes('ciencias') || topicLower.includes('science') || topicLower.includes('biología') || topicLower.includes('biology') || topicLower.includes('química') || topicLower.includes('chemistry') || topicLower.includes('física') || topicLower.includes('physics')) {
          const scienceQuestions = isSpanish ? [
            {
              question: "¿Cuál es el planeta más grande del sistema solar?",
              options: ["Saturno", "Júpiter", "Neptuno", "Urano"],
              correct: 1,
              explanation: "Júpiter es el planeta más grande del sistema solar, con un diámetro de aproximadamente 142,984 km."
            },
            {
              question: "¿Qué necesitan las plantas para hacer la fotosíntesis?",
              options: ["Solo agua", "Solo luz solar", "Luz solar, agua y dióxido de carbono", "Solo dióxido de carbono"],
              correct: 2,
              explanation: "Las plantas necesitan luz solar, agua y dióxido de carbono para realizar la fotosíntesis y producir oxígeno."
            },
            {
              question: "¿Cuántos huesos tiene aproximadamente el cuerpo humano adulto?",
              options: ["186", "206", "226", "246"],
              correct: 1,
              explanation: "El cuerpo humano adulto tiene aproximadamente 206 huesos."
            },
            {
              question: "¿En qué estado de la materia se encuentran las moléculas más separadas?",
              options: ["Sólido", "Líquido", "Gaseoso", "Plasma"],
              correct: 2,
              explanation: "En el estado gaseoso, las moléculas están más separadas y se mueven libremente."
            },
            {
              question: "¿Qué órgano bombea la sangre por todo el cuerpo?",
              options: ["Los pulmones", "El corazón", "El hígado", "Los riñones"],
              correct: 1,
              explanation: "El corazón es el órgano que bombea la sangre por todo el cuerpo a través del sistema circulatorio."
            }
          ] : [
            {
              question: "Which is the largest planet in the solar system?",
              options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
              correct: 1,
              explanation: "Jupiter is the largest planet in the solar system, with a diameter of approximately 142,984 km."
            },
            {
              question: "What do plants need for photosynthesis?",
              options: ["Only water", "Only sunlight", "Sunlight, water and carbon dioxide", "Only carbon dioxide"],
              correct: 2,
              explanation: "Plants need sunlight, water and carbon dioxide to perform photosynthesis and produce oxygen."
            },
            {
              question: "How many bones does the adult human body have approximately?",
              options: ["186", "206", "226", "246"],
              correct: 1,
              explanation: "The adult human body has approximately 206 bones."
            },
            {
              question: "In which state of matter are molecules most separated?",
              options: ["Solid", "Liquid", "Gas", "Plasma"],
              correct: 2,
              explanation: "In the gaseous state, molecules are most separated and move freely."
            },
            {
              question: "Which organ pumps blood throughout the body?",
              options: ["The lungs", "The heart", "The liver", "The kidneys"],
              correct: 1,
              explanation: "The heart is the organ that pumps blood throughout the body through the circulatory system."
            }
          ];
          return scienceQuestions[questionIndex % scienceQuestions.length];
        }
        
        // HISTORIA
        if (topicLower.includes('historia') || topicLower.includes('history') || topicLower.includes('histórico')) {
          const historyQuestions = isSpanish ? [
            {
              question: "¿En qué año llegó Cristóbal Colón a América?",
              options: ["1490", "1492", "1494", "1496"],
              correct: 1,
              explanation: "Cristóbal Colón llegó a América el 12 de octubre de 1492."
            },
            {
              question: "¿Cuál fue la primera civilización en desarrollar la escritura?",
              options: ["Egipcios", "Griegos", "Sumerios", "Romanos"],
              correct: 2,
              explanation: "Los sumerios fueron los primeros en desarrollar un sistema de escritura llamado cuneiforme."
            },
            {
              question: "¿En qué continente se originó la humanidad?",
              options: ["Asia", "Europa", "África", "América"],
              correct: 2,
              explanation: "Según evidencias científicas, la humanidad se originó en África."
            }
          ] : [
            {
              question: "In what year did Christopher Columbus arrive in America?",
              options: ["1490", "1492", "1494", "1496"],
              correct: 1,
              explanation: "Christopher Columbus arrived in America on October 12, 1492."
            },
            {
              question: "Which was the first civilization to develop writing?",
              options: ["Egyptians", "Greeks", "Sumerians", "Romans"],
              correct: 2,
              explanation: "The Sumerians were the first to develop a writing system called cuneiform."
            },
            {
              question: "On which continent did humanity originate?",
              options: ["Asia", "Europe", "Africa", "America"],
              correct: 2,
              explanation: "According to scientific evidence, humanity originated in Africa."
            }
          ];
          return historyQuestions[questionIndex % historyQuestions.length];
        }
        
        // GEOGRAFÍA
        if (topicLower.includes('geografía') || topicLower.includes('geography') || topicLower.includes('geográfico')) {
          const geographyQuestions = isSpanish ? [
            {
              question: "¿Cuál es el río más largo del mundo?",
              options: ["Río Amazonas", "Río Nilo", "Río Yangtsé", "Río Misisipi"],
              correct: 1,
              explanation: "El río Nilo es considerado el río más largo del mundo con aproximadamente 6,650 km."
            },
            {
              question: "¿Cuál es el continente más grande?",
              options: ["África", "América", "Asia", "Europa"],
              correct: 2,
              explanation: "Asia es el continente más grande del mundo, tanto en superficie como en población."
            },
            {
              question: "¿Cuál es la montaña más alta del mundo?",
              options: ["K2", "Monte Everest", "Kangchenjunga", "Annapurna"],
              correct: 1,
              explanation: "El Monte Everest es la montaña más alta del mundo con 8,848 metros sobre el nivel del mar."
            }
          ] : [
            {
              question: "Which is the longest river in the world?",
              options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
              correct: 1,
              explanation: "The Nile River is considered the longest river in the world at approximately 6,650 km."
            },
            {
              question: "Which is the largest continent?",
              options: ["Africa", "America", "Asia", "Europe"],
              correct: 2,
              explanation: "Asia is the largest continent in the world, both in area and population."
            },
            {
              question: "Which is the highest mountain in the world?",
              options: ["K2", "Mount Everest", "Kangchenjunga", "Annapurna"],
              correct: 1,
              explanation: "Mount Everest is the highest mountain in the world at 8,848 meters above sea level."
            }
          ];
          return geographyQuestions[questionIndex % geographyQuestions.length];
        }
        
        // ESPAÑOL/LENGUAJE
        if (topicLower.includes('español') || topicLower.includes('spanish') || topicLower.includes('lenguaje') || topicLower.includes('language') || topicLower.includes('literatura') || topicLower.includes('literature')) {
          const languageQuestions = isSpanish ? [
            {
              question: "¿Cuál es el sujeto en la oración 'El gato duerme en el sofá'?",
              options: ["El gato", "duerme", "en el sofá", "sofá"],
              correct: 0,
              explanation: "El sujeto es 'El gato' porque es quien realiza la acción de dormir."
            },
            {
              question: "¿Qué tipo de palabra es 'rápidamente'?",
              options: ["Sustantivo", "Adjetivo", "Adverbio", "Verbo"],
              correct: 2,
              explanation: "'Rápidamente' es un adverbio porque modifica al verbo indicando cómo se realiza la acción."
            },
            {
              question: "¿Cuántas sílabas tiene la palabra 'mariposa'?",
              options: ["3 sílabas", "4 sílabas", "5 sílabas", "6 sílabas"],
              correct: 1,
              explanation: "La palabra 'mariposa' tiene 4 sílabas: ma-ri-po-sa."
            }
          ] : [
            {
              question: "What is the subject in the sentence 'The cat sleeps on the sofa'?",
              options: ["The cat", "sleeps", "on the sofa", "sofa"],
              correct: 0,
              explanation: "The subject is 'The cat' because it's who performs the action of sleeping."
            },
            {
              question: "What type of word is 'quickly'?",
              options: ["Noun", "Adjective", "Adverb", "Verb"],
              correct: 2,
              explanation: "'Quickly' is an adverb because it modifies the verb indicating how the action is performed."
            },
            {
              question: "How many syllables does the word 'butterfly' have?",
              options: ["2 syllables", "3 syllables", "4 syllables", "5 syllables"],
              correct: 1,
              explanation: "The word 'butterfly' has 3 syllables: but-ter-fly."
            }
          ];
          return languageQuestions[questionIndex % languageQuestions.length];
        }
        
        // PREGUNTAS GENÉRICAS MEJORADAS PARA OTROS TEMAS
        const genericEducationalQuestions = isSpanish ? [
          {
            question: `¿Cuál es un principio fundamental relacionado con ${topic}?`,
            options: [
              `Principio básico: comprensión teórica de ${topic}`,
              `Principio avanzado: aplicación práctica de ${topic}`,
              `Principio especializado: análisis crítico de ${topic}`,
              `Principio integrador: síntesis de conceptos en ${topic}`
            ],
            correct: questionIndex % 4,
            explanation: `En el estudio de ${topic}, es esencial comprender tanto los fundamentos teóricos como sus aplicaciones prácticas.`
          },
          {
            question: `¿Qué característica es más importante en el contexto de ${topic}?`,
            options: [
              `La precisión en la aplicación de conceptos`,
              `La comprensión de relaciones causa-efecto`,
              `La capacidad de análisis crítico`,
              `La integración de conocimientos previos`
            ],
            correct: (questionIndex + 1) % 4,
            explanation: `En ${topic}, todas estas características son importantes, pero varían según el contexto específico de aplicación.`
          },
          {
            question: `¿Cuál es una aplicación práctica relevante de ${topic}?`,
            options: [
              `Resolución de problemas cotidianos`,
              `Desarrollo de habilidades analíticas`,
              `Mejora en la toma de decisiones`,
              `Comprensión de procesos complejos`
            ],
            correct: (questionIndex + 2) % 4,
            explanation: `El conocimiento en ${topic} se aplica de múltiples formas, cada una con su propio valor educativo.`
          }
        ] : [
          {
            question: `What is a fundamental principle related to ${topic}?`,
            options: [
              `Basic principle: theoretical understanding of ${topic}`,
              `Advanced principle: practical application of ${topic}`,
              `Specialized principle: critical analysis of ${topic}`,
              `Integrative principle: synthesis of concepts in ${topic}`
            ],
            correct: questionIndex % 4,
            explanation: `In the study of ${topic}, it's essential to understand both theoretical foundations and practical applications.`
          },
          {
            question: `What characteristic is most important in the context of ${topic}?`,
            options: [
              `Precision in applying concepts`,
              `Understanding cause-effect relationships`,
              `Critical analysis capability`,
              `Integration of prior knowledge`
            ],
            correct: (questionIndex + 1) % 4,
            explanation: `In ${topic}, all these characteristics are important, but they vary according to specific application context.`
          },
          {
            question: `What is a relevant practical application of ${topic}?`,
            options: [
              `Solving everyday problems`,
              `Developing analytical skills`,
              `Improving decision-making`,
              `Understanding complex processes`
            ],
            correct: (questionIndex + 2) % 4,
            explanation: `Knowledge in ${topic} is applied in multiple ways, each with its own educational value.`
          }
        ];
        
        return genericEducationalQuestions[questionIndex % genericEducationalQuestions.length];
      };

      // Generar el número solicitado de preguntas educativas
      const generatedQuestions = Array.from({ length: numQuestions }, (_, i) => {
        const questionData = generateEducationalQuestion(i);
        return {
          id: `educational_${Date.now()}_${i}`,
          question: questionData.question,
          options: questionData.options,
          correct: questionData.correct,
          type: "multiple-choice",
          explanation: questionData.explanation
        };
      });
      
      console.log(`✅ Generadas ${generatedQuestions.length} preguntas educativas para ${topic}`);
      console.log('🔍 Muestra de preguntas generadas:', generatedQuestions.slice(0, 2).map(q => ({ 
        question: q.question?.substring(0, 60) + '...', 
        optionsCount: q.options?.length,
        hasCorrectAnswer: q.correct !== undefined
      })));
      
      return generatedQuestions;
    };

    // Funciones para la evaluación mejorada - AHORA ASYNC
    const generateEvaluationQuestions = async (topic: string, numQuestions: number) => {
      // Determinar idioma actual
      const currentLanguage = localStorage.getItem('smart-student-lang') || 'es';
      console.log('🔍 GENERATING QUESTIONS - Current language:', currentLanguage);
      console.log('🔍 GENERATING QUESTIONS - Topic:', topic, 'Num questions:', numQuestions);
      
      // Llamar a la función de IA simulada
      const questions = await fetchAIQuestions(topic, numQuestions, currentLanguage);
      
      console.log(`🎯 Generadas ${questions.length} preguntas dinámicas para el tema: ${topic}`);
      return questions;
    };

    const handleStartEvaluation = async (task: Task) => {
      // Verificar si ya completó la evaluación
      if (evaluationResults[task.id]) {
        toast({
          title: "Evaluación completada",
          description: "Ya has completado esta evaluación.",
          variant: "destructive"
        });
        return;
      }

      // Validar criterios configurados por el profesor
      const topic = task.topic || 'Tema general';
      const numQuestions = task.numQuestions && task.numQuestions > 0 ? task.numQuestions : 5;
      const timeLimit = task.timeLimit && task.timeLimit > 0 ? task.timeLimit : 10;

      // Mostrar advertencia si algunos criterios no están configurados
      if (!task.topic || !task.numQuestions || !task.timeLimit) {
        console.warn('⚠️ Algunos criterios de evaluación no están configurados por el profesor:', {
          topic: task.topic,
          numQuestions: task.numQuestions, 
          timeLimit: task.timeLimit
        });
      }

      setShowLoadingDialog(true);
      setLoadingProgress(0);
      setLoadingStatus('Inicializando evaluación...');

      // Simular proceso de carga con diferentes etapas usando criterios del profesor
      const loadingSteps = [
        { progress: 15, status: 'Verificando configuración del profesor...' },
        { progress: 30, status: `Cargando preguntas sobre: ${topic}` },
        { progress: 50, status: `Preparando ${numQuestions} preguntas...` },
        { progress: 70, status: `Configurando tiempo límite: ${timeLimit} minutos` },
        { progress: 85, status: 'Generando evaluación personalizada...' },
        { progress: 100, status: `Evaluación lista: ${topic} | ${numQuestions} preguntas | ${timeLimit} min` }
      ];

      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < loadingSteps.length) {
          const step = loadingSteps[stepIndex];
          setLoadingProgress(step.progress);
          setLoadingStatus(step.status);
          stepIndex++;
        } else {
          clearInterval(interval);
          
          setTimeout(async () => {
            setShowLoadingDialog(false);
            
            try {
              // Generar preguntas usando criterios del profesor
              const questions = await generateEvaluationQuestions(topic, numQuestions);
              console.log('🔍 GENERATED QUESTIONS:', questions.map(q => ({ 
                question: q.question?.substring(0, 50), 
                options: q.options?.map(o => o?.substring(0, 20)) 
              })));
              
              const timeInSeconds = timeLimit * 60;
              
              setCurrentEvaluation({
                task,
                questions,
                startTime: new Date(),
                answers: {},
                timeRemaining: timeInSeconds,
                currentQuestionIndex: 0
              });
              
              setShowEvaluationDialog(true);
              
              // Iniciar countdown del timer
              console.log('🔥 [startEvaluation] Iniciando evaluación con tiempo límite:', timeLimit, 'minutos');
              startEvaluationTimer(timeInSeconds);
              
              toast({
                title: "Evaluación iniciada",
                description: `Evaluación sobre ${topic} con ${numQuestions} preguntas y ${timeLimit} minutos.`,
                variant: "default"
              });
              
            } catch (error) {
              console.error('Error al generar la evaluación:', error);
              toast({
                title: "Error",
                description: "Hubo un problema al generar la evaluación. Inténtalo de nuevo.",
                variant: "destructive"
              });
            }
          }, 500);
        }
      }, 800);
    };

    const startEvaluationTimer = (initialTime: number) => {
      console.log('🔥 [startEvaluationTimer] Iniciando timer con tiempo:', initialTime);
      
      const timerRef = setInterval(() => {
        setCurrentEvaluation(prev => {
          if (!prev) return prev;
          
          const newTime = prev.timeRemaining - 1;
          
          if (newTime <= 0) {
            console.log('🔥 [startEvaluationTimer] ¡TIEMPO AGOTADO! Deteniendo timer');
            clearInterval(timerRef);
            
            // Ejecutar handleCompleteEvaluation con un delay para asegurar que el estado se actualice
            setTimeout(() => {
              console.log('🔥 [startEvaluationTimer] Ejecutando handleCompleteEvaluation(true)');
              handleCompleteEvaluation(true);
            }, 200);
            
            return { ...prev, timeRemaining: 0 };
          }
          
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    };

    const handleReviewEvaluation = async (task: Task) => {
      const evaluationResult = evaluationResults[task.id];
      if (evaluationResult) {
        // Traducir las preguntas dinámicamente según el idioma actual
        const translatedResult = await translateEvaluationResult(evaluationResult, task);
        setCurrentEvaluationReview(translatedResult);
        setShowReviewEvaluationDialog(true);
      }
    };

    // Función para traducir los resultados de evaluación según el idioma actual
    const translateEvaluationResult = async (result: any, task: Task) => {
      const currentLanguage = localStorage.getItem('smart-student-lang') || 'es';
      
      console.log('🔍 TRANSLATION DEBUG - Current language:', currentLanguage);
      console.log('🔍 TRANSLATION DEBUG - LocalStorage key check:', localStorage.getItem('smart-student-lang'));
      console.log('🔍 TRANSLATION DEBUG - All localStorage keys:', Object.keys(localStorage));
      console.log('🔍 TRANSLATION DEBUG - Result has questions:', !!result.questions);
      console.log('🔍 TRANSLATION DEBUG - Questions length:', result.questions?.length);
      
      // FORZAR VERIFICACIÓN: Verificar otras posibles claves de idioma
      const altLanguageCheck = localStorage.getItem('language') || localStorage.getItem('locale') || localStorage.getItem('i18n-language');
      console.log('🔍 TRANSLATION DEBUG - Alternative language keys:', { altLanguageCheck });
      
      // Si ya está en español o no hay preguntas, devolver tal como está
      if (currentLanguage === 'es' || !result.questions || result.questions.length === 0) {
        console.log('🔍 TRANSLATION DEBUG - Returning original result (no translation needed)');
        console.log('🔍 TRANSLATION DEBUG - Reason: currentLanguage =', currentLanguage, ', hasQuestions =', !!result.questions);
        return result;
      }

      console.log('🔄 Translating evaluation result from Spanish to English...');
      console.log('Original topic:', task.topic);
      console.log('Original questions sample:', result.questions[0]?.question?.substring(0, 100));
      
      // Generar preguntas en inglés para el mismo tema
      const englishQuestions = await generateEvaluationQuestions(task.topic || 'mathematics', result.questions.length);
      
      console.log('Generated English questions:', englishQuestions.length);
      console.log('English questions sample:', englishQuestions[0]?.question?.substring(0, 100));
      
      // Mapear las preguntas guardadas con las traducciones al inglés
      const translatedQuestions = result.questions.map((savedQuestion: any, index: number) => {
        const englishQuestion = englishQuestions[index];
        
        // Si no hay pregunta en inglés correspondiente, mantener la original
        if (!englishQuestion || typeof englishQuestion !== 'object') {
          console.log(`⚠️ No English question found for index ${index}`);
          return savedQuestion;
        }
        
        // Verificar que la pregunta en inglés tiene las propiedades necesarias
        const hasRequiredProps = 'question' in englishQuestion && 
                                'options' in englishQuestion && 
                                'explanation' in englishQuestion &&
                                'correct' in englishQuestion;
        
        if (!hasRequiredProps) {
          console.log(`⚠️ English question ${index} missing required properties`);
          return savedQuestion;
        }
        
        const translatedQuestion = {
          ...savedQuestion,
          question: (englishQuestion as any).question,
          options: (englishQuestion as any).options,
          explanation: (englishQuestion as any).explanation,
          // Actualizar texto de respuesta del estudiante y respuesta correcta
          studentAnswerText: savedQuestion.studentAnswer !== undefined ? 
            (englishQuestion as any).options[savedQuestion.studentAnswer] : undefined,
          correctAnswer: (englishQuestion as any).options[(englishQuestion as any).correct],
          // Mantener datos originales del estudiante
          studentAnswer: savedQuestion.studentAnswer,
          correct: savedQuestion.correct,
          isCorrect: savedQuestion.isCorrect
        };
        
        console.log(`✅ Translated question ${index + 1}:`, {
          original: savedQuestion.question?.substring(0, 50) + '...',
          translated: (englishQuestion as any).question?.substring(0, 50) + '...'
        });
        
        return translatedQuestion;
      });

      const translatedResult = {
        ...result,
        questions: translatedQuestions
      };
      
      console.log('🎯 Translation completed');
      return translatedResult;
    };

    const handleCompleteEvaluation = (timeExpired: boolean = false) => {
      if (!currentEvaluation.task) return;

      let correctAnswers = 0;
      const totalQuestions = currentEvaluation.questions.length;

      // Calcular respuestas correctas y procesar cada pregunta
      const processedQuestions = currentEvaluation.questions.map((question, index) => {
        const studentAnswer = currentEvaluation.answers[index];
        const isCorrect = studentAnswer === question.correct;
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        return {
          ...question,
          studentAnswer: studentAnswer,
          studentAnswerText: question.options[studentAnswer], // Texto de la alternativa elegida
          correctAnswer: question.options[question.correct],
          isCorrect: isCorrect
        };
      });

      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      const timeUsed = (currentEvaluation.task.timeLimit || 10) * 60 - currentEvaluation.timeRemaining;

      // Crear resultado de evaluación con detalles completos
      const evaluationResult = {
        taskId: currentEvaluation.task.id,
        studentId: user?.id,
        studentUsername: user?.username,
        studentName: user?.displayName,
        answers: currentEvaluation.answers,
        questions: processedQuestions, // Guardar preguntas procesadas con resultados
        correctAnswers,
        totalQuestions,
        percentage,
        completedAt: new Date().toISOString(),
        timeUsed,
        timeExpired,
        task: {
          title: currentEvaluation.task.title,
          topic: currentEvaluation.task.topic,
          timeLimit: currentEvaluation.task.timeLimit,
          numQuestions: currentEvaluation.task.numQuestions
        }
      };

      // Guardar en localStorage
      const existingResults = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
      existingResults.push(evaluationResult);
      localStorage.setItem('smart-student-evaluation-results', JSON.stringify(existingResults));

      // Verificar si todos los estudiantes han completado la evaluación para actualizar el estado
      checkAndUpdateEvaluationStatus(currentEvaluation.task!.id);

      // NO actualizar el estado de la tarea aquí - esto se hace en checkAndUpdateEvaluationStatus
      // Solo guardar el resultado individual del estudiante
      /* 
      // Actualizar estado de la tarea a finalizado
      const storedTasks = localStorage.getItem('smart-student-tasks');
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const taskIndex = tasks.findIndex((t: any) => t.id === currentEvaluation.task!.id);
        if (taskIndex !== -1) {
          tasks[taskIndex] = {
            ...tasks[taskIndex],
            status: 'reviewed', // INCORRECTO: No cambiar el estado aquí
            evaluationResult: {
              completed: true,
              percentage: percentage,
              completedAt: evaluationResult.completedAt,
              correctAnswers: correctAnswers,
              totalQuestions: totalQuestions
            }
          };
          localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
        }
      }
      */

      // Actualizar estado local
      setEvaluationResults(prev => ({
        ...prev,
        [currentEvaluation.task!.id]: evaluationResult
      }));

      // Crear notificación en tiempo real para el profesor
      const notification = {
        id: `eval_completed_${Date.now()}`,
        type: 'evaluation_completed',
        taskId: currentEvaluation.task.id,
        fromUsername: user?.username,
        fromName: user?.displayName,
        targetUserRole: 'teacher',
        targetUsernames: [currentEvaluation.task.assignedById || ''],
        message: `${user?.displayName} completó la evaluación "${currentEvaluation.task.title}" - Nota: ${correctAnswers}/${totalQuestions} (${percentage}%)`,
        timestamp: new Date().toISOString(),
        readBy: [],
        data: evaluationResult // Incluir datos completos de la evaluación
      };

      // Agregar a notificaciones
      const existingNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('smart-student-task-notifications', JSON.stringify(existingNotifications));

      // Disparar evento para actualizar notificaciones en tiempo real
      window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
      
      // 🔥 NUEVO: Disparar evento para actualizar tareas pendientes
      window.dispatchEvent(new CustomEvent('pendingTasksUpdated'));
      
      console.log('🎯 [handleCompleteEvaluation] Events dispatched: taskNotificationsUpdated, pendingTasksUpdated');

      // Si el tiempo se agotó, mostrar modal específico ANTES de cerrar la evaluación
      if (timeExpired) {
        console.log('🔥 [handleCompleteEvaluation] Tiempo agotado - Configurando estados para modal');
        console.log('🔥 [handleCompleteEvaluation] evaluationResult:', evaluationResult);
        
        // Configurar estados para el modal
        setEvaluationTimeExpired(true);
        setTimeExpiredResult(evaluationResult);
        setShowTimeExpiredDialog(true);
        
        console.log('🔥 [handleCompleteEvaluation] Estados configurados - timeExpiredResult:', !!evaluationResult);
        console.log('🔥 [handleCompleteEvaluation] showTimeExpiredDialog será:', true);
        
        // NO cerrar la evaluación hasta que el usuario haga clic en "Revisar"
        // Solo resetear algunas propiedades para evitar continuar la evaluación
        setCurrentEvaluation(prev => ({
          ...prev,
          timeRemaining: 0,
          // Bloquear interacciones manteniendo el estado
        }));
      } else {
        // Limpiar estado y cerrar inmediatamente para evaluación normal
        setShowEvaluationDialog(false);
        setCurrentEvaluation({
          task: null,
          questions: [],
          startTime: null,
          answers: {},
          timeRemaining: 0,
          currentQuestionIndex: 0
        });
        
        // Mostrar mensaje de éxito normal
        toast({
          title: "Evaluación Completada",
          description: `¡Evaluación completada! Tu calificación es ${correctAnswers}/${totalQuestions} (${percentage}%)`,
        });
      }

      // Recargar tareas para reflejar cambios
      loadTasks();
      loadEvaluationResults(); // Recargar resultados de evaluaciones
    };





    const handleEditTask = (task: Task) => {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        subject: task.subject, // Might become subjectId
        course: task.course, // Expected to be courseId
        assignedTo: task.assignedTo,
        assignedStudentIds: task.assignedStudentIds || [], // Use assignedStudentIds
        dueDate: task.dueDate,
        priority: task.priority,
        taskType: task.taskType || 'tarea',
        topic: task.topic || '',
        numQuestions: task.numQuestions || 0,
        timeLimit: task.timeLimit || 0
      });
      setShowEditDialog(true);
    };

    const handleUpdateTask = () => {
      if (!selectedTask || !formData.title || !formData.description || !formData.course || !formData.dueDate || !formData.subject) {
        toast({
          title: translate('error'),
          description: translate('completeAllFields'),
          variant: 'destructive'
        });
        return;
      }

      // Validación específica para evaluaciones
      if (formData.taskType === 'evaluacion') {
        if (!formData.topic || !formData.numQuestions || !formData.timeLimit) {
          toast({
            title: 'Error',
            description: 'Para las evaluaciones debe especificar: Tema, Cantidad de Preguntas y Tiempo límite',
            variant: 'destructive'
          });
          return;
        }
        
        if (![5, 10, 15, 20, 25, 30].includes(formData.numQuestions)) {
          toast({
            title: 'Error', 
            description: 'La cantidad de preguntas debe ser una de las opciones disponibles: 5, 10, 15, 20, 25 o 30',
            variant: 'destructive'
          });
          return;
        }
        
        if (formData.timeLimit < 1 || formData.timeLimit > 180) {
          toast({
            title: 'Error',
            description: 'El tiempo límite debe estar entre 1 y 180 minutos',
            variant: 'destructive'
          });
          return;
        }
      }
      
      // Validar que la fecha límite sea en el futuro
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        toast({
          title: translate('error'),
          description: translate('dueDateMustBeFuture'),
          variant: 'destructive'
        });
        return;
      }

      const updatedTask: Task = {
        ...selectedTask,
        title: formData.title,
        description: formData.description,
        subject: formData.subject, // Might become subjectId
        course: formData.course, // Expected to be courseId
        assignedTo: formData.assignedTo,
        assignedStudentIds: formData.assignedTo === 'student' ? formData.assignedStudentIds : undefined, // Use assignedStudentIds
        dueDate: formData.dueDate,
        priority: formData.priority,
        taskType: formData.taskType,
        // Include evaluation fields if it's an evaluation
        topic: formData.taskType === 'evaluacion' ? formData.topic : undefined,
        numQuestions: formData.taskType === 'evaluacion' ? formData.numQuestions : undefined,
        timeLimit: formData.taskType === 'evaluacion' ? formData.timeLimit : undefined
      };

      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      );
      saveTasks(updatedTasks);

      toast({
        title: translate('taskUpdated'),
        description: translate('taskUpdatedDesc', { title: formData.title }),
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        course: '',
        assignedTo: 'course',
        assignedStudentIds: [],
        dueDate: '',
        priority: 'medium',
        taskType: 'tarea',
        topic: '',
        numQuestions: 5, // Por defecto 5 preguntas
        timeLimit: 1 // Por defecto 1 minuto
      });
      setSelectedTask(null);
      setShowEditDialog(false);
    };

    const handleDeleteTask = (task: Task) => {
      setTaskToDelete(task);
      setShowDeleteDialog(true);
    };

    const confirmDeleteTask = () => {
      if (!taskToDelete) return;

      const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
      saveTasks(updatedTasks);

      // Also remove related comments
      const updatedComments = comments.filter(comment => comment.taskId !== taskToDelete.id);
      saveComments(updatedComments);

      toast({
        title: translate('taskDeleted'),
        description: translate('taskDeletedDesc', { title: taskToDelete.title }),
      });

      setTaskToDelete(null);
      setShowDeleteDialog(false);
    };

    const getTaskComments = (taskId: string) => {
      return comments.filter(comment => comment.taskId === taskId);
    };

    // 🔧 NUEVA FUNCIÓN: Contar solo comentarios del profesor (excluir entregas de estudiantes)
    // PROBLEMA SOLUCIONADO: El contador mostraba "3 comentarios" cuando debía mostrar "1 comentario"
    // porque estaba contando también las entregas de estudiantes como comentarios
    const getTeacherCommentsCount = (taskId: string) => {
      return comments.filter(comment => 
        comment.taskId === taskId && 
        !comment.isSubmission // Excluir entregas de estudiantes (isSubmission: true)
      ).length;
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        case 'delivered': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
        case 'submitted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'reviewed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'finished': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      }
    };

    const getTaskTypeColor = (taskType: string) => {
      switch (taskType) {
        case 'evaluacion': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
        case 'tarea': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Formato de fecha en una sola línea para tablas compactas
    const formatDateOneLine = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date);
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    };

    // File handling functions
    const handleFileUpload = async (files: FileList | null, isForTask: boolean = false) => {
      if (!files || files.length === 0) return;

      const newFiles: TaskFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: translate('error'),
            description: translate('fileTooLarge', { name: file.name }),
            variant: 'destructive'
          });
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        
        const taskFile: TaskFile = {
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: base64,
          uploadedBy: user?.username || '',
          uploadedAt: new Date().toISOString()
        };

        newFiles.push(taskFile);
      }

      if (isForTask) {
        setTaskAttachments(prev => [...prev, ...newFiles]);
      } else {
        setCommentAttachments(prev => [...prev, ...newFiles]);
      }

      toast({
        title: translate('filesUploaded'),
        description: translate('filesUploadedDesc', { count: newFiles.length.toString() }),
      });
    };

    const removeFile = (fileId: string, isForTask: boolean = false) => {
      if (isForTask) {
        setTaskAttachments(prev => prev.filter(f => f.id !== fileId));
      } else {
        setCommentAttachments(prev => prev.filter(f => f.id !== fileId));
      }
    };

    const downloadFile = (file: TaskFile) => {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Check if student has already submitted this task
    const hasStudentSubmitted = (taskId: string, studentId: string) => {
      console.log(`🔍 hasStudentSubmitted: Verificando taskId=${taskId}, studentId=${studentId}`);
      
      // Check if student has submitted using studentId
      let hasSubmission = comments.some(comment => 
        comment.taskId === taskId && 
        comment.studentId === studentId && 
        comment.isSubmission
      );
      
      console.log(`📝 Búsqueda por studentId: ${hasSubmission ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
      
      // If not found, try with studentName fallback (for legacy compatibility)
      if (!hasSubmission) {
        const usersText = localStorage.getItem('smart-student-users');
        const allUsers: ExtendedUser[] = usersText ? JSON.parse(usersText) : [];
        const studentData = allUsers.find(u => u.id === studentId);
        if (studentData) {
          hasSubmission = comments.some(comment => 
            comment.taskId === taskId && 
            (comment.studentName === studentData.displayName || comment.studentName === studentData.username) &&
            comment.isSubmission
          );
          console.log(`📝 Búsqueda por studentName (${studentData.displayName}/${studentData.username}): ${hasSubmission ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
        }
      }
      
      // Debug: mostrar todas las submissions para esta tarea
      const taskSubmissions = comments.filter(c => c.taskId === taskId && c.isSubmission);
      console.log(`📋 Todas las entregas para taskId=${taskId}:`, taskSubmissions.map(c => ({
        id: c.id,
        studentId: c.studentId,
        studentName: c.studentName,
        timestamp: c.timestamp
      })));
      
      console.log(`🎯 Resultado final para studentId=${studentId}: ${hasSubmission ? 'TIENE ENTREGA' : 'NO TIENE ENTREGA'}`);
      return hasSubmission;
    };

    // Función temporal para debug de Felipe específicamente
    const checkFelipeSubmission = (taskId: string) => {
      console.log('🔍 FELIPE SPECIAL CHECK for task:', taskId);
      
      // Buscar por todos los posibles nombres que podría tener Felipe
      const felipeSubmissions = comments.filter(c => 
        c.taskId === taskId && 
        c.isSubmission && 
        (
          c.studentName === 'Felipe Estudiante' ||
          c.studentName?.toLowerCase().includes('felipe') ||
          c.studentId === 'felipe-id' // Legacy compatibility
        )
      );
      
      console.log('Felipe submissions found:', felipeSubmissions.length, felipeSubmissions.map(s => ({
        studentId: s.studentId,
        name: s.studentName,
        id: s.id
      })));
      
      return felipeSubmissions.length > 0 ? felipeSubmissions[0] : undefined;
    };
    
    // Función específica para encontrar entregas de María
    const checkMariaSubmission = (taskId: string) => {
      console.log('🔍 MARIA SPECIAL CHECK for task:', taskId);
      
      // Buscar por todos los posibles nombres que podría tener María
      const mariaSubmissions = comments.filter(c => 
        c.taskId === taskId && 
        c.isSubmission && 
        (
          c.studentName === 'Maria Estudiante' ||
          c.studentName?.toLowerCase().includes('maria') ||
          c.studentId === 'maria-id' // Legacy compatibility
        )
      );
      
      console.log('Maria submissions found:', mariaSubmissions.length, mariaSubmissions.map(s => ({
        studentId: s.studentId,
        name: s.studentName,
        id: s.id,
        comment: s.comment.substring(0, 30) + '...'
      })));
      
      return mariaSubmissions.length > 0 ? mariaSubmissions[0] : undefined;
    };

    // Get individual student status for a task - UPDATED para nuevos estados
    const getStudentTaskStatus = (taskId: string, studentId: string) => { // Changed studentUsername to studentId
      // console.log(`🔍 getStudentTaskStatus called with:`, { taskId, studentId });

      const submission = getStudentSubmission(taskId, studentId); // Use the updated getStudentSubmission

      // console.log(`🔍 Search results for student ${studentId} in task ${taskId}:`, {
      //   foundSubmission: submission ? {
      //     id: submission.id,
      //     timestamp: submission.timestamp,
      //     studentId: submission.studentId,
      //     studentName: submission.studentName,
      //     hasGrade: submission.grade !== undefined,
      //     hasTeacherComment: !!submission.teacherComment,
      //     reviewedAt: submission.reviewedAt
      //   } : null
      // });
      
      if (!submission) {
        // console.log(`❌ No submission found for ${studentId} - returning 'pending'`);
        return 'pending';
      }
      
      // Si tiene calificación o comentario del profesor Y fecha de revisión, está finalizado
      if (submission.reviewedAt && (submission.grade !== undefined || submission.teacherComment)) {
        // console.log(`✅ Submission finalized for ${studentId} - returning 'reviewed'`);
        return 'reviewed'; // Finalizado
      }
      
      // Si tiene entrega pero no revisión, está en revisión
      // console.log(`📋 Submission under review for ${studentId} - returning 'delivered'`);
      return 'delivered'; // En Revisión (o 'submitted' if that's preferred before grading)
    };

    // Function for teacher to grade a submission - UPDATED para estado Finalizado
    const handleGradeSubmission = (submissionId: string, grade: number, teacherComment: string) => {
      const updatedComments = comments.map(comment => 
        comment.id === submissionId 
          ? { 
              ...comment, 
              grade, 
              teacherComment, 
              reviewedAt: new Date().toISOString() 
            }
          : comment
      );
      saveComments(updatedComments);
      // Forzar recarga de comentarios desde localStorage para refrescar panel
      loadComments();

      // Verificar si todas las entregas de esta tarea están revisadas
      if (selectedTask) {
        const allStudents = getAssignedStudentsForTask(selectedTask); // Returns {id, username, displayName}
        
        // ✅ LÓGICA CORREGIDA: Verificar que TODOS los estudiantes hayan entregado Y sean calificados
        const allReviewed = allStudents.every(student => {
          const studentSubmission = getStudentSubmission(selectedTask.id, student.id);
          
          // Para que esté "completamente revisado" debe cumplir TODAS estas condiciones:
          // 1. El estudiante debe haber hecho una entrega (isSubmission = true)
          // 2. La entrega debe tener calificación (grade !== undefined)
          // 3. La entrega debe estar marcada como revisada (reviewedAt)
          
          if (!studentSubmission || !studentSubmission.isSubmission) {
            console.log(`❌ Student ${student.displayName} has not submitted yet`);
            return false; // No ha entregado
          }
          
          const hasGrade = studentSubmission.grade !== undefined;
          const isReviewed = studentSubmission.reviewedAt || studentSubmission.id === submissionId;
          
          if (!hasGrade) {
            console.log(`❌ Student ${student.displayName} submission not graded yet`);
            return false; // No tiene calificación
          }
          
          if (!isReviewed) {
            console.log(`❌ Student ${student.displayName} submission not reviewed yet`);
            return false; // No está revisado
          }
          
          console.log(`✅ Student ${student.displayName} submission is complete: delivered + graded + reviewed`);
          return true; // Entregado, calificado y revisado
        });

        console.log(`📊 Task completion check: ${allStudents.length} students total, all reviewed: ${allReviewed}`);

        // Si todos están revisados, cambiar el estado de la tarea del profesor a 'reviewed' (Finalizada)
        if (allReviewed) {
          const updatedTasks = tasks.map(task => 
            task.id === selectedTask.id 
              ? { ...task, status: 'reviewed' as const } // Mark task as reviewed
              : task
          );
          saveTasks(updatedTasks);
          
          // 🔔 ACTUALIZAR NOTIFICACIÓN: Cambiar de "Tarea Pendiente" a "Tarea Finalizada"
          TaskNotificationManager.updateTaskStatusNotification(
            selectedTask.id,
            'reviewed',
            user?.id || ''
          );
          
          // 🧹 NUEVO: Eliminar todas las notificaciones de esta tarea al finalizar completamente
          TaskNotificationManager.removeNotificationsForTask(selectedTask.id, [
            'pending_grading', 
            'task_submission', 
            'task_completed'
          ]);
          
          console.log('✅ Task marked as FINALIZED - all students have delivered AND been graded');
          console.log('🧹 All task notifications cleaned up for finalized task');
        } else {
          console.log('⏳ Task remains PENDING - not all students have delivered or been graded');
          
          // 🧹 NUEVO: Eliminar notificaciones específicas del estudiante recién calificado
          TaskNotificationManager.removeNotificationsForTask(selectedTask.id, ['task_submission']);
          
          // 🎯 NUEVO: Eliminar notificaciones de 'task_completed' cuando el profesor califica
          TaskNotificationManager.removeTaskCompletedNotifications(selectedTask.id);
          
          // 🔥 NUEVO: Disparar evento para actualizar panel de notificaciones
          window.dispatchEvent(new CustomEvent('taskGraded', {
            detail: { taskId: selectedTask.id, studentUsername: submission?.studentUsername }
          }));
        }
      }

      // Crear notificación para el estudiante
      const submission = comments.find(c => c.id === submissionId); // This submission has studentId
      if (submission && selectedTask && submission.studentId) {
        const notification = {
          id: `notif_${Date.now()}`,
          type: 'task_graded',
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          studentId: submission.studentId,
          teacherName: user?.displayName || user?.username,
          message: `Tu tarea "${selectedTask.title}" ha sido calificada`,
          timestamp: new Date().toISOString(),
          read: false,
          grade: grade,
          course: selectedTask.course, // This is courseId
          subject: selectedTask.subject
        };

        // Guardar notificación
        const existingNotifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
        const updatedNotifications = [...existingNotifications, notification];
        localStorage.setItem('smart-student-notifications', JSON.stringify(updatedNotifications));
      }

      toast({
        title: 'Entrega Calificada',
        description: `La entrega ha sido calificada con ${grade} puntos.`,
      });
    };

    // Open grade dialog
    const openGradeDialog = (taskId: string, studentId: string) => { // Changed studentUsername to studentId
      // console.log('🎯 Opening grade dialog for:', { taskId, studentId });
      
      const submission = getStudentSubmission(taskId, studentId); // Use updated getStudentSubmission
      
      if (!submission) {
        const usersText = localStorage.getItem('smart-student-users');
        const allUsers: ExtendedUser[] = usersText ? JSON.parse(usersText) : [];
        const studentData = allUsers.find(u => u.id === studentId); // Fetch student for name
        const studentDisplayName = studentData?.displayName || `ID ${studentId}`;
        const errorMessage = `No se encontró una entrega para el estudiante "${studentDisplayName}" en esta tarea.`;
        
        // console.error('❌ No submission found for openGradeDialog:', { taskId, studentId });
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }
      
      // console.log(`✅ Submission found for studentId "${studentId}":`, submission);
      
      setSubmissionToGrade(submission); // submission already contains grade and teacherComment if they exist
      setGradeForm({
        grade: submission.grade?.toString() || '',
        teacherComment: submission.teacherComment || ''
      });
      setShowGradeDialog(true);
    };

    // Función para guardar la calificación
    const saveGrade = () => {
      if (!submissionToGrade) return;
      
      const grade = parseInt(gradeForm.grade);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        alert('Por favor ingresa una calificación válida entre 0 y 100');
        return;
      }
      
      if (!gradeForm.teacherComment.trim()) {
        const confirmSave = confirm('¿Estás seguro de guardar sin comentario adicional?');
        if (!confirmSave) return;
      }
      
      // Actualizar el comentario existente con la calificación
      const updatedComments = comments.map(comment => {
        if (comment.id === submissionToGrade.id) {
          return {
            ...comment,
            grade: grade,
            teacherComment: gradeForm.teacherComment.trim(),
            reviewedAt: new Date().toISOString()
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
      
      // Cerrar el diálogo
      setShowGradeDialog(false);
      setSubmissionToGrade(null);
      setGradeForm({ grade: '', teacherComment: '' });
      
      console.log('✅ Grade saved successfully');
    };

    // Función para intentar cerrar el diálogo
    const handleCloseGradeDialog = () => {
      if (!submissionToGrade) {
        setShowGradeDialog(false);
        return;
      }
      
      const hasGrade = gradeForm.grade.trim() !== '';
      const hasComment = gradeForm.teacherComment.trim() !== '';
      const wasAlreadyGraded = submissionToGrade.grade !== undefined;
      
      if (!hasGrade && !hasComment && !wasAlreadyGraded) {
        alert('Debes calificar y/o agregar un comentario antes de cerrar.');
        return;
      }
      
      if ((hasGrade || hasComment) && (!wasAlreadyGraded || gradeForm.grade !== submissionToGrade.grade?.toString() || gradeForm.teacherComment !== submissionToGrade.teacherComment)) {
        const confirmClose = confirm('Tienes cambios sin guardar. ¿Estás seguro de cerrar sin guardar?');
        if (!confirmClose) return;
      }
      
      setShowGradeDialog(false);
      setSubmissionToGrade(null);
      setGradeForm({ grade: '', teacherComment: '' });
    };

    // Submit grade
    // Delete student submission to allow re-submission
    const handleDeleteSubmission = (commentId: string) => {
      const commentToDelete = comments.find(c => c.id === commentId);
      if (!commentToDelete || !selectedTask) return;

      // Verificar si la tarea ya está calificada
      if (commentToDelete.grade !== undefined || commentToDelete.reviewedAt) {
        toast({
          title: 'No se puede eliminar',
          description: 'Esta tarea ya ha sido calificada por el profesor y no se puede eliminar.',
          variant: 'destructive'
        });
        return;
      }

      // Show confirmation dialog
      if (!window.confirm('¿Estás seguro de que quieres eliminar tu entrega? Esta acción no se puede deshacer.')) {
        return;
      }

      // Remove the submission comment
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      saveComments(updatedComments);

      // Obtener todos los estudiantes asignados a la tarea
      const assignedStudents = getAssignedStudentsForTask(selectedTask);
      
      // Verificar si ahora todos los estudiantes han entregado la tarea
      const allStudentsSubmitted = assignedStudents.length > 0 && 
        assignedStudents.every(student => 
          student.id !== commentToDelete.studentId && // Excluimos el que acabamos de eliminar
          hasStudentSubmitted(selectedTask.id, student.id)
        );
      
      // Actualizar el estado a "pendiente" si ya no todos han entregado
      if (!allStudentsSubmitted) {
        const updatedTasks = tasks.map(task => 
          task.id === selectedTask.id 
            ? { ...task, status: 'pending' as const }
            : task
        );
        saveTasks(updatedTasks);
      }

      toast({
        title: 'Entrega eliminada',
        description: 'Tu entrega ha sido eliminada exitosamente.',
      });
    };

    const filteredTasks = getFilteredTasks();

    // Función para abrir el diálogo de revisión mejorado
    const handleReviewSubmission = (studentId: string, taskId: string, tryDisplayName?: boolean) => {
      console.log(`🔍 handleReviewSubmission called with studentId: "${studentId}", taskId: "${taskId}"`);
      
      let submission = getStudentSubmission(taskId, studentId);
      
      // Si no se encuentra, intentar con el displayName
      if (!submission && tryDisplayName) {
        const student = getAssignedStudentsForTask(selectedTask).find(s => s.id === studentId || s.username === studentId);
        if (student && student.displayName) {
          console.log(`🔄 Trying with displayName: "${student.displayName}"`);
          submission = getStudentSubmission(taskId, student.displayName);
        }
        
        // Si aún no se encuentra, intentar buscar por studentName en los comentarios
        if (!submission) {
          console.log(`🔄 Trying with studentName search`);
          submission = comments.find(c =>
            c.taskId === taskId &&
            c.isSubmission &&
            (c.studentName === studentId || 
            c.studentName === student?.displayName ||
            c.studentId === studentId ||
            c.studentUsername === studentId)
          );
        }
      }
      
      if (!submission) {
        console.log(`❌ No submission found for student: "${studentId}"`);
        console.log(`Available submissions for task "${taskId}":`, comments.filter(c => c.taskId === taskId && c.isSubmission));
        toast({
          title: 'Error',
          description: 'No se encontró una entrega para este estudiante.',
          variant: 'destructive'
        });
        return;
      }
      
      const student = getAssignedStudentsForTask(selectedTask).find(s => s.id === studentId || s.username === studentId);
      console.log(`✅ Found submission for student: "${studentId}"`, submission);
      
      setCurrentReview({
        studentId,
        studentDisplayName: student?.displayName || studentId,
        taskId,
        submission,
        grade: submission.grade || 0,
        feedback: submission.teacherComment || '',
        isGraded: submission.grade !== undefined
      });
      setShowReviewDialog(true);
    };

    // Función para abrir el diálogo de revisión de evaluación
    const handleViewEvaluationDetail = async (studentId: string, taskId: string) => {
      console.log('🔍 handleViewEvaluationDetail called with:', { studentId, taskId });
      
      const evaluationResult = getStudentEvaluationResult(taskId, studentId);
      console.log('🔍 Evaluation result found:', !!evaluationResult);
      
      if (!evaluationResult) {
        toast({
          title: translate('error'),
          description: 'No se encontró el resultado de la evaluación',
          variant: 'destructive'
        });
        return;
      }

      // Encontrar la tarea correspondiente para obtener el tema
      const task = tasks.find(t => t.id === taskId);
      console.log('🔍 Task found for translation:', !!task, task?.topic);
      
      if (task) {
        // Traducir las preguntas dinámicamente según el idioma actual
        console.log('🔄 About to translate evaluation result...');
        const translatedResult = await translateEvaluationResult(evaluationResult, task);
        console.log('🔄 Translation completed, setting result');
        setSelectedEvaluationResult(translatedResult);
      } else {
        console.log('⚠️ No task found, using original result');
        setSelectedEvaluationResult(evaluationResult);
      }
      setShowEvaluationReviewDialog(true);
    };

    // Función para guardar la revisión y calificación
    const saveReviewAndGrade = () => {
      if (!currentReview.submission || !selectedTask) return;
      
      if (currentReview.grade < 0 || currentReview.grade > 100) {
        toast({
          title: 'Error',
          description: 'La calificación debe estar entre 0 y 100.',
          variant: 'destructive'
        });
        return;
      }
      
      // Actualizar el comentario con la calificación y feedback
      const updatedComments = comments.map(comment => {
        if (comment.id === currentReview.submission!.id) {
          return {
            ...comment,
            grade: currentReview.grade,
            teacherComment: currentReview.feedback,
            reviewedAt: new Date().toISOString(),
            reviewed: true
          };
        }
        return comment;
      });
      
      saveComments(updatedComments);
      
      // Verificar si todas las entregas están revisadas
      const allSubmissionsReviewed = getAssignedStudentsForTask(selectedTask).every(student => {
        const studentSubmission = getStudentSubmission(selectedTask.id, student.id);
        return !!studentSubmission?.reviewedAt || student.id === currentReview.studentId;
      });
      
      if (allSubmissionsReviewed) {
        const updatedTasks = tasks.map(task => 
          task.id === selectedTask.id 
            ? { ...task, status: 'reviewed' as const }
            : task
        );
        saveTasks(updatedTasks);
      }

      // Crear notificación para el estudiante
      const notification = {
        id: `notif_${Date.now()}`,
        type: 'task_graded',
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        studentId: currentReview.studentId, // Use studentId
        teacherName: user?.displayName || user?.username, // Keep for display
        // teacherId: user?.id, // Optionally add teacherId
        message: `Tu tarea "${selectedTask.title}" ha sido calificada con ${currentReview.grade}/100`,
        timestamp: new Date().toISOString(),
        read: false,
        grade: currentReview.grade,
        course: selectedTask.course, // This is courseId
        subject: selectedTask.subject
      };

      const existingNotifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
      const updatedNotifications = [...existingNotifications, notification];
      localStorage.setItem('smart-student-notifications', JSON.stringify(updatedNotifications));
      
      toast({
        title: 'Tarea Calificada',
        description: `La tarea ha sido calificada con ${currentReview.grade}/100.`,
      });
      
      setShowReviewDialog(false);
    };

    // Función auxiliar para obtener el nombre del estudiante por username
    const getStudentNameByUsername = (username: string) => {
      const student = getStudentsForCourse(selectedTask?.course || '').find(
        s => s.username === username
      );
      return student?.displayName || username;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ClipboardList className="w-8 h-8 mr-3 text-orange-500" />
              {translate('tasksPageTitle')}
            </h1>
            <p className="text-muted-foreground">
              {user?.role === 'teacher' 
                ? translate('tasksPageSubTeacher')
                : translate('tasksPageSubStudent')
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {user?.role === 'teacher' && (
              <>
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 ${viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'hover:bg-orange-100 hover:text-orange-700'}`}
                  >
                    {translate('listView')}
                  </Button>
                  <Button
                    variant={viewMode === 'course' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('course')}
                    className={`px-3 py-1 ${viewMode === 'course' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'hover:bg-orange-100 hover:text-orange-700'}`}
                  >
                    {translate('courseView')}
                  </Button>
                </div>

                {/* Course Filter */}
                <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
                  <SelectTrigger className="w-48 select-orange-hover-trigger">
                    <SelectValue placeholder={translate('filterByCourse')} />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    <SelectItem value="all" className="hover:bg-orange-100 hover:text-orange-700 individual-option select-item-spaced">{translate('allCourses')}</SelectItem>
                    {getAvailableCoursesWithNames().map(course => (
                      <SelectItem key={`main-header-course-filter-${course.id}`} value={course.id} className="hover:bg-orange-100 hover:text-orange-700 individual-option select-item-spaced">{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => {
                    // Establecer fecha de vencimiento por defecto a 7 días en el futuro
                    const defaultDueDate = new Date();
                    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
                    const defaultDueDateString = defaultDueDate.toISOString().slice(0, 16);
                    
                    // Inicializar el formulario con la fecha por defecto
                    setFormData(prevData => ({
                      ...prevData,
                      dueDate: defaultDueDateString
                    }));
                    
                    setShowCreateDialog(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {translate('newTask')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tasks Display */}
        <div className="space-y-6">
          {user?.role === 'teacher' && viewMode === 'course' ? (
            /* Course View for Teachers */
            Object.keys(getTasksByCourse()).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {translate('tasksEmptyTeacher')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(getTasksByCourse()).map(([course, courseTasks]) => {
                const stats = getCourseStats()[course];
                return (
                  <Card key={course} className="card-orange-shadow border-l-4 border-l-indigo-500">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            {getCourseNameById(course)}
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                              {translate('totalTasks')}: {stats.total}
                            </Badge>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                              {translate('statusSubmitted')}: {stats.submitted}
                            </Badge>
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                              {translate('statusPending')}: {stats.pending}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {courseTasks.map(task => (
                          <div key={`pending-task-${task.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{task.title}</h4>
                                <Badge variant="outline" className={getTaskTypeColor(task.taskType || 'tarea')}>
                                  {task.taskType === 'evaluacion' ? translate('evaluation') : translate('task')}
                                </Badge>
                                <Badge className={getPriorityColor(task.priority)}>
                                  {task.priority === 'high' ? translate('priorityHigh') : 
                                  task.priority === 'medium' ? translate('priorityMedium') : translate('priorityLow')}
                                </Badge>
                                <Badge className={getTaskStatusForCurrentUser(task).statusClass}>
                                  {getTaskStatusForCurrentUser(task).statusText}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {translate('duePrefix')} {formatDateOneLine(task.dueDate)}
                                </span>
                                <span className="flex items-center">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {getTeacherCommentsCount(task.id)} {translate('commentsCount')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('🔄 Opening task dialog from course view - reloading comments');
                                  loadComments(); // Recargar comentarios antes de abrir
                                  
                                  // Si es una evaluación, verificar su estado antes de abrir
                                  if (task.taskType === 'evaluacion') {
                                    checkAndUpdateEvaluationStatus(task.id);
                                  }
                                  
                                  setSelectedTask(task);
                                  setShowTaskDialog(true);
                                }}
                                title={translate('viewTask')}
                                className="action-button"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                                className="action-button"
                                title={translate('editTask')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTask(task)}
                                className="action-button action-button-delete"
                                title={translate('deleteTask')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )
          ) : (
            /* List View (for both teachers and students) */
            <div className="grid gap-4">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {user?.role === 'teacher' 
                        ? translate('tasksEmptyTeacher')
                        : translate('tasksEmptyStudent')
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map(task => {
                  // Para estudiantes, calcular su estado individual
                  const studentStatus = user?.role === 'student' 
                    ? getStudentTaskStatus(task.id, user.username || '')
                    : task.status;
                  
                  return (
                  <Card key={`active-task-${task.id}`} className="card-orange-shadow hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{task.subject}</Badge>
                            <Badge variant="outline" className={getTaskTypeColor(task.taskType || 'tarea')}>
                              {task.taskType === 'evaluacion' ? translate('evaluation') : translate('task')}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority === 'high' ? translate('priorityHigh') : task.priority === 'medium' ? translate('priorityMedium') : translate('priorityLow')}
                            </Badge>
                            {/* Badge de estado y badge de porcentaje en burbujas separadas para estudiante */}
                            {user?.role === 'student' ? (() => {
                              // Verificar si es evaluación y está completada
                              if (task.taskType === 'evaluacion') {
                                const evaluationResult = evaluationResults[task.id];
                                if (evaluationResult) {
                                  return (
                                    <>
                                      <Badge className={getStatusColor('submitted') + ' font-bold mr-1'}>
                                        Finalizado
                                      </Badge>
                                      <Badge className={evaluationResult.percentage >= 70 ? 'bg-green-100 text-green-700 font-bold ml-2' : 'bg-red-100 text-red-700 font-bold ml-2'}>
                                        {evaluationResult.percentage}%
                                      </Badge>
                                    </>
                                  );
                                } else {
                                  return (
                                    <Badge className={getStatusColor('pending')}>
                                      {translate('statusPending')}
                                    </Badge>
                                  );
                                }
                              }
                              
                              // Para tareas normales, lógica original
                              const mySubmission = comments.find(c => c.taskId === task.id && c.studentId === user.id && c.isSubmission);
                              if (!mySubmission) {
                                // Pendiente: igual que en la vista detalle
                                return (
                                  <Badge className={getStatusColor('pending')}>
                                    {translate('statusPending')}
                                  </Badge>
                                );
                              } else if (mySubmission && (mySubmission.grade === undefined || mySubmission.grade === null)) {
                                // En Revisión: amarillo (forzado)
                                return (
                                  <Badge className="bg-yellow-100 text-yellow-800 font-bold">
                                    {translate('underReview')}
                                  </Badge>
                                );
                              } else if (mySubmission && typeof mySubmission.grade === 'number') {
                                // Finalizado: igual que en la vista detalle (usamos submitted/verde)
                                return (
                                  <>
                                    <Badge className={getStatusColor('submitted') + ' font-bold mr-1'}>
                                      {translate('statusFinished')}
                                    </Badge>
                                    <Badge className={mySubmission.grade >= 70 ? 'bg-green-100 text-green-700 font-bold ml-2' : 'bg-red-100 text-red-700 font-bold ml-2'}>
                                      {mySubmission.grade}%
                                    </Badge>
                                  </>
                                );
                              }
                            })() : (
                              <Badge className={getStatusColor(task.status)}>
                                {task.status === 'pending' ? translate('statusPending') : 
                                  task.status === 'delivered' ? translate('underReview') :
                                  task.status === 'submitted' ? translate('underReview') : translate('statusFinished')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log('🔄 Opening task dialog - reloading comments');
                              loadComments(); // Recargar comentarios antes de abrir
                              
                              // Si es una evaluación, verificar su estado antes de abrir
                              if (task.taskType === 'evaluacion') {
                                checkAndUpdateEvaluationStatus(task.id);
                              }
                              
                              setSelectedTask(task);
                              setShowTaskDialog(true);
                            }}
                            className="action-button"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user?.role === 'teacher' && task.assignedById === user.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                                className="action-button"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTask(task)}
                                className="action-button action-button-delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {translate('duePrefix')} {formatDateOneLine(task.dueDate)}
                          </span>
                          <span className="flex items-center">
                            {task.assignedTo === 'course' ? (
                              <>
                                <Users className="w-3 h-3 mr-1" />
                                {getCourseNameById(task.course)}
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 mr-1" />
                                {task.assignedStudentIds?.length} {translate('studentsCount')}
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {getTeacherCommentsCount(task.id)} {translate('commentsCount')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Create Task Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{formData.taskType === 'evaluacion' ? 'Crear Nueva Evaluación' : translate('createNewTask')}</DialogTitle>
              <DialogDescription>
                {translate('createTaskDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">{translate('taskTitle')} <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder={translate('taskTitlePlaceholder')}
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">{translate('taskDescription')} <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder={translate('taskDescriptionPlaceholder')}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">{translate('taskCourse')} <span className="text-red-500">*</span></Label>
                <Select value={formData.course} onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}>
                  <SelectTrigger className={`${formData.taskType === 'evaluacion' ? 'select-purple-hover-trigger' : 'select-orange-hover-trigger'} col-span-3`}>
                    <SelectValue placeholder={translate('selectCourse')} />
                  </SelectTrigger>
                  <SelectContent className={formData.taskType === 'evaluacion' ? 'select-purple-hover' : 'select-orange-hover'}>
                    {getAvailableCoursesWithNames().map(course => (
                      <SelectItem key={`edit-task-course-${course.id}`} value={course.id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">{translate('taskSubject')} <span className="text-red-500">*</span></Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))} required>
                  <SelectTrigger className={`${formData.taskType === 'evaluacion' ? 'select-purple-hover-trigger' : 'select-orange-hover-trigger'} col-span-3`}>
                    <SelectValue placeholder={translate('selectSubject')} />
                  </SelectTrigger>
                  <SelectContent className={formData.taskType === 'evaluacion' ? 'select-purple-hover' : 'select-orange-hover'}>
                    {getAvailableSubjects().map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{translate('assignTo')}</Label>
                <Select value={formData.assignedTo} onValueChange={(value: 'course' | 'student') => setFormData(prev => ({ ...prev, assignedTo: value, assignedStudentIds: [] }))}>
                  <SelectTrigger className={`${formData.taskType === 'evaluacion' ? 'select-purple-hover-trigger' : 'select-orange-hover-trigger'} col-span-3`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={formData.taskType === 'evaluacion' ? 'select-purple-hover' : 'select-orange-hover'}>
                    <SelectItem value="course">{translate('assignToCourse')}</SelectItem>
                    <SelectItem value="student">{translate('assignToStudents')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.assignedTo === 'student' && formData.course && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{translate('assignToStudents')}</Label>
                  <div className="col-span-3">
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                      {getStudentsForCourse(formData.course).length > 0 ? (
                        getStudentsForCourse(formData.course).map((student: { id: string, username: string, displayName: string }) => (
                          <div key={student.id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`create-student-${student.username}`}
                              checked={formData.assignedStudentIds?.includes(student.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignedStudentIds: [...(prev.assignedStudentIds || []), student.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignedStudentIds: prev.assignedStudentIds?.filter((s: string) => s !== student.id) || []
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`student-${student.username}`} className="cursor-pointer">
                              {student.displayName}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground py-2 text-center">
                          {translate('noEvaluationsSubtext') || "No hay estudiantes disponibles para este curso"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">{translate('dueDate')} <span className="text-red-500">*</span></Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{translate('priority')}</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="select-orange-hover-trigger col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    <SelectItem value="low">{translate('priorityLow')}</SelectItem>
                    <SelectItem value="medium">{translate('priorityMedium')}</SelectItem>
                    <SelectItem value="high">{translate('priorityHigh')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{translate('taskType')}</Label>
                <Select value={formData.taskType} onValueChange={(value: 'tarea' | 'evaluacion') => setFormData(prev => ({ ...prev, taskType: value }))}>
                  <SelectTrigger className="select-orange-hover-trigger col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    <SelectItem value="tarea">{translate('taskTypeAssignment')}</SelectItem>
                    <SelectItem value="evaluacion">{translate('taskTypeEvaluation')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Evaluation specific fields */}
              {formData.taskType === 'evaluacion' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="topic" className="text-right">Tema <span className="text-red-500">*</span></Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      className="col-span-3"
                      placeholder="Introduce el tema de la evaluación"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="numQuestions" className="text-right">Cantidad de Preguntas <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.numQuestions?.toString() || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, numQuestions: parseInt(value) }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona la cantidad de preguntas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 preguntas</SelectItem>
                        <SelectItem value="10">10 preguntas</SelectItem>
                        <SelectItem value="15">15 preguntas</SelectItem>
                        <SelectItem value="20">20 preguntas</SelectItem>
                        <SelectItem value="25">25 preguntas</SelectItem>
                        <SelectItem value="30">30 preguntas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeLimit" className="text-right">Tiempo (minutos) <span className="text-red-500">*</span></Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={formData.timeLimit || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                      className="col-span-3"
                      placeholder="Ej: 45"
                      min="1"
                      max="180"
                      required
                    />
                  </div>
                </>
              )}

              {/* File Upload Section for Create Task - Only for regular tasks, not evaluations */}
              {formData.taskType !== 'evaluacion' && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">{translate('attachments')}</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files, true)}
                        className="hidden"
                        id="task-file-upload"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('task-file-upload')?.click()}
                        className={`w-full ${(formData.taskType as string) === 'evaluacion' 
                          ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700'
                          : 'bg-orange-100 hover:bg-orange-500 hover:text-white text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-600 dark:hover:text-white dark:text-orange-400 dark:border-orange-700'
                        }`}
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        {translate('attachFile')}
                      </Button>
                    </div>
                    
                    {/* Display uploaded files */}
                    {taskAttachments.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {taskAttachments.map((file) => (
                          <div key={`new-task-file-${file.id}`} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate" title={file.name}>{file.name}</span>
                              <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id, true)}
                              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} 
                className={formData.taskType === 'evaluacion' ? 'cancel-button-evaluation' : 'cancel-button'}>
                {translate('cancel')}
              </Button>
              <Button 
                onClick={handleCreateTask}
                className={`${formData.taskType === 'evaluacion' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-orange-500 hover:bg-orange-600'} text-white`}
              >
                {formData.taskType === 'evaluacion' ? translate('createEvaluation') : translate('createTask')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        <Dialog open={showTaskDialog} onOpenChange={(open) => {
          setShowTaskDialog(open);
          if (!open) {
            // Reset states when closing dialog
            setNewComment('');
            setIsSubmission(false);
            setCommentAttachments([]);
          } else {
            // Reload comments when opening dialog to ensure fresh data
            loadComments();
            
            // Log debug information when opening task dialog
            console.log('🔍 TASK DIALOG OPENED FOR:', selectedTask);
            
            // NOTA: Código de demo/debug deshabilitado para comportamiento correcto
            // Solo deben aparecer entregas reales de estudiantes
            /*
            // Forzar la creación de una entrega falsa para María si no existe
            if (selectedTask) {
              const mariaExists = comments.some(c => 
                c.taskId === selectedTask.id && 
                c.isSubmission && 
                (c.studentName?.toLowerCase().includes('maria') || c.studentId?.toLowerCase().includes('maria'))
              );
              
              if (!mariaExists) {
                console.log('🚨 Creating fake submission for Maria...');
                const mariaSubmission: TaskComment = {
                  id: `fake_maria_submission_${Date.now()}`,
                  taskId: selectedTask.id,
                  studentId: 'maria',
                  studentName: 'Maria Estudiante',
                  comment: 'Entrega de María (generada automáticamente)',
                  timestamp: new Date().toISOString(),
                  isSubmission: true,
                  attachments: []
                };
                
                const updatedComments = [...comments, mariaSubmission];
                saveComments(updatedComments);
                loadComments();
              }
            }
            */
            if (selectedTask) {
              console.log(`🔍 Opening task dialog for "${selectedTask.title}":`, {
                taskId: selectedTask.id,
                totalComments: comments.length,
                submissionComments: comments.filter(c => c.isSubmission),
                allComments: comments
              });
            }
          }
        }}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{selectedTask?.title}</span>
                <Badge variant="outline" className={getTaskTypeColor(selectedTask?.taskType || 'tarea')}>
                  {selectedTask?.taskType === 'evaluacion' ? translate('evaluation') : translate('task')}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedTask?.assignedByName} • {getCourseNameById(selectedTask?.course || '')} • {selectedTask?.subject}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTask && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{translate('taskDescriptionDetail')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>

                {/* Task Attachments */}
                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{translate('attachments')}</h4>
                    <div className="space-y-2">
                      {selectedTask.attachments.map((file) => (
                        <div key={`selected-task-file-${file.id}`} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate" title={file.name}>{file.name}</span>
                            <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(file)}
                            className="flex-shrink-0 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Estado y badge de porcentaje para el estudiante, lógica unificada con la lista */}
                <div className="flex space-x-4 text-sm">
                  <span className="whitespace-nowrap font-medium">
                    <strong>{translate('taskDueDateLabel')}</strong> <span className="single-line-date text-base">{formatDateOneLine(selectedTask.dueDate)}</span>
                  </span>
                  <span>
                    <strong>{translate('taskStatusLabel')}</strong>
                    {user?.role === 'student' ? (() => {
                      // Verificar si es evaluación y está completada
                      if (selectedTask.taskType === 'evaluacion') {
                        const evaluationResult = evaluationResults[selectedTask.id];
                        if (evaluationResult) {
                          return (
                            <>
                              <Badge className={getStatusColor('submitted') + ' font-bold ml-1'}>
                                Finalizado
                              </Badge>
                              <Badge className={`ml-2 ${evaluationResult.percentage >= 70 ? 'bg-green-100 text-green-700 font-bold' : 'bg-red-100 text-red-700 font-bold'}`}>
                                {evaluationResult.percentage}%
                              </Badge>
                            </>
                          );
                        } else {
                          return (
                            <Badge className={getStatusColor('pending') + ' ml-1'}>
                              {translate('statusPending')}
                            </Badge>
                          );
                        }
                      }
                      
                      // Para tareas normales, lógica original
                      const mySubmission = comments.find(c => c.taskId === selectedTask.id && c.studentId === user.id && c.isSubmission);
                      if (!mySubmission) {
                        // Pendiente
                        return (
                          <Badge className={getStatusColor('pending') + ' ml-1'}>
                            {translate('statusPending')}
                          </Badge>
                        );
                      } else if (mySubmission && (mySubmission.grade === undefined || mySubmission.grade === null)) {
                        // En Revisión: amarillo (forzado)
                        return (
                          <Badge className="bg-yellow-100 text-yellow-800 font-bold ml-1">
                            {translate('underReview')}
                          </Badge>
                        );
                      } else if (mySubmission && typeof mySubmission.grade === 'number') {
                        // Finalizado
                        return (
                          <Badge className={getStatusColor('submitted') + ' font-bold ml-1'}>
                            {translate('statusFinished')}
                          </Badge>
                        );
                      }
                    })() : (
                      <Badge className={`ml-1 ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status === 'pending' ? translate('statusPending') : 
                          selectedTask.status === 'submitted' ? translate('underReview') : translate('statusFinished')}
                      </Badge>
                    )}
                  </span>
                </div>

                {/* Evaluation specific information */}
                {selectedTask.taskType === 'evaluacion' && user?.role === 'student' && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium mb-3 text-purple-800 dark:text-purple-200">{translate('evaluationInformation')}</h4>
                    
                    {/* Tabla horizontal de información de evaluación - Sin scroll horizontal */}
                    <div className="border border-purple-200 dark:border-purple-700 rounded-lg">
                      <table className="w-full table-fixed">
                        <thead className="bg-purple-100 dark:bg-purple-900/40">
                          <tr>
                            <th className="w-1/6 px-2 py-3 text-center text-sm font-medium text-purple-700 dark:text-purple-300 align-middle">{translate('evaluationTopic')}</th>
                            <th className="w-1/8 px-2 py-3 text-center text-sm font-medium text-purple-700 dark:text-purple-300 align-middle">{translate('evaluationQuestions')}</th>
                            <th className="w-1/8 px-2 py-3 text-center text-sm font-medium text-purple-700 dark:text-purple-300 align-middle">{translate('evaluationTime')}</th>
                            <th className="w-1/6 px-2 py-3 text-center text-sm font-medium text-purple-700 dark:text-purple-300 align-middle">{translate('evaluationGradeColumn')}</th>
                            <th className="w-1/8 px-2 py-3 text-center text-sm font-medium text-purple-700 dark:text-purple-300 align-middle">{translate('evaluationDateColumn')}</th>
                            <th className="w-1/4 px-2 py-3 text-center text-sm font-medium text-purple-700 dark:text-purple-300 align-middle">{translate('evaluationActionsColumn')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white dark:bg-slate-800/50">
                            <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400 text-sm font-medium align-middle">
                              {selectedTask.topic || (
                                <span className="text-gray-400 italic">--</span>
                              )}
                            </td>
                            <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400 text-sm font-medium align-middle">
                              {selectedTask.numQuestions && selectedTask.numQuestions > 0 ? selectedTask.numQuestions : (
                                <span className="text-gray-400 italic">--</span>
                              )}
                            </td>
                            <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400 text-sm font-medium align-middle">
                              {selectedTask.timeLimit && selectedTask.timeLimit > 0 ? `${selectedTask.timeLimit} ${translate('minutes')}` : (
                                <span className="text-gray-400 italic">--</span>
                              )}
                            </td>
                            <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400 text-sm font-medium align-middle">
                              {evaluationResults[selectedTask.id] ? (
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  {evaluationResults[selectedTask.id].correctAnswers}/{evaluationResults[selectedTask.id].totalQuestions} ({evaluationResults[selectedTask.id].percentage}%)
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">{translate('statusPending')}</span>
                              )}
                            </td>
                            <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400 text-sm font-medium align-middle">
                              {evaluationResults[selectedTask.id] ? (
                                <span className="text-gray-600 dark:text-gray-400">
                                  {new Date(evaluationResults[selectedTask.id].completedAt).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">--</span>
                              )}
                            </td>
                            <td className="px-2 py-3 text-center align-middle">
                              {evaluationResults[selectedTask.id] ? (
                                <Button
                                  onClick={() => handleReviewEvaluation(selectedTask)}
                                  className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1"
                                  size="sm"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Resultados
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleStartEvaluation(selectedTask)}
                                  className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1"
                                  size="sm"
                                >
                                  <ClipboardCheck className="w-3 h-3 mr-1" />
                                  {translate('takeEvaluation')}
                                </Button>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Evaluation specific information for teachers (keep original format) */}
                {selectedTask.taskType === 'evaluacion' && user?.role === 'teacher' && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-bold mb-4 text-purple-800 dark:text-purple-200 text-left">{translate('evaluationInformation')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {selectedTask.topic && (
                        <div className="text-center">
                          <strong className="text-purple-700 dark:text-purple-300 block mb-1">{translate('evaluationTopic')}:</strong>
                          <p className="text-purple-600 dark:text-purple-400">{selectedTask.topic}</p>
                        </div>
                      )}
                      {selectedTask.numQuestions && selectedTask.numQuestions > 0 && (
                        <div className="text-center">
                          <strong className="text-purple-700 dark:text-purple-300 block mb-1">{translate('evaluationQuestions')}:</strong>
                          <p className="text-purple-600 dark:text-purple-400">{selectedTask.numQuestions}</p>
                        </div>
                      )}
                      {selectedTask.timeLimit && selectedTask.timeLimit > 0 && (
                        <div className="text-center">
                          <strong className="text-purple-700 dark:text-purple-300 block mb-1">{translate('evaluationTime')}:</strong>
                          <p className="text-purple-600 dark:text-purple-400">{selectedTask.timeLimit} minutos</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {/* Detalle por estudiante - Solo visible para profesor - REPOSICIONADO AL PRINCIPIO */}
                {user?.role === 'teacher' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold">{translate('studentDetailPanel')}</h4>
                    </div>

                    {/* Tabla para tareas normales */}
                    {selectedTask?.taskType !== 'evaluacion' && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="centered-header py-2 px-3 font-medium">{translate('studentNameColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium">{translate('studentStatusColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium">{translate('studentGradeColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium min-w-[150px]">{translate('submissionDateColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium">{translate('studentActionsColumn')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getAssignedStudentsForTask(selectedTask).length > 0 ? (
                                getAssignedStudentsForTask(selectedTask).map((student, index) => {
                                  let submission = getStudentSubmission(selectedTask.id, student.id);
                                  let studentStatus = getStudentTaskStatus(selectedTask.id, student.id);
                                  
                                  // NOTA: Parches temporales deshabilitados para comportamiento correcto
                                  // El botón "Revisar" solo debe aparecer cuando hay entrega real
                                  /*
                                  // PARCHE TEMPORAL: Si es Felipe y no encontramos submission, usar método especial
                                  if (!submission && student.displayName === 'Felipe Estudiante') {
                                    console.log('🚨 Using Felipe special check');
                                    const felipeSubmission = checkFelipeSubmission(selectedTask.id);
                                    if (felipeSubmission) {
                                      submission = {
                                        ...felipeSubmission,
                                        grade: felipeSubmission.grade || undefined,
                                        teacherComment: felipeSubmission.teacherComment || '',
                                        reviewedAt: felipeSubmission.reviewedAt || (felipeSubmission.grade !== undefined ? new Date().toISOString() : undefined)
                                      };
                                      studentStatus = submission.grade !== undefined || submission.teacherComment ? 'reviewed' : 'delivered';
                                    }
                                  }

                                  // PARCHE TEMPORAL: Si es María y no encontramos submission, usar método especial
                                  if (!submission && (student.displayName === 'Maria Estudiante' || student.username.toLowerCase().includes('maria'))) {
                                    console.log('🚨 Using Maria special check');
                                    const mariaSubmission = checkMariaSubmission(selectedTask.id);
                                    if (mariaSubmission) {
                                      console.log('✅ Found Maria submission using special function:', mariaSubmission);
                                      submission = {
                                        ...mariaSubmission,
                                        grade: mariaSubmission.grade || undefined,
                                        teacherComment: mariaSubmission.teacherComment || '',
                                        reviewedAt: mariaSubmission.reviewedAt || (mariaSubmission.grade !== undefined ? new Date().toISOString() : undefined)
                                      };
                                      studentStatus = 'delivered'; // Forzamos el estado como "delivered" para asegurar que se muestre correctamente
                                      console.log('✅ Maria status set to DELIVERED:', studentStatus);
                                    } else {
                                      console.log('❌ No Maria submission found using special function');
                                    }
                                  }
                                  */
                                  
                                  const hasSubmission = submission !== undefined;
                                  
                                  console.log(`👨‍🎓 TABLE ROW - Student ${student.displayName} (${student.username}):`, {
                                    studentObject: student,
                                    searchingWithUsername: student.username,
                                    hasSubmission,
                                    studentStatus,
                                    submissionId: submission?.id,
                                    submissionTimestamp: submission?.timestamp,
                                    submissionDetails: submission ? {
                                      studentId: submission.studentId,
                                      studentName: submission.studentName,
                                      isSubmission: submission.isSubmission,
                                      comment: submission.comment.substring(0, 50)
                                    } : null,
                                    allCommentsForThisTask: comments.filter(c => c.taskId === selectedTask.id).map(c => ({
                                      id: c.id,
                                      studentId: c.studentId,
                                      studentName: c.studentName,
                                      isSubmission: c.isSubmission
                                    }))
                                  });
                                  
                                  return (
                                    <tr key={student.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                      <td className="py-2 px-3 text-center">{student.displayName}</td>
                                      <td className="py-2 px-3 text-center">
                                        <Badge className={
                                          studentStatus === 'pending' ? 'bg-gray-100 text-gray-800' :
                                          studentStatus === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-green-100 text-green-800'
                                        }>
                                          {studentStatus === 'pending' ? translate('statusPending') : 
                                          studentStatus === 'delivered' ? translate('underReview') : 
                                          translate('statusFinished')}
                                        </Badge>
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {hasSubmission && submission && submission.grade !== undefined ? 
                                          <span className="font-medium">{submission.grade}/100</span> :
                                          <span className="text-muted-foreground italic">{hasSubmission ? translate('pendingGrade') : translate('noSubmissionYet')}</span>
                                        }
                                      </td>
                                      <td className="py-2 px-3 text-center date-cell">
                                        <span className="single-line-date font-medium">
                                          {hasSubmission && submission ? formatDateOneLine(submission.timestamp) : '-'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <div className="flex justify-center space-x-2">
                                          {/* Solo mostrar botón Revisar/Editar cuando el estudiante ha hecho una entrega */}
                                          {hasSubmission && (studentStatus === 'delivered' || studentStatus === 'reviewed') ? (
                                            <Button 
                                              size="sm" 
                                              className="h-7 bg-orange-500 hover:bg-orange-600 text-white"
                                              onClick={() => handleReviewSubmission(student.id || student.username, selectedTask.id, true)}
                                            >
                                              {studentStatus === 'reviewed' ? translate('editSubmission') : translate('reviewSubmission')}
                                            </Button>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">{translate('noSubmission') || "Sin entrega"}</span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                                    {translate('noStudentsInTask')}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Tabla para evaluaciones */}
                    {selectedTask?.taskType === 'evaluacion' && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="centered-header py-2 px-3 font-medium">{translate('studentNameColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium">{translate('evaluationStatusColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium">{translate('evaluationGradeColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium min-w-[150px]">{translate('evaluationDateColumn')}</th>
                                <th className="centered-header py-2 px-3 font-medium">{translate('evaluationActionsColumn')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getAssignedStudentsForTask(selectedTask).length > 0 ? (
                                getAssignedStudentsForTask(selectedTask).map((student, index) => {
                                  const evaluationResult = getStudentEvaluationResult(selectedTask.id, student.id);
                                  const hasCompleted = evaluationResult !== undefined;
                                  
                                  return (
                                    <tr key={student.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                      <td className="py-2 px-3 text-center">{student.displayName}</td>
                                      <td className="py-2 px-3 text-center">
                                        <Badge className={hasCompleted ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
                                          {hasCompleted ? translate('statusCompleted') : translate('statusPending')}
                                        </Badge>
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {hasCompleted ? 
                                          <span className="font-medium">{evaluationResult.correctAnswers}/{evaluationResult.totalQuestions} ({evaluationResult.percentage}%)</span> :
                                          <span className="text-muted-foreground italic">{translate('noSubmissionYet')}</span>
                                        }
                                      </td>
                                      <td className="py-2 px-3 text-center date-cell">
                                        <span className="single-line-date font-medium">
                                          {hasCompleted ? formatDateOneLine(evaluationResult.completedAt) : '-'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {hasCompleted && (
                                          <Button 
                                            size="sm" 
                                            className="h-7 bg-purple-500 hover:bg-purple-600 text-white"
                                            onClick={() => handleViewEvaluationDetail(student.id, selectedTask.id)}
                                          >
                                            {translate('viewEvaluationDetail')}
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                                    {translate('noStudentsInTask')}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Panel de comentarios - REPOSICIONADO */}
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <h4 className="font-medium mb-3">{translate('comments')}</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {getTaskComments(selectedTask.id)
                      .filter(comment => {
                        // PROFESOR: solo comentarios (no entregas)
                        if (user?.role === 'teacher') return !comment.isSubmission;
                        // ESTUDIANTE: solo su entrega y todos los comentarios
                        if (user?.role === 'student') {
                          if (comment.isSubmission) {
                            return comment.studentId === user.id;
                          }
                          return true;
                        }
                        // Otros roles: solo comentarios
                        return !comment.isSubmission;
                      })
                      .map(comment => (
                        <div
                          key={`task-comment-${comment.id}`}
                          id={`comment-${comment.id}`}
                          className={`bg-muted p-4 rounded-lg transition-all duration-300 ${
                            highlightedCommentId === comment.id
                              ? 'border-2 border-blue-500 shadow-md bg-blue-50 dark:bg-blue-900/20'
                              : ''
                          }`}
                        >
                          {/* NUEVA ORGANIZACIÓN PARA ENTREGA DE ESTUDIANTE */}
                          {comment.isSubmission ? (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              {/* Bloque principal: Nombre, estado Entregado, fecha/hora, porcentaje */}
                              <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                                {/* Nombre primero */}
                                <span className="font-semibold text-base text-gray-900 dark:text-gray-100">{comment.studentName}</span>
                                {/* Estado Entregado */}
                                <Badge className="bg-blue-100 text-blue-800 font-bold px-2 py-1 text-xs ml-4 md:ml-6">{translate('submitted')}</Badge>
                                {/* Fecha */}
                                <span className="text-xs text-muted-foreground ml-2 md:ml-4">{formatDateOneLine(comment.timestamp)}</span>
                                {/* Porcentaje */}
                                {((user?.role === 'teacher') || (user?.role === 'student' && comment.studentId === user.id)) && typeof comment.grade === 'number' && (
                                  <Badge className={comment.grade >= 70 ? 'bg-green-100 text-green-700 font-bold px-2 py-1 text-xs ml-2 md:ml-4' : 'bg-red-100 text-red-700 font-bold px-2 py-1 text-xs ml-2 md:ml-4'}>
                                    {comment.grade}%
                                  </Badge>
                                )}
                              </div>
                              {/* Botón eliminar o badge calificado alineado derecha */}
                              <div className="flex items-center gap-2 md:ml-auto">
                                {user?.role === 'student' && comment.studentId === user.id && !comment.grade && !comment.reviewedAt && (
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSubmission(comment.id)}>
                                    <Trash2 className="w-4 h-4 mr-1" /> {translate('delete')}
                                  </Button>
                                )}
                                {comment.reviewedAt && (
                                  <Badge className="bg-red-100 text-red-700 font-bold px-2 py-1 text-xs flex items-center">
                                    <Lock className="w-3 h-3 mr-1" /> {translate('graded')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : (
                            // Comentario normal
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <span className="font-semibold text-base text-gray-900 dark:text-gray-100">{comment.studentName}</span>
                              <span className="text-xs text-muted-foreground md:ml-3">{formatDateOneLine(comment.timestamp)}</span>
                            </div>
                          )}

                          {/* Comentario */}
                          <p className="text-sm mb-1 mt-2 whitespace-pre-line">{comment.comment}</p>

                          {/* Adjuntos */}
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {comment.attachments.map((file) => (
                                <div key={`comment-file-${file.id}`} className="flex items-center gap-2 text-xs">
                                  <Paperclip className="w-3 h-3 text-muted-foreground" />
                                  <span className="truncate" title={file.name}>{file.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(file)}
                                    className="h-6 w-6 p-0 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    
                    {getTaskComments(selectedTask.id).length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        {translate('noCommentsYet')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sección para agregar comentarios - REPOSICIONADO AL FINAL */}
                <div className="space-y-3 mt-6">
                  <Separator />
                  <div>
                    <Label htmlFor="newComment">
                      {user?.role === 'student' && isSubmission 
                        ? translate('submitTask') 
                        : user?.role === 'teacher' 
                          ? translate('teacherCommentPlaceholder') 
                          : translate('addComment')}
                    </Label>
                    <Textarea
                      id="newComment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        user?.role === 'student' && isSubmission 
                          ? translate('submissionPlaceholder') 
                          : user?.role === 'teacher' 
                            ? translate('teacherCommentPlaceholder') 
                            : translate('commentPlaceholder')
                      }
                      className="mt-1"
                    />
                    
                    {/* File Upload for Comments - Solo para tareas normales, no para evaluaciones */}
                    {selectedTask?.taskType !== 'evaluacion' && (
                      <div className="mt-3 space-y-2">
                        <div>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files, false)}
                            className="hidden"
                            id="comment-file-upload"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                          />
                          <Button
                            type="button"
                            onClick={() => document.getElementById('comment-file-upload')?.click()}
                            className="w-full bg-orange-100 hover:bg-orange-500 hover:text-white text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-600 dark:hover:text-white dark:text-orange-400 dark:border-orange-700"
                            size="sm"
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            {translate('attachFile')}
                          </Button>
                        </div>
                        
                        {/* Display uploaded files for comment */}
                        {commentAttachments.length > 0 && (
                          <div className="space-y-2 max-h-24 overflow-y-auto">
                            {commentAttachments.map((file) => (
                              <div key={`comment-attachment-${file.id}`} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate" title={file.name}>{file.name}</span>
                                  <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id, false)}
                                  className="flex-shrink-0 h-6 w-6 p-0 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      {user?.role === 'student' && selectedTask?.taskType !== 'evaluacion' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isSubmission"
                            checked={isSubmission}
                            onChange={(e) => setIsSubmission(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="isSubmission" className="text-sm">
                            {translate('markAsFinalSubmission')}
                          </Label>
                        </div>
                      )}
                      {user?.role === 'teacher' && (
                        <div>{/* Espacio vacío para mantener la alineación */}</div>
                      )}
                      <Button 
                        onClick={handleAddComment} 
                        disabled={!newComment.trim() && commentAttachments.length === 0}
                        className={`${
                          selectedTask?.taskType === 'evaluacion' 
                            ? 'bg-purple-500 hover:bg-purple-600' 
                            : 'bg-orange-500 hover:bg-orange-600'
                        } text-white disabled:bg-gray-300 disabled:text-gray-500`}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {user?.role === 'student' && isSubmission 
                          ? translate('submit') 
                          : translate('sendComment')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{translate('editTask')}</DialogTitle>
              <DialogDescription>
                {translate('editTaskDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">{translate('taskTitle')} <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder={translate('taskTitlePlaceholder')}
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">{translate('taskDescription')} <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder={translate('taskDescriptionPlaceholder')}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">{translate('taskCourse')} <span className="text-red-500">*</span></Label>
                <Select value={formData.course} onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}>
                  <SelectTrigger className="select-orange-hover-trigger col-span-3">
                    <SelectValue placeholder={translate('selectCourse')} />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    {getAvailableCoursesWithNames().map(course => (
                      <SelectItem key={`comment-course-${course.id}`} value={course.id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">{translate('taskSubject')} <span className="text-red-500">*</span></Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))} required>
                  <SelectTrigger className="select-orange-hover-trigger col-span-3">
                    <SelectValue placeholder={translate('selectSubject')} />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    {getAvailableSubjects().map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{translate('assignTo')}</Label>
                <Select value={formData.assignedTo} onValueChange={(value: 'course' | 'student') => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                  <SelectTrigger className="select-orange-hover-trigger col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    <SelectItem value="course">{translate('assignToCourse')}</SelectItem>
                    <SelectItem value="student">{translate('assignToStudents')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.assignedTo === 'student' && formData.course && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{translate('assignToStudents')}</Label>
                  <div className="col-span-3">
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                      {getStudentsForCourse(formData.course).length > 0 ? (
                        getStudentsForCourse(formData.course).map((student: { id: string, username: string, displayName: string }) => (
                          <div key={student.id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`edit-student-${student.username}`}
                              checked={formData.assignedStudentIds?.includes(student.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignedStudentIds: [...(prev.assignedStudentIds || []), student.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignedStudentIds: prev.assignedStudentIds?.filter((s: string) => s !== student.id) || []
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`student-${student.username}`} className="cursor-pointer">
                              {student.displayName}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground py-2 text-center">
                          {translate('noEvaluationsSubtext') || "No hay estudiantes disponibles para este curso"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">{translate('dueDate')} *</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{translate('priority')}</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="select-orange-hover-trigger col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    <SelectItem value="low">{translate('priorityLow')}</SelectItem>
                    <SelectItem value="medium">{translate('priorityMedium')}</SelectItem>
                    <SelectItem value="high">{translate('priorityHigh')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{translate('taskType')}</Label>
                <Select value={formData.taskType} onValueChange={(value: 'tarea' | 'evaluacion') => setFormData(prev => ({ ...prev, taskType: value }))}>
                  <SelectTrigger className="select-orange-hover-trigger col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="select-orange-hover">
                    <SelectItem value="tarea">{translate('taskTypeAssignment')}</SelectItem>
                    <SelectItem value="evaluacion">{translate('taskTypeEvaluation')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Evaluation specific fields */}
              {formData.taskType === 'evaluacion' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="topic-edit" className="text-right">Tema <span className="text-red-500">*</span></Label>
                    <Input
                      id="topic-edit"
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      className="col-span-3"
                      placeholder="Introduce el tema de la evaluación"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="numQuestions-edit" className="text-right">Cantidad de Preguntas <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.numQuestions?.toString() || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, numQuestions: parseInt(value) }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona la cantidad de preguntas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 preguntas</SelectItem>
                        <SelectItem value="10">10 preguntas</SelectItem>
                        <SelectItem value="15">15 preguntas</SelectItem>
                        <SelectItem value="20">20 preguntas</SelectItem>
                        <SelectItem value="25">25 preguntas</SelectItem>
                        <SelectItem value="30">30 preguntas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeLimit-edit" className="text-right">Tiempo (minutos) <span className="text-red-500">*</span></Label>
                    <Input
                      id="timeLimit-edit"
                      type="number"
                      value={formData.timeLimit || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                      className="col-span-3"
                      placeholder="Ej: 45"
                      min="1"
                      max="180"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="cancel-button">
                {translate('cancel')}
              </Button>
              <Button 
                onClick={handleUpdateTask}
                className={`${formData.taskType === 'evaluacion' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-orange-500 hover:bg-orange-600'} text-white`}
              >
                {formData.taskType === 'evaluacion' ? translate('updateEvaluation') || translate('updateTask') : translate('updateTask')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Task Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{translate('confirmDelete')}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                {translate('taskDeleteConfirm', { title: taskToDelete?.title || '' })}
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="cancel-button">
                {translate('cancel')}
              </Button>
              <Button onClick={confirmDeleteTask} variant="destructive">
                {translate('deleteTask')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grade Submission Dialog */}
        <Dialog open={showGradeDialog} onOpenChange={handleCloseGradeDialog}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{translate('gradeSubmissionTitle')}</DialogTitle>
              <DialogDescription>
                {translate('gradeSubmissionDesc')}
              </DialogDescription>
            </DialogHeader>
            
            {submissionToGrade && selectedTask && (
              <div className="space-y-6">
                {/* Información de la tarea */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">{translate('taskInformation')}</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>{translate('task')}:</strong> {selectedTask.title}</p>
                    <p><strong>{translate('taskDescription')}:</strong> {selectedTask.description}</p>
                    <p><strong>{translate('dueDate')}:</strong> {formatDateOneLine(selectedTask.dueDate)}</p>
                    <p><strong>{translate('tableCourse')}:</strong> {getCourseNameById(selectedTask.course)}</p>
                    <p><strong>{translate('taskSubject')}:</strong> {selectedTask.subject}</p>
                  </div>
                </div>

                {/* Información del estudiante */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">{translate('studentInformation')}</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>{translate('studentNameColumn')}:</strong> {submissionToGrade.studentName}</p>
                    <p><strong>{translate('user')}:</strong> {submissionToGrade.studentName}</p>
                    <p><strong>{translate('submissionDateColumn')}:</strong> {formatDateOneLine(submissionToGrade.timestamp)}</p>
                  </div>
                </div>

                {/* Entrega del estudiante */}
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Entrega del Estudiante</h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <p className="text-sm whitespace-pre-wrap">{submissionToGrade.comment}</p>
                  </div>
                </div>

                {/* Archivos adjuntos de la entrega */}
                {submissionToGrade.attachments && submissionToGrade.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Archivos de la Entrega</h4>
                    <div className="space-y-2">
                      {submissionToGrade.attachments.map((file) => (
                        <div key={`submission-file-${file.id}`} className="flex items-center justify-between p-3 bg-muted rounded border">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate font-medium" title={file.name}>{file.name}</span>
                            <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(file)}
                            className="flex-shrink-0 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Archivos adjuntos de la tarea original */}
                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Archivos de la Tarea Original</h4>
                    <div className="space-y-2">
                      {selectedTask.attachments.map((file) => (
                        <div key={`task-file-${file.id}`} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="truncate" title={file.name}>{file.name}</span>
                            <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(file)}
                            className="flex-shrink-0 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Sección de calificación */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border">
                  <h4 className="font-medium mb-4 text-orange-800 dark:text-orange-200">Calificación</h4>
                  
                  <div className="space-y-4">
                    {/* Campo de calificación */}
                    <div>
                      <label htmlFor="gradeInput" className="block text-sm font-medium mb-2">
                        {translate('gradeRange')} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="gradeInput"
                          type="number"
                          min="0"
                          max="100"
                          value={gradeForm.grade}
                          onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                          placeholder="Ej: 85"
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">/ 100</span>
                        {gradeForm.grade && (
                          <Badge variant="outline" className={parseInt(gradeForm.grade) >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {parseInt(gradeForm.grade) >= 70 ? translate('approved') : translate('failed')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Campo de comentario */}
                    <div>
                      <label htmlFor="teacherComment" className="block text-sm font-medium mb-2">
                        Comentario de Retroalimentación
                      </label>
                      <Textarea
                        id="teacherComment"
                        value={gradeForm.teacherComment}
                        onChange={(e) => setGradeForm(prev => ({ ...prev, teacherComment: e.target.value }))}
                        placeholder={translate('feedbackPlaceholder')}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleCloseGradeDialog}
                    className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                  >
                    {translate('cancel')}
                  </Button>
                  <Button 
                    onClick={saveGrade}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={!gradeForm.grade.trim()}
                  >
                    {translate('saveGrade')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de Revisión Mejorado */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{currentReview.isGraded ? translate('editSubmission') : translate('reviewSubmission')} - {currentReview.studentDisplayName}</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {currentReview.isGraded ? translate('graded') : translate('toGrade')}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedTask?.title}
              </DialogDescription>
            </DialogHeader>
            
            {currentReview.submission && selectedTask && (
              <div className="space-y-6">
                {/* Información de la Tarea */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200 flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2" />
                    {translate('taskInformation')}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>{translate('taskTitle')}:</strong> {selectedTask.title}</p>
                      <p><strong>{translate('tableCourse')}:</strong> {getCourseNameById(selectedTask.course)}</p>
                      <p><strong>{translate('taskSubject')}:</strong> {selectedTask.subject}</p>
                    </div>
                    <div>
                      <p><strong>{translate('dueDate')}:</strong> {formatDateOneLine(selectedTask.dueDate)}</p>
                      <div><strong>{translate('priority')}:</strong> 
                        <Badge className={`ml-1 ${getPriorityColor(selectedTask.priority)}`}>
                          {selectedTask.priority === 'high' ? translate('priorityHigh') : 
                          selectedTask.priority === 'medium' ? translate('priorityMedium') : translate('priorityLow')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p><strong>{translate('taskDescription')}:</strong></p>
                    <p className="text-muted-foreground mt-1">{selectedTask.description}</p>
                  </div>
                </div>

                {/* Información del Estudiante */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium mb-3 text-green-800 dark:text-green-200 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    {translate('studentAndSubmissionInfo')}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>{translate('studentNameColumn')}:</strong> {currentReview.studentDisplayName}</p>
                      <p><strong>ID:</strong> {currentReview.studentId}</p>
                      <p><strong>{translate('deliveryTime')}:</strong> {formatDate(currentReview.submission.timestamp)}</p>
                    </div>
                    <div>
                      <p><strong>{translate('fullDate')}:</strong> {new Date(currentReview.submission.timestamp).toLocaleString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}</p>
                      <p><strong>{translate('timeElapsed')}:</strong> {(() => {
                        const now = new Date();
                        const submissionTime = new Date(currentReview.submission.timestamp);
                        const diffMs = now.getTime() - submissionTime.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);
                        
                        if (diffDays > 0) {
                          return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''} y ${diffHours % 24} hora${(diffHours % 24) > 1 ? 's' : ''}`;
                        } else if (diffHours > 0) {
                          return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
                        } else {
                          const diffMinutes = Math.floor(diffMs / (1000 * 60));
                          return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
                        }
                      })()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <strong>{translate('currentStatus')}:</strong>
                        {/* Estado de la entrega del estudiante, igual que en la lista */}
                        {(() => {
                          if (!currentReview.submission) {
                            // No hay entrega: Pendiente
                            return (
                              <Badge className="bg-gray-100 text-gray-800">
                                {translate('statusPending')}
                              </Badge>
                            );
                          } else if (currentReview.submission && (currentReview.submission.grade === undefined || currentReview.submission.grade === null)) {
                            // Entregada pero sin nota: En Revisión (amarillo)
                            return (
                              <Badge className="bg-yellow-100 text-yellow-800 font-bold">
                                {translate('underReview')}
                              </Badge>
                            );
                          } else if (currentReview.submission && typeof currentReview.submission.grade === 'number') {
                            // Finalizado: verde + badge porcentaje
                            return (
                              <>
                                <Badge className="bg-green-100 text-green-800 font-bold mr-1">
                                  {translate('statusFinished')}
                                </Badge>
                                <Badge className={currentReview.submission.grade >= 70 ? 'bg-green-100 text-green-700 font-bold ml-2' : 'bg-red-100 text-red-700 font-bold ml-2'}>
                                  {currentReview.submission.grade}/100
                                </Badge>
                              </>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido de la Entrega */}
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    {translate('submissionContent')}
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border min-h-[100px]">
                    <p className="text-sm whitespace-pre-wrap">
                      {currentReview.submission.comment || translate('noTextContent')}
                    </p>
                  </div>
                </div>

                {/* Archivos Adjuntos de la Entrega */}
                {currentReview.submission.attachments && currentReview.submission.attachments.length > 0 ? (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium mb-3 flex items-center text-purple-800 dark:text-purple-200">
                      <Paperclip className="w-5 h-5 mr-2" />
                      {translate('submissionAttachments')} ({currentReview.submission.attachments.length})
                    </h4>
                    <div className="space-y-3">
                      {currentReview.submission.attachments.map((file, index) => (
                        <div key={`review-submission-file-${file.id}`} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate" title={file.name}>
                                📎 {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Tamaño: {formatFileSize(file.size)} • Subido: {formatDate(file.uploadedAt)}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {translate('fileNumber', { number: (index + 1).toString(), total: (currentReview.submission?.attachments?.length || 0).toString() })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(file)}
                            className="flex-shrink-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 ml-3"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Ver/Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 <strong>Tip:</strong> Haz clic en "Ver/Descargar" para revisar cada archivo antes de calificar la entrega.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-3 flex items-center text-gray-600 dark:text-gray-400">
                      <Paperclip className="w-5 h-5 mr-2" />
                      {translate('attachedFiles')}
                    </h4>
                    <div className="text-center py-6">
                      <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {translate('noAttachedFiles')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sección de Calificación */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200">
                  <h4 className="font-medium mb-4 text-orange-800 dark:text-orange-200 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    {translate('gradeAndFeedback')}
                  </h4>
                  
                  <div className="space-y-6">
                    {/* Resumen de la Entrega */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 {translate('submissionSummary')}</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>{translate('studentNameColumn')}:</strong> {currentReview.studentDisplayName}</p>
                          <p><strong>{translate('submittedOn')}:</strong> {formatDate(currentReview.submission.timestamp)}</p>
                        </div>
                        <div>
                          <p><strong>{translate('attachedFiles')}:</strong> {currentReview.submission.attachments?.length || 0}</p>
                          <p><strong>{translate('comments')}:</strong> {currentReview.submission.comment ? translate('yes') : translate('no')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Campo de calificación mejorado */}
                    <div>
                      <label htmlFor="gradeInputNew" className="block text-sm font-medium mb-3">
                        🎯 {translate('gradeRange')} <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <Input
                            id="gradeInputNew"
                            type="number"
                            min="0"
                            max="100"
                            value={currentReview.grade || ''}
                            onChange={(e) => setCurrentReview(prev => ({ 
                              ...prev, 
                              grade: parseInt(e.target.value) || 0 
                            }))}
                            placeholder="0"
                            className="w-32 text-lg text-center font-bold"
                          />
                          <span className="text-lg text-muted-foreground font-medium">/ 100</span>
                          {currentReview.grade > 0 && (
                            <Badge variant="outline" className={
                              currentReview.grade >= 70 
                                ? 'bg-green-100 text-green-800 border-green-300 text-sm font-bold' 
                                : 'bg-red-100 text-red-800 border-red-300 text-sm font-bold'
                            }>
                              {currentReview.grade >= 70 ? `✅ ${translate('approved')}` : `❌ ${translate('failed')}`}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Escala de calificación visual */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>0</span>
                            <span>25</span>
                            <span>50</span>
                            <span>70</span>
                            <span>100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                currentReview.grade >= 70 ? 'bg-green-500' : 
                                currentReview.grade >= 50 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(currentReview.grade || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{translate('insufficient')}</span>
                            <span>{translate('regular')}</span>
                            <span>{translate('good')}</span>
                            <span>{translate('veryGood')}</span>
                            <span>{translate('excellent')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Campo de retroalimentación mejorado */}
                    <div>
                      <label htmlFor="feedbackInputNew" className="block text-sm font-medium mb-3">
                        💬 {translate('feedbackForStudent')}
                      </label>
                      <Textarea
                        id="feedbackInputNew"
                        value={currentReview.feedback}
                        onChange={(e) => setCurrentReview(prev => ({ 
                          ...prev, 
                          feedback: e.target.value 
                        }))}
                        placeholder={translate('feedbackPlaceholder')}
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {translate('feedbackVisibleNote')}
                      </p>
                    </div>

                    {/* Calificación previa (si existe) */}
                    {currentReview.isGraded && currentReview.submission.reviewedAt && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          <strong>Calificación anterior:</strong> {currentReview.submission.grade}/100
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          Revisado el: {formatDate(currentReview.submission.reviewedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowReviewDialog(false)}
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
              >
                {translate('cancel')}
              </Button>
              <Button 
                onClick={saveReviewAndGrade}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!currentReview.grade || currentReview.grade < 0 || currentReview.grade > 100}
              >
                {currentReview.isGraded ? translate('updateGrade') : translate('saveGrade')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Loading Dialog para evaluación mejorado */}
        <Dialog open={showLoadingDialog} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-purple-700 flex items-center justify-center space-x-2">
                <ClipboardCheck className="w-5 h-5" />
                <span>Preparando Evaluación</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-6 py-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-purple-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - loadingProgress / 100)}`}
                    className="text-purple-600 transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-700">{loadingProgress}%</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-purple-600 font-medium">{loadingStatus}</p>
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Evaluation Dialog mejorado - Formato similar a pestaña evaluaciones */}
        <Dialog open={showEvaluationDialog} onOpenChange={() => {}}>
          <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none border-0 p-0">
            <DialogTitle className="sr-only">
              {translate('navEvaluation')} - {currentEvaluation.task?.topic || translate('navEvaluation')}
            </DialogTitle>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
              <Card className="w-full max-w-2xl mx-auto shadow-xl">
                <CardHeader className="text-center border-b pb-4">
                  <CardTitle className="text-2xl font-bold font-headline">
                    {translate('navEvaluation').toUpperCase()} - {currentEvaluation.task?.topic?.toUpperCase() || translate('navEvaluation').toUpperCase()}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-center space-x-4">
                    <span>{translate('evalQuestionProgress', { 
                      current: (currentEvaluation.currentQuestionIndex || 0) + 1, 
                      total: currentEvaluation.questions.length 
                    })}</span>
                    <span className={`font-mono text-base text-primary tabular-nums flex items-center ${currentEvaluation.timeRemaining <= 60 ? 'text-red-500 animate-pulse' : ''}`}>
                      <Timer className="w-4 h-4 mr-1.5" />
                      {translate('evalTimeLeft', { 
                        time: `${Math.floor(currentEvaluation.timeRemaining / 60)}:${(currentEvaluation.timeRemaining % 60).toString().padStart(2, '0')}` 
                      })}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 min-h-[250px] flex flex-col justify-between">
                  {currentEvaluation.questions.length > 0 && (
                    <div>
                      <p className="text-lg font-medium mb-6 text-left md:text-center">
                        {currentEvaluation.questions[(currentEvaluation.currentQuestionIndex || 0)]?.question}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentEvaluation.questions[(currentEvaluation.currentQuestionIndex || 0)]?.options.map((option: string, index: number) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className={`py-3 text-base justify-start text-left h-auto whitespace-normal w-full ${
                              currentEvaluation.answers[currentEvaluation.currentQuestionIndex || 0] === index
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'border border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
                            }`}
                            onClick={() => {
                              const newAnswers = { ...currentEvaluation.answers };
                              newAnswers[currentEvaluation.currentQuestionIndex || 0] = index;
                              setCurrentEvaluation({
                                ...currentEvaluation,
                                answers: newAnswers
                              });
                            }}
                            disabled={currentEvaluation.timeRemaining === 0}
                          >
                            <span className="mr-2 font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex mt-8 ${(currentEvaluation.currentQuestionIndex || 0) > 0 ? 'justify-between' : 'justify-end'}`}>
                    {(currentEvaluation.currentQuestionIndex || 0) > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const newIndex = Math.max(0, (currentEvaluation.currentQuestionIndex || 0) - 1);
                          setCurrentEvaluation({
                            ...currentEvaluation,
                            currentQuestionIndex: newIndex
                          });
                        }}
                        className="text-base py-3 px-6 hover:bg-purple-100 hover:text-purple-700 hover:border-purple-300"
                        disabled={currentEvaluation.timeRemaining === 0}
                      >
                        <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                        {translate('evalPreviousButton')}
                      </Button>
                    )}
                    
                    {(currentEvaluation.currentQuestionIndex || 0) < currentEvaluation.questions.length - 1 ? (
                      <Button
                        onClick={() => {
                          const newIndex = (currentEvaluation.currentQuestionIndex || 0) + 1;
                          setCurrentEvaluation({
                            ...currentEvaluation,
                            currentQuestionIndex: newIndex
                          });
                        }}
                        className="text-base py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={currentEvaluation.timeRemaining === 0}
                      >
                        {translate('evalNextButton')}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCompleteEvaluation()}
                        className="text-base py-3 px-6 bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                        disabled={currentEvaluation.timeRemaining === 0}
                      >
                        <Award className="w-5 h-5 mr-2" />
                        {translate('evalFinishButton')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Modal de Tiempo Agotado - DENTRO del diálogo de evaluación */}
              {showTimeExpiredDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Timer className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Tiempo Agotado</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Se acabó el tiempo para completar la evaluación. La evaluación se ha guardado automáticamente con las respuestas que alcanzaste a completar.
                    </p>
                    
                    {timeExpiredResult && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-6 text-center text-lg">Resultados Obtenidos</h4>
                        <div className="flex justify-center space-x-12">
                          <div className="text-center">
                            <span className="font-medium text-red-700 dark:text-red-300 block mb-2">Respuestas Correctas:</span>
                            <p className="text-red-600 dark:text-red-400 text-2xl font-bold">
                              {timeExpiredResult.correctAnswers}/{timeExpiredResult.totalQuestions}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="font-medium text-red-700 dark:text-red-300 block mb-2">Calificación:</span>
                            <p className="text-red-600 dark:text-red-400 text-2xl font-bold">
                              {timeExpiredResult.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <Button
                        onClick={() => {
                          setShowTimeExpiredDialog(false);
                          setEvaluationTimeExpired(false);
                          // Cerrar la evaluación completamente
                          setShowEvaluationDialog(false);
                          setCurrentEvaluation({
                            task: null,
                            questions: [],
                            startTime: null,
                            answers: {},
                            timeRemaining: 0,
                            currentQuestionIndex: 0
                          });
                          // Mostrar revisión de resultados
                          setCurrentEvaluationReview(timeExpiredResult);
                          setShowReviewEvaluationDialog(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-medium rounded-lg"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        Resultados
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Revisión de Evaluación con detalles completos */}
        <Dialog open={showReviewEvaluationDialog} onOpenChange={setShowReviewEvaluationDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>{translate('evalReviewTitle')}</span>
              </DialogTitle>
              <DialogDescription>
                {translate('evalReviewDescription')}
              </DialogDescription>
            </DialogHeader>
            
            {currentEvaluationReview && (
              <div className="space-y-6">
                {/* Información general */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">{translate('evalReviewGeneralInfo')}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">{translate('evalReviewTopic')}</span>
                      <p className="text-blue-600 dark:text-blue-400">{currentEvaluationReview.task?.topic || translate('evalReviewNotSpecified')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">{translate('evalReviewTimeUsed')}</span>
                      <p className="text-blue-600 dark:text-blue-400">
                        {Math.floor(currentEvaluationReview.timeUsed / 60)}:{(currentEvaluationReview.timeUsed % 60).toString().padStart(2, '0')} min
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">{translate('evalReviewDate')}</span>
                      <p className="text-blue-600 dark:text-blue-400">
                        {new Date(currentEvaluationReview.completedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">{translate('evalReviewStatus')}</span>
                      <p className="text-blue-600 dark:text-blue-400">
                        {currentEvaluationReview.timeExpired ? translate('evalReviewTimeExpired') : translate('evalReviewCompletedOnTime')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resultados */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">{translate('evalReviewResults')}</h4>
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {currentEvaluationReview.correctAnswers}/{currentEvaluationReview.totalQuestions}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">{translate('evalReviewCorrectAnswers')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {currentEvaluationReview.percentage}%
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">{translate('evalReviewPercentage')}</div>
                    </div>
                  </div>
                </div>

                {/* Revisión detallada de preguntas */}
                {currentEvaluationReview.questions && currentEvaluationReview.questions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{translate('evalReviewDetailedReview')}</h4>
                    
                    {currentEvaluationReview.questions.map((question: any, index: number) => {
                      const userAnswer = currentEvaluationReview.answers[index];
                      const isCorrect = userAnswer === question.correct;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border-l-4 ${
                            isCorrect 
                              ? 'bg-green-50 dark:bg-green-900/20 border-l-green-500 border border-green-200 dark:border-green-800' 
                              : 'bg-red-50 dark:bg-red-900/20 border-l-red-500 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200">
                              {translate('evalReviewQuestion')} {index + 1}
                            </h5>
                            <Badge 
                              className={isCorrect 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              {isCorrect ? translate('evalReviewCorrect') : translate('evalReviewIncorrect')}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                            {question.question}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div 
                                key={optionIndex}
                                className={`p-2 rounded border text-sm ${
                                  optionIndex === question.correct
                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 font-medium'
                                    : optionIndex === userAnswer && optionIndex !== question.correct
                                    ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span>{option}</span>
                                  {optionIndex === question.correct && (
                                    <Badge className="bg-green-200 text-green-800 text-xs ml-auto">
                                      {translate('evalReviewCorrectAnswer')}
                                    </Badge>
                                  )}
                                  {optionIndex === userAnswer && optionIndex !== question.correct && (
                                    <Badge className="bg-red-200 text-red-800 text-xs ml-auto">
                                      {translate('evalReviewYourAnswer')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {question.explanation && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-700 mt-3">
                              <span className="font-medium text-blue-700 dark:text-blue-300 text-sm block mb-1">
                                {translate('evalReviewExplanation')}
                              </span>
                              <p className="text-blue-600 dark:text-blue-400 text-sm">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Botón cerrar */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => setShowReviewEvaluationDialog(false)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {translate('evalReviewClose')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de revisión de evaluación */}
        <Dialog open={showEvaluationReviewDialog} onOpenChange={setShowEvaluationReviewDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-purple-800 dark:text-purple-200">
                {translate('viewEvaluationDetail')} - {selectedEvaluationResult?.studentName || translate('student')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEvaluationResult && (
              <div className="space-y-6">
                {/* Debug log */}
                {console.log('🎯 RENDERING EVALUATION DIALOG:', {
                  currentLanguage: localStorage.getItem('smart-student-lang'),
                  hasQuestions: !!selectedEvaluationResult.questions,
                  firstQuestion: selectedEvaluationResult.questions?.[0]?.question?.substring(0, 50),
                  studentName: selectedEvaluationResult.studentName
                })}
                
                {/* Resumen de la evaluación */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-bold mb-4 text-purple-800 dark:text-purple-200 text-left">{translate('evalSummaryTitle')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <strong className="text-purple-700 dark:text-purple-300 block mb-1">{translate('evalSummaryScore')}</strong>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {selectedEvaluationResult.correctAnswers}/{selectedEvaluationResult.totalQuestions}
                      </p>
                    </div>
                    <div className="text-center">
                      <strong className="text-purple-700 dark:text-purple-300 block mb-1">{translate('evalSummaryPercentage')}</strong>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {selectedEvaluationResult.percentage}%
                      </p>
                    </div>
                    <div className="text-center">
                      <strong className="text-purple-700 dark:text-purple-300 block mb-1">{translate('evalSummaryTime')}</strong>
                      <p className="text-purple-600 dark:text-purple-400">
                        {selectedEvaluationResult.timeUsed 
                          ? `${Math.floor(selectedEvaluationResult.timeUsed / 60)}:${(selectedEvaluationResult.timeUsed % 60).toString().padStart(2, '0')} min`
                          : selectedEvaluationResult.timeSpent || translate('notAvailable')
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <strong className="text-purple-700 dark:text-purple-300 block mb-1">{translate('evalSummaryDate')}</strong>
                      <p className="text-purple-600 dark:text-purple-400">
                        {new Date(selectedEvaluationResult.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preguntas y respuestas */}
                {selectedEvaluationResult.questions && selectedEvaluationResult.questions.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-4 text-gray-800 dark:text-gray-200">{translate('evalDetailedReview')}</h4>
                    <div className="space-y-4">
                      {selectedEvaluationResult.questions.map((question: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            question.isCorrect 
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200">
                              {translate('evalReviewQuestion')} {index + 1}
                            </h5>
                            <Badge className={question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {question.isCorrect ? translate('evalReviewCorrect') : translate('evalReviewIncorrect')}
                            </Badge>
                          </div>
                          
                          <p className="mb-3 text-gray-700 dark:text-gray-300">{question.question}</p>
                          
                          <div className="space-y-2">
                            <div>
                              <strong className="text-sm text-gray-600 dark:text-gray-400">{translate('evalReviewCorrectAnswer')}</strong>
                              <p className="ml-2 text-green-700 dark:text-green-300">{question.correctAnswer}</p>
                            </div>
                            
                            {question.explanation && (
                              <div>
                                <strong className="text-sm text-gray-600 dark:text-gray-400">{translate('evalReviewExplanation')}</strong>
                                <p className="ml-2 text-gray-600 dark:text-gray-400 text-sm">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Funciones auxiliares para la vista de detalles por estudiante */}
        {/* Fin del contenido principal */}
      </div>
    );
  }
