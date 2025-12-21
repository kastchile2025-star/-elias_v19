# 🎯 COMANDO RÁPIDO DE PRUEBA

## Simulación Instantánea (30 segundos)

Copia y pega este comando en la consola del navegador (pestaña Calificaciones):

```javascript
(function(){console.log('🎬 Iniciando simulación de carga masiva...');const s=document.createElement('script');s.src='/simulate-bulk-import.js';document.head.appendChild(s);})();
```

**¿Qué hace?**
- Carga el script de simulación
- Emite eventos de progreso (0% → 100%)
- Muestra indicador "Sincronizando con BBDD"
- Completa en 5 segundos

**Resultado esperado:**
- Indicador flotante aparece en esquina inferior derecha
- Barra de progreso se llena gradualmente
- Porcentaje actualizado en tiempo real
- Indicador desaparece al completar

---

## Script de Diagnóstico (Ver todos los eventos)

```javascript
(function(){const s=document.createElement('script');s.src='/test-bulk-import-flow.js';document.head.appendChild(s);})();
```

**¿Qué hace?**
- Configura listeners para todos los eventos
- Muestra estado del sistema
- Espera a que hagas una carga real
- Logs detallados en consola

---

## Verificación Rápida del Sistema

```javascript
(function(){const s=document.createElement('script');s.src='/quick-check.js';document.head.appendChild(s);})();
```

**¿Qué hace?**
- Verifica LocalStorage
- Cuenta calificaciones actuales
- Verifica listeners
- Muestra estado de conexión SQL

---

## Limpiar Listeners de Prueba

```javascript
if(window.__cleanupTestListeners){window.__cleanupTestListeners();console.log('✅ Listeners limpiados');}else{console.log('⚠️ No hay listeners para limpiar');}
```

---

## 🔥 Prueba Completa con Archivo Real

### Paso 1: Preparar Calificaciones
```javascript
(function(){const s=document.createElement('script');s.src='/test-bulk-import-flow.js';document.head.appendChild(s);console.log('✅ Listeners configurados. Ahora ve a Admin > Configuración');})();
```

### Paso 2: Ir a Admin
1. Clic en "👤 Administrador"
2. Ir a pestaña "Configuración"
3. Scroll hasta "🗄️ Calificaciones en SQL/Firebase"

### Paso 3: Cargar Archivo
1. Clic en "📤 Cargar Calificaciones"
2. Seleccionar: `public/test-data/calificaciones_reales_200.csv`
3. Esperar a que termine

### Paso 4: Volver a Calificaciones
1. Clic en "Calificaciones" en el menú
2. Observar consola para ver eventos
3. Verificar que aparecen 200 filas

---

## 🐛 Troubleshooting

### Problema: Script no se carga
```javascript
fetch('/simulate-bulk-import.js').then(r=>r.ok?console.log('✅ Script disponible'):console.log('❌ Script no encontrado')).catch(e=>console.log('❌ Error:',e));
```

### Problema: No aparece indicador
```javascript
// Forzar evento manualmente
window.dispatchEvent(new CustomEvent('sqlImportProgress',{detail:{year:2025,current:100,total:200,percent:50,timestamp:Date.now()}}));
console.log('✅ Evento forzado. ¿Apareció el indicador?');
```

### Problema: Datos no aparecen
```javascript
// Forzar recarga
window.dispatchEvent(new CustomEvent('sqlGradesUpdated',{detail:{year:2025,count:200,timestamp:Date.now()}}));
console.log('✅ Evento de recarga forzado. Verifica la consola.');
```

---

## 📊 Verificar Estado Actual

```javascript
(function(){
  const year=localStorage.getItem('admin-selected-year')||2025;
  const key=`smart-student-test-grades-${year}`;
  const grades=JSON.parse(localStorage.getItem(key)||'[]');
  console.log(`📊 Calificaciones en LS (año ${year}): ${grades.length}`);
  const table=document.querySelector('table tbody');
  const rows=table?table.querySelectorAll('tr').length:0;
  console.log(`📊 Filas visibles en tabla: ${rows}`);
  console.log(grades.length===rows?'✅ Sincronizado':'⚠️ Desincronizado');
})();
```

---

## 🎯 Todo en Uno (Prueba Completa)

```javascript
(async function(){
  // 1. Verificar estado
  console.log('🔍 Verificando estado...');
  const qc=document.createElement('script');qc.src='/quick-check.js';document.head.appendChild(qc);
  
  await new Promise(r=>setTimeout(r,2000));
  
  // 2. Configurar listeners
  console.log('\n🎧 Configurando listeners...');
  const tf=document.createElement('script');tf.src='/test-bulk-import-flow.js';document.head.appendChild(tf);
  
  await new Promise(r=>setTimeout(r,2000));
  
  // 3. Simular carga
  console.log('\n🎬 Iniciando simulación...');
  const sim=document.createElement('script');sim.src='/simulate-bulk-import.js';document.head.appendChild(sim);
  
  console.log('\n✅ Secuencia completa iniciada. Observa los logs.');
})();
```

---

**Última actualización:** 2025-10-17  
**Tiempo de ejecución:** < 30 segundos
