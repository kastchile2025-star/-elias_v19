// 🔍 DIAGNÓSTICO COMPLETO: Eventos y LocalStorage
// Ejecutar en la consola del navegador ANTES de cargar el CSV

console.clear();
console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DIAGNÓSTICO COMPLETO: Eventos y LocalStorage');
console.log('═══════════════════════════════════════════════════════\n');

// 1. Estado inicial de LocalStorage
const checkInitialState = () => {
  console.log('📦 ESTADO INICIAL DE LOCALSTORAGE:');
  console.log('─────────────────────────────────────────────────────\n');
  
  const keys = [
    'test_grades',
    'smart-student-students',
    'smart-student-courses',
    'smart-student-sections',
    'smart-student-subjects'
  ];
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : 'N/A';
        console.log(`   ${key}: ${count} items`);
      } else {
        console.log(`   ${key}: (vacío)`);
      }
    } catch (err) {
      console.log(`   ${key}: (error al parsear)`);
    }
  });
  
  console.log('');
};

// 2. Interceptar TODOS los eventos relevantes
const eventNames = [
  'dataImported',
  'dataUpdated',
  'sqlGradesUpdated',
  'sqlActivitiesUpdated',
  'storage'
];

let eventLog = [];

const installEventListeners = () => {
  console.log('📡 INSTALANDO LISTENERS PARA EVENTOS:');
  console.log('─────────────────────────────────────────────────────\n');
  
  eventNames.forEach(eventName => {
    const listener = (e) => {
      const timestamp = new Date().toLocaleTimeString();
      const detail = (e as CustomEvent)?.detail || (e as StorageEvent)?.key;
      
      const logEntry = {
        time: timestamp,
        event: eventName,
        detail: detail
      };
      
      eventLog.push(logEntry);
      
      console.log(`\n🔔 EVENTO #${eventLog.length}: ${eventName}`);
      console.log(`   Hora: ${timestamp}`);
      
      if (detail) {
        console.log(`   Detail:`, detail);
        
        // Verificar flags importantes
        if (typeof detail === 'object') {
          if ('skipFirebaseReload' in detail) {
            const flag = detail.skipFirebaseReload;
            if (flag === true) {
              console.log(`   🔑 skipFirebaseReload: ✅ TRUE (usará LocalStorage)`);
            } else {
              console.log(`   ⚠️  skipFirebaseReload: ❌ FALSE o undefined (intentará Firebase)`);
            }
          } else {
            console.log(`   ⚠️  skipFirebaseReload: No presente en evento`);
          }
          
          if ('type' in detail) {
            console.log(`   📦 Tipo de datos: ${detail.type}`);
          }
          
          if ('count' in detail) {
            console.log(`   📊 Cantidad: ${detail.count} registros`);
          }
        }
      }
      
      // Verificar estado de LocalStorage inmediatamente después del evento
      setTimeout(() => {
        console.log(`\n   📦 Estado LocalStorage después del evento:`);
        const grades = JSON.parse(localStorage.getItem('test_grades') || '[]');
        const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
        console.log(`      test_grades: ${grades.length} items`);
        console.log(`      smart-student-students: ${students.length} items`);
        
        if (grades.length === 0 && eventLog.length > 1) {
          console.log(`      ❌❌❌ ALERTA: test_grades se vació! ❌❌❌`);
        }
        if (students.length === 0 && eventLog.length > 1) {
          console.log(`      ❌❌❌ ALERTA: smart-student-students se vació! ❌❌❌`);
        }
      }, 100);
    };
    
    window.addEventListener(eventName, listener);
    console.log(`   ✅ Listener instalado: ${eventName}`);
  });
  
  console.log('\n   💡 Los eventos se mostrarán cuando ocurran...\n');
};

// 3. Monitor de cambios en LocalStorage
let lastGradesCount = 0;
let lastStudentsCount = 0;
let checkCount = 0;

