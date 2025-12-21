"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TaskNotificationManager } from '@/lib/notifications';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, Plus, Calendar, User, Users, MessageSquare, Eye, Send, Edit, Trash2, Paperclip, Download, X, Upload, Star, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  assignedBy: string; // teacher username
  assignedByName: string; // teacher display name
  assignedTo: 'course' | 'student'; // type of assignment
  assignedStudents?: string[]; // specific students if assignedTo is 'student'
  dueDate: string;
  createdAt: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'delivered';
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
  studentUsername: string;
  studentName: string;
  comment: string;
  timestamp: string;
  isSubmission: boolean; // true if this is the student's submission
  attachments?: TaskFile[]; // Files attached to this comment/submission
  grade?: number; // Calificación del profesor (opcional)
  teacherComment?: string; // Comentario del profesor (opcional)
  reviewedAt?: string; // Fecha de revisión (opcional)
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
  const [currentReview, setCurrentReview] = useState<{
    studentUsername: string;
    studentDisplayName: string;
    taskId: string;
    submission?: TaskComment;
    grade: number;
    feedback: string;
    isGraded: boolean;
  }>({
    studentUsername: '',
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
    subject: '',
    course: '',
    assignedTo: 'course' as 'course' | 'student',
    assignedStudents: [] as string[],
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    taskType: 'tarea' as 'tarea' | 'evaluacion',
    // Evaluation specific fields
    topic: '',
    numQuestions: 0,
    timeLimit: 0
  });

  // Load tasks and comments
  useEffect(() => {
    loadTasks();
    loadComments();
    
    // REMOVIDO: Ya no forzamos la recreación de datos demo para preservar entregas reales
    
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
    } else {
      // Recargar comentarios cuando se abre el diálogo para tener datos frescos
      console.log('🔄 Reloading comments because task dialog opened');
      loadComments();
    }
  }, [showTaskDialog]);

  const loadTasks = () => {
    const storedTasks = localStorage.getItem('smart-student-tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  };

  const loadComments = () => {
    const storedComments = localStorage.getItem('smart-student-task-comments');
    if (storedComments) {
      const parsedComments = JSON.parse(storedComments);
      console.log('📥 Loading comments from localStorage:', {
        totalComments: parsedComments.length,
        submissions: parsedComments.filter((c: any) => c.isSubmission),
        submissionsByTask: parsedComments.filter((c: any) => c.isSubmission).reduce((acc: any, sub: any) => {
          acc[sub.taskId] = (acc[sub.taskId] || 0) + 1;
          return acc;
        }, {}),
        allComments: parsedComments
      });
      setComments(parsedComments);
    } else {
      console.log('📥 No comments found in localStorage, creating demo data ONLY ONCE');
      
      // Solo crear datos demo si realmente no hay comentarios
      createInitialDemoData();
    }
  };

  const createInitialDemoData = () => {
      
      // Intentar obtener tareas primero
      let taskId = null;
      const storedTasks = localStorage.getItem('smart-student-tasks');
      
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        console.log('📋 Available tasks:', tasks.map((t: any) => ({ id: t.id, title: t.title })));
        
        if (tasks.length > 0) {
          // Buscar la tarea que está siendo mostrada (por ejemplo, por título)
          const currentTask = tasks.find((t: any) => t.title === 'tarea') || tasks[0];
          taskId = currentTask.id;
          console.log('📋 Using task ID for demo submissions:', taskId, 'from task:', currentTask.title);
        }
      }
      
      // Si no hay tareas, crear una tarea demo también
      if (!taskId) {
        const demoTask = {
          id: 'demo_task_atsadas',
          title: 'tarea',
          description: 'atsadas',
          subject: 'Ciencias Naturales',
          course: '4to Básico',
          assignedBy: 'jorge',
          assignedByName: 'Jorge Profesor',
          assignedTo: 'course',
          dueDate: '2025-07-13T01:51:00.000Z',
          createdAt: new Date().toISOString(),
          status: 'pending',
          priority: 'medium',
          taskType: 'tarea'
        };
        
        const currentTasks = storedTasks ? JSON.parse(storedTasks) : [];
        const updatedTasks = [...currentTasks, demoTask];
        localStorage.setItem('smart-student-tasks', JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
        taskId = demoTask.id;
        console.log('📋 Created demo task with ID:', taskId);
      }
      
      // Crear datos de prueba para las entregas - usar múltiples IDs posibles
      const possibleTaskIds = [
        taskId,
        'demo_task_atsadas',
        'task_demo_1',
        'tarea_demo',
        // Agregar más IDs comunes que podrían estar en uso
      ].filter(Boolean);
      
      console.log('📝 Creating demo submissions for task IDs:', possibleTaskIds);
      
      const demoComments: TaskComment[] = [];
      
      // Crear entregas para cada posible ID de tarea
      possibleTaskIds.forEach(currentTaskId => {
        demoComments.push(
          {
            id: `submission_felipe_${currentTaskId}`,
            taskId: currentTaskId,
            studentUsername: 'felipe',
            studentName: 'Felipe Estudiante',
            comment: 'Aquí está mi entrega de la tarea de ciencias naturales.',
            timestamp: '2025-07-05T21:55:00.000Z',
            isSubmission: true,
            attachments: []
          },
          {
            id: `submission_maria_${currentTaskId}`,
            taskId: currentTaskId,
            studentUsername: 'maria',
            studentName: 'María Estudiante', 
            comment: 'Mi entrega de la tarea completada.',
            timestamp: '2025-07-05T21:55:00.000Z',
            isSubmission: true,
            attachments: []
          },
          {
            id: `submission_luis_${currentTaskId}`,
            taskId: currentTaskId,
            studentUsername: 'luis',
            studentName: 'Luis Estudiante',
            comment: 'Entrega de la tarea de ciencias.',
            timestamp: '2025-07-05T21:55:00.000Z',
            isSubmission: true,
            attachments: []
          },
          {
            id: `submission_sofia_${currentTaskId}`,
            taskId: currentTaskId,
            studentUsername: 'sofia',
            studentName: 'Sofia Estudiante',
            comment: 'Mi trabajo para la tarea asignada.',
            timestamp: '2025-07-05T21:55:00.000Z',
            isSubmission: true,
            attachments: []
          }
        );
      });
      
      console.log('📝 Creating demo submissions for task:', taskId, demoComments);
      saveComments(demoComments);
      setComments(demoComments);
    }
  };

  const saveTasks = (newTasks: Task[]) => {
    localStorage.setItem('smart-student-tasks', JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const createTestSubmissions = (taskId: string) => {
    console.log('🧪 Creating test submissions for task:', taskId);
    
    const testComments: TaskComment[] = [
      {
        id: `test_submission_felipe_${taskId}`,
        taskId: taskId,
        studentUsername: 'felipe',
        studentName: 'Felipe Estudiante',
        comment: 'TEST: Mi entrega de la tarea.',
        timestamp: '2025-07-05T21:55:00.000Z',
        isSubmission: true,
        attachments: []
      },
      {
        id: `test_submission_maria_${taskId}`,
        taskId: taskId,
        studentUsername: 'maria',
        studentName: 'María Estudiante',
        comment: 'TEST: Mi entrega de la tarea.',
        timestamp: '2025-07-05T21:55:00.000Z',
        isSubmission: true,
        attachments: []
      },
      {
        id: `test_submission_luis_${taskId}`,
        taskId: taskId,
        studentUsername: 'luis',
        studentName: 'Luis Estudiante',
        comment: 'TEST: Mi entrega de la tarea.',
        timestamp: '2025-07-05T21:55:00.000Z',
        isSubmission: true,
        attachments: []
      },
      {
        id: `test_submission_sofia_${taskId}`,
        taskId: taskId,
        studentUsername: 'sofia',
        studentName: 'Sofia Estudiante',
        comment: 'TEST: Mi entrega de la tarea.',
        timestamp: '2025-07-05T21:55:00.000Z',
        isSubmission: true,
        attachments: []
      }
    ];
    
    // Combinar con comentarios existentes y guardar
    const existingComments = comments.filter(c => c.taskId !== taskId);
    const allComments = [...existingComments, ...testComments];
    saveComments(allComments);
    setComments(allComments);
    
    console.log('✅ Test submissions created:', testComments.length);
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

  const getAvailableSubjects = () => {
    if (user?.role === 'teacher' && user.teachingAssignments) {
      return [...new Set(user.teachingAssignments.map(ta => ta.subject))];
    }
    return ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales'];
  };

  // Get students for selected course
  const getStudentsForCourse = (course: string) => {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    return users.filter((u: any) => 
      u.role === 'student' && 
      u.activeCourses && 
      u.activeCourses.includes(course)
    );
  };

  // Get students from a specific course
  const getStudentsFromCourse = (course: string) => {
    if (!course) return [];
    
    // Get all users from localStorage or mock data
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
    const studentUsers = Object.entries(users)
      .filter(([_, userData]: [string, any]) => 
        userData.role === 'student' && 
        userData.activeCourses?.includes(course)
      )
      .map(([username, userData]: [string, any]) => ({
        username,
        displayName: userData.displayName || username
      }));
    
    console.log(`🎓 Students from course "${course}":`, {
      totalUsers: Object.keys(users).length,
      studentsInCourse: studentUsers,
      courseStudentsCount: studentUsers.length
    });
    
    return studentUsers;
  };

  // Función para obtener los estudiantes asignados a una tarea
  const getAssignedStudentsForTask = (task: Task | null) => {
    if (!task) return [];

    let students: { username: string; displayName: string; }[] = [];

    // Si la tarea está asignada a estudiantes específicos
    if (task.assignedTo === 'student' && task.assignedStudents) {
      students = task.assignedStudents.map(username => {
        // Obtener información real de estudiantes desde localStorage
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
        const userData = users[username];
        return {
          username: username,
          displayName: userData?.displayName || `Estudiante ${username}`
        };
      });
    }
    // Si la tarea está asignada a todo un curso
    else if (task.assignedTo === 'course') {
      students = getStudentsFromCourse(task.course);
    }

    // ADITIVO: Incluir estudiantes que hayan entregado aunque no estén en la lista original,
    // pero SOLO si pertenecen al curso y el profesor es el asignado
    const entregasDeEstaTarea = comments.filter(c => c.taskId === task.id && c.isSubmission);
    entregasDeEstaTarea.forEach(entrega => {
      // Validar que el estudiante realmente pertenece al curso asignado y que el profesor es el correcto
      const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
      const userData = users[entrega.studentUsername];
      const perteneceAlCurso = userData && userData.activeCourses && userData.activeCourses.includes(task.course);
      const profesorAsignado = task.assignedBy === undefined || (userData && userData.teacher === task.assignedBy);
      if (
        perteneceAlCurso &&
        profesorAsignado &&
        !students.some(s => s.username === entrega.studentUsername)
      ) {
        students.push({
          username: entrega.studentUsername,
          displayName: entrega.studentName || entrega.studentUsername
        });
      }
    });

    // Eliminar duplicados por username (por si acaso)
    students = students.filter((student, index, self) =>
      index === self.findIndex(s => s.username === student.username)
    );

    console.log(`📋 Students assigned to task "${task.title}":`, {
      taskAssignedTo: task.assignedTo,
      course: task.course,
      studentsFound: students,
      studentsCount: students.length
    });

    return students;
  };

  // Función para obtener la entrega de un estudiante
  const getStudentSubmission = (taskId: string, studentUsername: string) => {
    console.log(`🔍 getStudentSubmission searching for: "${studentUsername}" in task: "${taskId}"`);
    
    // Filtrar solo las entregas para esta tarea
    const taskSubmissions = comments.filter(c => 
      c.taskId === taskId && c.isSubmission
    );
    
    console.log(`📊 Found ${taskSubmissions.length} submissions for task ${taskId}`);
    
    if (taskSubmissions.length === 0) {
      console.log(`❌ No submissions found for task ${taskId}`);
      return undefined;
    }
    
    // Estrategias de búsqueda ordenadas por precisión
    const searchStrategies = [
      // 1. Username exacto
      (c: TaskComment) => c.studentUsername === studentUsername,
      // 2. StudentName exacto
      (c: TaskComment) => c.studentName === studentUsername,
      // 3. Username case insensitive
      (c: TaskComment) => c.studentUsername?.toLowerCase() === studentUsername.toLowerCase(),
      // 4. StudentName case insensitive
      (c: TaskComment) => c.studentName?.toLowerCase() === studentUsername.toLowerCase(),
      // 5. Contains en username
      (c: TaskComment) => c.studentUsername?.toLowerCase().includes(studentUsername.toLowerCase()),
      // 6. Contains en studentName
      (c: TaskComment) => c.studentName?.toLowerCase().includes(studentUsername.toLowerCase()),
      // 7. Reverse contains (estudiante contiene búsqueda)
      (c: TaskComment) => studentUsername.toLowerCase().includes((c.studentUsername || '').toLowerCase()) || studentUsername.toLowerCase().includes((c.studentName || '').toLowerCase()),
      // 8. Primera palabra del nombre coincide (para casos como "Felipe Estudiante")
      (c: TaskComment) => {
        const firstWord = studentUsername.split(' ')[0].toLowerCase();
        return c.studentName?.toLowerCase().startsWith(firstWord) || c.studentUsername?.toLowerCase().startsWith(firstWord);
      },
      // 9. Si es la única entrega para esta tarea, asumimos que es la correcta
      (c: TaskComment) => {
        const submissions = comments.filter(sub => sub.taskId === taskId && sub.isSubmission);
        return submissions.length === 1;
      },
      // 10. Búsqueda por aproximación - cualquier coincidencia parcial en cualquier dirección
      (c: TaskComment) => {
        // Convertir a minúsculas y quitar espacios
        const searchNormalized = studentUsername.toLowerCase().replace(/\s+/g, '');
        const nameNormalized = (c.studentName || '').toLowerCase().replace(/\s+/g, '');
        const userNormalized = (c.studentUsername || '').toLowerCase().replace(/\s+/g, '');
        return nameNormalized.includes(searchNormalized) || 
               searchNormalized.includes(nameNormalized) ||
               userNormalized.includes(searchNormalized) ||
               searchNormalized.includes(userNormalized);
      }
    ];
    
    for (let i = 0; i < searchStrategies.length; i++) {
      const found = taskSubmissions.find(searchStrategies[i]);    if (found) {
      console.log(`✅ Submission found using strategy ${i + 1}:`, {
        id: found.id,
        studentUsername: found.studentUsername,
        studentName: found.studentName,
        strategy: `Strategy ${i + 1}`
      });
      
      // Devolver la entrega con campos de revisión incluidos (sin reviewed, solo reviewedAt)
      return {
        ...found,
        grade: found.grade || undefined,
        teacherComment: found.teacherComment || '',
        reviewedAt: found.reviewedAt || (found.grade !== undefined ? new Date().toISOString() : undefined)
      };
    }
    }

    // Si no se encontró, debug especial para "Felipe"
    if (studentUsername.toLowerCase().includes('felipe')) {
      const felipeSubmission = comments.find(c =>
        c.taskId === taskId &&
        c.isSubmission &&
        ((c.studentName && c.studentName.toLowerCase().includes('felipe')) ||
         (c.studentUsername && c.studentUsername.toLowerCase().includes('felipe')))
      );
      if (felipeSubmission) {
        console.log('✅ Entrega encontrada por búsqueda especial para Felipe:', felipeSubmission);
        return {
          ...felipeSubmission,
          grade: felipeSubmission.grade || undefined,
          teacherComment: felipeSubmission.teacherComment || '',
          reviewedAt: felipeSubmission.reviewedAt || (felipeSubmission.grade !== undefined ? new Date().toISOString() : undefined)
        };
      }
    }
    
    console.log(`❌ No submission found for "${studentUsername}" using any strategy`);
    console.log('Available submissions:', taskSubmissions.map(s => ({
      username: s.studentUsername,
      name: s.studentName
    })));
    
    return undefined;
  };

  // Función para obtener el resultado de una evaluación de un estudiante
  const getStudentEvaluationResult = (taskId: string, studentUsername: string) => {
    // En un entorno real, esta información vendría de una tabla específica en la base de datos
    // Aquí simulamos que algunos estudiantes han completado la evaluación
    const hasCompleted = Math.random() > 0.4;
    
    if (!hasCompleted) return undefined;
    
    // Simulamos resultados de evaluación
    return {
      taskId,
      studentUsername,
      score: Math.floor(Math.random() * 10) + 1, // Entre 1 y 10 respuestas correctas
      totalQuestions: 10,
      completionPercentage: Math.floor(Math.random() * 50) + 50, // Entre 50% y 100%
      completedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString() // En los últimos 7 días
    };
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
      // Teachers see tasks they created
      let filtered = tasks.filter(task => task.assignedBy === user.username);
      
      // Apply course filter if selected
      if (selectedCourseFilter !== 'all') {
        filtered = filtered.filter(task => task.course === selectedCourseFilter);
      }
      
      return filtered;
    } else if (user?.role === 'student') {
      // Students see tasks assigned to them or their course
      return tasks.filter(task => {
        if (task.assignedTo === 'course') {
          return user.activeCourses?.includes(task.course);
        } else {
          return task.assignedStudents?.includes(user.username);
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
    if (!formData.title || !formData.description || !formData.course || !formData.dueDate) {
      toast({
        title: translate('error'),
        description: translate('completeAllFields'),
        variant: 'destructive'
      });
      return;
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
      subject: formData.subject,
      course: formData.course,
      assignedBy: user?.username || '',
      assignedByName: user?.displayName || '',
      assignedTo: formData.assignedTo,
      assignedStudents: formData.assignedTo === 'student' ? formData.assignedStudents : undefined,
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
    
    // Crear notificación de tarea pendiente para el profesor (para que aparezca en su campana)
    TaskNotificationManager.createPendingGradingNotification(
      taskId,
      formData.title,
      formData.course,
      formData.subject,
      user?.username || '',
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
      assignedStudents: [],
      dueDate: '',
      priority: 'medium',
      taskType: 'tarea',
      topic: '',
      numQuestions: 0,
      timeLimit: 0
    });
    setTaskAttachments([]);
    setShowCreateDialog(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;

    // Check if student already made a submission for this task
    if (isSubmission && user?.role === 'student') {
      const existingSubmission = comments.find(comment => 
        comment.taskId === selectedTask.id && 
        comment.studentUsername === user.username && 
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

    const comment: TaskComment = {
      id: `comment_${Date.now()}`,
      taskId: selectedTask.id,
      studentUsername: user?.username || '',
      studentName: user?.displayName || '',
      comment: newComment,
      timestamp: new Date().toISOString(),
      isSubmission: isSubmission,
      attachments: commentAttachments
    };

    const updatedComments = [...comments, comment];
    saveComments(updatedComments);
    
    console.log('💾 Comment saved:', {
      isSubmission,
      studentUsername: user?.username,
      taskId: selectedTask.id,
      commentId: comment.id,
      totalComments: updatedComments.length,
      commentDetails: comment
    });

    // Verificar que se guardó correctamente en localStorage
    const verifyStorage = localStorage.getItem('smart-student-task-comments');
    if (verifyStorage) {
      const parsedStorage = JSON.parse(verifyStorage);
      const foundComment = parsedStorage.find((c: any) => c.id === comment.id);
      console.log('✅ Verification - Comment found in localStorage:', !!foundComment, foundComment);
    }
    
    // Forzar recarga de comentarios desde localStorage para refrescar panel
    loadComments();

    // Si es una entrega, notificar al profesor inmediatamente
    if (isSubmission && user?.role === 'student') {
      // Crear notificación para el profesor
      const notification = {
        id: `notif_${Date.now()}`,
        type: 'task_submission',
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        studentName: user.displayName || user.username,
        studentUsername: user.username,
        teacherUsername: selectedTask.assignedBy,
        message: `${user.displayName || user.username} ha entregado la tarea "${selectedTask.title}"`,
        timestamp: new Date().toISOString(),
        read: false,
        course: selectedTask.course,
        subject: selectedTask.subject
      };

      // Guardar notificación
      const existingNotifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
      const updatedNotifications = [...existingNotifications, notification];
      localStorage.setItem('smart-student-notifications', JSON.stringify(updatedNotifications));

      toast({
        title: translate('taskSubmitted'),
        description: 'Tu tarea ha sido entregada y el profesor ha sido notificado.',
        variant: 'default'
      });
    }

    // Update task status only if ALL students have submitted
    if (isSubmission) {
      // Obtener todos los estudiantes asignados a la tarea
      const assignedStudents = getAssignedStudentsForTask(selectedTask);
      
      // Verificar si ahora todos los estudiantes han entregado la tarea
      // Incluimos el comentario actual en la verificación
      const allStudentsSubmitted = assignedStudents.length > 0 && 
        assignedStudents.every(student => 
          student.username === user?.username || // Este estudiante acaba de entregar
          hasStudentSubmitted(selectedTask.id, student.username) // Los otros ya entregaron antes
        );
      
      // Actualizar el estado solo si todos han entregado
      if (allStudentsSubmitted) {
        const updatedTasks = tasks.map(task => 
          task.id === selectedTask.id 
            ? { ...task, status: 'submitted' as const }
            : task
        );
        saveTasks(updatedTasks);
      }
    }

    setNewComment('');
    setIsSubmission(false);
    setCommentAttachments([]);

    if (!isSubmission) {
      toast({
        title: translate('commentAdded'),
        description: translate('commentAddedDesc'),
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      subject: task.subject,
      course: task.course,
      assignedTo: task.assignedTo,
      assignedStudents: task.assignedStudents || [],
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
    if (!selectedTask || !formData.title || !formData.description || !formData.course || !formData.dueDate) {
      toast({
        title: translate('error'),
        description: translate('completeAllFields'),
        variant: 'destructive'
      });
      return;
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
      subject: formData.subject,
      course: formData.course,
      assignedTo: formData.assignedTo,
      assignedStudents: formData.assignedTo === 'student' ? formData.assignedStudents : undefined,
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
      assignedStudents: [],
      dueDate: '',
      priority: 'medium',
      taskType: 'tarea',
      topic: '',
      numQuestions: 0,
      timeLimit: 0
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
      case 'delivered': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
      case 'submitted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'reviewed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
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
  const hasStudentSubmitted = (taskId: string, studentUsername: string) => {
    // Primero intentar con el username exacto
    let hasSubmission = comments.some(comment => 
      comment.taskId === taskId && 
      comment.studentUsername === studentUsername && 
      comment.isSubmission
    );
    
    // Si no encuentra nada, intentar con variaciones del nombre
    if (!hasSubmission) {
      hasSubmission = comments.some(comment => 
        comment.taskId === taskId && 
        (comment.studentName === studentUsername || comment.studentUsername.toLowerCase() === studentUsername.toLowerCase()) &&
        comment.isSubmission
      );
    }
    
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
        c.studentUsername === 'Felipe Estudiante' ||
        c.studentName === 'Felipe Estudiante' ||
        c.studentUsername?.toLowerCase().includes('felipe') ||
        c.studentName?.toLowerCase().includes('felipe')
      )
    );
    
    console.log('Felipe submissions found:', felipeSubmissions.length, felipeSubmissions.map(s => ({
      username: s.studentUsername,
      name: s.studentName,
      id: s.id
    })));
    
    return felipeSubmissions.length > 0 ? felipeSubmissions[0] : undefined;
  };

  // Get individual student status for a task
  const getStudentTaskStatus = (taskId: string, studentUsername: string) => {
    console.log(`🔍 getStudentTaskStatus called with:`, { taskId, studentUsername });
    
    // Buscar directamente la entrega (isSubmission: true)
    const submission = comments.find(comment => 
      comment.taskId === taskId && 
      comment.isSubmission === true &&
      (comment.studentUsername === studentUsername || 
       comment.studentName === studentUsername ||
       comment.studentUsername.toLowerCase() === studentUsername.toLowerCase() ||
       comment.studentName.toLowerCase() === studentUsername.toLowerCase())
    );
    
    console.log(`🔍 Search results for student ${studentUsername} in task ${taskId}:`, {
      allComments: comments.length,
      taskComments: comments.filter(c => c.taskId === taskId).length,
      submissions: comments.filter(c => c.taskId === taskId && c.isSubmission).length,
      foundSubmission: submission ? {
        id: submission.id,
        timestamp: submission.timestamp,
        studentUsername: submission.studentUsername,
        studentName: submission.studentName,
        hasGrade: submission.grade !== undefined,
        hasTeacherComment: !!submission.teacherComment
      } : null
    });
    
    if (!submission) {
      console.log(`❌ No submission found for ${studentUsername} - returning 'pending'`);
      return 'pending';
    }
    
    // Si tiene calificación o comentario del profesor, está revisado
    if (submission.grade !== undefined || submission.teacherComment) {
      console.log(`✅ Submission reviewed for ${studentUsername} - returning 'reviewed'`);
      return 'reviewed';
    }
    
    // Si solo entregó pero no ha sido revisado
    console.log(`📋 Submission delivered for ${studentUsername} - returning 'delivered'`);
    return 'delivered';
  };

  // Function for teacher to grade a submission
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

    // Crear notificación para el estudiante
    const submission = comments.find(c => c.id === submissionId);
    if (submission && selectedTask) {
      const notification = {
        id: `notif_${Date.now()}`,
        type: 'task_graded',
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        studentUsername: submission.studentUsername,
        teacherName: user?.displayName || user?.username,
        message: `Tu tarea "${selectedTask.title}" ha sido calificada`,
        timestamp: new Date().toISOString(),
        read: false,
        grade: grade,
        course: selectedTask.course,
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
  const openGradeDialog = (taskId: string, studentUsername: string) => {
    console.log('🎯 Opening grade dialog for:', { taskId, studentUsername });
    console.log('🔍 Comments state loaded:', comments.length > 0 ? 'YES' : 'NO');
    console.log('🔍 Total comments:', comments.length);
    
    // Si no hay comentarios cargados, intentar cargar primero
    if (comments.length === 0) {
      console.log('� No comments loaded, attempting to reload...');
      loadComments();
      // Dar un pequeño delay para que se carguen
      setTimeout(() => {
        openGradeDialog(taskId, studentUsername);
      }, 100);
      return;
    }
    
    // Debug: Filtrar información relevante
    const allTaskComments = comments.filter(c => c.taskId === taskId);
    const allSubmissions = comments.filter(c => c.isSubmission);
    const taskSubmissions = comments.filter(c => c.taskId === taskId && c.isSubmission);
    
    console.log('� Task analysis:', {
      taskId,
      allCommentsForTask: allTaskComments.length,
      submissionsForTask: taskSubmissions.length,
      totalSubmissionsInSystem: allSubmissions.length
    });
    
    // Mostrar detalles de las entregas disponibles
    if (taskSubmissions.length > 0) {
      console.log('� Available submissions for this task:');
      taskSubmissions.forEach((sub, index) => {
        console.log(`  ${index + 1}. ${sub.studentUsername || sub.studentName} - ${sub.comment?.substring(0, 50)}...`);
      });
    }
    
    // Estrategia mejorada de búsqueda
    let submission = null;
    let searchMethod = '';
    
    // Estrategia 1: Búsqueda exacta por username
    submission = taskSubmissions.find(s => s.studentUsername === studentUsername);
    if (submission) searchMethod = 'exact username match';
    
    // Estrategia 2: Búsqueda exacta por studentName
    if (!submission) {
      submission = taskSubmissions.find(s => s.studentName === studentUsername);
      if (submission) searchMethod = 'exact student name match';
    }
    
    // Estrategia 3: Búsqueda case-insensitive por username
    if (!submission) {
      submission = taskSubmissions.find(s => 
        s.studentUsername?.toLowerCase() === studentUsername.toLowerCase()
      );
      if (submission) searchMethod = 'case-insensitive username match';
    }
    
    // Estrategia 4: Búsqueda case-insensitive por studentName
    if (!submission) {
      submission = taskSubmissions.find(s => 
        s.studentName?.toLowerCase() === studentUsername.toLowerCase()
      );
      if (submission) searchMethod = 'case-insensitive student name match';
    }
    
    // Estrategia 5: Búsqueda parcial (contains)
    if (!submission) {
      submission = taskSubmissions.find(s => 
        s.studentUsername?.toLowerCase().includes(studentUsername.toLowerCase()) ||
        s.studentName?.toLowerCase().includes(studentUsername.toLowerCase()) ||
        studentUsername.toLowerCase().includes(s.studentUsername?.toLowerCase() || '') ||
        studentUsername.toLowerCase().includes(s.studentName?.toLowerCase() || '')
      );
      if (submission) searchMethod = 'partial match';
    }
    
    // Estrategia especial para Felipe
    if (!submission && studentUsername.toLowerCase().includes('felipe')) {
      submission = taskSubmissions.find(s => 
        s.studentUsername?.toLowerCase().includes('felipe') ||
        s.studentName?.toLowerCase().includes('felipe')
      );
      if (submission) searchMethod = 'Felipe special match';
    }
    
    if (!submission) {
      const errorMessage = `No se encontró una entrega para "${studentUsername}" en esta tarea.

INFORMACIÓN DE DEBUG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Estadísticas:
   • Tarea ID: ${taskId}
   • Estudiante buscado: "${studentUsername}"
   • Total comentarios en sistema: ${comments.length}
   • Comentarios para esta tarea: ${allTaskComments.length}
   • Entregas para esta tarea: ${taskSubmissions.length}
   • Total entregas en sistema: ${allSubmissions.length}

📝 Entregas disponibles en esta tarea:
${taskSubmissions.length > 0 
  ? taskSubmissions.map((sub, i) => 
      `   ${i + 1}. "${sub.studentUsername}" / "${sub.studentName}"`
    ).join('\n')
  : '   (No hay entregas registradas)'
}

🔍 Estudiantes con entregas en el sistema:
${allSubmissions.length > 0
  ? [...new Set(allSubmissions.map(s => `"${s.studentUsername}" / "${s.studentName}"`))].slice(0, 10).join('\n   ')
  : '   (No hay entregas en el sistema)'
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Por favor, verifica que el estudiante haya entregado la tarea.`;
      
      console.error('❌ No submission found:', {
        taskId,
        studentUsername,
        availableSubmissions: taskSubmissions.map(s => ({
          username: s.studentUsername,
          name: s.studentName,
          comment: s.comment?.substring(0, 50)
        }))
      });
      
      alert(errorMessage);
      return;
    }
    
    console.log(`✅ Submission found via ${searchMethod}:`, {
      id: submission.id,
      studentUsername: submission.studentUsername,
      studentName: submission.studentName,
      hasAttachments: submission.attachments ? submission.attachments.length > 0 : false,
      currentGrade: submission.grade
    });
    
    setSubmissionToGrade(submission);
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
        student.username !== commentToDelete.studentUsername && // Excluimos el que acabamos de eliminar
        hasStudentSubmitted(selectedTask.id, student.username)
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
  const handleReviewSubmission = (studentUsername: string, taskId: string, tryDisplayName?: boolean) => {
    let submission = getStudentSubmission(taskId, studentUsername);
    // Si no se encuentra, intentar con el displayName
    if (!submission && tryDisplayName) {
      const student = getAssignedStudentsForTask(selectedTask).find(s => s.username === studentUsername);
      if (student && student.displayName) {
        submission = getStudentSubmission(taskId, student.displayName);
      }
    }
    if (!submission) {
      toast({
        title: 'Error',
        description: 'No se encontró una entrega para este estudiante.',
        variant: 'destructive'
      });
      return;
    }
    const student = getAssignedStudentsForTask(selectedTask).find(s => s.username === studentUsername);
    setCurrentReview({
      studentUsername,
      studentDisplayName: student?.displayName || studentUsername,
      taskId,
      submission,
      grade: submission.grade || 0,
      feedback: submission.teacherComment || '',
      isGraded: submission.grade !== undefined
    });
    setShowReviewDialog(true);
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
      const studentSubmission = getStudentSubmission(selectedTask.id, student.username);
      return !!studentSubmission?.reviewedAt || student.username === currentReview.studentUsername;
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
      studentUsername: currentReview.studentUsername,
      teacherName: user?.displayName || user?.username,
      message: `Tu tarea "${selectedTask.title}" ha sido calificada con ${currentReview.grade}/100`,
      timestamp: new Date().toISOString(),
      read: false,
      grade: currentReview.grade,
      course: selectedTask.course,
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
    const student = getStudentsFromCourse(selectedTask?.course || '').find(
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
                  {getAvailableCourses().map(course => (
                    <SelectItem key={course} value={course} className="hover:bg-orange-100 hover:text-orange-700 individual-option select-item-spaced">{course}</SelectItem>
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
                          {course}
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
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                              <Badge className={getStatusColor(task.status)}>
                                {task.status === 'pending' ? translate('statusPending') : 
                                 task.status === 'delivered' ? 'Entregado' :
                                 task.status === 'submitted' ? translate('statusSubmitted') : translate('statusReviewed')}
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
                                {getTaskComments(task.id).length} {translate('commentsCount')}
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
                <Card key={task.id} className="card-orange-shadow hover:shadow-md transition-shadow">
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
                            // Buscar la entrega del estudiante
                            const mySubmission = comments.find(c => c.taskId === task.id && c.studentUsername === user.username && c.isSubmission);
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
                                  En Revisión
                                </Badge>
                              );
                            } else if (mySubmission && typeof mySubmission.grade === 'number') {
                              // Finalizado: igual que en la vista detalle (usamos submitted/verde)
                              return (
                                <>
                                  <Badge className={getStatusColor('submitted') + ' font-bold mr-1'}>
                                    Finalizado
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
                                task.status === 'delivered' ? 'Entregado' :
                                task.status === 'submitted' ? translate('statusSubmitted') : translate('statusReviewed')}
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
                            setSelectedTask(task);
                            setShowTaskDialog(true);
                          }}
                          className="action-button"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user?.role === 'teacher' && task.assignedBy === user.username && (
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
                              {task.course}
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 mr-1" />
                              {task.assignedStudents?.length} {translate('studentsCount')}
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {getTaskComments(task.id).length} {translate('commentsCount')}
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
              <Label htmlFor="title" className="text-right">{translate('taskTitle')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
                placeholder={translate('taskTitlePlaceholder')}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">{translate('taskDescription')} *</Label>
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
              <Label htmlFor="course" className="text-right">{translate('taskCourse')} *</Label>
              <Select value={formData.course} onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}>
                <SelectTrigger className={`${formData.taskType === 'evaluacion' ? 'select-purple-hover-trigger' : 'select-orange-hover-trigger'} col-span-3`}>
                  <SelectValue placeholder={translate('selectCourse')} />
                </SelectTrigger>
                <SelectContent className={formData.taskType === 'evaluacion' ? 'select-purple-hover' : 'select-orange-hover'}>
                  {getAvailableCourses().map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">{translate('taskSubject')}</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
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
              <Select value={formData.assignedTo} onValueChange={(value: 'course' | 'student') => setFormData(prev => ({ ...prev, assignedTo: value, assignedStudents: [] }))}>
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
                    {getStudentsFromCourse(formData.course).length > 0 ? (
                      getStudentsFromCourse(formData.course).map(student => (
                        <div key={student.username} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`student-${student.username}`}
                            checked={formData.assignedStudents?.includes(student.username)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedStudents: [...(prev.assignedStudents || []), student.username]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedStudents: prev.assignedStudents?.filter(s => s !== student.username) || []
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
                  <Label htmlFor="topic" className="text-right">Tema</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="col-span-3"
                    placeholder="Introduce el tema de la evaluación"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="numQuestions" className="text-right">Cantidad de Preguntas</Label>
                  <Input
                    id="numQuestions"
                    type="number"
                    value={formData.numQuestions || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, numQuestions: parseInt(e.target.value) || 0 }))}
                    className="col-span-3"
                    placeholder="Ej: 15"
                    min="1"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timeLimit" className="text-right">Tiempo (minutos)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                    className="col-span-3"
                    placeholder="Ej: 45"
                    min="1"
                  />
                </div>
              </>
            )}

            {/* File Upload Section for Create Task */}
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
                    className={`w-full ${formData.taskType === 'evaluacion' 
                      ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700'
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700'
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
                      <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
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
                          className="flex-shrink-0 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
          if (selectedTask) {
            console.log(`🔍 Opening task dialog for "${selectedTask.title}":`, {
              taskId: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description,
              course: selectedTask.course,
              subject: selectedTask.subject,
              totalComments: comments.length,
              submissionComments: comments.filter(c => c.isSubmission),
              allComments: comments
            });
            
            // Debug específico para ver si hay entregas para esta tarea
            const taskSubmissions = comments.filter(c => c.taskId === selectedTask.id && c.isSubmission);
            console.log(`🎯 Submissions for task ${selectedTask.id}:`, taskSubmissions);
            
            // Si no hay entregas, crear algunas de prueba
            if (taskSubmissions.length === 0) {
              console.log('⚠️ No submissions found, creating test submissions...');
              createTestSubmissions(selectedTask.id);
            }
            
            // Debug para cada estudiante
            const assignedStudents = getAssignedStudentsForTask(selectedTask);
            assignedStudents.forEach(student => {
              const submission = getStudentSubmission(selectedTask.id, student.username);
              const status = getStudentTaskStatus(selectedTask.id, student.username);
              console.log(`👨‍🎓 Student ${student.displayName} (${student.username}):`, {
                hasSubmission: !!submission,
                status,
                submissionId: submission?.id,
                submissionTimestamp: submission?.timestamp
              });
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
              {selectedTask?.assignedByName} • {selectedTask?.course} • {selectedTask?.subject}
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
                      <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" title={file.name}>{file.name}</span>
                          <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="flex-shrink-0"
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
                    // Lógica UNIFICADA: buscar la entrega igual que en la lista
                    const mySubmission = comments.find(c => c.taskId === selectedTask.id && c.studentUsername === user.username && c.isSubmission);
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
                          En Revisión
                        </Badge>
                      );
                    } else if (mySubmission && typeof mySubmission.grade === 'number') {
                      // Finalizado
                      return (
                        <Badge className={getStatusColor('submitted') + ' font-bold ml-1'}>
                          Finalizado
                        </Badge>
                      );
                    }
                  })() : (
                    <Badge className={`ml-1 ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status === 'pending' ? translate('statusPending') : 
                        selectedTask.status === 'submitted' ? translate('statusSubmitted') : translate('statusReviewed')}
                    </Badge>
                  )}
                </span>
              </div>

              {/* Evaluation specific information */}
              {selectedTask.taskType === 'evaluacion' && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">Información de la Evaluación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {selectedTask.topic && (
                      <div>
                        <strong className="text-purple-700 dark:text-purple-300">Tema:</strong>
                        <p className="text-purple-600 dark:text-purple-400">{selectedTask.topic}</p>
                      </div>
                    )}
                    {selectedTask.numQuestions && selectedTask.numQuestions > 0 && (
                      <div>
                        <strong className="text-purple-700 dark:text-purple-300">Preguntas:</strong>
                        <p className="text-purple-600 dark:text-purple-400">{selectedTask.numQuestions}</p>
                      </div>
                    )}
                    {selectedTask.timeLimit && selectedTask.timeLimit > 0 && (
                      <div>
                        <strong className="text-purple-700 dark:text-purple-300">Tiempo:</strong>
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
                    <h4 className="font-medium">{translate('studentDetailPanel')}</h4>
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
                                let submission = getStudentSubmission(selectedTask.id, student.username);
                                let studentStatus = getStudentTaskStatus(selectedTask.id, student.username);
                                
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
                                
                                const hasSubmission = submission !== undefined;
                                
                                console.log(`👨‍🎓 TABLE ROW - Student ${student.displayName} (${student.username}):`, {
                                  studentObject: student,
                                  searchingWithUsername: student.username,
                                  hasSubmission,
                                  studentStatus,
                                  submissionId: submission?.id,
                                  submissionTimestamp: submission?.timestamp,
                                  submissionDetails: submission ? {
                                    studentUsername: submission.studentUsername,
                                    studentName: submission.studentName,
                                    isSubmission: submission.isSubmission,
                                    comment: submission.comment.substring(0, 50),
                                    hasGrade: submission.grade !== undefined,
                                    grade: submission.grade
                                  } : null
                                });
                                
                                return (
                                  <tr key={student.username} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                    <td className="py-2 px-3">{student.displayName}</td>
                                    <td className="py-2 px-3">
                                      <Badge className={
                                        studentStatus === 'pending' ? 'bg-blue-100 text-blue-800' :
                                        studentStatus === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }>
                                        {studentStatus === 'pending' ? 'Pendiente' : 
                                         studentStatus === 'delivered' ? 'En Revisión' : 
                                         'Calificado'}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3">
                                      {hasSubmission && submission && submission.grade !== undefined ? 
                                        <span className="font-medium">{submission.grade}/100</span> :
                                        <span className="text-muted-foreground italic">{hasSubmission ? 'Sin calificar' : 'Sin entregar'}</span>
                                      }
                                    </td>
                                    <td className="py-2 px-3 date-cell">
                                      <span className="single-line-date font-medium">
                                        {hasSubmission && submission ? formatDateOneLine(submission.timestamp) : '-'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex space-x-2">
                                        {hasSubmission && studentStatus === 'delivered' && (
                                          <Button 
                                            size="sm" 
                                            className="h-7 bg-orange-500 hover:bg-orange-600 text-white"
                                            onClick={() => handleReviewSubmission(student.username, selectedTask.id, true)}
                                          >
                                            Revisar
                                          </Button>
                                        )}
                                        {hasSubmission && studentStatus === 'reviewed' && (
                                          <Button 
                                            size="sm" 
                                            className="h-7 bg-red-500 hover:bg-red-600 text-white"
                                            onClick={() => handleReviewSubmission(student.username, selectedTask.id, true)}
                                          >
                                            Editar
                                          </Button>
                                        )}
                                        {!hasSubmission && (
                                          <span className="text-xs text-muted-foreground">Sin entrega</span>
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
                                const evaluationResult = getStudentEvaluationResult(selectedTask.id, student.username);
                                const hasCompleted = evaluationResult !== undefined;
                                
                                return (
                                  <tr key={student.username} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                    <td className="py-2 px-3">{student.displayName}</td>
                                    <td className="py-2 px-3">
                                      <Badge className={hasCompleted ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}>
                                        {hasCompleted ? translate('statusCompleted') : translate('statusPending')}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3">
                                      {hasCompleted ? 
                                        <span className="font-medium">{evaluationResult.score}/{evaluationResult.totalQuestions} ({evaluationResult.completionPercentage.toFixed(1)}%)</span> :
                                        <span className="text-muted-foreground italic">{translate('noSubmissionYet')}</span>
                                      }
                                    </td>
                                    <td className="py-2 px-3 date-cell">
                                      <span className="single-line-date font-medium">
                                        {hasCompleted ? formatDateOneLine(evaluationResult.completedAt) : '-'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3">
                                      {hasCompleted && (
                                        <Button 
                                          size="sm" 
                                          className="h-7 bg-purple-500 hover:bg-purple-600 text-white"
                                          onClick={() => {
                                            // Implementar lógica para ver detalles
                                          }}
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
                <h4 className="font-medium mb-3">Comentarios</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {getTaskComments(selectedTask.id)
                    .filter(comment => {
                      // PROFESOR: solo comentarios (no entregas)
                      if (user?.role === 'teacher') return !comment.isSubmission;
                      // ESTUDIANTE: solo su entrega y todos los comentarios
                      if (user?.role === 'student') {
                        if (comment.isSubmission) {
                          return comment.studentUsername === user.username;
                        }
                        return true;
                      }
                      // Otros roles: solo comentarios
                      return !comment.isSubmission;
                    })
                    .map(comment => (
                      <div
                        key={comment.id}
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
                              <Badge className="bg-blue-100 text-blue-800 font-bold px-2 py-1 text-xs ml-4 md:ml-6">Entregado</Badge>
                              {/* Fecha */}
                              <span className="text-xs text-muted-foreground ml-2 md:ml-4">{formatDateOneLine(comment.timestamp)}</span>
                              {/* Porcentaje */}
                              {((user?.role === 'teacher') || (user?.role === 'student' && comment.studentUsername === user.username)) && typeof comment.grade === 'number' && (
                                <Badge className={comment.grade >= 70 ? 'bg-green-100 text-green-700 font-bold px-2 py-1 text-xs ml-2 md:ml-4' : 'bg-red-100 text-red-700 font-bold px-2 py-1 text-xs ml-2 md:ml-4'}>
                                  {comment.grade}%
                                </Badge>
                              )}
                            </div>
                            {/* Botón eliminar o badge calificado alineado derecha */}
                            <div className="flex items-center gap-2 md:ml-auto">
                              {user?.role === 'student' && comment.studentUsername === user.username && !comment.grade && !comment.reviewedAt && (
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteSubmission(comment.id)}>
                                  <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                </Button>
                              )}
                              {comment.reviewedAt && (
                                <Badge className="bg-red-100 text-red-700 font-bold px-2 py-1 text-xs flex items-center">
                                  <Lock className="w-3 h-3 mr-1" /> Calificado
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
                              <div key={file.id} className="flex items-center gap-2 text-xs">
                                <Paperclip className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate" title={file.name}>{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadFile(file)}
                                  className="h-6 w-6 p-0"
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
                  
                  {/* File Upload for Comments */}
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
                        className={`w-full ${selectedTask?.taskType === 'evaluacion'
                          ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700'
                          : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700'
                        }`}
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
                          <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
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
                              className="flex-shrink-0 h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    {user?.role === 'student' && (
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
                      disabled={!newComment.trim()}
                      className={`${
                        user?.role === 'teacher' 
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
              <Label htmlFor="title" className="text-right">{translate('taskTitle')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
                placeholder={translate('taskTitlePlaceholder')}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">{translate('taskDescription')} *</Label>
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
              <Label htmlFor="course" className="text-right">{translate('taskCourse')} *</Label>
              <Select value={formData.course} onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}>
                <SelectTrigger className="select-orange-hover-trigger col-span-3">
                  <SelectValue placeholder={translate('selectCourse')} />
                </SelectTrigger>
                <SelectContent className="select-orange-hover">
                  {getAvailableCourses().map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">{translate('taskSubject')}</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
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
                    {getStudentsFromCourse(formData.course).length > 0 ? (
                      getStudentsFromCourse(formData.course).map(student => (
                        <div key={student.username} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`student-${student.username}`}
                            checked={formData.assignedStudents?.includes(student.username)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedStudents: [...(prev.assignedStudents || []), student.username]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  assignedStudents: prev.assignedStudents?.filter(s => s !== student.username) || []
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
                  <Label htmlFor="topic-edit" className="text-right">Tema</Label>
                  <Input
                    id="topic-edit"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="col-span-3"
                    placeholder="Introduce el tema de la evaluación"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="numQuestions-edit" className="text-right">Cantidad de Preguntas</Label>
                  <Input
                    id="numQuestions-edit"
                    type="number"
                    value={formData.numQuestions || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, numQuestions: parseInt(e.target.value) || 0 }))}
                    className="col-span-3"
                    placeholder="Ej: 15"
                    min="1"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="timeLimit-edit" className="text-right">Tiempo (minutos)</Label>
                  <Input
                    id="timeLimit-edit"
                    type="number"
                    value={formData.timeLimit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                    className="col-span-3"
                    placeholder="Ej: 45"
                    min="1"
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
            <DialogTitle>Calificar Entrega</DialogTitle>
            <DialogDescription>
              Revisar y calificar la entrega del estudiante
            </DialogDescription>
          </DialogHeader>
          
          {submissionToGrade && selectedTask && (
            <div className="space-y-6">
              {/* Información de la tarea */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Información de la Tarea</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Tarea:</strong> {selectedTask.title}</p>
                  <p><strong>Descripción:</strong> {selectedTask.description}</p>
                  <p><strong>Fecha límite:</strong> {formatDateOneLine(selectedTask.dueDate)}</p>
                  <p><strong>Curso:</strong> {selectedTask.course}</p>
                  <p><strong>Materia:</strong> {selectedTask.subject}</p>
                </div>
              </div>

              {/* Información del estudiante */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border">
                <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Información del Estudiante</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Estudiante:</strong> {submissionToGrade.studentName}</p>
                  <p><strong>Usuario:</strong> {submissionToGrade.studentUsername}</p>
                  <p><strong>Fecha de entrega:</strong> {formatDateOneLine(submissionToGrade.timestamp)}</p>
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
                      <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded border">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate font-medium" title={file.name}>{file.name}</span>
                          <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="flex-shrink-0"
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
                      <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="truncate" title={file.name}>{file.name}</span>
                          <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="flex-shrink-0"
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
                      Calificación (0-100) <span className="text-red-500">*</span>
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
                          {parseInt(gradeForm.grade) >= 70 ? 'Aprobado' : 'Reprobado'}
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
                      placeholder="Escribe aquí tu retroalimentación para el estudiante..."
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
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={saveGrade}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!gradeForm.grade.trim()}
                >
                  Guardar Calificación
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
              <span>Revisar Entrega - {currentReview.studentDisplayName}</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {currentReview.isGraded ? 'Calificada' : 'Por Calificar'}
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
                  Información de la Tarea
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Título:</strong> {selectedTask.title}</p>
                    <p><strong>Curso:</strong> {selectedTask.course}</p>
                    <p><strong>Materia:</strong> {selectedTask.subject}</p>
                  </div>
                  <div>
                    <p><strong>Fecha límite:</strong> {formatDateOneLine(selectedTask.dueDate)}</p>
                    <p><strong>Prioridad:</strong> 
                      <Badge className={`ml-1 ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority === 'high' ? 'Alta' : 
                         selectedTask.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p><strong>Descripción:</strong></p>
                  <p className="text-muted-foreground mt-1">{selectedTask.description}</p>
                </div>
              </div>

              {/* Información del Estudiante */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium mb-3 text-green-800 dark:text-green-200 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información del Estudiante
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nombre:</strong> {currentReview.studentDisplayName}</p>
                    <p><strong>Usuario:</strong> {currentReview.studentUsername}</p>
                  </div>
                  <div>
                    <p><strong>Fecha de entrega:</strong> {formatDateOneLine(currentReview.submission.timestamp)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <strong>Estado:</strong>
                      {/* Estado de la entrega del estudiante, igual que en la lista */}
                      {(() => {
                        if (!currentReview.submission) {
                          // No hay entrega: Pendiente
                          return (
                            <Badge className={getStatusColor('pending')}>
                              {translate('statusPending')}
                            </Badge>
                          );
                        } else if (currentReview.submission && (currentReview.submission.grade === undefined || currentReview.submission.grade === null)) {
                          // Entregada pero sin nota: En Revisión (amarillo)
                          return (
                            <Badge className="bg-yellow-100 text-yellow-800 font-bold">
                              En Revisión
                            </Badge>
                          );
                        } else if (currentReview.submission && typeof currentReview.submission.grade === 'number') {
                          // Finalizado: verde + badge porcentaje
                          return (
                            <>
                              <Badge className={getStatusColor('submitted') + ' font-bold mr-1'}>
                                Finalizado
                              </Badge>
                              <Badge className={currentReview.submission.grade >= 70 ? 'bg-green-100 text-green-700 font-bold ml-2' : 'bg-red-100 text-red-700 font-bold ml-2'}>
                                {currentReview.submission.grade}%
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
                  Contenido de la Entrega
                </h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border min-h-[100px]">
                  <p className="text-sm whitespace-pre-wrap">
                    {currentReview.submission.comment || 'Sin contenido de texto'}
                  </p>
                </div>
              </div>

              {/* Archivos Adjuntos de la Entrega */}
              {currentReview.submission.attachments && currentReview.submission.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Paperclip className="w-5 h-5 mr-2" />
                    Archivos de la Entrega ({currentReview.submission.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {currentReview.submission.attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded border">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium" title={file.name}>{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • Subido: {formatDate(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="flex-shrink-0"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección de Calificación */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200">
                <h4 className="font-medium mb-4 text-orange-800 dark:text-orange-200 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Calificación y Retroalimentación
                </h4>
                
                <div className="space-y-4">
                  {/* Campo de calificación */}
                  <div>
                    <label htmlFor="gradeInputNew" className="block text-sm font-medium mb-2">
                      Calificación (0-100) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-3">
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
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">/ 100</span>
                      {currentReview.grade > 0 && (
                        <Badge variant="outline" className={
                          currentReview.grade >= 70 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                        }>
                          {currentReview.grade >= 70 ? 'Aprobado' : 'Reprobado'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Campo de retroalimentación */}
                  <div>
                    <label htmlFor="feedbackInputNew" className="block text-sm font-medium mb-2">
                      Retroalimentación para el Estudiante
                    </label>
                    <Textarea
                      id="feedbackInputNew"
                      value={currentReview.feedback}
                      onChange={(e) => setCurrentReview(prev => ({ 
                        ...prev, 
                        feedback: e.target.value 
                      }))}
                      placeholder="Escribe aquí tu retroalimentación para el estudiante..."
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Este comentario será visible para el estudiante junto con su calificación.
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
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveReviewAndGrade}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!currentReview.grade || currentReview.grade < 0 || currentReview.grade > 100}
            >
              {currentReview.isGraded ? 'Actualizar Calificación' : 'Guardar Calificación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Funciones auxiliares para la vista de detalles por estudiante */}
      {/* Fin del contenido principal */}
    </div>
  );
}
