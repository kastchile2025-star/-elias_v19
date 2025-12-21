// Utilidad: generar datos demo para la pestaña de Estadísticas de profesor
// Crea tareas, entregas y asistencia de forma determinística (semilla por usuario+semana)
// Escribe en localStorage solo si no hay datos previos del profesor o si se fuerza explícitamente.

type RNG = () => number;

function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function sfc32(a: number, b: number, c: number, d: number): RNG {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function seeded(username: string, salt: string): RNG {
  const [a, b, c, d] = cyrb128(`${username}::${salt}`);
  return sfc32(a, b, c, d);
}

function pick<T>(rnd: RNG, arr: T[]): T { return arr[Math.floor(rnd() * arr.length)]; }
function between(rnd: RNG, min: number, max: number): number { return Math.floor(rnd() * (max - min + 1)) + min; }

function days(n: number) { return n * 24 * 60 * 60 * 1000; }

function read<T = any>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function write(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function getWeekSalt(ts: number): string {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  // ISO week number approximation
  const jan1 = new Date(Date.UTC(year, 0, 1)).getTime();
  const week = Math.floor((ts - jan1) / days(7));
  return `${year}-W${week}`;
}

export interface DemoOptions {
  horizonDays?: number; // rango hacia atrás
  force?: boolean;      // forzar generación aunque existan datos
}

export function ensureDemoTeacherData(username?: string, opts: DemoOptions = {}) {
  if (typeof window === 'undefined') return; // SSR guard
  if (!username) return;

  const { horizonDays = 90, force = false } = opts;

  // Evitar duplicar: si ya hay datos del profesor, salimos (a menos que force)
  const tasks: any[] = read('smart-student-tasks', []);
  const subs: any[] = read('smart-student-submissions', []);
  const att: any[] = read('smart-student-attendance', []);
  const hasTeacherData = tasks.some(t => t.teacherUsername === username) ||
                         subs.some(s => (s.teacherUsername === username) || (!!s.taskTeacherUsername && s.taskTeacherUsername === username)) ||
                         att.some(a => a.teacherUsername === username);
  const already = localStorage.getItem(`demo-stats-generated:${username}`);
  if (!force && (hasTeacherData || already)) return;

  const now = Date.now();
  const salt = getWeekSalt(now);
  const rnd = seeded(username, salt);

  // Catálogos
  const courseNames = [
    'Matemática I', 'Lengua y Literatura', 'Historia Universal', 'Ciencias Naturales', 'Física',
    'Química', 'Geografía', 'Inglés', 'Programación', 'Artes Visuales'
  ];
  const sections = ['A', 'B', 'C'];
  const studentPool = Array.from({ length: between(rnd, 24, 36) }, (_, i) => ({
    id: `stu-${i + 1}`, name: `Estudiante ${i + 1}`
  }));

  // Tareas
  const tasksToCreate = between(rnd, 10, 22);
  const newTasks: any[] = [];
  for (let i = 0; i < tasksToCreate; i++) {
    const daysAgo = between(rnd, 0, horizonDays);
    const createdAt = now - days(daysAgo) + between(rnd, -6, 6) * 60 * 60 * 1000;
    const isEval = rnd() < 0.35; // ~35% evaluaciones
    const course = pick(rnd, courseNames);
    const section = pick(rnd, sections);
    const id = `task-${username}-${salt}-${i}`;
    newTasks.push({
      id,
      taskId: id,
      title: `${isEval ? 'Evaluación' : 'Tarea'} ${i + 1} - ${course} ${section}`,
      type: isEval ? 'evaluation' : 'assignment',
      taskType: isEval ? 'evaluation' : 'assignment',
      teacherUsername: username,
      course,
      sectionId: section,
      createdAt,
    });
  }

  // Entregas por tarea
  const newSubs: any[] = [];
  newTasks.forEach((t) => {
    const nSubs = between(rnd, Math.floor(studentPool.length * 0.5), studentPool.length); // 50-100% entregan
    const sampled = [...studentPool].sort(() => rnd() - 0.5).slice(0, nSubs);
    sampled.forEach((stu, idx) => {
      const submittedAt = (t.createdAt || now) + days(between(rnd, 0, 10)) + between(rnd, -6, 10) * 60 * 60 * 1000;
      const graded = rnd() < 0.75; // 75% calificadas
      const score = graded ? Math.max(0, Math.min(100, Math.round( between(rnd, 35, 95) + (t.type === 'evaluation' ? between(rnd, -5, 5) : 0)))) : undefined;
      newSubs.push({
        id: `sub-${t.id}-${stu.id}`,
        taskId: t.id,
        taskTitle: t.title,
        teacherUsername: username,
        taskTeacherUsername: username,
        studentId: stu.id,
        studentName: stu.name,
        course: t.course,
        sectionId: t.sectionId,
        timestamp: submittedAt,
        isGraded: graded,
        grade: graded ? score : undefined,
        score: graded ? score : undefined,
      });
    });
  });

  // Asistencia: generar 3 sesiones por semana por curso/section
  const newAtt: any[] = [];
  const start = now - days(horizonDays);
  for (let d = start; d <= now; d += days(1)) {
    const weekday = new Date(d).getUTCDay(); // 0-6
    if (weekday === 0) continue; // omitir domingos
    // 50% de los días habrá sesiones (simples)
    if (rnd() < 0.5) continue;
    const sessions = between(rnd, 1, 3);
    for (let s = 0; s < sessions; s++) {
      const course = pick(rnd, courseNames);
      const section = pick(rnd, sections);
      const presentRatio = 0.85 + (rnd() - 0.5) * 0.1; // ~85% asistencia
      const presentCount = Math.round(studentPool.length * presentRatio);
      // Registramos a nivel de conteo por simplicidad: varias filas binarias
      for (let i = 0; i < studentPool.length; i++) {
        const present = i < presentCount ? true : rnd() < presentRatio;
        newAtt.push({
          id: `att-${d}-${s}-${i}-${username}`,
          teacherUsername: username,
          course,
          sectionId: section,
          status: present ? 'present' : 'absent',
          date: d + between(rnd, 8, 16) * 60 * 60 * 1000, // hora escolar
        });
      }
    }
  }

  // Persistencia no destructiva
  const mergedTasks = [...tasks, ...newTasks];
  const mergedSubs = [...subs, ...newSubs];
  const mergedAtt = [...att, ...newAtt];
  write('smart-student-tasks', mergedTasks);
  write('smart-student-submissions', mergedSubs);
  write('smart-student-attendance', mergedAtt);
  localStorage.setItem(`demo-stats-generated:${username}`, new Date().toISOString());
}
