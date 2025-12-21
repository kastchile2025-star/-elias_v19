# 📚 Sistema Educativo Completo - Datos de Prueba

Este directorio contiene todos los archivos necesarios para implementar un sistema educativo completo con **1,080 estudiantes** y **14 profesores** distribuidos en **12 cursos** (1ro Básico a 4to Medio).

## 🚀 Inicio Rápido

### ¿Primera vez aquí? LEE ESTO PRIMERO:

1. **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** ⭐ ← **EMPIEZA AQUÍ**
2. **[GUIA_SISTEMA_COMPLETO.md](GUIA_SISTEMA_COMPLETO.md)** ← Guía detallada paso a paso
3. **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** ← Resumen ejecutivo

## 📁 Archivos Disponibles

### 🎯 Archivos CSV Para Cargar

| Archivo | Contenido | Tamaño | Usar Para |
|---------|-----------|--------|-----------|
| **estudiantes_sistema_completo.csv** | 1,080 estudiantes | 101 KB | Sistema completo (1ro Básico - 4to Medio) |
| **profesores_sistema_completo.csv** | 14 profesores (268 asignaciones) | 27 KB | Sistema completo (todas las asignaturas) |
| estudiantes_45_por_seccion.csv | 90 estudiantes | 8.1 KB | Prueba básica (solo 1ro Básico) |
| profesores_por_asignatura.csv | 10 profesores | 2.1 KB | Prueba básica (solo 1ro Básico) |

### 🛠️ Scripts de Generación

| Script | Propósito |
|--------|-----------|
| **generar_estudiantes.py** | Regenera archivo de estudiantes completo |
| **generar_profesores.py** | Regenera archivo de profesores completo |

### 📖 Documentación

| Documento | Contenido |
|-----------|-----------|
| **INICIO_RAPIDO.md** | 🔥 Vista rápida con instrucciones en 3 pasos |
| **GUIA_SISTEMA_COMPLETO.md** | 📚 Guía completa y detallada |
| **RESUMEN_EJECUTIVO.md** | 📊 Resumen ejecutivo con estadísticas |
| **README_CARGA_MASIVA.md** | 📖 Guía básica de carga masiva |
| **EJEMPLO_COMPLETO_SISTEMA.md** | 💡 Ejemplos y casos de uso |

## 📊 ¿Qué Sistema Necesitas?

### Opción 1: Sistema Completo (Recomendado)

**Para producción o demostración completa:**

- ✅ **1,080 estudiantes** (45 por sección)
- ✅ **14 profesores** con todas las asignaturas
- ✅ **12 cursos** (1ro Básico a 4to Medio)
- ✅ **24 secciones** (A y B para cada curso)

**Archivos a usar:**
- `estudiantes_sistema_completo.csv`
- `profesores_sistema_completo.csv`

**Documentación:**
- [GUIA_SISTEMA_COMPLETO.md](GUIA_SISTEMA_COMPLETO.md)

---

### Opción 2: Sistema Básico (Pruebas)

**Para pruebas rápidas o demostración pequeña:**

- ✅ **90 estudiantes** (45 por sección)
- ✅ **10 profesores** básicos
- ✅ **1 curso** (1ro Básico)
- ✅ **2 secciones** (A y B)

**Archivos a usar:**
- `estudiantes_45_por_seccion.csv`
- `profesores_por_asignatura.csv`

**Documentación:**
- [README_CARGA_MASIVA.md](README_CARGA_MASIVA.md)

## 🎯 Instrucciones Rápidas

### Pasos Generales

1. **Preparar Sistema:**
   - Crear cursos en Admin → Gestión de Usuarios → Cursos
   - Crear secciones en Admin → Gestión de Usuarios → Secciones

2. **Cargar Datos:**
   - Admin → Configuración → Carga Masiva Excel
   - Cargar PRIMERO: archivo de profesores
   - Cargar DESPUÉS: archivo de estudiantes

3. **Verificar:**
   - Revisar usuarios creados
   - Probar login con profesor y estudiante
   - Verificar asignaciones

