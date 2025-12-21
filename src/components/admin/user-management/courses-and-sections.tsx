"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { 
  Plus, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Edit2, 
  Trash2, 
  Save,
  X,
  Building,
  RefreshCcw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { EducationCodeGenerator, LocalStorageManager, EducationAutomation } from '@/lib/education-utils';
import NewYearDialog from './NewYearDialog';
import { Course, Section, Subject } from '@/types/education';
import { getSubjectsForCourseWithColors, getSubjectColor } from '@/lib/subjects-colors';
import { getAllCourses } from '@/lib/books-data';

export default function CoursesAndSections() {
  const { toast } = useToast();
  const { translate } = useLanguage();
  // Año seleccionado y lista de años disponibles
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const saved = Number(localStorage.getItem('admin-selected-year') || '')
    return Number.isFinite(saved) && saved > 0 ? saved : new Date().getFullYear();
  });
  const [availableYears, setAvailableYears] = useState<number[]>(() => LocalStorageManager.listYears());
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showYearDialog, setShowYearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Year dialog state (migrado a componente reutilizable)

  // Form data
  const [courseForm, setCourseForm] = useState({
    name: '',
    level: 'basica' as 'basica' | 'media',
    description: ''
  });

  const [sectionForm, setSectionForm] = useState({
    name: '',
    courseId: '',
  maxStudents: 45
  });

  // Load data on component mount and when year changes
  useEffect(() => {
    loadData();
    // Persistir selección de año para compartir entre pestañas admin
    try { localStorage.setItem('admin-selected-year', String(selectedYear)); } catch {}
  }, [selectedYear]);

  const loadData = () => {
    try {
      const coursesData = LocalStorageManager.getCoursesForYear(selectedYear);
      const sectionsData = LocalStorageManager.getSectionsForYear(selectedYear);
      const subjectsData = LocalStorageManager.getSubjectsForYear(selectedYear);

      setCourses(coursesData);
      setSections(sectionsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotLoadData') || 'Could not load data',
        variant: 'destructive'
      });
    }
  };

  // Recalcular contadores automáticamente cuando haya importación masiva o cambios relevantes
  useEffect(() => {
    let debounceTimer: any = null;
    const scheduleRecalc = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          // Reasignar estudiantes si es necesario y recalcular contadores
          try { EducationAutomation.reassignStudentsToExistingSections?.(selectedYear); } catch {}
          try { EducationAutomation.recalculateSectionCounts(translate, selectedYear); } catch {}
          // Recargar datos de UI
          loadData();
        } catch (e) {
          console.warn('[Cursos y Secciones] Auto-recalc falló:', e);
        }
      }, 200);
    };

    const onUsers = () => scheduleRecalc();
    const onUsersUpdated = () => scheduleRecalc();
    const onStudAssignChanged = () => scheduleRecalc();
    const onStudAssignUpdated = () => scheduleRecalc();
    const onTeachAssignChanged = () => scheduleRecalc();
    const onTeachAssignUpdated = () => scheduleRecalc();
    const onDashboardUpdate = () => scheduleRecalc();

    try { window.addEventListener('usersChanged', onUsers as any); } catch {}
    try { window.addEventListener('usersUpdated', onUsersUpdated as any); } catch {}
    try { window.addEventListener('studentAssignmentsChanged', onStudAssignChanged as any); } catch {}
    try { window.addEventListener('studentAssignmentsUpdated', onStudAssignUpdated as any); } catch {}
    try { window.addEventListener('teacherAssignmentsChanged', onTeachAssignChanged as any); } catch {}
    try { window.addEventListener('teacherAssignmentsUpdated', onTeachAssignUpdated as any); } catch {}
    try { window.addEventListener('updateDashboardCounts', onDashboardUpdate as any); } catch {}

    return () => {
      if (debounceTimer) { try { clearTimeout(debounceTimer); } catch {} }
      try { window.removeEventListener('usersChanged', onUsers as any); } catch {}
      try { window.removeEventListener('usersUpdated', onUsersUpdated as any); } catch {}
      try { window.removeEventListener('studentAssignmentsChanged', onStudAssignChanged as any); } catch {}
      try { window.removeEventListener('studentAssignmentsUpdated', onStudAssignUpdated as any); } catch {}
      try { window.removeEventListener('teacherAssignmentsChanged', onTeachAssignChanged as any); } catch {}
      try { window.removeEventListener('teacherAssignmentsUpdated', onTeachAssignUpdated as any); } catch {}
      try { window.removeEventListener('updateDashboardCounts', onDashboardUpdate as any); } catch {}
    };
  }, [selectedYear, translate]);

  // Función para crear secciones A y B automáticamente
  const handleCreateStandardSections = async () => {
    setIsLoading(true);
    try {
      // Debug: Verificar cursos antes de crear secciones
      console.log('=== DEBUGGING SECTION CREATION ===');
      LocalStorageManager.debugLocalStorage();
      
  const result = EducationAutomation.createStandardSections(translate, selectedYear);
      
      if (result.success) {
        // Recargar datos
        loadData();
        
        toast({
          title: translate('success') || 'Success',
          description: result.message,
          variant: 'default'
        });
      } else {
        toast({
          title: translate('error') || 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error in handleCreateStandardSections:', error);
      toast({
        title: translate('error') || 'Error',
        description: translate('errorCreatingAutomaticSections') || 'Error creating automatic sections',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función FORZADA para depuración
  const handleForceCreateSections = async () => {
    setIsLoading(true);
    try {
      console.log('=== FORCE MODE DEBUGGING ===');
      LocalStorageManager.debugLocalStorage();
      
  const result = EducationAutomation.forceCreateSectionsForAllCourses(translate, selectedYear);
      
      if (result.success) {
        loadData();
        toast({
          title: translate('successForcedMode') || 'Éxito (Modo Forzado)',
          description: result.message,
          variant: 'default'
        });
      } else {
        toast({
          title: translate('error') || 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error in handleForceCreateSections:', error);
      toast({
        title: translate('error') || 'Error',
        description: translate('errorInForcedMode') || 'Error in forced mode',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear cursos estándar
  const handleCreateStandardCourses = async () => {
    setIsLoading(true);
    try {
  const result = EducationAutomation.createStandardCourses(translate, selectedYear);
      
      if (result.success) {
        // Recargar datos
        loadData();
        
        toast({
          title: translate('success') || 'Success',
          description: result.message,
          variant: 'default'
        });
      } else {
        toast({
          title: translate('error') || 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('errorCreatingStandardCourses') || 'Error creating standard courses',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para recalcular contadores de estudiantes
  const handleRecalculateCounters = async () => {
    setIsLoading(true);
    try {
    // Primero, intentar reasignar estudiantes a secciones existentes para el año
    const reassignRes = EducationAutomation.reassignStudentsToExistingSections?.(selectedYear);
    const reassigned = Number(reassignRes?.reassigned || 0);

    // Luego, recalcular contadores de secciones
    const result = EducationAutomation.recalculateSectionCounts(translate, selectedYear);
      
      if (result.success) {
        // Recargar datos
        loadData();
        
        toast({
          title: translate('success') || 'Success',
      description: `${result.message}${reassigned ? ` — ${reassigned} ${(translate('configReassignedCount') || 'estudiantes reasignados')}` : ''}`,
          variant: 'default'
        });
      } else {
        toast({
          title: translate('error') || 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('errorRecalculatingCounters') || 'Error recalculating counters',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Course management
  const handleCreateCourse = async () => {
    if (!courseForm.name.trim()) {
      toast({
        title: translate('error') || 'Error',
        description: translate('courseNameRequired') || 'Course name is required',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Crear el curso
      const newCourse: Course = {
        id: crypto.randomUUID(),
        uniqueCode: EducationCodeGenerator.generateCourseCode(),
        name: courseForm.name.trim(),
        level: courseForm.level,
        description: courseForm.description.trim(),
        sections: [],
        subjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

  const updatedCourses = [...courses, newCourse];
  setCourses(updatedCourses);
  LocalStorageManager.setCoursesForYear(selectedYear, updatedCourses);

      // Crear automáticamente secciones A y B
      const sectionA: Section = {
        id: crypto.randomUUID(),
        uniqueCode: EducationCodeGenerator.generateSectionCode(),
        name: 'A',
        courseId: newCourse.id,
        studentCount: 0,
  maxStudents: 45,
        subjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const sectionB: Section = {
        id: crypto.randomUUID(),
        uniqueCode: EducationCodeGenerator.generateSectionCode(),
        name: 'B',
        courseId: newCourse.id,
        studentCount: 0,
  maxStudents: 45,
        subjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

  const newSections = [...sections, sectionA, sectionB];
  setSections(newSections);
  LocalStorageManager.setSectionsForYear(selectedYear, newSections);

      // Crear asignaturas basadas en los libros disponibles
      const subjectsWithColors = getSubjectsForCourseWithColors(courseForm.name.trim());
      const newSubjects: Subject[] = [];

      subjectsWithColors.forEach(subjectColor => {
        const newSubject: Subject = {
          id: crypto.randomUUID(),
          uniqueCode: EducationCodeGenerator.generateSubjectCode(),
          name: subjectColor.name,
          abbreviation: subjectColor.abbreviation,
          description: `Asignatura de ${subjectColor.name} para ${courseForm.name.trim()}`,
          courseId: newCourse.id,
          color: subjectColor.color,
          bgColor: subjectColor.bgColor,
          textColor: subjectColor.textColor,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        newSubjects.push(newSubject);
      });

      if (newSubjects.length > 0) {
        const updatedSubjects = [...subjects, ...newSubjects];
        setSubjects(updatedSubjects);
        LocalStorageManager.setSubjectsForYear(selectedYear, updatedSubjects);
      }

      setCourseForm({ name: '', level: 'basica', description: '' });
      setShowCourseDialog(false);

      toast({
        title: translate('success') || 'Success',
        description: `Curso creado con ${newSubjects.length} asignaturas y 2 secciones (A y B)`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotCreateCourse') || 'Could not create course',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse || !courseForm.name.trim()) return;

    setIsLoading(true);
    try {
      const updatedCourse: Course = {
        ...editingCourse,
        name: courseForm.name.trim(),
        level: courseForm.level,
        description: courseForm.description.trim(),
        updatedAt: new Date()
      };

      const updatedCourses = courses.map(c => 
        c.id === editingCourse.id ? updatedCourse : c
      );
      
  setCourses(updatedCourses);
  LocalStorageManager.setCoursesForYear(selectedYear, updatedCourses);

      setEditingCourse(null);
      setCourseForm({ name: '', level: 'basica', description: '' });
      setShowCourseDialog(false);

      toast({
        title: translate('success') || 'Success',
        description: translate('courseUpdatedSuccessfully') || 'Course updated successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotUpdateCourse') || 'Could not update course',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    try {
      // Check if course has sections
      const courseSections = sections.filter(s => s.courseId === courseId);
      if (courseSections.length > 0) {
        toast({
          title: translate('error') || 'Error',
          description: translate('cannotDeleteCourseWithSections') || 'Cannot delete a course that has sections',
          variant: 'destructive'
        });
        return;
      }

  const updatedCourses = courses.filter(c => c.id !== courseId);
  setCourses(updatedCourses);
  LocalStorageManager.setCoursesForYear(selectedYear, updatedCourses);

      // Also remove subjects for this course
  const updatedSubjects = subjects.filter(s => s.courseId !== courseId);
  setSubjects(updatedSubjects);
  LocalStorageManager.setSubjectsForYear(selectedYear, updatedSubjects);

      toast({
        title: translate('success') || 'Success',
        description: translate('courseDeletedSuccessfully') || 'Course deleted successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotDeleteCourse') || 'Could not delete course',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        toast({
          title: translate('error') || 'Error',
          description: translate('sectionNotFound') || 'Section not found',
          variant: 'destructive'
        });
        return;
      }

      // Check if section has students
      if (section.studentCount > 0) {
        toast({
          title: translate('error') || 'Error',
          description: translate('cannotDeleteSectionWithStudents') || 'Cannot delete a section that has students',
          variant: 'destructive'
        });
        return;
      }

  const updatedSections = sections.filter(s => s.id !== sectionId);
  setSections(updatedSections);
  LocalStorageManager.setSectionsForYear(selectedYear, updatedSections);

      toast({
        title: translate('success') || 'Success',
        description: translate('sectionDeletedSuccessfully') || 'Section deleted successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotDeleteSection') || 'Could not delete section',
        variant: 'destructive'
      });
    }
  };

  // Section management
  const handleCreateSection = async () => {
    if (!sectionForm.name.trim() || !sectionForm.courseId) {
      toast({
        title: translate('error') || 'Error',
        description: translate('sectionNameAndCourseRequired') || 'Section name and course are required',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const newSection: Section = {
        id: crypto.randomUUID(),
        uniqueCode: EducationCodeGenerator.generateSectionCode(),
        name: sectionForm.name.trim(),
        courseId: sectionForm.courseId,
        studentCount: 0,
        maxStudents: sectionForm.maxStudents,
        subjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

  const updatedSections = [...sections, newSection];
  setSections(updatedSections);
  LocalStorageManager.setSectionsForYear(selectedYear, updatedSections);

  setSectionForm({ name: '', courseId: '', maxStudents: 45 });
      setShowSectionDialog(false);

      toast({
        title: translate('success') || 'Success',
        description: translate('sectionCreatedSuccessfully') || 'Section created successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: translate('error') || 'Error',
        description: translate('couldNotCreateSection') || 'Could not create section',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSectionsForCourse = (courseId: string) => {
    return sections.filter(s => s.courseId === courseId);
  };

  const getSubjectsForCourse = (courseId: string) => {
    return subjects.filter(s => s.courseId === courseId);
  };

  // Nueva función para obtener asignaturas directamente de los libros
  const getSubjectsFromBooks = (courseName: string) => {
    return getSubjectsForCourseWithColors(courseName);
  };

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center whitespace-nowrap">
            <Building className="w-6 h-6 mr-2 text-blue-500" />
            {(translate('userManagementTabCourses') && translate('userManagementTabCourses') !== 'userManagementTabCourses') ? translate('userManagementTabCourses') : 'Cursos y Secciones'}
          </h2>
          <p className="text-muted-foreground whitespace-nowrap">
            {(translate('coursesManageAcademicStructure') && translate('coursesManageAcademicStructure') !== 'coursesManageAcademicStructure') ? translate('coursesManageAcademicStructure') : 'Gestiona la estructura académica de tu institución'}
          </p>
        </div>
        
  {/* Acciones y año en una sola fila */}
  <div className="w-full">
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
      <Button 
            onClick={handleCreateStandardCourses}
            disabled={isLoading}
            variant="outline"
            className={!isLoading ? 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200' : undefined}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            {isLoading ? 
              ((translate('coursesCreating') && translate('coursesCreating') !== 'coursesCreating') ? translate('coursesCreating') : 'Creando...') : 
  ((translate('coursesCreateStandardCourses') && translate('coursesCreateStandardCourses') !== 'coursesCreateStandardCourses') ? translate('coursesCreateStandardCourses') : 'Crea Cursos')
            }
          </Button>

      <Button 
            onClick={handleForceCreateSections}
            disabled={isLoading}
            variant="outline"
            className={!isLoading ? 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200' : undefined}
          >
            <Building className="w-4 h-4 mr-2" />
            {isLoading ? 
              ((translate('coursesCreating') && translate('coursesCreating') !== 'coursesCreating') ? translate('coursesCreating') : 'Creando...') : 
        ((translate('coursesCreateABSections') && translate('coursesCreateABSections') !== 'coursesCreateABSections') ? translate('coursesCreateABSections') : 'Crear Secciones')
            }
          </Button>
          
          <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingCourse(null);
                  setCourseForm({ name: '', level: 'basica', description: '' });
                }}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                {(translate('coursesNewCourse') && translate('coursesNewCourse') !== 'coursesNewCourse') ? translate('coursesNewCourse') : 'Nuevo Curso'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? 
                    ((translate('coursesEditCourse') && translate('coursesEditCourse') !== 'coursesEditCourse') ? translate('coursesEditCourse') : 'Editar Curso') : 
                    ((translate('coursesCreateNewCourse') && translate('coursesCreateNewCourse') !== 'coursesCreateNewCourse') ? translate('coursesCreateNewCourse') : 'Crear Nuevo Curso')
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="courseName">{(translate('coursesCourseName') && translate('coursesCourseName') !== 'coursesCourseName') ? translate('coursesCourseName') : 'Nombre del Curso'} *</Label>
                  <Input
                    id="courseName"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={(translate('coursesCourseNamePlaceholder') && translate('coursesCourseNamePlaceholder') !== 'coursesCourseNamePlaceholder') ? translate('coursesCourseNamePlaceholder') : "Ej: Primer Año Básico"}
                  />
                </div>
                
                <div>
                  <Label htmlFor="courseLevel">{(translate('coursesEducationalLevel') && translate('coursesEducationalLevel') !== 'coursesEducationalLevel') ? translate('coursesEducationalLevel') : 'Nivel Educativo'} *</Label>
                  <Select
                    value={courseForm.level}
                    onValueChange={(value: 'basica' | 'media') => 
                      setCourseForm(prev => ({ ...prev, level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={(translate('coursesSelectLevel') && translate('coursesSelectLevel') !== 'coursesSelectLevel') ? translate('coursesSelectLevel') : "Selecciona el nivel"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basica">{(translate('coursesBasicEducation') && translate('coursesBasicEducation') !== 'coursesBasicEducation') ? translate('coursesBasicEducation') : 'Educación Básica'}</SelectItem>
                      <SelectItem value="media">{(translate('coursesSecondaryEducation') && translate('coursesSecondaryEducation') !== 'coursesSecondaryEducation') ? translate('coursesSecondaryEducation') : 'Educación Media'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="courseDescription">{(translate('coursesDescription') && translate('coursesDescription') !== 'coursesDescription') ? translate('coursesDescription') : 'Descripción'}</Label>
                  <Textarea
                    id="courseDescription"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={(translate('coursesDescriptionPlaceholder') && translate('coursesDescriptionPlaceholder') !== 'coursesDescriptionPlaceholder') ? translate('coursesDescriptionPlaceholder') : "Descripción opcional del curso"}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCourse ? 
                      ((translate('coursesUpdate') && translate('coursesUpdate') !== 'coursesUpdate') ? translate('coursesUpdate') : 'Actualizar') : 
                      ((translate('coursesCreateCourse') && translate('coursesCreateCourse') !== 'coursesCreateCourse') ? translate('coursesCreateCourse') : 'Crear Curso')
                    }
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCourseDialog(false)}
                    disabled={isLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={courses.length === 0}
                className={courses.length === 0 ? undefined : 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200'}
              >
                <Plus className="w-4 h-4 mr-2" />
                {(translate('coursesNewSection') && translate('coursesNewSection') !== 'coursesNewSection') ? translate('coursesNewSection') : 'Nueva Sección'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{(translate('coursesCreateNewSection') && translate('coursesCreateNewSection') !== 'coursesCreateNewSection') ? translate('coursesCreateNewSection') : 'Crear Nueva Sección'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sectionCourse">{(translate('coursesCourse') && translate('coursesCourse') !== 'coursesCourse') ? translate('coursesCourse') : 'Curso'} *</Label>
                  <Select
                    value={sectionForm.courseId}
                    onValueChange={(value) => setSectionForm(prev => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={(translate('coursesSelectCourse') && translate('coursesSelectCourse') !== 'coursesSelectCourse') ? translate('coursesSelectCourse') : "Selecciona un curso"} />
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

                <div>
                  <Label htmlFor="sectionName">{(translate('coursesSectionName') && translate('coursesSectionName') !== 'coursesSectionName') ? translate('coursesSectionName') : 'Nombre de Sección'} *</Label>
                  <Input
                    id="sectionName"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={(translate('coursesSectionNamePlaceholder') && translate('coursesSectionNamePlaceholder') !== 'coursesSectionNamePlaceholder') ? translate('coursesSectionNamePlaceholder') : "Ej: A o B"}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateSection} disabled={isLoading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {(translate('coursesCreateSection') && translate('coursesCreateSection') !== 'coursesCreateSection') ? translate('coursesCreateSection') : 'Crear Sección'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSectionDialog(false)} disabled={isLoading} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Botón para actualizar carga de secciones (recalcular contadores) - ubicado antes del botón de borrar */}
          <Button
            onClick={handleRecalculateCounters}
            disabled={isLoading}
            variant="outline"
            className={!isLoading ? 'border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/40 dark:hover:text-teal-200' : undefined}
            title={(translate('coursesRecalculateCounters') && translate('coursesRecalculateCounters') !== 'coursesRecalculateCounters') ? translate('coursesRecalculateCounters') : 'Actualizar carga de secciones'}
            aria-label={(translate('coursesRecalculateCounters') && translate('coursesRecalculateCounters') !== 'coursesRecalculateCounters') ? translate('coursesRecalculateCounters') : 'Actualizar carga de secciones'}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>

          {/* Danger: Delete all courses and sections for current year */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {}}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {(translate('deleteAll') && translate('deleteAll') !== 'deleteAll') ? translate('deleteAll') : 'Borrar Todo'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{(translate('confirmDeleteTitle') && translate('confirmDeleteTitle') !== 'confirmDeleteTitle') ? translate('confirmDeleteTitle') : 'Confirmar eliminación'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {((translate('deleteCoursesAndSectionsConfirm') && translate('deleteCoursesAndSectionsConfirm') !== 'deleteCoursesAndSectionsConfirm')
                    ? translate('deleteCoursesAndSectionsConfirm')
                    : 'Esto eliminará todos los cursos, secciones, asignaturas, profesores, estudiantes, asignaciones y asistencia del año seleccionado.')} {selectedYear}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      try {
                        // Estructura académica
                        LocalStorageManager.setCoursesForYear(selectedYear, []);
                        LocalStorageManager.setSectionsForYear(selectedYear, []);
                        LocalStorageManager.setSubjectsForYear(selectedYear, []);

                        // Usuarios y sus colecciones anuales
                        try { LocalStorageManager.setTeachersForYear(selectedYear, []); } catch {}
                        try { LocalStorageManager.setStudentsForYear(selectedYear, []); } catch {}

                        // Asignaciones (docentes y estudiantes)
                        try { LocalStorageManager.setTeacherAssignmentsForYear(selectedYear, []); } catch {}
                        try { LocalStorageManager.setStudentAssignmentsForYear(selectedYear, []); } catch {}

                        // Asistencia por año (y resumen)
                        try { LocalStorageManager.clearAttendanceForYear(selectedYear); } catch {}
                        try { localStorage.removeItem(`smart-student-attendance-summary-${selectedYear}`); } catch {}

                        // Actualizar estado local de UI
                        setCourses([]);
                        setSections([]);
                        setSubjects([]);

                        // Limpieza de vínculos huérfanos (no tendrá efecto si todo quedó vacío, pero es seguro)
                        try { EducationAutomation.sanitizeStudentLinks(selectedYear); } catch {}

                        // Notificar a otras vistas (Asistencia, Dashboard) para refrescar
                        try { window.dispatchEvent(new CustomEvent('attendanceChanged', { detail: { action: 'clear', year: selectedYear } })); } catch {}
                        try { window.dispatchEvent(new CustomEvent('updateDashboardCounts', { detail: { source: 'courses-and-sections', action: 'clear', year: selectedYear } })); } catch {}

                        setShowDeleteDialog(false);
                        toast({
                          title: (translate('deleted') && translate('deleted') !== 'deleted') ? translate('deleted') : 'Eliminado',
                          description:
                            ((translate('coursesAndSectionsDeleted') && translate('coursesAndSectionsDeleted') !== 'coursesAndSectionsDeleted')
                              ? translate('coursesAndSectionsDeleted')
                              : 'Cursos, secciones, asignaturas, profesores, estudiantes, asignaciones y asistencia eliminados')
                        });
                      } catch (e) {
                        toast({ title: (translate('error') && translate('error') !== 'error') ? translate('error') : 'Error', description: ((translate('couldNotDelete') && translate('couldNotDelete') !== 'couldNotDelete') ? translate('couldNotDelete') : 'No se pudo eliminar'), variant: 'destructive' });
                      }
                    }}
                  >
                    {(translate('delete') && translate('delete') !== 'delete') ? translate('delete') : 'Borrar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    {(translate('cancel') && translate('cancel') !== 'cancel') ? translate('cancel') : 'Cancelar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Controles de año al final de la fila */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Label className="text-xs opacity-80">{(translate('calendarYear') && translate('calendarYear') !== 'calendarYear') ? translate('calendarYear') : 'Año'}</Label>
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
            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/40"
              onClick={() => setShowYearDialog(true)}
            >
              {(translate('newYear') && translate('newYear') !== 'newYear') ? translate('newYear') : 'Nuevo Año'}
            </Button>
            <NewYearDialog
              open={showYearDialog}
              onOpenChange={setShowYearDialog}
              selectedYear={selectedYear}
              t={(k, fb) => {
                const v = translate(k);
                return v === k ? (fb ?? k) : v;
              }}
              onCreated={(target) => {
                try {
                  const years = LocalStorageManager.listYears();
                  setAvailableYears(years);
                  setSelectedYear(target);
                  toast({ title: (translate('yearCreated') && translate('yearCreated') !== 'yearCreated') ? translate('yearCreated') : 'Año creado', description: String(target) });
                } catch (e) {
                  toast({ title: (translate('error') && translate('error') !== 'error') ? translate('error') : 'Error', description: (translate('couldNotCreateYear') && translate('couldNotCreateYear') !== 'couldNotCreateYear') ? translate('couldNotCreateYear') : 'No se pudo crear el año', variant: 'destructive' });
                }
              }}
            />
          </div>
    </div>
  </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{translate('coursesNoCoursesCreated') || 'No hay cursos creados'}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {translate('coursesStartCreatingFirstCourse') || 'Comienza creando tu primer curso para organizar la estructura académica'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => {
            const courseSections = getSectionsForCourse(course.id);
            const bookSubjects = getSubjectsFromBooks(course.name);

            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center text-lg">
                        <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
                        {course.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={course.level === 'basica' ? 'default' : 'secondary'}
                          className={course.level === 'media' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                        >
                          {course.level === 'basica' ? 'Básica' : 'Media'}
                        </Badge>
                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                          {course.uniqueCode}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setEditingCourse(course);
                          setCourseForm({
                            name: course.name,
                            level: course.level,
                            description: course.description || ''
                          });
                          setShowCourseDialog(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {course.description}
                    </p>
                  )}
                  
                  {/* Removed: Curso de {course.name} - Educación {course.level} line */}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {translate('coursesSections') || 'Secciones'} ({courseSections.length})
                      </span>
                    </div>
                    
                    {courseSections.length > 0 ? (
                      <div className="space-y-2">
                        {courseSections.map(section => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <span className="text-sm">{section.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                {section.studentCount}/{section.maxStudents}
                              </Badge>
                              {section.studentCount === 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  onClick={() => handleDeleteSection(section.id)}
                                  title="Eliminar sección"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {translate('coursesNoSectionsCreated') || 'No hay secciones creadas'}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {translate('coursesSubjects') || 'Asignaturas'} ({bookSubjects.length})
                      </span>
                    </div>
                    
                    {bookSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {bookSubjects.map((subject, index) => (
                          <Badge
                            key={`${course.id}-${subject.name}-${index}`}
                            className="text-xs font-bold border-0 cursor-help px-2 py-1 ring-1 ring-black/10 dark:ring-white/20"
                            style={{
                              backgroundColor: subject.bgColor,
                              color: subject.textColor
                            }}
                            title={subject.name}
                          >
                            {subject.abbreviation}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No hay asignaturas disponibles para este curso
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
