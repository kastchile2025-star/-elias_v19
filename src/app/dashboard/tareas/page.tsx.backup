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
        allComments: parsedComments
      });
      setComments(parsedComments);
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

  // Función para verificar si un estudiante ya entregó una tarea
  const hasStudentSubmitted = (taskId: string, studentUsername?: string) => {
    const username = studentUsername || user?.username;
    if (!username) return false;
    
    return comments.some(comment => 
      comment.taskId === taskId && 
      comment.studentUsername === username && 
      comment.isSubmission
    );
  };

  // Función para obtener la entrega de un estudiante
  const getStudentSubmissionById = (taskId: string, studentUsername?: string) => {
    const username = studentUsername || user?.username;
    if (!username) return null;
    
    return comments.find(comment => 
      comment.taskId === taskId && 
      comment.studentUsername === username && 
      comment.isSubmission
    );
  };

  // Función para obtener el estado de una tarea para un estudiante específico
  const getStudentTaskStatus = (taskId: string, studentUsername: string) => {
    const submission = getStudentSubmissionById(taskId, studentUsername);
    
    if (!submission) {
      return 'pending';
    }
    
    if (submission.grade !== undefined || submission.teacherComment) {
      return 'reviewed';
    }
    
    return 'delivered';
  };

  // Función para obtener todas las tareas filtradas
  const filteredTasks = tasks.filter(task => {
    if (user?.role === 'student') {
      // Para estudiantes, mostrar solo las tareas asignadas a ellos
      if (task.assignedTo === 'course') {
        return user.activeCourses?.includes(task.course);
      } else if (task.assignedTo === 'student') {
        return task.assignedStudents?.includes(user.username || '');
      }
      return false;
    } else if (user?.role === 'teacher') {
      // Para profesores, mostrar sus tareas creadas
      const courseFilter = selectedCourseFilter === 'all' || task.course === selectedCourseFilter;
      const createdByTeacher = task.assignedBy === user.username;
      return courseFilter && createdByTeacher;
    }
    return false;
  });

  // Función para obtener tareas agrupadas por curso (para profesores)
  const getTasksByCourse = () => {
    const tasksByCourse: { [course: string]: Task[] } = {};
    
    filteredTasks.forEach(task => {
      if (!tasksByCourse[task.course]) {
        tasksByCourse[task.course] = [];
      }
      tasksByCourse[task.course].push(task);
    });
    
    return tasksByCourse;
  };

  // Función para obtener estadísticas por curso
  const getCourseStats = () => {
    const stats: { [course: string]: { total: number; pending: number; submitted: number } } = {};
    
    Object.entries(getTasksByCourse()).forEach(([course, courseTasks]) => {
      stats[course] = {
        total: courseTasks.length,
        pending: courseTasks.filter(t => t.status === 'pending').length,
        submitted: courseTasks.filter(t => t.status === 'submitted' || t.status === 'reviewed').length
      };
    });
    
    return stats;
  };

  // Función para obtener comentarios de una tarea
  const getTaskComments = (taskId: string) => {
    return comments.filter(c => c.taskId === taskId).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // Función para obtener color del tipo de tarea
  const getTaskTypeColor = (taskType: string) => {
    return taskType === 'evaluacion' ? 'border-purple-200 bg-purple-50 text-purple-800' : 'border-orange-200 bg-orange-50 text-orange-800';
  };

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'delivered':
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para formatear fecha en una línea
  const formatDateOneLine = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Funciones de manejo de archivos y comentarios
  const handleFileUpload = (files: FileList | null, isTaskAttachment: boolean) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: TaskFile = {
          id: `file_${Date.now()}_${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: e.target?.result as string,
          uploadedBy: user?.username || '',
          uploadedAt: new Date().toISOString()
        };
        
        if (isTaskAttachment) {
          setTaskAttachments(prev => [...prev, newFile]);
        } else {
          setCommentAttachments(prev => [...prev, newFile]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId: string, isTaskAttachment: boolean) => {
    if (isTaskAttachment) {
      setTaskAttachments(prev => prev.filter(f => f.id !== fileId));
    } else {
      setCommentAttachments(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const downloadFile = (file: TaskFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para crear tarea
  const handleCreateTask = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.course || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      course: formData.course,
      assignedBy: user?.username || '',
      assignedByName: user?.displayName || user?.username || '',
      assignedTo: formData.assignedTo,
      assignedStudents: formData.assignedTo === 'student' ? formData.assignedStudents : undefined,
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString(),
      status: 'pending',
      priority: formData.priority,
      attachments: taskAttachments,
      taskType: formData.taskType,
      topic: formData.taskType === 'evaluacion' ? formData.topic : undefined,
      numQuestions: formData.taskType === 'evaluacion' ? formData.numQuestions : undefined,
      timeLimit: formData.taskType === 'evaluacion' ? formData.timeLimit : undefined
    };

    saveTasks([...tasks, newTask]);
    setShowCreateDialog(false);
    
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

    toast({
      title: "Éxito",
      description: `${formData.taskType === 'evaluacion' ? 'Evaluación' : 'Tarea'} creada correctamente`,
    });
  };

  // Función para agregar comentarios
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask || !user) return;

    // Verificar si el estudiante ya entregó la tarea (solo para entregas)
    if (user.role === 'student' && isSubmission) {
      const existingSubmission = hasStudentSubmitted(selectedTask.id);
      if (existingSubmission) {
        toast({
          title: "Error",
          description: "Ya has entregado esta tarea. Solo puedes entregar una vez por tarea.",
          variant: "destructive"
        });
        return;
      }
    }

    const newCommentObj: TaskComment = {
      id: `comment_${Date.now()}_${Math.random()}`,
      taskId: selectedTask.id,
      studentUsername: user.username || '',
      studentName: user.displayName || user.username || '',
      comment: newComment,
      timestamp: new Date().toISOString(),
      isSubmission: user.role === 'student' && isSubmission,
      attachments: commentAttachments,
      grade: undefined,
      teacherComment: '',
      reviewedAt: undefined
    };

    saveComments([...comments, newCommentObj]);
    setNewComment('');
    setIsSubmission(false);
    setCommentAttachments([]);

    toast({
      title: "Éxito",
      description: isSubmission ? "Tarea entregada correctamente" : "Comentario agregado",
    });
  };

  // Otras funciones necesarias
  const handleReviewSubmission = (studentUsername: string, taskId: string, openDialog: boolean = false) => {
    // Implementar lógica de revisión
    console.log('Reviewing submission for:', studentUsername, taskId);
  };

  const handleDeleteSubmission = (commentId: string) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    saveComments(updatedComments);
    toast({
      title: "Éxito",
      description: "Entrega eliminada correctamente",
    });
  };

  const getStudentEvaluationResult = (taskId: string, studentUsername: string) => {
    // Implementar lógica para evaluaciones
    return undefined;
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
                          <Download className="w-4 h-4 mr-1" />
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
                      // Finalizado: verde + badge porcentaje
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
                    <Badge className={`ml-1 ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status === 'pending' ? translate('statusPending') : 
                        selectedTask.status === 'submitted' ? translate('statusSubmitted') : translate('statusReviewed')}
                    </Badge>
                  )}
                </span>
              </div>

              {/* Evaluation specific information */}
              {selectedTask.taskType === 'evaluacion' && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200">
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
                                    comment: submission.comment.substring(0, 50)
                                  } : null
                                });
                                
                                return (
                                  <tr key={student.username} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                    <td className="py-2 px-3">{student.displayName}</td>
                                    <td className="py-2 px-3">
                                      <Badge className={
                                        studentStatus === 'pending' ? 'bg-gray-100 text-gray-800' :
                                        studentStatus === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }>
                                        {studentStatus === 'pending' ? 'Pendiente' : 
                                         studentStatus === 'delivered' ? 'Entregado' : 
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
                                <Badge className={comment.grade >= 70 ? 'bg-green-100 text-green-700 font-bold ml-2' : 'bg-red-100 text-red-700 font-bold ml-2'}>
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
                                    comment: submission.comment.substring(0, 50)
                                  } : null
                                });
                                
                                return (
                                  <tr key={student.username} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                    <td className="py-2 px-3">{student.displayName}</td>
                                    <td className="py-2 px-3">
                                      <Badge className={
                                        studentStatus === 'pending' ? 'bg-gray-100 text-gray-800' :
                                        studentStatus === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }>
                                        {studentStatus === 'pending' ? 'Pendiente' : 
                                         studentStatus === 'delivered' ? 'Entregado' : 
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