## 📈 Estadísticas del Sistema Completo

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📊 SISTEMA EDUCATIVO COMPLETO            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                           ┃
┃  👥 Estudiantes:              1,080       ┃
┃  👨‍🏫 Profesores:                  14       ┃
┃  📚 Asignaciones:               268       ┃
┃  🎓 Cursos:                      12       ┃
┃  📖 Secciones:                   24       ┃
┃  🏫 Asignaturas:                 14       ┃
┃                                           ┃
┃  ✅ Educación Básica:      720 est.       ┃
┃  ✅ Educación Media:       360 est.       ┃
┃                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Distribución por Nivel

| Nivel | Cursos | Secciones | Estudiantes |
|-------|--------|-----------|-------------|
| Educación Básica | 8 | 16 | 720 |
| Educación Media | 4 | 8 | 360 |
| **TOTAL** | **12** | **24** | **1,080** |

### Asignaturas Cubiertas

**Básicas (Todos los cursos):**
- Matemáticas (MAT)
- Lenguaje y Comunicación (LEN)
- Ciencias Naturales (CNT)
- Historia y Geografía (HIST)
- Inglés (ING)
- Educación Física (EFI)
- Música (MUS)
- Artes Visuales (ART)
- Tecnología (TEC)
- Religión (REL)

**Especializadas (Enseñanza Media):**
- Biología (BIO)
- Física (FIS)
- Química (QUI)
- Filosofía (FIL)

## 🔑 Credenciales

**Password para TODOS los usuarios:** `1234`

### Ejemplos de Login

**Profesores:**
```
👨‍🏫 r.diaz      / 1234  (Roberto Díaz - Matemáticas)
👩‍🏫 p.gonzalez  / 1234  (Patricia González - Lenguaje)
👨‍🏫 c.munoz     / 1234  (Carlos Muñoz - Ciencias)
```

**Estudiantes:**
- Username: (auto-generado desde email)
- Password: `1234`

## 🛠️ Regenerar Archivos

Si necesitas modificar o regenerar los archivos:

```bash
cd /workspaces/superjf_v16/public/test-data

# Regenerar estudiantes
python3 generar_estudiantes.py

# Regenerar profesores
python3 generar_profesores.py
```

## ⚠️ Advertencias Importantes

1. **Orden de carga:** SIEMPRE cargar profesores ANTES que estudiantes
2. **Preparación:** Crear cursos y secciones ANTES de cargar datos
3. **Tiempo:** La carga de 1,080 estudiantes puede tomar 3-5 minutos
4. **Nombres exactos:** Los nombres de cursos deben coincidir EXACTAMENTE con el CSV
5. **Backup:** Hacer backup antes de cargar datos masivos

## 📚 Más Información

### Documentación Completa

1. **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Vista rápida y visual
2. **[GUIA_SISTEMA_COMPLETO.md](GUIA_SISTEMA_COMPLETO.md)** - Guía completa paso a paso
3. **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Resumen ejecutivo
4. **[README_CARGA_MASIVA.md](README_CARGA_MASIVA.md)** - Información básica
5. **[EJEMPLO_COMPLETO_SISTEMA.md](EJEMPLO_COMPLETO_SISTEMA.md)** - Casos de uso

### Archivos de Calificaciones (Bonus)

También hay archivos CSV de ejemplo para calificaciones:
- `calificaciones_reales_200.csv` - 200 calificaciones de ejemplo
- `calificaciones_prueba_200.csv` - 200 calificaciones de prueba

## 🎯 ¿Por Dónde Empezar?

### Si es tu primera vez:
👉 **Lee [INICIO_RAPIDO.md](INICIO_RAPIDO.md)** ← Empieza aquí

### Si necesitas detalles:
👉 **Lee [GUIA_SISTEMA_COMPLETO.md](GUIA_SISTEMA_COMPLETO.md)** ← Guía completa

### Si solo necesitas estadísticas:
👉 **Lee [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** ← Solo datos

## 💡 Soporte

Si tienes problemas:
1. Revisa la sección "Solución de Problemas" en la guía completa
2. Verifica que hayas seguido el orden correcto
3. Asegúrate de que los cursos y secciones existan en el sistema
4. Revisa los logs en la consola del navegador

---

**Sistema**: SmartStudent v16  
**Última Actualización**: 18 de Octubre de 2025  
**Versión de Datos**: 1.0

🎓 **¡Tu sistema educativo completo está listo!** 🎓
