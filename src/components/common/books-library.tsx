"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, Eye, FileText, Lock } from 'lucide-react';
import { bookPDFs } from '@/lib/books-data';
import { useAuth } from '@/contexts/auth-context';

export default function BooksLibrary() {
  const { user, getAccessibleCourses, hasAccessToCourse, isLoading } = useAuth();
  
  // Early return if loading or no user
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando biblioteca...</p>
        </div>
      </div>
    );
  }
  
  // Obtener cursos accesibles basados en permisos
  const accessibleCourses = useMemo(() => {
    const courses = getAccessibleCourses();
    return Array.isArray(courses) ? courses : [];
  }, [getAccessibleCourses, user]);

  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Efecto para seleccionar el primer curso disponible cuando cambien los cursos accesibles
  useEffect(() => {
    if (accessibleCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(accessibleCourses[0]);
    } else if (accessibleCourses.length > 0 && !accessibleCourses.includes(selectedCourse)) {
      setSelectedCourse(accessibleCourses[0]);
    }
  }, [accessibleCourses, selectedCourse]);

  // Filtrar libros por curso seleccionado y permisos
  const availableBooks = useMemo(() => {
    if (!selectedCourse) return [];
    
    // Verificar si el usuario tiene acceso al curso seleccionado
    if (!hasAccessToCourse(selectedCourse)) return [];
    
    const filtered = bookPDFs.filter(book => book.course === selectedCourse);
    
    return filtered;
  }, [selectedCourse, hasAccessToCourse, user]);

  const openPDF = (book: any) => {
    if (!hasAccessToCourse(book.course)) {
      alert('No tienes permisos para acceder a este libro.');
      return;
    }
    
    if (book.pdfUrl) {
      window.open(book.pdfUrl, '_blank');
    } else {
      alert('PDF no disponible. Contacta al administrador.');
    }
  };

  const downloadPDF = (book: any) => {
    if (!hasAccessToCourse(book.course)) {
      alert('No tienes permisos para descargar este libro.');
      return;
    }
    
    if (book.pdfUrl) {
      const link = document.createElement('a');
      link.href = book.pdfUrl;
      link.download = `${book.title.replace(/\s+/g, '-')}.pdf`;
      link.click();
    } else {
      alert('PDF no disponible para descarga.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            📚 Biblioteca Digital
          </h1>
          <p className="text-muted-foreground text-sm">
            Accede a todos los libros digitales organizados por curso
          </p>
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">
              {accessibleCourses.length} curso(s) disponible(s)
            </span>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Seleccionar curso" />
            </SelectTrigger>
            <SelectContent>
              {accessibleCourses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {accessibleCourses.length === 0 && (
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-muted-foreground">
            No tienes cursos asignados
          </h3>
          <p className="text-sm text-muted-foreground">
            Contacta al administrador para obtener acceso a los cursos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availableBooks.map((book, index) => (
          <Card key={`${book.course}-${book.subject}-${index}`} className="flex flex-col h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <Badge variant="secondary" className="text-xs">{book.subject}</Badge>
              </div>
              <CardTitle className="text-base leading-tight">{book.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {book.course} - {book.subject}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0 flex-1 flex flex-col justify-between">
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>Libro digital</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.pdfUrl ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {book.pdfUrl ? '✓ Disponible' : '⚠ No disponible'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => openPDF(book)}
                  className="flex-1"
                  variant="default"
                  size="sm"
                  disabled={!book.pdfUrl || !hasAccessToCourse(book.course)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button 
                  onClick={() => downloadPDF(book)}
                  variant="outline"
                  size="sm"
                  disabled={!book.pdfUrl || !hasAccessToCourse(book.course)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCourse && availableBooks.length === 0 && accessibleCourses.length > 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-muted-foreground">
            No hay libros disponibles para {selectedCourse}
          </h3>
        </div>
      )}
    </div>
  );
}
