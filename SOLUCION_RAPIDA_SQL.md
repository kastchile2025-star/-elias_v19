# 🔴 PROBLEMA: Base de datos SQL no funciona en Configuración

## ⚡ SOLUCIÓN RÁPIDA (1 minuto)

### Opción 1: Activar con script automático

1. Abre la consola del navegador (presiona **F12**)
2. Ve a la pestaña **Console**
3. Copia y pega esto:

```javascript
const s=document.createElement('script');s.src='/activar-sql-rapido.js';document.head.appendChild(s);
```

4. Presiona **Enter**
5. Espera 2 segundos (la página se recargará automáticamente)
6. ✅ Listo! Ahora debería mostrar **✅ SQL Conectado**

---

## 🔍 ¿Por qué no funciona?

La base de datos SQL está desconectada porque:

1. **NO** tienes configuradas las variables de entorno de Supabase, O
2. Las tablas NO están creadas en Supabase, O
3. La inicialización de SQL falló

---

## 📋 SOLUCIÓN COMPLETA

### Si quieres usar Supabase (Base de datos en la nube)

#### 1️⃣ Crear cuenta y proyecto en Supabase

- Ve a https://supabase.com
- Crea un proyecto gratuito
- Espera 2 minutos a que se active

#### 2️⃣ Obtener credenciales

En tu proyecto Supabase:
- **Settings** → **API**
- Copia:
  - **Project URL**: `https://xxxxx.supabase.co`
  - **anon public key**: `eyJ...` (una clave larga)

#### 3️⃣ Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...tu_clave_completa_aqui
```

#### 4️⃣ Crear tablas en Supabase

- Ve a **SQL Editor** en Supabase
- Copia y pega el SQL de `SOLUCION_SQL_NO_FUNCIONA.md` (sección "Crear las tablas")
- Click en **Run**

#### 5️⃣ Reiniciar servidor

```bash
# Terminal: Detén el servidor (Ctrl+C)
npm run dev
```

#### 6️⃣ Recargar página

- Presiona **F5** en el navegador
- Ve a **Admin** → **Configuración**
- Verifica: **✅ SQL Conectado**

---

### Si prefieres usar IndexedDB (Local, sin configuración)

Si NO quieres usar Supabase, el sistema puede usar **IndexedDB** (base de datos local del navegador):

#### Ventajas
- ✅ No requiere configuración
- ✅ Funciona sin internet
- ✅ Gratis

#### Desventajas
- ⚠️ Los datos solo existen en tu navegador
- ⚠️ Se pierden si limpias los datos del navegador
- ⚠️ NO se comparten entre dispositivos

#### Activar IndexedDB

Opción A: Ejecuta el script rápido (ver arriba)

Opción B: Manualmente en la consola:

```javascript
(async () => {
  const { setForceIDB } = await import('/src/lib/sql-config.ts');
  const { initializeSQL } = await import('/src/lib/sql-init.ts');
  
  setForceIDB(true);
  await initializeSQL(true);
  
  console.log('✅ IndexedDB activado');
  window.location.reload();
})();
```

---

## 🧪 Verificar que funciona

Después de aplicar la solución:

1. Ve a **Admin** → **Configuración**
2. Busca la sección **"Carga masiva: Calificaciones (SQL)"**
3. Verifica estos indicadores:

```
✅ Debe mostrar:
   • Badge verde: "✅ SQL"
   • Contador: "2025: 0 registros • Total: 0 registros"
   • Estado: "Estado SQL: Conectado • Año: 2025"
   • Botón "Subir a SQL" habilitado (no gris)

❌ NO debe mostrar:
   • Badge rojo: "❌ SQL"
   • Estado: "Desconectado"
   • Botón "Subir a SQL" deshabilitado (gris)
```

4. Prueba subir un CSV:
   - Click en **"Plantilla CSV"**
   - Descarga el archivo de ejemplo
   - Agrega algunos datos
   - Click en **"Subir a SQL"**
   - Debe aparecer la ventana de progreso

---

## 🆘 Aún no funciona?

### Diagnóstico detallado

Ejecuta esto en la consola:

```javascript
const s=document.createElement('script');s.src='/diagnosticar-sql-configuracion.js';document.head.appendChild(s);
```

Te mostrará exactamente qué está fallando.

### Errores comunes

| Error | Solución |
|-------|----------|
| "Variables de entorno faltantes" | Crea `.env.local` con las credenciales |
| "Faltan tablas en Supabase" | Ejecuta el SQL de creación de tablas |
| "RLS bloquea acceso" | Verifica las políticas RLS en Supabase |
| "Supabase no configurado" | Usa IndexedDB en su lugar |

---

## 📞 Archivos de ayuda

- **SOLUCION_SQL_NO_FUNCIONA.md**: Guía completa detallada
- **diagnosticar-sql-configuracion.js**: Script de diagnóstico
- **activar-sql-rapido.js**: Solución automática

---

## ✅ Checklist Final

Antes de decir "no funciona", verifica:

- [ ] El servidor está corriendo (`npm run dev`)
- [ ] La página fue recargada (F5)
- [ ] No hay errores en la consola (F12)
- [ ] Estás en la página **Admin → Configuración**
- [ ] Si usas Supabase:
  - [ ] Variables en `.env.local` están correctas
  - [ ] Tablas fueron creadas en Supabase
  - [ ] Proyecto de Supabase está activo (no pausado)
- [ ] Si usas IndexedDB:
  - [ ] Ejecutaste el script de activación
  - [ ] La página fue recargada

---

## 🎯 Resultado Esperado

Después de seguir esta guía:

```
Admin → Configuración
│
├─ Carga masiva: Calificaciones (SQL) ✅ SQL
│  ├─ Estado SQL: Conectado • Año: 2025
│  ├─ 2025: 0 registros • Total: 0 registros
│  ├─ [Plantilla CSV] [Subir a SQL] ✅ habilitado
│  └─ [Descargar] [Borrar SQL]
│
└─ Carga masiva: Asistencia (SQL) ✅ SQL
   ├─ Estado SQL: Conectado • Año: 2025
   ├─ 2025: 0 registros • Total: 0 registros
   └─ Botones habilitados
```

**¡Listo para usar! 🎉**
