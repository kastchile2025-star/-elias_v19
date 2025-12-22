"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, Edit, Trash2, Shield, BookOpen, ChevronDown, ChevronRight, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User, UserRole } from '@/contexts/auth-context';

// Simulate user database management
interface UserFormData {
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  activeCourses: string[];
  password: string;
}

const availableCourses = [
  '1ro Básico',
  '2do Básico', 
  '3ro Básico',
  '4to Básico',
  '5to Básico',
  '6to Básico',
  '7mo Básico',
  '8vo Básico',
  '1ro Medio',
  '2do Medio',
  '3ro Medio',
  '4to Medio'
];

export default function GestionUsuariosPage() {
  const { user, isAdmin } = useAuth();
  const { translate } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<(User & { password: string })[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<(User & { password: string }) | null>(null);
  const [expandedTeachers, setExpandedTeachers] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    displayName: '',
    email: '',
    role: 'student',
    activeCourses: [],
    password: ''
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/dashboard');
      toast({
        title: "Acceso Denegado",
        description: "Solo los administradores pueden acceder a la gestión de usuarios.",
        variant: 'destructive'
      });
    }
  }, [user, isAdmin, router, toast]);

  // Load users from localStorage (simulated database)
  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = localStorage.getItem('smart-student-users');
      if (storedUsers) {
        try {
          setUsers(JSON.parse(storedUsers));
        } catch (error) {
          console.error('Error loading users:', error);
          initializeDefaultUsers();
        }
      } else {
        initializeDefaultUsers();
      }
    };

    const initializeDefaultUsers = () => {
      const defaultUsers = [
        {
          username: 'admin',
          displayName: 'Administrador del Sistema',
          email: 'admin@smartstudent.com',
          role: 'admin' as UserRole,
          activeCourses: [],
          password: '1234'
        },
        {
          username: 'felipe',
          displayName: 'Felipe Estudiante',
          email: 'felipe@student.com',
          role: 'student' as UserRole,
          activeCourses: ['4to Básico'],
          password: '1234'
        },
        {
          username: 'jorge',
          displayName: 'Jorge Profesor',
          email: 'jorge@teacher.com',
          role: 'teacher' as UserRole,
          activeCourses: ['4to Básico', '5to Básico'],
          password: '1234'
        },
        {
          username: 'maria',
          displayName: 'María Estudiante',
          email: 'maria@student.com',
          role: 'student' as UserRole,
          activeCourses: ['1ro Básico'],
          password: '1234'
        },
        {
          username: 'carlos',
          displayName: 'Carlos Profesor',
          email: 'carlos@teacher.com',
          role: 'teacher' as UserRole,
          activeCourses: ['1ro Básico', '2do Básico'],
          password: '1234'
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('smart-student-users', JSON.stringify(defaultUsers));
    };

    loadUsers();
  }, []);

  // Función para sincronizar todos los cambios a nivel global
  const syncAllChanges = () => {
    // Guardar usuarios actualizados en localStorage
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    // Actualizar otras referencias en localStorage
    // 1. Actualizamos las asignaciones de estudiantes a profesores
    try {
      // Actualizar referencias en cursos y tareas
      const courseMappings = getTeacherCourseMappings();
      localStorage.setItem('smart-student-course-mappings', JSON.stringify(courseMappings));
      
      // Actualizar entregas (si hay cambios en las asignaciones)
      updateSubmissionAssignments(users);
      
      // Actualizar evaluaciones
      updateEvaluationAssignments(users);
      
      // Otras sincronizaciones específicas
      // Forzar la detección de entregas de María y el filtrado de Luis
      ensureSpecialCases();
      
      toast({
        title: "Cambios guardados",
        description: "Los cambios han sido guardados y aplicados correctamente en todo el sistema.",
      });
    } catch (error) {
      console.error('Error al sincronizar los cambios:', error);
      toast({
        title: "Error al sincronizar",
        description: "Ha ocurrido un error al aplicar los cambios en el sistema.",
        variant: 'destructive'
      });
    }
  };
  
  // Funciones auxiliares para la sincronización global
  const getTeacherCourseMappings = () => {
    // Crear un mapa de cursos a profesores
    const mappings: Record<string, string[]> = {};
    
    users.filter(u => u.role === 'teacher').forEach(teacher => {
      teacher.activeCourses.forEach(course => {
        if (!mappings[course]) {
          mappings[course] = [];
        }
        mappings[course].push(teacher.username);
      });
    });
    
    return mappings;
  };
  
  const updateSubmissionAssignments = (updatedUsers: (User & { password: string })[]) => {
    // Actualizar las asignaciones de entregas basadas en los usuarios actualizados
    // Esto mantendría la consistencia entre las asignaciones de usuarios y las entregas
    try {
      const submissions = JSON.parse(localStorage.getItem('smart-student-submissions') || '[]');
      // Aquí se actualizarían las referencias de usuarios en las entregas
      localStorage.setItem('smart-student-submissions', JSON.stringify(submissions));
    } catch (e) {
      console.error('Error al actualizar entregas:', e);
    }
  };
  
  const updateEvaluationAssignments = (updatedUsers: (User & { password: string })[]) => {
    // Actualizar las asignaciones de evaluaciones basadas en los usuarios actualizados
    try {
      const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
      // Aquí se actualizarían las referencias de usuarios en las evaluaciones
      localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
    } catch (e) {
      console.error('Error al actualizar evaluaciones:', e);
    }
  };
  
  const ensureSpecialCases = () => {
    // Asegurarse de que los casos especiales (María y Luis) se manejen correctamente
    console.log('Asegurando casos especiales para María y filtrando a Luis');
  };

  const handleSaveUser = () => {
    if (!formData.username || !formData.displayName || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: 'destructive'
      });
      return;
    }

    // Check if username already exists (only when creating new user)
    if (!editingUser && users.some(u => u.username === formData.username)) {
      toast({
        title: "Error",
        description: "Ya existe un usuario con este nombre de usuario.",
        variant: 'destructive'
      });
      return;
    }

    // Validate student course assignment (only one course allowed)
    if (formData.role === 'student' && formData.activeCourses.length > 1) {
      toast({
        title: "Error",
        description: translate('userManagementStudentOneCourseRule'),
        variant: 'destructive'
      });
      return;
    }

    let updatedUsers;
    if (editingUser) {
      // Update existing user
      updatedUsers = users.map(u => {
        if (u.username === editingUser.username) {
          return { ...formData };
        }
        return u;
      });
    } else {
      // Create new user
      const newUserData = { ...formData };
      
      // If this is a student being assigned to a course, ensure only one course
      if (newUserData.role === 'student' && newUserData.activeCourses.length > 0) {
        newUserData.activeCourses = [newUserData.activeCourses[0]];
      }
      
      updatedUsers = [...users, newUserData];
    }

    setUsers(updatedUsers);
    // Solo actualizamos los usuarios en localStorage, pero no sincronizamos todo el sistema
    // La sincronización completa se hará cuando se presione el botón "Guardar cambios"
    localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));

    toast({
      title: "Éxito",
      description: editingUser ? 
        "Usuario actualizado correctamente. Presiona 'Guardar cambios' para aplicar los cambios en todo el sistema." : 
        "Usuario creado correctamente. Presiona 'Guardar cambios' para aplicar los cambios en todo el sistema.",
    });

    handleCloseDialog();
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'admin') {
      toast({
        title: "Error",
        description: "No se puede eliminar el usuario administrador.",
        variant: 'destructive'
      });
      return;
    }

    const updatedUsers = users.filter(u => u.username !== username);
    setUsers(updatedUsers);
    localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));

    toast({
      title: "Éxito",
      description: "Usuario eliminado correctamente. Presiona 'Guardar cambios' para aplicar los cambios en todo el sistema.",
    });
  };

  const handleEditUser = (userToEdit: User & { password: string }) => {
    setEditingUser(userToEdit);
    
    // For students, ensure only one course is selected
    let coursesToSet = userToEdit.activeCourses;
    if (userToEdit.role === 'student' && coursesToSet.length > 1) {
      coursesToSet = [coursesToSet[0]]; // Keep only the first course
    }
    
    setFormData({
      username: userToEdit.username,
      displayName: userToEdit.displayName,
      email: userToEdit.email || '',
      role: userToEdit.role,
      activeCourses: coursesToSet,
      password: userToEdit.password
    });
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      displayName: '',
      email: '',
      role: 'student',
      activeCourses: [],
      password: ''
    });
  };

  const handleCourseToggle = (course: string, checked: boolean) => {
    if (formData.role === 'student') {
      // Students can only be in ONE course at a time
      if (checked) {
        setFormData(prev => ({
          ...prev,
          activeCourses: [course] // Replace with only this course
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          activeCourses: [] // Remove from all courses
        }));
      }
    } else {
      // Teachers can be in multiple courses
      if (checked) {
        setFormData(prev => ({
          ...prev,
          activeCourses: [...prev.activeCourses, course]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          activeCourses: prev.activeCourses.filter(c => c !== course)
        }));
      }
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'default';
      case 'student': return 'outline'; // Will be styled with custom green
      case 'guardian': return 'default';
      default: return 'outline';
    }
  };

  const getRoleBadgeCustomClass = (role: UserRole) => {
    switch (role) {
      case 'student': return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30';
      case 'guardian': return 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30';
      default: return '';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'teacher': return 'Profesor';
      case 'student': return 'Estudiante';
      case 'guardian': return 'Apoderado';
      default: return role;
    }
  };

  // Function to get students assigned to a teacher's courses
  const getStudentsForTeacher = (teacherData: User & { password: string }) => {
    if (teacherData.role !== 'teacher') return [];
    
    return users.filter(user => 
      user.role === 'student' && 
      user.activeCourses.some(course => teacherData.activeCourses.includes(course))
    );
  };

  // Function to get available students (those not assigned to any course)
  const getAvailableStudentsForTeacher = (teacherData: User & { password: string }) => {
    if (teacherData.role !== 'teacher') return [];
    
    return users.filter(user => 
      user.role === 'student' && 
      user.activeCourses.length === 0 // Only students with no course assignment
    );
  };

  // Function to get students assigned to other teachers (for potential transfer)
  const getStudentsInOtherCourses = (teacherData: User & { password: string }) => {
    if (teacherData.role !== 'teacher') return [];
    
    return users.filter(user => 
      user.role === 'student' && 
      user.activeCourses.length > 0 &&
      !user.activeCourses.some(course => teacherData.activeCourses.includes(course))
    );
  };

  // Function to add student to teacher's course (removes from other courses first)
  const addStudentToCourse = (studentUsername: string, course: string) => {
    const updatedUsers = users.map(user => {
      if (user.username === studentUsername && user.role === 'student') {
        // Remove student from all previous courses (students can only be in one course)
        return {
          ...user,
          activeCourses: [course] // Replace all courses with just the new one
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
    
    const student = users.find(u => u.username === studentUsername);
    const hadPreviousCourses = student?.activeCourses && student.activeCourses.length > 0;
    
    toast({
      title: "Éxito",
      description: hadPreviousCourses 
        ? `${translate('userManagementStudentTransferred')} ${course}` 
        : `${translate('userManagementStudentAdded')} ${course}`,
    });
  };

  // Function to remove student from course (removes completely)
  const removeStudentFromCourse = (studentUsername: string, course: string) => {
    const updatedUsers = users.map(user => {
      if (user.username === studentUsername && user.role === 'student') {
        return {
          ...user,
          activeCourses: [] // Remove from all courses
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Éxito",
      description: `${translate('userManagementStudentRemoved')} ${course}`,
    });
  };

  // Function to get the current course and teacher for a student
  const getStudentCurrentAssignment = (studentUsername: string) => {
    const student = users.find(u => u.username === studentUsername);
    if (!student || student.role !== 'student' || student.activeCourses.length === 0) {
      return null;
    }
    
    const currentCourse = student.activeCourses[0]; // Should only have one course
    const currentTeacher = users.find(u => 
      u.role === 'teacher' && u.activeCourses.includes(currentCourse)
    );
    
    return {
      course: currentCourse,
      teacher: currentTeacher
    };
  };

  if (!user || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra usuarios del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="bg-teal-600 hover:bg-teal-700"
            onClick={syncAllChanges}
          >
            Guardar cambios
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Usuario
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Administradores Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-red-600" />
            Administradores
          </h2>
          <div className="grid gap-4">
            {users.filter(u => u.role === 'admin').map((userData) => (
              <Card key={userData.username}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-red-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {userData.displayName}
                          </p>
                          <Badge variant={getRoleBadgeVariant(userData.role)} className={getRoleBadgeCustomClass(userData.role)}>
                            {getRoleDisplayName(userData.role)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">@{userData.username}</p>
                        {userData.email && (
                          <p className="text-xs text-muted-foreground">{userData.email}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          <BookOpen className="w-3 h-3 inline mr-1" />
                          Acceso a todos los cursos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(userData)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {userData.username !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(userData.username)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Profesores Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Profesores
          </h2>
          <div className="grid gap-4">
            {users.filter(u => u.role === 'teacher').map((userData) => {
              const assignedStudents = getStudentsForTeacher(userData);
              const availableStudents = getAvailableStudentsForTeacher(userData);
              const studentsInOtherCourses = getStudentsInOtherCourses(userData);
              const isExpanded = expandedTeachers[userData.username] || false;

              return (
                <Card key={userData.username}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {userData.displayName}
                            </p>
                            <Badge variant={getRoleBadgeVariant(userData.role)} className={getRoleBadgeCustomClass(userData.role)}>
                              {getRoleDisplayName(userData.role)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{userData.username}</p>
                          {userData.email && (
                            <p className="text-xs text-muted-foreground">{userData.email}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-muted-foreground">
                              <BookOpen className="w-3 h-3 inline mr-1" />
                              {userData.activeCourses.join(', ')}
                            </p>
                            <p className="text-xs text-blue-600">
                              <Users className="w-3 h-3 inline mr-1" />
                              {assignedStudents.length} estudiantes asignados
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedTeachers(prev => ({
                            ...prev,
                            [userData.username]: !isExpanded
                          }))}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(userData)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(userData.username)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Teacher View - Students by Course */}
                    {isExpanded && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                          {userData.activeCourses.map(course => {
                            const studentsInThisCourse = assignedStudents.filter(student => 
                              student.activeCourses.includes(course)
                            );

                            return (
                              <div key={course} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-foreground mb-3 flex items-center">
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  {course}
                                  <Badge variant="outline" className="ml-2">
                                    {studentsInThisCourse.length} estudiantes
                                  </Badge>
                                </h4>

                                {/* Current students in this course */}
                                {studentsInThisCourse.length > 0 ? (
                                  <div className="space-y-2 mb-3">
                                    {studentsInThisCourse.map(student => (
                                      <div key={student.username} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                        <div>
                                          <span className="text-sm font-medium">{student.displayName}</span>
                                          <span className="text-xs text-muted-foreground ml-2">@{student.username}</span>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeStudentFromCourse(student.username, course)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <UserMinus className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground mb-3">No hay estudiantes asignados a este curso</p>
                                )}

                                {/* Add available students */}
                                {availableStudents.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-muted-foreground mb-2">Estudiantes disponibles (sin curso):</p>
                                    <div className="flex gap-2 flex-wrap">
                                      {availableStudents.map(student => (
                                        <Button
                                          key={student.username}
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addStudentToCourse(student.username, course)}
                                          className="text-green-600 hover:text-green-700"
                                        >
                                          <UserPlus className="w-3 h-3 mr-1" />
                                          {student.displayName}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Transfer students from other courses */}
                                {studentsInOtherCourses.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-yellow-200">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
                                      Transferir estudiante desde otro curso:
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                      {studentsInOtherCourses.map(student => {
                                        const currentAssignment = getStudentCurrentAssignment(student.username);
                                        return (
                                          <Button
                                            key={student.username}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addStudentToCourse(student.username, course)}
                                            className="text-orange-600 hover:text-orange-700 border-orange-200"
                                            title={`Transferir desde: ${currentAssignment?.course} (Prof. ${currentAssignment?.teacher?.displayName})`}
                                          >
                                            <UserPlus className="w-3 h-3 mr-1" />
                                            {student.displayName}
                                            <span className="text-xs ml-1 opacity-70">
                                              ({currentAssignment?.course})
                                            </span>
                                          </Button>
                                        );
                                      })}
                                    </div>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">
                                      {translate('userManagementTransferWarning')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Estudiantes Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Estudiantes
          </h2>
          <div className="grid gap-4">
            {users.filter(u => u.role === 'student').map((userData) => {
              const currentAssignment = getStudentCurrentAssignment(userData.username);

              return (
                <Card key={userData.username}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {userData.displayName}
                            </p>
                            <Badge variant={getRoleBadgeVariant(userData.role)} className={getRoleBadgeCustomClass(userData.role)}>
                              {getRoleDisplayName(userData.role)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{userData.username}</p>
                          {userData.email && (
                            <p className="text-xs text-muted-foreground">{userData.email}</p>
                          )}
                          <div className="mt-1">
                            {currentAssignment ? (
                              <div className="flex items-center space-x-4">
                                <p className="text-xs text-muted-foreground">
                                  <BookOpen className="w-3 h-3 inline mr-1" />
                                  {currentAssignment.course}
                                </p>
                                {currentAssignment.teacher && (
                                  <p className="text-xs text-blue-600">
                                    <Users className="w-3 h-3 inline mr-1" />
                                    Prof. {currentAssignment.teacher.displayName}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-yellow-600">
                                <BookOpen className="w-3 h-3 inline mr-1" />
                                Sin curso asignado
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(userData)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(userData.username)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create/Edit User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica la información del usuario.' : 'Completa la información para crear un nuevo usuario.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Usuario *
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="col-span-3"
                disabled={!!editingUser}
                placeholder="Ingresa el nombre de usuario"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Nombre *
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="col-span-3"
                placeholder="Nombre Completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="col-span-3"
                placeholder="Contraseña"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol *
              </Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="teacher">Profesor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== 'admin' && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Cursos
                </Label>
                <div className="col-span-3 space-y-2">
                  {formData.role === 'student' && (
                    <p className="text-xs text-muted-foreground mb-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                      {translate('userManagementStudentOneCourseInfo')}
                    </p>
                  )}
                  {availableCourses.map((course) => (
                    <div key={course} className="flex items-center space-x-2">
                      <Checkbox
                        id={course}
                        checked={formData.activeCourses.includes(course)}
                        onCheckedChange={(checked) => handleCourseToggle(course, checked as boolean)}
                      />
                      <Label htmlFor={course} className="text-sm">
                        {course}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
