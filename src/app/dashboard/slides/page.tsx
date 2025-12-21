"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Trash2, FileSpreadsheet, X, Check, Play, Loader2, FileText, Presentation, Palette, Brain, Sparkles, Clock, Eye, Plus, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SlideItem = {
  id: string;
  title: string;
  createdAt: number;
  courseId?: string;
  sectionId?: string;
  subjectId?: string;
  subjectName?: string;
  topic?: string;
  slideCount?: number;
  ownerId?: string;
  ownerUsername?: string;
  shared?: boolean;
  slides?: SlideData[];
  designTheme?: string;
  designStyle?: string; // 'normal' | 'italic' | 'bold'
  designFontStyle?: string; // 'classic' | 'structured' | 'serif'
  useDesignOnly?: boolean;
};

type SlideData = {
  title: string;
  content: string[];
  imageUrl?: string; // data URL o URL remota pre-resuelta
  thumbUrl?: string; // miniatura temática pre-elegida para exportar/preview
  imageSearchQuery?: string;
};

type DesignTheme = {
  name: string;
  description: string;
  primary: string;
  bg: string; // clase tailwind opcional
  title: string; // clase tailwind opcional
  content: string; // clase tailwind opcional
  accent: string; // clase tailwind opcional
  gradient: string; // para chips de UI
  bgHex: string; // colores hex usados en PPTX
  titleHex: string;
  contentHex: string;
};

// Variantes de estilo (tipografía/estética) para la vista previa y exportación
type StyleVariant = {
  id: string;
  labelEs: string;
  labelEn: string;
  titleClasses: string; // clases tailwind para títulos en preview
  contentClasses: string; // clases tailwind para contenido en preview
  // Preferencias para exportación PPTX
  pptx: {
    titleFont: string; // no usado ahora (lo maneja "Fuente")
    contentFont: string; // no usado ahora (lo maneja "Fuente")
    titleUppercase?: boolean; // desactivado
    titleColorPrimary?: boolean; // desactivado
  }
};

const styleVariants: Record<string, StyleVariant> = {
  normal: {
    id: 'normal',
    labelEs: 'Normal',
    labelEn: 'Normal',
    titleClasses: '',
    contentClasses: '',
    pptx: { titleFont: '', contentFont: '' }
  },
  italic: {
    id: 'italic',
    labelEs: 'Cursiva',
    labelEn: 'Italic',
    titleClasses: 'italic',
    contentClasses: 'italic',
    pptx: { titleFont: '', contentFont: '' }
  },
  bold: {
    id: 'bold',
    labelEs: 'Negrita',
    labelEn: 'Bold',
    titleClasses: 'font-bold',
    contentClasses: 'font-bold',
    pptx: { titleFont: '', contentFont: '' }
  }
};

const getStyleVariant = (id?: string): StyleVariant => {
  const key = String(id || 'normal');
  // Compatibilidad con valores antiguos
  if (key === 'accents' || key === 'grid' || key === 'bubbles') return styleVariants.normal;
  return styleVariants[key] || styleVariants.normal;
};

// Helper: clases extra por estilo (preview)
const getStyleClasses = (styleId?: string, isTitle?: boolean) => {
  const v = getStyleVariant(styleId);
  return (isTitle ? v.titleClasses : v.contentClasses) || '';
};

// Helper: color inline por estilo (preview) - permite usar el primary para el título en ciertos estilos
const getStyleColorStyle = (_styleId: string | undefined, _themeKey: string | undefined, _isTitle: boolean): React.CSSProperties | undefined => {
  // Ya no aplica color desde "Estilo"; solo efectos (normal/italic/bold)
  return undefined;
};

// Variantes tipográficas separadas (para letras/colores) independientemente del estilo decorativo
type FontStyleVariant = {
  id: string;
  labelEs: string;
  labelEn: string;
  titleClasses: string;
  contentClasses: string;
  pptx: {
    titleFont: string;
    contentFont: string;
    titleUppercase?: boolean; // desactivado
    titleColorPrimary?: boolean; // desactivado
  };
};

const fontStyleVariants: Record<string, FontStyleVariant> = {
  classic: {
    id: 'classic',
    labelEs: 'Clásico',
    labelEn: 'Classic',
    titleClasses: '',
    contentClasses: '',
    pptx: { titleFont: 'Calibri', contentFont: 'Calibri' }
  },
  structured: {
    id: 'structured',
    labelEs: 'Estructurado',
    labelEn: 'Structured',
    titleClasses: '',
    contentClasses: '',
    pptx: { titleFont: 'Arial Narrow', contentFont: 'Calibri' }
  },
  serif: {
    id: 'serif',
    labelEs: 'Serif',
    labelEn: 'Serif',
    titleClasses: '',
    contentClasses: '',
    pptx: { titleFont: 'Georgia', contentFont: 'Times New Roman' }
  }
};

const getFontVariant = (id?: string): FontStyleVariant => fontStyleVariants[String(id || 'classic')] || fontStyleVariants.classic;
const getFontClasses = (id?: string, isTitle?: boolean) => {
  const v = getFontVariant(id);
  return (isTitle ? v.titleClasses : v.contentClasses) || '';
};
const getFontColorStyle = (_id: string | undefined, _themeKey: string | undefined, _isTitle: boolean): React.CSSProperties | undefined => {
  // La tipografía ya no cambia colores; solo familia de fuente
  return undefined;
};