const startMonitor = () => {
  console.log('👀 INICIANDO MONITOR DE LOCALSTORAGE:');
  console.log('─────────────────────────────────────────────────────\n');
  
  const gradesData = JSON.parse(localStorage.getItem('test_grades') || '[]');
  const studentsData = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
  
  lastGradesCount = gradesData.length;
  lastStudentsCount = studentsData.length;
  
  console.log(`   Conteo inicial:`);
  console.log(`      test_grades: ${lastGradesCount}`);
  console.log(`      smart-student-students: ${lastStudentsCount}`);
  console.log(`\n   Monitoreando cada 500ms...\n`);
  
  const monitorInterval = setInterval(() => {
    checkCount++;
    
    const currentGrades = JSON.parse(localStorage.getItem('test_grades') || '[]');
    const currentStudents = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    
    const gradesCount = currentGrades.length;
    const studentsCount = currentStudents.length;
    
    // Solo reportar si hay cambios
    if (gradesCount !== lastGradesCount || studentsCount !== lastStudentsCount) {
      const timestamp = new Date().toLocaleTimeString();
      
      console.log(`\n⚡ CAMBIO DETECTADO (#${checkCount}) - ${timestamp}`);
      console.log(`─────────────────────────────────────────────────────`);
      
      if (gradesCount !== lastGradesCount) {
        const diff = gradesCount - lastGradesCount;
        const change = diff > 0 ? `+${diff}` : diff;
        console.log(`   test_grades: ${lastGradesCount} → ${gradesCount} (${change})`);
        
        if (gradesCount === 0 && lastGradesCount > 0) {
          console.log(`   ❌❌❌ CALIFICACIONES SE VACIARON! ❌❌❌`);
          console.log(`   Último evento: ${eventLog[eventLog.length - 1]?.event || 'ninguno'}`);
        } else if (gradesCount > 0 && lastGradesCount === 0) {
          console.log(`   ✅✅✅ CALIFICACIONES APARECIERON! ✅✅✅`);
        }
        
        lastGradesCount = gradesCount;
      }
      
      if (studentsCount !== lastStudentsCount) {
        const diff = studentsCount - lastStudentsCount;
        const change = diff > 0 ? `+${diff}` : diff;
        console.log(`   smart-student-students: ${lastStudentsCount} → ${studentsCount} (${change})`);
        
        if (studentsCount === 0 && lastStudentsCount > 0) {
          console.log(`   ❌❌❌ ESTUDIANTES SE VACIARON! ❌❌❌`);
          console.log(`   Último evento: ${eventLog[eventLog.length - 1]?.event || 'ninguno'}`);
        }
        
        lastStudentsCount = studentsCount;
      }
      
      console.log('');
    }
  }, 500);
  
  // Auto-detener después de 3 minutos
  setTimeout(() => {
    clearInterval(monitorInterval);
    console.log('\n⏹️  Monitor detenido automáticamente (3 minutos transcurridos)\n');
  }, 180000);
  
  return monitorInterval;
};

// 4. Resumen final
const showSummary = () => {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE EVENTOS CAPTURADOS:');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (eventLog.length === 0) {
    console.log('   ⚠️  No se capturaron eventos aún\n');
    return;
  }
  
  console.log(`   Total de eventos: ${eventLog.length}\n`);
  
  // Agrupar por tipo de evento
  const eventCounts = {};
  eventLog.forEach(entry => {
    eventCounts[entry.event] = (eventCounts[entry.event] || 0) + 1;
  });
  
  console.log('   Por tipo:');
  Object.entries(eventCounts).forEach(([event, count]) => {
    console.log(`      ${event}: ${count} veces`);
  });
  
  console.log('\n   Secuencia cronológica:');
  eventLog.forEach((entry, i) => {
    const hasSkipFlag = entry.detail?.skipFirebaseReload === true;
    const flagIcon = hasSkipFlag ? '🔑' : '  ';
    console.log(`      ${i + 1}. ${flagIcon} ${entry.time} - ${entry.event}`);
  });
  
  // Verificar si hubo algún evento sin flag
  const eventsWithoutFlag = eventLog.filter(entry => 
    ['dataImported', 'dataUpdated', 'sqlGradesUpdated'].includes(entry.event) &&
    entry.detail?.skipFirebaseReload !== true
  );
  
  if (eventsWithoutFlag.length > 0) {
    console.log(`\n   ⚠️  ADVERTENCIA: ${eventsWithoutFlag.length} eventos SIN flag skipFirebaseReload`);
    console.log('   Estos eventos intentarán leer de Firebase inmediatamente:');
    eventsWithoutFlag.forEach(entry => {
      console.log(`      - ${entry.event} @ ${entry.time}`);
    });
  } else {
    console.log('\n   ✅ Todos los eventos relevantes tienen flag skipFirebaseReload');
  }
  
  // Estado final
  console.log('\n   Estado final LocalStorage:');
  const finalGrades = JSON.parse(localStorage.getItem('test_grades') || '[]');
  const finalStudents = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
  console.log(`      test_grades: ${finalGrades.length} items`);
  console.log(`      smart-student-students: ${finalStudents.length} items`);
  
  console.log('\n═══════════════════════════════════════════════════════\n');
};

// Auto-ejecutar diagnóstico
console.log('🚀 Iniciando diagnóstico automático...\n');

checkInitialState();
installEventListeners();
const monitorId = startMonitor();

// Comandos disponibles
window.__diagnostico__ = {
  summary: showSummary,
  events: () => eventLog,
  stopMonitor: () => clearInterval(monitorId),
  restart: () => {
    eventLog = [];
    checkInitialState();
    return startMonitor();
  }
};

console.log('💡 COMANDOS DISPONIBLES:');
console.log('   __diagnostico__.summary()       - Ver resumen de eventos');
console.log('   __diagnostico__.events()        - Ver log completo de eventos');
console.log('   __diagnostico__.stopMonitor()   - Detener monitor');
console.log('   __diagnostico__.restart()       - Reiniciar diagnóstico');
console.log('\n═══════════════════════════════════════════════════════\n');

console.log('✅ Diagnóstico listo. Ahora carga el archivo CSV y observa los eventos.\n');
