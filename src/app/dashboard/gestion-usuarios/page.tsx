"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, GraduationCap, Users, Settings as SettingsIcon, UserCheck, Upload } from 'lucide-react';

// Import components for each tab
import CoursesAndSections from '@/components/admin/user-management/courses-and-sections';
import UserManagement from '@/components/admin/user-management/user-management';
import Assignments from '@/components/admin/user-management/assignments';
import BulkUploads from '@/components/admin/user-management/bulk-uploads';
import Configuration from '@/components/admin/user-management/configuration';

export default function UserManagementPage() {
  const { user, isAdmin } = useAuth();
  const { translate } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('courses');

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/dashboard');
      toast({
        title: translate('userManagementAccessDenied') || 'Acceso denegado',
        description: translate('userManagementAccessDeniedDesc') || 'No tienes permisos para acceder a esta página',
        variant: 'destructive'
      });
    }
  }, [user, isAdmin, router, toast, translate]);

  // Don't render if not admin
  if (user && !isAdmin()) {
    return null;
  }

  const tabs = [
    {
      id: 'courses',
      label: translate('userManagementTabCourses') || 'Cursos y Secciones',
      icon: GraduationCap,
      description: translate('userManagementTabCoursesDesc') || 'Gestión de estructura académica'
    },
    {
      id: 'users',
      label: translate('userManagementTabUsers') || 'Gestión de Usuarios',
      icon: Users,
      description: translate('userManagementTabUsersDesc') || 'Crear estudiantes y profesores'
    },
    {
      id: 'assignments',
      label: translate('userManagementTabAssignments') || 'Asignaciones',
      icon: UserCheck,
      description: translate('userManagementTabAssignmentsDesc') || 'Asignar usuarios a cursos y materias'
    },
    {
      id: 'bulk-uploads',
      label: translate('userManagementTabBulkUploads') || 'Carga Masiva',
      icon: Upload,
      description: translate('userManagementTabBulkUploadsDesc') || 'Importar calificaciones y asistencia'
    },
    {
      id: 'config',
      label: translate('userManagementTabConfiguration') || 'Configuración',
      icon: SettingsIcon,
      description: translate('userManagementTabConfigurationDesc') || 'Configuración del sistema'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-500" />
            {translate('userManagementMainTitle') || 'Gestión de Usuarios'}
          </h1>
          <p className="text-muted-foreground">
            {translate('userManagementMainDesc') || 'Administración completa del sistema educativo'}
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tab Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Card
                key={tab.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <IconComponent className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : ''}`} />
                    {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {tab.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="courses" className="space-y-6">
            <CoursesAndSections />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Assignments />
          </TabsContent>

          <TabsContent value="bulk-uploads" className="space-y-6">
            <BulkUploads key={activeTab === 'bulk-uploads' ? 'active' : 'inactive'} />
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <Configuration />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
