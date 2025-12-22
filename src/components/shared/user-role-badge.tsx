"use client";

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { usePathname } from 'next/navigation';
import { GraduationCap, Shield, Crown, Users } from 'lucide-react';

export function UserRoleBadge() {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const pathname = usePathname();

  // Solo mostrar el badge en rutas del dashboard
  if (!user || !pathname.startsWith('/dashboard')) return null;

  const roleConfig = {
    admin: {
      labelKey: 'adminRole',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 border-red-200',
      activeClassName: 'bg-red-100 text-red-800 border-red-200'
    },
    teacher: {
      labelKey: 'teacherRole',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
      activeClassName: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700'
    },
    student: {
      labelKey: 'studentRole',
      variant: 'outline' as const,
      className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700 transition-colors duration-200 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-200'
    },
    guardian: {
      labelKey: 'guardianRole',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700',
      activeClassName: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700'
    },
    // ✅ Agregar soporte para rol 'estudiante' en español
    estudiante: {
      labelKey: 'studentRole',
      variant: 'outline' as const,
      className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700 transition-colors duration-200 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-200'
    }
  };

  const config = roleConfig[user.role as keyof typeof roleConfig];
  
  // ✅ Validación: Si no hay configuración para el rol, no mostrar el badge
  if (!config) {
    console.warn(`[UserRoleBadge] Rol no soportado: ${user.role}`);
    return null;
  }
  
  // Para estudiantes, siempre usar el estilo verde fijo sin variaciones
  // Para administradores, usar el estilo rojo consistente SIEMPRE (sin cambios por pestaña)
  // Para otros roles, mantener la lógica de estado activo/inactivo
  let badgeClassName = config.className;
  let badgeVariant = config.variant;
  
  if (user.role === 'student' || user.role === 'estudiante') {
    // Forzar siempre el estilo verde para estudiantes, ignorando cualquier estado
    badgeClassName = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700';
    badgeVariant = 'outline' as const;
  } else if (user.role === 'admin') {
    // Badge de administrador COMPLETAMENTE FIJO - sin variaciones por tema ni pestaña
    badgeClassName = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800';
    badgeVariant = 'outline' as const;
  } else if (user.role === 'teacher') {
    // HeaderBadge: Badge de profesor COMPLETAMENTE FIJO - sin variaciones por página ni estado
    badgeClassName = 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800';
    badgeVariant = 'outline' as const;
  }

  return (
    <Badge 
      variant={badgeVariant}
      className={`${badgeClassName} text-xs font-medium px-2 py-1 hidden sm:inline-flex items-center gap-1.5`}
    >
      {user.role === 'admin' && (
        <Crown className="w-3 h-3 text-red-700 flex-shrink-0" />
      )}
      {user.role === 'teacher' && (
        <Shield className="w-3 h-3 text-blue-700 dark:text-blue-400 flex-shrink-0" />
      )}
      {(user.role === 'student' || user.role === 'estudiante') && (
        <GraduationCap className="w-3 h-3 text-green-700 dark:text-green-400 flex-shrink-0" />
      )}
      {user.role === 'guardian' && (
        <Users className="w-3 h-3 text-purple-700 dark:text-purple-400 flex-shrink-0" />
      )}
      {translate(config.labelKey)}
    </Badge>
  );
}
