# NUEVO FLUJO DE CREACIÓN DE PROFESORES

## 🎯 Funcionalidad Implementada

### Flujo Mejorado: Curso Primero → Asignaturas Después

**Antes:**
- Se mostraban todas las asignaturas del sistema
- No había relación entre curso y materias disponibles

**Ahora:**
1. **Paso 1**: Seleccionar curso principal (lista desplegable)
2. **Paso 2**: Se muestran solo las asignaturas disponibles para ese curso
3. **Paso 3**: Opción de agregar cursos adicionales

## 🛠️ Implementación Técnica

### Archivo Modificado: `/src/app/dashboard/gestion-usuarios/page.tsx`

#### Nuevas Funciones
```typescript
// Obtener asignaturas específicas de un curso
const getSubjectsForSpecificCourse = (course: string) => {
  return getSubjectsForCourse(course);
};

// Manejar selección de curso principal
const handleCourseSelection = (course: string) => {
  setFormData(prev => ({
    ...prev,
    selectedCourse: course,
    activeCourses: [course], // Auto-selecciona el curso
    teachingSubjects: [] // Resetea materias cuando cambia curso
  }));
};
```

#### Nueva Estructura de FormData
```typescript
interface UserFormData {
  // ... campos existentes
  selectedCourse?: string; // ← NUEVO: Curso seleccionado
}
```

### UI Mejorada

#### 1. **Selección de Curso Principal**
```tsx
{formData.role === 'teacher' && (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="teacherCourse" className="text-right">
      Curso Principal *
    </Label>
    <Select 
      value={formData.selectedCourse || ''} 
      onValueChange={(value) => handleCourseSelection(value)}
    >
      <SelectTrigger className="col-span-3">
        <SelectValue placeholder="Selecciona primero el curso principal" />
      </SelectTrigger>
      <SelectContent>
        {availableCourses.map(course => (
          <SelectItem key={course} value={course}>
            {course}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
```

#### 2. **Asignaturas Dinámicas**
```tsx
{formData.role === 'teacher' && formData.selectedCourse && (
  <div className="grid grid-cols-4 items-start gap-4">
    <Label className="text-right pt-2">Asignaturas *</Label>
    <div className="col-span-3 space-y-2">
      <p className="text-xs text-muted-foreground mb-2 p-2 bg-blue-50 rounded">
        📚 Asignaturas disponibles para <strong>{formData.selectedCourse}</strong>
      </p>
      {getSubjectsForSpecificCourse(formData.selectedCourse).map((subject) => (
        // Checkboxes dinámicos por curso
      ))}
    </div>
  </div>
)}
```

#### 3. **Cursos Adicionales (Opcional)**
```tsx
<div className="mt-4 pt-2 border-t">
  <p className="text-xs text-muted-foreground mb-2">
    ¿Enseña en cursos adicionales?
  </p>
  <div className="space-y-2">
    {availableCourses
      .filter(course => course !== formData.selectedCourse)
      .map((course) => (
        // Checkboxes para cursos adicionales
      ))}
  </div>
</div>
```

## 📚 Asignaturas por Curso

### Educación Básica (1° a 8°)
- **Matemáticas**
- **Lenguaje y Comunicación**
- **Ciencias Naturales**
- **Historia, Geografía y Ciencias Sociales**

### Educación Media (1° a 2° Medio)
- **Matemáticas**
- **Lenguaje y Comunicación**
- **Biología**
- **Física**
- **Química**
- **Historia, Geografía y Ciencias Sociales**

### 3° y 4° Medio
- **Matemáticas**
- **Lenguaje y Comunicación**
- **Ciencias para la Ciudadanía**
- **Educación Ciudadana** (solo 4°)
- **Filosofía** (solo 4°)

## 🎬 Flujo de Usuario

### Para Administradores:

1. **Login como Admin**
   ```javascript
   loginComoAdmin()
   ```

2. **Ir a Gestión de Usuarios**
   - URL: `/dashboard/gestion-usuarios`
   - Hacer clic en "Crear Nuevo Usuario"

3. **Completar Datos Básicos**
   - Usuario, nombre, email, contraseña
   - Seleccionar rol: "Profesor"

4. **🆕 Seleccionar Curso Principal**
   - Lista desplegable con todos los cursos
   - Ejemplo: "6to Básico"

5. **🆕 Ver Asignaturas Disponibles**
   - Solo aparecen las materias de ese curso
   - Ejemplo para 6to Básico:
     - ✓ Matemáticas
     - ✓ Ciencias Naturales
     - ✓ Lenguaje y Comunicación
     - ✓ Historia, Geografía y Ciencias Sociales

6. **Seleccionar Asignaturas** (mínimo 1)
   - Checkboxes para cada materia disponible

7. **Agregar Cursos Adicionales** (opcional)
   - Si el profesor enseña en múltiples cursos
   - Ejemplo: agregar "7mo Básico"

8. **Crear Profesor**
   - Validación automática
   - Profesor queda configurado con sus asignaturas

## 🧪 Testing

### Script de Prueba: `/public/test-flujo-profesor.js`

```javascript
// Verificar flujo completo
probarNuevoFlujoProfesor()

// Crear profesor de prueba
simularCreacionProfesor()

// Login como admin
loginComoAdmin()

// Limpiar datos de prueba
limpiarDatosDemo()
```

### Casos de Prueba

#### ✅ Caso 1: Profesor Básico
- **Curso**: 4to Básico
- **Asignaturas**: Matemáticas, Ciencias Naturales
- **Resultado**: Solo ve esas 2 materias para 4to Básico

#### ✅ Caso 2: Profesor Medio
- **Curso**: 1ro Medio
- **Asignaturas**: Física, Química, Matemáticas
- **Resultado**: Ve las 6 materias disponibles para 1ro Medio

#### ✅ Caso 3: Profesor Múltiples Cursos
- **Curso Principal**: 6to Básico
- **Cursos Adicionales**: 7mo Básico, 8vo Básico
- **Asignaturas**: Matemáticas (todas)
- **Resultado**: Enseña matemáticas en 6°, 7° y 8°

## 🔍 Validaciones

### Frontend
- ✅ Curso principal obligatorio para profesores
- ✅ Al menos una asignatura seleccionada
- ✅ Reset de asignaturas al cambiar curso
- ✅ No duplicar curso principal en adicionales

### Backend/LocalStorage
- ✅ Estructura correcta de teachingAssignments
- ✅ Asignaturas vinculadas a cursos específicos
- ✅ Compatibilidad con sistema de chat existente

## 📈 Beneficios

### Para Administradores
- 🎯 **Precisión**: Solo asignaturas relevantes por curso
- ⚡ **Rapidez**: Menos opciones irrelevantes
- 🔍 **Claridad**: Flujo paso a paso intuitivo

### Para el Sistema
- 📚 **Consistencia**: Asignaturas basadas en biblioteca real
- 🔗 **Integración**: Compatible con sistema de chat
- 📊 **Escalabilidad**: Fácil agregar nuevos cursos/materias

## 🎯 Próximas Mejoras

1. **Validación Cruzada**: Verificar que existen libros para las asignaturas seleccionadas
2. **Plantillas**: Profesores con configuraciones predefinidas por curso
3. **Importación**: Crear múltiples profesores desde CSV
4. **Reportes**: Dashboard de asignaturas por curso

---

**Estado**: ✅ Implementado y funcionando  
**Fecha**: Junio 2025  
**Versión**: Flujo de Creación de Profesores v2.0