// Helper: familia tipográfica CSS para preview (no carga webfonts)
const getFontFamilyStyle = (id?: string, isTitle?: boolean): React.CSSProperties => {
  const key = String(id || 'classic');
  if (key === 'serif') {
    return { fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' };
  }
  if (key === 'structured') {
    // Aproximación a Arial Narrow
    return { fontFamily: '"Arial Narrow", Arial, "Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif' };
  }
  // classic (sans-serif del sistema)
  return { fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Noto Sans", "Liberation Sans", sans-serif' };
};

// Helper: par de colores título/cuerpo según selección
const getPreviewColorPair = (choice: string | undefined, themeKey: string | undefined): { title?: React.CSSProperties; content?: React.CSSProperties } => {
  const th = (designThemes as any)[String(themeKey || '')] || designThemes.professional;
  switch (String(choice || 'auto')) {
    case 'contrast':
      return { title: { color: '#111827' }, content: { color: '#E5E7EB' } }; // gris 200
    case 'blue':
      return { title: { color: '#1E3A8A' }, content: { color: '#DBEAFE' } }; // azul 100
    case 'green':
      return { title: { color: '#064E3B' }, content: { color: '#D1FAE5' } }; // emerald 100
    case 'red':
      return { title: { color: '#7F1D1D' }, content: { color: '#FEE2E2' } }; // red 100
    case 'purple':
      return { title: { color: '#4C1D95' }, content: { color: '#EDE9FE' } }; // violet 100
    case 'amber':
      return { title: { color: '#78350F' }, content: { color: '#FEF3C7' } }; // amber 100
    case 'gray':
      return { title: { color: '#111827' }, content: { color: '#E5E7EB' } }; // gris 200
    default:
      // auto: usar colores del tema (no forzar inline)
      return { title: undefined, content: undefined };
  }
};

// Storage key por usuario
const getKey = (username?: string | null) => `smart-student-slides-${username || 'anon'}`;

// Normalización básica sin tildes para búsquedas
const normalizeAscii = (s?: string) => {
  try {
    return String(s || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/[^\w\s-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  } catch { return String(s || '').toLowerCase(); }
};

const simpleHash = (input?: string) => {
  const str = String(input || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // fuerza a 32-bit
  }
  return hash;
};

// Palabras clave enriquecidas para imágenes
const buildImageKeywords = (topic?: string, subjectName?: string, slideTitle?: string, slideContent?: string[]) => {
  const contentText = Array.isArray(slideContent) ? slideContent.join(' ') : '';
  const txt = `${normalizeAscii(topic)} ${normalizeAscii(subjectName)} ${normalizeAscii(slideTitle)} ${normalizeAscii(contentText)}`.trim();

  type Entry = { re: RegExp; terms: string[] };
  const catalog: Entry[] = [
    { re: /(respir|pulmon|oxigen|alveol|bronq|diafragm|traquea)/, terms: ['respiratory system', 'lungs', 'breathing', 'anatomy', 'human body'] },
    { re: /(circul|corazon|cardio|sangre|venas|arterias)/, terms: ['circulatory system', 'heart', 'blood vessels', 'anatomy'] },
    { re: /(digest|estomac|intestin|nutric)/, terms: ['digestive system', 'stomach', 'intestine', 'nutrition', 'anatomy', 'biology'] },
    { re: /(nervi|neurona|cerebr|cerebro)/, terms: ['nervous system', 'brain', 'neurons', 'anatomy', 'biology'] },
    { re: /(celul|celula|cell)/, terms: ['cell biology', 'microscope', 'cell structure', 'organelles', 'biology'] },
    { re: /(ecosist|ecolog|biodivers|ambiente|medio\s*amb)/, terms: ['ecosystem', 'nature', 'forest', 'wildlife', 'plants', 'ecology'] },
    { re: /(mate|algebr|geometr|calculo|probab|estat)/, terms: ['math', 'algebra', 'equations', 'geometry', 'graphs'] },
    { re: /(fisic|energia|fuerza|movim|newton|veloc|optica)/, terms: ['physics', 'forces', 'motion', 'energy', 'mechanics', 'science'] },
    { re: /(quimic|atomo|molec|reacci|laborat|periodic)/, terms: ['chemistry', 'laboratory', 'molecules', 'atoms', 'periodic table', 'science'] },
    { re: /(histori|civiliz|revolu|edad\s*media|antigua)/, terms: ['history', 'ancient civilization', 'monuments', 'museum', 'culture'] },
    { re: /(geograf|mapa|clima|relieve|tierra|planeta)/, terms: ['geography', 'map', 'earth', 'landscape', 'climate'] },
    { re: /(lengua|literat|gramat|lectur|escrit)/, terms: ['language', 'literature', 'books', 'reading', 'library'] },
    { re: /(tecnolog|comput|program|robot|ia|inteligencia)/, terms: ['technology', 'computer', 'programming', 'code', 'robotics', 'AI'] },
    { re: /(astronom|sistema\s*solar|planeta|galax|espacio)/, terms: ['astronomy', 'solar system', 'planets', 'space', 'stars'] },
    { re: /(arte|pintur|dibujo|museo)/, terms: ['art', 'painting', 'drawing', 'gallery', 'creative'] },
    { re: /(musica|música|instrument|ritmo)/, terms: ['music', 'instruments', 'orchestra', 'notes'] },
    { re: /(salud|deport|ejercic|bienestar)/, terms: ['health', 'exercise', 'fitness', 'wellness'] },
  ];

  const picked = new Set<string>();
  for (const entry of catalog) {
    if (entry.re.test(txt)) entry.terms.forEach(t => picked.add(t));
  }
  const ownTokens = normalizeAscii(`${topic} ${slideTitle} ${contentText}`).split(/\s+/).filter(Boolean).slice(0, 8);
  ownTokens.forEach(t => picked.add(t));
  if (picked.size === 0) ['education', 'learning', 'classroom'].forEach(t => picked.add(t));
  const finalTerms = Array.from(picked).slice(0, 12);
  return encodeURIComponent(finalTerms.join(','));
};

// Des-proxificar URLs para <img> o CSS background
const toDirectUrl = (u?: string | null) => {
  if (!u) return '';
  if (u.startsWith('data:')) return u;
  try {
    const m = u.match(/\/api\/image-proxy\?u=(.*)$/);
    if (m) return decodeURIComponent(m[1]);
  } catch {}
  return u;
};

// Generar URL principal de ilustración por índice
const resolveIllustrationUrlByIndex = (
  index: number,
  topic?: string,
  subjectName?: string,
  slideTitle?: string,
  slideContent?: string[]
) => {
  const seed = `${index}:${topic || ''}:${subjectName || ''}:${slideTitle || ''}:${(slideContent || []).join(' ')}`;
  const sig = Math.abs(simpleHash(seed));
  const q = buildImageKeywords(topic, subjectName, slideTitle, slideContent);
  // Unsplash featured con seed estable para variar
  return `https://source.unsplash.com/featured/1280x720/?${q}&sig=${sig}`;
};

// URL secundaria alternativa (más genérica) manteniendo unicidad por índice
const resolveSecondaryUrlByIndex = (
  index: number,
  topic?: string,
  subjectName?: string,
  slideContent?: string[]
) => {
  const seed = `${index}:${topic || ''}:${subjectName || ''}:${(slideContent || []).join(' ')}`;
  const sig = Math.abs(simpleHash(seed + ':alt'));
  const q = buildImageKeywords(topic, subjectName, undefined, slideContent);
  return `https://source.unsplash.com/featured/1280x720/?${q}&sig=${sig}`;
};

// Fallback estático aproximado por temática
const resolveIllustrationStaticUrl = (topic?: string, subjectName?: string, slideTitle?: string) => {
  const txt = normalizeAscii(`${topic} ${subjectName} ${slideTitle}`);
  // Astronomía / Sistema Solar / Espacio
  if (/(astronom|sistema\s*solar|planeta|galax|espacio|universe|space|nasa)/.test(txt)) {
    // Cielo estrellado / vía láctea
    return 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop';
  }
  if (/(respir|pulmon|oxigen|alveol|bronq|diafragm|traquea)/.test(txt)) return 'https://images.unsplash.com/photo-1588613259305-59989a937b23?q=80&w=1200&auto=format&fit=crop';
  if (/(circulator|corazon|cardio|sangre|arterias|venas)/.test(txt)) return 'https://images.unsplash.com/photo-1530023367847-a683933f417e?q=80&w=1200&auto=format&fit=crop';
  if (/(mate|algebra|geometr|aritm|calculo|funcion|probabil|estat)/.test(txt)) return 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop';
  if (/(historia|sociales|civiliz|revoluc|independenc|edad\s*media|antigua)/.test(txt)) return 'https://images.unsplash.com/photo-1548585742-1df49e7532a6?q=80&w=1200&auto=format&fit=crop';
  if (/(lengua|literat|comunicaci|lectura|escritura|idioma|gramatica)/.test(txt)) return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop';
  if (/(tecnolog|comput|program|informat|robot|ia|inteligencia)/.test(txt)) return 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop';
  if (/(geograf|mapa|planeta|tierra|geolog|clima)/.test(txt)) return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop';
  // Fallback genérico educativo (libros/escritura) en lugar de una casa aleatoria
  return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop';
};

// Igual que resolveIllustrationStaticUrl pero devuelve null si no hay match curado (evita usar un genérico por defecto)
const resolveCuratedUrl = (topic?: string, subjectName?: string, slideTitle?: string): string | null => {
  const txt = normalizeAscii(`${topic} ${subjectName} ${slideTitle}`);
  if (/(astronom|sistema\s*solar|planeta|galax|espacio|universe|space|nasa)/.test(txt)) return 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop';
  if (/(respir|pulmon|oxigen|alveol|bronq|diafragm|traquea)/.test(txt)) return 'https://images.unsplash.com/photo-1588613259305-59989a937b23?q=80&w=1200&auto=format&fit=crop';
  if (/(circulator|corazon|cardio|sangre|arterias|venas)/.test(txt)) return 'https://images.unsplash.com/photo-1530023367847-a683933f417e?q=80&w=1200&auto=format&fit=crop';
  if (/(mate|algebra|geometr|aritm|calculo|funcion|probabil|estat)/.test(txt)) return 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop';
  if (/(historia|sociales|civiliz|revoluc|independenc|edad\s*media|antigua)/.test(txt)) return 'https://images.unsplash.com/photo-1548585742-1df49e7532a6?q=80&w=1200&auto=format&fit=crop';
  if (/(lengua|literat|comunicaci|lectura|escritura|idioma|gramatica)/.test(txt)) return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop';
  if (/(tecnolog|comput|program|informat|robot|ia|inteligencia)/.test(txt)) return 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop';
  if (/(geograf|mapa|planeta|tierra|geolog|clima)/.test(txt)) return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop';
  return null;
};

// Heurística simple para temas de astronomía (usado para priorizar portada curada)
const isAstronomy = (topic?: string, subjectName?: string, slideTitle?: string) => {
  const txt = normalizeAscii(`${topic} ${subjectName} ${slideTitle}`);
  return /(astronom|sistema\s*solar|planeta|galax|espacio|universe|space|nasa)/.test(txt);
};

// Placeholder local en JPG para miniaturas
const generatePlaceholderJpeg = (topic?: string, subjectName?: string, title?: string, w = 320, h = 200) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#4b5563';
    ctx.font = 'bold 14px sans-serif';
    const text = (title || topic || subjectName || 'Imagen');
    ctx.fillText(text.slice(0, 28), 12, h/2);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch { return ''; }
};

// Si la cadena ya es dataURL, pásala, si no, null; (pptxgen acepta {data})
const toPptxData = (dataUrl?: string | null) => {
  if (!dataUrl) return null;
  return dataUrl.startsWith('data:') ? dataUrl : null;
};

// Temas de diseño (mínimo viable)
const designThemes: Record<string, DesignTheme> = {
  // Nueva opción: Predeterminada (institucional)
  default: {
    name: 'Predeterminada',
    description: 'Estilo institucional',
    primary: '#0ea5e9',
    bg: 'bg-sky-50 dark:bg-zinc-900',
    title: 'text-sky-900 dark:text-sky-200',
    content: 'text-gray-700 dark:text-zinc-200',
    accent: 'border-l-4 border-sky-500',
    gradient: 'from-sky-500 to-blue-600',
    bgHex: '#E0F2FE',
    titleHex: '#075985',
    contentHex: '#374151',
  },
  professional: {
    name: 'Profesional',
    description: 'Diseño corporativo y elegante',
    primary: '#2563eb',
    bg: 'bg-slate-50 dark:bg-slate-900',
    title: 'text-blue-900 dark:text-blue-200',
    content: 'text-gray-700 dark:text-zinc-200',
    accent: 'border-l-4 border-blue-500',
    gradient: 'from-blue-500 to-indigo-500',
    bgHex: '#F8FAFC',
    titleHex: '#1E40AF',
    contentHex: '#374151',
  },
  modern: {
    name: 'Moderno',
    description: 'Estilo contemporáneo y vibrante',
    primary: '#8b5cf6',
    bg: 'bg-violet-50 dark:bg-zinc-900',
    title: 'text-violet-900 dark:text-violet-200',
    content: 'text-gray-700 dark:text-zinc-200',
    accent: 'border-l-4 border-violet-500',
    gradient: 'from-violet-500 to-fuchsia-500',
    bgHex: '#F5F3FF',
    titleHex: '#6D28D9',
    contentHex: '#374151',
  },
  warm: {
    name: 'Cálido',
    description: 'Tonos acogedores y energéticos',
    primary: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-zinc-900',
    title: 'text-amber-900 dark:text-amber-200',
    content: 'text-gray-700 dark:text-zinc-200',
    accent: 'border-l-4 border-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    bgHex: '#FEF3C7',
    titleHex: '#92400E',
    contentHex: '#374151',
  },
  nature: {
    name: 'Naturaleza',
    description: 'Inspirado en la naturaleza',
    primary: '#10b981',
    bg: 'bg-emerald-50 dark:bg-zinc-900',
    title: 'text-emerald-900 dark:text-emerald-200',
    content: 'text-gray-700 dark:text-zinc-200',
    accent: 'border-l-4 border-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
    bgHex: '#ECFDF5',
    titleHex: '#065F46',
    contentHex: '#374151',
  },
  elegant: {
    name: 'Elegante',
    description: 'Sofisticado y refinado',
    primary: '#111827',
    bg: 'bg-gray-50 dark:bg-zinc-900',
    title: 'text-gray-900 dark:text-gray-100',
    content: 'text-gray-700 dark:text-zinc-200',
    accent: 'border-l-4 border-gray-700',
    gradient: 'from-gray-700 to-gray-900',
    bgHex: '#F9FAFB',
    titleHex: '#111827',
    contentHex: '#374151',
  },
};

// Imágenes predeterminadas por tema (portada + contenido) - URLs más específicas por diseño
const themeDefaultImages: Record<string, { cover: string; slide: string }> = {
  default: {
    // Aulas y fachada escolar para dar un look institucional
    cover: 'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // aula de clases
    slide: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // pasillo/colegio
  },
  professional: {
    cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // oficina moderna corporativa
    slide: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // sala de conferencias
  },
  modern: {
    // Imagen claramente "moderna": tecnología/neón
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // laptop/código (tech)
    slide: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // callejón neón (cyberpunk)
  },
  warm: {
    // Imágenes cálidas y únicas (no compartidas con 'nature')
    cover: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // bokeh luces cálidas
    slide: 'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // ambiente acogedor cálido
  },
  nature: {
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // bosque verde exuberante
    slide: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // paisaje montañoso
  },
  elegant: {
    // Siguiendo el patrón del tema "Cálido": URL directa de Unsplash en 4K para evitar pixelación
    // Imagen elegante: mármol negro con vetas doradas, sofisticado y premium (1.7MB, 4K)
    cover: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&h=2160&q=95',
    // Slides de contenido: versión más sutil del mismo estilo elegante (606KB, 2.5K)
    // Mantiene la estética sofisticada pero menos intrusiva para legibilidad del texto
    slide: 'https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&h=1440&q=90'
  },
};

// Helpers: overrides de imágenes por tema guardados en localStorage
const CUSTOM_THEME_IMG_KEY = 'custom-theme-images-v1';
const loadCustomThemeImages = (): Record<string, { cover?: string; slide?: string }> => {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(CUSTOM_THEME_IMG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};
const saveCustomThemeImages = (data: Record<string, { cover?: string; slide?: string }>) => {
  try { if (typeof window !== 'undefined') localStorage.setItem(CUSTOM_THEME_IMG_KEY, JSON.stringify(data)); } catch {}
};
const getCustomThemeImage = (themeKey?: string, kind: 'cover'|'slide' = 'cover'): string | undefined => {
  try {
    const key = String(themeKey||'').toLowerCase();
    const map = loadCustomThemeImages();
    return map[key]?.[kind];
  } catch { return undefined; }
};

// Fallbacks inline específicos para el tema "Elegante" cuando las imágenes remotas fallan.
// Mantienen la identidad visual (negro + dorado) y aseguran que portada y contenido sean distintos.
const elegantInlineFallback = {
  cover:
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 450%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%230a0a0f%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%2311111a%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22800%22 height=%22450%22 fill=%22url(%23g)%22/%3E%3Cg stroke=%22%23e5c76a%22 stroke-width=%222.5%22 opacity=%220.85%22%3E%3Cpath d=%22M-80,430 C140,330 360,360 620,260 S980,80 1040,30%22 fill=%22none%22/%3E%3Cpath d=%22M-60,400 C180,300 420,330 680,230 S980,120 1100,60%22 fill=%22none%22 opacity=%220.7%22/%3E%3C/g%3E%3C/svg%3E',
  slide:
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 450%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%230b0b10%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%23121218%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22800%22 height=%22450%22 fill=%22url(%23g)%22/%3E%3Cg stroke=%22%23d5b24a%22 stroke-width=%221.8%22 opacity=%220.9%22%3E%3Cpath d=%22M-70,410 C160,300 360,320 600,240 S920,120 1040,80%22 fill=%22none%22/%3E%3C/g%3E%3C/svg%3E'
};

const resolveThemeDefaultUrl = (themeKey?: string, kind: 'cover' | 'slide' = 'slide'): string | '' => {
  if (!themeKey) return '';
  const key = String(themeKey).toLowerCase();
  // 1) Intentar override personalizado desde localStorage
  const custom = getCustomThemeImage(key, kind as any);
  if (custom) return custom;
  // 2) Usar catálogo por defecto
  const found = (themeDefaultImages as any)[key];
  if (found) return found[kind] || '';
  return '';
};

// Palabras clave por tema/estilo para orientar la IA hacia una estética característica y distintiva
const themeKeywords: Record<string, string[]> = {
  default: ['school classroom interior', 'school building facade', 'students learning environment', 'education campus', 'institutional academic setting', 'classroom presentation backdrop'],
  professional: ['corporate office building', 'business conference room', 'modern workplace', 'blue glass architecture', 'clean geometric lines', 'professional meeting space', 'corporate presentation backdrop'],
  modern: ['futuristic digital interface', 'neon cityscape night', 'abstract geometric shapes', 'holographic display', 'cyberpunk aesthetic', 'digital art background', 'tech presentation backdrop'],
  warm: ['golden hour sunset landscape', 'autumn forest colors', 'cozy fireplace ambiance', 'warm orange gradient', 'soft candlelight atmosphere', 'amber sunlight rays', 'warm presentation backdrop'],
  nature: ['lush green forest canopy', 'mountain landscape vista', 'flowing river scenery', 'natural wood texture', 'botanical leaf patterns', 'outdoor wilderness scene', 'nature presentation backdrop'],
  elegant: ['luxury marble texture', 'black and gold pattern', 'sophisticated interior design', 'crystal chandelier lighting', 'refined architectural details', 'premium fabric texture', 'elegant presentation backdrop']
};
const styleKeywords: Record<string, string[]> = {
  accents: ['with subtle highlights', 'soft accent elements', 'gentle color emphasis'],
  grid: ['with geometric grid overlay', 'structured line pattern', 'organized layout design'],
  bubbles: ['with bokeh light effects', 'floating bubble elements', 'dreamy blurred circles']
};

// Función mejorada para crear queries más específicos por diseño visual
const buildAugmentedTopicForAI = (topic?: string, theme?: string, style?: string) => {
  const base = String(topic || '').trim();
  const tk = themeKeywords[String(theme || '').toLowerCase()] || [];
  const sk = styleKeywords[String(style || '').toLowerCase()] || [];
  
  // Seleccionar múltiples palabras clave del tema para mayor especificidad
  const selectedThemeKeys = tk.slice(0, 3).join(' '); // Usar las primeras 3 para ser más específico
  const stylePhrase = sk[0] || '';
  
  console.log('🎨 Building AI query:', {
    base,
    theme,
    style,
    selectedThemeKeys,
    stylePhrase,
    availableThemeKeys: tk.length
  });
  
  // Crear query que priorice el estilo visual sobre el contenido académico
  if (base && selectedThemeKeys) {
    const result = `${selectedThemeKeys} ${stylePhrase} ${base} educational presentation background`.trim();
    console.log('🔍 Final AI query:', result);
    return result;
  } else if (selectedThemeKeys) {
    const result = `${selectedThemeKeys} ${stylePhrase} presentation background`.trim();
    console.log('🔍 Final AI query (no topic):', result);
    return result;
  } else {
    const result = `${base} presentation background`.trim();
    console.log('🔍 Final AI query (fallback):', result);
    return result;
  }
};

export default function SlidesPage() {
  const { user } = useAuth();
  const { translate, language } = useLanguage();
  const { toast } = useToast();
  // Mapear nombres comunes de asignaturas ES -> EN para mejorar prompts cuando EN está activo
  const toEnglishSubjectName = (name?: string | null) => {
    const raw = String(name || '');
    const n = raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '');
    const test = (re: RegExp) => re.test(n);
    if (test(/matemat/)) return 'Mathematics';
    if (test(/lengu(a|e)|lenguaj|comunicacion|literat/)) return 'Language Arts';
    if (test(/ingles|english/)) return 'English';
    if (test(/histori|ciencias?\s*social/)) return 'History';
    if (test(/geograf/)) return 'Geography';
    if (test(/biolog/)) return 'Biology';
    if (test(/fisic(?!a\s*educa)/)) return 'Physics';
    if (test(/quimic/)) return 'Chemistry';
    if (test(/ciencias?\s*natur/)) return 'Natural Sciences';
    if (test(/tecnolog|informat|comput/)) return 'Technology';
    if (test(/musica/)) return 'Music';
    if (test(/arte|artes?\s*visual/)) return 'Visual Arts';
    if (test(/educacion\s*fisica/)) return 'Physical Education';
    if (test(/religion/)) return 'Religion';
    if (test(/civica|formacion\s*ciudad/)) return 'Civics';
    return raw || '';
  };
  // Helper: traducción segura con fallback ES/EN si la clave no existe o retorna el propio key
  const tr = (key: string, esFallback: string, enFallback?: string) => {
    try {
      const v = translate(key);
      if (!v || v === key) return language === 'en' ? (enFallback || esFallback) : esFallback;
      return v;
    } catch {
      return language === 'en' ? (enFallback || esFallback) : esFallback;
    }
  };
  const [items, setItems] = useState<SlideItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>({ slideCount: 10, designTheme: 'default', designStyle: 'normal', designFontStyle: 'classic' });
  const [designOnly, setDesignOnly] = useState<boolean>(false);
  const [autoImages, setAutoImages] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [assignedSubjectsByCourse, setAssignedSubjectsByCourse] = useState<Record<string, Array<{ id: string; name: string }>>>({});
  const [assignedSections, setAssignedSections] = useState<any[]>([]);
  const [assignedSubjectsBySection, setAssignedSubjectsBySection] = useState<Record<string, Array<{ id: string; name: string }>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  // Estado independiente para el modal de edición (no afecta la tarjeta de creación detrás)
  const [editDraft, setEditDraft] = useState<any | null>(null);
  const [editProgress, setEditProgress] = useState<number>(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewSlides, setPreviewSlides] = useState<SlideData[]>([]);
  // Pool de imágenes prebuscadas (hasta 30) por tema, para usar como fondos
  const [previewBgPool, setPreviewBgPool] = useState<string[]>([]);
  // Fondos ya escogidos para cada slide en vista previa, asegurando unicidad
  const [previewBgChosen, setPreviewBgChosen] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<{ topic?: string; subjectName?: string }>({});
  const [previewTheme, setPreviewTheme] = useState<string>('professional');
  const [previewStyle, setPreviewStyle] = useState<string>('normal');
  const [previewFontStyle, setPreviewFontStyle] = useState<string>('classic');
  const [previewTextColor, setPreviewTextColor] = useState<string>('auto');
  const [previewTextColor2, setPreviewTextColor2] = useState<string>('auto');
  const [previewDesignOnly, setPreviewDesignOnly] = useState<boolean>(false);
  // Utilidad: hash simple para semilla determinística según tema/estilo
  const themeHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  };
  const [previewSelectedSectionId, setPreviewSelectedSectionId] = useState<string | undefined>(undefined);
  const [pptxStepReveal] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmShareId, setConfirmShareId] = useState<string | null>(null);
  // Personalización de imágenes del tema por defecto
  const [showThemeCustomize, setShowThemeCustomize] = useState<null | { themeKey: string }>(null);
  const [themeCoverFile, setThemeCoverFile] = useState<File | null>(null);
  const [themeSlideFile, setThemeSlideFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      setCourses(JSON.parse(localStorage.getItem('smart-student-courses') || '[]'));
  setSections(JSON.parse(localStorage.getItem('smart-student-sections') || '[]'));
      setSubjects(JSON.parse(localStorage.getItem('smart-student-subjects') || '[]'));
    } catch {}
    try {
      const key = getKey(user?.username);
      const raw = localStorage.getItem(key);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      const key = getKey(user?.username);
      if (e.key === key) setItems(JSON.parse(e.newValue || '[]'));
      if (
        e.key === 'smart-student-teacher-assignments' ||
        e.key === 'smart-student-courses' ||
        e.key === 'smart-student-sections' ||
        e.key === 'smart-student-subjects' ||
        e.key === 'smart-student-admin-courses' ||
        e.key === 'smart-student-admin-sections'
      ) {
        if (e.key === 'smart-student-sections') {
          try { setSections(JSON.parse(e.newValue || '[]')); } catch {}
        }
        computeTeacherAssignments();
      }
    };
    // Calcular asignaciones reales del profesor
    computeTeacherAssignments();

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user?.username]);

  const computeTeacherAssignments = () => {
    try {
      if (!user || user.role !== 'teacher') {
        setAssignedCourses([]);
        setAssignedSubjectsByCourse({});
        setAssignedSections([]);
        setAssignedSubjectsBySection({});
        return;
      }
      const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
      const fullUser = users.find((u: any) => u.username === user.username || u.id === user.id);
      const assignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
      const allSections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
      const coursesAll = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');

      const my = (assignments || []).filter((a: any) => a && (a.teacherId === fullUser?.id || a.teacherUsername === user.username));
      const courseIds = new Set<string>();
      const subsByCourse: Record<string, Array<{ id: string; name: string }>> = {};
      const subsBySection: Record<string, Array<{ id: string; name: string }>> = {};
      const mySections: any[] = [];
      const subsCat = JSON.parse(localStorage.getItem('smart-student-subjects') || '[]');

      const getSubj = (sid?: any, sname?: any) => {
        const byId = subsCat.find((s: any) => String(s.id) === String(sid));
        if (byId) return { id: String(byId.id), name: String(byId.name || byId.id) };
        const byName = subsCat.find((s: any) => String(s.name) === String(sname));
        if (byName) return { id: String(byName.id || byName.name), name: String(byName.name || byName.id) };
        const n = String(sname || sid || '');
        return n ? { id: n, name: n } : undefined;
      };

      my.forEach((a: any) => {
        const sec = allSections.find((s: any) => String(s.id) === String(a.sectionId));
        const courseId = String(sec?.courseId || a.courseId || '');
        const sectionId = String(a.sectionId || sec?.id || '');
        if (sec && !mySections.some((s: any) => String(s.id) === String(sec.id))) mySections.push(sec);
        if (courseId) courseIds.add(courseId);
        const subj = getSubj(a.subjectId, a.subjectName);
        if (!subj) return;
        if (courseId) {
          if (!subsByCourse[courseId]) subsByCourse[courseId] = [];
          if (!subsByCourse[courseId].some(x => x.id === subj.id || x.name === subj.name)) subsByCourse[courseId].push(subj);
        }
        if (sectionId) {
          if (!subsBySection[sectionId]) subsBySection[sectionId] = [];
          if (!subsBySection[sectionId].some(x => x.id === subj.id || x.name === subj.name)) subsBySection[sectionId].push(subj);
        }
      });

      const ac = coursesAll.filter((c: any) => courseIds.has(String(c.id)));
      setAssignedCourses(ac);
      setAssignedSubjectsByCourse(subsByCourse);
      setAssignedSections(mySections);
      setAssignedSubjectsBySection(subsBySection);
    } catch (e) {
      console.error('[Slides] computeTeacherAssignments error', e);
      setAssignedCourses([]);
      setAssignedSubjectsByCourse({});
      setAssignedSections([]);
      setAssignedSubjectsBySection({});
    }
  };

  const save = (list: SlideItem[]) => {
    const key = getKey(user?.username);
    setItems(list);
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(list) }));
  };

  const resolveSubjectName = (id?: string | null) => {
    try {
      const subj = subjects.find((s: any) => String(s.id) === String(id)) || subjects.find((s: any) => String(s.name) === String(id));
      return subj?.name || (id ? String(id) : '');
    } catch { return id ? String(id) : ''; }
  };

  const resolveCourseLabel = (courseId?: string | null) => {
    try {
      const course = courses.find((c: any) => String(c.id) === String(courseId));
      return course?.name || '';
    } catch { return ''; }
  };

  // Devuelve "Curso Sección" como "8vo Básico B" cuando hay datos
  const resolveSectionLabel = (sectionId?: string | null) => {
    try {
      const sec = sections.find((s: any) => String(s.id) === String(sectionId));
      if (!sec) return '';
      const courseName = resolveCourseLabel(sec.courseId);
      const secName = sec.name || sec.sectionName || '';
      return [courseName, secName].filter(Boolean).join(' ');
    } catch { return ''; }
  };

  // Encuentra el courseId a partir de un sectionId
  const resolveCourseFromSection = (sectionId?: string | null): string | undefined => {
    try {
      const sec = sections.find((s: any) => String(s.id) === String(sectionId));
      return sec?.courseId ? String(sec.courseId) : undefined;
    } catch { return undefined; }
  };

  const formatDateTime = (ts?: number) => {
    if (!ts) return '-';
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const handleCreate = async () => {
    if (!user) { alert('Usuario no autenticado'); return; }
    if (!draft.sectionId || !draft.courseId || !draft.subjectId || !(String(draft.topic||'').trim())) {
      alert(tr('slidesSelectAllBeforeCreate', 'Complete curso-sección, asignatura y tema.', 'Complete course-section, subject and topic.'));
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      console.log('🎯 Starting slide generation with data:', {
        topic: draft.topic,
        subject: resolveSubjectName(draft.subjectId),
        slideCount: Number(draft.slideCount || 10),
        courseId: draft.courseId,
        sectionId: draft.sectionId,
        subjectId: draft.subjectId,
        designTheme: draft.designTheme,
        designStyle: draft.designStyle,
        autoImages: autoImages
      });

      // Simular progreso durante la generación
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev < 90) return Math.min(90, prev + Math.random() * 15);
          return prev;
        });
      }, 500);

      const subjectForApi = (() => {
        const esName = resolveSubjectName(draft.subjectId);
        return language === 'en' ? toEnglishSubjectName(esName) : esName;
      })();
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: draft.topic,
          subject: subjectForApi,
          slideCount: Number(draft.slideCount || 10),
      // Generar en el idioma activo (es/en)
      language: (language === 'en' ? 'en' : 'es')
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      console.log('📡 API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

  const result = await response.json();
      console.log('✅ API result received:', result);
      
      if (result.error) {
        console.error('❌ API returned error:', result);
        throw new Error(result.details || result.error);
      }

      const now = Date.now();
      const subjName = resolveSubjectName(draft.subjectId);
      // 0) Pre-buscar pool de imágenes con IA considerando tema/estilo seleccionados
      let poolRaw: string[] = [];
      console.log('🖼️ Image pool search with theme:', {
        autoImages,
        designTheme: draft.designTheme,
        designStyle: draft.designStyle,
        topic: draft.topic,
        subject: subjName
      });
      try {
        if (autoImages && draft.topic && subjName) {
          const n = Math.min(31, Math.max(1, Number(result?.slides?.length || draft.slideCount || 10) + 1));
          const styleTag = `${draft.designTheme || 'professional'}-${draft.designStyle || 'normal'}`;
          const themedTopic = buildAugmentedTopicForAI(draft.topic, draft.designTheme, draft.designStyle);
          console.log('🔍 AI search query:', {
            originalTopic: draft.topic,
            themedTopic,
            styleTag
          });
          const res = await fetch(`/api/search-images?topic=${encodeURIComponent(themedTopic)}&subject=${encodeURIComponent(subjName)}&n=${n}&ai=gemini&style=${encodeURIComponent(styleTag)}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            poolRaw = Array.isArray(data?.urls) ? data.urls.filter((u:string)=> typeof u === 'string' && u) : [];
            console.log('✅ Image pool retrieved:', poolRaw.length, 'images');
          } else {
            console.warn('⚠️ Image search failed:', res.status, res.statusText);
          }
        }
      } catch (e) {
        console.error('❌ Image pool search error:', e);
      }
      // Semilla determinística por tema/estilo para variar el orden del pool
  const seed = themeHash(`${draft.designTheme || 'professional'}:${draft.designStyle || 'normal'}:${draft.topic || ''}:${subjName || ''}`);
      const seededPool = [...poolRaw].sort((a, b) => {
        const ha = themeHash(String(a) + seed);
        const hb = themeHash(String(b) + seed + 11);
        return (ha % 101) - (hb % 101);
      });
      // Enriquecer slides con consultas/URLs de imagen cuando esté activado, priorizando el diseño seleccionado
      const used = new Set<string>();
      const mappedSlides: SlideData[] = (result.slides || []).map((s: SlideData, idx: number) => {
        const base: SlideData = {
          ...s,
          imageSearchQuery: s?.imageSearchQuery || `${draft.topic || ''} ${resolveSubjectName(draft.subjectId) || ''} ${s?.title || ''}`.trim() || undefined,
        };
        if (!autoImages) return base;
        try {
          // 1) Curada por tema/título/contenido
          const curated = resolveCuratedUrl(draft.topic, subjName, s?.title) || resolveCuratedUrl(draft.topic, subjName, (s?.content || []).join(' '));
          // 2) Pool IA reordenado por tema/estilo (evitar duplicados)
          let fromPool = seededPool[idx + 1] || '';
          if (fromPool && used.has(fromPool)) {
            // buscar la siguiente disponible
            const next = seededPool.find((u, i) => i > idx + 1 && !used.has(u));
            if (next) fromPool = next;
          }
          // 3) Fallback por tema del diseño (calculamos ambos para ordenar prioridades)
          const themeCover = resolveThemeDefaultUrl(draft.designTheme, 'cover');
          const themeSlide = resolveThemeDefaultUrl(draft.designTheme, 'slide');
          // 4) Imagen original del backend - PRIORIDAD BAJA
          const originalImage = base.imageUrl;
          // 5) Heurística - ÚLTIMO RECURSO
          const heuristic = resolveIllustrationUrlByIndex(idx + 1, draft.topic, subjName, s?.title, s?.content);
          // IMPORTANTE: La portada NO es parte de result.slides (se renderiza aparte).
          // Por lo tanto, todas las entradas de mappedSlides son diapositivas de contenido.
          // Prioridad para contenido: curada > slide del tema > pool IA > original > heurística
          const pick = (
            toDirectUrl(curated) ||
            toDirectUrl(themeSlide) ||
            toDirectUrl(fromPool) ||
            toDirectUrl(originalImage) ||
            toDirectUrl(heuristic)
          );
          if (pick) used.add(pick);
          return { ...base, imageUrl: pick || base.imageUrl };
        } catch { return base; }
      });

  const item: SlideItem = {
        id: `slide_${now}`,
        title: draft.topic || translate('slidesUntitled') || 'Presentación',
        createdAt: now,
  courseId: draft.courseId,
  sectionId: draft.sectionId,
        subjectId: draft.subjectId,
        subjectName: subjName,
        topic: draft.topic,
        slideCount: Number(draft.slideCount || 10),
        ownerId: user.id,
        ownerUsername: user.username,
        shared: false,
        slides: mappedSlides,
        designTheme: draft.designTheme || 'professional',
  designStyle: draft.designStyle || 'normal',
  designFontStyle: draft.designFontStyle || 'classic',
        // Si se agregan imágenes automáticamente, desactivar diseño-only para que se incluyan en PPTX
        useDesignOnly: autoImages ? false : designOnly
      };
      
      // 1) Guardar pool IA para la vista previa (evita segunda petición)
  setPreviewBgPool(poolRaw);

      // 2) Mostrar primero la vista previa
      setPreviewSlides(mappedSlides || []);
      setCurrentSlideIndex(0);
      setShowPreview(true);
      setPreviewMeta({ topic: draft.topic, subjectName: subjName });
      setPreviewTheme(String(draft.designTheme || 'professional'));
  setPreviewStyle(String(draft.designStyle || 'normal'));
  setPreviewDesignOnly(!autoImages);
      setPreviewSelectedSectionId(String(draft.sectionId || ''));
  setPreviewFontStyle(String(draft.designFontStyle || 'classic'));

      // 3) Inmediatamente después, agregar al historial
      save([item, ...items]);
  setDraft({ slideCount: 10, designTheme: 'default' });
      
    } catch (error) {
      console.error('Error generating slides:', error);
      alert(`Error al generar diapositivas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleDelete = (id: string) => {
    // La confirmación ahora se maneja por modal personalizado
    try {
      // 1) Eliminar comunicaciones asociadas a esta presentación (attachment.type==='slide' && slideId===id)
      const commKey = 'smart-student-communications';
      const allRaw = localStorage.getItem(commKey);
      if (allRaw) {
        try {
          const all = JSON.parse(allRaw);
          const remaining = Array.isArray(all) ? all.filter((c: any) => {
            const att = c && c.attachment;
            return !(att && att.type === 'slide' && String(att.slideId) === String(id));
          }) : [];
          if (remaining.length !== (Array.isArray(all) ? all.length : 0)) {
            localStorage.setItem(commKey, JSON.stringify(remaining));
            // Notificar cambios (storage + evento custom para campana)
            try { window.dispatchEvent(new StorageEvent('storage', { key: commKey, newValue: JSON.stringify(remaining) })); } catch {}
            try { window.dispatchEvent(new CustomEvent('studentCommunicationsUpdated', { detail: { action: 'deleted', slideId: id } })); } catch {}
          }
        } catch {}
      }
    } catch {}
    // 2) Eliminar la presentación en sí
    save(items.filter(i => i.id !== id));
  };

  const doShare = (it: SlideItem) => {
    try {
      const commKey = 'smart-student-communications';
      const all = JSON.parse(localStorage.getItem(commKey) || '[]');
  const pool = Array.isArray(previewBgPool) ? previewBgPool : [];
  // Priorizar portada curada por tema/título; luego usar pool precargado; por último heurística
  const curatedCover = resolveCuratedUrl(it.topic, it.subjectName, it.title);
  // Usar explícitamente la imagen 'cover' del tema para la primera diapositiva si no hay curada
  const themeCover = resolveThemeDefaultUrl(it.designTheme || 'professional', 'cover');
  const coverImageUrl = (curatedCover || themeCover || pool[0] || resolveIllustrationUrlByIndex(0, it.topic, it.subjectName, it.title)) as string;
  const entry = {
        id: `comm_${Date.now()}`,
        type: 'course',
        title: `${translate('slidesShareTitle') || 'Presentación compartida'}: ${it.topic || it.title}`,
        content: translate('slidesShareMessage') || 'El profesor ha compartido una presentación de clase.',
        targetCourse: it.courseId,
        targetSection: it.sectionId,
        targetCourseName: resolveCourseLabel(it.courseId) || '',
        targetSectionName: (sections.find((s:any)=> String(s.id)===String(it.sectionId))?.name) || undefined,
        createdAt: new Date().toISOString(),
        readBy: [],
        readAt: {},
        attachment: { 
          type: 'slide', 
          slideId: it.id,
          slide: {
            id: it.id,
            title: it.title,
            topic: it.topic,
            subjectName: it.subjectName,
            slideCount: it.slideCount,
            // Metadatos de diseño para reproducir la misma apariencia del profesor
            designTheme: it.designTheme || 'professional',
            designStyle: (it.designStyle === 'accents' || it.designStyle === 'grid' || it.designStyle === 'bubbles') ? 'normal' : (it.designStyle || 'normal'),
            designFontStyle: it.designFontStyle || 'classic',
    useDesignOnly: it.useDesignOnly === true,
            coverImageUrl,
            // Para cada slide adjuntamos la imagen de fondo preferida y la miniatura si existe
            slides: Array.isArray(it.slides)
              ? (() => {
                  const used = new Set<string>();
                  const out = it.slides!.map((s, idx) => {
                    // 1) Preferir exactamente la imagen elegida por el profesor en el editor
                    const curated = resolveCuratedUrl(it.topic, it.subjectName, s?.title) ||
                                    resolveCuratedUrl(it.topic, it.subjectName, (s?.content || []).join(' '));
                    // Prioridad: curada > pool temático > imagen previa > fallback
                    let preferred = curated || (pool[idx + 1] || undefined) || s?.imageUrl || resolveIllustrationUrlByIndex(idx + 1, it.topic, it.subjectName, s?.title, s?.content);
                    // Evitar duplicados entre diapositivas compartidas para que el alumno reciba fondos distintos
                    if (preferred && used.has(preferred)) {
                      const alt = pool[idx + 1] || resolveIllustrationUrlByIndex(idx + 1, it.topic, it.subjectName, s?.title, s?.content);
                      if (alt) preferred = alt;
                    }
                    if (preferred) used.add(preferred);
                    const thumb = s.thumbUrl || preferred;
                    return ({
                      title: s.title,
                      content: s.content,
                      imageUrl: preferred,
                      thumbUrl: thumb
                    });
                  });
                  return out;
                })()
              : []
          }
        },
        createdBy: user?.username,
        senderId: user?.id,
        // Campos legacy opcionales para compatibilidad
        sender: user?.id,
        senderName: user?.displayName || user?.username,
      } as any;
      const next = [entry, ...all];
      localStorage.setItem(commKey, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent('storage', { key: commKey, newValue: JSON.stringify(next) }));
      try { window.dispatchEvent(new CustomEvent('studentCommunicationsUpdated', { detail: { action: 'created', id: entry.id } })); } catch {}
      save(items.map(s => s.id === it.id ? { ...s, shared: true } : s));
      // Toast en esquina inferior derecha, se cierra a los 3 segundos
      const targetLabel = it.sectionId ? (resolveSectionLabel(it.sectionId) || resolveCourseLabel(it.courseId)) : resolveCourseLabel(it.courseId);
      toast({
        title: translate('slidesSharedSuccess') || (language === 'en' ? 'Presentation shared' : 'Presentación compartida'),
        description: targetLabel ? ((language === 'en' ? 'Sent to ' : 'Enviada a ') + targetLabel) : undefined,
        duration: 3000,
      });
    } catch (e) {
      console.error('[Slides] share error', e);
    }
  };

  const handleShare = (it: SlideItem) => {
    // Abrir confirmación antes de compartir
    setConfirmShareId(it.id);
  };

  const handleDownload = async (it: SlideItem, format: 'pptx' | 'pdf' = 'pptx') => {
    try {
      if (format === 'pptx') {
        // Soporte de plantilla animada eliminado para modo profesor

        const mod: any = await import('pptxgenjs');
        const PptxGen = mod.default || mod;
        const pptx = new PptxGen();
        pptx.company = 'Smart Student';
        pptx.author = user?.displayName || user?.username || 'Teacher';
        
        // Habilitar animaciones en la presentación
        pptx.rtlMode = false;
        (pptx as any).animations = true;
        
        // Detectar si viene de vista previa
        const isFromPreview = String(it?.id || '').startsWith('preview_');
        
        // Prebuscar pool de imágenes para este item (hasta 30 + portada)
        let downloadBgPool: string[] = [];
        try {
          const nSlides = (it.slides?.length || Number(it.slideCount || 10));
          const styleTag = `${it.designTheme || 'professional'}-${it.designStyle || 'normal'}`;
          
          // Si viene de preview y ya tenemos un pool fresco, usarlo; si no, buscar nuevo
          if (isFromPreview && Array.isArray(previewBgPool) && previewBgPool.length > 0) {
            // Reordenar el pool según el tema/estilo actual para consistencia con vista previa
            const seed = themeHash(`${it.designTheme || previewTheme}:${it.designStyle || previewStyle}:${it.topic || ''}:${it.subjectName || ''}`);
            downloadBgPool = [...previewBgPool].sort((a, b) => {
              const ha = themeHash(a + seed);
              const hb = themeHash(b + seed + 13);
              return (ha % 101) - (hb % 101);
            });
          } else {
            const themedTopic = buildAugmentedTopicForAI(it.topic || it.title, it.designTheme || previewTheme, it.designStyle || previewStyle);
            const res = await fetch(`/api/search-images?topic=${encodeURIComponent(themedTopic)}&subject=${encodeURIComponent(it.subjectName || '')}&n=${Math.min(31, Math.max(1, nSlides + 1))}&ai=gemini&style=${encodeURIComponent(styleTag)}&download=${Date.now()}` as string, { cache: 'no-store' } as RequestInit);
            if (res.ok) {
              const data = await res.json();
              downloadBgPool = Array.isArray(data?.urls) ? data.urls.filter((u:string)=> typeof u === 'string' && u) : [];
            }
          }
        } catch {}
        
  // Utilidad: descargar imagen y convertir a DataURL (para navegador)
        const cache = new Map<string, string>();
    const toDataUrl = async (url: string): Promise<string | null> => {
          try {
            if (!url) return null;
            // Aceptar data URLs directamente
            if (/^data:image\//i.test(url)) return url;
            if (cache.has(url)) return cache.get(url)!;
      // 1) Intentar URL directa primero (evita bloqueos del proxy y preserva calidad)
      const direct = toDirectUrl(url) || url;
      let res = await fetch(direct, { cache: 'no-store' } as RequestInit);
      // 2) Si falla o no es OK, intentar vía proxy interno
      if (!res || !res.ok) {
        const proxied = url.startsWith('/api/image-proxy') || url.startsWith('data:') ? url : `/api/image-proxy?u=${encodeURIComponent(direct)}`;
        res = await fetch(proxied, { cache: 'no-store' } as RequestInit);
        if (!res || !res.ok) {
          console.warn('[Slides][toDataUrl] Both direct and proxy fetch failed for', url);
          return null;
        }
      }
            if (!res.ok) return null;
            const blob = await res.blob();
            if (!blob || !(blob as any).type) {
              console.warn('[Slides][toDataUrl] Empty blob or missing type for', url);
            }
            // Primero convertir a dataURL base
            let dataUrl: string = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(String(reader.result || ''));
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            // Si el tipo no es PNG/JPEG (WEBP/AVIF/SVG/etc.), convertir a JPEG con canvas
            if (!/^data:image\/(png|jpeg|jpg)/i.test(dataUrl)) {
              try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                dataUrl = await new Promise<string>((resolve, reject) => {
                  img.onload = () => {
                    try {
                      const canvas = document.createElement('canvas');
                      canvas.width = img.naturalWidth || 1280;
                      canvas.height = img.naturalHeight || 720;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) { resolve(dataUrl); return; }
                      ctx.drawImage(img, 0, 0);
                      const jpeg = canvas.toDataURL('image/jpeg', 0.92);
                      resolve(jpeg || dataUrl);
                    } catch (e) { resolve(dataUrl); }
                  };
                  img.onerror = () => resolve(dataUrl);
                  img.src = dataUrl;
                });
              } catch {}
            }
            cache.set(url, dataUrl);
            return dataUrl;
          } catch {
            console.warn('[Slides][toDataUrl] Unexpected error for', url);
            return null;
          }
        };
        // Helper que intenta múltiples URLs manteniendo unicidad por índice; prioriza URL ya resuelta por IA
  const getImageDataUrl = async (index: number, topic?: string, subjectName?: string, slideTitle?: string, slideContent?: string[], preResolvedUrl?: string | null) => {
          // 0) Si la IA ya resolvió una imagen específica, usarla primero
          if (preResolvedUrl) {
      const data = await toDataUrl(preResolvedUrl);
            if (data) return data;
          }
          // 1) Búsqueda específica por índice usando contenido de la slide
      const primary = (Array.isArray(downloadBgPool) && downloadBgPool[index]) ? downloadBgPool[index] : resolveIllustrationUrlByIndex(index, topic, subjectName, slideTitle, slideContent);
          let dataUrl = await toDataUrl(primary);
          if (dataUrl) return dataUrl;
          // 2) Búsqueda secundaria genérica pero única usando contenido
          const secondary = resolveSecondaryUrlByIndex(index, topic, subjectName, slideContent);
          dataUrl = await toDataUrl(secondary);
          if (dataUrl) return dataUrl;
          // 3) Último recurso: imagen estática aproximada (no garantiza variedad)
          const staticUrl = resolveIllustrationStaticUrl(topic, subjectName, slideTitle);
          return await toDataUrl(staticUrl);
        };

        // Asegurar unicidad de fondo por diapositiva en el PPTX (evita repetir la misma imagen)
  const usedCanonUrls = new Set<string>();
  const getUniqueBg = async (index: number, topic?: string, subjectName?: string, slideTitle?: string, slideContent?: string[], preResolvedUrl?: string | null) => {
          const tryOne = async (u?: string | null) => {
            if (!u) return { data: null as string | null, canon: '' };
            const canon = toDirectUrl(u) || u;
            if (usedCanonUrls.has(canon)) return { data: null as string | null, canon };
            const data = await toDataUrl(u);
            if (data) return { data, canon };
            return { data: null as string | null, canon };
          };

          // 0) Preferida por IA/backend
          let out = await tryOne(preResolvedUrl || undefined);
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }

          // 1) Primaria específica por índice
          out = await tryOne((Array.isArray(downloadBgPool) && downloadBgPool[index]) ? downloadBgPool[index] : resolveIllustrationUrlByIndex(index, topic, subjectName, slideTitle, slideContent));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }

          // 1b) Variación de firma para forzar imagen distinta
          out = await tryOne(resolveIllustrationUrlByIndex(index + 1000, topic, subjectName, slideTitle, slideContent));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }

          // 2) Secundaria
          out = await tryOne(resolveSecondaryUrlByIndex(index, topic, subjectName, slideContent));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }

          // 2b) Variación secundaria
          out = await tryOne(resolveSecondaryUrlByIndex(index + 1000, topic, subjectName, slideContent));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }

          // 3) Estática
          out = await tryOne(resolveIllustrationStaticUrl(topic, subjectName, slideTitle));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }

          return null;
        };

        // Reservar explícitamente la portada si existe para no repetirla en el índice 1
        try {
          const t0 = (it.topic || it.title);
          let coverUrl: string | undefined;
          if (isFromPreview) {
            // Para exports de preview, replicar el orden de la vista previa: primero cover del tema visual
            const themeDefault = resolveThemeDefaultUrl(it.designTheme || previewTheme, 'cover');
            const curated = resolveCuratedUrl(it.topic, it.subjectName, t0);
            const seed = themeHash(`${previewTheme}:${previewStyle}:${it.topic || ''}:${it.subjectName || ''}`);
            const seededPool = (Array.isArray(downloadBgPool) ? [...downloadBgPool] : []).sort((a, b) => {
              const ha = themeHash(a + seed);
              const hb = themeHash(b + seed + 7);
              return (ha % 97) - (hb % 97);
            });
            coverUrl = themeDefault || curated || seededPool[0] || resolveIllustrationUrlByIndex(0, it.topic, it.subjectName, t0, [it.topic || '', it.subjectName || '']);
          } else {
            // Para otras descargas, priorizar también el cover del tema visual
            const themeDefault = resolveThemeDefaultUrl(it.designTheme || previewTheme, 'cover');
            const curated = resolveCuratedUrl(it.topic, it.subjectName, t0);
            coverUrl = themeDefault || curated || (Array.isArray(previewBgPool) && previewBgPool[0] ? previewBgPool[0] : resolveIllustrationUrlByIndex(0, it.topic, it.subjectName, t0, [it.topic || '', it.subjectName || '']));
          }
          const canon = toDirectUrl(coverUrl) || coverUrl;
          if (canon) usedCanonUrls.add(canon);
        } catch {}

        // Genera una miniatura distinta al fondo y distinta de otras ya usadas
        const getThumbImage = async (index: number, topic?: string, subjectName?: string, slideTitle?: string, slideContent?: string[]) => {
          const tryOne = async (u?: string | null) => {
            if (!u) return { data: null as string | null, canon: '' };
            const canon = toDirectUrl(u) || u;
            if (usedCanonUrls.has(canon)) return { data: null as string | null, canon };
            const data = await toDataUrl(u);
            if (data) return { data, canon };
            return { data: null as string | null, canon };
          };
          // Preferir una fuente diferente a la del fondo usando la variante "secondary" con offset
          let out = await tryOne(resolveSecondaryUrlByIndex(index + 1001, topic, subjectName, slideContent));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }
          // Variaciones alternativas para asegurar diversidad
          out = await tryOne(resolveIllustrationUrlByIndex(index + 2002, topic, subjectName, slideTitle, slideContent));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }
          out = await tryOne(resolveSecondaryUrlByIndex(index + 3003, topic, subjectName, slideContent));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }
          // Último recurso
          out = await tryOne(resolveIllustrationStaticUrl(topic, subjectName, slideTitle));
          if (out.data) { usedCanonUrls.add(out.canon); return out.data; }
          return null;
        };
        
  const title = it.topic || it.title;
  const useDesign = isFromPreview ? previewDesignOnly : (it.useDesignOnly !== false);
  console.log('[DEBUG] Download - isFromPreview:', isFromPreview, 'previewDesignOnly:', previewDesignOnly, 'useDesign:', useDesign);
  const theme = designThemes[it.designTheme || 'professional'];
        const titleColor = theme.titleHex || '1E40AF';
        const contentColor = theme.contentHex || '374151';
        const bgColor = theme.bgHex || 'FFFFFF';
  const styleKind = String(it.designStyle || 'normal');
        
  // Slide de título: si useDesignOnly, solo diseño; si no, intenta imagen de fondo
        const slide0 = pptx.addSlide();
  const styleVar = getStyleVariant(it.designStyle || previewStyle);
  const fontVar = getFontVariant(it.designFontStyle || previewFontStyle);
  if (useDesign) {
          slide0.background = { fill: bgColor } as any;
        } else {
          let bgTitle: string | null = null;
          console.log('[DEBUG] Attempting to load background for cover...');
          try {
            if (isFromPreview) {
              const coverUrl = (() => {
                // 0) Cover del tema visual (mismo orden que preview)
                const themeDefault = resolveThemeDefaultUrl(it.designTheme || previewTheme, 'cover');
                if (themeDefault) return themeDefault;
                // 1) Curado por tema específico
                const curated = resolveCuratedUrl(it.topic, it.subjectName, title);
                if (curated) return curated;
                // 2) Pool precargado reordenado por tema/estilo actual de preview
                const seed = themeHash(`${previewTheme}:${previewStyle}:${it.topic || ''}:${it.subjectName || ''}`);
                const seededPool = (Array.isArray(downloadBgPool) ? [...downloadBgPool] : []).sort((a, b) => {
                  const ha = themeHash(a + seed);
                  const hb = themeHash(b + seed + 7);
                  return (ha % 97) - (hb % 97);
                });
                return seededPool[0] || resolveIllustrationUrlByIndex(0, it.topic, it.subjectName, title, [it.topic || '', it.subjectName || '']);
              })();
              const data = await toDataUrl(coverUrl);
              if (data) bgTitle = data;
            }
            if (!bgTitle) {
              // Fallback a la lógica previa (puede variar si no exportamos desde preview)
              const preResolvedCover = (Array.isArray(previewBgPool) && previewBgPool[0]) ? previewBgPool[0] : null;
              // 0) Cover del tema visual si existe
              const themeDefault = resolveThemeDefaultUrl(it.designTheme || previewTheme, 'cover');
              if (themeDefault) bgTitle = await getUniqueBg(0, it.topic, it.subjectName, title, [it.topic || '', it.subjectName || ''], themeDefault);
              // 1) Curado por tema si existe
              if (!bgTitle) {
                const curated = resolveCuratedUrl(it.topic, it.subjectName, title);
                if (curated) bgTitle = await getUniqueBg(0, it.topic, it.subjectName, title, [it.topic || '', it.subjectName || ''], curated);
              }
              if (!bgTitle) {
                bgTitle = await getUniqueBg(0, it.topic, it.subjectName, title, [it.topic || '', it.subjectName || ''], preResolvedCover as any);
              }
            }
            if (bgTitle) {
              const asData = toPptxData(bgTitle);
              console.log('[DEBUG] Cover background loaded:', !!asData);
              slide0.background = asData ? ({ data: asData } as any) : ({ fill: bgColor } as any);
            } else {
              console.log('[DEBUG] No cover background found, using color fill');
              slide0.background = { fill: bgColor } as any;
            }
          } catch { slide0.background = { fill: bgColor } as any; }
          // Overlay semitransparente como en la vista previa (mejora legibilidad)
          slide0.addShape(pptx.shapes.RECTANGLE, {
            x: 0, y: 0, w: 10, h: 5.625,
            fill: { color: 'FFFFFF', transparency: 30 },
            line: { color: 'FFFFFF' }
          } as any);
        }
        // Sin elementos decorativos por estilo: ahora "Estilo" solo afecta negrita/cursiva del texto

        // Portada: textos abajo (izquierda si profesor, derecha en otros casos)
        {
          const courseVal = resolveCourseLabel(it.courseId) || '';
          const subjectValRaw = it.subjectName || '';
          const subjectVal = language === 'en' ? toEnglishSubjectName(subjectValRaw) : subjectValRaw;
          const isTeacher = String(user?.role || '').toLowerCase() === 'teacher';
          const teacherPrefix = (language === 'en' ? 'Teacher' : 'Profesor');
          const teacherName = (user?.displayName || user?.username || '—');
          // Portada: sin prefijos "Tema/Curso/Asignatura"
          const topicText = title || '';
          const topicTextStyled = (fontVar.pptx.titleUppercase || styleVar.pptx.titleUppercase) ? String(topicText).toUpperCase() : topicText;
          const courseText = courseVal;
          const subjectText = subjectVal;
          const align: any = isTeacher ? 'left' : 'right';
          const x = isTeacher ? 0.6 : 0.6; // ancho cubre ambos lados por w
          const w = 8.6;
          slide0.addText(topicTextStyled, {
            x, y: 3.0, w, h: 1,
            fontSize: 36, bold: true, color: ((fontVar.pptx.titleColorPrimary || styleVar.pptx.titleColorPrimary) ? (theme.primary?.replace('#','') || titleColor) : titleColor), align,
            fontFace: fontVar.pptx.titleFont || styleVar.pptx.titleFont,
            shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45, opacity: 0.6 } as any,
            animation: {
              entrance: {
                type: 'flyIn',
                direction: 'fromTop',
                duration: 1500
              }
            } as any
          } as any);
      if (courseVal) {
            slide0.addText(courseText, {
        x, y: 3.7, w, h: 0.6,
              fontSize: 28, bold: true, color: ((fontVar.pptx.titleColorPrimary || styleVar.pptx.titleColorPrimary) ? (theme.primary?.replace('#','') || titleColor) : titleColor), align,
              fontFace: fontVar.pptx.titleFont || styleVar.pptx.titleFont,
              shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45, opacity: 0.6 } as any,
              animation: {
                entrance: {
                  type: 'flyIn',
                  direction: 'fromLeft',
                  duration: 1000,
                  delay: 1000
                }
              } as any
            } as any);
          }
          if (subjectVal) {
            slide0.addText(subjectText, {
        x, y: 4.2, w, h: 0.6,
    fontSize: 28, bold: true, color: ((fontVar.pptx.titleColorPrimary || styleVar.pptx.titleColorPrimary) ? (theme.primary?.replace('#','') || titleColor) : titleColor), align,
      fontFace: fontVar.pptx.titleFont || styleVar.pptx.titleFont,
              shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45, opacity: 0.6 } as any,
              animation: {
                entrance: {
                  type: 'flyIn',
                  direction: 'fromRight',
                  duration: 1000,
                  delay: 1500
                }
              } as any
            } as any);
          }
          slide0.addText(`${teacherPrefix}: ${teacherName}`, {
            x, y: 4.8, w, h: 0.6,
            fontSize: 22, color: contentColor, align,
            fontFace: fontVar.pptx.contentFont || styleVar.pptx.contentFont,
            animation: {
              entrance: {
                type: 'fadeIn',
                duration: 1200,
                delay: 2000
              }
            } as any
          } as any);
        }

  // Mini imagen en portada eliminada (modo profesor)

  // Sin imagen superpuesta en modo diseño

        // Slides de contenido generado por IA
        if (it.slides && it.slides.length > 0) {
          for (let idx = 0; idx < it.slides.length; idx++) {
            const slide = it.slides[idx];
            // Modo "build" para simular animaciones en PowerPoint (revelado progresivo)
            const simulateBuild = false;
            // Mantener el mismo fondo para todas las sub-diapos de este índice
            let contentBgDataUrl: string | null = null;

            const s = pptx.addSlide();

            // Fondo por diseño o con imagen si no es designOnly
            if (useDesign) {
              s.background = { fill: bgColor } as any;
            } else {
              let bgDataUrl: string | null = null;
              console.log('[DEBUG] Loading background for slide', idx + 1);
              try {
                if (isFromPreview) {
                  // Usar exactamente los fondos elegidos en vista previa
                  const chosen = (Array.isArray(previewBgChosen) && previewBgChosen[idx]) ? previewBgChosen[idx] : null;
                  if (chosen) {
                    const data = await toDataUrl(chosen);
                    if (data) bgDataUrl = data;
                  }
                  
                  // Si no hay chosen o falló la descarga, usar lógica de fallback
                  if (!bgDataUrl) {
                    const curated = resolveCuratedUrl(it.topic, it.subjectName, slide.title) || resolveCuratedUrl(it.topic, it.subjectName, (slide.content || []).join(' '));
                    const fallbackChosen = curated ||
                      (Array.isArray(downloadBgPool) && downloadBgPool[idx + 1] ? downloadBgPool[idx + 1] : undefined) ||
                      (slide as any).imageUrl ||
                      resolveIllustrationUrlByIndex(idx + 1, it.topic, it.subjectName, slide.title, slide.content);
                    const data = fallbackChosen ? await toDataUrl(fallbackChosen) : null;
                    if (data) bgDataUrl = data;
                  }
                }
                if (!bgDataUrl) {
                  // Fallback a la lógica previa con unicidad
                  const curated = resolveCuratedUrl(it.topic, it.subjectName, slide.title) || resolveCuratedUrl(it.topic, it.subjectName, (slide.content || []).join(' '));
                  const poolUrl = Array.isArray(previewBgPool) && previewBgPool[idx + 1] ? previewBgPool[idx + 1] : undefined;
                  bgDataUrl = await getUniqueBg(idx + 1, it.topic, it.subjectName, slide.title, slide.content, (curated || (slide as any).imageUrl || poolUrl) as any);
                }
                if (bgDataUrl) {
                  const asData = toPptxData(bgDataUrl);
                  console.log('[DEBUG] Slide', idx + 1, 'background loaded:', !!asData);
                  s.background = asData ? ({ data: asData } as any) : ({ fill: bgColor } as any);
                  contentBgDataUrl = bgDataUrl; // guardar para sub-diapos
                } else {
                  console.log('[DEBUG] No background found for slide', idx + 1, 'using color fill');
                  s.background = { fill: bgColor } as any;
                }
              } catch { s.background = { fill: bgColor } as any; }
              // Overlay semitransparente como en la vista previa
              s.addShape(pptx.shapes.RECTANGLE, {
                x: 0, y: 0, w: 10, h: 5.625,
                fill: { color: 'FFFFFF', transparency: 30 },
                line: { color: 'FFFFFF' }
              } as any);
            }
            // Sin elementos decorativos por estilo

            // Título con animación de entrada y sombra (dejamos espacio a la derecha)
            const slideTitleStyled = (fontVar.pptx.titleUppercase || styleVar.pptx.titleUppercase) ? String(slide.title || '').toUpperCase() : (slide.title || '');
            s.addText(slideTitleStyled, { 
              x: 0.6, y: 0.6, w: 8.0, h: 1,
              fontSize: 32, bold: (styleKind === 'bold') ? true : true, italic: (styleKind === 'italic') ? true : false, color: ((fontVar.pptx.titleColorPrimary || styleVar.pptx.titleColorPrimary) ? (theme.primary?.replace('#','') || titleColor) : titleColor),
              fontFace: fontVar.pptx.titleFont || styleVar.pptx.titleFont,
              shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45, opacity: 0.6 } as any,
              animation: {
                entrance: {
                  type: 'flyIn',
                  direction: 'fromLeft',
                  duration: 1200,
                  delay: 300
                }
              } as any
            } as any);

            // Viñetas reales con indentación y sombra
            if (!simulateBuild) {
              slide.content.forEach((point, pointIdx) => {
                s.addText(point, {
                  x: 0.6, y: 1.9 + (pointIdx * 0.7), w: 8.0, h: 0.6,
                  fontSize: 18, bold: (styleKind === 'bold') ? true : false, italic: (styleKind === 'italic') ? true : false,
                  color: contentColor,
                  bullet: true as any,
                  indentLevel: 1 as any,
                  paraSpaceBefore: 6 as any,
                  fontFace: fontVar.pptx.contentFont || styleVar.pptx.contentFont,
                  shadow: { type: 'outer', color: '000000', blur: 2, offset: 1, angle: 45, opacity: 0.45 } as any
                } as any);
              });
            }

            // Si está activo el modo build, crear sub-diapos que van revelando los puntos
            if (simulateBuild) {
              for (let step = 1; step <= slide.content.length; step++) {
                const s2 = pptx.addSlide();
                // Fondo igual que la primera
                if (useDesign) {
                  s2.background = { fill: bgColor } as any;
                } else {
                  if (contentBgDataUrl) {
                    const asData2 = toPptxData(contentBgDataUrl);
                    s2.background = asData2 ? ({ data: asData2 } as any) : ({ fill: bgColor } as any);
                  } else {
                    s2.background = { fill: bgColor } as any;
                  }
                }
                // Overlay para legibilidad
                s2.addShape(pptx.shapes.RECTANGLE, {
                  x: 0, y: 0, w: 10, h: 5.625,
                  fill: { color: 'FFFFFF', transparency: 30 },
                  line: { color: 'FFFFFF' }
                } as any);
                // Título
                s2.addText(slideTitleStyled, {
                  x: 0.6, y: 0.6, w: 8.0, h: 1,
                  fontSize: 32, bold: (styleKind === 'bold') ? true : true, italic: (styleKind === 'italic') ? true : false, color: ((fontVar.pptx.titleColorPrimary || styleVar.pptx.titleColorPrimary) ? (theme.primary?.replace('#','') || titleColor) : titleColor),
                  fontFace: fontVar.pptx.titleFont || styleVar.pptx.titleFont,
                  shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45, opacity: 0.6 } as any
                } as any);
                // Puntos hasta el índice 'step'
                for (let j = 0; j < step; j++) {
                  const point = slide.content[j];
                  s2.addText(point, {
                    x: 0.6, y: 1.9 + (j * 0.7), w: 8.0, h: 0.6,
                    fontSize: 18, bold: (styleKind === 'bold') ? true : false, italic: (styleKind === 'italic') ? true : false,
                    color: contentColor,
                    bullet: true as any,
                    indentLevel: 1 as any,
                    paraSpaceBefore: 6 as any,
                    fontFace: fontVar.pptx.contentFont || styleVar.pptx.contentFont,
                    shadow: { type: 'outer', color: '000000', blur: 2, offset: 1, angle: 45, opacity: 0.45 } as any
                  } as any);
                }
              }
            }

            // Mini imagen superpuesta eliminada en contenido (modo profesor)

            // Sin imagen superpuesta en modo diseño
          }
        } else {
          // Fallback si no hay slides generadas - con animaciones mejoradas
          const count = Math.max(1, Number(it.slideCount || 10));
          for (let i = 0; i < count - 1; i++) {
            const s = pptx.addSlide();
            
            // Fondo por diseño en fallback (sin elementos decorativos por estilo)
            s.background = { fill: bgColor } as any;

            // Título con animación y sombra (dejamos espacio a la derecha)
            const fbTitle = (fontVar.pptx.titleUppercase || styleVar.pptx.titleUppercase) ? `${String(title || '').toUpperCase()} — ${translate('slidesBulletKeyPoint')} ${i + 1}` : `${title} — ${translate('slidesBulletKeyPoint')} ${i + 1}`;
            s.addText(fbTitle, { 
              x: 0.6, y: 0.6, w: 8.0, h: 1,
              fontSize: 32, bold: true, color: ((fontVar.pptx.titleColorPrimary || styleVar.pptx.titleColorPrimary) ? (theme.primary?.replace('#','') || titleColor) : titleColor),
              fontFace: fontVar.pptx.titleFont || styleVar.pptx.titleFont,
              shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45, opacity: 0.6 } as any,
              animation: { type: 'fadeIn', duration: 1, delay: 0.2 } as any
            } as any);

            // Puntos con animaciones escalonadas
            const fallbackPoints = [
              `${translate('slidesBulletKeyPoint')} #${i + 1}`,
              `${translate('slidesBulletExample')} ${i + 1}`,
              `${translate('slidesBulletSummary')}`
            ];

            fallbackPoints.forEach((point, pointIdx) => {
              s.addText(point, {
                x: 0.6, y: 1.9 + (pointIdx * 0.7), w: 8.0, h: 0.6,
                fontSize: 18,
                color: contentColor,
                bullet: true as any,
                indentLevel: 1 as any,
                paraSpaceBefore: 6 as any,
                fontFace: fontVar.pptx.contentFont || styleVar.pptx.contentFont,
                shadow: { type: 'outer', color: '000000', blur: 2, offset: 1, angle: 45, opacity: 0.45 } as any,
                animation: { type: 'slideUp', duration: 0.5, delay: 0.5 + (pointIdx * 0.25) } as any
              } as any);
            });

            // Sin imagen superpuesta en modo diseño
          }
        }
        
  const fileName = `${(title || (language === 'en' ? 'presentation' : 'presentacion')).replace(/[^a-z0-9\-_]+/gi,'_')}.pptx`;
        // Generar base64 y post-procesar para añadir transiciones genéricas entre diapositivas
        const base64 = await (pptx as any).write('base64');
        // Inyectar transiciones <p:transition><p:fade/></p:transition> a cada slide
        const PizZip = (await import('pizzip')).default as any;
        const binStr = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
        const zip = new PizZip(binStr);
        const files = Object.keys(zip.files || {});
        const slideXmlPaths = files.filter((p: string) => /^ppt\/slides\/slide\d+\.xml$/.test(p));
        slideXmlPaths.forEach((path: string) => {
          try {
            const xml: string = zip.file(path).asText();
            if (xml.includes('<p:transition')) return; // ya tiene transición
            // Insertar transición justo antes de cerrar p:sld
            const needle = '</p:sld>';
            const idx = xml.lastIndexOf(needle);
            if (idx > -1) {
              const transition = '\n  <p:transition spd="med"><p:fade/></p:transition>\n';
              const out = xml.slice(0, idx) + transition + xml.slice(idx);
              zip.file(path, out);
            }
          } catch {}
        });
        // Generar blob PPTX y descargar
        const outBlob: Blob = zip.generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
        const url = URL.createObjectURL(outBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(url); try { a.remove(); } catch {} }, 0);
        
      } else if (format === 'pdf') {
        // Ruta PDF deshabilitada en UI. Mantener por ahora para futuras necesidades.
        // Generar PDF usando jsPDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const title = it.topic || it.title;
        
        // Página de título
        doc.setFontSize(24);
        doc.text(title, pageWidth / 2, 50, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`${translate('slidesLabelSubject')}: ${it.subjectName || ''}`, pageWidth / 2, 80, { align: 'center' });
        doc.text(`${translate('slidesLabelCourse') || 'Curso'}: ${resolveCourseLabel(it.courseId)}`, pageWidth / 2, 100, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`${translate('slidesCreatedAt')}: ${formatDateTime(it.createdAt)}`, pageWidth / 2, 120, { align: 'center' });
        // Imagen del título (única por índice 0)
        try {
          // Reutilizamos una versión simple de toDataUrl aquí
          const toDataUrl = async (url: string): Promise<string | null> => {
            try {
              const res = await fetch(url);
              if (!res.ok) return null;
              const blob = await res.blob();
              return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(String(reader.result || ''));
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch { return null; }
          };
          const primary = Array.isArray(previewBgPool) && previewBgPool[0] ? previewBgPool[0] : resolveIllustrationUrlByIndex(0, it.topic, it.subjectName, title);
          let dataUrl = await toDataUrl(primary);
          if (!dataUrl) {
            const secondary = resolveSecondaryUrlByIndex(0, it.topic, it.subjectName);
            dataUrl = await toDataUrl(secondary);
          }
          if (!dataUrl) {
            const fallback = resolveIllustrationStaticUrl(it.topic, it.subjectName, title);
            dataUrl = await toDataUrl(fallback);
          }
          if (dataUrl) {
            const imgW = pageWidth * 0.35;
            const imgH = imgW * 0.66;
            doc.addImage(dataUrl, 'JPEG', pageWidth - imgW - 20, 30, imgW, imgH);
          }
        } catch {}
        
        // Slides de contenido
        if (it.slides && it.slides.length > 0) {
          for (let index = 0; index < it.slides.length; index++) {
            const slide = it.slides[index];
            doc.addPage();
            doc.setFontSize(18);
            doc.text(slide.title, 20, 30);
            
            // Imagen temática única por índice
            try {
              // 0) Preferir imagen resuelta por IA
              const prefer = (slide as any).imageUrl as string | undefined;
              let dataUrl: string | null = null;
              if (prefer) {
                dataUrl = await (async () => {
                  try { const res = await fetch(prefer); if (!res.ok) return null; const blob = await res.blob(); return await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result || '')); r.onerror = reject; r.readAsDataURL(blob); }); } catch { return null; }
                })();
              }
              if (!dataUrl) {
                const primary = Array.isArray(previewBgPool) && previewBgPool[index + 1] ? previewBgPool[index + 1] : resolveIllustrationUrlByIndex(index + 1, it.topic, it.subjectName, slide.title, slide.content);
                dataUrl = await (async () => {
                  try { const res = await fetch(primary); if (!res.ok) return null; const blob = await res.blob(); return await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result || '')); r.onerror = reject; r.readAsDataURL(blob); }); } catch { return null; }
                })();
              }
              if (!dataUrl) {
                const secondary = resolveSecondaryUrlByIndex(index + 1, it.topic, it.subjectName, slide.content);
                dataUrl = await (async () => {
                  try { const res = await fetch(secondary); if (!res.ok) return null; const blob = await res.blob(); return await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result || '')); r.onerror = reject; r.readAsDataURL(blob); }); } catch { return null; }
                })();
              }
              if (!dataUrl) {
                const fallback = resolveIllustrationStaticUrl(it.topic, it.subjectName, slide.title);
                dataUrl = await (async () => {
                  try { const res = await fetch(fallback); if (!res.ok) return null; const blob = await res.blob(); return await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result || '')); r.onerror = reject; r.readAsDataURL(blob); }); } catch { return null; }
                })();
              }
              if (dataUrl) {
                const imgW = pageWidth * 0.35;
                const imgH = imgW * 0.66;
                doc.addImage(dataUrl, 'JPEG', pageWidth - imgW - 20, 40, imgW, imgH);
              }
            } catch {}
            
            doc.setFontSize(12);
            let yPosition = 60;
            slide.content.forEach((point, pointIndex) => {
              doc.text(`• ${point}`, 20, yPosition);
              yPosition += 20;
            });
          }
        } else {
          // Fallback si no hay slides generadas
          const count = Math.max(1, Number(it.slideCount || 10));
          for (let i = 0; i < count - 1; i++) {
            doc.addPage();
            doc.setFontSize(18);
            doc.text(`${title} — Punto ${i + 1}`, 20, 30);
            
            // Imagen temática única por índice
            try {
              const primary = Array.isArray(previewBgPool) && previewBgPool[i + 1] ? previewBgPool[i + 1] : resolveIllustrationUrlByIndex(i + 1, it.topic, it.subjectName, `${title} ${i+1}`, [`${translate('slidesBulletKeyPoint')} #${i + 1}`, `${translate('slidesBulletExample')} ${i + 1}`, `${translate('slidesBulletSummary')}`]);
              let dataUrl = await (async () => {
                try { const res = await fetch(primary); if (!res.ok) return null; const blob = await res.blob(); return await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result || '')); r.onerror = reject; r.readAsDataURL(blob); }); } catch { return null; }
              })();
              if (!dataUrl) {
                const secondary = resolveSecondaryUrlByIndex(i + 1, it.topic, it.subjectName, [`${translate('slidesBulletKeyPoint')} #${i + 1}`, `${translate('slidesBulletExample')} ${i + 1}`, `${translate('slidesBulletSummary')}`]);
                dataUrl = await (async () => {
                  try { const res = await fetch(secondary); if (!res.ok) return null; const blob = await res.blob(); return await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result || '')); r.onerror = reject; r.readAsDataURL(blob); }); } catch { return null; }
                })();
              }
              if (!dataUrl) {
                const fallback = resolveIllustrationStaticUrl(it.topic, it.subjectName, `${title} ${i+1}`);
                dataUrl = await (async () => {
                  try { const res = await fetch(fallback); if (!res.ok) return null; const blob = await res.blob(); return await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result || '')); r.onerror = reject; r.readAsDataURL(blob); }); } catch { return null; }
                })();
              }
              if (dataUrl) {
                const imgW = pageWidth * 0.35;
                const imgH = imgW * 0.66;
                doc.addImage(dataUrl, 'JPEG', pageWidth - imgW - 20, 40, imgW, imgH);
              }
            } catch {}
            
            doc.setFontSize(12);
            doc.text(`• Punto clave #${i + 1}`, 20, 60);
            doc.text(`• Ejemplo ${i + 1}`, 20, 80);
            doc.text(`• Resumen conceptual`, 20, 100);
          }
        }
        
  const fileName = `${(title || (language === 'en' ? 'presentation' : 'presentacion')).replace(/[^a-z0-9\-_]+/gi,'_')}.pdf`;
        doc.save(fileName);
      }
      
    } catch (e) {
      console.error('[Slides] download error', e);
      alert(`No se pudo generar ${format.toUpperCase()}. Error: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
  };

  // Generar informe detallado de las slides en formato DOCX
  const generateDetailedReport = async (slides: SlideData[], meta: { topic?: string; subjectName?: string }) => {
    try {
      // Mostrar modal de carga mientras se genera el informe
      setShowDetailedReport(true);

      // Importar la biblioteca para generar DOCX
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } = await import('docx');
      
      const isEn = language === 'en';
      const locale = isEn ? 'en-US' : 'es-ES';
      const subject = meta.subjectName || (isEn ? 'Not specified' : 'No especificada');
      const slidesLen = slides.length;

      // Diccionario bilingüe para textos del informe
      const S = {
        docTitle: isEn ? `Detailed Report - ${meta.topic || 'Presentation'}` : `Informe Detallado - ${meta.topic || 'Presentación'}`,
        docDesc: isEn ? 'Automatically generated detailed pedagogical report' : 'Informe pedagógico detallado generado automáticamente',
        coverTitle: isEn ? 'DETAILED PEDAGOGICAL REPORT' : 'INFORME PEDAGÓGICO DETALLADO',
        subjectLabel: isEn ? 'Subject:' : 'Asignatura:',
        totalSlidesLabel: isEn ? 'Total Slides:' : 'Total de Diapositivas:',
        generationDateLabel: isEn ? 'Generation Date:' : 'Fecha de Generación:',
        execSummaryTitle: isEn ? 'EXECUTIVE SUMMARY' : 'RESUMEN EJECUTIVO',
        execSummaryText: (topic?: string, len?: number) => isEn
          ? `This presentation on "${topic}" is designed to provide a comprehensive understanding of the subject through ${len} pedagogically structured slides. Each slide addresses specific aspects of the content, building knowledge progressively and systematically.`
          : `Esta presentación sobre "${topic}" está diseñada para proporcionar una comprensión integral del tema a través de ${len} diapositivas estructuradas pedagógicamente. Cada diapositiva aborda aspectos específicos del contenido, construyendo conocimiento de manera progresiva y sistemática.`,
        objectivesTitle: isEn ? 'LEARNING OBJECTIVES' : 'OBJETIVOS DE APRENDIZAJE',
        objectivesLead: isEn
          ? 'By the end of this presentation, students will be able to:'
          : 'Al finalizar esta presentación, los estudiantes serán capaces de:',
        objectiveItem: (slideTitle: string) => isEn
          ? `Understand and explain concepts related to: ${slideTitle.toLowerCase()}`
          : `Comprender y explicar conceptos relacionados con: ${slideTitle.toLowerCase()}`,
        moreTopics: (n: number) => isEn
          ? `... and other ${n} additional topics covered in the presentation.`
          : `... y otros ${n} temas adicionales cubiertos en la presentación.`,
        analysisTitle: isEn ? 'DETAILED ANALYSIS PER SLIDE' : 'ANÁLISIS DETALLADO POR DIAPOSITIVA',
        slideHeadingPrefix: isEn ? 'Slide' : 'Diapositiva',
        contextHeading: isEn ? '📋 Context and Theoretical Foundations:' : '📋 Contexto y Fundamentación Teórica:',
        contextParagraph: (slideTitle: string, i: number, total: number, topic?: string, subjectName?: string) => {
          if (isEn) {
            if (i === 0) return `This introductory slide "${slideTitle}" establishes the fundamental conceptual bases that will support the subsequent development of the content. Its function is to contextualize learning within the curricular framework of ${subjectName || 'the subject'}.`;
            if (i === total - 1) return `This closing slide "${slideTitle}" aims to consolidate and synthesize all the concepts developed previously, facilitating the construction of an integral and coherent understanding of ${topic}.`;
            return `This slide specifically develops aspects related to "${slideTitle}", deepening theoretical and practical elements that broaden the understanding of the central topic. It connects directly with prior knowledge established in previous slides.`;
          } else {
            if (i === 0) return `Esta diapositiva introduce el tema principal "${slideTitle}" estableciendo las bases conceptuales fundamentales que servirán como cimiento para el desarrollo posterior del contenido. Su función es contextualizar el aprendizaje dentro del marco curricular de ${subjectName || 'la asignatura'}.`;
            if (i === total - 1) return `Esta diapositiva de cierre "${slideTitle}" tiene como propósito consolidar y sintetizar todos los conceptos desarrollados previamente, facilitando la construcción de un conocimiento integral y coherente sobre ${topic}.`;
            return `Esta diapositiva desarrolla específicamente aspectos relacionados con "${slideTitle}", profundizando en elementos teóricos y prácticos que amplían la comprensión del tema central. Se conecta directamente con los conocimientos previos establecidos en las diapositivas anteriores.`;
          }
        },
        perPointHeading: isEn ? '📝 Detailed Analysis of Each Point:' : '📝 Análisis Detallado de Cada Punto:',
        pointPrefix: isEn ? 'Point' : 'Punto',
        explanationHeading: isEn ? '🔍 Explanation and Rationale:' : '🔍 Explicación y Fundamentos:',
        explanationParagraph: (slideTitle: string, point: string, subjectName?: string) => isEn
          ? `This point addresses a fundamental aspect of the topic "${slideTitle}". ${point} represents a key concept that must be deeply understood to achieve effective content assimilation. Its importance lies in its direct connection to the learning objectives established for ${subjectName || 'the subject'}.`
          : `Este punto aborda un aspecto fundamental del tema "${slideTitle}". ${point} representa un concepto clave que debe ser comprendido en profundidad para lograr una asimilación efectiva del contenido. La importancia de este elemento radica en su conexión directa con los objetivos de aprendizaje establecidos para ${subjectName || 'la materia'}.`,
        baseHeading: isEn ? '📚 Theoretical and Curricular Basis:' : '📚 Base Teórica y Curricular:',
        baseParagraph: (pointIdx: number, i: number, total: number) => {
          const stage = pointIdx === 0 ? (isEn ? 'basic principles and essential definitions of the topic' : 'los principios básicos y definiciones esenciales del tema')
            : pointIdx === 1 ? (isEn ? 'the development of intermediate analysis and comprehension skills' : 'el desarrollo de habilidades de análisis y comprensión intermedia')
            : pointIdx === 2 ? (isEn ? 'practical application and synthesis of knowledge' : 'la aplicación práctica y síntesis de conocimientos')
            : (isEn ? 'the integration and evaluation of complex concepts' : 'la integración y evaluación de conceptos complejos');
          const purpose = i < total / 3 ? (isEn ? 'establish solid knowledge foundations' : 'establecer bases sólidas de conocimiento')
            : i < (total * 2) / 3 ? (isEn ? 'develop specific and applicable competencies' : 'desarrollar competencias específicas y aplicables')
            : (isEn ? 'consolidate learning and foster critical thinking' : 'consolidar aprendizajes y fomentar el pensamiento crítico');
          return isEn
            ? `From a pedagogical standpoint, this concept is grounded in ${stage}. Its inclusion in the curriculum responds to the need to ${purpose}.`
            : `Desde el punto de vista pedagógico, este concepto se fundamenta en ${stage}. Su inclusión en el currículo responde a la necesidad de ${purpose}.`;
        },
        specificObjectivesHeading: isEn ? '🎯 Specific Learning Objectives:' : '🎯 Objetivos Específicos de Aprendizaje:',
        specificObjectivesParagraph: (pointIdx: number, i: number, total: number) => {
          const c1 = pointIdx < 2 ? (isEn ? 'identify and define fundamental concepts' : 'identificar y definir conceptos fundamentales') : (isEn ? 'analyze and evaluate complex information' : 'analizar y evaluar información compleja');
          const c2 = pointIdx === 0 ? (isEn ? 'establish basic relationships between concepts' : 'establecer relaciones básicas entre conceptos')
            : pointIdx === 1 ? (isEn ? 'apply knowledge in specific contexts' : 'aplicar conocimientos en contextos específicos')
            : (isEn ? 'synthesize information and generate well-founded conclusions' : 'sintetizar información y generar conclusiones fundamentadas');
          const c3 = i < total / 2 ? (isEn ? 'build a solid foundation for subsequent learning' : 'construir una base sólida para aprendizajes posteriores') : (isEn ? 'integrate prior knowledge with new specialized information' : 'integrar conocimientos previos con nueva información especializada');
          return isEn
            ? `By studying this point, the student will develop the ability to: (1) ${c1}, (2) ${c2}, and (3) ${c3}.`
            : `Al estudiar este punto, el estudiante desarrollará la capacidad de: (1) ${c1}, (2) ${c2}, y (3) ${c3}.`;
        },
        strategiesHeading: isEn ? '💡 Recommended Teaching Strategies:' : '💡 Estrategias de Enseñanza Recomendadas:',
        strategiesParagraph: (pointIdx: number, i: number, total: number) => {
          const strat = pointIdx === 0 ? (isEn ? 'use concrete and familiar examples that facilitate initial understanding, followed by guided exploration activities' : 'utilizar ejemplos concretos y familiares que faciliten la comprensión inicial, seguidos de actividades de exploración guiada')
            : pointIdx === 1 ? (isEn ? 'implement practical exercises that allow direct application of the concept, fostering active participation' : 'implementar ejercicios prácticos que permitan la aplicación directa del concepto, fomentando la participación activa')
            : pointIdx === 2 ? (isEn ? 'promote debates and discussions that stimulate critical thinking and well-founded argumentation' : 'promover debates y discusiones que estimulen el pensamiento crítico y la argumentación fundamentada')
            : (isEn ? 'develop integrative projects that consolidate multiple aspects of learning' : 'desarrollar proyectos integradores que consoliden múltiples aspectos del aprendizaje');
          const note = i < total / 3 ? (isEn ? 'verify understanding before moving to the next level' : 'verificar la comprensión antes de avanzar al siguiente nivel') : (isEn ? 'connect this knowledge with students’ prior experiences' : 'conectar este conocimiento con experiencias previas del estudiante');
          return isEn
            ? `For effective teaching of this concept, it is recommended to ${strat}. It is essential to ${note}.`
            : `Para la enseñanza efectiva de este concepto se recomienda: ${strat}. Es fundamental ${note}.`;
        },
        connectionsHeading: isEn ? '🔗 Interdisciplinary Connections:' : '🔗 Conexiones Interdisciplinarias:',
        connectionsParagraph: (subjectName?: string) => {
          const sub = (subjectName || '').toLowerCase();
          const areas = sub.includes('ciencias') ? (isEn ? 'mathematics, technology, and environmental studies' : 'matemáticas, tecnología y estudios ambientales')
            : (sub.includes('matemát') || sub.includes('matemat')) ? (isEn ? 'natural sciences, technology, and logical thinking' : 'ciencias naturales, tecnología y pensamiento lógico')
            : (sub.includes('historia') || sub.includes('social')) ? (isEn ? 'geography, civics, and literature' : 'geografía, educación cívica y literatura')
            : (sub.includes('lengua') || sub.includes('idioma') || sub.includes('literat')) ? (isEn ? 'literature, history, and communication' : 'literatura, historia y comunicación')
            : (isEn ? 'multiple disciplines across the school curriculum' : 'múltiples disciplinas del currículo escolar');
          return isEn
            ? `This concept is significantly related to other areas of knowledge, particularly ${areas}. This interconnection enables students to develop an integral vision of knowledge and understand the cross-disciplinary applicability of the concepts learned.`
            : `Este concepto se relaciona de manera significativa con otras áreas del conocimiento, particularmente con ${areas}. Esta interconexión permite al estudiante desarrollar una visión integral del conocimiento y comprender la aplicabilidad transversal de los conceptos aprendidos.`;
        },
        assessmentHeading: isEn ? '⚡ Assessment and Feedback:' : '⚡ Evaluación y Retroalimentación:',
        assessmentParagraph: (i: number, total: number) => isEn
          ? `To assess understanding of this slide, it is recommended to implement: (1) immediate verification questions for each point presented, (2) practical application activities that demonstrate knowledge transfer, (3) connection exercises that relate new concepts to prior learning, and (4) ${i === total - 1 ? 'a comprehensive assessment that synthesizes all concepts developed throughout the presentation' : 'preparation for the concepts to be developed in subsequent slides'}.`
          : `Para evaluar la comprensión de esta diapositiva se sugiere implementar: (1) Preguntas de verificación inmediata para cada punto presentado, (2) Actividades de aplicación práctica que demuestren la transferencia del conocimiento, (3) Ejercicios de conexión que relacionen los nuevos conceptos con aprendizajes previos, y (4) ${i === total - 1 ? 'Una evaluación integral que sintetice todos los conceptos desarrollados a lo largo de la presentación' : 'Preparación para los conceptos que se desarrollarán en las siguientes diapositivas'}.`,
        conclusionsTitle: isEn ? 'CONCLUSIONS AND RECOMMENDATIONS' : 'CONCLUSIONES Y RECOMENDACIONES',
        conclusionParagraph: (topic?: string, len?: number, subjectName?: string) => isEn
          ? `This presentation on "${topic}" offers a solid pedagogical structure that enables the progressive development of knowledge. The sequence of ${len} slides is designed to maximize understanding and retention of key concepts in ${subjectName || 'the corresponding subject'}.`
          : `Esta presentación sobre "${topic}" ofrece una estructura pedagógica sólida que permite el desarrollo progresivo del conocimiento. La secuencia de ${len} diapositivas está diseñada para maximizar la comprensión y retención de conceptos clave en ${subjectName || 'la asignatura correspondiente'}.`,
        implementationNote: isEn
          ? 'Successful implementation of this presentation will depend on adapting the content to the specific classroom context and the particular needs of students.'
          : 'La implementación exitosa de esta presentación dependerá de la adaptación del contenido al contexto específico del aula y las necesidades particulares de los estudiantes.'
      } as const;

      // Crear documento con estilo profesional
      const doc = new Document({
        creator: user?.displayName || user?.username || 'Smart Student',
        title: S.docTitle,
        description: S.docDesc,
        styles: {
          default: {
            heading1: {
              run: {
                size: 32,
                bold: true,
                color: "2E86AB",
              },
              paragraph: {
                spacing: { after: 300, before: 200 },
              },
            },
            heading2: {
              run: {
                size: 26,
                bold: true,
                color: "A23B72",
              },
              paragraph: {
                spacing: { after: 200, before: 200 },
              },
            },
            heading3: {
              run: {
                size: 22,
                bold: true,
                color: "F18F01",
              },
              paragraph: {
                spacing: { after: 150, before: 150 },
              },
            },
          },
        },
        sections: [
          {
            children: [
              // Portada elegante
              new Paragraph({
                children: [
                  new TextRun({
                    text: S.coverTitle,
                    bold: true,
                    size: 36,
                    color: "2E86AB",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({
                    text: meta.topic || 'Presentación Educativa',
                    bold: true,
                    size: 28,
                    color: "A23B72",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
              }),

              // Información general en tabla elegante
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: "2E86AB" },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: "2E86AB" },
                  left: { style: BorderStyle.SINGLE, size: 2, color: "2E86AB" },
                  right: { style: BorderStyle.SINGLE, size: 2, color: "2E86AB" },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: S.subjectLabel, bold: true, color: "2E86AB" })] })],
                        shading: { fill: "E8F4F8" },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: subject })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: S.totalSlidesLabel, bold: true, color: "2E86AB" })] })],
                        shading: { fill: "E8F4F8" },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: slides.length.toString() })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: S.generationDateLabel, bold: true, color: "2E86AB" })] })],
                        shading: { fill: "E8F4F8" },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: new Date().toLocaleString(locale, { 
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        }) })] })],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: "", spacing: { after: 400 } }),

              // Resumen Ejecutivo
              new Paragraph({
        children: [new TextRun({ text: S.execSummaryTitle, bold: true, size: 24, color: "2E86AB" })],
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
              }),

              new Paragraph({
                children: [
                  new TextRun({
          text: S.execSummaryText(meta.topic, slidesLen),
                    size: 22,
                  }),
                ],
                spacing: { after: 300 },
                alignment: AlignmentType.JUSTIFIED,
              }),

              // Objetivos de Aprendizaje
              new Paragraph({
                children: [new TextRun({ text: S.objectivesTitle, bold: true, size: 24, color: "A23B72" })],
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
              }),

              new Paragraph({
                children: [new TextRun({ text: S.objectivesLead, bold: true, size: 20 })],
                spacing: { after: 150 },
              }),

              // Lista de objetivos
              ...slides.slice(0, 5).map((slide, idx) => 
                new Paragraph({
                  children: [
                    new TextRun({ text: `${idx + 1}. `, bold: true, color: "F18F01" }),
                    new TextRun({ text: S.objectiveItem(slide.title), size: 20 }),
                  ],
                  spacing: { after: 100 },
                })
              ),

              ...(slides.length > 5 ? [
                new Paragraph({
                  children: [new TextRun({ text: S.moreTopics(slides.length - 5), italics: true, size: 18 })],
                  spacing: { after: 300 },
                })
              ] : []),

              // Análisis por diapositiva
              new Paragraph({
                children: [new TextRun({ text: S.analysisTitle, bold: true, size: 24, color: "2E86AB" })],
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
              }),

              // Análisis individual de cada slide con explicación detallada de cada punto
              ...slides.flatMap((slide, i) => [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${S.slideHeadingPrefix} ${i + 1}: `, bold: true, size: 22, color: "2E86AB" }),
                    new TextRun({ text: slide.title, bold: true, size: 22, color: "F18F01" }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                  spacing: { after: 150, before: 200 },
                }),

                new Paragraph({
                  children: [new TextRun({ text: S.contextHeading, bold: true, size: 18, color: "2E86AB" })],
                  spacing: { after: 100 },
                }),

                new Paragraph({
                  children: [new TextRun({
                    text: S.contextParagraph(slide.title, i, slides.length, meta.topic, meta.subjectName),
                    size: 20,
                  })],
                  spacing: { after: 150 },
                  alignment: AlignmentType.JUSTIFIED,
                }),

                new Paragraph({
                  children: [new TextRun({ text: S.perPointHeading, bold: true, size: 18, color: "A23B72" })],
                  spacing: { after: 100 },
                }),

                // Análisis punto por punto con explicación detallada
                ...slide.content.flatMap((point, pointIdx) => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${S.pointPrefix} ${pointIdx + 1}: `, bold: true, color: "F18F01", size: 18 }),
                      new TextRun({ text: point, bold: true, size: 18 }),
                    ],
                    spacing: { after: 80, before: 100 },
                  }),

                  new Paragraph({
                    children: [new TextRun({ text: S.explanationHeading, bold: true, color: "2E86AB", size: 16 })],
                    spacing: { after: 50 },
                  }),

                  new Paragraph({
                    children: [new TextRun({
                      text: S.explanationParagraph(slide.title, point, meta.subjectName),
                      size: 16,
                    })],
                    spacing: { after: 80 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),

                  new Paragraph({
                    children: [new TextRun({ text: S.baseHeading, bold: true, color: "A23B72", size: 16 })],
                    spacing: { after: 50 },
                  }),

                  new Paragraph({
                    children: [new TextRun({
                      text: S.baseParagraph(pointIdx, i, slides.length),
                      size: 16,
                    })],
                    spacing: { after: 80 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),

                  new Paragraph({
                    children: [new TextRun({ text: S.specificObjectivesHeading, bold: true, color: "F18F01", size: 16 })],
                    spacing: { after: 50 },
                  }),

                  new Paragraph({
                    children: [new TextRun({
                      text: S.specificObjectivesParagraph(pointIdx, i, slides.length),
                      size: 16,
                    })],
                    spacing: { after: 80 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),

                  new Paragraph({
                    children: [new TextRun({ text: S.strategiesHeading, bold: true, color: "2E86AB", size: 16 })],
                    spacing: { after: 50 },
                  }),

                  new Paragraph({
                    children: [new TextRun({
                      text: S.strategiesParagraph(pointIdx, i, slides.length),
                      size: 16,
                    })],
                    spacing: { after: 80 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),

                  new Paragraph({
                    children: [new TextRun({ text: S.connectionsHeading, bold: true, color: "A23B72", size: 16 })],
                    spacing: { after: 50 },
                  }),

                  new Paragraph({
                    children: [new TextRun({
                      text: S.connectionsParagraph(meta.subjectName),
                      size: 16,
                    })],
                    spacing: { after: 120 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                ]),

                new Paragraph({
                  children: [new TextRun({ text: S.assessmentHeading, bold: true, size: 18, color: "2E86AB" })],
                  spacing: { after: 100, before: 150 },
                }),

                new Paragraph({
                  children: [new TextRun({
                    text: S.assessmentParagraph(i, slides.length),
                    size: 18,
                  })],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                }),

                new Paragraph({ text: "─────────────────────────────────────────────", spacing: { after: 200 }, alignment: AlignmentType.CENTER }),
              ]),

              // Conclusiones
              new Paragraph({
        children: [new TextRun({ text: S.conclusionsTitle, bold: true, size: 24, color: "2E86AB" })],
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200, before: 300 },
              }),

              new Paragraph({
                children: [
                  new TextRun({
          text: S.conclusionParagraph(meta.topic, slidesLen, meta.subjectName),
                    size: 20,
                  }),
                ],
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED,
              }),

              new Paragraph({
                children: [
                  new TextRun({
          text: S.implementationNote,
                    size: 20,
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.JUSTIFIED,
              }),
            ],
          },
        ],
      });

      // Generar y descargar el archivo DOCX
  const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
  const filename = `${isEn ? 'Detailed_Report' : 'Informe_Detallado'}_${meta.topic?.replace(/[^a-z0-9\-_]+/gi, '_') || (isEn ? 'Presentation' : 'Presentacion')}.docx`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Cerrar el modal después de un breve delay
      setTimeout(() => setShowDetailedReport(false), 1000);

    } catch (error) {
      console.error('Error generating detailed DOCX report:', error);
      alert('Error al generar el informe en DOCX. Asegúrese de que la biblioteca esté disponible.');
      setShowDetailedReport(false);
    }
  };

  const sorted = useMemo(() => {
    if (!user) return [] as SlideItem[];
    const list = items.filter(i => (i.ownerId === user.id) || (i.ownerUsername === user.username));
    return [...list].sort((a,b)=> b.createdAt - a.createdAt);
  }, [items, user]);

  // Helper: abrir vista previa y precargar posibles fondos/miniaturas
  const openPreview = async (it: SlideItem) => {
    setPreviewSlides(it.slides || []);
    setCurrentSlideIndex(0);
    setShowPreview(true);
    setPreviewMeta({ topic: it.topic, subjectName: it.subjectName });
    setPreviewTheme(String(it.designTheme || 'professional'));
  setPreviewStyle(String((it.designStyle === 'accents' || it.designStyle === 'grid' || it.designStyle === 'bubbles') ? 'normal' : (it.designStyle || 'normal')));
  setPreviewFontStyle(String(it.designFontStyle || 'classic'));
  // Si el item no especifica, por defecto usamos imágenes (no diseño-only)
  setPreviewDesignOnly(it.useDesignOnly === true ? true : false);
  setPreviewSelectedSectionId(String(it.sectionId || ''));
    // Intentar precargar un pool de imágenes para miniaturas y fondos
    try {
      const len = Math.max(1, (it.slides?.length || Number(it.slideCount || 10)) + 1);
      if (it.topic && it.subjectName) {
  const styleTag = `${it.designTheme || 'professional'}-${(it.designStyle === 'accents' || it.designStyle === 'grid' || it.designStyle === 'bubbles') ? 'normal' : (it.designStyle || 'normal')}`;
        const themedTopic = buildAugmentedTopicForAI(it.topic, it.designTheme, it.designStyle);
        const res = await fetch(`/api/search-images?topic=${encodeURIComponent(themedTopic)}&subject=${encodeURIComponent(it.subjectName)}&n=${Math.min(31, len)}&ai=gemini&style=${encodeURIComponent(styleTag)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.urls) ? data.urls.filter((u:string)=> typeof u === 'string' && u) : [];
          setPreviewBgPool(list);
        } else {
          setPreviewBgPool([]);
        }
      } else {
        setPreviewBgPool([]);
      }
    } catch { setPreviewBgPool([]); }
  };

  // Regenerar pool de imágenes cuando cambie tema/estilo en vista previa
  useEffect(() => {
    const refetchImagesForThemeChange = async () => {
      if (!showPreview || !previewMeta.topic || !previewMeta.subjectName) return;
      
      try {
        const len = Math.max(1, (previewSlides?.length || 10) + 1);
  const styleTag = `${previewTheme}-${previewStyle}`;
  const themedTopic = buildAugmentedTopicForAI(previewMeta.topic, previewTheme, previewStyle);
  const res = await fetch(`/api/search-images?topic=${encodeURIComponent(themedTopic)}&subject=${encodeURIComponent(previewMeta.subjectName)}&n=${Math.min(31, len)}&ai=gemini&style=${encodeURIComponent(styleTag)}&refresh=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.urls) ? data.urls.filter((u:string)=> typeof u === 'string' && u) : [];
          setPreviewBgPool(list);
        }
      } catch (e) {
        console.warn('Error refetching images for theme change:', e);
      }
    };

    refetchImagesForThemeChange();
  }, [previewTheme, previewStyle, showPreview, previewMeta.topic, previewMeta.subjectName]);

  // Regenerar pool de imágenes cuando cambie tema o estilo en vista previa
  useEffect(() => {
    if (!showPreview || !previewMeta.topic || !previewMeta.subjectName) return;
    
    const regenerateImagePool = async () => {
      try {
        const nSlides = Math.max(1, (previewSlides?.length || 10) + 1);
  const styleTag = `${previewTheme}-${previewStyle}`;
  const themedTopic = buildAugmentedTopicForAI(previewMeta.topic, previewTheme, previewStyle);
  const res = await fetch(`/api/search-images?topic=${encodeURIComponent(themedTopic || '')}&subject=${encodeURIComponent(previewMeta.subjectName || '')}&n=${Math.min(31, nSlides)}&ai=gemini&style=${encodeURIComponent(styleTag)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.urls) ? data.urls.filter((u:string)=> typeof u === 'string' && u) : [];
          setPreviewBgPool(list);
        }
      } catch (e) {
        console.log('Error regenerating image pool:', e);
      }
    };
    
    regenerateImagePool();
  }, [previewTheme, previewStyle, showPreview, previewMeta.topic, previewMeta.subjectName]);

  // Calcular fondos únicos para cada slide en la vista previa cuando haya datos
  useEffect(() => {
    try {
      if (!showPreview || !previewSlides || previewSlides.length === 0) {
        setPreviewBgChosen([]);
        return;
      }
  // Reordenar el pool según una semilla derivada del tema/estilo para variar el fondo por diseño
      const rawPool = Array.isArray(previewBgPool) ? [...previewBgPool] : [];
      const seed = themeHash(`${previewTheme}:${previewStyle}:${previewMeta.topic || ''}:${previewMeta.subjectName || ''}`);
      const pool = rawPool.sort((a, b) => {
        const ha = themeHash(a + seed);
        const hb = themeHash(b + seed + 13);
        return (ha % 101) - (hb % 101);
      });
      const used = new Set<string>();
  // Reservar la imagen utilizada en la portada para asegurar unicidad con la diapositiva 1
      try {
        const themeDefault = resolveThemeDefaultUrl(previewTheme, 'cover');
        const curated0 = resolveCuratedUrl(previewMeta.topic, previewMeta.subjectName, previewMeta.topic);
  // Forzar portada del tema visual; si no existe, caer a curado/heurística
        const coverPrimary = toDirectUrl(themeDefault || curated0 || resolveIllustrationUrlByIndex(
          0,
          previewMeta.topic,
          previewMeta.subjectName,
          previewMeta.topic,
          [previewMeta.topic || '', previewMeta.subjectName || '']
        ));
  // Permitir repetir el fondo del tema visual en todas las slides: no marcarlo como usado
        const themeDefaultDirect = toDirectUrl(themeDefault || '');
        if (coverPrimary && coverPrimary !== themeDefaultDirect) used.add(coverPrimary);
      } catch {}
  const chosen: string[] = [];
  const thumbs: string[] = [];
      for (let idx = 0; idx < previewSlides.length; idx++) {
        const s = previewSlides[idx];
        const themeSlide = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'slide'));
        const themeCover = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'cover'));
        if (themeSlide || themeCover) {
          // Regla correcta: la portada (renderizada fuera de este bucle) usa 'cover'.
          // Todas las diapositivas de contenido deben usar SIEMPRE 'slide' del tema (si existe)
          // para que la imagen de portada NO se repita en la diapositiva 1.
          const themedContent = (themeSlide || themeCover || '');
          chosen[idx] = themedContent;
          thumbs[idx] = themedContent;
          // No marcamos como usado para permitir repetición del fondo temático según la regla de 2 imágenes
          continue;
        }
        // Si por alguna razón el tema no define imagen, utilizar lógica de respaldo
        const candidates = [
          toDirectUrl(s.imageUrl),
          toDirectUrl(pool[idx + 1]),
          toDirectUrl(resolveIllustrationUrlByIndex(idx + 1, previewMeta.topic, previewMeta.subjectName, s.title, s.content)),
          toDirectUrl(resolveSecondaryUrlByIndex(idx + 1, previewMeta.topic, previewMeta.subjectName, s.content)),
          toDirectUrl(resolveIllustrationStaticUrl(previewMeta.topic, previewMeta.subjectName, s.title)),
        ].filter(Boolean) as string[];
        let pick = candidates.find((u) => u && !used.has(u));
        if (!pick) pick = candidates[0] || '';
        chosen[idx] = pick || '';
        if (pick) used.add(pick);
        thumbs[idx] = pick || '';
      }
      setPreviewBgChosen(chosen);
  // Persistir thumbUrl en previewSlides igual al fondo elegido para mantener consistencia también en exportación
      try {
        const needUpdate = Array.isArray(previewSlides) && previewSlides.some((sl, i) => {
          const nextThumb = thumbs[i] || sl.thumbUrl || '';
          return (sl.thumbUrl || '') !== nextThumb;
        });
        if (needUpdate) {
          setPreviewSlides(prev => prev.map((sl, i) => {
            const nextThumb = thumbs[i] || sl.thumbUrl;
            return (sl.thumbUrl === nextThumb) ? sl : { ...sl, thumbUrl: nextThumb };
          }));
        }
      } catch {}
    } catch {
      setPreviewBgChosen([]);
    }
  }, [
    showPreview,
    previewSlides?.length,
    previewBgPool?.length,
    previewMeta.topic,
    previewMeta.subjectName,
    previewTheme,
    previewStyle
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Header */}
      <div className="relative max-w-7xl mx-auto px-6 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-[0_8px_24px_-12px_rgba(2,6,23,0.3)]">
          {/* Accent layers */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(2,6,23,0.06) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          </div>
          <div className="relative px-8 py-10 sm:px-10 sm:py-12">
            <div className="flex justify-center">
              <div className="relative rounded-full p-3 bg-white/80 dark:bg-white/10 ring-1 ring-slate-200/70 dark:ring-white/10 shadow-sm">
                <Presentation className="w-10 h-10 text-indigo-600 dark:text-indigo-300" />
              </div>
            </div>
            <h1 className="mt-4 text-center text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {translate('slidesPageTitle') || 'Presentaciones Inteligentes'}
            </h1>
            <p className="mt-2 text-center text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {translate('slidesPageSub') || 'Crea presentaciones profesionales con IA en segundos. Elige tu tema, diseño y ¡listo!'}
            </p>
            <div className="mt-5 flex justify-center">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-300">
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  <span>{translate('slidesFeatureAI') || 'Asistencia IA'}</span>
                </div>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>{translate('slidesFeatureDownloadPptx') || 'Descarga PPTX'}</span>
                </div>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <span>{translate('slidesFeatureDesign') || 'Múltiples diseños'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        
  {/* Tarjeta de creación nueva */}
  <Card className="mt-6 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-white to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {translate('slidesNewSlideLabel') || 'Nueva Presentación'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {translate('slidesNewSlideSub') || 'Crea diapositivas profesionales con inteligencia artificial'}
                  </p>
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de Curso-Sección */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {tr('slidesCourseSectionLabel', 'Curso - Sección', 'Course - Section')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(assignedSections.length > 0 ? assignedSections : sections).map((s:any) => {
                    const active = String(draft.sectionId||'') === String(s.id);
                    const label = (() => {
                      const course = courses.find((c:any)=> String(c.id)===String(s.courseId));
                      return `${course?.name || ''} ${s.name || s.sectionName || ''}`.trim();
                    })();
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setDraft((d:any)=> ({ ...d, sectionId: s.id, courseId: s.courseId, subjectId: '' }))}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
                          active 
                            ? 'bg-gradient-to-r from-lime-100 to-green-100 text-lime-800 border-lime-300 shadow-lg' 
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selección de Asignatura */}
              {!!draft.sectionId && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    {translate('slidesSubjectLabel') || 'Asignatura'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const list = assignedSubjectsBySection[draft.sectionId] || assignedSubjectsByCourse[draft.courseId] || [];
                      const unique: Array<{ id: string; name: string }> = [];
                      const seen = new Set<string>();
                      list.forEach(s => { const k = s.id || s.name; if (k && !seen.has(k)) { seen.add(k); unique.push(s); } });
                      return unique.map((s:any) => {
                        const sid = String(s.id || s.name);
                        const active = String(draft.subjectId||'') === sid;
                        return (
                          <button
                            key={sid}
                            type="button"
                            onClick={() => setDraft((d:any)=> ({ ...d, subjectId: sid }))}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
                              active 
                                ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300 shadow-lg' 
                                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {s.name || s.id}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Tema de la presentación */}
            <div className="space-y-3 mt-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                {translate('slidesTopicLabel') || 'Tema'}
              </label>
              <input 
                className="w-full border-2 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                value={draft.topic || ''} 
                onChange={e=> setDraft((d:any)=> ({...d, topic: e.target.value }))} 
                placeholder={translate('slidesTopicPlaceholder') || 'Ej: Ecosistemas, Historia de México, Álgebra...'} 
              />
            </div>
            
            {/* Selección de Tema de Diseño - Mejorada para mostrar diferencias visuales */}
            <div className="space-y-3 mt-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-500" />
                {translate('slidesDesignLabel') || 'Diseño / Tema Visual'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(designThemes).map(([key, theme]) => {
                const isSelected = draft.designTheme === key;
                // Priorizar imagen personalizada guardada
                const previewImage = resolveThemeDefaultUrl(key, 'cover') || '';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDraft((d:any) => ({ ...d, designTheme: key }))}
                    onDoubleClick={() => { if (key === 'default') setShowThemeCustomize({ themeKey: key }); }}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all transform hover:scale-105 overflow-hidden ${
                      isSelected 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg dark:from-zinc-800 dark:to-zinc-800 dark:text-zinc-100' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-zinc-700 dark:hover:border-zinc-600'
                    }`}
                    style={{ borderColor: isSelected ? theme.primary : undefined }}
                  >
                    {/* Imagen de fondo representativa del tema + degradado de respaldo */}
                    <div className="absolute inset-0">
                      {/* Capa de degradado por si la imagen falla */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} style={{ opacity: 0.15 }} />
                      {previewImage && (
                        // Unificar opacidad para que todas las opciones (incluida "Elegante") se vean difusas por igual
                        <div className="absolute inset-0" style={{ opacity: 0.20 }}>
                          <img
                            src={previewImage}
                            alt={theme.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Contenido del botón */}
                    <div className="relative z-10">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.gradient} shadow-sm`}
                        />
                        <span className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{
                          tr(
                            `slidesTheme${key.charAt(0).toUpperCase()}${key.slice(1)}Name`,
                            theme.name,
                            // Fallback en inglés para las 5 claves conocidas
                            key === 'default' ? 'Default' :
                            key === 'professional' ? 'Professional' :
                            key === 'modern' ? 'Modern' :
                            key === 'warm' ? 'Warm' :
                            key === 'nature' ? 'Nature' :
                            key === 'elegant' ? 'Elegant' : theme.name
                          )
                        }</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-300">{
                        tr(
                          `slidesTheme${key.charAt(0).toUpperCase()}${key.slice(1)}Desc`,
                          theme.description,
                          key === 'default' ? 'Institutional style' :
                          key === 'professional' ? 'Corporate and elegant design' :
                          key === 'modern' ? 'Contemporary and vibrant style' :
                          key === 'warm' ? 'Cozy and energetic tones' :
                          key === 'nature' ? 'Inspired by nature' :
                          key === 'elegant' ? 'Sophisticated and refined' : theme.description
                        )
                      }</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Estilo (efecto de texto) - igual que en Vista Previa */}
            <div className="mt-3">
              <label className="text-sm font-medium block mb-2">{tr('slidesDesignStyle', 'Estilo', 'Style')}</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'normal', es: 'Normal', en: 'Normal' },
                  { id: 'italic', es: 'Cursiva', en: 'Italic' },
                  { id: 'bold', es: 'Negrita', en: 'Bold' }
                ].map(opt => {
                  const active = draft.designStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraft((d:any)=> ({ ...d, designStyle: opt.id }))}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
                        active
                          ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300 shadow-lg'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {language === 'en' ? opt.en : opt.es}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nuevo: Fuente (letras/colores) */}
            <div className="mt-3">
              <label className="text-sm font-medium block mb-2">Fuente</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'classic', es: 'Clásico', en: 'Classic' },
                  { id: 'structured', es: 'Estructurado', en: 'Structured' },
                  { id: 'serif', es: 'Serif', en: 'Serif' }
                ].map(opt => {
                  const active = draft.designFontStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraft((d:any)=> ({ ...d, designFontStyle: opt.id }))}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
                        active
                          ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-300 shadow-lg'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {language === 'en' ? opt.en : opt.es}
                    </button>
                  );
                })}
              </div>
            </div>
      {/* Opción única: Diseño o Imágenes */}
      <div className="mt-3 flex items-center gap-3">
              <input
                id="auto-images"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                checked={autoImages}
        onChange={(e)=> { setAutoImages(e.target.checked); setDesignOnly(!e.target.checked); }}
              />
              <label htmlFor="auto-images" className="text-sm text-gray-700 dark:text-zinc-200">
                  {tr('slidesAutoImages', 'Agregar Imágenes automáticamente', 'Add images automatically')}
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="text-sm font-medium block mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {translate('slidesSlidesCountLabel') || 'Cantidad de diapositivas'}
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20, 25, 30].map(count => {
                const active = Number(draft.slideCount || 10) === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setDraft((d:any)=> ({ ...d, slideCount: count }))}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
                      active
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300 shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                    aria-pressed={active}
                  >
                    {count} {translate('slidesSlidesUnit') || 'diapositivas'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {(() => {
          const canGenerate = Boolean(draft.sectionId && draft.courseId && draft.subjectId && String(draft.topic||'').trim());
          return (
            <div className="space-y-3 flex flex-col items-center">
              <Button
                onClick={handleCreate}
                disabled={!canGenerate || isGenerating}
                className={`px-6 py-3 text-base md:text-lg font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 min-w-[200px] ${canGenerate && !isGenerating ? 'bg-lime-600 text-white hover:bg-lime-700 focus-visible:ring-lime-500' : 'bg-gray-200 text-gray-500 cursor-not-allowed focus-visible:ring-gray-300'}`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {translate('slidesGeneratingLabel') || 'Generando...'}
                  </>
                ) : (
                  <>
                    <Presentation className="w-4 h-4 mr-2" />
                    {translate('slidesGenerateBtn') || 'Generar con IA'}
                  </>
                )}
              </Button>
              
              {/* Barra de progreso durante la generación */}
              {isGenerating && (
                <div className="space-y-3 w-full max-w-xl">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 animate-pulse text-blue-500" />
                    <span className="text-base font-medium text-gray-700 dark:text-zinc-200">
                      {generationProgress < 30 && (translate('slidesProgressConnecting') || 'Conectando con la IA...')}
                      {generationProgress >= 30 && generationProgress < 70 && (translate('slidesProgressGenerating') || 'Generando contenido educativo...')}
                      {generationProgress >= 70 && (translate('slidesProgressFinalizing') || 'Finalizando presentación...')}
                    </span>
                  </div>
          <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-6 overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, generationProgress))}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-semibold ${generationProgress < 45 ? 'text-gray-700 dark:text-white' : 'text-white drop-shadow-sm'}`}>
                        {Math.min(100, Math.round(generationProgress))}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* Espaciador inferior para que el botón no quede pegado al borde del card */}
              <div className="h-6" aria-hidden="true" />
            </div>
          );
        })()}
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">{translate('slidesHistoryTitle') || 'Historial de Presentaciones'}</div>
        {sorted.length === 0 ? (
          <div className="text-xs text-muted-foreground">{translate('slidesHistoryEmpty') || 'No hay presentaciones'}</div>
        ) : (
          <div className="divide-y">
            {sorted.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{translate('slidesLabelCourse') || 'Curso'}: {it.sectionId ? resolveCourseLabel(resolveCourseFromSection(it.sectionId)) : resolveCourseLabel(it.courseId)}</div>
                  <div className="text-xs text-muted-foreground truncate">{translate('slidesLabelSubject')}: {it.subjectName}</div>
                  <div className="text-xs text-muted-foreground truncate">{translate('slidesCreatedAt')}: {formatDateTime(it.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Preview Button */}
          {it.slides && it.slides.length > 0 && (
                    <Button
                      variant="outline"
                      className="p-2 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 border-blue-300 hover:bg-transparent hover:text-blue-600 hover:border-blue-300"
            onClick={() => { openPreview(it); }}
                      title={translate('slidesBtnPreview') || 'Vista previa'}
                      aria-label={translate('slidesBtnPreview') || 'Vista previa'}
                    >
                      <FileText className="size-4" />
                    </Button>
                  )}
                  
                  <Button variant="outline" className="p-2 text-lime-600 focus-visible:ring-2 focus-visible:ring-lime-500 border-lime-300 hover:bg-transparent hover:text-lime-600 hover:border-lime-300" onClick={() => handleShare(it)} title={translate('slidesBtnShare') || 'Compartir'} aria-label={translate('slidesBtnShare') || 'Compartir'}><Share2 className="size-4" /></Button>
                  <Button variant="outline" className="p-2 text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 border-red-300 hover:bg-transparent hover:text-red-600 hover:border-red-300" onClick={() => setConfirmDeleteId(it.id)} title={translate('slidesBtnDelete') || 'Eliminar'} aria-label={translate('slidesBtnDelete') || 'Eliminar'}><Trash2 className="size-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingId && editDraft && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-md p-4 w-full max-w-2xl">
            {/* Barra de progreso guardado/regen */}
            {isSavingEdit && (
              <div className="mb-2">
                <div className="w-full h-1 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full bg-lime-500 transition-all" style={{ width: `${Math.min(100, Math.max(5, editProgress))}%` }} />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">{translate('slidesEditTitle') || 'Editar Presentación'}</div>
              <button onClick={() => { setEditingId(null); setEditDraft(null); }}>✖</button>
            </div>
            <div className="text-xs text-muted-foreground mb-3">{translate('slidesEditHint') || 'Actualice los datos y guarde.'}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs block mb-2">{tr('slidesCourseSectionLabel', 'Curso - Sección', 'Course - Section')}</label>
                <div className="flex flex-wrap gap-2">
                  {(assignedSections.length > 0 ? assignedSections : sections).map((s:any) => {
                    const active = String(editDraft?.sectionId||'') === String(s.id);
                    const label = (() => {
                      const course = courses.find((c:any)=> String(c.id)===String(s.courseId));
                      return `${course?.name || ''} ${s.name || s.sectionName || ''}`.trim();
                    })();
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setEditDraft((d:any)=> ({ ...d, sectionId: s.id, courseId: s.courseId, subjectId: '' }))}
                        className={`px-3 py-1 rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${active ? 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-200 dark:border-lime-700' : 'bg-background text-foreground border-gray-300 dark:border-gray-700'} hover:border-lime-400 hover:text-lime-700 focus-visible:ring-lime-500`}
                        aria-pressed={active}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {!!editDraft?.sectionId && (
                <div>
                  <label className="text-xs block mb-2">{translate('slidesSubjectLabel') || 'Asignatura'}</label>
                  <div className="flex flex-wrap gap-2">
                    {(assignedSubjectsBySection[editDraft.sectionId] || assignedSubjectsByCourse[editDraft.courseId] || []).map((s:any) => {
                      const sid = String(s.id || s.name);
                      const active = String(editDraft?.subjectId||'') === sid;
                      return (
                        <button
                          key={sid}
                          type="button"
                          onClick={() => setEditDraft((d:any)=> ({ ...d, subjectId: sid }))}
                          className={`px-3 py-1 rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${active ? 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-200 dark:border-lime-700' : 'bg-background text-foreground border-gray-300 dark:border-gray-700'} hover:border-lime-400 hover:text-lime-700 focus-visible:ring-lime-500`}
                          aria-pressed={active}
                        >
                          {s.name || s.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs block mb-1">{translate('slidesTopicLabel') || 'Tema'}</label>
                <input className="w-full border rounded px-2 py-1 text-sm" value={editDraft?.topic || ''} onChange={e=> setEditDraft((d:any)=> ({...d, topic: e.target.value }))} placeholder="Ej: Ecosistemas" />
              </div>
              <div>
                <label className="text-xs block mb-1">{translate('slidesSlidesCountLabel') || 'Cantidad de diapositivas'}</label>
                <div className="relative inline-block">
                  <select
                    aria-label={translate('slidesSlidesCountLabel') || 'Cantidad de diapositivas'}
                    className="no-chevron appearance-none w-44 md:w-48 h-9 border rounded-md pl-3 pr-8 text-sm bg-white text-gray-800 border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600"
                    value={editDraft?.slideCount || 10}
                    onChange={e=> setEditDraft((d:any)=> ({...d, slideCount: Number(e.target.value) }))}
                  >
                    {[5, 10, 15, 20, 25, 30].map(count => (
                      <option key={count} value={count}>{count} {translate('slidesSlidesUnit') || 'diapositivas'}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-zinc-400" />
                </div>
              </div>
              {/* Selector de estilo y opción de solo diseño */}
        <div className="mt-2">
                <label className="text-xs block mb-2">{tr('slidesDesignStyle', 'Estilo', 'Style')}</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'accents', es: 'Acentos', en: 'Accents' },
                    { id: 'grid', es: 'Grid', en: 'Grid' },
                    { id: 'bubbles', es: 'Burbujas', en: 'Bubbles' }
                  ].map(opt => {
                    const active = editDraft?.designStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEditDraft((d:any)=> ({ ...d, designStyle: opt.id }))}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
                          active
                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300 shadow-lg'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {language === 'en' ? opt.en : opt.es}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="edit-auto-images"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                  checked={!Boolean(editDraft?.useDesignOnly)}
                  onChange={(e)=> setEditDraft((d:any)=> ({ ...d, useDesignOnly: !e.target.checked }))}
                />
                <label htmlFor="edit-auto-images" className="text-xs">Agregar Imagenes Automaticamente</label>
                <label htmlFor="edit-auto-images" className="text-xs">{tr('slidesAutoImages', 'Agregar Imágenes automáticamente', 'Add images automatically')}</label>
              </div>
              {/* Nuevo: Fuente en edición */}
              <div className="mt-2">
                <label className="text-xs block mb-2">Fuente</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'classic', es: 'Clásico', en: 'Classic' },
                    { id: 'structured', es: 'Estructurado', en: 'Structured' },
                    { id: 'serif', es: 'Serif', en: 'Serif' }
                  ].map(opt => {
                    const active = editDraft?.designFontStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEditDraft((d:any)=> ({ ...d, designFontStyle: opt.id }))}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-105 ${
                          active
                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-300 shadow-lg'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {language === 'en' ? opt.en : opt.es}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="p-2 text-lime-600 hover:text-lime-700 focus-visible:ring-2 focus-visible:ring-lime-500 border-lime-300 hover:border-lime-400"
                onClick={()=> setEditingId(null)}
                title={tr('cancelButton', 'Cancelar', 'Cancel')}
                aria-label={tr('cancelButton', 'Cancelar', 'Cancel')}
              >
                <X className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="p-2 text-lime-600 hover:text-lime-700 focus-visible:ring-2 focus-visible:ring-lime-500 border-lime-300 hover:border-lime-400 disabled:opacity-60"
                disabled={isSavingEdit}
                onClick={async () => {
                  if (!editDraft?.sectionId || !editDraft?.courseId || !editDraft?.subjectId) { alert(tr('slidesSelectAllBeforeCreate', 'Complete curso-sección, asignatura y tema.', 'Complete course-section, subject and topic.')); return; }
                  const subjName = resolveSubjectName(editDraft.subjectId);
                  const original = items.find(it => it.id === editingId);
                  const newCount = Number(editDraft.slideCount || 10);
                  const shouldRegenerate = !!original && (
                    String(editDraft.topic || '') !== String(original.topic || '') ||
                    String(editDraft.subjectId || '') !== String(original.subjectId || '') ||
                    newCount !== Number(original.slideCount || 10)
                  );

                  // Base update (meta)
                  let updatedSlides = original?.slides || [];
                  if (shouldRegenerate) {
                    try {
                      setIsSavingEdit(true);
                      setEditProgress(0);
                      const interval = setInterval(() => setEditProgress(p => (p < 90 ? p + Math.random() * 12 : p)), 400);
                      const response = await fetch('/api/generate-slides', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          topic: editDraft.topic,
                          subject: (language === 'en' ? toEnglishSubjectName(subjName) : subjName),
                          slideCount: newCount,
                          language: (language === 'en' ? 'en' : 'es')
                        })
                      });
                      if (!response.ok) {
                        const t = await response.text();
                        throw new Error(t || `HTTP ${response.status}`);
                      }
                      const result = await response.json();
                      updatedSlides = (result.slides || []).map((s: any) => ({
                        ...s,
                        imageSearchQuery: s?.imageSearchQuery || `${editDraft.topic || ''} ${subjName || ''} ${s?.title || ''}`.trim() || undefined,
                      }));
                      // Intentar refrescar la pool de imágenes prebuscadas
                      try {
                        const resImgs = await fetch(`/api/search-images?topic=${encodeURIComponent(editDraft.topic || '')}&subject=${encodeURIComponent(subjName)}&n=30&ai=gemini`, { cache: 'no-store' });
                        if (resImgs.ok) {
                          const dataImgs = await resImgs.json();
                          const list = Array.isArray(dataImgs?.urls) ? dataImgs.urls.filter((u:string)=> typeof u === 'string' && u) : [];
                          setPreviewBgPool(list);
                        }
                      } catch {}
                      clearInterval(interval);
                      setEditProgress(100);
                    } catch (e:any) {
                      alert(`Error al regenerar diapositivas: ${e?.message || e}`);
                      setIsSavingEdit(false);
                      return;
                    }
                  }

                  const patchedItem: SlideItem | null = original ? {
                    ...original,
                    courseId: editDraft.courseId,
                    sectionId: editDraft.sectionId,
                    subjectId: editDraft.subjectId,
                    subjectName: subjName,
                    topic: editDraft.topic,
                    slideCount: newCount,
                    designStyle: String((editDraft.designStyle === 'accents' || editDraft.designStyle === 'grid' || editDraft.designStyle === 'bubbles') ? 'normal' : (editDraft.designStyle || 'normal')),
                    designFontStyle: String(editDraft.designFontStyle || 'classic'),
                    useDesignOnly: Boolean(editDraft.useDesignOnly),
                    slides: updatedSlides
                  } as SlideItem : null;

                  const next = items.map(it => it.id === editingId ? {
                    ...it,
                    courseId: editDraft.courseId,
                    sectionId: editDraft.sectionId,
                    subjectId: editDraft.subjectId,
                    subjectName: subjName,
                    topic: editDraft.topic,
                    slideCount: newCount,
                    designStyle: String((editDraft.designStyle === 'accents' || editDraft.designStyle === 'grid' || editDraft.designStyle === 'bubbles') ? 'normal' : (editDraft.designStyle || 'normal')),
                    designFontStyle: String(editDraft.designFontStyle || 'classic'),
                    useDesignOnly: Boolean(editDraft.useDesignOnly),
                    slides: updatedSlides
                  } : it);
                  save(next);
                  setIsSavingEdit(false);
                  const currentEditingId = editingId; // preservar antes de limpiar estado
                  setEditingId(null);
                  setEditDraft(null);
                  try {
                    const justUpdated = patchedItem || next.find(it => it.id === currentEditingId);
                    if (justUpdated) {
                      await openPreview(justUpdated as SlideItem);
                    }
                  } catch {}
                }}
                title={tr('updateButton', 'Actualizar', 'Update')}
                aria-label={tr('updateButton', 'Actualizar', 'Update')}
              >
                {isSavingEdit ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-md p-5 w-full max-w-md shadow-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-lg font-semibold">{tr('slidesConfirmDeleteTitle', 'Eliminar presentación', 'Delete presentation')}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {tr('slidesConfirmDeleteMessage', '¿Desea eliminar esta presentación? Esta acción no se puede deshacer.', 'Do you want to delete this presentation? This action cannot be undone.')}
                </div>
              </div>
              <button onClick={() => setConfirmDeleteId(null)} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="p-2 bg-transparent hover:bg-transparent dark:hover:bg-transparent text-gray-700 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400 border-gray-300 hover:border-gray-400 dark:text-zinc-200 dark:hover:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:focus-visible:ring-zinc-600"
                onClick={() => setConfirmDeleteId(null)}
              >
                {tr('cancelButton', 'Cancelar', 'Cancel')}
              </Button>
              <Button
                className="p-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
                onClick={() => { if (confirmDeleteId) { handleDelete(confirmDeleteId); setConfirmDeleteId(null); } }}
              >
                {tr('deleteButton', 'Eliminar', 'Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Personalizar imágenes del tema Predeterminada */}
      {showThemeCustomize && (() => {
        const key = showThemeCustomize.themeKey;
        const titleMsg = tr('slidesCustomizeDefaultTitle', 'Personalizar tema Predeterminada', 'Customize Default theme');
        const currentCover = getCustomThemeImage(key, 'cover') || themeDefaultImages[key]?.cover;
        const currentSlide = getCustomThemeImage(key, 'slide') || themeDefaultImages[key]?.slide;
        // Convertir a DataURL forzando 16:9 (1600x900) con recorte tipo cover centrado
        const toDataUrlLocal = (file?: File|null) => new Promise<string|null>((resolve) => {
          if (!file) return resolve(null);
          if (!file.type.startsWith('image/')) return resolve(null);
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            try {
              const CANVAS_W = 1600;
              const CANVAS_H = 900;
              const srcW = (img as HTMLImageElement).naturalWidth || (img as any).width || 0;
              const srcH = (img as HTMLImageElement).naturalHeight || (img as any).height || 0;
              if (!srcW || !srcH) { URL.revokeObjectURL(url); return resolve(null); }
              const scale = Math.max(CANVAS_W / srcW, CANVAS_H / srcH);
              const drawW = Math.max(1, Math.round(srcW * scale));
              const drawH = Math.max(1, Math.round(srcH * scale));
              const dx = Math.round((CANVAS_W - drawW) / 2);
              const dy = Math.round((CANVAS_H - drawH) / 2);
              const canvas = document.createElement('canvas');
              canvas.width = CANVAS_W; canvas.height = CANVAS_H;
              const ctx = canvas.getContext('2d');
              if (!ctx) { URL.revokeObjectURL(url); return resolve(null); }
              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
              ctx.drawImage(img, dx, dy, drawW, drawH);
              const data = canvas.toDataURL('image/jpeg', 0.85);
              URL.revokeObjectURL(url);
              resolve(data);
            } catch {
              URL.revokeObjectURL(url);
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            }
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
          img.src = url;
        });
        const doSave = async () => {
          const map = loadCustomThemeImages();
          const next = { ...(map[key]||{}) } as any;
          const coverData = await toDataUrlLocal(themeCoverFile);
          const slideData = await toDataUrlLocal(themeSlideFile);
          if (coverData) next.cover = coverData;
          if (slideData) next.slide = slideData;
          const out = { ...map, [key]: next };
          saveCustomThemeImages(out);
          setShowThemeCustomize(null);
        };
        const doReset = () => {
          const map = loadCustomThemeImages();
          if (map[key]) { delete map[key]; saveCustomThemeImages(map); }
          setThemeCoverFile(null); setThemeSlideFile(null);
          setShowThemeCustomize(null);
        };
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div role="dialog" aria-modal="true" className="bg-background rounded-md p-6 w-full max-w-3xl max-h-[85vh] mx-4 shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-lg font-semibold">{titleMsg}</div>
                  <div className="text-xs text-muted-foreground mt-1">{tr('slidesCustomizeDefaultHint', 'Suba una imagen para la portada (cover) y otra para las diapositivas (slide).', 'Upload cover and slide images.')}</div>
                </div>
                <button onClick={() => setShowThemeCustomize(null)} className="text-gray-500 hover:text-gray-700" aria-label={tr('close','Cerrar','Close')}>✖</button>
              </div>

              {/* Contenido desplazable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-1 overflow-y-auto pr-1">
                <div>
                  <div className="text-sm font-medium mb-1">Cover</div>
                  <div className="border rounded-md p-2">
                    <img src={themeCoverFile ? URL.createObjectURL(themeCoverFile) : currentCover} alt="cover" className="w-full h-56 object-cover rounded" />
                    <input type="file" accept="image/*" className="mt-2 text-xs" onChange={e=> setThemeCoverFile(e.target.files?.[0]||null)} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Slide</div>
                  <div className="border rounded-md p-2">
                    <img src={themeSlideFile ? URL.createObjectURL(themeSlideFile) : currentSlide} alt="slide" className="w-full h-56 object-cover rounded" />
                    <input type="file" accept="image/*" className="mt-2 text-xs" onChange={e=> setThemeSlideFile(e.target.files?.[0]||null)} />
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-2 pt-2 border-t dark:border-zinc-800">
                <Button
                  variant="outline"
                  className="p-2 text-gray-700 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400 border-gray-300 hover:border-gray-400 dark:text-zinc-200 dark:hover:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500"
                  onClick={doReset}
                >{tr('resetButton','Restablecer','Reset')}</Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="p-2" onClick={()=> setShowThemeCustomize(null)}>{tr('cancelButton','Cancelar','Cancel')}</Button>
                  <Button className="p-2 bg-lime-600 text-white hover:bg-lime-700 focus-visible:ring-2 focus-visible:ring-lime-500" onClick={doSave}>{tr('saveButton','Guardar','Save')}</Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de confirmación de compartir */}
      {confirmShareId && (() => {
        const it = items.find(i => i.id === confirmShareId);
        if (!it) return null;
        // Usar la misma lógica del toast para no duplicar "Curso - Sección"
        const targetLabel = it.sectionId ? (resolveSectionLabel(it.sectionId) || resolveCourseLabel(it.courseId) || '') : (resolveCourseLabel(it.courseId) || '');
        const titleMsg = tr('slidesConfirmShareTitle', 'Compartir presentación', 'Share presentation');
        const msg = tr(
          'slidesConfirmShareMessage',
          `¿Desea compartir esta presentación con todos los estudiantes de ${targetLabel}?`,
          `Do you want to share this presentation with all students of ${targetLabel}?`
        );
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div role="dialog" aria-modal="true" className="bg-background rounded-md p-5 w-full max-w-md shadow-xl border border-gray-200 dark:border-zinc-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-semibold">{titleMsg}</div>
                  <div className="text-sm text-muted-foreground mt-1">{msg}</div>
                </div>
                <button onClick={() => setConfirmShareId(null)} className="text-gray-500 hover:text-gray-700" aria-label={tr('close', 'Cerrar', 'Close')}>✖</button>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="p-2 bg-transparent hover:bg-transparent dark:hover:bg-transparent text-gray-700 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400 border-gray-300 hover:border-gray-400 dark:text-zinc-200 dark:hover:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:focus-visible:ring-zinc-600"
                  onClick={() => setConfirmShareId(null)}
                >
                  {tr('cancelButton', 'Cancelar', 'Cancel')}
                </Button>
                <Button
                  className="p-2 bg-lime-600 text-white hover:bg-lime-700 focus-visible:ring-2 focus-visible:ring-lime-500"
                  onClick={() => { if (it) { doShare(it); setConfirmShareId(null); } }}
                >
                  {tr('shareButton', 'Compartir', 'Share')}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Preview Modal */}
      {showPreview && previewSlides.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col dark:bg-zinc-950 dark:text-zinc-100 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 pr-12 border-b dark:border-zinc-800">
              <h3 className="text-lg font-semibold dark:text-zinc-100">{tr('slidesPreviewTitle', 'Vista Previa de Diapositivas', 'Slides Preview')}</h3>
              <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-zinc-400">
                  {currentSlideIndex + 1} {tr('slidesOf', 'de', 'of')} {(Array.isArray(previewSlides) ? previewSlides.length : 0) + 1}
                </span>
                
                {/* Selector de Tema en Vista Previa */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-zinc-300">Tema</label>
                  <select
                    className="no-chevron appearance-none pr-8 text-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 min-w-[140px] md:min-w-[160px]"
                    value={previewTheme}
                    onChange={(e) => setPreviewTheme(e.target.value)}
                  >
                    {Object.entries(designThemes).map(([key, theme]) => (
                      <option key={key} value={key}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Estilo (efecto de texto) en Vista Previa */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-zinc-300">Estilo</label>
                  <select
                    className="no-chevron appearance-none pr-8 text-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 min-w-[140px] md:min-w-[160px]"
                    value={previewStyle}
                    onChange={(e) => setPreviewStyle(e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Cursiva</option>
                    <option value="bold">Negrita</option>
                  </select>
                </div>

                {/* Nuevo: Selector de Tipografía en Vista Previa */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-zinc-300">Fuente</label>
                  <select
                    className="no-chevron appearance-none pr-8 text-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 min-w-[140px] md:min-w-[160px]"
                    value={previewFontStyle}
                    onChange={(e) => setPreviewFontStyle(e.target.value)}
                  >
                    <option value="classic">Clásico</option>
                    <option value="structured">Estructurado</option>
                    <option value="serif">Serif</option>
                  </select>
                </div>

                {/* Nuevo: Selector de Color de texto */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-zinc-300">Color</label>
                  <select
                    className="no-chevron appearance-none pr-8 text-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 min-w-[120px] md:min-w-[140px]"
                    value={previewTextColor}
                    onChange={(e) => setPreviewTextColor(e.target.value)}
                  >
                    <option value="auto">Auto (tema)</option>
                    <option value="contrast">Alto contraste</option>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="red">Rojo</option>
                    <option value="purple">Morado</option>
                    <option value="amber">Ámbar</option>
                    <option value="gray">Gris</option>
                  </select>
                </div>

                {/* Nuevo: Selector de Color 2 (cuerpo/puntos) */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-zinc-300">Color 2</label>
                  <select
                    className="no-chevron appearance-none pr-8 text-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 min-w-[120px] md:min-w-[140px]"
                    value={previewTextColor2}
                    onChange={(e) => setPreviewTextColor2(e.target.value)}
                  >
                    <option value="auto">Auto (tema)</option>
                    <option value="contrast">Alto contraste</option>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="red">Rojo</option>
                    <option value="purple">Morado</option>
                    <option value="amber">Ámbar</option>
                    <option value="gray">Gris</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    className="h-3 w-3"
                    checked={!previewDesignOnly}
                    onChange={(e)=> setPreviewDesignOnly(!e.target.checked)}
                  />
                  {tr('slidesAutoImages', 'Imágenes automáticas', 'Auto images')}
                </label>
              </div>
            </div>
            {/* Close button - absolute on top right */}
            <button
              onClick={() => setShowPreview(false)}
              aria-label="Cerrar"
              title="Cerrar"
              className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 bg-transparent dark:text-zinc-200 dark:border-zinc-700 dark:hover:border-zinc-500"
            >
              ✕
            </button>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Slide Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {(() => {
                  const totalSlides = (Array.isArray(previewSlides) ? previewSlides.length : 0) + 1; // +1 portada
                  const isCover = currentSlideIndex === 0;
                  const contentIndex = currentSlideIndex - 1;
                  const hasContent = isCover || (previewSlides[contentIndex] !== undefined);
                  if (!hasContent) return null;
                  const s = isCover ? null : previewSlides[contentIndex];
                  const pool = Array.isArray(previewBgPool) ? previewBgPool : [];
                  return (
                    <div
                      className={`relative overflow-hidden border rounded-lg min-h-[400px] dark:border-zinc-800`}
                      style={{
                        backgroundImage: previewDesignOnly ? 'none' : (() => {
                          if (isCover) {
                            // Priorizar SIEMPRE la portada definida por el Tema Visual; luego curado/pool/heurística
                            const curated0 = resolveCuratedUrl(previewMeta.topic, previewMeta.subjectName, previewMeta.topic);
                            const curated = curated0 ? toDirectUrl(curated0) : '';
                            const themeDefault = resolveThemeDefaultUrl(previewTheme, 'cover');
                            const seed = themeHash(`${previewTheme}:${previewStyle}:${previewMeta.topic || ''}:${previewMeta.subjectName || ''}`);
                            const seededPool = (Array.isArray(pool) ? [...pool] : []).sort((a, b) => {
                              const ha = themeHash(a + seed);
                              const hb = themeHash(b + seed + 7);
                              return (ha % 97) - (hb % 97);
                            });
                            const primary = themeDefault || curated || (seededPool[0] ? toDirectUrl(seededPool[0]) : toDirectUrl(resolveIllustrationUrlByIndex(0, previewMeta.topic, previewMeta.subjectName, previewMeta.topic, [previewMeta.topic || '', previewMeta.subjectName || ''])));
                            const fallback = toDirectUrl(resolveIllustrationStaticUrl(previewMeta.topic, previewMeta.subjectName, previewMeta.topic)) || themeDefault || '';
                            const elegantCover = previewTheme === 'elegant' ? elegantInlineFallback.cover : '';
                            // Cadena de múltiples capas: primary -> fallback temático/estático -> fallback inline elegante (si aplica)
                            return `url("${primary}") , url("${fallback}")${elegantCover ? ` , url("${elegantCover}")` : ''}`;
                          }
                          const chosen = Array.isArray(previewBgChosen) ? previewBgChosen[contentIndex] : undefined;
                          const computed = (() => {
                            // Priorizar SIEMPRE el fondo del Tema Visual para contenido; luego curado/pool/slide/heurística
                            const fromTheme = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'slide')) || undefined;
                            if (fromTheme) return fromTheme;
                            const cur = resolveCuratedUrl(previewMeta.topic, previewMeta.subjectName, (s as any)?.title) || resolveCuratedUrl(previewMeta.topic, previewMeta.subjectName, ((s as any)?.content || []).join(' '));
                            const fromPool = pool[contentIndex + 1] ? toDirectUrl(pool[contentIndex + 1]) : undefined;
                            const fromSlide = toDirectUrl((s as any)?.imageUrl);
                            const fromHeuristic = toDirectUrl(resolveIllustrationUrlByIndex(
                              contentIndex + 1,
                              previewMeta.topic,
                              previewMeta.subjectName,
                              (s as any)?.title,
                              (s as any)?.content
                            ));
                            return cur || fromPool || fromSlide || fromHeuristic;
                          })();
                          const bgUrl = chosen || computed;
                          const themeFallback = resolveThemeDefaultUrl(previewTheme, 'slide');
                          const fallback = toDirectUrl(resolveIllustrationStaticUrl(
                            previewMeta.topic,
                            previewMeta.subjectName,
                            (s as any)?.title
                          )) || themeFallback || '';
                          const elegantSlide = previewTheme === 'elegant' ? elegantInlineFallback.slide : '';
                          return `url("${bgUrl}") , url("${fallback}")${elegantSlide ? ` , url("${elegantSlide}")` : ''}`;
                        })(),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: designThemes[previewTheme]?.bgHex || '#F8FAFC',
                      }}
                    >
                      {!previewDesignOnly && (
                        // En el tema "Elegante" usamos un overlay más sutil para que se aprecien las líneas doradas del fondo
                        <div className={`absolute inset-0 ${previewTheme === 'elegant' ? 'bg-white/20 dark:bg-black/20' : 'bg-white/30 dark:bg-black/30'}`} />
                      )}
                      {previewDesignOnly && (
                        <>
                          {previewStyle === 'grid' ? (
                            <>
                              {[1,2,3,4,5].map(i => (
                                <div key={`h-${i}`} className="absolute" style={{ top: 20 + i*48, left: 16, right: 220, height: 1, backgroundColor: (designThemes[previewTheme]?.primary || '#2563eb'), opacity: 0.15 }} />
                              ))}
                              {[1,2,3,4].map(i => (
                                <div key={`v-${i}`} className="absolute" style={{ top: 16, bottom: 80, left: 16 + i*140, width: 1, backgroundColor: (designThemes[previewTheme]?.primary || '#2563eb'), opacity: 0.12 }} />
                              ))}
                            </>
                          ) : previewStyle === 'bubbles' ? (
                            <>
                              <div className="absolute" style={{ top: 56, right: 28, width: 140, height: 140, borderRadius: 9999, backgroundColor: (designThemes[previewTheme]?.primary || '#2563eb'), opacity: 0.28, boxShadow: '0 8px 20px rgba(0,0,0,0.18)' }} />
                              <div className="absolute" style={{ top: 180, right: 160, width: 80, height: 80, borderRadius: 9999, backgroundColor: (designThemes[previewTheme]?.primary || '#2563eb'), opacity: 0.22 }} />
                              <div className="absolute" style={{ bottom: 24, left: -10, width: 160, height: 60, borderRadius: 24, backgroundColor: 'rgba(15,23,42,0.15)' }} />
                            </>
                          ) : (
                            <>
                              <div className="absolute" style={{ top: 16, left: 24, width: 220, height: 10, borderRadius: 8, backgroundColor: designThemes[previewTheme]?.primary || '#2563eb', opacity: 0.25 }} />
                              <div className="absolute" style={{ top: 60, right: 32, width: 160, height: 110, borderRadius: 16, backgroundColor: designThemes[previewTheme]?.primary || '#2563eb', opacity: 0.3, boxShadow: '0 8px 20px rgba(0,0,0,0.18)' }} />
                              <div className="absolute" style={{ bottom: 18, left: -20, width: 180, height: 60, borderRadius: 18, backgroundColor: 'rgba(15,23,42,0.15)' }} />
                            </>
                          )}
                        </>
                      )}
                      <div className="p-6 h-full">
                        {isCover ? (
                          <>
                            {previewTheme === 'elegant' && (
                              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent dark:from-black/70" />
                            )}
                            {(() => {
                              const isTeacher = String(user?.role || '').toLowerCase() === 'teacher';
                              const outerPos = isTeacher ? 'left-0' : 'right-0';
                              const innerSide = isTeacher ? 'mr-auto text-left' : 'ml-auto text-right';
                              return (
                                <div className={`absolute bottom-0 ${outerPos} p-6 w-full`}>
                                  {(() => {
                                    const courseVal = resolveCourseLabel(resolveCourseFromSection(previewSelectedSectionId));
                                    const subjectVal = language === 'en' ? toEnglishSubjectName(previewMeta.subjectName) : (previewMeta.subjectName || '');
                                    return (
                                      <div className={`max-w-[75%] ${innerSide} p-4 rounded-md ${previewTheme === 'elegant' ? 'bg-white/70 dark:bg-black/60 backdrop-blur-sm shadow-lg ring-1 ring-white/10 dark:ring-white/20' : ''}`}>
                                        <h2
                                          className={`text-4xl ${designThemes[previewTheme]?.title || 'text-blue-900'} ${getStyleClasses(previewStyle, true)} ${getFontClasses(previewFontStyle, true)}`}
                                          style={{
                                            ...(getStyleColorStyle(previewStyle, previewTheme, true) || {}),
                                            ...(getFontColorStyle(previewFontStyle, previewTheme, true) || {}),
                                            ...getFontFamilyStyle(previewFontStyle, true),
                                            ...(getPreviewColorPair(previewTextColor, previewTheme).title || {})
                                          }}
                                        >
                                          {previewMeta.topic || ''}
                                        </h2>
                                        <div className="mt-3 space-y-1">
                                          {!!courseVal && (
                                            <div className={`${designThemes[previewTheme]?.title || 'text-blue-900'} text-xl ${getStyleClasses(previewStyle, true)} ${getFontClasses(previewFontStyle, false)}`} style={{ ...getFontFamilyStyle(previewFontStyle, false), ...(getPreviewColorPair(previewTextColor, previewTheme).title || {}) }}>
                                              {courseVal}
                                            </div>
                                          )}
                                          {!!subjectVal && (
                                            <div className={`${designThemes[previewTheme]?.title || 'text-blue-900'} text-xl ${getStyleClasses(previewStyle, true)} ${getFontClasses(previewFontStyle, false)}`} style={{ ...getFontFamilyStyle(previewFontStyle, false), ...(getPreviewColorPair(previewTextColor, previewTheme).title || {}) }}>
                                              {subjectVal}
                                            </div>
                                          )}
                                          <div className={`${designThemes[previewTheme]?.content || 'text-gray-700 dark:text-zinc-200'} text-lg ${getStyleClasses(previewStyle, false)} ${getFontClasses(previewFontStyle, false)}`}
                                            style={{ ...getFontFamilyStyle(previewFontStyle, false), ...(getPreviewColorPair(previewTextColor2, previewTheme).content || {}) }}>
                                            {(language === 'en' ? 'Teacher' : 'Profesor')}: {user?.displayName || user?.username || ''}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <>
                            <h2
                              className={`text-2xl mb-4 ${designThemes[previewTheme]?.title || 'text-blue-900'} ${getStyleClasses(previewStyle, true)} ${getFontClasses(previewFontStyle, true)}`}
                              style={{
                                ...(getStyleColorStyle(previewStyle, previewTheme, true) || {}),
                                ...(getFontColorStyle(previewFontStyle, previewTheme, true) || {}),
                                ...getFontFamilyStyle(previewFontStyle, true),
                                ...(getPreviewColorPair(previewTextColor, previewTheme).title || {})
                              }}
                            >
                              {(getFontVariant(previewFontStyle).pptx.titleUppercase || getStyleVariant(previewStyle).pptx.titleUppercase
                                ? String((s as any)?.title || '').toUpperCase() : (s as any)?.title)}
                            </h2>
                            <div className="space-y-3" key={`content-${contentIndex}`}>
                              {(s as any)?.content.map((point: string, idx: number) => (
                                <div key={idx} className={`flex items-start ss-anim ${getStyleClasses(previewStyle, false)} ${getFontClasses(previewFontStyle, false)}`} style={{ animationDelay: `${idx * 80}ms`, ...getFontFamilyStyle(previewFontStyle, false), ...(getPreviewColorPair(previewTextColor2, previewTheme).content || {}) }}>
                                  <span className="mr-2" style={{ color: designThemes[previewTheme]?.primary || '#2563eb' }}>•</span>
                                  <span
                                    className={`${designThemes[previewTheme]?.content || 'text-gray-700 dark:text-zinc-200'}`}
                                    style={{ ...(getPreviewColorPair(previewTextColor2, previewTheme).content || {}) }}
                                  >
                                    {point}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* (Mini imagen superpuesta eliminada intencionalmente en modo profesor) */}
                    </div>
                  );
                })()}
              </div>
              
              {/* Slide Navigation */}
              <div className="w-64 border-l bg-gray-50 p-4 overflow-y-auto dark:bg-zinc-900 dark:border-zinc-800">
                <h4 className="font-medium mb-3 text-sm dark:text-zinc-300">{tr('slidesSidebarTitle', 'Diapositivas', 'Slides')}</h4>
                <div className="space-y-2">
                  {/* Portada */}
                  <button
                    onClick={() => setCurrentSlideIndex(0)}
                    className={`w-full text-left p-2 rounded text-xs border transition-colors ${
                      currentSlideIndex === 0
                        ? 'bg-lime-100 border-lime-300 text-lime-900 dark:bg-lime-950/30 dark:border-lime-700 dark:text-lime-100'
                        : 'bg-white border-gray-200 hover:bg-lime-100 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-lime-900/30 dark:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-14 h-10 rounded overflow-hidden border border-white/40 dark:border-zinc-600 bg-gray-200 dark:bg-zinc-700 shrink-0">
                        {!previewDesignOnly && (
                          <img
                            src={(() => {
                              const pool = Array.isArray(previewBgPool) ? previewBgPool : [];
                              // Priorizar portada definida por el Tema Visual; luego curado/pool/heurística
                              const themeDefault = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'cover'));
                              const themeSlideAlt = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'slide'));
                              const curated = isAstronomy(previewMeta.topic, previewMeta.subjectName, previewMeta.topic)
                                ? toDirectUrl(resolveIllustrationStaticUrl(previewMeta.topic, previewMeta.subjectName, previewMeta.topic))
                                : '';
                              const primary = themeDefault || curated || (pool[0] ? toDirectUrl(pool[0]) : toDirectUrl(
                                resolveIllustrationUrlByIndex(
                                  0,
                                  previewMeta.topic,
                                  previewMeta.subjectName,
                                  previewMeta.topic,
                                  [previewMeta.topic || '', previewMeta.subjectName || '']
                                )
                              ));
                              if (primary) return primary;
                              // Fallbacks adicionales para asegurar imagen en portada elegante
                              if (themeSlideAlt) return themeSlideAlt;
                              if (previewTheme === 'elegant') return elegantInlineFallback.cover;
                              return '';
                            })()}
                            alt="Portada"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e)=>{
                              const t = e.currentTarget as HTMLImageElement;
                              const themeFallback = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'cover'));
                              const staticFallback = toDirectUrl(resolveIllustrationStaticUrl(previewMeta.topic, previewMeta.subjectName, previewMeta.topic));
                              if (themeFallback && t.src !== themeFallback) { t.src = themeFallback; return; }
                              if (staticFallback && t.src !== staticFallback) { t.src = staticFallback; return; }
                            }}
                          />
                        )}
                        {/* Overlay con textos clave de la portada */}
                        {!previewDesignOnly && (
                          <div className="pointer-events-none absolute inset-0">
                            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-0.5">
                              {!!previewMeta?.topic && (
                                <div className="text-[8px] leading-[9px] text-white font-medium truncate">{previewMeta.topic}</div>
                              )}
                              <div className="text-[7px] leading-[8px] text-white/90 truncate">
                                {`${resolveCourseLabel(resolveCourseFromSection(previewSelectedSectionId)) || ''}${previewMeta?.subjectName ? ` • ${previewMeta.subjectName}` : ''}`}
                              </div>
                              <div className="text-[7px] leading-[8px] text-white/80 truncate">
                                {(language === 'en' ? 'Teacher' : 'Prof')}: {user?.displayName || user?.username || ''}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">Portada</div>
                        <div className="font-medium truncate">{tr('slidesCover', 'Portada', 'Cover')}</div>
                        <div className="mt-1 text-[11px] leading-tight text-gray-600 dark:text-zinc-300 space-y-0.5">
                          {!!(previewMeta?.topic) && (
                            <div className="truncate">{previewMeta.topic}</div>
                          )}
                          {!!(resolveCourseLabel(resolveCourseFromSection(previewSelectedSectionId))) && (
                            <div className="truncate">{resolveCourseLabel(resolveCourseFromSection(previewSelectedSectionId))}</div>
                          )}
                          {!!(previewMeta?.subjectName) && (
                            <div className="truncate">{language === 'en' ? toEnglishSubjectName(previewMeta.subjectName) : previewMeta.subjectName}</div>
                          )}
                          <div className="truncate">
                            {(language === 'en' ? 'Teacher' : 'Profesor')}: {user?.displayName || user?.username || ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                  {previewSlides.map((slide, idx) => {
                    const pool = Array.isArray(previewBgPool) ? previewBgPool : [];
                    // Alinear miniatura con el fondo real de la vista previa: usar elegido; si aún no existe, priorizar el fondo por tema visual
                    const themeDefaultSlide = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'slide')) || '';
                    const themeDefaultCover = toDirectUrl(resolveThemeDefaultUrl(previewTheme, 'cover')) || '';
                    const chosenBg = (Array.isArray(previewBgChosen) && previewBgChosen[idx])
                      ? toDirectUrl(previewBgChosen[idx])
                      : (
                        themeDefaultSlide ||
                        // Si no hay slide del tema, intentar con cover del tema (pero evitando igualar portada al menos en "elegant" con inline)
                        themeDefaultCover ||
                        toDirectUrl(slide.imageUrl) ||
                        (pool[idx + 1] ? toDirectUrl(pool[idx + 1]) : toDirectUrl(
                          resolveIllustrationUrlByIndex(
                            idx + 1,
                            previewMeta.topic,
                            previewMeta.subjectName,
                            slide.title,
                            slide.content
                          )
                        ))
                      );
                    const bgPrimary = chosenBg;
                    const bgSecondary = toDirectUrl(resolveSecondaryUrlByIndex(idx + 1, previewMeta.topic, previewMeta.subjectName, slide.content));
                    const elegantInline = previewTheme === 'elegant' ? elegantInlineFallback.slide : '';
                    const bgFallback = elegantInline || toDirectUrl(resolveIllustrationStaticUrl(previewMeta.topic, previewMeta.subjectName, slide.title)) || themeDefaultSlide;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx + 1)}
                        className={`w-full text-left p-2 rounded text-xs border transition-colors ${
                          currentSlideIndex === (idx + 1)
                            ? 'bg-lime-100 border-lime-300 text-lime-900 dark:bg-lime-950/30 dark:border-lime-700 dark:text-lime-100'
                            : 'bg-white border-gray-200 hover:bg-lime-100 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-lime-900/30 dark:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Miniatura con imagen temática */}
                          <div className="relative w-14 h-10 rounded overflow-hidden border border-white/40 dark:border-zinc-600 bg-gray-200 dark:bg-zinc-700 shrink-0">
                            {/* capa 1: principal, capa 2: fallback; el navegador muestra la primera válida */}
                            {!previewDesignOnly && (
                              <>
                                <img
                                  src={bgPrimary || ''}
                                  alt={slide.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e)=>{
                                    const t = e.currentTarget as HTMLImageElement;
                                    if (bgSecondary && t.src !== bgSecondary) { t.src = bgSecondary; return; }
                                    if (bgFallback && t.src !== bgFallback) { t.src = bgFallback; return; }
                                    else {
                                      const ph = generatePlaceholderJpeg(previewMeta.topic, previewMeta.subjectName, slide.title, 280, 180);
                                      if (ph) t.src = ph;
                                    }
                                  }}
                                />
                              </>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{slide.title}</div>
                            <div className="text-gray-500 mt-1 dark:text-zinc-400">
                              {slide.content.length} {translate('slidesPoints') || 'puntos'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                  className="text-gray-700 border-gray-300 hover:text-gray-800 hover:border-gray-400 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 dark:text-zinc-200 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
                >
                  ← {tr('slidesPrev', 'Anterior', 'Previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlideIndex(prev => {
                    const total = (Array.isArray(previewSlides) ? previewSlides.length : 0) + 1;
                    return Math.min(total - 1, (typeof prev === 'number' ? prev : currentSlideIndex) + 1);
                  })}
                  disabled={(() => { const total = (Array.isArray(previewSlides) ? previewSlides.length : 0) + 1; return currentSlideIndex === total - 1; })()}
                  className="text-gray-700 border-gray-300 hover:text-gray-800 hover:border-gray-400 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 dark:text-zinc-200 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
                >
                  {tr('slidesNext', 'Siguiente', 'Next')} →
                </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    const tempItem: SlideItem = {
                      id: `preview_${Date.now()}`,
                      title: previewMeta.topic || translate('slidesUntitled') || 'Presentación',
                      createdAt: Date.now(),
                      courseId: resolveCourseFromSection(previewSelectedSectionId),
                      sectionId: previewSelectedSectionId,
                      subjectId: undefined,
                      subjectName: previewMeta.subjectName,
                      topic: previewMeta.topic,
                      slideCount: previewSlides.length,
                      ownerId: user?.id,
                      ownerUsername: user?.username,
                      shared: false,
                      slides: previewSlides,
                      designTheme: String(previewTheme || 'professional'),
                      designStyle: String((previewStyle === 'accents' || previewStyle === 'grid' || previewStyle === 'bubbles') ? 'normal' : (previewStyle || 'normal')),
                      useDesignOnly: Boolean(previewDesignOnly)
                    };
                    handleDownload({
                      ...tempItem,
                      designTheme: previewTheme,
                      designStyle: previewStyle,
                      useDesignOnly: previewDesignOnly
                    }, 'pptx');
                  }}
                  className="bg-lime-600 text-white hover:bg-lime-700 focus-visible:ring-2 focus-visible:ring-lime-500 px-3 py-2"
                  title={tr('slidesBtnDownload', 'Descargar PPTX', 'Download PPTX')}
                  aria-label={tr('slidesBtnDownload', 'Descargar PPTX', 'Download PPTX')}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => generateDetailedReport(previewSlides, previewMeta)}
                  className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 px-3 py-2 shadow-lg transform transition-all duration-200 hover:scale-105 relative overflow-hidden"
                  title={tr('slidesDetailedReportBtn', 'Descargar Informe Detallado', 'Download Detailed Report')}
                  aria-label={tr('slidesDetailedReportBtn', 'Descargar Informe Detallado', 'Download Detailed Report')}
                >
                  <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <FileText className="w-4 h-4 relative z-10" />
                </Button>
                {/* Subida de plantilla animada: eliminada para modo profesor */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Informe Detallado */}
      {showDetailedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg max-w-md w-full mx-4 flex flex-col dark:bg-zinc-950 dark:text-zinc-100">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
              <h3 className="text-lg font-semibold dark:text-zinc-100">
                {tr('slidesDetailedReportTitle', 'Descargando Informe DOCX', 'Downloading DOCX Report')}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedReport(false)}
                className="text-gray-700 border-gray-300 hover:text-gray-800 hover:border-gray-400"
              >
                ✕
              </Button>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6 text-center">
              <div className="mb-4">
                <FileText className="w-16 h-16 mx-auto text-blue-600 animate-bounce" />
              </div>
              <p className="text-lg font-semibold mb-2">{tr('slidesGeneratingDetailedReport', 'Generando informe detallado...', 'Generating detailed report...')}</p>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                {tr('slidesDetailedReportDescription', 'Creando análisis profundo de cada punto de las diapositivas...', 'Creating in-depth analysis for each slide point...')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
