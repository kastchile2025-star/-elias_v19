# Carga Masiva de Calificaciones - Firebase (Pestaña Configuración)

## 🎯 Actualización Importante

Con Firebase habilitado, la carga masiva desde la pestaña **Admin → Configuración** ahora usa el backend con Firebase Admin SDK en lugar de SQL local.

## ✅ Ventajas del Nuevo Método

1. **Sin límites de cuota del navegador**: Usa Admin SDK que no cuenta contra límites del plan
2. **Más rápido**: Procesa en el servidor sin bloquear el navegador
3. **Más seguro**: Las credenciales Admin no se exponen al cliente
4. **Manejo de errores mejorado**: Reintentos automáticos y logs detallados

## 📋 Cómo Usar

### Paso 1: Preparar CSV
El formato es el mismo que antes. Encabezados aceptados (sin importar mayúsculas/acentos):

| Campo | Alias Aceptados | Requerido | Ejemplo |
|-------|----------------|-----------|---------|
| Nombre | nombre, student, studentName | ✅ | Juan Pérez |
| RUT | rut, studentId, id | ✅ | 12345678-9 |
| Curso | curso, course, courseId | ✅ | Matemáticas 1A |
| Sección | seccion, section, sectionId | ⚪ | A |
| Asignatura | asignatura, subject, subjectId | ⚪ | Álgebra |
| Profesor | profesor, teacher, teacherName | ⚪ | Prof. García |
| Fecha | fecha, date, gradedAt | ✅ | 2025-01-15 |
| Tipo | tipo, type | ✅ | evaluacion / tarea / prueba |
| Nota | nota, score | ✅ | 6.5 (o 65 si es 0-100) |

### Ejemplo CSV:
```csv
nombre,rut,curso,asignatura,fecha,tipo,nota
Juan Pérez,12345678-9,Matemáticas 1A,Álgebra,2025-01-15,evaluacion,6.5
María González,98765432-1,Historia 2B,Historia Universal,2025-01-16,tarea,7.0
```

### Paso 2: Subir desde Configuración
1. Ir a **Admin → Configuración**
2. Sección **"Carga Masiva: Calificaciones → SQL"**
3. Clic en **"Subir Excel"** (acepta CSV)
4. Seleccionar archivo
5. Esperar confirmación

### Paso 3: Verificar Resultados
El sistema mostrará:
- ✅ Registros procesados exitosamente
- ❌ Errores encontrados (primeros 10)
- 📊 Total de registros importados

## 🔧 Configuración Requerida

### Variables de Entorno (ya configuradas)
```bash
# .env.local - Cliente
NEXT_PUBLIC_USE_FIREBASE=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=superjf1234-e9cbc
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...

# Variables de servidor (para API route)
# Opción 1: Variable de entorno con JSON completo
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Opción 2: Default credentials
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## 🆘 Solución de Problemas

### "Preparando archivo..." se queda congelado
**Causa**: Firebase no está configurado correctamente o faltan credenciales del servidor.

**Solución**:
1. Verificar que `NEXT_PUBLIC_USE_FIREBASE=true` en `.env.local`
2. Verificar que las credenciales Admin estén configuradas (ver `.env.firebase`)
3. Reiniciar servidor dev: `Ctrl+C` y `npm run dev`

### Error 401 Unauthorized
**Causa**: Falta autenticación o token inválido.

**Solución**:
- Por ahora, la API acepta todas las requests (solo para desarrollo)
- En producción, implementar verificación de token de admin

### Error 500 Internal Server Error
**Causa**: Problema con Firebase Admin SDK o credenciales.

**Solución**:
1. Verificar logs del servidor (terminal donde corre `npm run dev`)
2. Asegurar que `FIREBASE_SERVICE_ACCOUNT_JSON` esté configurado correctamente
3. Verificar que la cuenta de servicio tenga permisos de Firestore

### Algunos registros no se importan
**Causa**: Errores de validación en filas específicas.

**Solución**:
- Revisar el mensaje de respuesta (muestra primeros 10 errores)
- Verificar formato de fechas (YYYY-MM-DD)
- Verificar que las notas estén en rango válido (0-100 o 1.0-7.0)
- Asegurar que estudiantes y cursos existan en el sistema

## 🚀 Cargas Muy Grandes (>100k registros)

Para cargas masivas muy grandes (300k+), sigue siendo recomendable usar el **script CLI**:

```bash
# Configurar credenciales
export $(grep -v '^#' .env.firebase | xargs)

# Importar
npm run import:grades -- --file=./datos/grades-300k.csv --year=2025
```

**Ventajas del CLI para cargas grandes**:
- Usa BulkWriter optimizado
- Manejo automático de backpressure
- Reintentos configurables
- No depende del navegador
- Logs más detallados

## 📊 Comparación de Métodos

| Característica | UI (Configuración) | CLI (Script) |
|----------------|-------------------|--------------|
| Tamaño recomendado | < 50k registros | Cualquier tamaño |
| Velocidad | Rápido | Muy rápido |
| UI de progreso | ✅ | ⚪ (solo logs) |
| Requiere terminal | ❌ | ✅ |
| Ideal para | Cargas pequeñas/medianas | Cargas masivas |

## 🔄 Migración desde SQL Local

Si tenías datos en SQL local (IndexedDB) y ahora usas Firebase:

1. **Exportar datos existentes**: Admin → Configuración → Exportar SQL
2. **Importar a Firebase**: Usar el mismo botón "Subir Excel" (ahora usa Firebase)
3. **Verificar**: Los datos aparecerán en Firestore bajo `courses/{courseId}/grades`

## 📖 Ver También
- `GUIA_CONFIGURACION_FIREBASE_BLAZE.md` - Configuración completa de Firebase
- `CARGA_MASIVA_FIRESTORE.md` - Guía del script CLI
- `SOLUCION_QUOTA_EXCEEDED.md` - Troubleshooting

---
**Última actualización**: 2025-10-12  
**Estado**: ✅ Funcional con Firebase habilitado
