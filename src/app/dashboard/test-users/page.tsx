"use client";

import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, BookOpen, Users, Settings, History, ListChecks } from 'lucide-react';
import type { EvaluationHistoryItem } from '@/lib/types';

export default function TestUsersPage() {
  const { user, logout, hasAccessToCourse, isAdmin, getAccessibleCourses } = useAuth();
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistoryItem[]>([]);

  // Load user-specific evaluation history
  useEffect(() => {
    if (user) {
      const historyKey = `evaluationHistory_${user.username}`;
      const storedHistory = localStorage.getItem(historyKey);
      if (storedHistory) {
        try {
          setEvaluationHistory(JSON.parse(storedHistory));
        } catch (error) {
          console.error('Error loading evaluation history:', error);
          setEvaluationHistory([]);
        }
      } else {
        setEvaluationHistory([]);
      }
    }
  }, [user]);

  // Function to add a test evaluation
  const addTestEvaluation = () => {
    if (!user) return;

    const testEvaluation: EvaluationHistoryItem = {
      id: new Date().toISOString(),
      date: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + ', ' + new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ' Hrs',
      courseName: user.role === 'admin' ? '4to Básico' : (getAccessibleCourses()[0] || '4to Básico'),
      bookTitle: 'Ciencias Naturales',
      topic: `Evaluación de prueba ${user.username}`,
      score: Math.floor(Math.random() * 5) + 3, // Random score 3-7
      totalQuestions: 7,
    };

    const historyKey = `evaluationHistory_${user.username}`;
    const updatedHistory = [testEvaluation, ...evaluationHistory];
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    setEvaluationHistory(updatedHistory);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sistema de Usuarios</h1>
          <p>Debes estar autenticado para ver esta página.</p>
        </div>
      </div>
    );
  }

  const testCourses = ['1ro Básico', '2do Básico', '3ro Básico', '4to Básico', '5to Básico'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Prueba - Sistema de Roles</h1>
        <Button onClick={logout} variant="outline">
          Cerrar Sesión
        </Button>
      </div>

      {/* Información del Usuario Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuario Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nombre:</strong> {user.displayName}</p>
              <p><strong>Usuario:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
            <div>
              <p><strong>Rol:</strong></p>
              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'} className="mt-1">
                <Shield className="w-3 h-3 mr-1" />
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
            <BookOpen className="h-5 w-5" />
            Cursos Accesibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p><strong>Cursos asignados:</strong></p>
            <div className="flex flex-wrap gap-2">
              {isAdmin() ? (
                <Badge variant="outline" className="text-sm">
                  <Settings className="w-3 h-3 mr-1" />
                  Acceso total a todos los cursos
                </Badge>
              ) : (
                getAccessibleCourses().map((course, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {course}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Evaluaciones Específico del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Evaluaciones (Específico del Usuario)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Historial almacenado bajo la clave: <code className="bg-muted px-1 rounded text-xs">evaluationHistory_{user.username}</code>
              </p>
              <Button onClick={addTestEvaluation} size="sm" variant="outline">
                <ListChecks className="w-4 h-4 mr-2" />
                Agregar Evaluación de Prueba
              </Button>
            </div>
            
            {evaluationHistory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay evaluaciones en el historial de este usuario.</p>
                <p className="text-xs mt-1">Haz una evaluación o agrega una de prueba para verificar el aislamiento.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Evaluaciones encontradas: {evaluationHistory.length}</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {evaluationHistory.slice(0, 5).map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.topic}</p>
                          <p className="text-muted-foreground">{item.courseName} - {item.bookTitle}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {item.score}/{item.totalQuestions}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {evaluationHistory.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... y {evaluationHistory.length - 5} evaluaciones más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prueba de Acceso a Cursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Prueba de Permisos por Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Verificación de acceso a cursos individuales:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testCourses.map((course) => {
              const hasAccess = hasAccessToCourse(course);
              return (
                <div key={course} className={`p-3 rounded-lg border ${hasAccess ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{course}</span>
                    <Badge variant={hasAccess ? 'default' : 'destructive'} className="text-xs">
                      {hasAccess ? '✓ Permitido' : '✗ Denegado'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usuarios de Prueba */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios de Prueba Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Puedes probar el sistema con estos usuarios (todos usan la contraseña "1234"):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Administrador:</strong></p>
                <p className="text-sm">• admin - Acceso total a todos los cursos</p>
              </div>
              <div className="space-y-2">
                <p><strong>Profesores:</strong></p>
                <p className="text-sm">• jorge - Cursos: 4to, 5to Básico</p>
                <p className="text-sm">• carlos - Cursos: 1ro, 2do Básico</p>
              </div>
              <div className="space-y-2">
                <p><strong>Estudiantes:</strong></p>
                <p className="text-sm">• felipe - Cursos: 4to Básico</p>
                <p className="text-sm">• maria - Cursos: 1ro Básico</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
