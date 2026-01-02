"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Download, GraduationCap, Calendar, CheckCircle2, Clock, AlertCircle, FileText, DollarSign, CheckSquare } from 'lucide-react';
import { LocalStorageManager } from '@/lib/education-utils';

interface Student {
  id: string;
  name: string;
  username: string;
  courseId?: string;
  sectionId?: string;
  courseName?: string;
  sectionName?: string;
}

interface PaymentRecord {
  id: string;
  studentId: string;
  year: number;
  month: number;
  type: 'matricula' | 'mensualidad';
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  description: string;
}

const MONTHS = [
  { value: 0, label: 'Matrícula' },
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export default function FinancieraPage() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all'); // 'all' por defecto
  const [selectedYear, setSelectedYear] = useState<string>('all'); // 'all' por defecto
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' por defecto
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [allPaymentRecords, setAllPaymentRecords] = useState<PaymentRecord[]>([]); // Todos los registros sin filtrar
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set()); // Para checkboxes
  const [loading, setLoading] = useState(true);

  // Cargar estudiantes: todos para admin, asignados para apoderado
  useEffect(() => {
    if (!user?.username) return;

    try {
      const currentYear = new Date().getFullYear();
      const availableYears = LocalStorageManager.listYears() || [currentYear];
      
      // Si el usuario es admin, cargar estudiantes de cursos específicos (ejemplo demo)
      if (user.role === 'admin') {
        let yearUsed = currentYear;
        let allStudents: Student[] = [];
        
        // Cursos permitidos para demo: 1° Básico, 8° Básico, 3° Medio
        const allowedCoursePatterns = [
          /^1.*b[aá]sico/i,
          /^8.*b[aá]sico/i,
          /^3.*medio/i,
          /^1ro.*b[aá]sico/i,
          /^8vo.*b[aá]sico/i,
          /^3ro.*medio/i,
        ];
        
        const isCourseAllowed = (courseName: string | undefined) => {
          if (!courseName) return false;
          return allowedCoursePatterns.some(pattern => pattern.test(courseName));
        };
        
        for (const year of [currentYear, ...availableYears.filter(y => y !== currentYear)]) {
          const studentsForYear = LocalStorageManager.getStudentsForYear(year) || [];
          const coursesForYear = LocalStorageManager.getCoursesForYear(year) || [];
          const sectionsForYear = LocalStorageManager.getSectionsForYear(year) || [];
          
          if (studentsForYear.length > 0) {
            yearUsed = year;
            
            for (const student of studentsForYear) {
              // Evitar duplicados
              if (allStudents.some(s => s.id === student.id)) continue;
              
              const course = coursesForYear.find((c: any) => c.id === student.courseId);
              const section = sectionsForYear.find((s: any) => s.id === student.sectionId);
              
              // Solo incluir estudiantes de cursos permitidos
              if (!isCourseAllowed(course?.name)) continue;
              
              allStudents.push({
                id: student.id,
                name: student.name || student.displayName || student.username,
                username: student.username,
                courseId: student.courseId,
                sectionId: student.sectionId,
                courseName: course?.name,
                sectionName: section?.name,
              });
            }
            break; // Usar solo el primer año con estudiantes
          }
        }
        
        // Fallback: buscar en smart-student-users si no hay estudiantes
        if (allStudents.length === 0) {
          const storedUsers = localStorage.getItem('smart-student-users');
          if (storedUsers) {
            const usersData = JSON.parse(storedUsers);
            const studentUsers = usersData.filter((u: any) => u.role === 'student' || u.type === 'student');
            for (const student of studentUsers) {
              allStudents.push({
                id: student.id,
                name: student.name || student.displayName || student.username,
                username: student.username,
                courseId: student.courseId,
                sectionId: student.sectionId,
                courseName: undefined,
                sectionName: undefined,
              });
            }
          }
        }
        
        setAssignedStudents(allStudents);
        setLoading(false);
        return;
      }
      
      // Para apoderados: buscar guardian en todos los años disponibles
      let guardianData: any = null;
      let yearUsed = currentYear;
      
      for (const year of [currentYear, ...availableYears.filter(y => y !== currentYear)]) {
        const guardiansForYear = LocalStorageManager.getGuardiansForYear(year) || [];
        const found = guardiansForYear.find((g: any) => 
          g.username?.toLowerCase() === user.username?.toLowerCase()
        );
        if (found && found.studentIds && found.studentIds.length > 0) {
          guardianData = found;
          yearUsed = year;
          break;
        }
      }

      if (!guardianData?.studentIds || guardianData.studentIds.length === 0) {
        // Fallback: buscar en smart-student-users
        const storedUsers = localStorage.getItem('smart-student-users');
        if (storedUsers) {
          const usersData = JSON.parse(storedUsers);
          const fullUserData = usersData.find((u: any) => u.username === user.username);
          if (fullUserData?.studentIds) {
            guardianData = fullUserData;
          }
        }
      }

      if (guardianData?.studentIds && guardianData.studentIds.length > 0) {
        // Obtener datos de los estudiantes
        const studentsForYear = LocalStorageManager.getStudentsForYear(yearUsed) || [];
        const coursesForYear = LocalStorageManager.getCoursesForYear(yearUsed) || [];
        const sectionsForYear = LocalStorageManager.getSectionsForYear(yearUsed) || [];
        
        const students: Student[] = [];
        
        for (const studentId of guardianData.studentIds) {
          // Buscar en studentsForYear
          let student = studentsForYear.find((s: any) => 
            s.id === studentId || s.username === studentId
          );
          
          // Fallback: buscar en smart-student-users
          if (!student) {
            const storedUsers = localStorage.getItem('smart-student-users');
            if (storedUsers) {
              const usersData = JSON.parse(storedUsers);
              student = usersData.find((u: any) => 
                (u.id === studentId || u.username === studentId) && 
                (u.role === 'student' || u.type === 'student')
              );
            }
          }
          
          if (student) {
            const course = coursesForYear.find((c: any) => c.id === student.courseId);
            const section = sectionsForYear.find((s: any) => s.id === student.sectionId);
            
            students.push({
              id: student.id,
              name: student.name || student.displayName || student.username,
              username: student.username,
              courseId: student.courseId,
              sectionId: student.sectionId,
              courseName: course?.name,
              sectionName: section?.name,
            });
          }
        }
        
        setAssignedStudents(students);
        // No establecer estudiante por defecto - dejar en 'all'
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading guardian data:', error);
      setLoading(false);
    }
  }, [user]);

  // Cargar/generar registros de pago para todos los estudiantes
  useEffect(() => {
    if (assignedStudents.length === 0) return;
    
    const year = 2025; // Solo año 2025
    const storageKey = `smart-student-payments-${year}`;
    const isAdmin = user?.role === 'admin';
    let existingRecords: PaymentRecord[] = [];
    
    // Solo cargar desde localStorage para apoderados (no para admin)
    if (!isAdmin) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          existingRecords = JSON.parse(stored);
        }
      } catch {}
    }
    
    // Generar registros para todos los estudiantes asignados
    const allRecords: PaymentRecord[] = [];
    
    for (const student of assignedStudents) {
      let studentRecords = existingRecords.filter(r => r.studentId === student.id && r.year === year);
      
      // Si no hay registros para este estudiante, generar estructura base
      if (studentRecords.length === 0) {
        studentRecords = [
          {
            id: `pay-${student.id}-${year}-0`,
            studentId: student.id,
            year,
            month: 0,
            type: 'matricula',
            amount: 150000,
            status: 'pending',
            description: `Matrícula ${year} - Incluye derecho a inscripción, materiales de estudio y seguro escolar`
          }
        ];
        
        // Agregar mensualidades (marzo a diciembre)
        for (let month = 3; month <= 12; month++) {
          studentRecords.push({
            id: `pay-${student.id}-${year}-${month}`,
            studentId: student.id,
            year,
            month,
            type: 'mensualidad',
            amount: 85000,
            status: 'pending',
            description: `Mensualidad ${MONTHS.find(m => m.value === month)?.label} ${year} - Incluye servicios educativos y actividades extracurriculares`
          });
        }
      }
      
      allRecords.push(...studentRecords);
    }
    
    // Solo guardar en localStorage para apoderados (evitar exceder cuota con muchos estudiantes)
    if (!isAdmin) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(allRecords));
      } catch (e) {
        console.warn('No se pudo guardar en localStorage (cuota excedida):', e);
      }
    }
    setAllPaymentRecords(allRecords);
  }, [assignedStudents, user?.role]);

  // Filtrar registros según selección
  useEffect(() => {
    let filtered = [...allPaymentRecords];
    
    // Filtrar por estudiante
    if (selectedStudentId !== 'all') {
      filtered = filtered.filter(r => r.studentId === selectedStudentId);
    }
    
    // Filtrar por año (siempre 2025 por ahora)
    if (selectedYear !== 'all') {
      filtered = filtered.filter(r => r.year === Number(selectedYear));
    }
    
    // Filtrar por concepto/mes
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(r => r.month === Number(selectedMonth));
    }
    
    setPaymentRecords(filtered);
    setSelectedRecordIds(new Set()); // Limpiar selección al cambiar filtros
  }, [allPaymentRecords, selectedStudentId, selectedYear, selectedMonth]);

  // Funciones para manejo de checkboxes
  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const pendingRecords = paymentRecords.filter(r => r.status === 'pending');
    const allSelected = pendingRecords.length > 0 && pendingRecords.every(r => selectedRecordIds.has(r.id));
    if (allSelected) {
      // Deseleccionar todos
      setSelectedRecordIds(new Set());
    } else {
      // Seleccionar todos los pendientes
      const pendingIds = new Set(pendingRecords.map(r => r.id));
      setSelectedRecordIds(pendingIds);
    }
  };

  const handlePaySelectedRecords = () => {
    if (selectedRecordIds.size === 0) {
      alert('Selecciona al menos un pago pendiente');
      return;
    }
    
    const updatedAll = allPaymentRecords.map(r => {
      if (selectedRecordIds.has(r.id)) {
        return {
          ...r,
          status: 'paid' as const,
          paidDate: new Date().toLocaleDateString('es-CL')
        };
      }
      return r;
    });
    
    setAllPaymentRecords(updatedAll);
    
    // Guardar en localStorage
    const storageKey = `smart-student-payments-2025`;
    localStorage.setItem(storageKey, JSON.stringify(updatedAll));
    
    const count = selectedRecordIds.size;
    const total = paymentRecords.filter(r => selectedRecordIds.has(r.id)).reduce((sum, r) => sum + r.amount, 0);
    setSelectedRecordIds(new Set());
    
    alert(`${count} pago(s) realizados exitosamente por un total de ${formatCurrency(total)}`);
  };

  // Helper para obtener nombre del estudiante
  const getStudentName = (studentId: string) => {
    const student = assignedStudents.find(s => s.id === studentId);
    return student?.name || 'Estudiante';
  };

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {translate('financeStatusPaid') || 'Pagado'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            {translate('financeStatusPending') || 'Pendiente'}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            {translate('financeStatusOverdue') || 'Vencido'}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const handleDownloadReceipt = async (record: PaymentRecord) => {
    if (record.status !== 'paid') {
      alert(translate('financeOnlyPaidReceipts') || 'Solo se pueden descargar comprobantes de pagos realizados.');
      return;
    }
    
    try {
      // Importar jsPDF dinámicamente para evitar errores SSR
      const { default: jsPDF } = await import('jspdf');
      
      const student = assignedStudents.find(s => s.id === record.studentId);
      const monthLabel = MONTHS.find(m => m.value === record.month)?.label || '';
      
      // Generar número correlativo basado en todos los pagos realizados
      const allPaidRecords = allPaymentRecords
        .filter(r => r.status === 'paid')
        .sort((a, b) => {
          // Ordenar por fecha de pago o por año/mes si no hay fecha
          if (a.paidDate && b.paidDate) {
            return new Date(a.paidDate).getTime() - new Date(b.paidDate).getTime();
          }
          return (a.year * 100 + a.month) - (b.year * 100 + b.month);
        });
      
      const receiptIndex = allPaidRecords.findIndex(r => r.id === record.id) + 1;
      const receiptNumber = `${record.year}-${String(receiptIndex).padStart(4, '0')}`;
      
      // Crear documento PDF
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Colores
      const primaryColor: [number, number, number] = [16, 185, 129]; // emerald-500
      const darkColor: [number, number, number] = [30, 41, 59]; // slate-800
      const grayColor: [number, number, number] = [100, 116, 139]; // slate-500
      
      let yPos = 20;
      
      // Header con fondo
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Logo/Título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('SMART STUDENT', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('COMPROBANTE DE PAGO', pageWidth / 2, 32, { align: 'center' });
      
      yPos = 60;
      
      // Número de comprobante y fecha
      doc.setTextColor(...darkColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${translate('financeReceiptNumber') || 'Comprobante N°'}: ${receiptNumber}`, 20, yPos);
      doc.text(`${translate('financeIssueDate') || 'Fecha de emisión'}: ${new Date().toLocaleDateString('es-CL')}`, pageWidth - 20, yPos, { align: 'right' });
      
      yPos += 15;
      
      // Línea separadora
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      
      yPos += 15;
      
      // Sección: Datos del Estudiante
      doc.setFillColor(240, 253, 244); // green-50
      doc.rect(20, yPos - 5, pageWidth - 40, 35, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL ESTUDIANTE', 25, yPos + 5);
      
      yPos += 15;
      doc.setTextColor(...darkColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre: ${student?.name || 'N/A'}`, 25, yPos);
      yPos += 7;
      doc.text(`Curso: ${student?.courseName || 'N/A'} ${student?.sectionName ? '- ' + student.sectionName : ''}`, 25, yPos);
      
      yPos += 25;
      
      // Sección: Detalle del Pago
      doc.setFillColor(240, 253, 244);
      doc.rect(20, yPos - 5, pageWidth - 40, 55, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DEL PAGO', 25, yPos + 5);
      
      yPos += 15;
      doc.setTextColor(...darkColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Tabla de detalle
      doc.text('Concepto:', 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(record.type === 'matricula' ? 'Matrícula' : 'Mensualidad', 70, yPos);
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Período:', 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`${monthLabel} ${record.year}`, 70, yPos);
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Fecha de pago:', 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(record.paidDate || 'N/A', 70, yPos);
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Estado:', 25, yPos);
      doc.setTextColor(22, 163, 74); // green-600
      doc.setFont('helvetica', 'bold');
      doc.text('PAGADO', 70, yPos);
      
      yPos += 20;
      
      // Monto Total
      doc.setFillColor(...primaryColor);
      doc.rect(20, yPos - 5, pageWidth - 40, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MONTO TOTAL:', 25, yPos + 8);
      doc.setFontSize(18);
      doc.text(formatCurrency(record.amount), pageWidth - 25, yPos + 8, { align: 'right' });
      
      yPos += 35;
      
      // Descripción
      doc.setTextColor(...grayColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const descLines = doc.splitTextToSize(`Descripción: ${record.description}`, pageWidth - 50);
      doc.text(descLines, 25, yPos);
      
      yPos += descLines.length * 5 + 20;
      
      // Línea separadora final
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.line(20, yPos, pageWidth - 20, yPos);
      
      yPos += 10;
      
      // Footer
      doc.setTextColor(...grayColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Este documento es un comprobante válido de pago.', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text('Smart Student - Sistema de Gestión Educativa', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, pageWidth / 2, yPos, { align: 'center' });
      
      // Guardar PDF
      const fileName = `comprobante_${record.type}_${monthLabel}_${record.year}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el comprobante. Por favor intente nuevamente.');
    }
  };

  const handlePayment = (record: PaymentRecord) => {
    // Simular pago (en producción esto conectaría con una pasarela de pago)
    const updatedAll = allPaymentRecords.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          status: 'paid' as const,
          paidDate: new Date().toLocaleDateString('es-CL')
        };
      }
      return r;
    });
    
    setAllPaymentRecords(updatedAll);
    
    // Guardar en localStorage
    const storageKey = `smart-student-payments-2025`;
    localStorage.setItem(storageKey, JSON.stringify(updatedAll));
    
    alert(`Pago de ${formatCurrency(record.amount)} realizado exitosamente para ${MONTHS.find(m => m.value === record.month)?.label} ${record.year}`);
  };

  const totalPaid = paymentRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const totalPending = paymentRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const pendingRecordsCount = paymentRecords.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{translate('financeLoading') || 'Cargando información financiera...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-8 h-8 text-emerald-500" />
        <div>
          <h1 className="text-2xl font-bold">{translate('financePageTitle') || 'Estado de Cuenta'}</h1>
          <p className="text-muted-foreground">{translate('financePageDesc') || 'Gestiona los pagos de mensualidad y matrícula'}</p>
        </div>
      </div>

      {assignedStudents.length === 0 ? (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{translate('financeNoStudents') || 'No hay estudiantes asignados'}</h3>
            <p className="text-muted-foreground">
              {translate('financeNoStudentsDesc') || 'Contacta al administrador para asignar estudiantes a tu cuenta.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                {translate('financeFilters') || 'Filtros'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Selector de Estudiante */}
                <div className="space-y-2">
                  <Label>{translate('financeStudent') || 'Estudiante'}</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="border-green-300 dark:border-green-700 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Todos los estudiantes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translate('financeAll') || 'Todos'}</SelectItem>
                      {assignedStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex flex-col">
                            <span>{student.name}</span>
                            {student.courseName && (
                              <span className="text-xs text-muted-foreground">
                                {student.courseName} {student.sectionName && `- ${student.sectionName}`}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selector de Año */}
                <div className="space-y-2">
                  <Label>{translate('financeYear') || 'Año'}</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="border-green-300 dark:border-green-700 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Todos los años" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translate('financeAll') || 'Todos'}</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selector de Concepto */}
                <div className="space-y-2">
                  <Label>{translate('financeConcept') || 'Concepto'}</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="border-green-300 dark:border-green-700 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Todos los conceptos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {MONTHS.filter(m => m.value === 0 || m.value >= 3).map(month => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de pagos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{translate('financeTotalPaid') || 'Total Pagado'}</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{translate('financeTotalPending') || 'Total Pendiente'}</p>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(totalPending)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{translate('financeTotalAnnual') || 'Total Anual'}</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid + totalPending)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de todos los pagos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  {translate('financePaymentHistory') || 'Historial de Pagos'} {selectedYear !== 'all' ? selectedYear : ''}
                </CardTitle>
                {pendingRecordsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {selectedRecordIds.size === pendingRecordsCount ? (translate('financeDeselectAll') || 'Deseleccionar Todo') : (translate('financeSelectAll') || 'Seleccionar Todo')}
                    </Button>
                    {selectedRecordIds.size > 0 && (
                      <Button
                        size="sm"
                        onClick={handlePaySelectedRecords}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {translate('financePaySelected') || 'Pagar Seleccionados'} ({selectedRecordIds.size})
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground w-12">
                        <Checkbox 
                          checked={pendingRecordsCount > 0 && selectedRecordIds.size === pendingRecordsCount}
                          onCheckedChange={toggleSelectAll}
                          disabled={pendingRecordsCount === 0}
                        />
                      </th>
                      {selectedStudentId === 'all' && (
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">{translate('financeStudent') || 'Estudiante'}</th>
                      )}
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">{translate('financeConcept') || 'Concepto'}</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">{translate('financePeriod') || 'Período'}</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">{translate('financeAmount') || 'Monto'}</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">{translate('financeStatus') || 'Estado'}</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">{translate('financeActions') || 'Acciones'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={selectedStudentId === 'all' ? 7 : 6} className="py-8 text-center text-muted-foreground">
                          {translate('financeNoRecords') || 'No hay pagos para mostrar con los filtros seleccionados'}
                        </td>
                      </tr>
                    ) : (
                      paymentRecords.map(record => (
                        <tr 
                          key={record.id} 
                          className={`border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 ${selectedRecordIds.has(record.id) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                        >
                          <td className="py-3 px-2 text-center">
                            <Checkbox 
                              checked={selectedRecordIds.has(record.id)}
                              onCheckedChange={() => toggleRecordSelection(record.id)}
                              disabled={record.status === 'paid'}
                            />
                          </td>
                          {selectedStudentId === 'all' && (
                            <td className="py-3 px-4 text-muted-foreground">
                              {getStudentName(record.studentId)}
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <span className="font-medium">{record.type === 'matricula' ? (translate('financeEnrollment') || 'Matrícula') : (translate('financeMonthly') || 'Mensualidad')}</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {MONTHS.find(m => m.value === record.month)?.label} {record.year}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(record.amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {record.status === 'paid' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(record); }}
                                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handlePayment(record); }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {translate('financePay') || 'Pagar'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
