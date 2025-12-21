/**
 * 🔍 VERIFICADOR DE CONFIGURACIÓN FIREBASE + LOCALSTORAGE
 * 
 * Este script verifica que toda la configuración de Firebase esté correcta
 * y que LocalStorage esté funcionando como cache.
 * 
 * Ejecutar en la consola del navegador:
 * 1. Abre http://localhost:9002
 * 2. Abre la consola (F12)
 * 3. Copia y pega este script
 * 4. Revisa los resultados
 */

(function verificarConfiguracion() {
  console.log('🔍 ========================================');
  console.log('🔍 VERIFICADOR DE CONFIGURACIÓN FIREBASE');
  console.log('🔍 ========================================\n');

  const resultados = {
    firebase: { ok: false, detalles: [] },
    localStorage: { ok: false, detalles: [] },
    contadores: { ok: false, detalles: [] },
    datos: { ok: false, detalles: [] }
  };

  // ============================================
  // 1. VERIFICAR CONFIGURACIÓN FIREBASE
  // ============================================
  console.log('📋 1. Verificando configuración Firebase...\n');

  try {
    // Verificar variables de entorno (si están expuestas)
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'No configurado',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'No configurado',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'No configurado',
    };

    const configOk = 
      firebaseConfig.apiKey !== 'No configurado' &&
      firebaseConfig.projectId !== 'No configurado';

    if (configOk) {
      resultados.firebase.ok = true;
      resultados.firebase.detalles.push('✅ API Key configurada');
      resultados.firebase.detalles.push(`✅ Project ID: ${firebaseConfig.projectId}`);
      resultados.firebase.detalles.push(`✅ Auth Domain: ${firebaseConfig.authDomain}`);
    } else {
      resultados.firebase.detalles.push('❌ Configuración de Firebase incompleta');
      resultados.firebase.detalles.push('⚠️  Verificar variables NEXT_PUBLIC_FIREBASE_* en .env.local');
    }

    // Verificar si Firebase está inicializado en el navegador
    if (typeof window !== 'undefined' && window.firebase) {
      resultados.firebase.detalles.push('✅ Firebase SDK cargado en el navegador');
    } else {
      resultados.firebase.detalles.push('⚠️  Firebase SDK no detectado (puede ser normal)');
    }

  } catch (error) {
    resultados.firebase.detalles.push(`❌ Error: ${error.message}`);
  }

  resultados.firebase.detalles.forEach(d => console.log(d));

  // ============================================
  // 2. VERIFICAR LOCALSTORAGE
  // ============================================
  console.log('\n📋 2. Verificando LocalStorage como cache...\n');

  try {
    // Verificar que LocalStorage esté disponible
    if (typeof localStorage === 'undefined') {
      resultados.localStorage.detalles.push('❌ LocalStorage no está disponible');
    } else {
      resultados.localStorage.ok = true;
      resultados.localStorage.detalles.push('✅ LocalStorage disponible');

      // Verificar espacio usado
      const lsSize = JSON.stringify(localStorage).length;
      const lsSizeMB = (lsSize / (1024 * 1024)).toFixed(2);
      resultados.localStorage.detalles.push(`📊 Espacio usado: ${lsSizeMB} MB`);

      // Verificar claves importantes
      const clavesImportantes = [
        'smart-student-database-config',
        'smart-student-users',
        'smart-student-tasks',
        'smart-student-evaluations',
        'smart-student-courses',
        'smart-student-sections'
      ];

      let clavesEncontradas = 0;
      clavesImportantes.forEach(clave => {
        if (localStorage.getItem(clave)) {
          clavesEncontradas++;
        }
      });

      resultados.localStorage.detalles.push(`✅ ${clavesEncontradas}/${clavesImportantes.length} claves importantes encontradas`);

      if (clavesEncontradas < clavesImportantes.length) {
        resultados.localStorage.detalles.push('⚠️  Algunas claves no encontradas (puede ser normal en instalación nueva)');
      }
    }
  } catch (error) {
    resultados.localStorage.detalles.push(`❌ Error: ${error.message}`);
  }

  resultados.localStorage.detalles.forEach(d => console.log(d));

  // ============================================
  // 3. VERIFICAR CONTADORES
  // ============================================
  console.log('\n📋 3. Verificando contadores de calificaciones...\n');

  try {
    const totalCounter = localStorage.getItem('grade-counter-total');
    const year2025Counter = localStorage.getItem('grade-counter-year-2025');

    if (totalCounter !== null) {
      resultados.contadores.ok = true;
      const total = parseInt(totalCounter, 10) || 0;
      resultados.contadores.detalles.push(`✅ Contador total: ${total.toLocaleString()} registros`);
    } else {
      resultados.contadores.detalles.push('⚠️  Contador total no encontrado (sin calificaciones cargadas)');
    }

    if (year2025Counter !== null) {
      const year2025 = parseInt(year2025Counter, 10) || 0;
      resultados.contadores.detalles.push(`✅ Contador año 2025: ${year2025.toLocaleString()} registros`);
    } else {
      resultados.contadores.detalles.push('⚠️  Contador año 2025 no encontrado');
    }

    // Verificar contadores de otros años
    const yearCounters = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('grade-counter-year-')) {
        const year = key.replace('grade-counter-year-', '');
        const count = parseInt(localStorage.getItem(key) || '0', 10);
        yearCounters.push({ year, count });
      }
    }

    if (yearCounters.length > 0) {
      resultados.contadores.detalles.push(`📅 Años con datos: ${yearCounters.map(y => `${y.year} (${y.count})`).join(', ')}`);
    }

  } catch (error) {
    resultados.contadores.detalles.push(`❌ Error: ${error.message}`);
  }

  resultados.contadores.detalles.forEach(d => console.log(d));

  // ============================================
  // 4. VERIFICAR DATOS CARGADOS
  // ============================================
  console.log('\n📋 4. Verificando datos del sistema...\n');

  try {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

    if (users.length > 0 || tasks.length > 0 || evaluations.length > 0) {
      resultados.datos.ok = true;
    }

    resultados.datos.detalles.push(`👥 Usuarios: ${users.length}`);
    resultados.datos.detalles.push(`   • Estudiantes: ${users.filter(u => u.role === 'student').length}`);
    resultados.datos.detalles.push(`   • Profesores: ${users.filter(u => u.role === 'teacher').length}`);
    resultados.datos.detalles.push(`   • Administradores: ${users.filter(u => u.role === 'admin').length}`);
    resultados.datos.detalles.push(`📚 Tareas: ${tasks.length}`);
    resultados.datos.detalles.push(`📝 Evaluaciones: ${evaluations.length}`);
    resultados.datos.detalles.push(`🎓 Cursos: ${courses.length}`);
    resultados.datos.detalles.push(`🏫 Secciones: ${sections.length}`);

    if (users.length === 0 && tasks.length === 0 && evaluations.length === 0) {
      resultados.datos.detalles.push('\n⚠️  No hay datos cargados. Sistema nuevo o recién instalado.');
    }

  } catch (error) {
    resultados.datos.detalles.push(`❌ Error: ${error.message}`);
  }

  resultados.datos.detalles.forEach(d => console.log(d));

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('\n🎯 ========================================');
  console.log('🎯 RESUMEN DE VERIFICACIÓN');
  console.log('🎯 ========================================\n');

  const categorias = [
    { nombre: 'Firebase', resultado: resultados.firebase },
    { nombre: 'LocalStorage', resultado: resultados.localStorage },
    { nombre: 'Contadores', resultado: resultados.contadores },
    { nombre: 'Datos', resultado: resultados.datos }
  ];

  categorias.forEach(cat => {
    const icono = cat.resultado.ok ? '✅' : '⚠️';
    console.log(`${icono} ${cat.nombre}: ${cat.resultado.ok ? 'OK' : 'Revisar'}`);
  });

  const todoCorrecto = categorias.every(cat => cat.resultado.ok);

  console.log('\n' + '='.repeat(50));
  if (todoCorrecto) {
    console.log('✅ CONFIGURACIÓN COMPLETA Y FUNCIONANDO CORRECTAMENTE');
    console.log('🚀 Sistema listo para usar');
  } else {
    console.log('⚠️  CONFIGURACIÓN INCOMPLETA');
    console.log('📖 Revisa los detalles arriba para ver qué falta');
    console.log('📚 Consulta: CONFIGURACION_FIREBASE_COMPLETADA.md');
  }
  console.log('='.repeat(50) + '\n');

  // ============================================
  // COMANDOS ÚTILES
  // ============================================
  console.log('💡 COMANDOS ÚTILES:\n');
  console.log('// Ver configuración de base de datos actual');
  console.log('localStorage.getItem("smart-student-database-config");\n');
  
  console.log('// Ver contador total de calificaciones');
  console.log('localStorage.getItem("grade-counter-total");\n');
  
  console.log('// Ver usuarios cargados');
  console.log('JSON.parse(localStorage.getItem("smart-student-users") || "[]").length;\n');
  
  console.log('// Forzar recarga de contadores');
  console.log('window.location.reload();\n');

  console.log('🔍 Verificación completada.\n');

  return {
    ok: todoCorrecto,
    resultados
  };
})();
