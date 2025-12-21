# 🔧 Solución: Problemas de Carga Masiva en Vercel

## 🎯 **Problema Identificado**

El sistema de carga masiva de calificaciones está fallando porque:

1. **❌ No hay configuración de Supabase**: Faltan variables de entorno
2. **❌ Fallback a IndexedDB**: El sistema está usando almacenamiento local
3. **❌ Error en producción**: Vercel no puede acceder a la base de datos

## 🚀 **Solución Paso a Paso**

### **Paso 1: Configurar Variables de Entorno Localmente**

Agrega estas variables a tu archivo `.env.local`:

```bash
# Configuración de Supabase para SQL
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

### **Paso 2: Configurar Variables en Vercel**

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings > Environment Variables**
3. Agrega las mismas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Paso 3: Crear Tablas en Supabase**

Ejecuta estos comandos SQL en tu panel de Supabase:

```sql
-- Tabla para calificaciones
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
  graded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  year INTEGER NOT NULL,
  type TEXT CHECK (type IN ('tarea', 'prueba', 'evaluacion')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para actividades
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('tarea', 'prueba', 'evaluacion')),
  title TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  course_id TEXT,
  section_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE,
  open_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  assigned_by_id TEXT,
  assigned_by_name TEXT,
  year INTEGER NOT NULL
);

-- Tabla para asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  course_id TEXT,
  section_id TEXT,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL,
  present BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  year INTEGER NOT NULL
);
```

### **Paso 4: Configurar Políticas RLS (Row Level Security)**

```sql
-- Habilitar RLS
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (ajustar según necesidades)
CREATE POLICY "Allow all operations" ON grades FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON attendance FOR ALL USING (true);
```

## 🔍 **Diagnóstico Adicional**

### **Verificar Estado SQL (en la consola del navegador):**

```javascript
// Verificar configuración SQL
console.log('🔍 Verificando configuración SQL...');

// 1. Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Falta');
console.log('SUPABASE_KEY:', supabaseKey ? '✅ Configurada' : '❌ Falta');

// 2. Verificar estado de conexión
const sqlConfig = localStorage.getItem('smart-student-sql-config');
console.log('Configuración SQL local:', sqlConfig);

// 3. Verificar datos en IndexedDB vs SQL
const gradesLocal = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
console.log('Calificaciones locales (IndexedDB):', gradesLocal.length);
```

### **Script de Migración de Emergencia:**

```javascript
// SOLO si necesitas migrar datos de IndexedDB a SQL temporalmente
async function migrateToSQL() {
  console.log('🔄 Iniciando migración de emergencia...');
  
  try {
    // Obtener datos locales
    const grades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
    
    if (grades.length === 0) {
      console.log('❌ No hay calificaciones para migrar');
      return;
    }
    
    console.log(`📊 Encontradas ${grades.length} calificaciones para migrar`);
    
    // Aquí iría la lógica de migración
    // (esto requiere que Supabase esté configurado)
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

// migrateToSQL();
```

## 🎯 **Verificación Post-Implementación**

Después de configurar las variables:

1. **Redeploy en Vercel**
2. **Verificar conexión SQL** en la consola de admin
3. **Probar carga masiva** con un archivo pequeño
4. **Verificar contadores** se actualicen correctamente

## 📋 **Archivos Principales Involucrados**

- `src/lib/sql-config.ts` - Configuración de conexión
- `src/lib/sql-database.ts` - Servicio de base de datos
- `src/hooks/useGradesSQL.ts` - Hook de calificaciones SQL
- `src/components/admin/user-management/configuration.tsx` - UI de configuración

## 🚨 **Notas Importantes**

1. **Backup**: Antes de migrar, haz backup de los datos locales
2. **Testing**: Prueba primero en desarrollo antes de producción
3. **Monitoreo**: Vigila los logs de Vercel para errores de conexión
4. **Rollback**: Ten un plan de respaldo si algo falla

## 🆘 **Si el Problema Persiste**

1. Revisa los logs de Vercel Function
2. Verifica las políticas RLS en Supabase
3. Comprueba que las tablas existan con las columnas correctas
4. Confirma que la configuración de red permita conexiones desde Vercel