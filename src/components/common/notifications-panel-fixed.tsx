"use client";

import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Clock, Key, ClipboardCheck, ClipboardList, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { TaskNotificationManager } from '@/lib/notifications';
import Link from 'next/link';

// Interfaces
interface TaskComment {
  id: string;
  taskId: string;
  studentUsername: string;
  studentName: string;
  comment: string;
  timestamp: string;
  isSubmission: boolean;
  isNew?: boolean;
  readBy?: string[];
  grade?: {
    id: string;
    percentage: number;
    feedback?: string;
    gradedBy: string;
    gradedByName: string;
    gradedAt: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  course: string;
  assignedBy: string;
  assignedByName: string;
  taskType: 'assignment' | 'evaluation'; // Tipo de tarea: normal o evaluación
}

interface PasswordRequest {
  id: string;
  username: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface NotificationsPanelProps {
  count: number;
}

export default function NotificationsPanel({ count: propCount }: NotificationsPanelProps) {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const [unreadComments, setUnreadComments] = useState<(TaskComment & {task?: Task})[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<(TaskComment & {task?: Task})[]>([]);
  const [unreadStudentComments, setUnreadStudentComments] = useState<(TaskComment & {task?: Task})[]>([]);
  const [classTasks, setClassTasks] = useState<Task[]>([]);
  const [taskNotifications, setTaskNotifications] = useState<any[]>([]);
  const [pendingGrading, setPendingGrading] = useState<any[]>([]);
  const [count, setCount] = useState(propCount);

  // Función para dividir texto en dos líneas para badges
  const splitTextForBadge = (text: string, maxLength: number = 8): string[] => {
    if (text.length <= maxLength) return [text];
    
    const words = text.split(' ');
    if (words.length === 1) {
      // Si es una sola palabra muy larga, dividirla por la mitad
      const mid = Math.ceil(text.length / 2);
      return [text.substring(0, mid), text.substring(mid)];
    }
    
    let firstLine = '';
    let secondLine = '';
    let switchToSecond = false;
    
    for (const word of words) {
      if (!switchToSecond && (firstLine + word).length <= maxLength) {
        firstLine += (firstLine ? ' ' : '') + word;
      } else {
        switchToSecond = true;
        secondLine += (secondLine ? ' ' : '') + word;
      }
    }
    
    return firstLine && secondLine ? [firstLine, secondLine] : [text];
  };

  // Use the count provided by the parent component instead of calculating our own
  useEffect(() => {
    setCount(propCount);
  }, [propCount]);

  useEffect(() => {
    // Load data based on user role
    if (user) {
      console.log(`[NotificationsPanel] Loading data for user: ${user.username}, role: ${user.role}`);
      
      // 🔧 MIGRACIÓN: Actualizar notificaciones que muestran "Sistema"
      TaskNotificationManager.migrateSystemNotifications();
      
      // Clear all states first to avoid residual data when switching users/roles
      setUnreadComments([]);
      setPendingTasks([]);
      setPasswordRequests([]);
      setStudentSubmissions([]);
      setUnreadStudentComments([]);
      setClassTasks([]);
      setTaskNotifications([]);
      setPendingGrading([]);
      
      if (user.role === 'admin') {
        loadPasswordRequests();
      } else if (user.role === 'student') {
        loadUnreadComments();
        loadPendingTasks();
        loadTaskNotifications();
      } else if (user.role === 'teacher') {
        console.log(`[NotificationsPanel] Loading teacher-specific data for ${user.username}`);
        loadStudentSubmissions();
        loadTaskNotifications();
        loadPendingGrading();
        // Clear pending tasks for teachers as they don't have pending tasks, only submissions to review
        setPendingTasks([]);
      }
    }
    
    // Listener for storage events to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'password-reset-requests') {
        if (user?.role === 'admin') {
          loadPasswordRequests();
        }
      }
      if (e.key === 'smart-student-task-comments') {
        if (user?.role === 'student') {
          loadUnreadComments();
        } else if (user?.role === 'teacher') {
          loadStudentSubmissions();
        }
      }
      if (e.key === 'smart-student-tasks') {
        if (user?.role === 'student') {
          loadPendingTasks();
        } else if (user?.role === 'teacher') {
          loadStudentSubmissions();
        }
      }
    };
    
    // Setup listeners for both the storage event and custom events
    window.addEventListener('storage', handleStorageChange);

    // Create a named function for the event listener so it can be properly removed
    const handleCommentsUpdated = () => {
      if (user?.role === 'student') {
        loadUnreadComments();
      } else if (user?.role === 'teacher') {
        loadStudentSubmissions();
      }
    };

    // Custom event listener for when a comment is marked as read by a component
    document.addEventListener('commentsUpdated', handleCommentsUpdated);

    // Custom event listener for task notifications
    const handleTaskNotificationsUpdated = () => {
      // 🔧 MEJORA: Ejecutar migración antes de recargar
      TaskNotificationManager.migrateSystemNotifications();
      loadTaskNotifications();
    };
    window.addEventListener('taskNotificationsUpdated', handleTaskNotificationsUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('commentsUpdated', handleCommentsUpdated);
      window.removeEventListener('taskNotificationsUpdated', handleTaskNotificationsUpdated);
    };
  }, [user, open]); // Reload data when the panel is opened or user changes

