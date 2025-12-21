// 🔧 COMANDOS PARA CONSOLA DEL NAVEGADOR - DEBUG SQL
// Ejecutar en DevTools > Console

// 1. Verificar datos SQL almacenados
(() => {
  console.log('🔍 VERIFICANDO ESTADO DEL SISTEMA SQL...');
  
  const sqlKey = 'smart-student-sql-grades';
  const sqlData = localStorage.getItem(sqlKey);
  
  console.log('📊 Datos en localStorage:');
  console.log('- Clave:', sqlKey);
  console.log('- Existe:', !!sqlData);
  console.log('- Tamaño:', sqlData ? (sqlData.length / 1024).toFixed(2) + ' KB' : '0 KB');
  
  if (sqlData) {
    try {
      const parsed = JSON.parse(sqlData);
      console.log('📈 Estructura de datos:');
      console.log('- Tipo:', typeof parsed);
      console.log('- Es array:', Array.isArray(parsed));
      console.log('- Cantidad registros:', parsed.length || 0);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('📋 Primer registro:');
        console.log(parsed[0]);
        
        // Agrupar por año
        const porAno = {};
        parsed.forEach(grade => {
          const año = grade.año || grade.year || 'Sin año';
          porAno[año] = (porAno[año] || 0) + 1;
        });
        
        console.log('📅 Distribución por año:');
        Object.entries(porAno).forEach(([año, cantidad]) => {
          console.log(`- ${año}: ${cantidad} registros`);
        });
      }
    } catch (error) {
      console.error('❌ Error parseando datos:', error);
    }
  } else {
    console.log('⚠️ No hay datos SQL almacenados');
  }
})();

// 2. Verificar el hook useGradesSQL
(() => {
  console.log('\n🔗 VERIFICANDO HOOK useGradesSQL...');
  
  // Buscar en React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools disponible');
  } else {
    console.log('⚠️ React DevTools no disponible');
  }
  
  // Simular una actualización de eventos
  console.log('📡 Disparando evento sqlGradesUpdated...');
  window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
    detail: { source: 'debug', timestamp: Date.now() }
  }));
})();

// 3. Comando para limpiar datos SQL
window.limpiarDatosSQL = () => {
  console.log('🧹 LIMPIANDO DATOS SQL...');
  localStorage.removeItem('smart-student-sql-grades');
  window.dispatchEvent(new CustomEvent('sqlGradesUpdated'));
  console.log('✅ Datos SQL eliminados');
};

// 4. Comando para verificar el estado del componente
window.verificarEstadoSQL = () => {
  console.log('🔍 VERIFICANDO ESTADO DEL COMPONENTE...');
  
  // Buscar elementos relacionados con SQL
  const elementos = {
    modalSQL: document.querySelector('[data-testid="grades-import-progress"]'),
    tablaCalificaciones: document.querySelector('table'),
    botonConectarSQL: document.querySelector('button[data-sql-connect]'),
    estadoConexion: document.querySelector('[data-sql-status]')
  };
  
  console.log('🎯 Elementos encontrados:');
  Object.entries(elementos).forEach(([nombre, elemento]) => {
    console.log(`- ${nombre}:`, !!elemento);
  });
  
  return elementos;
};

console.log('🚀 Comandos de debug cargados:');
console.log('- limpiarDatosSQL() - Elimina todos los datos SQL');
console.log('- verificarEstadoSQL() - Verifica elementos del DOM');