// Script para verificar el sistema de sincronización de datos
console.log('=== VERIFICANDO SISTEMA DE SINCRONIZACIÓN ===');

// 1. Verificar si existe el archivo de eventos
const fs = require('fs');
const path = require('path');

const dataSyncPath = path.join(__dirname, 'src/lib/data-sync-events.ts');
console.log('✓ Archivo de eventos existe:', fs.existsSync(dataSyncPath));

// 2. Verificar imports en bulk-uploads
const bulkUploadsPath = path.join(__dirname, 'src/components/admin/user-management/bulk-uploads.tsx');
const bulkContent = fs.readFileSync(bulkUploadsPath, 'utf-8');
console.log('✓ Import de notifyGradesUpdated:', bulkContent.includes('notifyGradesUpdated'));
console.log('✓ Llamadas a notifyGradesUpdated:', (bulkContent.match(/notifyGradesUpdated/g) || []).length);

// 3. Verificar listener en calificaciones page
const calificacionesPath = path.join(__dirname, 'src/app/dashboard/calificaciones/page.tsx');
const califContent = fs.readFileSync(calificacionesPath, 'utf-8');
console.log('✓ Import de dataSyncEvents:', califContent.includes('dataSyncEvents'));
console.log('✓ Listener de grades-updated:', califContent.includes("dataSyncEvents.on('grades-updated'"));

// 4. Verificar hook useGradesSQL
const hookPath = path.join(__dirname, 'src/hooks/useGradesSQL.ts');
const hookContent = fs.readFileSync(hookPath, 'utf-8');
console.log('✓ Import de dataSyncEvents en hook:', hookContent.includes('dataSyncEvents'));
console.log('✓ Listener en hook:', hookContent.includes("dataSyncEvents.on('grades-updated'"));

console.log('\n=== ESTADO DEL SISTEMA ===');
console.log('Sistema de eventos:', fs.existsSync(dataSyncPath) ? '✅ INSTALADO' : '❌ FALTA');
console.log('Emisor en bulk-uploads:', bulkContent.includes('notifyGradesUpdated') ? '✅ CONFIGURADO' : '❌ FALTA');
console.log('Receptor en calificaciones:', califContent.includes('grades-updated') ? '✅ CONFIGURADO' : '❌ FALTA');
console.log('Receptor en hook:', hookContent.includes('grades-updated') ? '✅ CONFIGURADO' : '❌ FALTA');
