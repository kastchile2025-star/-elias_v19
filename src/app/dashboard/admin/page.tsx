"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Users, BookOpen, Shield, RefreshCw, CheckCircle, AlertCircle, GraduationCap, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UniqueCodeGenerator } from '@/lib/unique-codes';
import { useNotificationSync } from '@/hooks/useNotificationSync';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { es as esLocale, enGB } from 'date-fns/locale';

// Date input con calendario localizado (semana L-D) y formateo dd-MM-yyyy
function DateInput({ value, onChange, locale }: { value?: string; onChange: (v: string) => void; locale: Locale }) {
  // Parseo local seguro para fechas en formato YYYY-MM-DD
  const parseYmdLocal = (ymd?: string) => {
    if (!ymd) return undefined;
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const parsed = parseYmdLocal(value);
  const selected = parsed && !isNaN(parsed.getTime()) ? parsed : undefined;
  // Mostrar siempre dd-mm-yyyy
  const label = selected ? format(selected, 'dd-MM-yyyy', { locale }) : 'dd-mm-yyyy';

  const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          locale={locale}
          onSelect={(d) => d && onChange(toIso(d))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { translate, language } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const dateLocale: Locale = language === 'es' ? esLocale : enGB;
  const isTeacher = user?.role === 'teacher';
  
  // Sistema de sincronización de notificaciones
  const {
    isEnabled: syncEnabled,
    lastSyncTime,
    stats: syncStats,
    healthScore,
    isLoading: syncLoading,
    error: syncError,
    enable: enableSync,
    disable: disableSync,
    toggle: toggleSync,
    forceSync,
    generateReport,
    checkConsistency,
    clearStats
  } = useNotificationSync();
  
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [migrationDetails, setMigrationDetails] = useState<string[]>([]);

  // Redirect if neither admin nor teacher
  useEffect(() => {
    if (user && !(isAdmin() || isTeacher)) {
      router.push('/dashboard');
      toast({
        title: translate('userManagementAccessDenied') || 'Acceso denegado',
        description: translate('userManagementAccessDeniedDesc') || 'No tienes permisos para acceder a esta página',
        variant: 'destructive'
      });
    }
  }, [user, isAdmin, isTeacher, router, toast, translate]);

  // Don't render if neither admin nor teacher
  if (user && !(isAdmin() || isTeacher)) {
    return null;
  }

  const handleMigrateUniqueCodes = async () => {
    setIsMigrating(true);
    setMigrationStatus('running');
    setMigrationDetails([]);

    try {
      // Get current statistics
      const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
      const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
      
      const usersWithoutCodes = users.filter((u: any) => !u.uniqueCode);
      const tasksWithoutCodes = tasks.filter((t: any) => !t.uniqueCode);

      setMigrationDetails(prev => [
        ...prev,
        `🔍 Usuarios sin códigos únicos: ${usersWithoutCodes.length}`,
        `🔍 Tareas sin códigos únicos: ${tasksWithoutCodes.length}`
      ]);

      // Run migration
      UniqueCodeGenerator.migrateExistingData();

      // Get updated statistics
      const updatedUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
      const updatedTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');

      const usersWithCodes = updatedUsers.filter((u: any) => u.uniqueCode);
      const tasksWithCodes = updatedTasks.filter((t: any) => t.uniqueCode);

      setMigrationDetails(prev => [
        ...prev,
        `✅ Usuarios con códigos únicos: ${usersWithCodes.length}`,
        `✅ Tareas con códigos únicos: ${tasksWithCodes.length}`,
        `🎉 Migración completada exitosamente`
      ]);

      setMigrationStatus('completed');
      
      toast({
        title: "Migración Completada",
        description: "Todos los datos han sido migrados con códigos únicos.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error durante la migración:', error);
      setMigrationStatus('error');
      setMigrationDetails(prev => [
        ...prev,
        `❌ Error durante la migración: ${error}`
      ]);
      
      toast({
        title: "Error en la Migración",
        description: "Hubo un problema durante la migración de códigos únicos.",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const getSystemStatistics = () => {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    return {
      totalUsers: users.length,
      usersWithCodes: users.filter((u: any) => u.uniqueCode).length,
      totalTasks: tasks.length,
      tasksWithCodes: tasks.filter((t: any) => t.uniqueCode).length,
      students: users.filter((u: any) => u.role === 'student').length,
      teachers: users.filter((u: any) => u.role === 'teacher').length,
      evaluations: tasks.filter((t: any) => t.taskType === 'evaluacion').length,
      regularTasks: tasks.filter((t: any) => t.taskType === 'tarea').length
    };
  };

  // Función para forzar sincronización de notificaciones
  const handleForceSync = async () => {
    try {
      await forceSync();
      toast({
        title: "Sincronización completada",
        description: "Las notificaciones han sido sincronizadas exitosamente.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error en sincronización",
        description: "Hubo un problema al sincronizar las notificaciones.",
        variant: "destructive"
      });
    }
  };

  // Función para generar reporte de sincronización
  const handleGenerateReport = () => {
    try {
      const report = generateReport();
      console.log('=== REPORTE DE SINCRONIZACIÓN ===');
      console.log('Timestamp:', report.timestamp);
      console.log('Habilitado:', report.isEnabled);
      console.log('Última sincronización:', report.lastSyncTime);
      console.log('Estadísticas:', report.stats);
      console.log('Datos:', report.data);
      console.log('Problemas encontrados:', report.issues);
      console.log('Puntuación de salud:', report.healthScore);
      console.log('===============================');
      
      toast({
        title: "Reporte generado",
        description: "Revisar la consola para ver los detalles del reporte.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte de sincronización.",
        variant: "destructive"
      });
    }
  };

  // Función para verificar consistencia
  const handleCheckConsistency = () => {
    try {
      const consistency = checkConsistency();
      console.log('=== VERIFICACIÓN DE CONSISTENCIA ===');
      console.log('Resultado:', consistency);
      console.log('===================================');
      
      toast({
        title: "Verificación completada",
        description: "Revisar la consola para ver los resultados.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error en verificación",
        description: "No se pudo verificar la consistencia.",
        variant: "destructive"
      });
    }
  };

  // Función para reparación inmediata de notificaciones fantasma
  const handleEmergencyRepair = () => {
    try {
      // Cargar datos actuales
      const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
      const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
      const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
      
      let ghostsRemoved = 0;
      let orphansRemoved = 0;
      let validNotifications = [];
      let validComments = [];
      
      // Eliminar notificaciones fantasma
      for (const notification of notifications) {
        const taskExists = tasks.some((task: any) => task.id === notification.taskId);
        if (!taskExists) {
          ghostsRemoved++;
        } else {
          validNotifications.push(notification);
        }
      }
      
      // Eliminar comentarios huérfanos
      for (const comment of comments) {
        const taskExists = tasks.some((task: any) => task.id === comment.taskId);
        if (!taskExists) {
          orphansRemoved++;
        } else {
          validComments.push(comment);
        }
      }
      
      // Guardar datos limpios
      localStorage.setItem('smart-student-task-notifications', JSON.stringify(validNotifications));
      localStorage.setItem('smart-student-task-comments', JSON.stringify(validComments));
      
      // Disparar eventos para actualizar UI
      window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
      window.dispatchEvent(new CustomEvent('commentsUpdated'));
      
      toast({
        title: "🔧 Reparación Completada",
        description: `Eliminadas ${ghostsRemoved} notificaciones fantasma y ${orphansRemoved} comentarios huérfanos.`,
        variant: "default"
      });
      
      // Recargar página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Error en reparación",
        description: "Hubo un problema durante la reparación de emergencia.",
        variant: "destructive"
      });
    }
  };

  const diagnoseCourseAccess = () => {
    console.log('=== DIAGNÓSTICO DE ACCESO A CURSOS ===');
    console.log('Usuario actual:', user);
    
    if (user) {
      console.log('Cursos activos del usuario:', user.activeCourses);
      console.log('Tipo de activeCourses:', typeof user.activeCourses, Array.isArray(user.activeCourses));
    }
    
    // Verificar datos en localStorage
    try {
      const storedUsers = localStorage.getItem('smart-student-users');
      const storedCourses = localStorage.getItem('smart-student-courses');
      
      console.log('Usuarios en localStorage:', storedUsers ? JSON.parse(storedUsers) : 'No hay datos');
      console.log('Cursos en localStorage:', storedCourses ? JSON.parse(storedCourses) : 'No hay datos');
      
      if (storedUsers && user) {
        const users = JSON.parse(storedUsers);
        const currentUserInStorage = users.find((u: any) => u.username === user.username);
        console.log('Usuario actual en localStorage:', currentUserInStorage);
      }
    } catch (error) {
      console.error('Error al leer localStorage:', error);
    }
  };

  const stats = getSystemStatistics();
  // Configuración de semestres
  type Semesters = { first: { start: string; end: string }; second: { start: string; end: string } };
  const SEM_KEY = 'smart-student-semesters';
  const currentYear = new Date().getFullYear();
  const defaultSemesters: Semesters = {
    first: { start: `${currentYear}-03-01`, end: `${currentYear}-06-30` },
    second: { start: `${currentYear}-07-01`, end: `${currentYear}-12-15` }
  };
  const [semesters, setSemesters] = useState<Semesters>(() => {
    try { return JSON.parse(localStorage.getItem(SEM_KEY) || '') as Semesters; } catch { return defaultSemesters; }
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEM_KEY);
      if (raw) setSemesters(JSON.parse(raw));
    } catch {}
  }, []);
  const saveSemesters = () => {
    try {
      localStorage.setItem(SEM_KEY, JSON.stringify(semesters));
      try { window.dispatchEvent(new StorageEvent('storage', { key: SEM_KEY, newValue: JSON.stringify(semesters) })); } catch {}
      toast({ title: 'Calendario guardado', description: 'Semestres actualizados correctamente.' });
    } catch (e) {
      toast({ title: 'Error al guardar', description: 'No se pudo guardar el calendario.', variant: 'destructive' });
    }
  };
  const resetSemesters = () => {
    setSemesters(defaultSemesters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-500" />
            {translate('adminPanelTitle') || 'Panel de Administración'}
          </h1>
          <p className="text-muted-foreground">
            {translate('adminPanelSubtitle') || 'Gestión avanzada del sistema Smart Student'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Quick access to new User Management */}
          <Button 
            onClick={() => router.push('/dashboard/admin/user-management')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            {translate('userManagementMainTitle') || 'Gestión de Usuarios'}
          </Button>
          
          <Button 
            onClick={handleForceSync}
            disabled={syncLoading}
            variant="outline"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {syncLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sincronizar Notificaciones
          </Button>
          <Button 
            onClick={toggleSync}
            variant="outline"
            className={`${syncEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            {syncEnabled ? 'Desactivar' : 'Activar'} Auto-Sync
          </Button>
          <Button 
            onClick={handleGenerateReport}
            variant="outline"
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            📊 Generar Reporte
          </Button>
          <Button 
            onClick={handleEmergencyRepair}
            variant="outline"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            🔧 Reparación Inmediata
          </Button>
          <Button 
            onClick={() => window.open('/reset-all-tasks.html', '_blank')}
            variant="outline"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            🗑️ Reset Completo
          </Button>
          <Button 
            onClick={diagnoseCourseAccess}
            variant="outline"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            🔍 Diagnosticar Cursos
          </Button>
        </div>
      </div>

      {/* Sistema de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta específica para profesores */}
        {user?.role === 'teacher' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Mis Asignaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
                const myAssignments = teacherAssignments.filter((a: any) => 
                  a.teacherId === user.id || a.teacherUsername === user.username
                );
                const uniqueSubjects = new Set(myAssignments.flatMap((a: any) => 
                  Array.isArray(a.subjects) ? a.subjects : [a.subjectName]
                ).filter(Boolean));
                const uniqueSections = new Set(myAssignments.map((a: any) => a.sectionId).filter(Boolean));
                
                return (
                  <>
                    <div className="text-2xl font-bold">{uniqueSubjects.size}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Asignaturas asignadas
                    </div>
                    <div className="flex items-center mt-2">
                      <Badge variant="default">
                        {uniqueSections.size} secciones
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Array.from(uniqueSubjects).slice(0, 2).join(', ')}
                      {uniqueSubjects.size > 2 && '...'}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.teachers} profesores, {stats.students} estudiantes
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={stats.usersWithCodes === stats.totalUsers ? "default" : "secondary"}>
                {stats.usersWithCodes}/{stats.totalUsers} con códigos únicos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              {user?.role === 'teacher' ? 'Mis Tareas' : 'Tareas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.role === 'teacher' ? (
              (() => {
                const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
                const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
                const myTasks = tasks.filter((t: any) => 
                  t.assignedById === user.id || t.assignedByName === user.username
                );
                const myEvaluations = evaluations.filter((e: any) => 
                  e.assignedById === user.id || e.teacherId === user.id || e.teacherName === user.username
                );
                const totalMyItems = myTasks.length + myEvaluations.length;
                const pendingTasks = myTasks.filter((t: any) => t.status === 'pending').length;
                const pendingEvaluations = myEvaluations.filter((e: any) => !e.closed).length;
                
                return (
                  <>
                    <div className="text-2xl font-bold">{totalMyItems}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {myTasks.length} tareas, {myEvaluations.length} evaluaciones
                    </div>
                    <div className="flex items-center mt-2">
                      <Badge variant={(pendingTasks + pendingEvaluations) > 0 ? "default" : "secondary"}>
                        {pendingTasks + pendingEvaluations} pendientes
                      </Badge>
                    </div>
                  </>
                );
              })()
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.regularTasks} tareas, {stats.evaluations} evaluaciones
                </div>
                <div className="flex items-center mt-2">
                  <Badge variant={stats.tasksWithCodes === stats.totalTasks ? "default" : "secondary"}>
                    {stats.tasksWithCodes}/{stats.totalTasks} con códigos únicos
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              {user?.role === 'teacher' ? 'Mis Estudiantes' : 'Sincronización'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.role === 'teacher' ? (
              (() => {
                const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
                const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
                const mySections = teacherAssignments
                  .filter((a: any) => a.teacherId === user.id || a.teacherUsername === user.username)
                  .map((a: any) => a.sectionId);
                const myStudents = studentAssignments.filter((a: any) => 
                  mySections.includes(a.sectionId)
                );
                const uniqueStudents = new Set(myStudents.map((a: any) => a.studentId || a.studentUsername));
                
                return (
                  <>
                    <div className="text-2xl font-bold">{uniqueStudents.size}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Estudiantes asignados
                    </div>
                    <div className="flex items-center mt-2">
                      <Badge variant="default">
                        {mySections.length} secciones
                      </Badge>
                    </div>
                  </>
                );
              })()
            ) : (
              <>
                <div className="text-2xl font-bold text-center">
                  {Math.round(healthScore)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  Salud del sistema
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Badge variant={syncEnabled ? "default" : "secondary"}>
                    {syncEnabled ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  {syncStats.ghostsRemoved} fantasmas eliminados
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {syncError ? (
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {syncError ? "Error detectado" : "Sistema OK"}
            </div>
            <div className="flex items-center justify-center mt-2">
              <Badge variant={syncError ? "destructive" : "default"}>
                {syncStats.totalSyncs} sincronizaciones
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {lastSyncTime ? `Última: ${new Date(lastSyncTime).toLocaleTimeString()}` : "Sin sincronizar"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {migrationStatus === 'idle' && <span className="text-gray-500">Listo</span>}
              {migrationStatus === 'running' && <span className="text-blue-500">Ejecutando</span>}
              {migrationStatus === 'completed' && <span className="text-green-500">Completado</span>}
              {migrationStatus === 'error' && <span className="text-red-500">Error</span>}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Sistema de migración
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Gestión de Usuarios */}
      {/* Calendario Académico: Semestres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            📅 Calendario Académico (Semestres)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="font-medium">1er Semestre</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                  {/* Usar el mismo DateInput que en Calendario para mostrar dd-MM-yyyy */}
                  <DateInput
                    value={semesters.first.start}
                    onChange={(v) => setSemesters(s => ({ ...s, first: { ...s.first, start: v } }))}
                    locale={dateLocale}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Término</label>
                  <DateInput
                    value={semesters.first.end}
                    onChange={(v) => setSemesters(s => ({ ...s, first: { ...s.first, end: v } }))}
                    locale={dateLocale}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">2do Semestre</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                  <DateInput
                    value={semesters.second.start}
                    onChange={(v) => setSemesters(s => ({ ...s, second: { ...s.second, start: v } }))}
                    locale={dateLocale}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Término</label>
                  <DateInput
                    value={semesters.second.end}
                    onChange={(v) => setSemesters(s => ({ ...s, second: { ...s.second, end: v } }))}
                    locale={dateLocale}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={saveSemesters}>Guardar</Button>
            <Button variant="outline" onClick={resetSemesters}>Restablecer por defecto</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {translate('userManagementSystem') || 'Sistema de Gestión de Usuarios'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard/admin/user-management')}
            >
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-8 h-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">{translate('adminCoursesAndSectionsTitle') || 'Cursos y Secciones'}</h4>
                  <p className="text-sm text-muted-foreground">{translate('adminCoursesAndSectionsDesc') || 'Gestión de estructura académica'}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard/admin/user-management')}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-medium">{translate('adminUsersTitle') || 'Gestión de Usuarios'}</h4>
                  <p className="text-sm text-muted-foreground">{translate('adminUsersDesc') || 'Crear estudiantes y profesores'}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard/admin/user-management')}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-purple-500" />
                <div>
                  <h4 className="font-medium">{translate('adminAssignmentsTitle') || 'Asignaciones'}</h4>
                  <p className="text-sm text-muted-foreground">{translate('adminAssignmentsDesc') || 'Asignar usuarios a cursos y materias'}</p>
                </div>
              </div>
            </div>
            
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard/admin/user-management')}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="font-medium">{translate('adminConfigurationTitle') || 'Configuración'}</h4>
                  <p className="text-sm text-muted-foreground">{translate('adminConfigurationDesc') || 'Configuración del sistema'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {translate('adminSystemDescription') || 'Sistema completo de gestión educativa con estructura jerárquica, asignaciones automáticas y herramientas de administración.'}
                </p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/admin/user-management')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Users className="w-4 h-4 mr-2" />
                {translate('adminAccessSystemButton') || 'Acceder al Sistema'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migración de Códigos Únicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Migración de Códigos Únicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Asigna códigos únicos a todos los usuarios, tareas y evaluaciones del sistema.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Esta operación es segura y no afecta los datos existentes.
              </p>
            </div>
            <Button 
              onClick={handleMigrateUniqueCodes}
              disabled={isMigrating}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Ejecutar Migración
                </>
              )}
            </Button>
          </div>

          {/* Detalles de la migración */}
          {migrationDetails.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2 flex items-center">
                {migrationStatus === 'running' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {migrationStatus === 'completed' && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
                {migrationStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2 text-red-500" />}
                Detalles de la Migración
              </h4>
              <div className="space-y-1 text-sm font-mono">
                {migrationDetails.map((detail, index) => (
                  <div key={index} className="text-muted-foreground">
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Códigos Únicos Implementados</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• TCH-XXXXXXXX - Códigos para profesores</li>
                <li>• STU-XXXXXXXX - Códigos para estudiantes</li>
                <li>• TSK-XXXXXXXX - Códigos para tareas</li>
                <li>• EVL-XXXXXXXX - Códigos para evaluaciones</li>
                <li>• CRS-XXXXXXXX - Códigos para cursos (futuro)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Características</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Códigos de 8 caracteres alfanuméricos</li>
                <li>• Basados en timestamp para unicidad</li>
                <li>• Validación automática de formato</li>
                <li>• Migración automática de datos legacy</li>
                <li>• Referencia interna para integridad</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
