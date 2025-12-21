# Solución: Quota Exceeded en Firebase Firestore (Plan Blaze)

## 🚨 Problema
```
FirebaseError: [code=resource-exhausted]: Quota exceeded.
```

**Contexto**: Error al usar Firebase SDK web incluso con plan Blaze activado.

## Causas Comunes
1. **Reglas de seguridad mal configuradas** - Permiten acceso ilimitado.
2. **Caché local deshabilitado** - Re-lecturas innecesarias.
3. **Queries ineficientes** - Escanean colecciones grandes.
4. **Plan Spark aún activo** - Límites: 50k lecturas/día, 20k escrituras/día.
5. **Múltiples instancias** - Varias pestañas/apps usando el mismo proyecto.

## ✅ Soluciones

### 1) Verificar Plan Blaze Activo
Firebase Console > Uso y facturación:
- Debe decir **"Blaze (pago por uso)"**
- Si dice "Spark (gratuito)", actualizar a Blaze
- Verificar método de pago configurado

### 2) Configurar Reglas de Firestore Seguras

**Problema**: Reglas en modo prueba permiten acceso ilimitado.

Ir a: Firebase Console > Firestore Database > Reglas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Colecciones de cursos
    match /courses/{courseId} {
      allow read: if true; // Lectura pública
      allow write: if request.auth != null && 
                     request.auth.token.role in ['admin', 'teacher'];
      
      // Subcolecciones: calificaciones
      match /grades/{gradeId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                       request.auth.token.role in ['teacher', 'admin'];
      }
      
      // Subcolecciones: asistencia
      match /attendance/{attendanceId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                       request.auth.token.role in ['teacher', 'admin'];
      }
    }
    
    // Colección health (solo Admin SDK backend)
    match /health/{doc} {
      allow read, write: if false;
    }
  }
}
```

**Publicar las reglas** y esperar 1-2 minutos.

### 3) Habilitar Caché Local (Persistencia)
Reduce lecturas al reutilizar datos en caché del navegador.

**Ya implementado en `src/lib/firebase-config.ts`** ✅

### 4) Optimizar Queries
Evita queries que escanean colecciones completas:

```typescript
// ❌ MAL: trae todos los documentos
const snapshot = await getDocs(collection(db, 'courses/curso-1/grades'));

// ✅ BIEN: limita y filtra
const q = query(
  collection(db, 'courses/curso-1/grades'),
  where('year', '==', 2025),
  orderBy('gradedAt', 'desc'),
  limit(100)
);
const snapshot = await getDocs(q);
```

### 5) Monitorear Uso
Firebase Console > Uso y facturación > Detalles:
- Lecturas/escrituras actuales del día
- Documentos almacenados (GB)
- Costo estimado mensual

### 6) Importación Masiva: Usar Admin SDK (Backend)
Para cargar 300k registros, NO usar SDK web. Usar scripts Node.js:

```bash
# 1. Configurar cuenta de servicio
export $(grep -v '^#' .env.firebase | xargs)

# 2. Verificar conexión
npm run firebase:check

# 3. Prueba en seco (no escribe)
npm run import:grades -- --file=./datos/grades.csv --year=2025 --dry

# 4. Importación real
npm run import:grades -- --file=./datos/grades.csv --year=2025
```

**Admin SDK NO cuenta** contra los límites de cuota del SDK web.

## 📋 Checklist para tu Proyecto (superjf1234-e9cbc)

- [x] 1. Actualizar `.env.local` con nuevo proyecto
- [ ] 2. Descargar cuenta de servicio → `keys/superjf1234-service-account.json`
- [ ] 3. Configurar `.env.firebase` con ruta al JSON
- [ ] 4. Publicar reglas de Firestore (ver arriba)
- [ ] 5. Verificar plan Blaze activo en consola
- [ ] 6. Ejecutar `npm run firebase:check` para verificar conexión
- [ ] 7. Habilitar persistencia (ya implementado en código)
- [ ] 8. Probar importador con CSV pequeño (--dry)
- [ ] 9. Ejecutar carga masiva (300k registros)
- [ ] 10. Monitorear uso en Firebase Console

## 🆘 Solución Rápida para el Error Actual

### Paso 1: Reiniciar el servidor de desarrollo
```bash
# Ctrl+C para detener el servidor actual
npm run dev
```

### Paso 2: Limpiar caché del navegador
- Abrir DevTools (F12)
- Application → Storage → Clear site data
- Recargar la página

### Paso 3: Verificar proyecto correcto
Abrir consola del navegador y ejecutar:
```javascript
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
// Debe mostrar: superjf1234-e9cbc
```

---
**Proyecto actualizado**: superjf1234-e9cbc (Plan Blaze)  
**Última actualización**: 2025-10-12
- ✅ Elimina todos los backups existentes
- ✅ Remueve archivos >500KB (excepto SQL principal)
- ✅ Limpia datos temporales/demo/cache
- ✅ Vacía sessionStorage
- ✅ Muestra espacio liberado

## 📊 Nuevos Límites y Umbrales

| Operación | Límite Anterior | Límite Nuevo | Razón |
|-----------|----------------|--------------|-------|
| Backup automático | ✅ Activo | ❌ Deshabilitado | Duplicaba memoria |
| Limpieza automática | 1MB | 512KB | Más agresivo |
| Warning de tamaño | 4MB | 3MB | Detección temprana |
| Emergency save | 50% datos | 33% datos | Más conservador |
| Cleanup scope | Solo temp | Todo no-SQL | Más completo |

## 🔄 Flujo de Recuperación Actualizado

1. **Carga Normal**: Datos desde localStorage (sin backup)
2. **Error de Lectura**: Buscar en sessionStorage emergency
3. **Quota Exceeded**: Emergency cleanup → retry con datos esenciales
4. **Fallo Total**: sessionStorage con 1/3 de datos + error informativo

## ⚠️ Cambios de Comportamiento

### Lo que YA NO ocurre:
- ❌ No se crean backups automáticos
- ❌ No se intenta recuperar desde backup
- ❌ No se guardan datos >3MB sin comprimir primero

### Lo que AHORA ocurre:
- ✅ Limpieza inmediata de backups al iniciar
- ✅ Validación de tamaño antes de guardar
- ✅ Emergency cleanup más agresivo
- ✅ Logging detallado de operaciones de limpieza

## 📈 Resultados Esperados

- **Reducción memoria**: ~50% menos uso (sin backups)
- **Prevención errores**: Detección temprana de problemas
- **Recuperación**: Solo en casos extremos vía sessionStorage
- **Performance**: Operaciones más rápidas sin backups

## 🧪 Pruebas de Validación

1. ✅ Carga sin QuotaExceededError (backup eliminado)
2. ✅ Limpieza automática de backups existentes
3. ✅ Emergency cleanup más efectivo
4. ✅ Persistencia sin duplicación de datos
5. ✅ Sincronización entre pestañas mantenida
