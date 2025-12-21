# Debug para sincronización de calificaciones

## Para verificar en la consola del navegador:

1. Abrir Consola del Navegador (F12)
2. Ejecutar estos comandos:

```javascript
// 1. Verificar listeners de eventos
console.log('Listeners de grades-updated:', window.dataSyncEvents?.getListenerCount('grades-updated') || 0);

// 2. Verificar calificaciones en LocalStorage
const year = 2025;
const key = `smart-student-test-grades-${year}`;
const grades = JSON.parse(localStorage.getItem(key) || '[]');
console.log(`Calificaciones en LocalStorage (${year}):`, grades.length);

// 3. Emitir evento manual para probar
if (window.dataSyncEvents) {
  window.dataSyncEvents.emit('grades-updated', { year: 2025, count: 100 });
  console.log('✅ Evento emitido manualmente');
}

// 4. Verificar año seleccionado
console.log('Año seleccionado:', localStorage.getItem('admin-selected-year'));
```

## Solución temporal:

Si las calificaciones NO aparecen automáticamente:
1. Ve a la pestaña **Carga Masiva**
2. Haz clic en el botón **🔄 Actualizar** (junto a los contadores)
3. Luego ve a **Calificaciones** y deberían aparecer

## El problema puede ser:

1. ✅ Sistema de eventos instalado
2. ✅ Emisor configurado en bulk-uploads
3. ✅ Receptor configurado en calificaciones  
4. ❌ **Calificaciones NO se guardaron en Firebase/SQL** (verificar en consola)
5. ❌ **O el evento se emite ANTES de que se monte el componente de calificaciones**

