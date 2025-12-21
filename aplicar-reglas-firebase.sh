#!/bin/bash

# 🔥 Script para aplicar reglas de Firebase automáticamente
# ========================================================

echo ""
echo "🔥 =========================================="
echo "   Aplicando Reglas de Firebase"
echo "   =========================================="
echo ""

# Verificar si Firebase CLI está instalado
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI no está instalado"
    echo ""
    echo "📦 Instalando Firebase CLI..."
    npm install -g firebase-tools
    echo ""
fi

echo "✅ Firebase CLI detectado"
echo ""

# Verificar login
echo "🔐 Verificando autenticación de Firebase..."
firebase projects:list &> /dev/null

if [ $? -ne 0 ]; then
    echo "❌ No estás autenticado en Firebase"
    echo ""
    echo "🔑 Iniciando login de Firebase..."
    echo "   (Se abrirá una ventana del navegador)"
    echo ""
    firebase login
    echo ""
fi

echo "✅ Autenticado correctamente"
echo ""

# Mostrar proyecto actual
echo "📋 Proyecto actual:"
firebase use
echo ""

# Confirmar
echo "⚠️  Estás a punto de desplegar las reglas de Firestore"
echo "   Proyecto: superjf1234-e9cbc"
echo "   Archivo: firestore.rules"
echo ""
read -p "¿Continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]
then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "🚀 Desplegando reglas de Firestore..."
echo ""

firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ =========================================="
    echo "   ¡Reglas aplicadas exitosamente!"
    echo "   =========================================="
    echo ""
    echo "🎯 Próximos pasos:"
    echo "   1. Espera 30 segundos"
    echo "   2. Refresca tu aplicación web (F5)"
    echo "   3. Verifica que no haya errores de permisos"
    echo ""
else
    echo ""
    echo "❌ =========================================="
    echo "   Error al aplicar reglas"
    echo "   =========================================="
    echo ""
    echo "🔧 Solución alternativa:"
    echo "   Ve a Firebase Console manualmente:"
    echo "   https://console.firebase.google.com/project/superjf1234-e9cbc/firestore/rules"
    echo ""
fi
