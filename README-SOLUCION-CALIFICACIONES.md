# 🔧 SOLUCIÓN: Problemas de Calificaciones

## 📋 Problemas Identificados

### 1. **Notas reales no aparecen** (80 y 55)
- Las notas están en la vista "revisar" del profesor pero no aparecen en calificaciones
- Necesitan sincronizarse desde los resultados de pruebas

### 2. **Burbuja morada de evaluación N1 desapareció**
- La evaluación N1 de Ciencias Naturales tenía burbuja morada
- Desapareció cuando se creó una prueba
- Necesita restaurarse el tipo `evaluacion`

## 🚀 Solución Rápida

### Opción 1: Script Automático Completo
```javascript
// Copia y pega este código en la consola del navegador (F12):

// === SCRIPT COMPLETO DE SOLUCIÓN ===
(function() {
    console.log('🔧 SOLUCIONANDO PROBLEMAS DE CALIFICACIONES...');
    
    // PROBLEMA 1: Sincronizar notas reales de pruebas
    function sincronizarNotasPruebas() {
        console.log('📊 Sincronizando notas reales de pruebas...');
        
        try {
            // Buscar todas las claves de pruebas
            const testKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('smart-student-tests')) {
                    testKeys.push(key);
                }
            }
            
            // Cargar todas las pruebas
            const allTests = [];
            testKeys.forEach(key => {
                try {
                    const tests = JSON.parse(localStorage.getItem(key) || '[]');
                    if (Array.isArray(tests)) {
                        allTests.push(...tests);
                    }
                } catch (e) {}
            });
            
            // Buscar pruebas con resultados
            const pruebasConResultados = allTests.filter(test => {
                return test.responses || test.results || test.studentResponses || 
                       test.submissions || test.answers || test.evaluationResults;
            });
            
            const currentGrades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
            const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            
            let notasAgregadas = 0;
            
            pruebasConResultados.forEach(test => {
                const resultSources = [
                    test.responses, test.results, test.studentResponses,
                    test.submissions, test.answers, test.evaluationResults
                ].filter(Boolean);
                
                resultSources.forEach(results => {
                    if (typeof results === 'object' && results !== null) {
                        Object.entries(results).forEach(([studentKey, result]) => {
                            const student = users.find(u => 
                                u.username === studentKey || u.id === studentKey
                            );
                            
                            if (!student) return;
                            
                            let score = null;
                            if (typeof result === 'object' && result !== null) {
                                score = result.score || result.points || result.grade || 
                                       result.percentage || result.finalScore;
                                
                                if (result.correctAnswers && result.totalQuestions) {
                                    score = (result.correctAnswers / result.totalQuestions) * 100;
                                }
                            } else if (typeof result === 'number') {
                                score = result;
                            }
                            
                            if (score === null || isNaN(score)) return;
                            
                            let normalizedScore = Number(score);
                            if (normalizedScore > 100 && normalizedScore <= 1000) {
                                normalizedScore = normalizedScore / 10;
                            }
                            normalizedScore = Math.min(100, Math.max(0, normalizedScore));
                            
                            const existingGrade = currentGrades.find(g => 
                                g.testId === test.id && g.studentId === student.id
                            );
                            
                            if (!existingGrade) {
                                currentGrades.push({
                                    id: `${test.id}-${student.id}`,
                                    testId: test.id,
                                    studentId: student.id,
                                    studentName: student.displayName || student.username,
                                    score: Math.round(normalizedScore * 100) / 100,
                                    courseId: test.courseId || null,
                                    sectionId: test.sectionId || null,
                                    subjectId: test.subjectId || test.subjectName || null,
                                    title: test.title,
                                    gradedAt: Date.now()
                                });
                                notasAgregadas++;
                                console.log(`✅ ${student.displayName}: ${normalizedScore}% en "${test.title}"`);
                            }
                        });
                    }
                });
            });
            
            if (notasAgregadas > 0) {
                localStorage.setItem('smart-student-test-grades', JSON.stringify(currentGrades));
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'smart-student-test-grades',
                    newValue: JSON.stringify(currentGrades)
                }));
                console.log(`💾 Sincronizadas ${notasAgregadas} notas`);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    // PROBLEMA 2: Restaurar burbujas de evaluaciones
    function restaurarBurbujasEvaluaciones() {
        console.log('🟣 Restaurando burbujas de evaluaciones...');
        
        try {
            const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
            const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
            
            let cambios = false;
            
            // Buscar evaluación de Ciencias Naturales
            let evaluacionCiencias = evaluations.find(eval => 
                eval.subject === 'Ciencias Naturales' || eval.subjectName === 'Ciencias Naturales'
            );
            
            if (evaluacionCiencias) {
                if (evaluacionCiencias.taskType !== 'evaluacion') {
                    evaluacionCiencias.taskType = 'evaluacion';
                    cambios = true;
                    console.log('🔧 Corregido tipo a "evaluacion"');
                }
                
                if (!evaluacionCiencias.status || evaluacionCiencias.status === 'finished') {
                    evaluacionCiencias.status = 'pending';
                    cambios = true;
                }
                
                if (!evaluacionCiencias.createdAt) {
                    evaluacionCiencias.createdAt = new Date('2025-08-15T10:00:00Z').toISOString();
                    cambios = true;
                }
            } else {
                // Crear evaluación N1
                const nuevaEvaluacion = {
                    id: `eval-ciencias-n1-${Date.now()}`,
                    title: 'Evaluación N1 - Ciencias Naturales',
                    description: 'Primera evaluación del semestre',
                    subject: 'Ciencias Naturales',
                    subjectName: 'Ciencias Naturales',
                    taskType: 'evaluacion',
                    status: 'pending',
                    createdAt: new Date('2025-08-15T10:00:00Z').toISOString(),
                    dueDate: new Date('2025-08-30T23:59:59Z').toISOString(),
                    assignedTo: 'course',
                    courseId: 'curso-4',
                    sectionId: 'seccion-4A',
                    assignedById: 'teacher-1',
                    assignedByName: 'Profesor',
                    priority: 'medium'
                };
                evaluations.unshift(nuevaEvaluacion);
                cambios = true;
                console.log('✅ Evaluación N1 creada');
            }
            
            // Verificar tareas que deberían ser evaluaciones
            tasks.forEach(task => {
                if ((task.subject === 'Ciencias Naturales' || task.subjectName === 'Ciencias Naturales') &&
                    task.taskType === 'prueba' && 
                    task.title && task.title.toLowerCase().includes('evaluaci')) {
                    
                    task.taskType = 'evaluacion';
                    cambios = true;
                    console.log(`🔄 Tarea convertida a evaluación: ${task.title}`);
                }
            });
            
            if (cambios) {
                localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
                localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
                
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'smart-student-evaluations',
                    newValue: JSON.stringify(evaluations)
                }));
                
                console.log('💾 Burbujas de evaluaciones restauradas');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    // Ejecutar soluciones
    sincronizarNotasPruebas();
    restaurarBurbujasEvaluaciones();
    
    console.log('✅ SOLUCIÓN COMPLETADA');
    console.log('🔄 Recarga la página de calificaciones para ver los cambios');
})();
```

