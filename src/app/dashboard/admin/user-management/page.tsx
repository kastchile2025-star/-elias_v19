"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

// Import the main user management component
import UserManagement from '@/components/admin/user-management/user-management';

export default function UserManagementPage() {
  const { user, isAdmin } = useAuth();
  const { translate } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

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

      {/* Direct User Management Content */}
      <div className="mt-6">
        <UserManagement />
      </div>
    </div>
  );
}
