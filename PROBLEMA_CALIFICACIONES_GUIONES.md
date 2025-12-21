# 🔍 PROBLEMA: Calificaciones Mostrando "—" en lugar de Notas

## 📸 Situación Actual (Según Capturas)

### ✅ Lo que SÍ funciona:
- Los badges muestran números: **8vo Básico (90)**, **B (45)**
- La tabla SÍ renderiza estudiantes
- Los filtros funcionan correctamente

### ❌ El Problema:
- Las columnas N1, N2, N3... N10 muestran **"—"** en lugar de calificaciones numéricas (6.5, 7.0, etc.)
- La columna "Promedio" también muestra **"—"**

## 🎯 Diagnóstico Rápido (30 segundos)

### Ejecuta este script en la consola:

```javascript
(function(){const s=document.createElement('script');s.src='/diagnosticar-calificaciones-vacias.js';document.head.appendChild(s);})();
```

Este script te dirá **EXACTAMENTE** por qué las calificaciones están vacías.

## 🔍 Posibles Causas

### Causa 1: El CSV no tiene columna de calificaciones
- El archivo CSV solo tiene estudiantes, cursos, secciones
- Pero NO tiene la columna "calificacion" o "nota"

### Causa 2: El campo tiene nombre diferente
- El CSV tiene las calificaciones
- Pero la columna se llama diferente (ej: "promedio", "nota_final", "grade")
- El código busca "calificacion" y no lo encuentra

### Causa 3: Los valores están vacíos
- El CSV SÍ tiene la columna "calificacion"
- Pero todas las celdas están vacías

### Causa 4: Formato incorrecto
- Las calificaciones existen
- Pero están en formato texto ("seis punto cinco") en lugar de numérico (6.5)
- O tienen formato extraño ("6,5" con coma en lugar de punto)

## 🛠️ Soluciones por Causa

### Si Causa 1: Falta la columna

**Verifica el CSV:**
```bash
# En la terminal del workspace
head -1 public/test-data/calificaciones_reales_200.csv
```

Debería mostrar algo como:
```
studentId,courseName,sectionName,subjectName,calificacion,semester,year
```

**Si NO tiene "calificacion":**
1. Edita el CSV y agrega la columna
2. O usa un CSV que SÍ tenga calificaciones
3. O crea datos de prueba con calificaciones

### Si Causa 2: Nombre diferente

**El script de diagnóstico te dirá el nombre exacto.**

Si dice que el campo se llama (por ejemplo) "nota" en lugar de "calificacion", necesitas:

1. **Opción A:** Renombrar en el CSV
2. **Opción B:** Modificar el código para usar el campo correcto

### Si Causa 3: Valores vacíos

**Edita el CSV y agrega valores:**

```csv
studentId,courseName,sectionName,subjectName,calificacion,semester,year
12345678-9,8vo Básico,B,Ciencias Naturales,6.5,1,2025
98765432-1,8vo Básico,B,Ciencias Naturales,7.0,1,2025
```

### Si Causa 4: Formato incorrecto

**El script te mostrará ejemplos de valores.**

Si ves algo como:
```
"6,5"  →  Cambiar a: 6.5
"seis" →  Cambiar a: 6.0
" 7.0" →  Quitar espacios: 7.0
```

## 📋 Verificación Manual del CSV

### Paso 1: Abre el CSV

```bash
# En VS Code, abre:
public/test-data/calificaciones_reales_200.csv
```

### Paso 2: Verifica la Primera Línea (Encabezados)

Debe tener algo como:
```
studentId,courseName,sectionName,subjectName,calificacion,semester,year
```

### Paso 3: Verifica las Primeras 5 Líneas de Datos

Deben tener valores numéricos en la columna de calificación:
```
12345678-9,8vo Básico,B,Ciencias Naturales,6.5,1,2025
98765432-1,8vo Básico,B,Ciencias Naturales,7.0,1,2025
11111111-1,8vo Básico,B,Matemática,5.8,1,2025
22222222-2,8vo Básico,B,Matemática,6.2,1,2025
33333333-3,8vo Básico,B,Lenguaje,6.9,1,2025
```

