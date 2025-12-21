# 🚀 GUÍA DE COMPILACIÓN Y CONFIGURACIÓN - SMART STUDENT V5

## 📋 Resumen Ejecutivo

Esta guía te ayudará a compilar y configurar el indicador de IA en el área de trabajo de SMART STUDENT HTML V5 para que funcione correctamente.

## 🎯 Estado Actual

✅ **Proyecto configurado:** Next.js 15.4.1 con Turbopack  
✅ **Indicador IA implementado:** Componente funcional creado  
✅ **API endpoint:** Sistema de verificación de estado IA  
⚠️ **Configuración pendiente:** API Key de Google AI Studio  

## 🔧 Requisitos Previos

- **Node.js:** v18 o superior
- **NPM:** v8 o superior  
- **Google AI Studio Account:** Para obtener API Key
- **Puerto disponible:** 3000 o 9002

## 📦 Pasos de Compilación

### 1. Instalar Dependencias

```bash
cd /workspaces/SMART_STUDENT_HTML_V5
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# API Key de Google AI Studio (REQUERIDO)
GOOGLE_API_KEY=AIza...tu_clave_real_aqui

# Configuración de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuración de Genkit
GENKIT_ENV=dev

# Firebase (opcional, para funcionalidades avanzadas)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 3. Obtener API Key de Google AI Studio

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente
4. Haz clic en "Create API Key"
5. Copia la clave generada (comienza con "AIza...")
6. Pégala en tu archivo `.env.local`

### 4. Compilar y Ejecutar

```bash
# Desarrollo (recomendado)
npm run dev

# O especificar puerto manualmente
npm run dev -- -p 3000

# Construcción para producción
npm run build
npm start
```

## 🤖 Configuración del Indicador IA

### Componente Principal

**Ubicación:** `/src/components/shared/ai-status-indicator.tsx`

**Funcionalidades:**
- ✅ Verificación automática cada 30 segundos
- ✅ Tooltip informativo con detalles
- ✅ Estados visuales: Verificando (amarillo), Activo (verde), Inactivo (rojo)
- ✅ Manejo de errores robusto

### API Endpoint

**Ubicación:** `/src/app/api/ai-status/route.ts`

**Verificaciones:**
- ✅ Existencia de API Key
- ✅ Formato válido de la clave
- ✅ Configuración de Genkit
- ✅ Información detallada de estado

### Integración en Layout

**Ubicación:** `/src/app/dashboard/layout.tsx`

El indicador está integrado en el header junto al logo de SMART STUDENT.

## 🎨 Estados del Indicador

| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟡 **Verificando** | Amarillo | Comprobando conexión con la IA |
| 🟢 **Activo** | Verde | IA funcionando correctamente |
| 🔴 **Inactivo** | Rojo | IA no configurada o con errores |

## 🔍 Verificación y Depuración

### Página de Pruebas

Accede a la página de pruebas creada:
```
http://localhost:3000/test-ai-indicator-config.html
```

### Verificación Manual

```bash
# Verificar estado de la API
curl http://localhost:3000/api/ai-status

# Verificar variables de entorno
echo $GOOGLE_API_KEY
```

### Console Logs

Abre las herramientas de desarrollador (F12) para ver logs detallados:
- `🤖 AI Status Check:` - Verificaciones exitosas
- `❌ Error checking AI status:` - Errores de conexión
- `🔍 Checking AI status...` - Información del servidor

## 🚨 Solución de Problemas

### Problema: Indicador siempre en rojo

**Causas posibles:**
1. API Key no configurada
2. Formato de API Key incorrecto
3. Archivo `.env.local` no existe
4. Servidor no reiniciado después de cambios

**Soluciones:**
```bash
# 1. Verificar archivo de configuración
ls -la .env.local

# 2. Verificar contenido
cat .env.local

# 3. Reiniciar servidor
# Ctrl+C para detener
npm run dev
```

### Problema: Puerto en uso

```bash
# Usar puerto alternativo
npm run dev -- -p 3001

# O terminar proceso en puerto
sudo lsof -ti:3000 | xargs sudo kill -9
```

### Problema: Dependencias faltantes

```bash
# Limpiar cache e instalar
rm -rf node_modules package-lock.json
npm install
```

## 🌟 Funcionalidades de IA Disponibles

Una vez configurado correctamente, tendrás acceso a:

- **📄 Generación de Resúmenes:** Crea resúmenes automáticos de contenido
- **🗺️ Mapas Mentales:** Genera mapas conceptuales inteligentes  
- **❓ Cuestionarios:** Crea preguntas personalizadas
- **📊 Evaluaciones:** Contenido adaptativo para evaluaciones
- **💬 Asistencia:** Ayuda en comentarios y retroalimentación

## 📁 Estructura de Archivos Relevantes

```
/workspaces/SMART_STUDENT_HTML_V5/
├── .env.local                          # Variables de entorno
├── src/
│   ├── components/shared/
│   │   └── ai-status-indicator.tsx     # Componente indicador
│   ├── app/
│   │   ├── dashboard/layout.tsx        # Layout principal
│   │   └── api/ai-status/route.ts      # API endpoint
│   └── ai/
│       ├── genkit.ts                   # Configuración Genkit
│       ├── dev.ts                      # Desarrollo IA
│       └── flows/                      # Flujos de IA
├── package.json                        # Dependencias
└── test-ai-indicator-config.html       # Página de pruebas
```

## ✅ Lista de Verificación Final

- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env.local` creado
- [ ] API Key de Google configurada
- [ ] Servidor ejecutándose (`npm run dev`)
- [ ] Indicador visible en header
- [ ] Estado verde en el indicador
- [ ] Funcionalidades IA disponibles

## 🎯 Próximos Pasos

1. **Configurar API Key** (más importante)
2. **Verificar indicador en dashboard**
3. **Probar funcionalidades IA**
4. **Configurar Firebase** (opcional)
5. **Deploy a producción**

---

**📞 Soporte:** Si tienes problemas, revisa los logs de la consola y la página de pruebas.  
**📅 Fecha:** 22 de julio de 2025  
**🔧 Estado:** ✅ LISTO PARA USAR (requiere API Key)

---

*Esta documentación te guía paso a paso para tener el indicador de IA funcionando correctamente en SMART STUDENT V5.*
