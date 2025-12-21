
export interface CourseData {
  [courseName: string]: {
    es: string[];
    en: string[];
  };
}

export interface RawFaqItem {
  id: string;
  qKey: string;
  aKey: string;
}

export interface UserProfile {
  name: string;
  roleKey: string; // Cambio de levelKey a roleKey para "Estudiante"/"Profesor"
  activeCourses: string[]; // Cambio de activeCoursesKey a array de cursos
  subjects: Array<{ tag: string; nameKey: string; colorClass: string }>; // e.g. { tag: "MAT", nameKey: "subjectMath" }
  evaluationsCompleted: number;
}

export interface SubjectProgress {
  nameKey: string;
  progress: number; // 0-100
  colorClass: string; // e.g. "bg-blue-500"
  label?: string; // Nombre exacto de la asignatura (cuando aplica)
}

export interface EvaluationHistoryItem {
  id: string; // Unique ID, e.g., ISO timestamp of completion
  date: string; // Formatted date and time string
  courseName: string; // Added to store the course name
  bookTitle: string;
  topic: string;
  score: number; // Number of correct answers
  totalQuestions: number; // Total number of questions in the evaluation
}

export interface Course {
  id: string;
  name: string;
  // color?: string; // Optional: for UI theming per course
  // teacherIds?: string[]; // Optional: quick link to teachers of this course
}
