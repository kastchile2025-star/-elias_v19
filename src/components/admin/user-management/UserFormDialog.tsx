"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Key, Eye, EyeOff, GraduationCap, Shield, Crown, Users2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { SubjectColor, getAllAvailableSubjects } from '@/lib/subjects-colors';

type Role = 'student' | 'teacher' | 'admin' | 'guardian';

export type SharedUserFormData = {
  name: string;
  rut: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: Role;
  autoGenerate?: boolean;
  courseId?: string;
  sectionId?: string; // unified key
  section?: string; // support existing config variant
  selectedSubjects?: string[];
  // Guardian-specific fields
  phone?: string;
  studentIds?: string[];
  relationship?: 'mother' | 'father' | 'tutor' | 'other';
};

export function UserFormDialog({
  open,
  onOpenChange,
  form,
  setForm,
  validationErrors,
  onSubmit,
  isEditing = false,
  availableCourses = [],
  availableSections = [],
  availableSubjects = getAllAvailableSubjects(),
  availableStudents = [],
  showAutoGenerate = true,
  autoGenerateChecked = false,
  onToggleAutoGenerate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: SharedUserFormData;
  setForm: (updater: (prev: SharedUserFormData) => SharedUserFormData) => void;
  validationErrors?: Record<string, string>;
  onSubmit: () => void;
  isEditing?: boolean;
  availableCourses?: any[];
  availableSections?: any[];
  availableSubjects?: SubjectColor[];
  availableStudents?: any[];
  showAutoGenerate?: boolean;
  autoGenerateChecked?: boolean;
  onToggleAutoGenerate?: (checked: boolean) => void;
}) {
  const { translate } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [filterCourseId, setFilterCourseId] = useState<string>('');
  const [filterSectionId, setFilterSectionId] = useState<string>('');

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Crown className="w-4 h-4 mr-1"/>;
    if (role === 'teacher') return <Shield className="w-4 h-4 mr-1"/>;
    if (role === 'guardian') return <Users2 className="w-4 h-4 mr-1"/>;
    return <GraduationCap className="w-4 h-4 mr-1"/>;
  };

  // Filter students based on search term, course and section
  const filteredStudents = availableStudents.filter((student: any) => {
    // Filter by course if selected
    if (filterCourseId) {
      if (filterCourseId === 'unassigned') {
        // Show only students without course assigned
        if (student.courseId) return false;
      } else {
        // Show only students with the selected course
        if (student.courseId !== filterCourseId) return false;
      }
    }
    // Filter by section if selected
    if (filterSectionId && student.sectionId !== filterSectionId) return false;
    // Filter by search term
    if (!studentSearchTerm) return true;
    const searchLower = studentSearchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.username?.toLowerCase().includes(searchLower) ||
      student.rut?.toLowerCase().includes(searchLower)
    );
  });

  // Get sections filtered by selected course
  const sectionsForFilter = filterCourseId && filterCourseId !== 'unassigned'
    ? availableSections.filter((s: any) => s.courseId === filterCourseId)
    : availableSections;

  // Get student info by ID
  const getStudentInfo = (studentId: string) => {
    const student = availableStudents.find((s: any) => s.id === studentId);
    if (!student) return null;
    const course = availableCourses.find((c: any) => c.id === student.courseId);
    const section = availableSections.find((s: any) => s.id === student.sectionId);
    return {
      ...student,
      courseName: course?.name || '',
      sectionName: section?.name || ''
    };
  };

  // Toggle student selection for guardian
  const toggleStudentSelection = (studentId: string) => {
    setForm(prev => {
      const currentIds = prev.studentIds || [];
      if (currentIds.includes(studentId)) {
        return { ...prev, studentIds: currentIds.filter(id => id !== studentId) };
      } else {
        return { ...prev, studentIds: [...currentIds, studentId] };
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {getRoleIcon(form.role)}
            {isEditing ? (translate('userManagementEditUser') || 'Editar Usuario') : (translate('userManagementCreateNewUser') || 'Crear Nuevo Usuario')}
          </DialogTitle>
        </DialogHeader>

        {/* User Type Selection (only when creating) */}
        {!isEditing && (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-muted rounded-lg">
            {(['student','teacher','admin','guardian'] as Role[]).map(role => (
              <div key={role} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`role-${role}`}
                  name="userType"
                  checked={form.role === role}
                  onChange={() => setForm(prev => ({ ...prev, role, courseId: '', sectionId: '', section: '', studentIds: [] }))}
                  className="w-4 h-4"
                />
                <Label htmlFor={`role-${role}`} className="flex items-center cursor-pointer">
                  {getRoleIcon(role)}
                  {role === 'student' ? (translate('userManagementStudent') || 'Estudiante') : 
                   role === 'teacher' ? (translate('userManagementTeacher') || 'Profesor') : 
                   role === 'guardian' ? (translate('userManagementGuardian') || 'Apoderado') :
                   (translate('userManagementAdministrator') || 'Administrador')}
                </Label>
              </div>
            ))}
          </div>
        )}

        {/* Auto-generate toggle */}
        {!isEditing && showAutoGenerate && onToggleAutoGenerate && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="autoGenerate" className="text-sm font-medium">
                {translate('userManagementAutoGenerateCredentials') || 'Generar credenciales automáticamente'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {translate('userManagementAutoGenerateCredentialsDesc') || 'Se generarán usuario y contraseña basados en el nombre'}
              </p>
            </div>
            <input
              id="autoGenerate"
              type="checkbox"
              checked={autoGenerateChecked}
              onChange={(e) => onToggleAutoGenerate(e.target.checked)}
            />
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">{translate('userManagementFullName') || 'Nombre Completo'} *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder={translate('userManagementFullNamePlaceholder') || 'Nombre completo del usuario'}
              className={validationErrors?.name ? 'border-red-500' : ''}
            />
            {validationErrors?.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
          </div>
          <div>
            <Label htmlFor="rut">{translate('userManagementRut') || 'RUT'} *</Label>
            <Input
              id="rut"
              value={form.rut}
              onChange={(e) => setForm(prev => ({ ...prev, rut: e.target.value }))}
              placeholder={translate('userManagementRutPlaceholder') || 'Ej: 12345678-9'}
              className={validationErrors?.rut ? 'border-red-500' : ''}
            />
            {validationErrors?.rut && <p className="text-red-500 text-xs mt-1">{validationErrors.rut}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="email">{translate('userManagementEmail') || 'Email'}</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder={translate('userManagementEmailPlaceholder') || 'correo@ejemplo.com (opcional)'}
                className={`pl-10 ${validationErrors?.email ? 'border-red-500' : ''}`}
              />
            </div>
            {validationErrors?.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
          </div>
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="username">{translate('userManagementUsername') || 'Nombre de Usuario'} *</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
              placeholder={translate('userManagementUsernamePlaceholder') || 'Ingresa el nombre de usuario'}
              disabled={!!(!isEditing && form.autoGenerate)}
              className={validationErrors?.username ? 'border-red-500' : ''}
            />
            {validationErrors?.username && <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>}
          </div>

          {!isEditing && (
            <>
              <div>
                <Label htmlFor="password">{translate('userManagementPassword') || 'Contraseña'} *</Label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={translate('userManagementPasswordPlaceholder') || 'Contraseña'}
                    disabled={!!form.autoGenerate}
                    className={`pl-10 pr-10 ${validationErrors?.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {!form.autoGenerate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {translate('userManagementPasswordMinChars') || 'Mínimo 4 caracteres'}
                  </p>
                )}
                {validationErrors?.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">{translate('userManagementConfirmPassword') || 'Confirmar Contraseña'} *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder={translate('userManagementConfirmPasswordPlaceholder') || 'Confirmar contraseña'}
                  disabled={!!form.autoGenerate}
                  className={validationErrors?.confirmPassword ? 'border-red-500' : ''}
                />
                {validationErrors?.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
              </div>
            </>
          )}
        </div>

        {/* Student-specific */}
        {form.role === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div>
              <Label htmlFor="courseId">{translate('userManagementCourse') || 'Curso'} *</Label>
              <Select
                value={form.courseId || ''}
                onValueChange={(value) => setForm(prev => ({ ...prev, courseId: value, sectionId: '' }))}
              >
                <SelectTrigger className={validationErrors?.courseId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={translate('userManagementSelectCourse') || 'Selecciona un curso'} />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors?.courseId && <p className="text-red-500 text-xs mt-1">{validationErrors.courseId}</p>}
            </div>
            <div>
              <Label htmlFor="sectionId">{translate('userManagementSection') || 'Sección'} *</Label>
              <Select
                value={(form.sectionId || form.section) || ''}
                onValueChange={(value) => setForm(prev => ({ ...prev, sectionId: value, section: value }))}
                disabled={!form.courseId}
              >
                <SelectTrigger className={validationErrors?.sectionId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={translate('userManagementSelectSection') || 'Selecciona una sección'} />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.filter((s: any) => s.courseId === form.courseId).map((section: any) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name} ({section.studentCount}/{section.maxStudents || translate('userManagementNoLimit') || 'Sin límite'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors?.sectionId && <p className="text-red-500 text-xs mt-1">{validationErrors.sectionId}</p>}
            </div>
          </div>
        )}

        {/* Teacher-specific */}
        {form.role === 'teacher' && (
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div>
              <Label>{translate('userManagementSubjectsTeacherWillTeach') || 'Asignaturas que impartirá *'}</Label>
              <p className="text-xs text-muted-foreground mb-3">
                {translate('userManagementSelectSubjectsTeacher') || 'Selecciona las asignaturas que el profesor podrá impartir (puede enseñar en cualquier curso/sección)'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableSubjects.map((subject: SubjectColor) => {
                  const isSelected = form.selectedSubjects?.includes(subject.name);
                  return (
                    <Badge
                      key={subject.name}
                      className={`text-xs font-bold border-0 cursor-pointer px-2 py-1 transition-all duration-200 ${
                        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                      }`}
                      style={{ backgroundColor: subject.bgColor, color: subject.textColor, opacity: isSelected ? 1 : 0.7 }}
                      title={subject.name}
                      onClick={() => setForm(prev => ({
                        ...prev,
                        selectedSubjects: isSelected
                          ? (prev.selectedSubjects || []).filter(s => s !== subject.name)
                          : [...(prev.selectedSubjects || []), subject.name]
                      }))}
                    >
                      {subject.abbreviation}
                    </Badge>
                  );
                })}
              </div>
              {(!form.selectedSubjects || form.selectedSubjects.length === 0) && (
                <p className="text-red-500 text-xs mt-2">{translate('userManagementSelectAtLeastOneSubject') || 'Selecciona al menos una asignatura'}</p>
              )}
            </div>
          </div>
        )}

        {/* Guardian-specific */}
        {form.role === 'guardian' && (
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            {/* Phone number */}
            <div>
              <Label htmlFor="phone">{translate('userManagementPhone') || 'Teléfono'}</Label>
              <Input
                id="phone"
                value={form.phone || ''}
                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder={translate('userManagementPhonePlaceholder') || '+56 9 1234 5678'}
              />
            </div>

            {/* Relationship */}
            <div>
              <Label htmlFor="relationship">{translate('userManagementRelationship') || 'Parentesco'} *</Label>
              <Select
                value={form.relationship || 'tutor'}
                onValueChange={(value) => setForm(prev => ({ ...prev, relationship: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translate('userManagementSelectRelationship') || 'Selecciona parentesco'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">{translate('relationshipMother') || 'Madre'}</SelectItem>
                  <SelectItem value="father">{translate('relationshipFather') || 'Padre'}</SelectItem>
                  <SelectItem value="tutor">{translate('relationshipTutor') || 'Tutor'}</SelectItem>
                  <SelectItem value="other">{translate('relationshipOther') || 'Otro'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student selection */}
            <div>
              <Label>{translate('userManagementStudentsInCharge') || 'Estudiantes a cargo'} *</Label>
              <p className="text-xs text-muted-foreground mb-3">
                {translate('userManagementSelectStudentsForGuardian') || 'Selecciona los estudiantes que están a cargo de este apoderado'}
              </p>
              
              {/* Filters by course and section */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs">{translate('userManagementFilterByCourse') || 'Filtrar por curso'}</Label>
                  <Select
                    value={filterCourseId}
                    onValueChange={(value) => {
                      setFilterCourseId(value === 'all' ? '' : value);
                      setFilterSectionId(''); // Reset section when course changes
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={translate('userManagementAllCourses') || 'Todos los cursos'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translate('userManagementAllCourses') || 'Todos los cursos'}</SelectItem>
                      <SelectItem value="unassigned">{translate('userManagementNoAssignedCourse') || 'Sin curso asignado'}</SelectItem>
                      {availableCourses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{translate('userManagementFilterBySection') || 'Filtrar por sección'}</Label>
                  <Select
                    value={filterSectionId}
                    onValueChange={(value) => setFilterSectionId(value === 'all' ? '' : value)}
                    disabled={!filterCourseId || filterCourseId === 'unassigned'}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={translate('userManagementAllSections') || 'Todas las secciones'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translate('userManagementAllSections') || 'Todas las secciones'}</SelectItem>
                      {sectionsForFilter.map((section: any) => (
                        <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search input */}
              <Input
                placeholder={translate('userManagementSearchStudents') || 'Buscar estudiantes por nombre, usuario o RUT...'}
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="mb-3"
              />

              {/* Selected students */}
              {(form.studentIds && form.studentIds.length > 0) && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-muted-foreground">{translate('userManagementSelectedStudents') || 'Seleccionados'}:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.studentIds.map(studentId => {
                      const studentInfo = getStudentInfo(studentId);
                      if (!studentInfo) return null;
                      return (
                        <Badge 
                          key={studentId}
                          variant="secondary"
                          className="cursor-pointer bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          onClick={() => toggleStudentSelection(studentId)}
                        >
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {studentInfo.name} ({studentInfo.courseName} - {studentInfo.sectionName})
                          <span className="ml-1 text-red-500">×</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available students list */}
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {availableStudents.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {translate('userManagementNoStudentsInSystem') || 'No hay estudiantes registrados en el sistema'}
                  </p>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">
                      {translate('userManagementNoStudentsFound') || 'No se encontraron estudiantes'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {translate('userManagementTryDifferentFilter') || 'Intenta con otro filtro o selecciona "Todos los cursos"'}
                    </p>
                    <p className="text-xs text-purple-500 mt-2">
                      {translate('userManagementTotalStudentsAvailable') || 'Total de estudiantes'}: {availableStudents.length}
                    </p>
                  </div>
                ) : (
                  filteredStudents.slice(0, 50).map((student: any) => {
                    const isSelected = form.studentIds?.includes(student.id);
                    const course = availableCourses.find((c: any) => c.id === student.courseId);
                    const section = availableSections.find((s: any) => s.id === student.sectionId);
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-purple-100 dark:bg-purple-900' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => toggleStudentSelection(student.id)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4"
                          />
                          <div>
                            <span className="text-sm font-medium">{student.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">@{student.username}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {course?.name || '?'} - {section?.name || '?'}
                        </Badge>
                      </div>
                    );
                  })
                )}
                {filteredStudents.length > 50 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    {translate('userManagementAndMoreStudents') || 'Y más...'} ({filteredStudents.length - 50} {translate('userManagementMore') || 'más'})
                  </p>
                )}
              </div>
              
              {validationErrors?.studentIds && (
                <p className="text-red-500 text-xs mt-2">{validationErrors.studentIds}</p>
              )}
              {(!form.studentIds || form.studentIds.length === 0) && (
                <p className="text-red-500 text-xs mt-2">{translate('userManagementSelectAtLeastOneStudent') || 'Selecciona al menos un estudiante'}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={onSubmit} className="flex-1">
            {isEditing ? (translate('userManagementUpdateUser') || 'Actualizar Usuario') : (translate('userManagementCreateUser') || 'Crear Usuario')}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {translate('userManagementCancel') || 'Cancelar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
