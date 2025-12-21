"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
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
  Building2,
  AlertTriangle
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
  const { translate } = useLanguage();
  // Año seleccionado compartido con módulos admin
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const saved = Number(localStorage.getItem('admin-selected-year') || '')
    return Number.isFinite(saved) && saved > 0 ? saved : new Date().getFullYear();
  });
  const [availableYears, setAvailableYears] = useState<number[]>(() => LocalStorageManager.listYears());
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states for assignment dialog
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Export de asignaciones trasladado a Configuración > Carga masiva.

  // Inicializar años y año seleccionado (preferir admin-selected-year; fallback 2025)
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem('admin-selected-year') || '');
      let years = LocalStorageManager.listYears();
      if (!years.includes(2025)) years = [2025, ...years].sort((a,b)=>b-a);
      setAvailableYears(years);
      const initial = (Number.isFinite(saved) && saved > 0) ? saved : (years[0] || 2025);
      if (initial !== selectedYear) setSelectedYear(initial);
      // Cargar de inmediato con el año inicial
      loadData();
    } catch {
      setAvailableYears([2025]);
      if (selectedYear !== 2025) setSelectedYear(2025);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data on component mount and when year changes
  useEffect(() => {
    loadData();
    try { localStorage.setItem('admin-selected-year', String(selectedYear)); } catch {}
    setAvailableYears(LocalStorageManager.listYears());
  }, [selectedYear]);

  const loadData = () => {
    try {
  const studentsData = LocalStorageManager.getStudentsForYear(selectedYear);
  const teachersData = LocalStorageManager.getTeachersForYear(selectedYear);
  const coursesData = LocalStorageManager.getCoursesForYear(selectedYear);
  const sectionsData = LocalStorageManager.getSectionsForYear(selectedYear);
  const subjectsData = LocalStorageManager.getSubjectsForYear(selectedYear);

      setStudents(studentsData);
      setTeachers(teachersData);
      setCourses(coursesData);
      setSections(sectionsData);
      setSubjects(subjectsData);

  // Load teacher assignments for selected year
  const assignmentsData = LocalStorageManager.getTeacherAssignmentsForYear(selectedYear);
      setTeacherAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotLoadData') || 'Could not load data',
        variant: 'destructive'
      });
    }
  };

  // Refrescar automáticamente cuando cambian asignaciones o usuarios
  useEffect(() => {
    const refresh = () => {
      try {
        const data = LocalStorageManager.getTeacherAssignmentsForYear(selectedYear);
        setTeacherAssignments(data);
      } catch {}
    };
    window.addEventListener('teacherAssignmentsChanged', refresh as any);
    window.addEventListener('usersUpdated', refresh as any);
    return () => {
      window.removeEventListener('teacherAssignmentsChanged', refresh as any);
      window.removeEventListener('usersUpdated', refresh as any);
    };
  }, [selectedYear]);

  // Get sections for a specific course
  const getSectionsForCourse = (courseId: string) => {
    return sections.filter(section => section.courseId === courseId);
  };

  // Get subjects for a specific course
  const getSubjectsForCourse = (course: Course) => {
    const levelSubjects = getSubjectsForLevel(course.level);
    return levelSubjects.map(subject => ({
      ...subject,
      id: `${course.id}-${subject.name}`
    }));
  };

  // Get assigned teacher for a section and subject
  const getAssignedTeacher = (sectionId: string, subjectName: string) => {
    const assignment = teacherAssignments.find(
      a => a.sectionId === sectionId && a.subjectName === subjectName
    );
    if (assignment) {
      return teachers.find(t => t.id === assignment.teacherId);
    }
    return null;
  };

  // Get available teachers for a subject
  const getAvailableTeachersForSubject = (subjectName: string) => {
    return teachers.filter(teacher => 
      teacher.selectedSubjects && teacher.selectedSubjects.includes(subjectName)
    );
  };

  // Open assignment dialog
  const openAssignDialog = (sectionId: string, subjectName: string) => {
    setSelectedSectionId(sectionId);
    setSelectedSubjectName(subjectName);
    setSelectedTeacherId('');
    setShowAssignDialog(true);
  };

  // Handle teacher assignment
  const handleAssignTeacher = async () => {
    if (!selectedTeacherId || !selectedSectionId || !selectedSubjectName) {
      toast({
        title: translate('error') || 'Error',
        description: 'Todos los campos son requeridos',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const newAssignment: TeacherSubjectAssignment = {
        teacherId: selectedTeacherId,
        sectionId: selectedSectionId,
        subjectName: selectedSubjectName,
        assignedAt: new Date()
      };

  const updatedAssignments = [...teacherAssignments, newAssignment];
  setTeacherAssignments(updatedAssignments);
  LocalStorageManager.setTeacherAssignmentsForYear(selectedYear, updatedAssignments);

      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('teacherAssignmentsChanged'));

      setShowAssignDialog(false);
      setSelectedSectionId('');
      setSelectedSubjectName('');
      setSelectedTeacherId('');

      toast({
        title: translate('success') || 'Success',
        description: translate('teacherAssignedSuccessfully') || 'Teacher assigned successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotAssignTeacher') || 'Could not assign teacher',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove teacher assignment
  const handleRemoveAssignment = (sectionId: string, subjectName: string) => {
    try {
      const updatedAssignments = teacherAssignments.filter(
        a => !(a.sectionId === sectionId && a.subjectName === subjectName)
      );
      setTeacherAssignments(updatedAssignments);
  LocalStorageManager.setTeacherAssignmentsForYear(selectedYear, updatedAssignments);

      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('teacherAssignmentsChanged'));

      toast({
        title: translate('success') || 'Success',
        description: translate('assignmentRemovedSuccessfully') || 'Assignment removed successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotRemoveAssignment') || 'Could not remove assignment',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <UserCheck className="w-6 h-6 mr-2 text-blue-500" />
            {translate('userManagementAssignmentsTitle') || 'Asignaciones'}
          </h2>
          <p className="text-muted-foreground">
            {translate('userManagementAssignmentsDesc') || 'Gestiona las asignaciones de profesores por curso, sección y asignatura'}
          </p>
        </div>
  {/* Año (descarga removida; ahora en Configuración) */}
        <div className="flex items-center gap-2">
          <Label className="text-xs opacity-80">{translate('calendarYear') || 'Año'}</Label>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-blue-500 mr-2" />
              <div>
                <p className="text-xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">{translate('userManagementAvailableCourses') || 'Cursos disponibles'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-orange-500 mr-2" />
              <div>
                <p className="text-xl font-bold">{sections.length}</p>
                <p className="text-xs text-muted-foreground">{translate('userManagementTotalSections') || 'Secciones totales'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <GraduationCap className="w-6 h-6 text-indigo-500 mr-2" />
              <div>
                <p className="text-xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">{translate('userManagementTotalStudents') || 'Estudiantes totales'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-green-500 mr-2" />
              <div>
                <p className="text-xl font-bold">{teachers.length}</p>
                <p className="text-xs text-muted-foreground">{translate('userManagementAvailableTeachers') || 'Profesores disponibles'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses and Sections Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              {translate('userManagementNoCoursesAvailable') || 'No hay cursos disponibles. Primero crea cursos en la pestaña "Cursos y Secciones".'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courses.map(course => {
            const courseSections = getSectionsForCourse(course.id);
            const courseSubjects = getSubjectsForCourse(course);

            return (
              <Card key={course.id} className="border-2 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 py-3">
                  <CardTitle className="flex items-center text-lg">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    {course.name}
                    <Badge variant="outline" className="ml-2 text-xs dark:border-gray-600 dark:text-gray-300">
                      {course.level === 'basica' ? 'Básica' : 'Media'}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {courseSections.length} {translate('userManagementSections') || 'secciones'} • {courseSubjects.length} {translate('userManagementSubjects') || 'asignaturas'}
                  </p>
                </CardHeader>
                
                <CardContent className="p-4">
                  {courseSections.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{translate('userManagementNoSectionsForCourse') || 'No hay secciones para este curso'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {courseSections.map(section => (
                        <Card key={section.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow min-h-[300px]">
                          <CardHeader className="pb-4 px-5 pt-5">
                            <CardTitle className="flex items-center justify-between text-sm mb-2">
                              <span className="flex items-center min-w-0 flex-1">
                                <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{translate('userManagementSection') || 'Sección'} {section.name}</span>
                              </span>
                              <Badge variant="secondary" className="text-xs px-2 py-1 ml-2 flex-shrink-0 dark:bg-gray-700 dark:text-gray-200">
                                {section.uniqueCode}
                              </Badge>
                            </CardTitle>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{translate('userManagementStudentsLabel') || 'Estudiantes:'}</span>
                              <Badge variant="outline" className="text-xs px-2 py-1 dark:border-gray-600 dark:text-gray-300">
                                {section.studentCount}/{section.maxStudents || '∞'}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-3 px-5 pb-5">
                            <div>
                              <h4 className="font-medium text-xs mb-3 flex items-center text-gray-600">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {translate('userManagementSubjectsTitle') || 'Asignaturas'}
                              </h4>
                              
                              <div className="space-y-2">
                                {courseSubjects.map(subject => {
                                  const assignedTeacher = getAssignedTeacher(section.id, subject.name);
                                  const availableTeachers = getAvailableTeachersForSubject(subject.name);
                                  
                                  return (
                                    <div
                                      key={subject.name}
                                      className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[60px]"
                                    >
                                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                                        <Badge
                                          className="text-xs font-bold border-0 px-2 py-1 flex-shrink-0 ring-1 ring-black/10 dark:ring-white/20"
                                          style={{
                                            backgroundColor: subject.bgColor,
                                            color: subject.textColor
                                          }}
                                          title={subject.name}
                                        >
                                          {subject.abbreviation}
                                        </Badge>
                                        <div className="flex flex-col min-w-0 flex-1">
                                          <span className="text-xs font-medium mb-1 leading-tight">{subject.name}</span>
                                          {assignedTeacher ? (
                                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                              <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">{assignedTeacher.name}</span>
                                            </span>
                                          ) : (
                                            <span className="text-xs text-red-500 dark:text-red-400 flex items-center">
                                              <XCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                                              {translate('userManagementNoTeacher') || 'Sin profesor'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center ml-2 flex-shrink-0">
                                        {assignedTeacher ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveAssignment(section.id, subject.name)}
                                            className="text-red-600 hover:text-red-700 h-7 w-7 p-0 dark:text-red-400 dark:hover:text-red-300 dark:border-red-700/60 dark:hover:bg-red-900/20"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        ) : (
                                          <Button
                                            size="sm"
                                            onClick={() => openAssignDialog(section.id, subject.name)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white h-7 w-7 p-0 dark:bg-blue-600 dark:hover:bg-blue-500"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </Button>
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
                  {(getAvailableTeachersForSubject(selectedSubjectName).length > 0
                    ? getAvailableTeachersForSubject(selectedSubjectName)
                    : teachers
                  ).map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center space-x-2">
                        <span>{teacher.name}</span>
      <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
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
                disabled={!selectedTeacherId || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Asignando...' : 'Asignar Profesor'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
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
