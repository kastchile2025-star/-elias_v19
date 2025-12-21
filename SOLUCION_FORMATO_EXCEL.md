# 🔧 Solución: Error de Formato Excel en Carga Masiva

## ❌ **Problema Identificado**

El error `"Fila inválida (faltan role/name/rut): {"Etiquetas de fila":"1ro Básico"}"` indica que estás subiendo un archivo Excel con **formato de tabla dinámica/pivot table** en lugar del formato tabular normal que espera el sistema.

### 🔍 **¿Qué está pasando?**

Tu Excel actual tiene esta estructura (INCORRECTA):
```
Etiquetas de fila | Columna1 | Columna2
1ro Básico        |          |
CNT               |          |
HIST              |          |
Total general     |          |
```

Pero el sistema espera esta estructura (CORRECTA):
```
role    | name        | rut           | email              | username     | course     | section | subjects
teacher | Ana López   | 12.345.678-9  | ana@example.com    | ana.lopez2   | 1ro Básico | A       | MAT
teacher | Ana López   | 12.345.678-9  | ana@example.com    | ana.lopez2   | 1ro Básico | A       | LEN
```

## ✅ **Solución Implementada**

He agregado validaciones al sistema que ahora:

1. **Detecta tablas dinámicas** automáticamente
2. **Muestra mensaje de error claro** explicando el problema
3. **Valida que existan las columnas requeridas** (role, name, rut)
4. **Detiene el procesamiento** para evitar errores confusos

## 🚀 **Cómo Corregir tu Excel**

### Opción 1: Usar la plantilla del sistema
1. Ve a **Configuración** → **Carga masiva por Excel**
2. Haz clic en **"Descargar Plantilla Excel"**
3. Copia tus datos al formato de la plantilla

### Opción 2: Usar el archivo CSV de ejemplo
He creado un archivo `ejemplo-profesores-correcto.csv` en el repositorio con el formato correcto basado en tus datos.

### Opción 3: Convertir tu Excel manualmente

**De esto (tabla dinámica):**
```
Etiquetas de fila: 1ro Básico
                   MAT
                   LEN
```

**A esto (formato tabular):**
```
role    | name      | rut          | email           | username  | course     | section | subjects
teacher | Ana López | 12.345.678-9 | ana@example.com | ana.lopez2| 1ro Básico | A       | MAT
teacher | Ana López | 12.345.678-9 | ana@example.com | ana.lopez2| 1ro Básico | A       | LEN
```

## 📋 **Formato Requerido**

### Columnas obligatorias:
- **role**: `teacher` (para profesores)
- **name**: Nombre completo del profesor
- **rut**: RUT con formato 12.345.678-9

### Columnas opcionales pero recomendadas:
- **email**: Email del profesor
- **username**: Nombre de usuario (se auto-genera si está vacío)
- **password**: Contraseña (usa 1234 por defecto)
- **course**: Curso asignado (ej: "1ro Básico")
- **section**: Sección (ej: "A", "B")
- **subjects**: Materia (ej: "MAT", "LEN", "HIST", "CNT")

## 🎯 **Reglas importantes**

1. **Una fila por asignación**: Si un profesor enseña MAT y LEN en 1ro A, necesitas 2 filas
2. **Sin tablas dinámicas**: Cada fila debe tener los datos del profesor completos
3. **Headers en español o inglés**: Acepta `role/rol`, `name/nombre`, etc.
4. **Materias con abreviaturas**: MAT, LEN, HIST, CNT, etc.

## 🧪 **Probar la Corrección**

1. **Recarga la página** para aplicar las nuevas validaciones
2. Intenta subir tu Excel actual → verás el mensaje de error mejorado
3. Usa el archivo `ejemplo-profesores-correcto.csv` como base
4. Convierte a Excel si prefieres ese formato

## 💡 **Mensajes de Error Mejorados**

Ahora verás errores más claros:
- ✅ **"Formato de Excel incorrecto"** → Excel es tabla dinámica
- ✅ **"Headers faltantes en Excel"** → Faltan columnas role/name/rut
- ✅ **"Excel vacío"** → No hay datos en el archivo

¡La carga masiva ahora debería funcionar perfectamente con el formato correcto! 🎉