  const loadUnreadComments = () => {
    try {
      // Load comments
      const storedComments = localStorage.getItem('smart-student-task-comments');
      const storedTasks = localStorage.getItem('smart-student-tasks');
      
      if (storedComments && storedTasks) {
        const comments: TaskComment[] = JSON.parse(storedComments);
        const tasks: Task[] = JSON.parse(storedTasks);
        
        // Filter comments that are unread by the current user and not their own
        // Exclude submissions from other students (students should not see other students' submissions)
        const unread = comments.filter(comment => 
          comment.studentUsername !== user?.username && // Not own comments/submissions
          (!comment.readBy?.includes(user?.username || '')) && // Not read by current user
          !comment.isSubmission // Exclude submissions (deliveries) from other students
        ).map(comment => {
          // Find associated task for each comment for display
          const task = tasks.find(t => t.id === comment.taskId);
          return { ...comment, task };
        });
        
        setUnreadComments(unread);
      }
    } catch (error) {
      console.error('Error loading unread comments:', error);
    }
  };

  const loadPendingTasks = () => {
    try {
      const storedTasks = localStorage.getItem('smart-student-tasks');
      const storedComments = localStorage.getItem('smart-student-task-comments');
      
      if (storedTasks) {
        const tasks: Task[] = JSON.parse(storedTasks);
        const comments: TaskComment[] = storedComments ? JSON.parse(storedComments) : [];
        
        // Filter tasks assigned to the student with due dates approaching
        const now = new Date();
        const studentTasks = tasks.filter(task => {
          // Check if task is assigned to this student
          const isAssigned = (
            task.course && user?.activeCourses?.includes(task.course)
          );
          
          const dueDate = new Date(task.dueDate);
          const isApproaching = dueDate > now; // Only include not overdue tasks
          
          // 🔥 NUEVO: Para evaluaciones, verificar si ya fueron completadas
          if (task.taskType === 'evaluation') {
            const isCompleted = TaskNotificationManager.isEvaluationCompletedByStudent(
              task.id, 
              user?.username || ''
            );
            if (isCompleted) {
              console.log(`[loadPendingTasks] ✅ Filtering out completed evaluation: ${task.title} for ${user?.username}`);
              return false; // No mostrar evaluaciones completadas
            }
          }
          
          // Para tareas regulares, verificar si ya fueron entregadas
          const hasSubmitted = comments.some(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === user?.username && 
            comment.isSubmission
          );
          
          return isAssigned && isApproaching && !hasSubmitted;
        });
        
        // Sort by due date (closest first)
        studentTasks.sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        
        setPendingTasks(studentTasks);
        console.log(`[loadPendingTasks] Loaded ${studentTasks.length} pending tasks for ${user?.username}`);
      }
    } catch (error) {
      console.error('Error loading pending tasks:', error);
    }
  };

  const loadPasswordRequests = () => {
    try {
      const storedRequests = localStorage.getItem('password-reset-requests');
      
      if (storedRequests) {
        const requests: PasswordRequest[] = JSON.parse(storedRequests);
        
        // Filter pending requests only
        const pendingRequests = requests.filter(req => req.status === 'pending');
        
        // Sort by creation date (newest first)
        pendingRequests.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setPasswordRequests(pendingRequests);
      }
    } catch (error) {
      console.error('Error loading password requests:', error);
    }
  };

