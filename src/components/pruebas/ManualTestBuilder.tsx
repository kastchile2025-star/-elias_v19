"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Eye, X, Download, FileKey, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"

type AnalyzedQuestion = {
  id: string
  type: 'tf' | 'mc' | 'ms' | 'des'
  text: string
  options?: string[]
  optionsWithCorrect?: Array<{ text: string; correct: boolean }>
  correctIndex?: number
  answer?: boolean
  prompt?: string
}

type AnalysisResult = {
  success: boolean
  title?: string
  topic?: string
  questions: AnalyzedQuestion[]
  counts: { tf: number; mc: number; ms: number; des: number }
  totalQuestions: number
  error?: string
}

type Course = { id: string; name: string }
type Section = { id: string; name: string; courseId?: string; course?: { id?: string } }
type Subject = { id: string; name: string }

type Props = {
  onTestCreated?: (test: any) => void
}

const COURSES_KEY = "smart-student-courses"
const SECTIONS_KEY = "smart-student-sections"
const SUBJECTS_KEY = "smart-student-subjects"
const TEACHER_ASSIGNMENTS_KEY = "smart-student-teacher-assignments"
const USERS_KEY = "smart-student-users"
const ADMIN_COURSES_KEY = "smart-student-admin-courses"
const ADMIN_SECTIONS_KEY = "smart-student-admin-sections"
const TASKS_KEY = "smart-student-tasks"

