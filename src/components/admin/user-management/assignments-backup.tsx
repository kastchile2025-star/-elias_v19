// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  UserCheck, 
  Users, 
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LocalStorageManager } from '@/lib/education-utils';
import { Student, Teacher, TeacherAssignment, Course, Section, Subject } from '@/types/education';
import { getAllAvailableSubjects, getSubjectsForLevel, SubjectColor } from '@/lib/subjects-colors';

interface TeacherSubjectAssignment {
  teacherId: string;
  sectionId: string;
  subjectName: string;
  assignedAt: Date;
}

export default function Assignments() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Año
  const [availableYears, setAvailableYears] = useState<number[]>(() => LocalStorageManager.listYears());
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const saved = Number(localStorage.getItem('admin-selected-year') || '');
    return Number.isFinite(saved) && saved > 0 ? saved : new Date().getFullYear();
  });
  
  // Form states for assignment dialog
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Load data on mount and when year changes
  useEffect(() => {
    try { localStorage.setItem('admin-selected-year', String(selectedYear)); } catch {}
    setAvailableYears(LocalStorageManager.listYears());
    loadData();
  }, [selectedYear]);

  const loadData = () => {
    try {
      const studentsData = LocalStorageManager.getStudentsForYear(selectedYear);
      const teachersData = LocalStorageManager.getTeachersForYear(selectedYear);
      const coursesData = LocalStorageManager.getCoursesForYear(selectedYear);
      const sectionsData = LocalStorageManager.getSectionsForYear(selectedYear);
      const subjectsData = LocalStorageManager.getSubjectsForYear(selectedYear);
      
      // Load teacher assignments por año
      const assignmentsData = LocalStorageManager.getTeacherAssignmentsForYear(selectedYear) as any[];

      setStudents(studentsData);
      setTeachers(teachersData);
      setCourses(coursesData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setTeacherAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      });
    }
  };

  // Get sections for a specific course
  const getSectionsForCourse = (courseId: string) => {
    return sections.filter(section => section.courseId === courseId);
  };

  // Get available subjects for a course based on its level
  const getSubjectsForCourse = (course: Course): SubjectColor[] => {
    return getSubjectsForLevel(course.level);
  };

  // Get assigned teacher for a specific section and subject
  const getAssignedTeacher = (sectionId: string, subjectName: string): Teacher | null => {
    const assignment = teacherAssignments.find(
      a => a.sectionId === sectionId && a.subjectName === subjectName
    );
    
    if (assignment) {
      return teachers.find(t => t.id === assignment.teacherId) || null;
    }
    
    return null;
  };

  // Get teachers who can teach a specific subject
  const getAvailableTeachersForSubject = (subjectName: string): Teacher[] => {
    return teachers.filter(teacher => 
      teacher.selectedSubjects?.includes(subjectName) && teacher.isActive
    );
  };

  // Handle teacher assignment
  const handleAssignTeacher = () => {
    if (!selectedSectionId || !selectedSubjectName || !selectedTeacherId) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive'
      });
      return;
    }

    // Check if assignment already exists
    const existingAssignment = teacherAssignments.find(
      a => a.sectionId === selectedSectionId && a.subjectName === selectedSubjectName
    );

    if (existingAssignment) {
      toast({
        title: 'Error',
        description: 'Ya existe una asignación para esta sección y asignatura',
        variant: 'destructive'
      });
      return;
    }

    const newAssignment: TeacherSubjectAssignment = {
      teacherId: selectedTeacherId,
      sectionId: selectedSectionId,
      subjectName: selectedSubjectName,
      assignedAt: new Date()
    };

    const updatedAssignments = [...teacherAssignments, newAssignment];
    setTeacherAssignments(updatedAssignments);
  LocalStorageManager.setTeacherAssignmentsForYear(selectedYear, updatedAssignments);

    // Reset form
    setSelectedSectionId('');
    setSelectedSubjectName('');
    setSelectedTeacherId('');
    setShowAssignDialog(false);

    const teacher = teachers.find(t => t.id === selectedTeacherId);
    toast({
      title: 'Éxito',
      description: `${teacher?.name} asignado correctamente a ${selectedSubjectName}`,
      variant: 'default'
    });
  };

  // Handle remove assignment
  const handleRemoveAssignment = (sectionId: string, subjectName: string) => {
    const updatedAssignments = teacherAssignments.filter(
      a => !(a.sectionId === sectionId && a.subjectName === subjectName)
    );
    
    setTeacherAssignments(updatedAssignments);
  LocalStorageManager.setTeacherAssignmentsForYear(selectedYear, updatedAssignments);

    toast({
      title: 'Éxito',
      description: 'Asignación eliminada correctamente',
      variant: 'default'
    });
  };

  // Open assignment dialog
  const openAssignDialog = (sectionId: string, subjectName: string) => {
    setSelectedSectionId(sectionId);
    setSelectedSubjectName(subjectName);
    setSelectedTeacherId('');
    setShowAssignDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <UserCheck className="w-6 h-6 mr-2 text-blue-500" />
            Asignaciones de Profesores
          </h2>
          <p className="text-muted-foreground">
            Asigna profesores a asignaturas por sección
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Año</Label>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v, 10))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Selecciona año" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => {
              const input = window.prompt('Ingresa el nuevo año (YYYY)');
              if (!input) return;
              const ny = parseInt(input, 10);
              if (!Number.isFinite(ny) || String(ny).length !== 4) {
                toast({ title: 'Año inválido', variant: 'destructive' });
                return;
              }
              try {
                LocalStorageManager.bootstrapYear(ny, selectedYear);
                const years = LocalStorageManager.listYears();
                setAvailableYears(years);
                setSelectedYear(ny);
              } catch {}
            }}
          >
            Crear año
          </Button>
        </div>
      </div>

      {/* Courses and Sections Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No hay cursos disponibles. Primero crea cursos en la pestaña "Cursos y Secciones".
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {courses.map(course => {
            const courseSections = getSectionsForCourse(course.id);
            const courseSubjects = getSubjectsForCourse(course);

            return (
              <Card key={course.id} className="border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <CardTitle className="flex items-center text-xl">
                    <GraduationCap className="w-6 h-6 mr-3" />
                    {course.name}
                    <Badge variant="outline" className="ml-3">
                      {course.level === 'basica' ? 'Básica' : 'Media'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {courseSections.length} secciones • {courseSubjects.length} asignaturas
                  </p>
                </CardHeader>
                
                <CardContent className="p-6">
                  {courseSections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No hay secciones para este curso</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {courseSections.map(section => (
                        <Card key={section.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-lg">
                              <span className="flex items-center">
                                <Building2 className="w-5 h-5 mr-2" />
                                Sección {section.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {section.uniqueCode}
                              </Badge>
                            </CardTitle>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Estudiantes:</span>
                              <Badge variant="outline">
                                {section.studentCount}/{section.maxStudents || 'Sin límite'}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Asignaturas y Profesores
                              </h4>
                              
                              <div className="space-y-2">
                                {courseSubjects.map(subject => {
                                  const assignedTeacher = getAssignedTeacher(section.id, subject.name);
                                  const availableTeachers = getAvailableTeachersForSubject(subject.name);
                                  
                                  return (
                                    <div
                                      key={subject.name}
                                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <Badge
                                          className="text-xs font-bold border-0 px-2 py-1"
                                          style={{
                                            backgroundColor: subject.bgColor,
                                            color: subject.textColor
                                          }}
                                          title={subject.name}
                                        >
                                          {subject.abbreviation}
                                        </Badge>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium">{subject.name}</span>
                                          {assignedTeacher ? (
                                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              {assignedTeacher.name}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-red-500 dark:text-red-400 flex items-center">
                                              <XCircle className="w-3 h-3 mr-1" />
                                              Sin profesor asignado
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {assignedTeacher ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveAssignment(section.id, subject.name)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        ) : availableTeachers.length > 0 ? (
                                          <Button
                                            size="sm"
                                            onClick={() => openAssignDialog(section.id, subject.name)}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </Button>
                                        ) : (
                                          <Badge variant="destructive" className="text-xs">
                                            Sin profesores
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Profesor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Asignatura</Label>
              <p className="text-sm font-medium text-muted-foreground">
                {selectedSubjectName}
              </p>
            </div>

            <div>
              <Label htmlFor="teacher">Profesor *</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTeachersForSubject(selectedSubjectName).map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center space-x-2">
                        <span>{teacher.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {teacher.uniqueCode}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAssignTeacher}
                disabled={!selectedTeacherId}
                className="flex-1"
              >
                Asignar Profesor
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AssignmentsTab() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Assignment form states
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    type: 'student' as 'student' | 'teacher',
    userId: '',
    courseId: '',
    sectionId: '',
    subjectIds: [] as string[]
  });

  // Dialog states for course view
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const studentsData = LocalStorageManager.getStudents();
      const teachersData = LocalStorageManager.getTeachers();
      const coursesData = LocalStorageManager.getCourses();
      const sectionsData = LocalStorageManager.getSections();
      const subjectsData = LocalStorageManager.getSubjects();
      const assignmentsData = LocalStorageManager.getAssignments();

      setStudents(studentsData);
      setTeachers(teachersData);
      setCourses(coursesData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      });
    }
  };

  // Get unassigned students
  const getUnassignedStudents = () => {
    return students.filter(student => !student.courseId || !student.sectionId);
  };

  // Get available sections for a course
  const getAvailableSections = (courseId: string) => {
    return sections.filter(s => s.courseId === courseId);
  };

  // Get subjects for a course
  const getSubjectsForCourse = (courseId: string) => {
    return subjects.filter(s => s.courseId === courseId);
  };

  // Get teacher assignments info
  const getTeacherAssignments = (teacherId: string) => {
    return assignments.filter(a => a.teacherId === teacherId && a.isActive);
  };

  // Handle student assignment
  const handleAssignStudent = async () => {
    if (!assignmentForm.userId || !assignmentForm.courseId || !assignmentForm.sectionId) {
      toast({
        title: 'Error',
        description: 'Todos los campos son requeridos',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update student
      const updatedStudents = students.map(student => 
        student.id === assignmentForm.userId
          ? {
              ...student,
              courseId: assignmentForm.courseId,
              sectionId: assignmentForm.sectionId,
              updatedAt: new Date()
            }
          : student
      );
      
      setStudents(updatedStudents);
      LocalStorageManager.setStudents(updatedStudents);

      // Update section student count
      const updatedSections = sections.map(section => 
        section.id === assignmentForm.sectionId
          ? { ...section, studentCount: section.studentCount + 1 }
          : section
      );
      
      setSections(updatedSections);
      LocalStorageManager.setSections(updatedSections);

      resetForm();
      setShowAssignmentDialog(false);

      toast({
        title: 'Éxito',
        description: 'Estudiante asignado correctamente',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo asignar el estudiante',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle teacher assignment
  const handleAssignTeacher = async () => {
    if (!assignmentForm.userId || !assignmentForm.sectionId || !assignmentForm.subjectIds?.length) {
      toast({
        title: 'Error',
        description: 'Todos los campos son requeridos',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create new assignments for each subject
      const newAssignments: TeacherAssignment[] = assignmentForm.subjectIds.map(subjectId => ({
        teacherId: assignmentForm.userId,
        sectionId: assignmentForm.sectionId!,
        subjectId,
        isActive: true,
        assignedAt: new Date()
      }));

      const updatedAssignments = [...assignments, ...newAssignments];
      setAssignments(updatedAssignments);
      LocalStorageManager.setAssignments(updatedAssignments);

      // Update teacher's assigned sections
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === assignmentForm.userId
          ? {
              ...teacher,
              assignedSections: [...(teacher.assignedSections || []), ...newAssignments],
              updatedAt: new Date()
            }
          : teacher
      );
      
      setTeachers(updatedTeachers);
      LocalStorageManager.setTeachers(updatedTeachers);

      resetForm();
      setShowAssignmentDialog(false);

      toast({
        title: 'Éxito',
        description: 'Profesor asignado correctamente',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo asignar el profesor',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove student assignment
  const handleRemoveStudentAssignment = (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      // Update student
      const updatedStudents = students.map(s => 
        s.id === studentId
          ? { ...s, courseId: undefined, sectionId: undefined, updatedAt: new Date() }
          : s
      );
      
      setStudents(updatedStudents);
      LocalStorageManager.setStudents(updatedStudents);

      // Update section student count
      if (student.sectionId) {
        const updatedSections = sections.map(section => 
          section.id === student.sectionId
            ? { ...section, studentCount: Math.max(0, section.studentCount - 1) }
            : section
        );
        
        setSections(updatedSections);
        LocalStorageManager.setSections(updatedSections);
      }

      toast({
        title: 'Éxito',
        description: 'Asignación de estudiante removida',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo remover la asignación',
        variant: 'destructive'
      });
    }
  };

  // Remove teacher assignment
  const handleRemoveTeacherAssignment = (assignmentId: string) => {
    try {
      const assignment = assignments.find(a => 
        a.teacherId === assignmentId // This is actually the teacher ID for simplicity
      );
      
      if (!assignment) return;

      // Remove assignments
      const updatedAssignments = assignments.filter(a => a.teacherId !== assignmentId);
      setAssignments(updatedAssignments);
      LocalStorageManager.setAssignments(updatedAssignments);

      // Update teacher
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === assignmentId
          ? { ...teacher, assignedSections: [], updatedAt: new Date() }
          : teacher
      );
      
      setTeachers(updatedTeachers);
      LocalStorageManager.setTeachers(updatedTeachers);

      toast({
        title: 'Éxito',
        description: 'Asignación de profesor removida',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo remover la asignación',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setAssignmentForm({
      type: 'student',
      userId: '',
      courseId: '',
      sectionId: '',
      subjectIds: []
    });
  };

  // Get course and section names
  const getCourseAndSectionName = (courseId?: string, sectionId?: string) => {
    const course = courses.find(c => c.id === courseId);
    const section = sections.find(s => s.id === sectionId);
    return {
      courseName: course?.name || 'Sin curso',
      sectionName: section?.name || 'Sin sección'
    };
  };

  // Get subject name
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Asignatura desconocida';
  };

  // Get assignment details for teacher
  const getTeacherAssignmentDetails = (teacherId: string) => {
    const teacherAssignments = getTeacherAssignments(teacherId);
    const details = teacherAssignments.map(assignment => {
      const section = sections.find(s => s.id === assignment.sectionId);
      const course = courses.find(c => c.id === section?.courseId);
      const subject = subjects.find(s => s.id === assignment.subjectId);
      
      return {
        courseName: course?.name || 'Sin curso',
        sectionName: section?.name || 'Sin sección',
        subjectName: subject?.name || 'Sin asignatura',
        subjectColor: subject?.color || '#gray'
      };
    });

    return details;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <UserCheck className="w-6 h-6 mr-2 text-blue-500" />
            Asignaciones
          </h2>
          <p className="text-muted-foreground">
            Asigna estudiantes a cursos y profesores a materias
          </p>
        </div>
        
        <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Asignación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Asignación</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Assignment Type */}
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="assignStudent"
                    name="assignmentType"
                    checked={assignmentForm.type === 'student'}
                    onChange={() => setAssignmentForm(prev => ({ 
                      ...prev, 
                      type: 'student',
                      userId: '',
                      courseId: '',
                      sectionId: '',
                      subjectIds: []
                    }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="assignStudent" className="flex items-center cursor-pointer">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Estudiante
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="assignTeacher"
                    name="assignmentType"
                    checked={assignmentForm.type === 'teacher'}
                    onChange={() => setAssignmentForm(prev => ({ 
                      ...prev, 
                      type: 'teacher',
                      userId: '',
                      courseId: '',
                      sectionId: '',
                      subjectIds: []
                    }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="assignTeacher" className="flex items-center cursor-pointer">
                    <Users className="w-4 h-4 mr-1" />
                    Profesor
                  </Label>
                </div>
              </div>

              {/* User Selection */}
              <div>
                <Label htmlFor="userId">
                  {assignmentForm.type === 'student' ? 'Estudiante *' : 'Profesor *'}
                </Label>
                <Select
                  value={assignmentForm.userId}
                  onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, userId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecciona un ${assignmentForm.type === 'student' ? 'estudiante' : 'profesor'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {assignmentForm.type === 'student' 
                      ? getUnassignedStudents().map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} (@{student.username})
                          </SelectItem>
                        ))
                      : teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} (@{teacher.username})
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Course Selection */}
              <div>
                <Label htmlFor="courseId">Curso *</Label>
                <Select
                  value={assignmentForm.courseId}
                  onValueChange={(value) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    courseId: value,
                    sectionId: '',
                    subjectIds: []
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Selection */}
              {assignmentForm.courseId && (
                <div>
                  <Label htmlFor="sectionId">Sección *</Label>
                  <Select
                    value={assignmentForm.sectionId}
                    onValueChange={(value) => setAssignmentForm(prev => ({ 
                      ...prev, 
                      sectionId: value,
                      subjectIds: assignmentForm.type === 'teacher' ? [] : prev.subjectIds
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSections(assignmentForm.courseId).map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          Sección {section.name} ({section.studentCount}/{section.maxStudents || '∞'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Subject Selection for Teachers */}
              {assignmentForm.type === 'teacher' && assignmentForm.courseId && (
                <div>
                  <Label>Asignaturas *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {getSubjectsForCourse(assignmentForm.courseId).map(subject => (
                      <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assignmentForm.subjectIds.includes(subject.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignmentForm(prev => ({
                                ...prev,
                                subjectIds: [...prev.subjectIds, subject.id]
                              }));
                            } else {
                              setAssignmentForm(prev => ({
                                ...prev,
                                subjectIds: prev.subjectIds.filter(id => id !== subject.id)
                              }));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{subject.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={assignmentForm.type === 'student' ? handleAssignStudent : handleAssignTeacher}
                  disabled={isLoading || !assignmentForm.userId || !assignmentForm.courseId || !assignmentForm.sectionId || 
                    (assignmentForm.type === 'teacher' && !assignmentForm.subjectIds?.length)}
                  className="flex-1"
                >
                  {isLoading ? 'Asignando...' : 'Crear Asignación'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignmentDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{getUnassignedStudents().length}</p>
                <p className="text-sm text-muted-foreground">Estudiantes sin asignar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{teachers.filter(t => getTeacherAssignments(t.id).length > 0).length}</p>
                <p className="text-sm text-muted-foreground">Profesores asignados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{assignments.filter(a => a.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Asignaciones activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Unassigned Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Estudiantes Sin Asignar
              <Badge variant="secondary" className="ml-2">
                {getUnassignedStudents().length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getUnassignedStudents().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Todos los estudiantes están asignados</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getUnassignedStudents().map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">@{student.username}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setAssignmentForm(prev => ({
                          ...prev,
                          type: 'student',
                          userId: student.id
                        }));
                        setShowAssignmentDialog(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Asignar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-green-500" />
              Asignaciones Actuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Student Assignments */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-blue-600">Estudiantes</h4>
                <div className="space-y-2">
                  {students.filter(s => s.courseId && s.sectionId).map(student => {
                    const { courseName, sectionName } = getCourseAndSectionName(student.courseId, student.sectionId);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {courseName} - Sección {sectionName}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveStudentAssignment(student.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Assignments */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-green-600">Profesores</h4>
                <div className="space-y-2">
                  {teachers.filter(t => getTeacherAssignments(t.id).length > 0).map(teacher => {
                    const assignmentDetails = getTeacherAssignmentDetails(teacher.id);
                    return (
                      <div key={teacher.id} className="p-2 bg-green-50 dark:bg-green-950 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{teacher.name}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveTeacherAssignment(teacher.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {assignmentDetails.map((detail, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {detail.subjectName} - {detail.courseName} Sec.{detail.sectionName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