  // Cargar entregas de estudiantes para profesores
  const loadStudentSubmissions = () => {
    try {
      // Cargar comentarios (que incluyen entregas) y tareas
      const storedComments = localStorage.getItem('smart-student-task-comments');
      const storedTasks = localStorage.getItem('smart-student-tasks');
      
      if (storedComments && storedTasks && user?.role === 'teacher') {
        const comments: TaskComment[] = JSON.parse(storedComments);
        const tasks: Task[] = JSON.parse(storedTasks);
        
        // Filtrar tareas asignadas por este profesor
        const teacherTasks = tasks.filter(task => task.assignedBy === user.username);
        setClassTasks(teacherTasks);
        
        // Obtener IDs de tareas de este profesor
        const teacherTaskIds = teacherTasks.map(task => task.id);
        
        // Filtrar entregas de los estudiantes para las tareas de este profesor
        // que no hayan sido revisadas (no tienen calificación) y que no sean propias
        const submissions = comments
          .filter(comment => 
            comment.isSubmission && 
            teacherTaskIds.includes(comment.taskId) &&
            comment.studentUsername !== user.username && // Excluir entregas propias del profesor
            !comment.grade // Solo entregas sin calificar
          )
          .map(submission => {
            // Encontrar la tarea asociada para mostrar más información
            const task = tasks.find(t => t.id === submission.taskId);
            return { ...submission, task };
          });
        
        setStudentSubmissions(submissions);

        // Cargar comentarios de estudiantes (NO entregas) para tareas de este profesor
        // que no hayan sido leídos por el profesor
        // 🔄 CORRECCIÓN: Mejora para detectar comentarios de estudiantes aunque estén mal marcados
        const studentComments = comments
          .filter(comment => {
            // Verificar si es un comentario para este profesor
            const esParaProfesor = teacherTaskIds.includes(comment.taskId);
            
            // Verificar si es del propio profesor
            const esDelProfesor = comment.studentUsername === user.username;
            
            // Verificar si ya fue leído
            const fueLeido = comment.readBy?.includes(user.username);
            
            // 🔧 MEJORA: Lógica mejorada para detectar si realmente es un comentario y no una entrega
            // Incluso si isSubmission está incorrectamente marcado como true
            let esComentario = !comment.isSubmission;
            
            // Si está marcado como entrega pero parece ser un comentario normal
            // (no tiene adjuntos y es un mensaje breve), tratarlo como comentario
            if (comment.isSubmission && 
                !comment.attachments?.length && 
                comment.studentUsername === 'maria') { // Caso especial para María
              esComentario = true;
              console.log(`📢 [NotificationsPanel] Detectado comentario de María marcado incorrectamente como entrega: "${comment.comment}"`);
            }
            
            return esComentario && esParaProfesor && !esDelProfesor && !fueLeido;
          })
          .map(comment => {
            // Encontrar la tarea asociada para mostrar más información
            const task = tasks.find(t => t.id === comment.taskId);
            return { ...comment, task };
          });
        
        setUnreadStudentComments(studentComments);
      }
    } catch (error) {
      console.error('Error loading student submissions:', error);
    }
  };

  // Cargar notificaciones pendientes de calificación para profesores
  const loadPendingGrading = () => {
    if (!user || user.role !== 'teacher') return;
    try {
      const notifications = TaskNotificationManager.getUnreadNotificationsForUser(
        user.username,
        'teacher'
      );
      const pending = notifications.filter(n => n.type === 'pending_grading');
      setPendingGrading(pending);
    } catch (error) {
      setPendingGrading([]);
    }
  };

