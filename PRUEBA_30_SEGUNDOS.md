# ⚡ PRUEBA RÁPIDA - 30 SEGUNDOS

## 🎯 Comando de Una Línea

Abre: http://localhost:9002/dashboard/calificaciones

En la consola del navegador (F12), pega esto:

```javascript
(function(){console.log('🎬 Iniciando prueba...');const s=document.createElement('script');s.src='/simulate-bulk-import.js';document.head.appendChild(s);})();
```

## ✅ Resultado Esperado

**Esquina inferior derecha de la pantalla:**

```
┌──────────────────────┐
│ 🔄 Sincronizando     │
│    con BBDD          │
│ ████████████  100%   │
└──────────────────────┘
```

- Aparece en 1 segundo
- Progresa de 0% a 100% en 5 segundos
- Desaparece automáticamente
- Logs en consola

## ⚠️ Si NO Aparece

Hay un problema. Ejecuta:

```javascript
console.log('sqlFetchDone:', window.location.href.includes('calificaciones'));
```

Y reporta el resultado.

---

## 🔥 Prueba Real (Con Archivo CSV)

1. **Configurar listeners:**
   ```javascript
   (function(){const s=document.createElement('script');s.src='/test-bulk-import-flow.js';document.head.appendChild(s);})();
   ```

2. **Ir a Admin > Configuración**

3. **Cargar:** `public/test-data/calificaciones_reales_200.csv`

4. **Volver a Calificaciones**

5. **Verificar:** 200 filas en la tabla

---

## 📚 Más Información

- **Guía completa:** `PRUEBA_CARGA_MASIVA_CALIFICACIONES.md`
- **Solución técnica:** `SOLUCION_CALIFICACIONES_NO_APARECEN.md`
- **Resumen ejecutivo:** `RESUMEN_EJECUTIVO.md`
- **Comandos adicionales:** `COMANDOS_RAPIDOS_PRUEBA.md`

---

**Tiempo total:** < 30 segundos  
**Estado del servidor:** ✅ Corriendo en puerto 9002
