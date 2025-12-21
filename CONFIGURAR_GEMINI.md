## Configuración de Gemini / Google AI

Esta guía te ayuda a activar las funciones de IA (resúmenes, cuestionarios, mapas, evaluaciones, sugerencias del MonitoInteractivo).

### 1. Crear clave en Google AI Studio
1. Ve a https://aistudio.google.com/  (inicia sesión con tu cuenta).
2. En la sección API Keys crea una nueva clave.
3. Copia la clave (formato típico: `AIza...`).

### 2. Variables de entorno (local)
Copia el archivo `.env.example` a `.env.local` y completa al menos una variable de este bloque:

```
GOOGLE_AI_API_KEY=AIza...tu_clave
# (Opcional) Alternativas aceptadas:
# GOOGLE_API_KEY=AIza...tu_clave
# GEMINI_API_KEY=AIza...tu_clave
```

Reinicia el servidor de desarrollo:
```
npm run dev
```

### 3. Despliegue (Vercel u otro)
En el panel del proyecto agrega las mismas variables (ideal: `GOOGLE_AI_API_KEY`). Haz un redeploy para que tomen efecto.

### 4. Verificar estado
En el dashboard debe aparecer el indicador de IA en color verde (tooltip: “IA Activa”). Internamente se consulta `/api/ai-status`.

### 5. Rutas que usan la clave
- `src/app/api/gemini/suggestion/route.ts`
- `src/app/api/generate-questions/route.ts`
- `src/app/api/generate-slides/route.ts`
- `src/app/api/generate-summary/route.ts`
- `src/ai/genkit.ts` y flujos en `src/ai/flows/*`

Todas aceptan: `GOOGLE_AI_API_KEY || GOOGLE_API_KEY || GEMINI_API_KEY || NEXT_PUBLIC_GOOGLE_API_KEY` (en ese orden de prioridad cuando se ha unificado).

### 6. Seguridad
- NO expongas la clave en el cliente salvo que sea estrictamente necesario (evitar `NEXT_PUBLIC_*`).
- No subas `.env.local` al repositorio (ya está ignorado en `.gitignore`).

### 7. Errores comunes
| Síntoma | Causa | Solución |
|--------|-------|----------|
| Tooltip “IA Inactiva” | Variable ausente o corta (<30 chars) | Revisar `.env.local` y reiniciar dev server |
| Fallback de texto genérico | Clave faltante en rutas Gemini | Definir `GOOGLE_AI_API_KEY` |
| 429 / cuota | Exceso de peticiones | Implementar caché o limitar frecuencia |

### 8. Prueba rápida de endpoint sugerencias
```
curl -X POST http://localhost:3000/api/gemini/suggestion \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Genera una breve sugerencia motivacional en español"}'
```

Deberías recibir `{ suggestion: "...", isDefault: false }` si la clave es válida.

### 9. Próximos pasos opcionales
- Añadir logging estructurado (p.ej. con pino) para llamadas AI.
- Implementar caching en Redis o KV para prompts repetidos.
- Métricas de uso (contadores por ruta AI).

---
Si ya ves el indicador en verde, ¡la IA está lista! 🚀
