# 🧪 Prueba Rápida: Carga Masiva de Excel

## ✅ Pre-requisitos
- El servidor debe estar corriendo (`npm run dev`)
- Navega a: https://[tu-dominio]/dashboard/admin
- Ve a la pestaña **"Configuración"**

## 📝 Pasos para Probar

### 1. Verificar que no hay errores en consola
```bash
# Abre la consola del navegador (F12)
# Deberías ver solo logs normales, sin errores de recursión
```

### 2. Descargar plantilla de usuarios
1. En la sección **"Carga masiva por Excel"**
2. Click en **"Descargar plantilla"**
3. Se descargará `users-template.xlsx`

### 3. Preparar datos de prueba

Opción A - Usar la plantilla descargada y agregar más filas:
```
role     | name            | rut          | email                | username      | password | course      | section | subjects
student  | Test Student 1  | 11111111-1   | test1@example.com    | test.student1 | 1234     | 1ro Básico  | A       |
student  | Test Student 2  | 22222222-2   | test2@example.com    | test.student2 | 1234     | 1ro Básico  | A       |
student  | Test Student 3  | 33333333-3   | test3@example.com    | test.student3 | 1234     | 2do Básico  | B       |
teacher  | Test Teacher 1  | 44444444-4   | teacher1@example.com | test.teacher1 | 1234     |             |         | MAT, LEN
teacher  | Test Teacher 2  | 55555555-5   | teacher2@example.com | test.teacher2 | 1234     |             |         | HIST, CIEN
admin    | Test Admin      | 66666666-6   | admin@example.com    | test.admin    | 1234     |             |         |
```

Opción B - Crear archivo CSV manualmente:
```bash
# Guardar como: test-users.csv (con encoding UTF-8)
role,name,rut,email,username,password,course,section,subjects
student,Test Student 1,11111111-1,test1@example.com,test.student1,1234,1ro Básico,A,
student,Test Student 2,22222222-2,test2@example.com,test.student2,1234,1ro Básico,A,
teacher,Test Teacher,44444444-4,teacher@example.com,test.teacher,1234,,,MAT
```

### 4. Subir el archivo
1. Click en el input de archivo o botón **"Subir Excel"**
2. Selecciona tu archivo `.xlsx` o `.csv`
3. Espera el procesamiento

### 5. Verificar resultados esperados

#### En la consola del navegador deberías ver:
```
🎬 [CARGA EXCEL] Handler ejecutado
📁 [CARGA EXCEL] Archivo seleccionado: [nombre-archivo]
🚀 [CARGA EXCEL] Iniciando proceso de carga...
📦 [CARGA EXCEL] Importando biblioteca XLSX...
📊 [CARGA EXCEL] Datos leídos: [N] filas
📊 [CARGA EXCEL] Headers detectados: ["role","name","rut"...]
⚙️ [CARGA EXCEL] Iniciando procesamiento por batches...
✨ [CARGA EXCEL] Usuario creado: test.student1 (student)
✨ [CARGA EXCEL] Usuario creado: test.teacher (teacher)
💾 [CARGA EXCEL] Guardando usuarios en localStorage...
✅ [CARGA EXCEL] Usuarios guardados exitosamente
🎉 [CARGA EXCEL] Proceso completado exitosamente!
📊 RESUMEN FINAL DE IMPORTACIÓN:
   - Administradores: [N]
   - Profesores: [N]
   - Estudiantes: [N]
```

#### En la interfaz deberías ver:
- ✅ Toast de notificación: "Importación exitosa"
- ✅ Modal con resumen de importación mostrando:
  - Número de administradores creados
  - Número de profesores creados
  - Número de estudiantes creados
  - Número de errores (debería ser 0)

### 6. Verificar que los usuarios se crearon
1. Navega a las secciones:
   - **"Usuarios"** → Ver lista completa
   - **"Estudiantes"** → Ver solo estudiantes
   - **"Profesores"** → Ver solo profesores
2. Busca los usuarios que subiste (por nombre o username)

## ❌ Problemas Comunes y Soluciones

### Problema 1: "El archivo está vacío"
**Causa**: El Excel no tiene datos o el formato es incorrecto
**Solución**: 
- Asegúrate de que la primera fila tenga los headers
- Asegúrate de que haya al menos una fila de datos

### Problema 2: "Faltan campos requeridos"
**Causa**: Falta la columna `role` o `name`
**Solución**:
- Verifica que tu Excel tenga al menos las columnas: `role`, `name`
- Los nombres deben estar en minúsculas en la primera fila

### Problema 3: Usuario no se asigna a curso/sección
**Causa**: El curso o sección no existe en el sistema
**Solución**:
1. Primero crea los cursos y secciones en:
   - **Configuración** → **Cursos/Secciones**
2. Luego sube los estudiantes con esos nombres exactos

### Problema 4: Error de recursión (Maximum call stack)
**Causa**: La corrección no se aplicó o el navegador tiene cache
**Solución**:
```bash
# Refrescar con cache limpio
Ctrl + Shift + R (Chrome/Edge)
# O
Cmd + Shift + R (Mac)
```

## 🔍 Verificación en localStorage

Puedes verificar manualmente que los usuarios se guardaron:

```javascript
// En consola del navegador:
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
console.log('Total usuarios:', users.length);
console.log('Estudiantes:', users.filter(u => u.role === 'student').length);
console.log('Profesores:', users.filter(u => u.role === 'teacher').length);
console.log('Administradores:', users.filter(u => u.role === 'admin').length);
```

## 📊 Ejemplo de Salida Esperada

```
Total usuarios: 103
Estudiantes: 95
Profesores: 6
Administradores: 2
```

## 🎯 Criterios de Éxito

✅ **CORRECTO** si:
- No hay errores en consola de recursión infinita
- El archivo se procesa sin congelar el navegador
- Aparece el modal de resumen
- Los usuarios aparecen en las listas correspondientes
- El conteo de estadísticas se actualiza

❌ **INCORRECTO** si:
- La página se congela
- Aparece "Maximum call stack size exceeded"
- No aparece el modal de resumen
- Los usuarios no se guardan

## 📞 Soporte

Si encuentras problemas:
1. Copia los logs de la consola
2. Toma screenshot del error
3. Describe los pasos que seguiste
4. Reporta el issue

---

**Última actualización**: 2025-11-02
**Versión corregida**: v17 con fix de recursión infinita
