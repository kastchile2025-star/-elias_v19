// Colores soportados en el proyecto
export type AppColor = 'green' | 'blue' | 'yellow' | 'cyan' | 'purple' | 'orange' | 'red' | 'indigo' | 'teal' | 'rose' | 'emerald' | 'stone';

// Única fuente de verdad para el color de la tarjeta/sección de Asistencia
export const ATTENDANCE_COLOR: AppColor = 'indigo';

// Helpers con clases explícitas (evita clases dinámicas que Tailwind no detecte)
export const getHeaderBgClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'bg-green-50 dark:bg-green-900/20';
    case 'blue': return 'bg-blue-50 dark:bg-blue-900/20';
    case 'yellow': return 'bg-yellow-50 dark:bg-yellow-900/20';
    case 'cyan': return 'bg-cyan-50 dark:bg-cyan-900/20';
    case 'purple': return 'bg-purple-50 dark:bg-purple-900/20';
    case 'orange': return 'bg-orange-50 dark:bg-orange-900/20';
    case 'red': return 'bg-red-50 dark:bg-red-900/20';
    case 'indigo': return 'bg-indigo-50 dark:bg-indigo-900/20';
    case 'teal': return 'bg-teal-50 dark:bg-teal-900/20';
    case 'rose': return 'bg-rose-50 dark:bg-rose-900/20';
    case 'emerald': return 'bg-emerald-50 dark:bg-emerald-900/20';
  case 'stone': return 'bg-stone-50 dark:bg-stone-900/20';
  }
};

export const getHeaderBorderClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'border-l-4 border-green-400 dark:border-green-500';
    case 'blue': return 'border-l-4 border-blue-400 dark:border-blue-500';
    case 'yellow': return 'border-l-4 border-yellow-400 dark:border-yellow-500';
    case 'cyan': return 'border-l-4 border-cyan-400 dark:border-cyan-500';
    case 'purple': return 'border-l-4 border-purple-400 dark:border-purple-500';
    case 'orange': return 'border-l-4 border-orange-400 dark:border-orange-500';
    case 'red': return 'border-l-4 border-red-400 dark:border-red-500';
    case 'indigo': return 'border-l-4 border-indigo-400 dark:border-indigo-500';
    case 'teal': return 'border-l-4 border-teal-400 dark:border-teal-500';
    case 'rose': return 'border-l-4 border-rose-400 dark:border-rose-500';
    case 'emerald': return 'border-l-4 border-emerald-400 dark:border-emerald-500';
  case 'stone': return 'border-l-4 border-stone-400 dark:border-stone-500';
  }
};

export const getTitleTextClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'text-green-800 dark:text-green-200';
    case 'blue': return 'text-blue-800 dark:text-blue-200';
    case 'yellow': return 'text-yellow-800 dark:text-yellow-200';
    case 'cyan': return 'text-cyan-800 dark:text-cyan-200';
    case 'purple': return 'text-purple-800 dark:text-purple-200';
    case 'orange': return 'text-orange-800 dark:text-orange-200';
    case 'red': return 'text-red-800 dark:text-red-200';
  // En dark, usar blanco para máxima legibilidad sobre fondo índigo oscuro
  case 'indigo': return 'text-indigo-800 dark:text-white';
    case 'teal': return 'text-teal-800 dark:text-teal-200';
    case 'rose': return 'text-rose-800 dark:text-rose-200';
    case 'emerald': return 'text-emerald-800 dark:text-emerald-200';
  case 'stone': return 'text-stone-800 dark:text-stone-200';
  }
};

export const getIconTextClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'text-green-700 dark:text-green-300';
    case 'blue': return 'text-blue-700 dark:text-blue-300';
    case 'yellow': return 'text-yellow-700 dark:text-yellow-300';
    case 'cyan': return 'text-cyan-700 dark:text-cyan-300';
    case 'purple': return 'text-purple-700 dark:text-purple-300';
    case 'orange': return 'text-orange-700 dark:text-orange-300';
    case 'red': return 'text-red-700 dark:text-red-300';
  // En dark, igualar al título para máxima legibilidad
  case 'indigo': return 'text-indigo-700 dark:text-white';
    case 'teal': return 'text-teal-700 dark:text-teal-300';
    case 'rose': return 'text-rose-700 dark:text-rose-300';
    case 'emerald': return 'text-emerald-700 dark:text-emerald-300';
  case 'stone': return 'text-stone-700 dark:text-stone-300';
  }
};

