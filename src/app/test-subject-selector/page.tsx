"use client";

import React from 'react';
import { BookCourseSelector } from '@/components/common/book-course-selector';

export default function TestSubjectSelector() {
  const [selectedCourse, setSelectedCourse] = React.useState('');
  const [selectedBook, setSelectedBook] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('');

  const handleBookChange = (bookName: string) => {
    console.log('📖 Libro seleccionado:', bookName);
    setSelectedBook(bookName);
  };

  const handleCourseChange = (courseName: string) => {
    console.log('📚 Curso seleccionado:', courseName);
    setSelectedCourse(courseName);
    // Resetear asignatura y libro cuando cambie el curso
    setSelectedSubject('');
    setSelectedBook('');
  };

  const handleSubjectChange = (subjectName: string) => {
    console.log('🎯 Asignatura seleccionada:', subjectName);
    setSelectedSubject(subjectName);
    // Resetear libro cuando cambie la asignatura
    setSelectedBook('');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Prueba del Selector de Asignaturas</h1>
      
      <div className="max-w-md">
        <BookCourseSelector
          selectedCourse={selectedCourse}
          selectedBook={selectedBook}
          selectedSubject={selectedSubject}
          showSubjectSelector={true}
          onBookChange={handleBookChange}
          onCourseChange={handleCourseChange}
          onSubjectChange={handleSubjectChange}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Instrucciones:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Inicia sesión como profesor</li>
          <li>Selecciona un curso</li>
          <li>Selecciona una asignatura (solo aparecen las asignadas al profesor)</li>
          <li>Selecciona un libro (filtrado por asignatura)</li>
          <li>Revisa la consola del navegador para ver los logs de debugging</li>
        </ol>
        
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Estado actual:</strong><br/>
            Curso: {selectedCourse || 'No seleccionado'}<br/>
            Asignatura: {selectedSubject || 'No seleccionada'}<br/>
            Libro: {selectedBook || 'No seleccionado'}
          </p>
        </div>
      </div>
    </div>
  );
}