export default function ManualTestBuilder({ onTestCreated }: Props) {
  const { user } = useAuth() as any
  const { translate, language } = useLanguage()
  
  // Estados de archivo
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string>("")
  const [generatingPDF, setGeneratingPDF] = useState<'key' | 'course' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados de formulario (curso/sección/asignatura)
  const [courses, setCourses] = useState<Course[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  
  const [courseId, setCourseId] = useState<string>("")
  const [sectionId, setSectionId] = useState<string>("")
  const [subjectId, setSubjectId] = useState<string>("")
  const [topic, setTopic] = useState<string>("")
  
  // Ponderación
  const [weights, setWeights] = useState<{ tf: number; mc: number; ms: number; des: number }>({ tf: 25, mc: 25, ms: 25, des: 25 })
  const [totalPoints, setTotalPoints] = useState<number>(100)
  
  // Tipos de preguntas seleccionados
  const [selectedTypes, setSelectedTypes] = useState<Set<'tf' | 'mc' | 'ms' | 'des'>>(new Set())
  
  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false)
  
  // Cargar datos
  useEffect(() => {
    try {
      const csBase = JSON.parse(localStorage.getItem(COURSES_KEY) || "[]")
      const ssBase = JSON.parse(localStorage.getItem(SECTIONS_KEY) || "[]")
      const csAdmin = JSON.parse(localStorage.getItem(ADMIN_COURSES_KEY) || "[]")
      const ssAdmin = JSON.parse(localStorage.getItem(ADMIN_SECTIONS_KEY) || "[]")
      const sb = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || "[]")
      const ta = JSON.parse(localStorage.getItem(TEACHER_ASSIGNMENTS_KEY) || "[]")
      const us = JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
      const tk = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]")

      setCourses([...(Array.isArray(csAdmin) ? csAdmin : []), ...(Array.isArray(csBase) ? csBase : [])])
      setSections([...(Array.isArray(ssAdmin) ? ssAdmin : []), ...(Array.isArray(ssBase) ? ssBase : [])])
      setSubjects(Array.isArray(sb) ? sb : [])
      setTeacherAssignments(Array.isArray(ta) ? ta : [])
      setAllUsers(Array.isArray(us) ? us : [])
      setTasks(Array.isArray(tk) ? tk : [])
    } catch (e) {
      console.error("[ManualTestBuilder] Error cargando datos locales", e)
    }
  }, [])
  
  // Construir asignaciones efectivas
  const effectiveAssignments = useMemo(() => {
    const list: any[] = []
    const push = (a: any) => { if (a) list.push(a) }

    if (Array.isArray(teacherAssignments) && teacherAssignments.length > 0) {
      teacherAssignments.forEach(push)
    }

    {
      const me = (allUsers || []).find((u: any) => u && (u.id === user?.id || u.username === user?.username))
      const ti = me?.teachingAssignments || []
      if (Array.isArray(ti) && ti.length > 0) {
        const subjectByName = new Map<string, string>()
        subjects.forEach((s: any) => { if (s?.name && s?.id) subjectByName.set(String(s.name), String(s.id)) })
        ti.forEach((ta: any) => {
          const subjName = ta?.subject || ta?.subjectName
          const subjId = (subjName && subjectByName.get(String(subjName))) || undefined
          const courseNames: string[] = Array.isArray(ta?.courses) ? ta.courses : []
          courses.forEach((c: any) => {
            if (!c?.id || !c?.name) return
            if (courseNames.includes(c.name)) {
              sections
                .filter((s: any) => String(s.courseId) === String(c.id))
                .forEach((sec: any) => {
                  push({
                    teacherId: me?.id,
                    teacherUsername: me?.username,
                    sectionId: sec?.id,
                    courseId: c.id,
                    subjectId: subjId,
                    subjectName: subjName,
                  })
                })
            }
          })
        })
      }
    }

    const seen = new Set<string>()
    const unique = list.filter((a: any) => {
      const key = [a.teacherId || a.teacherUsername, a.courseId || a.course, a.sectionId || a.section, a.subjectId || a.subjectName || '']
        .map((v) => String(v || ''))
        .join('|')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    return unique
  }, [teacherAssignments, allUsers, user?.id, user?.username, subjects, courses, sections])
  
  // Chips Curso (Sección)
  const courseSectionChips = useMemo(() => {
    if (!user) return [] as Array<{ key: string; courseId: string; sectionId: string; label: string }>
    const secMap = new Map<string, Section>()
    sections.forEach((s: any) => { if (s && s.id) secMap.set(String(s.id), s) })
    const courseMap = new Map<string, Course>()
    courses.forEach((c: any) => { if (c && c.id) courseMap.set(String(c.id), c) })
    const my = (effectiveAssignments || []).filter((a: any) =>
      a && (a.teacherId === user.id || a.teacherUsername === user.username || a.teacher === user.username)
    )
    const seen = new Set<string>()
    const out: Array<{ key: string; courseId: string; sectionId: string; label: string }> = []
    my.forEach((a: any) => {
      const sid = String(a.sectionId || a.section || a.sectionUUID || a.section_id || a.sectionID || "")
      if (!sid) return
      const sec = secMap.get(sid)
      let cid = String((sec && (sec.courseId || sec.course?.id)) || a.courseId || a.course || a.courseUUID || a.course_id || a.courseID || "")
      if (!cid) return
      const course = courseMap.get(cid)
      const courseName = (course?.name || a.courseName || a.courseLabel || a.course_text || "").toString().trim()
      const sectionName = (sec?.name || a.sectionName || a.sectionLabel || "").toString().trim()
      const key = `${cid}-${sid}`
      if (seen.has(key)) return
      seen.add(key)
      if (!courseName || courseName.toLowerCase() === "curso" || !sectionName) return
      const label = `${courseName} ${sectionName}`
      out.push({ key, courseId: cid, sectionId: sid, label })
    })
    return out
  }, [effectiveAssignments, sections, courses, user])
  
  // Chips Asignaturas
  const subjectChips = useMemo(() => {
    if (!user || !sectionId) return [] as Array<{ key: string; label: string }>
    const list = (effectiveAssignments || []).filter((a: any) => {
      if (!(a && (a.teacherId === user.id || a.teacherUsername === user.username || a.teacher === user.username))) return false
      const secOk = String(a.sectionId || a.section || a.sectionUUID || a.section_id) === String(sectionId)
      return secOk
    })
    const nameById = new Map<string, string>()
    subjects.forEach((s: any) => { if (s && s.id) nameById.set(String(s.id), s.name || String(s.id)) })
    const seen = new Set<string>()
    const out: Array<{ key: string; label: string }> = []
    list.forEach((a: any) => {
      const sid = a.subjectId || a.subject || a.subjectUUID || a.subject_id
      const sname = a.subjectName || (sid ? nameById.get(String(sid)) : undefined)
      const key = String(sid || sname || "")
      const label = String(sname || sid || "")
      if (key && !seen.has(key)) { seen.add(key); out.push({ key, label }) }
    })
    return out
  }, [effectiveAssignments, sectionId, subjects, user])
  
  // Manejar selección de archivo
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setAnalysisResult(null)
      setError("")
    }
  }, [])
  
  // Analizar PDF con IA
  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError(translate('testsManualPDFRequired'))
      return
    }
    
    setAnalyzing(true)
    setError("")
    setAnalysisResult(null)
    setUploadProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)
      
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)
      
      const response = await fetch('/api/tests/analyze-pdf', {
        method: 'POST',
        body: formData
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      const result = await response.json()
      
      if (!result.success) {
        setError(result.error || translate('testsManualPDFError'))
        return
      }
      
      setAnalysisResult(result)
      
      // Auto-establecer tema si se detectó
      if (result.topic && !topic) {
        setTopic(result.topic)
      }
      
      // Ajustar pesos según tipos detectados
      const counts = result.counts
      const activeTypes = Object.entries(counts).filter(([_, count]) => (count as number) > 0)
      if (activeTypes.length > 0) {
        const equalWeight = Math.floor(100 / activeTypes.length)
        const newWeights = { tf: 0, mc: 0, ms: 0, des: 0 }
        activeTypes.forEach(([type]) => {
          newWeights[type as keyof typeof newWeights] = equalWeight
        })
        // Ajustar para que sume 100
        const sum = Object.values(newWeights).reduce((a, b) => a + b, 0)
        if (sum < 100 && activeTypes.length > 0) {
          newWeights[activeTypes[0][0] as keyof typeof newWeights] += (100 - sum)
        }
        setWeights(newWeights)
      }
      
    } catch (err: any) {
      console.error('[ManualTestBuilder] Error analyzing PDF:', err)
      setError(translate('testsManualPDFError'))
    } finally {
      setAnalyzing(false)
    }
  }, [file, language, topic, translate])
  
  // Verificar validez - solo requiere al menos un tipo seleccionado
  const isValid = useMemo(() => {
    return selectedTypes.size > 0 && !!analysisResult?.success && analysisResult.questions.length > 0
  }, [selectedTypes, analysisResult])
  
  // Toggle selección de tipo
  const toggleType = useCallback((type: 'tf' | 'mc' | 'ms' | 'des') => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }, [])
  
  // Crear prueba
  const handleCreateTest = useCallback(() => {
    if (!isValid || !analysisResult || !user) return
    
    const now = Date.now()
    const title = analysisResult.title || topic || 'Prueba Manual'
    
    // Resolver nombre de asignatura
    const subjName = (() => {
      const found = subjects.find((x: any) => String(x?.id) === String(subjectId))
      if (found?.name) return found.name
      const byName = subjects.find((x: any) => String(x?.name) === String(subjectId))
      return byName?.name || subjectId || ''
    })()
    
    // Filtrar preguntas por tipos seleccionados
    const filteredQuestions = analysisResult.questions.filter(q => selectedTypes.has(q.type))
    
    // Recalcular counts basado en tipos seleccionados
    const newCounts = { tf: 0, mc: 0, ms: 0, des: 0 }
    filteredQuestions.forEach(q => {
      newCounts[q.type]++
    })
    
    // Transformar preguntas al formato esperado
    const questions = filteredQuestions.map((q, idx) => {
      const base: any = {
        id: `${q.type}_${now}_${idx}`,
        type: q.type,
        text: q.text
      }
      
      switch (q.type) {
        case 'tf':
          base.answer = q.answer ?? false
          break
        case 'mc':
          base.options = q.options || []
          base.correctIndex = q.correctIndex ?? 0
          break
        case 'ms':
          base.options = q.optionsWithCorrect || []
          break
        case 'des':
          base.prompt = q.prompt || q.text
          break
      }
      
      return base
    })
    
    const test = {
      id: `test_manual_${now}`,
      title,
      description: `Prueba creada desde PDF: ${file?.name || 'documento'}`,
      createdAt: now,
      courseId: courseId || '',
      sectionId: sectionId || '',
      subjectId: subjectId || '',
      subjectName: subjName,
      topic: topic || analysisResult.topic || title,
      counts: newCounts,
      weights,
      totalPoints,
      total: filteredQuestions.length,
      questions,
      status: 'ready' as const,
      progress: 100,
      ownerId: user.id,
      ownerUsername: user.username,
      isManual: true, // Marcar como creada manualmente
      sourceFile: file?.name
    }
    
    onTestCreated?.(test)
    
    // Reset form
    setFile(null)
    setAnalysisResult(null)
    setTopic("")
    setCourseId("")
    setSectionId("")
    setSubjectId("")
    setSelectedTypes(new Set())
    setWeights({ tf: 25, mc: 25, ms: 25, des: 25 })
    setTotalPoints(100)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [isValid, analysisResult, user, subjects, subjectId, topic, file, courseId, sectionId, weights, totalPoints, onTestCreated, selectedTypes])
  
  // Renderizar pregunta en preview
  const renderQuestionPreview = (q: AnalyzedQuestion, idx: number) => {
    const typeLabels: Record<string, string> = {
      tf: translate('testsTF'),
      mc: translate('testsMC'),
      ms: translate('testsMS'),
      des: translate('testsDES')
    }
    
    return (
      <div key={q.id} className="border rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-200">
            {idx + 1}. {typeLabels[q.type] || q.type.toUpperCase()}
          </span>
        </div>
        <p className="text-sm mb-2">{q.text}</p>
        
        {q.type === 'tf' && (
          <div className="text-xs text-muted-foreground">
            {language === 'es' ? 'Respuesta:' : 'Answer:'} {q.answer ? (language === 'es' ? 'Verdadero' : 'True') : (language === 'es' ? 'Falso' : 'False')}
          </div>
        )}
        
        {q.type === 'mc' && q.options && (
          <div className="space-y-1">
            {q.options.map((opt, optIdx) => (
              <div key={optIdx} className={cn(
                "text-xs px-2 py-1 rounded",
                optIdx === q.correctIndex ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" : "bg-muted"
              )}>
                {String.fromCharCode(65 + optIdx)}. {opt}
              </div>
            ))}
          </div>
        )}
        
        {q.type === 'ms' && q.optionsWithCorrect && (
          <div className="space-y-1">
            {q.optionsWithCorrect.map((opt, optIdx) => (
              <div key={optIdx} className={cn(
                "text-xs px-2 py-1 rounded",
                opt.correct ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" : "bg-muted"
              )}>
                {String.fromCharCode(65 + optIdx)}. {opt.text} {opt.correct && '✓'}
              </div>
            ))}
          </div>
        )}
        
        {q.type === 'des' && (
          <div className="text-xs text-muted-foreground italic">
            {language === 'es' ? 'Pregunta de desarrollo' : 'Essay question'}
          </div>
        )}
      </div>
    )
  }

  // Obtener nombre de curso/sección seleccionados
  const selectedCourseSection = useMemo(() => {
    const chip = courseSectionChips.find(c => c.sectionId === sectionId)
    return chip?.label || ''
  }, [courseSectionChips, sectionId])

  const selectedSubjectName = useMemo(() => {
    const chip = subjectChips.find(s => s.key === subjectId)
    return chip?.label || ''
  }, [subjectChips, subjectId])

  // Calcular puntos por pregunta
  const perQuestionPoints = useMemo(() => {
    if (!analysisResult) return { tf: 0, mc: 0, ms: 0, des: 0 }
    const counts = analysisResult.counts
    const totalQ = (counts.tf || 0) + (counts.mc || 0) + (counts.ms || 0) + (counts.des || 0)
    const tp = totalPoints || totalQ

    const activeTypes = (['tf','mc','ms','des'] as const).filter(t => counts[t] > 0)
    if (activeTypes.length === 0) return { tf: 0, mc: 0, ms: 0, des: 0 }

    const sumActive = activeTypes.reduce((acc, t) => acc + (weights[t] || 0), 0)
    const normalized: Record<string, number> = { tf: 0, mc: 0, ms: 0, des: 0 }
    if (!sumActive) {
      const eq = 1 / activeTypes.length
      activeTypes.forEach(t => { normalized[t] = eq })
    } else {
      activeTypes.forEach(t => { normalized[t] = (weights[t] || 0) / sumActive })
    }

    const result: Record<string, number> = { tf: 0, mc: 0, ms: 0, des: 0 }
    activeTypes.forEach(t => {
      const c = counts[t] || 0
      result[t] = c > 0 ? (tp * normalized[t]) / c : 0
    })
    return result as { tf: number; mc: number; ms: number; des: number }
  }, [analysisResult, weights, totalPoints])

  const fmtPts = (n?: number) => {
    if (n == null || isNaN(n)) return ""
    const r = Math.round((n + Number.EPSILON) * 100) / 100
    if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r))
    return r.toFixed(1)
  }

  // Generar PDF para curso (sin respuestas)
  const handleDownloadPDFCourse = useCallback(async () => {
    if (!analysisResult?.questions?.length) return
    setGeneratingPDF('course')
    try {
      await new Promise(r => setTimeout(r, 50))
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      const maxWidth = pageWidth - margin * 2
      const lineH = 6
      let y = margin
      const letters = ['A','B','C','D','E','F']

      const ensureSpace = (h: number) => {
        if (y + h > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
      }

      // Header
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      const title = (analysisResult.title || topic || 'PRUEBA').toUpperCase()
      pdf.text(title, pageWidth / 2, y, { align: 'center' })
      y += 10

      pdf.setFontSize(12)
      pdf.text(`TEMA: ${topic || analysisResult.topic || '-'}`, margin, y)
      y += 6
      pdf.text(`CURSO: ${selectedCourseSection || '-'}`, margin, y)
      y += 6
      pdf.text(`ASIGNATURA: ${selectedSubjectName || '-'}`, margin, y)
      y += 6
      pdf.text(`PUNTAJE TOTAL: ${totalPoints} pts`, margin, y)
      y += 8
      pdf.setFont('helvetica', 'normal')
      pdf.text('NOMBRE DEL ESTUDIANTE: ______________________________', margin, y)
      y += 10
      pdf.line(margin, y, pageWidth - margin, y)
      y += 6

      // Preguntas
      analysisResult.questions.forEach((q, idx) => {
        const pts = perQuestionPoints[q.type] || 0
        const ptsLabel = pts ? ` (${fmtPts(pts)} pts)` : ''
        const header = `${idx + 1}. ${q.text || q.prompt}${ptsLabel}`
        const headerLines = pdf.splitTextToSize(header, maxWidth)
        
        let totalH = headerLines.length * lineH + 8
        if (q.type === 'mc' && q.options) totalH += q.options.length * lineH
        if (q.type === 'ms' && q.optionsWithCorrect) totalH += q.optionsWithCorrect.length * lineH
        if (q.type === 'des') totalH += 7 * (lineH + 2)

        ensureSpace(totalH)

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        headerLines.forEach((l: string) => { pdf.text(l, margin, y); y += lineH })
        y += 2

        pdf.setFont('helvetica', 'normal')
        if (q.type === 'tf') {
          pdf.text('V (    )     F (    )', margin + 5, y)
          y += lineH + 4
        } else if (q.type === 'mc' && q.options) {
          q.options.forEach((opt, optIdx) => {
            pdf.text(`(${letters[optIdx] || optIdx + 1}) ${opt}`, margin + 5, y)
            y += lineH
          })
          y += 4
        } else if (q.type === 'ms' && q.optionsWithCorrect) {
          q.optionsWithCorrect.forEach((opt, optIdx) => {
            pdf.rect(margin + 5, y - 3, 3, 3)
            pdf.text(`${letters[optIdx] || optIdx + 1}. ${opt.text}`, margin + 10, y)
            y += lineH
          })
          y += 4
        } else if (q.type === 'des') {
          for (let k = 0; k < 7; k++) {
            pdf.line(margin + 5, y, pageWidth - margin, y)
            y += lineH + 2
          }
        }
      })

      const filename = `prueba-${(topic || 'manual').replace(/[^a-zA-Z0-9]/g, '_')}-curso.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error('Error generando PDF curso:', err)
    } finally {
      setGeneratingPDF(null)
    }
  }, [analysisResult, topic, selectedCourseSection, selectedSubjectName, totalPoints, perQuestionPoints])

  // Generar PDF clave (con respuestas)
  const handleDownloadPDFKey = useCallback(async () => {
    if (!analysisResult?.questions?.length) return
    setGeneratingPDF('key')
    try {
      await new Promise(r => setTimeout(r, 50))
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      const maxWidth = pageWidth - margin * 2
      const lineH = 6
      let y = margin
      const letters = ['A','B','C','D','E','F']

      const ensureSpace = (h: number) => {
        if (y + h > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
      }

      // Header
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      const title = `${(analysisResult.title || topic || 'PRUEBA').toUpperCase()} — CLAVE`
      pdf.text(title, pageWidth / 2, y, { align: 'center' })
      y += 10

      pdf.setFontSize(12)
      pdf.text(`TEMA: ${topic || analysisResult.topic || '-'}`, margin, y)
      y += 6
      pdf.text(`CURSO: ${selectedCourseSection || '-'}`, margin, y)
      y += 6
      pdf.text(`ASIGNATURA: ${selectedSubjectName || '-'}`, margin, y)
      y += 6
      pdf.text(`PUNTAJE TOTAL: ${totalPoints} pts`, margin, y)
      y += 10
      pdf.line(margin, y, pageWidth - margin, y)
      y += 6

      // Preguntas con respuestas
      analysisResult.questions.forEach((q, idx) => {
        const pts = perQuestionPoints[q.type] || 0
        const ptsLabel = pts ? ` (${fmtPts(pts)} pts)` : ''
        const header = `${idx + 1}. ${q.text || q.prompt}${ptsLabel}`
        const headerLines = pdf.splitTextToSize(header, maxWidth)
        
        let totalH = headerLines.length * lineH + 12
        if (q.type === 'mc' && q.options) totalH += q.options.length * lineH
        if (q.type === 'ms' && q.optionsWithCorrect) totalH += q.optionsWithCorrect.length * lineH

        ensureSpace(totalH)

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        headerLines.forEach((l: string) => { pdf.text(l, margin, y); y += lineH })
        y += 2

        pdf.setFont('helvetica', 'normal')
        if (q.type === 'tf') {
          const ans = q.answer ? 'VERDADERO' : 'FALSO'
          pdf.setTextColor(0, 128, 0)
          pdf.text(`Respuesta: ${ans}`, margin + 5, y)
          pdf.setTextColor(0)
          y += lineH + 4
        } else if (q.type === 'mc' && q.options) {
          q.options.forEach((opt, optIdx) => {
            const isCorrect = optIdx === q.correctIndex
            if (isCorrect) {
              pdf.setTextColor(0, 128, 0)
              pdf.setFont('helvetica', 'bold')
            }
            pdf.text(`(${letters[optIdx] || optIdx + 1}) ${opt}${isCorrect ? ' ✓' : ''}`, margin + 5, y)
            pdf.setTextColor(0)
            pdf.setFont('helvetica', 'normal')
            y += lineH
          })
          y += 4
        } else if (q.type === 'ms' && q.optionsWithCorrect) {
          q.optionsWithCorrect.forEach((opt, optIdx) => {
            if (opt.correct) {
              pdf.setTextColor(0, 128, 0)
              pdf.setFont('helvetica', 'bold')
            }
            pdf.text(`${opt.correct ? '☑' : '☐'} ${letters[optIdx] || optIdx + 1}. ${opt.text}`, margin + 5, y)
            pdf.setTextColor(0)
            pdf.setFont('helvetica', 'normal')
            y += lineH
          })
          y += 4
        } else if (q.type === 'des') {
          pdf.setTextColor(100)
          pdf.setFontSize(10)
          pdf.text('(Pregunta de desarrollo - evaluar según rúbrica)', margin + 5, y)
          pdf.setTextColor(0)
          pdf.setFontSize(11)
          y += lineH + 4
        }
      })

      const filename = `prueba-${(topic || 'manual').replace(/[^a-zA-Z0-9]/g, '_')}-clave.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error('Error generando PDF clave:', err)
    } finally {
      setGeneratingPDF(null)
    }
  }, [analysisResult, topic, selectedCourseSection, selectedSubjectName, totalPoints, perQuestionPoints])
  
  return (
    <div className="space-y-4">
      {/* Hint sobre tipos soportados */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
        {translate('testsManualSupportedTypes')}
      </div>
      
      {/* Área de carga de archivo */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-fuchsia-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id="pdf-upload"
        />
        
        {!file ? (
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">{translate('testsManualSelectPDF')}</p>
            <p className="text-xs text-muted-foreground">{translate('testsManualNoFile')}</p>
          </label>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-fuchsia-600" />
            <div className="text-left">
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setAnalysisResult(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Botón Analizar */}
      {file && !analysisResult && (
        <div className="space-y-2">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {translate('testsManualAnalyzing')}
              </>
            ) : (
              translate('testsManualAnalyzeBtn')
            )}
          </Button>
          
          {/* Barra de progreso de subida */}
          {analyzing && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{language === 'es' ? 'Subiendo y analizando...' : 'Uploading and analyzing...'}</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-fuchsia-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {/* Resultado del análisis */}
      {analysisResult?.success && (
        <div className="space-y-4 border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{translate('testsManualAnalysisComplete')}</span>
          </div>
          
          {/* Resumen */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">{translate('testsManualDetectedQuestions')}:</span>
              <span className="ml-2 font-medium">{analysisResult.totalQuestions}</span>
            </div>
          </div>
          
          {/* Tema editable */}
          <div>
            <label className="block text-xs font-medium mb-1">
              {translate('testsTopicLabel')}
            </label>
            <input
              type="text"
              className="w-full rounded border bg-background p-2 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={language === 'es' ? 'Ej: Sumas y Restas' : 'E.g.: Addition and Subtraction'}
            />
          </div>
          
          {/* Desglose por tipo - clickeables para seleccionar */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {language === 'es' ? 'Selecciona los tipos de preguntas a incluir:' : 'Select question types to include:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {analysisResult.counts.tf > 0 && (
                <button
                  type="button"
                  onClick={() => toggleType('tf')}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer",
                    selectedTypes.has('tf')
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-blue-100 text-blue-800 border-transparent hover:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200"
                  )}
                >
                  {translate('testsTF')}: {analysisResult.counts.tf} {selectedTypes.has('tf') && '✓'}
                </button>
              )}
              {analysisResult.counts.mc > 0 && (
                <button
                  type="button"
                  onClick={() => toggleType('mc')}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer",
                    selectedTypes.has('mc')
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-purple-100 text-purple-800 border-transparent hover:border-purple-400 dark:bg-purple-900/30 dark:text-purple-200"
                  )}
                >
                  {translate('testsMC')}: {analysisResult.counts.mc} {selectedTypes.has('mc') && '✓'}
                </button>
              )}
              {analysisResult.counts.ms > 0 && (
                <button
                  type="button"
                  onClick={() => toggleType('ms')}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer",
                    selectedTypes.has('ms')
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-orange-100 text-orange-800 border-transparent hover:border-orange-400 dark:bg-orange-900/30 dark:text-orange-200"
                  )}
                >
                  {translate('testsMS')}: {analysisResult.counts.ms} {selectedTypes.has('ms') && '✓'}
                </button>
              )}
              {analysisResult.counts.des > 0 && (
                <button
                  type="button"
                  onClick={() => toggleType('des')}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer",
                    selectedTypes.has('des')
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-teal-100 text-teal-800 border-transparent hover:border-teal-400 dark:bg-teal-900/30 dark:text-teal-200"
                  )}
                >
                  {translate('testsDES')}: {analysisResult.counts.des} {selectedTypes.has('des') && '✓'}
                </button>
              )}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-700 dark:text-fuchsia-300 dark:hover:bg-fuchsia-900/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              {translate('testsManualPreview')}
            </Button>
            <Button
              onClick={handleCreateTest}
              disabled={!isValid}
              className={cn(
                isValid
                  ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Crear Prueba' : 'Create Test'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Modal de Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{translate('testsManualPreview')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {analysisResult?.title && (
              <h3 className="font-semibold mb-4">{analysisResult.title}</h3>
            )}
            {analysisResult?.questions.map((q, idx) => renderQuestionPreview(q, idx))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