### Paso 4: Si el CSV está Correcto

Entonces el problema está en el **procesamiento del CSV** o en el **código de renderizado**.

## 🔧 Comando Rápido: Ver Datos Cargados

```javascript
// Ver qué datos hay en LocalStorage
const year = 2025;
const key = `smart-student-test-grades-${year}`;
const data = JSON.parse(localStorage.getItem(key) || '[]');

// Ver primeros 5 registros
console.table(data.slice(0, 5));

// Ver campos disponibles
console.log('Campos:', Object.keys(data[0] || {}));

// Ver si hay calificaciones
const conCalif = data.filter(d => d.calificacion || d.nota || d.grade);
console.log(`Registros con calificación: ${conCalif.length}/${data.length}`);
```

## 📊 Ejemplo de CSV Correcto

Aquí está un ejemplo de cómo debería verse el CSV:

```csv
studentId,courseName,sectionName,subjectName,calificacion,semester,year,testId,testType
12345678-9,8vo Básico,B,Ciencias Naturales,6.5,1,2025,test-001,Prueba
98765432-1,8vo Básico,B,Ciencias Naturales,7.0,1,2025,test-001,Prueba
11111111-1,8vo Básico,B,Matemática,5.8,1,2025,test-002,Prueba
22222222-2,8vo Básico,B,Matemática,6.2,1,2025,test-002,Prueba
33333333-3,8vo Básico,B,Lenguaje,6.9,1,2025,test-003,Prueba
44444444-4,8vo Básico,A,Ciencias Naturales,6.0,1,2025,test-001,Prueba
55555555-5,8vo Básico,A,Ciencias Naturales,7.2,1,2025,test-001,Prueba
```

**Puntos clave:**
- Columna **"calificacion"** con valores numéricos
- Usar **punto (.)** como separador decimal, no coma
- Valores entre **1.0 y 7.0** (escala chilena)
- NO espacios extra, NO comillas extra

## 🎯 Acción Inmediata

### 1. Ejecuta el script de diagnóstico:

```javascript
(function(){const s=document.createElement('script');s.src='/diagnosticar-calificaciones-vacias.js';document.head.appendChild(s);})();
```

### 2. Lee el resultado y sigue las recomendaciones

### 3. Si dice "NO HAY CALIFICACIONES":

- Verifica el CSV (public/test-data/calificaciones_reales_200.csv)
- Asegúrate de que tiene la columna "calificacion"
- Asegúrate de que tiene valores numéricos
- Vuelve a cargar desde Admin > Configuración

### 4. Si dice "HAY CALIFICACIONES":

- Entonces el problema está en el código
- Reporta el resultado completo del script
- Incluye capturas de pantalla

## 📝 Checklist de Verificación

- [ ] Ejecuté el script de diagnóstico
- [ ] Verifiqué que el CSV existe y está accesible
- [ ] El CSV tiene la columna "calificacion" (o similar)
- [ ] Los valores son numéricos (6.5, 7.0, etc.)
- [ ] Recarguéel CSV desde Admin > Configuración
- [ ] Las calificaciones AHORA se muestran
- [ ] O reporté el resultado del diagnóstico si sigue fallando

---

## 🆘 Si Nada Funciona

Comparte:
1. **Resultado COMPLETO del script de diagnóstico** (copia toda la consola)
2. **Primeras 10 líneas del CSV** (copia y pega)
3. **Capturas de pantalla** de la página de Calificaciones

---

**Archivos Relacionados:**
- `public/diagnosticar-calificaciones-vacias.js` - Script de diagnóstico
- `GUIA_PASO_A_PASO_CALIFICACIONES.md` - Guía general del fix anterior
- `RESUMEN_FIX_CALIFICACIONES.md` - Resumen del fix de bugs
