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

  // Inicializar años y año seleccionado (preferir admin-selected-year; fallback 2025)
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem('admin-selected-year') || '');
      let years = LocalStorageManager.listYears();
      if (!years.includes(2025)) years = [2025, ...years].sort((a,b)=>b-a);
      setAvailableYears(years);
      const initial = (Number.isFinite(saved) && saved > 0) ? saved : (years[0] || 2025);
      if (initial !== selectedYear) setSelectedYear(initial);
      loadData();
    } catch {
      setAvailableYears([2025]);
      if (selectedYear !== 2025) setSelectedYear(2025);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      setStudents(studentsData);
      setTeachers(teachersData);
      setCourses(coursesData);
      setSections(sectionsData);
      setSubjects(subjectsData);

  // Load teacher assignments por año
  const assignmentsData = LocalStorageManager.getTeacherAssignmentsForYear(selectedYear) as any[];
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
        title: 'Error',
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

      setShowAssignDialog(false);
      setSelectedSectionId('');
      setSelectedSubjectName('');
      setSelectedTeacherId('');

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

  // Remove teacher assignment
  const handleRemoveAssignment = (sectionId: string, subjectName: string) => {
    try {
      const updatedAssignments = teacherAssignments.filter(
        a => !(a.sectionId === sectionId && a.subjectName === subjectName)
      );
      setTeacherAssignments(updatedAssignments);
  LocalStorageManager.setTeacherAssignmentsForYear(selectedYear, updatedAssignments);

      toast({
        title: 'Éxito',
        description: 'Asignación removida correctamente',
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
            Gestiona las asignaciones de profesores por curso, sección y asignatura
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Cursos disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-sm text-muted-foreground">Profesores disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{teacherAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Asignaciones activas</p>
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
                                          className="text-xs font-bold border-0 px-2 py-1 ring-1 ring-black/10 dark:ring-white/20"
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
