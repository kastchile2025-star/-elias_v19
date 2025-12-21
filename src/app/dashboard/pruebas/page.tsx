"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Eye, ClipboardCheck, FileSearch, Trash2, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import TestViewDialog from "@/components/pruebas/TestViewDialog"
import TestReviewDialog from "@/components/pruebas/TestReviewDialog"
import TestBuilder from "@/components/pruebas/TestBuilder"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Tipos
export type TestItem = {
	id: string
	title: string
	description?: string
	createdAt: number
	courseId?: string
	sectionId?: string
	subjectId?: string
	subjectName?: string
	topic?: string
	counts?: { tf: number; mc: number; ms: number; des?: number }
	weights?: { tf: number; mc: number; ms: number; des: number }
	totalPoints?: number
	total?: number
	questions?: any[]
	status?: "generating" | "ready"
	progress?: number
	ownerId?: string
	ownerUsername?: string
}

const TESTS_BASE_KEY = "smart-student-tests"
const getTestsKey = (user?: { username?: string | null } | null): string => {
	const uname = user?.username ? String(user.username).trim().toLowerCase() : ""
	return uname ? `${TESTS_BASE_KEY}_${uname}` : TESTS_BASE_KEY
}
const getReviewKey = (id: string) => `smart-student-test-reviews_${id}`