export const getIconBgClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'bg-green-100 dark:bg-green-800/50';
    case 'blue': return 'bg-blue-100 dark:bg-blue-800/50';
    case 'yellow': return 'bg-yellow-100 dark:bg-yellow-800/50';
    case 'cyan': return 'bg-cyan-100 dark:bg-cyan-800/50';
    case 'purple': return 'bg-purple-100 dark:bg-purple-800/50';
    case 'orange': return 'bg-orange-100 dark:bg-orange-800/50';
    case 'red': return 'bg-red-100 dark:bg-red-800/50';
    case 'indigo': return 'bg-indigo-100 dark:bg-indigo-800/50';
    case 'teal': return 'bg-teal-100 dark:bg-teal-800/50';
    case 'rose': return 'bg-rose-100 dark:bg-rose-800/50';
    case 'emerald': return 'bg-emerald-100 dark:bg-emerald-800/50';
  case 'stone': return 'bg-stone-100 dark:bg-stone-800/50';
  }
};

export const getBodyTextClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'text-green-900 dark:text-green-100';
    case 'blue': return 'text-blue-900 dark:text-blue-100';
    case 'yellow': return 'text-yellow-900 dark:text-yellow-100';
    case 'cyan': return 'text-cyan-900 dark:text-cyan-100';
    case 'purple': return 'text-purple-900 dark:text-purple-100';
    case 'orange': return 'text-orange-900 dark:text-orange-100';
    case 'red': return 'text-red-900 dark:text-red-100';
    case 'indigo': return 'text-indigo-900 dark:text-indigo-100';
    case 'teal': return 'text-teal-900 dark:text-teal-100';
    case 'rose': return 'text-rose-900 dark:text-rose-100';
    case 'emerald': return 'text-emerald-900 dark:text-emerald-100';
  case 'stone': return 'text-stone-900 dark:text-stone-100';
  }
};

export const getBadgeBgClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'bg-green-600 text-white';
    case 'blue': return 'bg-blue-600 text-white';
    case 'yellow': return 'bg-yellow-600 text-white';
    case 'cyan': return 'bg-cyan-600 text-white';
    case 'purple': return 'bg-purple-600 text-white';
    case 'orange': return 'bg-orange-600 text-white';
    case 'red': return 'bg-red-600 text-white';
    case 'indigo': return 'bg-indigo-600 text-white';
    case 'teal': return 'bg-teal-600 text-white';
    case 'rose': return 'bg-rose-600 text-white';
    case 'emerald': return 'bg-emerald-600 text-white';
  case 'stone': return 'bg-stone-700 text-white';
  }
};

export const getLinkTextClass = (color: AppColor) => {
  switch (color) {
    case 'green': return 'text-green-700 dark:text-green-300';
    case 'blue': return 'text-blue-700 dark:text-blue-300';
    case 'yellow': return 'text-yellow-700 dark:text-yellow-300';
    case 'cyan': return 'text-cyan-700 dark:text-cyan-300';
    case 'purple': return 'text-purple-700 dark:text-purple-300';
    case 'orange': return 'text-orange-700 dark:text-orange-300';
    case 'red': return 'text-red-700 dark:text-red-300';
    case 'indigo': return 'text-indigo-700 dark:text-indigo-300';
    case 'teal': return 'text-teal-700 dark:text-teal-300';
    case 'rose': return 'text-rose-700 dark:text-rose-300';
    case 'emerald': return 'text-emerald-700 dark:text-emerald-300';
  case 'stone': return 'text-stone-700 dark:text-stone-300';
  }
};
