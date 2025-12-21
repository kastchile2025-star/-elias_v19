# 🔧 Solución: Base de datos SQL no funciona en Configuración

## 🔍 Problema Identificado

El panel de **Admin → Configuración** muestra que la base de datos SQL está **desconectada** (❌ SQL Desconectado), lo que impide usar las funciones de carga masiva de calificaciones y asistencia.

## 📋 Diagnóstico Rápido

### 1. Ejecuta el script de diagnóstico

Abre la consola del navegador (F12) en la página **Admin → Configuración** y ejecuta:

```javascript
// Copiar y pegar en la consola
const script = document.createElement('script');
script.src = '/diagnosticar-sql-configuracion.js';
document.head.appendChild(script);
```

Esto te mostrará exactamente qué está fallando.

## 🛠️ Soluciones Paso a Paso

### Solución 1: Configurar Variables de Entorno (Supabase)

Si quieres usar **Supabase** como base de datos SQL:

#### 1. Crear cuenta en Supabase

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Espera a que termine de inicializarse (~2 minutos)

#### 2. Obtener credenciales

En tu proyecto de Supabase:
- Ve a **Settings** → **API**
- Copia:
  - **Project URL** (será algo como `https://xxxxx.supabase.co`)
  - **anon public** key (una clave larga que empieza con `eyJ...`)

#### 3. Crear archivo de variables de entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

#### 4. Crear las tablas en Supabase

Ve a **SQL Editor** en Supabase y ejecuta este SQL:

```sql
-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  score NUMERIC NOT NULL,
  course_id TEXT,
  section_id TEXT,
  subject_id TEXT,
  title TEXT NOT NULL,
  graded_at TIMESTAMPTZ NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tarea', 'prueba', 'evaluacion')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('tarea', 'prueba', 'evaluacion')),
  title TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  course_id TEXT,
  section_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  start_at TIMESTAMPTZ,
  open_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  status TEXT,
  assigned_by_id TEXT,
  assigned_by_name TEXT,
  year INTEGER NOT NULL
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  course_id TEXT,
  section_id TEXT,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL,
  present BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  year INTEGER NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_grades_year ON grades(year);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_test ON grades(test_id);
CREATE INDEX IF NOT EXISTS idx_activities_year ON activities(year);
CREATE INDEX IF NOT EXISTS idx_attendance_year ON attendance(year);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Habilitar RLS (Row Level Security)
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir todo acceso con la clave anon
-- NOTA: En producción, ajusta estas políticas según tus necesidades de seguridad
DROP POLICY IF EXISTS "Allow all for anon" ON grades;
CREATE POLICY "Allow all for anon" ON grades 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for anon" ON activities;
CREATE POLICY "Allow all for anon" ON activities 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for anon" ON attendance;
CREATE POLICY "Allow all for anon" ON attendance 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
```

#### 5. Reiniciar el servidor de desarrollo

```bash
# Detén el servidor (Ctrl+C)
# Vuelve a iniciarlo
npm run dev
```

#### 6. Verificar la conexión

1. Recarga la página de **Admin → Configuración**
2. Verifica que ahora muestre: **✅ SQL Conectado**
3. Los contadores deberían mostrar: **2025: 0 registros • Total: 0 registros**

---

### Solución 2: Usar IndexedDB (Local) - Sin configuración

Si **NO quieres usar Supabase** y prefieres almacenamiento local en el navegador:

#### 1. Asegúrate de NO tener variables de Supabase

El archivo `.env.local` NO debe tener las variables `NEXT_PUBLIC_SUPABASE_*`, o debes comentarlas:

```bash
# .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

#### 2. Forzar el uso de IndexedDB

Ejecuta esto en la consola del navegador:

```javascript
(async () => {
  const { setForceIDB } = await import('./src/lib/sql-config.ts');
  const { initializeSQL } = await import('./src/lib/sql-init.ts');
  
  setForceIDB(true);
  const success = await initializeSQL(true);
  
  console.log('IndexedDB activado:', success ? '✅' : '❌');
  
  if (success) {
    window.location.reload();
  }
})();
```

#### 3. Reiniciar el servidor

```bash
npm run dev
```

**NOTA:** Con IndexedDB, los datos solo se guardan en el navegador local y se perderán si limpias los datos del navegador.

---

## 🧪 Verificación Final

Después de aplicar la solución:

1. Ve a **Admin → Configuración**
2. Busca la sección **"Carga masiva: Calificaciones (SQL)"**
3. Verifica que muestre:
   - Badge: **✅ SQL** (verde)
   - Contador: **2025: 0 registros • Total: 0 registros**
   - Estado: **Estado SQL: Conectado • Año: 2025**

4. Prueba subir un archivo CSV de calificaciones:
   - Click en **"Plantilla CSV"** para descargar ejemplo
   - Click en **"Subir a SQL"** para cargar datos
   - Debería aparecer la ventana de progreso

---

## 🆘 Si sigue sin funcionar

### Opción A: Diagnóstico detallado

Ejecuta en la consola:

```javascript
(async () => {
  console.log('🔍 DIAGNÓSTICO COMPLETO SQL');
  console.log('─'.repeat(50));
  
  // 1. Variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌');
  console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');
  
  // 2. Estado SQL
  const { isSQLConnected, getSQLStatus } = await import('./src/lib/sql-init.ts');
  const { isSupabaseEnabled } = await import('./src/lib/sql-config.ts');
  
  console.log('\n📡 Estado SQL:');
  console.log('Estado:', getSQLStatus());
  console.log('Conectado:', isSQLConnected());
  console.log('Supabase habilitado:', isSupabaseEnabled());
  
  // 3. Prueba de conexión
  console.log('\n🔌 Prueba de conexión:');
  const { sqlDatabase } = await import('./src/lib/sql-database.ts');
  const result = await sqlDatabase.testConnection();
  console.log('Resultado:', result);
  
  if (!result.success) {
    console.error('\n❌ ERROR:', result.error);
  }
})();
```

### Opción B: Reinicialización forzada

```javascript
(async () => {
  const { initializeSQL } = await import('./src/lib/sql-init.ts');
  
  console.log('🔄 Reinicializando SQL...');
  const success = await initializeSQL(true);
  
  if (success) {
    console.log('✅ SQL reinicializado correctamente');
    setTimeout(() => window.location.reload(), 1000);
  } else {
    console.error('❌ Error al reinicializar SQL');
  }
})();
```

---

## 📞 Soporte

Si después de seguir todos los pasos sigue sin funcionar, verifica:

1. ✅ El servidor de desarrollo está corriendo (`npm run dev`)
2. ✅ No hay errores en la consola del navegador (F12)
3. ✅ Las variables de entorno están correctamente escritas
4. ✅ Las tablas fueron creadas en Supabase (si usas Supabase)
5. ✅ El proyecto de Supabase está activo (no pausado)

---

## 🎯 Resumen de Comandos Rápidos

```bash
# 1. Detener el servidor
Ctrl+C

# 2. Editar variables de entorno
# Edita .env.local y agrega las credenciales de Supabase

# 3. Reiniciar el servidor
npm run dev

# 4. Abrir el navegador
# Ve a Admin → Configuración

# 5. Verificar estado SQL
# Debería mostrar: ✅ SQL Conectado
```

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Tablas creadas en Supabase (SQL ejecutado)
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Página recargada (F5)
- [ ] Badge muestra "✅ SQL"
- [ ] Estado muestra "Conectado"
- [ ] Botón "Subir a SQL" está habilitado

Si todos los items están marcados, la base de datos SQL está funcionando correctamente. ✅