export default function PruebasPage() {
	const { translate, language } = useLanguage()
	const { user } = useAuth()

	const [tests, setTests] = useState<TestItem[]>([])
	const [builder, setBuilder] = useState<any>({})

	const [selected, setSelected] = useState<TestItem | null>(null)
	const [openView, setOpenView] = useState(false)
	const [openReview, setOpenReview] = useState(false)

	// Confirmación de borrado
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<TestItem | null>(null)

	// Progreso simulado
	const progressIntervalRef = useRef<number | null>(null)

	// Datos base (solo para etiquetas mínimas)
	const [courses, setCourses] = useState<any[]>([])
	const [sections, setSections] = useState<any[]>([])
	const [subjects, setSubjects] = useState<any[]>([])

	// Cargar datasets y pruebas
	useEffect(() => {
		try {
			setCourses(JSON.parse(localStorage.getItem("smart-student-courses") || "[]"))
			setSections(JSON.parse(localStorage.getItem("smart-student-sections") || "[]"))
			setSubjects(JSON.parse(localStorage.getItem("smart-student-subjects") || "[]"))
		} catch {}

		try {
			const key = getTestsKey(user)
			const raw = localStorage.getItem(key)
			if (raw) {
				setTests(JSON.parse(raw))
			} else {
				const globalRaw = localStorage.getItem(TESTS_BASE_KEY)
				if (globalRaw) {
					const globalItems: TestItem[] = JSON.parse(globalRaw)
					const mine = user
						? globalItems.filter(
								(t) => (t.ownerId === (user as any).id) || (t.ownerUsername === (user as any).username)
							)
						: globalItems
					if (mine.length > 0) {
						localStorage.setItem(key, JSON.stringify(mine))
						setTests(mine)
					} else setTests([])
				} else setTests([])
			}
		} catch (e) {
			console.error("[Pruebas] Error cargando/migrando historial:", e)
		}

		const onStorage = (e: StorageEvent) => {
			if (!e.key) return
			const currentKey = getTestsKey(user)
			if (e.key === currentKey) setTests(JSON.parse(e.newValue || "[]"))
			if (e.key === "smart-student-courses") setCourses(JSON.parse(e.newValue || "[]"))
			if (e.key === "smart-student-sections") setSections(JSON.parse(e.newValue || "[]"))
			if (e.key === "smart-student-subjects") setSubjects(JSON.parse(e.newValue || "[]"))
		}
		window.addEventListener("storage", onStorage)
		return () => window.removeEventListener("storage", onStorage)
	}, [user?.username])

	const saveTests = (items: TestItem[]) => {
		const key = getTestsKey(user)
		setTests(items)
		localStorage.setItem(key, JSON.stringify(items))
		window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(items) }))
	}

	const patchTest = (id: string, patch: Partial<TestItem>) => {
		const key = getTestsKey(user)
		setTests((prev) => {
			const updated: TestItem[] = prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
			localStorage.setItem(key, JSON.stringify(updated))
			window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(updated) }))
			return updated
		})
	}

	// Progreso simulado si status === 'generating'
	useEffect(() => {
		const hasGenerating = tests.some((t) => t.status === "generating")
		if (hasGenerating && !progressIntervalRef.current) {
			progressIntervalRef.current = window.setInterval(() => {
				setTests((prev) => {
					const updated: TestItem[] = prev.map((t) => {
						if (t.status === "generating") {
							const inc = Math.floor(Math.random() * 8) + 3
							const next = Math.min(100, (t.progress || 0) + inc)
							return { ...t, progress: next, status: (next >= 100 ? "ready" : "generating") as "ready" | "generating" }
						}
						return t
					})
					const key = getTestsKey(user)
					localStorage.setItem(key, JSON.stringify(updated))
					window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(updated) }))
					if (!updated.some((x) => x.status === "generating") && progressIntervalRef.current) {
						window.clearInterval(progressIntervalRef.current)
						progressIntervalRef.current = null
					}
					return updated
				})
			}, 600) as unknown as number
		}
		if (!hasGenerating && progressIntervalRef.current) {
			window.clearInterval(progressIntervalRef.current)
			progressIntervalRef.current = null
		}
		return () => {
			if (progressIntervalRef.current) {
				window.clearInterval(progressIntervalRef.current)
				progressIntervalRef.current = null
			}
		}
	}, [tests])

	const handleOpenView = (t: TestItem) => { setSelected(t); setOpenView(true) }
	const handleOpenReview = (t?: TestItem) => { if (t) setSelected(t); setOpenReview(true) }

	const hasAnyReview = (id: string) => {
		try { const raw = localStorage.getItem(getReviewKey(id)); const arr = raw ? JSON.parse(raw) : []; return Array.isArray(arr) && arr.length > 0 } catch { return false }
	}

	// Generador local sencillo como fallback si falla el SSE
	const generateLocalQuestions = (topic: string, counts?: { tf?: number; mc?: number; ms?: number; des?: number }) => {
		const res: any[] = []
		if (!counts) return res
		const makeId = (p: string) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
		for (let i = 0; i < (counts.tf || 0); i++) {
			res.push({ id: makeId('tf'), type: 'tf', text: `(${i + 1}) ${topic}: enunciado verdadero/falso`, answer: Math.random() > 0.5 })
		}
		for (let i = 0; i < (counts.mc || 0); i++) {
			const opts = ['Opción A', 'Opción B', 'Opción C']
			const ci = Math.floor(Math.random() * (opts.length + 1))
			opts.splice(ci, 0, 'Respuesta correcta')
			res.push({ id: makeId('mc'), type: 'mc', text: `(${i + 1}) ${topic}: alternativa correcta`, options: opts, correctIndex: ci })
		}
		for (let i = 0; i < (counts.ms || 0); i++) {
			const arr = [
				{ text: 'Correcta 1', correct: true },
				{ text: 'Correcta 2', correct: true },
				{ text: 'Incorrecta 1', correct: false },
				{ text: 'Incorrecta 2', correct: false },
			]
			res.push({ id: makeId('ms'), type: 'ms', text: `(${i + 1}) ${topic}: seleccione todas las correctas`, options: arr.sort(() => Math.random() - 0.5) })
		}
		for (let i = 0; i < (counts.des || 0); i++) {
			res.push({ id: makeId('des'), type: 'des', prompt: `(${i + 1}) ${topic}: desarrolle una respuesta fundamentada` })
		}
		return res
	}

	// Crear prueba: guarda item en estado "generating" y dispara SSE; fallback a generador local.
	const handleCreate = () => {
		if (!user) { alert('Usuario no autenticado'); return }
		if (!builder?.courseId || !builder?.sectionId || !builder?.subjectId) { alert(translate('testsSelectAllBeforeCreate')); return }
		const now = Date.now()
		const title = (builder?.topic?.trim() || 'Prueba') as string
		// Resolver nombre de asignatura
		const subjName = (() => {
			try {
				const list = Array.isArray(subjects) ? subjects : JSON.parse(localStorage.getItem('smart-student-subjects') || '[]')
				let found = list.find((x: any) => String(x?.id) === String(builder?.subjectId))
				if (found?.name) return found.name
				found = list.find((x: any) => String(x?.name) === String(builder?.subjectId))
				return found?.name || (builder?.subjectName || String(builder?.subjectId))
			} catch { return builder?.subjectName || String(builder?.subjectId) }
		})()
		const item: TestItem = {
			id: `test_${now}`,
			title,
			description: '',
			createdAt: now,
			courseId: builder.courseId,
			sectionId: builder.sectionId,
			subjectId: builder.subjectId,
			subjectName: subjName,
			topic: builder.topic,
			counts: builder.counts,
			weights: builder.weights,
			totalPoints: builder.totalPoints,
			total: builder.total,
			questions: [],
			status: 'generating',
			progress: 0,
			ownerId: (user as any).id,
			ownerUsername: (user as any).username,
		}
		saveTests([item, ...tests])

		try {
			const id = item.id
			const countTF = Number(builder?.counts?.tf || 0)
			const countMC = Number(builder?.counts?.mc || 0)
			const countMS = Number(builder?.counts?.ms || 0)
			const questionCount = Math.max(1, countTF + countMC + countMS)
			const bookTitle = subjName || 'General'
			const topic = String(builder?.topic || title)
			const params = new URLSearchParams({ topic, bookTitle, language: language === 'en' ? 'en' : 'es', questionCount: String(questionCount), timeLimit: '120' })
			const es = new EventSource(`/api/tests/generate/stream?${params.toString()}`)
			es.addEventListener('progress', (evt: MessageEvent) => {
				try { const data = JSON.parse((evt as any).data); const p = Math.min(100, Number(data?.percent ?? 0)); patchTest(id, { progress: p }) } catch {}
			})
			es.addEventListener('done', (evt: MessageEvent) => {
				try {
					const payload = JSON.parse((evt as any).data)
					const aiOut = payload?.data
					const mapped: any[] = (aiOut?.questions || []).map((q: any, idx: number) => {
						const makeId = (p: string) => `${p}_${now}_${idx}`
						if (q.type === 'TRUE_FALSE') return { id: makeId('tf'), type: 'tf', text: q.questionText || q.text || '', answer: !!q.correctAnswer }
						if (q.type === 'MULTIPLE_CHOICE') {
							const options: string[] = q.options || q.choices || []
							const correctIndex = typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0
							return { id: makeId('mc'), type: 'mc', text: q.questionText || q.text || '', options, correctIndex }
						}
						if (q.type === 'MULTIPLE_SELECTION') {
							const options: string[] = q.options || []
							const corrects: number[] = Array.isArray(q.correctAnswerIndices) ? q.correctAnswerIndices : []
							return { id: makeId('ms'), type: 'ms', text: q.questionText || q.text || '', options: options.map((t, i) => ({ text: String(t), correct: corrects.includes(i) })) }
						}
						return { id: makeId('des'), type: 'des', prompt: q.questionText || q.text || '' }
					})
					const desCount = Number(builder?.counts?.des || 0)
					if (desCount > 0) {
						mapped.push(...generateLocalQuestions(topic, { tf: 0, mc: 0, ms: 0, des: desCount }))
					}
					patchTest(id, { questions: mapped, status: 'ready', progress: 100 })
				} finally { es.close() }
			})
			es.addEventListener('error', () => {
				es.close()
				const fallback = generateLocalQuestions(builder?.topic || title, builder?.counts)
				patchTest(item.id, { questions: fallback, status: 'ready', progress: 100 })
			})
		} catch (e) {
			console.error('[Pruebas] SSE error, usando generador local:', e)
			const fallback = generateLocalQuestions(builder?.topic || 'Tema', builder?.counts)
			patchTest(item.id, { questions: fallback, status: 'ready', progress: 100 })
		}
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold flex items-center gap-2">
						<span className="inline-flex items-center justify-center rounded-md border border-fuchsia-200 bg-fuchsia-100 text-fuchsia-800 dark:border-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-200 p-1">
							<ClipboardCheck className="size-5" />
						</span>
						<span>{translate('testsPageTitle')}</span>
					</h1>
					<p className="text-sm text-muted-foreground">{translate('testsPageSub')}</p>
				</div>
			</div>

			<div className="space-y-4">
				<div className="border rounded-lg p-4">
					<div className="mb-3 text-sm font-medium">{translate('testsCreateTitle')}</div>
					<div className="mb-2 text-xs text-muted-foreground">{translate('testsCreateHint')}</div>
					<TestBuilder value={builder} onChange={setBuilder} onCreate={handleCreate} />
				</div>
			</div>

			<div className="border rounded-lg">
				<div className="px-4 py-3">
					<div className="text-sm font-medium">{translate('testsHistoryTitle')}</div>
				</div>
				<div className="divide-y">
					{tests.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground">{translate('testsHistoryEmpty')}</div>
					) : (
							tests.map((t) => (
							<div key={t.id} className="p-4 flex items-center justify-between gap-4">
								<div className="min-w-0">
										<p className="font-medium truncate">{t.title}</p>
										{/* Curso (Curso + Sección) */}
										<p className="text-xs text-muted-foreground truncate">
											{(() => {
												const sec = sections.find((s:any) => String(s.id) === String(t.sectionId))
												const course = courses.find((c:any) => String(c.id) === String(t.courseId || sec?.courseId))
												const courseLabel = course?.name ? String(course.name) : ''
												const sectionLabel = sec?.name ? String(sec.name) : ''
												const label = [courseLabel, sectionLabel].filter(Boolean).join(' ')
												return label ? `Curso: ${label}` : ''
											})()}
										</p>
										{/* Asignatura */}
										<p className="text-xs text-muted-foreground truncate">
											{(() => {
												const subj = subjects.find((s:any) => String(s.id) === String(t.subjectId)) || subjects.find((s:any) => String(s.name) === String(t.subjectId))
												const name = subj?.name || t.subjectName || (t.subjectId ? String(t.subjectId) : '')
												return name ? `Asignatura: ${name}` : ''
											})()}
										</p>
										{/* Distribución de puntaje por tipo */}
										{(() => {
											const w = t.weights || { tf: 25, mc: 25, ms: 25, des: (t.counts?.des ?? 0) > 0 ? 25 : 0 }
											const parts = [
												`TF ${Number(w.tf ?? 0)}%`,
												`MC ${Number(w.mc ?? 0)}%`,
												`MS ${Number(w.ms ?? 0)}%`,
												`DES ${Number(w.des ?? 0)}%`,
											]
											return (
												<p className="text-xs text-muted-foreground truncate">{`Distribución: ${parts.join(' · ')}`}</p>
											)
										})()}

										{/* Totales */}
										<p className="text-xs text-muted-foreground truncate">
											{`Total de preguntas: ${t.questions?.length ?? ((t.counts?.tf||0)+(t.counts?.mc||0)+(t.counts?.ms||0)+(t.counts?.des||0))}`}
										</p>
										{typeof t.totalPoints === 'number' && (
											<p className="text-xs text-muted-foreground truncate">{`Puntaje total: ${t.totalPoints} pts`}</p>
										)}
								</div>
								<div className="flex items-center gap-2">
									{t.status === 'generating' ? (
										<div className="flex items-center gap-2 mr-1 min-w-[100px]">
											<div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded" aria-label={`${Math.min(100, t.progress || 0)}%`}>
												<div className="h-2 bg-fuchsia-600 rounded" style={{ width: `${Math.min(100, t.progress || 0)}%` }} />
											</div>
											<span className="text-xs text-muted-foreground w-8 text-right">{Math.min(100, t.progress || 0)}%</span>
										</div>
									) : (
										<span className="inline-flex items-center text-green-600 dark:text-green-400 mr-1" title={translate('testsReady')} aria-label={translate('testsReady')}>
											<CheckCircle className="size-4" />
										</span>
									)}

									<Button variant="outline" onClick={() => handleOpenView(t)} className="p-2 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-600 hover:text-white dark:border-fuchsia-800" aria-label={translate('testsBtnView')} title={translate('testsBtnView')}>
										<Eye className="size-4" />
									</Button>
									<Button variant="outline" onClick={() => handleOpenReview(t)} className="p-2 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-600 hover:text-white dark:border-fuchsia-800" aria-label={translate('testsReviewBtn')} title={translate('testsReviewBtn')}>
										<FileSearch className="size-4" />
									</Button>
									<Button variant="outline" onClick={() => { setDeleteTarget(t); setDeleteOpen(true) }} className="p-2 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-600 hover:text-white dark:border-fuchsia-800" aria-label={translate('testsBtnDelete')} title={translate('testsBtnDelete')}>
										<Trash2 className="size-4" />
									</Button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Modales */}
			<TestViewDialog open={openView} onOpenChange={setOpenView} test={selected || undefined} onReview={() => handleOpenReview()} />
			<TestReviewDialog open={openReview} onOpenChange={setOpenReview} test={selected || undefined} />

			{/* Popup de confirmación de borrado */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{language === 'en' ? 'Delete test?' : '¿Eliminar prueba?'}</AlertDialogTitle>
						<AlertDialogDescription>
							{language === 'en' ? 'This action will remove the test, its review history and associated grades. You can’t undo this.' : 'Esta acción eliminará la prueba, su historial de revisión y las notas asociadas. No se puede deshacer.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							className="border-fuchsia-200 text-fuchsia-800 hover:bg-fuchsia-600 hover:text-white dark:border-fuchsia-800 focus-visible:ring-fuchsia-500"
						>
							{language === 'en' ? 'Cancel' : 'Cancelar'}
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white focus-visible:ring-fuchsia-500"
							onClick={() => {
							if (!deleteTarget) return
							// Ejecutar borrado definitivo
							saveTests(tests.filter(x => x.id !== deleteTarget.id))
							try {
								const rkey = getReviewKey(deleteTarget.id)
								localStorage.setItem(rkey, '[]')
								window.dispatchEvent(new StorageEvent('storage', { key: rkey, newValue: '[]' }))
							} catch {}
							try {
								const { LocalStorageManager } = require('@/lib/education-utils')
								const saved = Number(localStorage.getItem('admin-selected-year') || '')
								const year = Number.isFinite(saved) && saved > 0 ? saved : new Date().getFullYear()
								const key = LocalStorageManager.keyForTestGrades(year)
								const raw = localStorage.getItem(key) || localStorage.getItem('smart-student-test-grades')
								if (raw) {
									const arr = JSON.parse(raw)
									const filtered = Array.isArray(arr) ? arr.filter((g: any) => g?.testId !== deleteTarget.id) : []
									LocalStorageManager.setTestGradesForYear(year, filtered, { preferSession: true })
									window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(filtered) }))
								}
							} catch {}
							setDeleteOpen(false)
							setDeleteTarget(null)
						}}>
							{language === 'en' ? 'Delete' : 'Eliminar'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}