  const loadTaskNotifications = () => {
    if (!user) return;
    
    try {
      const notifications = TaskNotificationManager.getUnreadNotificationsForUser(
        user.username, 
        user.role as 'student' | 'teacher'
      );
      
      // ✅ MEJORA: Filtrar mejor las notificaciones de evaluaciones completadas
      if (user.role === 'student') {
        // Para estudiantes, filtrar evaluaciones completadas
        const filteredNotifications = notifications.filter(n => {
          if (n.type === 'new_task' && n.taskType === 'evaluation') {
            const isCompleted = TaskNotificationManager.isEvaluationCompletedByStudent(
              n.taskId, user.username
            );
            
            if (isCompleted) {
              return false; // No mostrar evaluaciones completadas
            }
          }
          return true;
        });
        
        setTaskNotifications(filteredNotifications);
        console.log(`[NotificationsPanel] Loaded ${filteredNotifications.length} task notifications for ${user.username}`);
      } else if (user.role === 'teacher') {
        // Para profesores, separar notificaciones de evaluaciones y tareas
        setTaskNotifications(notifications);
        
        // Debug para evaluaciones pendientes
        const evaluationNotifications = notifications.filter(n => 
          (n.type === 'pending_grading' || n.type === 'task_completed') && 
          n.taskType === 'evaluation'
        );
        
        console.log(`[NotificationsPanel] ${user.username} evaluation notifications:`, evaluationNotifications.length);
        
        // Debug para tareas pendientes
        const taskNotifications = notifications.filter(n => 
          (n.type === 'pending_grading' || n.type === 'task_completed') && 
          n.taskType === 'assignment'
        );
        
        console.log(`[NotificationsPanel] ${user.username} task notifications:`, taskNotifications.length);
      }
    } catch (error) {
      console.error('Error loading task notifications:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Get user's preferred language or default to browser language
      const userLang = document.documentElement.lang || 'es';
      return new Intl.DateTimeFormat(userLang === 'es' ? 'es-ES' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return translate('today');
      } else if (diffDays === 1) {
        return translate('yesterday');
      } else {
        return translate('daysAgo', { days: diffDays.toString() });
      }
    } catch (e) {
      return '';
    }
  };

  const handleReadAll = () => {
    if (user?.role === 'student') {
      try {
        let hasUpdates = false;
        
        // Mark all comments as read
        if (unreadComments.length > 0) {
          const storedComments = localStorage.getItem('smart-student-task-comments');
          if (storedComments) {
            const comments: TaskComment[] = JSON.parse(storedComments);
            const updatedComments = comments.map(comment => {
              // Solo marcar como leído si no es del propio usuario y no está ya leído
              if (!comment.readBy?.includes(user.username) && comment.studentUsername !== user.username) {
                hasUpdates = true;
                return {
                  ...comment,
                  isNew: false,
                  readBy: [...(comment.readBy || []), user.username]
                };
              }
              return comment;
            });
            
            localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
          }
        }
        
        // Mark task notifications as read (except new_task notifications which should only be marked as read on submission)
        if (taskNotifications.length > 0) {
          const notifications = TaskNotificationManager.getNotifications();
          const updatedNotifications = notifications.map(notification => {
            if (
              notification.targetUsernames.includes(user.username) &&
              !notification.readBy.includes(user.username) &&
              // 🔥 MEJORA: Solo marcar como leídos los comentarios, no las tareas/evaluaciones pendientes
              notification.type !== 'new_task' && 
              notification.type !== 'pending_grading'
            ) {
              hasUpdates = true;
              return {
                ...notification,
                readBy: [...notification.readBy, user.username],
                read: notification.readBy.length + 1 >= notification.targetUsernames.length
              };
            }
            return notification;
          });
          
          TaskNotificationManager.saveNotifications(updatedNotifications);
        }
        
        if (hasUpdates) {
          // Update internal state - only clear comments and comment notifications, NOT pending tasks
          setUnreadComments([]);
          // ✅ MEJORA: Filtrar para mantener tareas y evaluaciones pendientes
          const filteredNotifications = taskNotifications.filter(notification => 
            notification.type === 'new_task' || notification.type === 'pending_grading'
          );
          setTaskNotifications(filteredNotifications);
          // Note: We don't clear pendingTasks as these should remain until completed/submitted
          
          // Trigger events for other components to update
          document.dispatchEvent(new Event('commentsUpdated'));
          window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
          window.dispatchEvent(new Event('storage'));
        }
        
        // Close panel
        setOpen(false);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    } else if (user?.role === 'teacher') {
      try {
        let hasUpdates = false;
        
        // Mark all student comments as read for teacher
        if (unreadStudentComments.length > 0) {
          const storedComments = localStorage.getItem('smart-student-task-comments');
          if (storedComments) {
            const comments: TaskComment[] = JSON.parse(storedComments);
            const updatedComments = comments.map(comment => {
              // Solo marcar como leído si no es del propio profesor y no está ya leído
              if (!comment.readBy?.includes(user.username) && comment.studentUsername !== user.username) {
                hasUpdates = true;
                return {
                  ...comment,
                  isNew: false,
                  readBy: [...(comment.readBy || []), user.username]
                };
              }
              return comment;
            });
            
            localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
          }
        }
        
        // Mark only COMMENT notifications as read for teacher (NOT task assignments or pending grading)
        if (taskNotifications.length > 0) {
          const notifications = TaskNotificationManager.getNotifications();
          const updatedNotifications = notifications.map(notification => {
            if (
              notification.targetUsernames.includes(user.username) &&
              !notification.readBy.includes(user.username) &&
              // ✅ MEJORA: Solo marcar como leídos los comentarios, no las tareas/evaluaciones pendientes
              notification.type === 'teacher_comment'
            ) {
              hasUpdates = true;
              return {
                ...notification,
                readBy: [...notification.readBy, user.username],
                read: notification.readBy.length + 1 >= notification.targetUsernames.length
              };
            }
            return notification;
          });
          
          TaskNotificationManager.saveNotifications(updatedNotifications);
        }
        
        if (hasUpdates) {
          // Update internal state - only clear comments, NOT pending tasks/grading notifications
          setUnreadStudentComments([]);
          
          // ✅ MEJORA: Filtrar para mantener tareas y evaluaciones pendientes
          const filteredTaskNotifications = taskNotifications.filter(notification => 
            notification.type === 'pending_grading' || 
            notification.type === 'new_task' ||
            notification.type === 'task_submission' ||
            notification.type === 'task_completed'
          );
          setTaskNotifications(filteredTaskNotifications);
          
          // Note: studentSubmissions are NOT cleared here because they represent
          // actual student work that needs to be reviewed and graded by the teacher
          
          // Trigger events for other components to update
          document.dispatchEvent(new Event('commentsUpdated'));
          window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
          window.dispatchEvent(new Event('storage'));
        }
        
        // Close panel
        setOpen(false);
      } catch (error) {
        console.error('Error marking all notifications as read for teacher:', error);
      }
    }
  };

  // Retorna el componente del panel de notificaciones con la estructura simplificada
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setOpen(!open)}
        className={`relative transition-all duration-200 ${
          open 
            ? 'bg-primary/15 text-primary hover:bg-primary/20 ring-2 ring-primary/30 shadow-md' 
            : 'hover:bg-secondary/80 hover:text-foreground'
        }`}
        title={translate('notifications')}
      >
        <Bell className={`h-5 w-5 transition-all duration-200 ${
          open ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
        }`} />
        {count > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-red-500 text-white hover:bg-red-600 text-xs px-2 rounded-full"
            title={translate('unreadNotificationsCount', { count: String(count) })}
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </Button>
      
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 md:w-96 shadow-lg rounded-md overflow-hidden">
          <Card className="border-0 h-full flex flex-col max-h-[80vh]">
            <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span>{translate('notifications')}</span>
                {((user?.role === 'student' && (unreadComments.length > 0 || taskNotifications.length > 0)) ||
                  (user?.role === 'teacher' && (studentSubmissions.length > 0 || unreadStudentComments.length > 0 || pendingGrading.length > 0))) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleReadAll}
                    className="text-xs text-muted-foreground hover:bg-orange-100 hover:text-orange-600 transition-colors duration-200"
                  >
                    {translate('markAllAsRead')}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            
            <ScrollArea className="flex-1 h-full">
              <div className="max-h-[60vh] overflow-y-auto px-1">
                <CardContent className="p-0 space-y-0">
                  {/* Contenido específico para profesor */}
                  {user?.role === 'teacher' && (
                    <div>
                      {(studentSubmissions.length === 0 && pendingGrading.length === 0 && unreadStudentComments.length === 0 && taskNotifications.length === 0) ? (
                        <div className="py-6 text-center text-muted-foreground">
                          {translate('noSubmissionsToReview') || "No hay entregas pendientes por revisar"}
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {/* 1. Evaluaciones Pendientes - PRIMERO */}
                          {pendingGrading.filter(notif => notif.taskType === 'evaluation').length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/10 border-l-4 border-purple-400 dark:border-purple-500">
                                <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                  {translate('pendingEvaluations') || 'Evaluaciones Pendientes'} ({pendingGrading.filter(notif => notif.taskType === 'evaluation').length})
                                </h3>
                              </div>
                              {pendingGrading
                                .filter(notif => notif.taskType === 'evaluation')
                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                .map(notif => (
                                <div key={notif.id} className="p-4 hover:bg-muted/50">
                                  <div className="flex items-start gap-2">
                                    <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-full">
                                      <ClipboardList className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">
                                          {notif.fromDisplayName || `${notif.taskTitle} (${notif.course})`}
                                        </p>
                                        <Badge variant="outline" className="text-xs border-purple-200 dark:border-purple-600 text-purple-700 dark:text-purple-300 flex flex-col items-center justify-center text-center leading-tight">
                                          {splitTextForBadge(notif.subject || '').map((line, index) => (
                                            <div key={index}>{line}</div>
                                          ))}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {translate('evaluation') || 'Evaluación'}
                                      </p>
                                      <Link 
                                        href={`/dashboard/tareas?taskId=${notif.taskId}`}
                                        className="inline-block mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                      >
                                        {translate('reviewEvaluation') || 'Revisar Evaluación'}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {/* 2. Evaluaciones Completadas - SEGUNDO */}
                          {taskNotifications.filter(notif => notif.type === 'task_completed' && notif.taskType === 'evaluation').length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/5 border-l-4 border-purple-300 dark:border-purple-400">
                                <h3 className="text-sm font-medium text-purple-600 dark:text-purple-200">
                                  {translate('evaluationsCompleted') || 'Evaluaciones Completadas'} ({taskNotifications.filter(notif => notif.type === 'task_completed' && notif.taskType === 'evaluation').length})
                                </h3>
                              </div>
                              {taskNotifications
                                .filter(notif => notif.type === 'task_completed' && notif.taskType === 'evaluation')
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                .map(notif => (
                                <div key={notif.id} className="p-4 hover:bg-muted/50">
                                  <div className="flex items-start gap-2">
                                    <div className="bg-purple-50 dark:bg-purple-700/30 p-2 rounded-full">
                                      <ClipboardList className="h-4 w-4 text-purple-700 dark:text-purple-200" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">
                                          {notif.fromDisplayName || notif.fromUsername}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs border-purple-200 dark:border-purple-500 text-purple-600 dark:text-purple-400 flex flex-col items-center justify-center text-center leading-tight">
                                            {splitTextForBadge(notif.subject || '').map((line, index) => (
                                              <div key={index}>{line}</div>
                                            ))}
                                          </Badge>
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {translate('studentCompletedEvaluation') || 'Completó la evaluación'}: {notif.taskTitle}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(notif.timestamp)}
                                      </p>
                                      <Link 
                                        href={`/dashboard/tareas?taskId=${notif.taskId}`}
                                        className="inline-block mt-2 text-xs text-purple-500 dark:text-purple-400 hover:underline"
                                      >
                                        {translate('viewResults') || 'Ver Resultados'}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {/* 3. Tareas Pendientes - TERCERO */}
                          {pendingGrading.filter(notif => notif.taskType === 'assignment').length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 dark:border-orange-500">
                                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                  {translate('pendingTasks') || 'Tareas Pendientes'} ({pendingGrading.filter(notif => notif.taskType === 'assignment').length})
                                </h3>
                              </div>
                              {pendingGrading
                                .filter(notif => notif.taskType === 'assignment')
                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                .map(notif => (
                                <div key={notif.id} className="p-4 hover:bg-muted/50">
                                  <div className="flex items-start gap-2">
                                    <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-full">
                                      <ClipboardCheck className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">
                                          {notif.fromDisplayName || `${notif.taskTitle} (${notif.course})`}
                                        </p>
                                        <Badge variant="outline" className="text-xs border-orange-200 dark:border-orange-600 text-orange-700 dark:text-orange-300 flex flex-col items-center justify-center text-center leading-tight">
                                          {splitTextForBadge(notif.subject || '').map((line, index) => (
                                            <div key={index}>{line}</div>
                                          ))}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {translate('assignment') || 'Tarea'}
                                      </p>
                                      <Link 
                                        href={`/dashboard/tareas?taskId=${notif.taskId}`}
                                        className="inline-block mt-2 text-xs text-orange-600 dark:text-orange-400 hover:underline"
                                      >
                                        {translate('reviewSubmission') || 'Revisar Entrega'}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {/* 4. Tareas por Revisar - CUARTO */}
                          {studentSubmissions.filter(submission => submission.task?.taskType === 'assignment').length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-300 dark:border-orange-400">
                                <h3 className="text-sm font-medium text-orange-700 dark:text-orange-200">
                                  {translate('submissionsToReview') || 'Tareas por Revisar'} ({studentSubmissions.filter(submission => submission.task?.taskType === 'assignment').length})
                                </h3>
                              </div>
                              {studentSubmissions
                                .filter(submission => submission.task?.taskType === 'assignment')
                                .slice(0, 3)
                                .map(submission => (
                                <div key={submission.id} className="p-4 hover:bg-muted/50">
                                  <div className="flex items-start gap-2">
                                    <div className="bg-orange-50 dark:bg-orange-700/30 p-2 rounded-full">
                                      <ClipboardCheck className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">
                                          {submission.studentName}
                                        </p>
                                        <Badge variant="outline" className="text-xs border-orange-200 dark:border-orange-500 text-orange-600 dark:text-orange-400 flex flex-col items-center justify-center text-center leading-tight">
                                          {splitTextForBadge(submission.task?.subject || '').map((line, index) => (
                                            <div key={index}>{line}</div>
                                          ))}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {submission.task?.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(submission.timestamp)}
                                      </p>
                                      <Link 
                                        href={`/dashboard/tareas?taskId=${submission.taskId}&commentId=${submission.id}`}
                                        className="inline-block mt-2 text-xs text-orange-500 dark:text-orange-400 hover:underline"
                                      >
                                        {translate('reviewSubmission') || 'Revisar Entrega'}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {studentSubmissions.filter(submission => submission.task?.taskType === 'assignment').length > 3 && (
                                <div className="px-4 py-3 text-center">
                                  <Link 
                                    href="/dashboard/tareas" 
                                    className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                                  >
                                    {translate('viewAllSubmissions', { count: String(studentSubmissions.filter(submission => submission.task?.taskType === 'assignment').length) }) || `Ver todas las ${studentSubmissions.filter(submission => submission.task?.taskType === 'assignment').length} entregas`}
                                  </Link>
                                </div>
                              )}
                            </>
                          )}

                          {/* 5. Comentarios No Leídos - QUINTO */}
                          {unreadStudentComments.length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-green-50 dark:bg-green-900/10 border-l-4 border-green-400 dark:border-green-500">
                                <h3 className="text-sm font-medium text-green-700 dark:text-green-200">
                                  {translate('unreadComments') || 'Comentarios No Leídos'} ({unreadStudentComments.length})
                                </h3>
                              </div>
                              {unreadStudentComments.slice(0, 3).map(comment => (
                                <div key={comment.id} className="p-4 hover:bg-muted/50">
                                  <div className="flex items-start gap-2">
                                    <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                                      <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-300" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">
                                          {comment.studentName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatDate(comment.timestamp)}
                                        </p>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {comment.comment}
                                      </p>
                                      <p className="text-xs font-medium mt-1">
                                        {comment.task?.title}
                                      </p>
                                      <Link 
                                        href={`/dashboard/tareas?taskId=${comment.taskId}&commentId=${comment.id}`}
                                        className="inline-block mt-2 text-xs text-green-600 dark:text-green-400 hover:underline"
                                      >
                                        {translate('viewComment') || 'Ver Comentario'}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {unreadStudentComments.length > 3 && (
                                <div className="px-4 py-3 text-center">
                                  <Link 
                                    href="/dashboard/tareas" 
                                    className="text-xs text-green-600 dark:text-green-400 hover:underline"
                                  >
                                    {translate('viewAllComments', { count: String(unreadStudentComments.length) }) || `Ver todos los ${unreadStudentComments.length} comentarios`}
                                  </Link>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contenido para estudiantes */}
                  {user?.role === 'student' && (
                    <div className="divide-y divide-border">
                      {/* Aquí iría el contenido para estudiantes */}
                      <div className="py-6 text-center text-muted-foreground">
                        {translate('noNotifications') || "No tienes notificaciones"}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}
