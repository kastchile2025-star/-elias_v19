# ✅ CORRECCIÓN: Error de Parsing CSV con Comillas en Asignaturas

## 🎯 Problema Identificado

Cuando subes un CSV con campos que contienen comillas (ej: `"Historia, Geografía y Ciencias Sociales"`), el parser anterior no manejaba correctamente las filas, resultando en:

```
⚠️ Fila 12 tiene datos incompletos: {
  nombre: ['Patricia Diaz,10000857-2,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,94', [...]],
  rut: ['', ''],
  curso: ['', ''],
  ...
}
```

**Root Cause**: El parser dividía las líneas de forma incorrecta cuando encontraba comillas, metiendo toda la línea en el primer campo.

## ✅ Solución Implementada

### Cambio 1: Parser CSV Mejorado
**Archivo**: `src/app/api/firebase/bulk-upload-grades/route.ts`

El nuevo parser ahora:
- ✅ Maneja correctamente quoted fields como `"Historia, Geografía y Ciencias Sociales"`
- ✅ Respeta comillas escapadas (`""` se convierte en `"`)
- ✅ Normaliza los headers a lowercase para búsquedas consistentes
- ✅ Valida que cada campo tenga el número correcto de valores

### Cambio 2: Mejora de getColumnValue
- ✅ Ahora busca en headers normalizados (lowercase)
- ✅ Tiene fallback para búsqueda directa sin normalización

### Cambio 3: Logging Mejorado
- ✅ Muestra primeras 3 filas completas en formato JSON
- ✅ Facilita debugging si algo sigue fallando

## 🧪 Validación

Se probó con tu CSV exacto:

```csv
Nombre,RUT,Curso,Sección,Asignatura,Profesor,Fecha,Tipo,Nota
...
Patricia Diaz,10000857-2,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,94
Patricia Rojas,10000872-6,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,91
Patricia Salinas,10000881-5,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,98
```

**Resultado**: ✅ Todas las filas de Patricia se parsearon correctamente:
- ✅ Nombre: `Patricia Diaz`
- ✅ RUT: `10000857-2`
- ✅ Asignatura: `Historia, Geografía y Ciencias Sociales` (con comillas intactas)
- ✅ Nota: `94`

## 📋 Instrucciones para Probar

1. **Recarga la página** (F5) para cargar el nuevo código

2. **Ve a la pestaña "Configuración" > "Carga Masiva: Calificaciones"**

3. **Descarga tu CSV** (o usa el que ya tienes)

4. **Sube el archivo nuevamente**

5. **Observa la consola** (F12 > Console):
   ```
   📊 Filas a procesar: 152
   🔬 HEADERS DETECTADOS: ["nombre","rut","curso","sección","asignatura","profesor","fecha","tipo","nota"]
   📋 Primeras 3 filas parseadas:
     Fila 1:
     {
       "nombre": "Ana Benitez",
       "rut": "10000048-2",
       "asignatura": "Lenguaje y Comunicación",
       ...
     }
   ```

6. **Verifica que NO hay errores** como antes

## 📊 Resultados Esperados

Con el CSV de 152 filas:

**Antes (❌ ERROR)**:
```
⏳ Progreso: 9% (14/152 procesadas, 10 guardadas, 4 errores)
⚠️ Fila 12 tiene datos incompletos: { nombre: ['Patricia Diaz,...'] }
```

**Ahora (✅ CORRECTO)**:
```
⏳ Progreso: 100% (152/152 procesadas, 152 guardadas, 0 errores)
✅ Batch final guardado. Total procesado: 152 calificaciones
```

## 🔧 Cambios Técnicos Detallados

### 1. Parser CSV Robusto (línea 120-180)

```typescript
const parseCSVManually = (csvText: string): any[] => {
  // Normalizar saltos de línea (\r\n → \n)
  let normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const parseLine = (line: string): string[] => {
    // Loop por carácter manteniendo estado de quotes
    for (let i = 0; i < line.length; i++) {
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote: "" → "
          current += '"';
          i++; 
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Fin de campo (coma fuera de quotes)
        result.push(current.trim());
        current = '';
      }
    }
  };
};
```

### 2. Headers Normalizados

Headers ahora se guardan como lowercase para búsquedas consistentes:

```typescript
headers.forEach((header, i) => {
  const normalizedHeader = header.toLowerCase().trim();
  row[normalizedHeader] = fields[i] || '';
});
```

## ⚠️ Posibles Problemas Futuros

Si aún ves errores después del fix:

1. **CSVs con delimitador diferente** (`;` en vez de `,`)
   - El parser actual aún asume coma como delimitador
   - Solución: Detectar delimitador automáticamente (próxima iteración)

2. **Saltos de línea dentro de quoted fields**
   ```csv
   "Nombre con
   salto de línea",RUT,...
   ```
   - El parser actual no soporta esto
   - Solución: Usar librería `csv-parse` con opción `relax_column_count`

3. **Encodings diferentes** (Latin1, UTF-16, etc.)
   - El parser asume UTF-8
   - Solución: Detectar encoding automáticamente en el cliente

## 📝 Archivo de Prueba

Se incluye `test-csv-parser.js` para validar el parser:

```bash
node test-csv-parser.js
```

Resultado esperado:
```
✅ ÉXITO: Patricia Diaz se parseó correctamente con asignatura que contiene comillas
```

---

**Status**: ✅ Corregido  
**Fecha**: Octubre 17, 2025  
**Archivos modificados**: `src/app/api/firebase/bulk-upload-grades/route.ts`
