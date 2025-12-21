"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { Shield, BookOpen, Users, Lock } from 'lucide-react';

export default function UserRoleDemo() {
  const { user, getAccessibleCourses, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Debe iniciar sesión para ver esta información</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accessibleCourses = getAccessibleCourses() || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sistema de Roles - Demo</h1>
        <p className="text-muted-foreground">
          Demostración del sistema de permisos basado en roles implementado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Información del Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Usuario Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold">Nombre:</span>
              <p className="mt-1">{user.displayName}</p>
            </div>
            <div>
              <span className="font-semibold">Usuario:</span>
              <p className="mt-1">@{user.username}</p>
            </div>
            <div>
              <span className="font-semibold">Email:</span>
              <p className="mt-1">{user.email || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-semibold">Rol:</span>
              <div className="mt-1">
                <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? 'Administrador' : user.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cursos Accesibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Cursos Accesibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.role === 'admin' ? (
              <div>
                <Badge variant="outline" className="mb-3">
                  <Shield className="w-3 h-3 mr-1" />
                  Acceso total a todos los cursos
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Como administrador, tienes acceso completo a toda la información de todos los cursos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Cursos asignados ({accessibleCourses.length}):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {accessibleCourses.map((course, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {course}
                    </Badge>
                  ))}
                </div>
                {accessibleCourses.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tienes cursos asignados. Contacta al administrador.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permisos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Permisos del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Ver todos los libros:</span>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? '✓ Sí' : '✗ No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Acceso a libros por curso:</span>
                <Badge variant="default">✓ Sí</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resúmenes:</span>
                <Badge variant="default">✓ Sí</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mapas mentales:</span>
                <Badge variant="default">✓ Sí</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cuestionarios:</span>
                <Badge variant="default">✓ Sí</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Evaluaciones:</span>
                <Badge variant="default">✓ Sí</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Perfil:</span>
                <Badge variant="default">✓ Sí</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ayuda:</span>
                <Badge variant="default">✓ Sí</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explicación del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo Funciona el Sistema de Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Administrador</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acceso total a toda la información</li>
                <li>• Ve todos los cursos y libros</li>
                <li>• Acceso completo a todas las funcionalidades</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">Profesor</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acceso limitado por cursos activos</li>
                <li>• Ve solo libros de sus cursos asignados</li>
                <li>• Acceso a todas las demás funcionalidades</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Estudiante</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acceso limitado por cursos activos</li>
                <li>• Ve solo libros de sus cursos asignados</li>
                <li>• Acceso a todas las demás funcionalidades</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios de Prueba */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios de Prueba Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="font-semibold flex items-center gap-2">
                <Badge variant="destructive">Admin</Badge>
                admin
              </div>
              <p className="text-sm text-muted-foreground">Contraseña: 1234</p>
              <p className="text-xs mt-1">Acceso total al sistema</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold flex items-center gap-2">
                <Badge variant="secondary">Estudiante</Badge>
                felipe
              </div>
              <p className="text-sm text-muted-foreground">Contraseña: 1234</p>
              <p className="text-xs mt-1">Cursos: 3ro Básico, 4to Básico</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold flex items-center gap-2">
                <Badge variant="default">Profesor</Badge>
                jorge
              </div>
              <p className="text-sm text-muted-foreground">Contraseña: 1234</p>
              <p className="text-xs mt-1">Cursos: 3ro, 4to, 5to Básico</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold flex items-center gap-2">
                <Badge variant="secondary">Estudiante</Badge>
                maria
              </div>
              <p className="text-sm text-muted-foreground">Contraseña: 1234</p>
              <p className="text-xs mt-1">Cursos: 1ro Básico</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold flex items-center gap-2">
                <Badge variant="default">Profesor</Badge>
                carlos
              </div>
              <p className="text-sm text-muted-foreground">Contraseña: 1234</p>
              <p className="text-xs mt-1">Cursos: 1ro, 2do Básico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