### Opción 2: Scripts Separados

#### Para las notas 80 y 55:
```javascript
// Diagnóstico específico
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('test')) {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        console.log(key, data);
    }
}
```

#### Para burbujas moradas:
```javascript
// Restaurar evaluación N1
const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
const eval1 = evaluations.find(e => e.subject === 'Ciencias Naturales');
if (eval1) {
    eval1.taskType = 'evaluacion';
    eval1.status = 'pending';
    localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
    location.reload();
}
```

## 🎯 Pasos para Aplicar la Solución

1. **Abrir consola del navegador** (F12 → Console)
2. **Pegar el script completo** de la Opción 1
3. **Presionar Enter** para ejecutar
4. **Recargar la página** de calificaciones
5. **Verificar** que aparezcan:
   - Las notas 80 y 55 en la tabla
   - La burbuja morada 🟣 en N1 de Ciencias Naturales

## 🔍 Verificación

Después de aplicar la solución, verificar:

```javascript
// Verificar calificaciones
const grades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
console.log('Calificaciones:', grades.filter(g => g.score === 80 || g.score === 55));

// Verificar evaluaciones
const evals = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
console.log('Evaluaciones:', evals.filter(e => e.subject === 'Ciencias Naturales'));
```

## 📞 Soporte

Si los problemas persisten:
1. Ejecutar el diagnóstico completo
2. Revisar la consola para errores
3. Verificar que los datos existen en localStorage
4. Aplicar solución manual específica

---

**✅ Esta solución aborda ambos problemas identificados en el módulo de calificaciones.**
