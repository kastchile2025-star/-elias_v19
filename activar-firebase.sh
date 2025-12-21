#!/bin/bash

# ============================================
# SCRIPT DE ACTIVACIÓN DE FIREBASE
# ============================================
# Este script verifica que Firebase esté configurado correctamente
# y limpia los datos locales de IndexedDB
# ============================================

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   🔥 ACTIVACIÓN DE FIREBASE + LIMPIEZA LOCAL            ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Verificar que existe .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ ERROR: No se encontró el archivo .env.local"
    echo ""
    echo "Solución:"
    echo "1. Crea el archivo .env.local en la raíz del proyecto"
    echo "2. Agrega las variables de Firebase"
    echo "3. Ejecuta este script nuevamente"
    exit 1
fi

echo "✅ Archivo .env.local encontrado"
echo ""

# Verificar variables de Firebase
echo "📋 Verificando variables de Firebase..."
echo ""

if grep -q "NEXT_PUBLIC_USE_FIREBASE=true" .env.local; then
    echo "✅ NEXT_PUBLIC_USE_FIREBASE=true"
else
    echo "❌ NEXT_PUBLIC_USE_FIREBASE no está en true"
    exit 1
fi

if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY=" .env.local; then
    echo "✅ NEXT_PUBLIC_FIREBASE_API_KEY configurada"
else
    echo "❌ NEXT_PUBLIC_FIREBASE_API_KEY no configurada"
    exit 1
fi

if grep -q "NEXT_PUBLIC_FIREBASE_PROJECT_ID=" .env.local; then
    echo "✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID configurada"
else
    echo "❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID no configurada"
    exit 1
fi

echo ""
echo "✅ Todas las variables necesarias están configuradas"
echo ""

# Mostrar instrucciones
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PRÓXIMOS PASOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. El servidor ya está corriendo con las nuevas variables"
echo ""
echo "2. LIMPIAR DATOS LOCALES (IndexedDB):"
echo "   - Abre: http://localhost:9002"
echo "   - Abre la consola del navegador (F12)"
echo "   - Ejecuta este comando:"
echo ""
echo "   // Limpiar IndexedDB"
echo "   indexedDB.deleteDatabase('smart_student_local_db');"
echo "   indexedDB.deleteDatabase('smart_student_db');"
echo "   "
echo "   // Limpiar LocalStorage"
echo "   localStorage.setItem('smart-student-database-config', JSON.stringify({provider: 'firebase'}));"
echo ""
echo "3. RECARGAR LA PÁGINA:"
echo "   - Presiona Ctrl+F5 (recarga forzada)"
echo "   - O cierra y abre el navegador de nuevo"
echo ""
echo "4. VERIFICAR QUE FIREBASE ESTÉ ACTIVO:"
echo "   - Ve a: http://localhost:9002/dashboard/admin/user-management"
echo "   - Click en pestaña 'Carga Masiva'"
echo "   - El badge DEBE decir: '🔥 Firebase + LS'"
echo "   - Si dice '✅ Local SQL (IndexedDB)', repite los pasos anteriores"
echo ""
echo "5. APLICAR REGLAS DE FIREBASE:"
echo "   - Ve a: https://console.firebase.google.com/project/superjf1234-e9cbc/firestore/rules"
echo "   - Copia y pega las reglas del archivo firestore.rules"
echo "   - Haz click en 'Publicar'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Configuración de Firebase completada"
echo ""
echo "🎯 Siguiente: Ejecuta los comandos en la consola del navegador"
echo "   para limpiar los datos locales y activar Firebase"
echo ""
