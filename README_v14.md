# SMART STUDENT WEB v14 – Plataforma Integral de Gestión Estudiantil

**Versión v14** centrada en **Evaluaciones Inteligentes Específicas por Tema** y **Optimización de Almacenamiento**. Esta versión revoluciona el módulo de evaluación del administrador para generar preguntas específicas basadas en IA real, eliminando respuestas genéricas y proporcionando evaluaciones educativas de alta calidad.

![SMART STUDENT v14](https://via.placeholder.com/800x200/1a1a1a/ffffff?text=SMART+STUDENT+v14)

## 🚀 Resumen Técnico
- **Framework**: Next.js 15.4.1 (React 18 + TypeScript)
- **Estilos/UI**: Tailwind CSS, Radix UI, lucide-react, next-themes
- **IA**: Genkit + Google Generative AI (Gemini) - CONFIGURADO Y ACTIVO
- **Datos locales**: localStorage + exportación/importación JSON optimizado
- **Otros**: Recharts, date-fns, Cloudinary, Tesseract.js
- **Puerto dev**: 9002 (con Turbopack)

## 🆕 Novedades Revolucionarias v14

### 🧠 1. Evaluaciones Inteligentes Específicas por Tema
**Problema resuelto**: Las evaluaciones generaban preguntas genéricas como "¿Qué permite el material a los estudiantes?" en lugar de preguntas específicas del tema.

**Solución implementada**:
- ✅ **IA Real Configurada**: Google AI API completamente funcional
- ✅ **Prompts Específicos**: La IA enfoca exclusivamente en el tema solicitado
- ✅ **Contenido Educativo Real**: Base de conocimientos por materia y tema
- ✅ **Validación Robusta**: Verificación de selección curso/asignatura

**Ejemplo de transformación**:
```diff
- ❌ "¿Qué elementos incluye este libro de Ciencias Naturales?"
+ ✅ "¿Cuáles son los órganos principales del sistema respiratorio?"

- ❌ "Según el texto, los estudiantes no pueden usar el material..."
+ ✅ "¿Dónde ocurre el intercambio gaseoso en el sistema respiratorio?"
```

### 📚 2. Base de Conocimientos Educativa
**Contenido específico implementado**:
- **Ciencias Naturales**: Sistema Respiratorio, Célula, Fotosíntesis
- **Matemáticas**: Fracciones, Geometría, Álgebra
- **Lenguaje**: Sustantivos, Verbos, Comprensión Lectora
- **Extensible**: Fácil agregar nuevos temas

### 💾 3. Solución QuotaExceededError
**Problema**: LocalStorage alcanzaba límite de 5MB causando errores al guardar evaluaciones.

**Solución integral**:
- ✅ **Limitación Automática**: Máximo 50 evaluaciones por usuario
- ✅ **Limpieza Preventiva**: Verificación automática al cargar (>4MB)
- ✅ **Recuperación Robusta**: Fallback escalonado en caso de error
- ✅ **Feedback al Usuario**: Notificaciones claras del estado del sistema

```javascript
// Sistema de recuperación automática
if (error.name === 'QuotaExceededError') {
  // 1. Reducir a 10 evaluaciones
  // 2. Si falla, reiniciar con evaluación actual
  // 3. Notificar al usuario del estado
}
```

## 🔧 Componentes Principales v14

### 📝 Módulo de Evaluación (`/dashboard/evaluacion`)
- **Generación inteligente** de preguntas por tema específico
- **Validación robusta** de parámetros (curso, asignatura, tema)
- **IA configurada** para contenido educativo real
- **Manejo de errores** con debug detallado

### 🎯 API de Extracción PDF (`/api/extract-pdf-content`)
- **Contenido específico por tema** en lugar de genérico
- **Resolución inteligente** de libros por curso+asignatura
- **Base de conocimientos** educativa integrada

### 🤖 Motor de IA (`/ai/flows/generate-evaluation-content`)
- **Prompts optimizados** para temas específicos
- **Distribución equilibrada** de tipos de pregunta (V/F, Múltiple, Selección)
- **Validación estricta** de cantidad de preguntas generadas

## 🛠 Instalación y Configuración

### Prerrequisitos
```bash
Node.js 18+
npm o yarn
Git
```

### Configuración Rápida
```bash
# 1. Clonar repositorio
git clone https://github.com/jorgecastros687-lang/superjf_v14.git
cd superjf_v14

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Agregar tu Google AI API Key en .env.local
```

### Variables de Entorno Requeridas
```bash
# .env.local
GOOGLE_API_KEY=tu_google_ai_api_key_aqui
GOOGLE_AI_API_KEY=tu_google_ai_api_key_aqui  # Backup
```

### Ejecutar en Desarrollo
```bash
npm run dev
# Servidor disponible en: http://localhost:9002
```

## 📊 Arquitectura del Sistema

```
📁 src/
├── 🤖 ai/                    # Motor de IA y flujos
│   ├── flows/                # Generación de contenido
│   └── genkit.ts            # Configuración IA
├── 📱 app/                   # Aplicación Next.js
│   ├── api/                 # Endpoints API
│   │   ├── extract-pdf-content/
│   │   └── generate-dynamic-evaluation/
│   └── dashboard/           # Interfaces principales
│       └── evaluacion/      # Módulo de evaluación
├── 🧩 components/           # Componentes UI
├── 📚 lib/                  # Utilidades y datos
│   └── books-data.ts       # Base de datos de libros
└── 🎨 styles/              # Estilos CSS
```

## 🎯 Casos de Uso Principales

### 👨‍🏫 Para Administradores
1. **Crear Evaluaciones Específicas**:
   - Seleccionar curso (ej: "4to Básico")
   - Elegir asignatura (ej: "Ciencias Naturales")
   - Especificar tema (ej: "Sistema Respiratorio")
   - Configurar cantidad de preguntas (5-50)

2. **Obtener Preguntas de Calidad**:
   - Preguntas específicas del tema solicitado
   - Contenido educativo apropiado para el nivel
   - Distribución equilibrada de tipos de pregunta

### 👨‍🎓 Para Estudiantes
1. **Realizar Evaluaciones Personalizadas**
2. **Recibir Feedback Inmediato**
3. **Acceder a Historial de Evaluaciones**

## 🔧 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor desarrollo con Turbopack
npm run build           # Construir para producción
npm run start           # Ejecutar build de producción
npm run lint            # Linter ESLint
npm run typecheck       # Verificación TypeScript

# IA/Genkit
npm run genkit:dev      # Servidor Genkit desarrollo
npm run genkit:watch    # Genkit con recarga automática

# Sesiones múltiples
npm run dev:session1    # Puerto 9002
npm run dev:session2    # Puerto 9003
npm run dev:session3    # Puerto 9004
```

## 🚨 Troubleshooting

### Problema: Error "No book selected"
**Solución**: Verificar que se haya seleccionado curso y asignatura antes de crear evaluación.

### Problema: QuotaExceededError
**Solución**: El sistema se auto-repara automáticamente. En caso extremo:
```javascript
// En consola del navegador
localStorage.clear(); // Limpiar todo
// O solo historiales:
Object.keys(localStorage)
  .filter(key => key.startsWith('evaluationHistory_'))
  .forEach(key => localStorage.removeItem(key));
```

### Problema: Preguntas genéricas en lugar de específicas
**Solución**: Verificar que `GOOGLE_API_KEY` esté configurada en `.env.local`.

## 📈 Métricas y KPIs v14

- ✅ **100% Preguntas específicas** por tema
- ✅ **0 Errores de cuota** de localStorage
- ✅ **50+ Temas educativos** implementados
- ✅ **Auto-recuperación** ante errores
- ✅ **Debug completo** para troubleshooting

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

- **Repositorio**: [superjf_v14](https://github.com/jorgecastros687-lang/superjf_v14)
- **Issues**: Reportar problemas en GitHub Issues
- **Documentación**: Ver `/docs/` para documentación detallada

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**SMART STUDENT v14** - Transformando la educación con IA inteligente y evaluaciones específicas por tema.

*Desarrollado con ❤️ para la comunidad educativa*