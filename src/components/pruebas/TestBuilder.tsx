"use client"

import React, { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

type Course = { id: string; name: string }
type Section = { id: string; name: string; courseId?: string; course?: { id?: string } }
type Subject = { id: string; name: string }

type Props = {
  value?: any
  onChange?: (v: any) => void
  onCreate?: () => void
  mode?: 'create' | 'edit'
}

const COURSES_KEY = "smart-student-courses"
const SECTIONS_KEY = "smart-student-sections"
const SUBJECTS_KEY = "smart-student-subjects"
const TEACHER_ASSIGNMENTS_KEY = "smart-student-teacher-assignments"
const USERS_KEY = "smart-student-users"
const ADMIN_COURSES_KEY = "smart-student-admin-courses"
const ADMIN_SECTIONS_KEY = "smart-student-admin-sections"
const TASKS_KEY = "smart-student-tasks"

export default function TestBuilder({ value, onChange, onCreate, mode = 'create' }: Props) {
  const { user } = useAuth() as any
  const { translate } = useLanguage()
  const [courses, setCourses] = useState<Course[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  const [courseId, setCourseId] = useState<string>(value?.courseId || "")
  const [sectionId, setSectionId] = useState<string>(value?.sectionId || "")
  const [subjectId, setSubjectId] = useState<string>(value?.subjectId || "")
  const [topic, setTopic] = useState<string>(value?.topic || "")
  const [counts, setCounts] = useState<{ tf: number; mc: number; ms: number; des: number }>(
    value?.counts || { tf: 5, mc: 5, ms: 5, des: 1 }
  )
  const [weights, setWeights] = useState<{ tf: number; mc: number; ms: number; des: number }>(
    value?.weights || { tf: 25, mc: 25, ms: 25, des: 25 }
  )
  const [totalPoints, setTotalPoints] = useState<number>(
    typeof value?.totalPoints === 'number' ? value.totalPoints : 100
  )

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
      console.error("[TestBuilder] Error cargando datos locales", e)
    }
  }, [])

  // Escuchar cambios en asignaciones para reaccionar en vivo desde Admin
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key) return
  if ([TEACHER_ASSIGNMENTS_KEY, COURSES_KEY, SECTIONS_KEY, SUBJECTS_KEY, ADMIN_COURSES_KEY, ADMIN_SECTIONS_KEY, USERS_KEY, TASKS_KEY].includes(e.key)) {
        try {
          if (e.key === TEACHER_ASSIGNMENTS_KEY) setTeacherAssignments(JSON.parse(e.newValue || "[]"))
      if (e.key === USERS_KEY) setAllUsers(JSON.parse(e.newValue || "[]"))
      if (e.key === TASKS_KEY) setTasks(JSON.parse(e.newValue || "[]"))
          if (e.key === COURSES_KEY || e.key === ADMIN_COURSES_KEY) {
            const csBase = JSON.parse(localStorage.getItem(COURSES_KEY) || "[]")
            const csAdmin = JSON.parse(localStorage.getItem(ADMIN_COURSES_KEY) || "[]")
            setCourses([...(Array.isArray(csAdmin) ? csAdmin : []), ...(Array.isArray(csBase) ? csBase : [])])
          }
          if (e.key === SECTIONS_KEY || e.key === ADMIN_SECTIONS_KEY) {
            const ssBase = JSON.parse(localStorage.getItem(SECTIONS_KEY) || "[]")
            const ssAdmin = JSON.parse(localStorage.getItem(ADMIN_SECTIONS_KEY) || "[]")
            setSections([...(Array.isArray(ssAdmin) ? ssAdmin : []), ...(Array.isArray(ssBase) ? ssBase : [])])
          }
          if (e.key === SUBJECTS_KEY) setSubjects(JSON.parse(e.newValue || "[]"))
        } catch {}
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  // Construir asignaciones efectivas: usa teacher-assignments o, si no existen, deriva desde users.teachingAssignments
  const effectiveAssignments = useMemo(() => {
    const list: any[] = []
    const push = (a: any) => { if (a) list.push(a) }

    // Fuente 1: asignaciones explícitas del profesor
    if (Array.isArray(teacherAssignments) && teacherAssignments.length > 0) {
      teacherAssignments.forEach(push)
    }

  // Fuente 2: teachingAssignments dentro de users (por nombre de curso -> id, y sección por curso)
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

  // Fuente 3: derivar desde tareas creadas por el profesor (dinámico, sin hardcode)
  if (user?.role === 'teacher' && Array.isArray(tasks) && tasks.length > 0) {
      const mine = tasks.filter((t: any) =>
        t && (
          t.assignedBy === user.username ||
          t.assignedById === user.id ||
          t.teacherUsername === user.username ||
          t.teacherId === user.id
        )
      )

      mine.forEach((t: any) => {
        const composite: string | undefined = t?.courseSectionId || t?.course
        let courseId: string | undefined
        let sectionId: string | undefined
        if (typeof composite === 'string' && composite.includes('-')) {
          const [cid, sid] = composite.split('-')
          courseId = cid && String(cid)
          sectionId = sid && String(sid)
        }
        courseId = String(t?.courseId || courseId || '') || undefined
        sectionId = String(t?.sectionId || sectionId || '') || undefined
        if (!sectionId) return
        const subjectId = t?.subjectId || t?.subject || t?.subjectUUID || undefined
        const subjectName = t?.subjectName || undefined
        push({
          teacherId: user.id,
          teacherUsername: user.username,
          courseId,
          sectionId,
          subjectId,
          subjectName,
        })
      })
    }

    // Únicos por combinación relevante
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
  }, [teacherAssignments, allUsers, user?.id, user?.username, user?.role, subjects, courses, sections, tasks])

  // Chips Curso (Sección) únicos
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
  // Evitar chips placeholders: requerir nombre de curso y sección válidos, y no permitir "Curso" solo
  if (!courseName || courseName.toLowerCase() === "curso" || !sectionName) return
  const label = `${courseName} ${sectionName}`
  out.push({ key, courseId: cid, sectionId: sid, label })
    })
    return out
  }, [effectiveAssignments, sections, courses, user])

  // Opciones reales de Curso (Sección) para el profesor logueado
  const courseSectionOptions = useMemo(() => {
    if (!user) return [] as Array<{ courseId: string; sectionId: string; label: string }>
    const my = (effectiveAssignments || []).filter((a: any) =>
      a && (a.teacherId === user.id || a.teacherUsername === user.username || a.teacher === user.username)
    )
    const secMap = new Map<string, Section>()
    sections.forEach((s: any) => { if (s && s.id) secMap.set(String(s.id), s) })
    const courseMap = new Map<string, Course>()
    courses.forEach((c: any) => { if (c && c.id) courseMap.set(String(c.id), c) })
    const seen = new Set<string>()
    const out: Array<{ courseId: string; sectionId: string; label: string }> = []
    my.forEach((a: any) => {
      const sid = String(a.sectionId || a.section || a.sectionUUID || a.section_id || a.sectionID || "")
      if (!sid || seen.has(sid)) return
      seen.add(sid)
      const sec = secMap.get(sid)
      // Buscar courseId desde varias fuentes
      let cid = String(
        (sec && (sec.courseId || sec.course?.id)) ||
        a.courseId || a.course || a.courseUUID || a.course_id || a.courseID ||
        ""
      )
      const course = cid ? courseMap.get(cid) : undefined
      const courseName = (course?.name || a.courseName || a.courseLabel || a.course_text || "Curso").toString()
      const sectionName = (sec?.name || a.sectionName || a.sectionLabel || "Sección").toString()
      // Si no tenemos courseId pero sí la sección, intentar backfill desde sec
      if (!cid && sec && (sec as any).courseId) cid = String((sec as any).courseId)
      out.push({ courseId: cid, sectionId: sid, label: `${courseName} Sección ${sectionName}` })
    })
    // console.debug('[TestBuilder] courseSectionOptions', out)
    return out
  }, [effectiveAssignments, sections, courses, user])

  // Resolver ID real del curso seleccionado (puede venir como nombre)
  const selectedCourseId = useMemo(() => {
    if (!courseId) return ""
    // Si ya es un id válido presente
    const byId = (courses as any[]).find((c) => String(c?.id) === String(courseId))
    if (byId?.id) return String(byId.id)
    // Buscar por nombre
    const byName = (courses as any[]).find((c) => String(c?.name) === String(courseId))
    return byName?.id ? String(byName.id) : String(courseId)
  }, [courseId, courses])

  // Eliminado: Sección separada (se usa Curso+Sección en un solo chip)

  const total = counts.tf + counts.mc + counts.ms + counts.des

  // Asignaturas dinámicas: SOLO después de seleccionar curso-sección
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
    const out: Array<{ key: string; label: string } > = []
    list.forEach((a: any) => {
      const sid = a.subjectId || a.subject || a.subjectUUID || a.subject_id
      const sname = a.subjectName || (sid ? nameById.get(String(sid)) : undefined)
      const key = String(sid || sname || "")
      const label = String(sname || sid || "")
      if (key && !seen.has(key)) { seen.add(key); out.push({ key, label }) }
    })
    return out
  }, [effectiveAssignments, sectionId, selectedCourseId, subjects, user])

  useEffect(() => {
    // Propagar cambios al padre cuando cambian campos del builder
    onChange?.({ courseId, sectionId, subjectId, topic, counts, total, weights, totalPoints })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, sectionId, subjectId, topic, counts, total, weights, totalPoints])

  // Reset suave cuando el padre manda un objeto vacío (tras crear prueba)
  useEffect(() => {
    if (value && Object.keys(value).length === 0) {
      setCourseId("")
      setSectionId("")
      setSubjectId("")
      setTopic("")
      setCounts({ tf: 5, mc: 5, ms: 5, des: 1 })
  setWeights({ tf: 25, mc: 25, ms: 25, des: 25 })
  setTotalPoints(100)
    }
  }, [value])

  const inc = (k: keyof typeof counts) => setCounts((c) => ({ ...c, [k]: c[k] + 1 }))
  const dec = (k: keyof typeof counts) => setCounts((c) => {
    const next = Math.max(0, c[k] - 1)
    const updated = { ...c, [k]: next }
    if (next === 0) {
      setWeights((w) => ({ ...w, [k]: 0 }))
    }
    return updated
  })

  const isValidBase = !!sectionId && !!subjectId && !!topic.trim() && total > 0
  const active = {
    tf: counts.tf > 0,
    mc: counts.mc > 0,
    ms: counts.ms > 0,
    des: counts.des > 0,
  }
  const sumWeightsAll = weights.tf + weights.mc + weights.ms + weights.des
  const sumWeightsActive = (active.tf ? weights.tf : 0) + (active.mc ? weights.mc : 0) + (active.ms ? weights.ms : 0) + (active.des ? weights.des : 0)
  const weightsDen = Math.max(1, sumWeightsActive)
  const perTypePoints = {
    tf: Math.round(((active.tf ? weights.tf : 0) / weightsDen) * totalPoints),
    mc: Math.round(((active.mc ? weights.mc : 0) / weightsDen) * totalPoints),
    ms: Math.round(((active.ms ? weights.ms : 0) / weightsDen) * totalPoints),
    des: Math.round(((active.des ? weights.des : 0) / weightsDen) * totalPoints),
  }
  const perQuestion = {
    tf: counts.tf > 0 ? +(perTypePoints.tf / counts.tf).toFixed(2) : 0,
    mc: counts.mc > 0 ? +(perTypePoints.mc / counts.mc).toFixed(2) : 0,
    ms: counts.ms > 0 ? +(perTypePoints.ms / counts.ms).toFixed(2) : 0,
    des: counts.des > 0 ? +(perTypePoints.des / counts.des).toFixed(2) : 0,
  }
  const isWeightsOk = sumWeightsActive === 100
  const isValid = isValidBase && isWeightsOk

  return (
    <div className="space-y-4">
      {/* Curso (Sección): badges por curso-sección asignado */}
      {/* Distribución estimada de puntaje */}
      <div className="rounded border p-3 text-xs">
        <div className="font-medium mb-1">{translate('testsPointsDistribution') || 'Distribución de puntaje (estimada)'}</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>TF: {perTypePoints.tf} pts {counts.tf > 0 ? `(≈ ${perQuestion.tf} c/u)` : ''}</div>
          <div>MC: {perTypePoints.mc} pts {counts.mc > 0 ? `(≈ ${perQuestion.mc} c/u)` : ''}</div>
          <div>MS: {perTypePoints.ms} pts {counts.ms > 0 ? `(≈ ${perQuestion.ms} c/u)` : ''}</div>
          <div>DES: {perTypePoints.des} pts {counts.des > 0 ? `(≈ ${perQuestion.des} c/u)` : ''}</div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium">{translate('testsCourseLabel')}</label>
        <div className="flex flex-wrap gap-2">
          {courseSectionChips.map((c) => {
            const selected = String(sectionId) === String(c.sectionId)
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => { setCourseId(String(c.courseId)); setSectionId(String(c.sectionId)); setSubjectId("") }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs border transition-colors",
                  selected
                    ? "bg-fuchsia-600 text-white border-fuchsia-500"
                    : "bg-muted text-foreground/80 border-transparent hover:bg-muted/80"
                )}
                title={c.label}
              >
                {c.label}
              </button>
            )
          })}
          {courseSectionChips.length === 0 && (
            <span className="text-xs text-muted-foreground">{translate('testsNoCourses')}</span>
          )}
        </div>
      </div>

      {/* Asignatura como chips dependientes de sección o curso */}
      <div className="space-y-2">
        <label className="block text-xs font-medium">{translate('testsSubjectLabel')}</label>
        <div className="flex flex-wrap gap-2">
          {sectionId === "" && (
            <span className="text-xs text-muted-foreground">{translate('testsSelectCourseOrSectionHint')}</span>
          )}
          {sectionId !== "" && subjectChips.map((s) => {
            const selected = String(subjectId) === String(s.key)
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSubjectId(String(s.key))}
                className={cn(
                  "px-3 py-1 rounded-full text-xs border transition-colors",
                  selected
                    ? "bg-fuchsia-600 text-white border-fuchsia-500"
                    : "bg-muted text-foreground/80 border-transparent hover:bg-muted/80"
                )}
                title={s.label}
              >
                {s.label}
              </button>
            )
          })}
          {sectionId && subjectChips.length === 0 && (
            <span className="text-xs text-muted-foreground">{translate('testsNoSubjectsForSection')}</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">{translate('testsTopicLabel')}</label>
        <input
          className="w-full rounded border bg-background p-2 text-sm"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={translate('testsTopicPlaceholder')}
        />
      </div>

      <div>
    <label className="block text-xs font-medium mb-2">{translate('testsTypesLabel')}</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {([
      { key: "tf", label: translate('testsTF') },
      { key: "mc", label: translate('testsMC') },
      { key: "ms", label: translate('testsMS') },
      { key: "des", label: translate('testsDES') },
          ] as const).map(({ key, label }) => (
            <div key={key} className="rounded border p-3">
              <p className="text-sm font-medium mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => dec(key)} className="rounded bg-muted px-2 py-1 text-sm">-</button>
                <input
                  type="number"
                  min={0}
                  value={counts[key]}
                  onChange={(e) => setCounts((c) => ({ ...c, [key]: Math.max(0, Number(e.target.value || 0)) }))}
                  className="w-16 rounded border bg-background p-1 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => inc(key)}
                  className="rounded border border-fuchsia-200 bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-600 hover:text-white dark:border-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-200 transition-colors px-2 py-1 text-sm"
                >
                  +
                </button>
              </div>
              {/* Ponderación por tipo (%) */}
        <div className="mt-3 space-y-1">
                <label className="block text-xs text-muted-foreground">% {translate('testsWeightPercent') || 'Porcentaje'}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
          value={weights[key]}
          onChange={(e) => setWeights((w) => ({ ...w, [key]: Math.max(0, Math.min(100, Number(e.target.value || 0))) }))}
          className="w-20 rounded border bg-background p-1 text-center text-xs"
          disabled={counts[key] === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de ponderaciones y puntaje total */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium">{translate('testsWeightsLabel') || 'Ponderación por tipo (%)'}</div>
          <div>
            TF {(active.tf ? weights.tf : 0)}% · MC {(active.mc ? weights.mc : 0)}% · MS {(active.ms ? weights.ms : 0)}% · DES {(active.des ? weights.des : 0)}%
          </div>
          <div>
            <span className={isWeightsOk ? '' : 'text-red-500'}>
              {translate('testsWeightsSum', { sum: String(sumWeightsActive) }) || `Suma: ${sumWeightsActive}%`}
              {!isWeightsOk && ' - Debe ser 100%'}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{translate('testsTotalPointsLabel') || 'Puntaje total'}</label>
          <input
            type="number"
            min={1}
            step={1}
            className="w-28 rounded border bg-background p-2 text-sm"
            value={totalPoints}
            onChange={(e) => setTotalPoints(Math.max(1, Number(e.target.value || 0)))}
          />
        </div>
      </div>

      {mode === 'create' && (
        <div className="flex items-center justify-between">
          <p className="text-sm">{translate('testsTotal')}: <span className="font-semibold">{total}</span></p>
          <button
            type="button"
            onClick={onCreate}
            disabled={!isValid}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium border transition-colors",
              isValid
                ? "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-600 hover:text-white dark:border-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-200"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {translate('cardTestsBtn')}
          </button>
        </div>
      )}
    </div>
  )
}

// Sin fallback hardcodeado: las asignaturas provienen del módulo Admin (localStorage)
