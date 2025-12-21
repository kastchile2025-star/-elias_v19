# 📖 INSTRUCCIONES DE TESTING: Fix CSV con Campos Entre Comillas

## 🎯 Objetivo

Verificar que el endpoint `POST /api/firebase/bulk-upload-grades` ahora procesa correctamente archivos CSV que contienen campos entre comillas (como `"Historia, Geografía y Ciencias Sociales"`).

## ✅ Precondiciones

- ✅ El servidor está corriendo en puerto 9002
- ✅ La base de datos Firebase está configurada
- ✅ El archivo `src/app/api/firebase/bulk-upload-grades/route.ts` está actualizado
- ✅ Tests locales pasan sin errores

## 📋 Pasos de Testing

### Paso 1: Preparar el Archivo CSV

Crea un archivo `test-calificaciones.csv` con este contenido (tu CSV exacto):

```csv
Nombre,RUT,Curso,Sección,Asignatura,Profesor,Fecha,Tipo,Nota
Ana Benitez,10000048-2,1ro Básico,B,Lenguaje y Comunicación,Ana López,01-03-2025,prueba,32
Ana Campos,10000049-0,1ro Básico,B,Lenguaje y Comunicación,Ana López,01-03-2025,prueba,87
Patricia Diaz,10000857-2,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,94
Patricia Rojas,10000872-6,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,91
Patricia Salinas,10000881-5,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,98
Patricia Valenzuela,10000888-2,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,74
Patricia Sepulveda,10000897-1,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,70
Patricia Benitez,10000898-K,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,66
```

### Paso 2: Acceder a la Interfaz

1. Abre el navegador: `http://localhost:9002`
2. Inicia sesión como administrador
3. Ve a: **Admin** > **Configuración** > **Carga Masiva: Calificaciones**

### Paso 3: Abrir la Consola

1. Presiona **F12** en el navegador
2. Ve a la pestaña **Console**
3. Limpia los logs anteriores

### Paso 4: Cargar el Archivo

1. En la interfaz, haz clic en **"Seleccionar archivo"**
2. Selecciona tu CSV de prueba
3. Haz clic en **"Subir a SQL"** o **"Subir"** (según tu interfaz)

### Paso 5: Verificar Logs

#### Logs Esperados (✅ CORRECTO):

```
📊 Filas a procesar: 8
🔬 HEADERS DETECTADOS: ["nombre","rut","curso","sección","asignatura","profesor","fecha","tipo","nota"]
📋 Primeras 3 filas parseadas:
   Fila 1:
   {
     "nombre": "Ana Benitez",
     "rut": "10000048-2",
     "curso": "1ro Básico",
     "sección": "B",
     "asignatura": "Lenguaje y Comunicación",
     "profesor": "Ana López",
     "fecha": "01-03-2025",
     "tipo": "prueba",
     "nota": "32"
   }
   ...
```

#### Logs Problemáticos (❌ ERROR - SI APARECEN):

```
⚠️ Fila 4 tiene datos incompletos: {
  nombre: ['Patricia Diaz,10000857-2,2do Medio,B,"Historia, Geografía y Ciencias Sociales",...'],
  rut: ['', ''],
  ...
}
```

**Si ves esto**: Significa que el fix NO se aplicó correctamente.

### Paso 6: Validar Resultado

#### Criterio 1: Sin Errores de Parsing

```
⏳ Progreso: 100% (8/8 procesadas, 8 guardadas, 0 errores)
```

Si ves esto → ✅ **ÉXITO**

#### Criterio 2: Patricia Procesada Correctamente

En la consola, busca logs de filas de Patricia:

```
✅ Procesando: Patricia Diaz | RUT: 10000857-2 | Asignatura: Historia, Geografía y Ciencias Sociales | Nota: 94
```

#### Criterio 3: Actividades Generadas

```
🗂 Generando 6 actividades únicas derivadas de las calificaciones
✅ Actividades completadas: 6
```

#### Criterio 4: Importación Completada

```
🎉 ===== IMPORTACIÓN COMPLETADA =====
   ✅ Calificaciones procesadas: 8
   🗂️  Actividades generadas: 4
   ❌ Errores encontrados: 0
```

## 🔍 Checklist de Validación

Marca ✅ según lo verifiques:

- [ ] CSV parseado sin errores
- [ ] Headers detectados correctamente: 9 columnas
- [ ] Primeras 3 filas parseadas completas
- [ ] Filas de Patricia sin errores
- [ ] Asignatura "Historia, Geografía y Ciencias Sociales" intacta
- [ ] 0 errores en total
- [ ] 8 calificaciones procesadas
- [ ] Actividades generadas correctamente
- [ ] Importación completada sin warnings

## 🧪 Testing Programático

Si quieres automatizar el testing:

```bash
# Test 1: Parser básico
node test-csv-parser.js

# Resultado esperado:
# ✅ ÉXITO: Patricia Diaz se parseó correctamente con asignatura que contiene comillas

# Test 2: Simulación completa
node test-csv-parser-full.js

# Resultado esperado:
# ✅ ÉXITO: El fix funciona correctamente
```

## 📊 Comparativa de Resultados

### Antes del Fix (❌ ERROR)

```
📊 Filas a procesar: 152
⚠️ Fila 12 tiene datos incompletos: {
  nombre: ['Patricia Diaz,10000857-2,...'],
  rut: ['', ''],
  ...
}
⏳ Progreso: 9% (14/152 procesadas, 10 guardadas, 4 errores)
...
⏳ Progreso: 100% (152/152 procesadas, 122 guardadas, 30 errores)
```

### Después del Fix (✅ OK)

```
📊 Filas a procesar: 152
🔬 HEADERS DETECTADOS: ["nombre","rut","curso",...,"asignatura",...]
📋 Primeras 3 filas parseadas: [OK]
⏳ Progreso: 100% (152/152 procesadas, 152 guardadas, 0 errores)
✅ Importación completada
```

## 🐛 Troubleshooting

### Si ves: "Fila X tiene datos incompletos"

**Acción**: 
- [ ] Verifica que recargaste la página (F5)
- [ ] Verifica que el archivo cambió (`/src/app/api/firebase/bulk-upload-grades/route.ts`)
- [ ] Reinicia el servidor: `npm run dev`

### Si ves: "Asignatura no encontrada"

**Probable causa**: La asignatura no fue creada
**Acción**: Verifica que Firebase tiene los cursos creados

### Si ves: "Fecha inválida"

**Causa**: Formato de fecha incorrecto
**Solución**: Usa formato DD-MM-YYYY o YYYY-MM-DD

## 📝 Reporte de Resultados

Por favor reporta:

```
✅ Fix validado

Detalles:
- CSV parseado: 8 filas
- Errores: 0
- Patricia Diaz: ✅ Procesada correctamente
- Asignatura con comillas: ✅ Intacta
- Servidor: Funcionando en puerto 9002

Ambiente:
- Sistema: Linux Ubuntu 24.04
- Node: v18.x
- Next.js: v15.x
```

## 📞 Soporte

Si encuentra problemas:

1. **Verifica los logs**: `tail -f /tmp/npm.log`
2. **Recarga la página**: F5
3. **Limpia cache**: Ctrl+Shift+Del
4. **Reinicia servidor**: `npm run dev`
5. **Revisa consola**: F12 > Console

---

**Testing Status**: 🟢 READY  
**Última actualización**: Octubre 17, 2025
