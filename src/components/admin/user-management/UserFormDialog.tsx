"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Key, Eye, EyeOff, GraduationCap, Shield, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { SubjectColor, getAllAvailableSubjects } from '@/lib/subjects-colors';

type Role = 'student' | 'teacher' | 'admin';

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
  showAutoGenerate?: boolean;
  autoGenerateChecked?: boolean;
  onToggleAutoGenerate?: (checked: boolean) => void;
}) {
  const { translate } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const getRoleIcon = (role: string) => role === 'admin' ? <Crown className="w-4 h-4 mr-1"/> : role === 'teacher' ? <Shield className="w-4 h-4 mr-1"/> : <GraduationCap className="w-4 h-4 mr-1"/>;

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
          <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
            {(['student','teacher','admin'] as Role[]).map(role => (
              <div key={role} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`role-${role}`}
                  name="userType"
                  checked={form.role === role}
                  onChange={() => setForm(prev => ({ ...prev, role, courseId: '', sectionId: '', section: '' }))}
                  className="w-4 h-4"
                />
                <Label htmlFor={`role-${role}`} className="flex items-center cursor-pointer">
                  {getRoleIcon(role)}
                  {role === 'student' ? (translate('userManagementStudent') || 'Estudiante') : role === 'teacher' ? (translate('userManagementTeacher') || 'Profesor') : (translate('userManagementAdministrator') || 'Administrador')}
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
