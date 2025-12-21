// 🔐 Notification Guard - defensa temprana contra targetUsernames undefined
// Se ejecuta lo antes posible para evitar TypeError (.join de undefined)
(function(){
  const KEY = 'smart-student-task-notifications';
  function sanitize(reason){
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(raw)) return;
      let changed = false;
      for (const n of raw) {
        if (!n) continue;
        if (!Array.isArray(n.targetUsernames)) {
          // Fallback mínimo: array vacío (evita .join error). Reconstrucción completa la hará el servicio luego.
          n.targetUsernames = [];
          changed = true;
        }
      }
      if (changed) {
        try { localStorage.setItem(KEY, JSON.stringify(raw)); } catch(e) { /* ignore quota here */ }
      }
    } catch(e) { /* ignore parse errors */ }
  }
  // Saneado inmediato
  sanitize('immediate');
  // Reintentos hasta que TaskNotificationManager exista (por si otro script introduce datos corruptos luego)
  let attempts = 0; const max = 40; const interval = setInterval(()=>{
    attempts++;
    sanitize('retry');
    if (window.TaskNotificationManager || attempts >= max) clearInterval(interval);
  }, 250);
})();
