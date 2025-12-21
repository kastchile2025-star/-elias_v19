#!/bin/bash
# Comandos Rápidos: Firebase Blaze Setup
# Proyecto: superjf1234-e9cbc
# Copiar y pegar en terminal

echo "🔥 Configuración Firebase Blaze - superjf1234-e9cbc"
echo ""

# 1. Crear carpeta para claves
echo "📁 Creando carpeta keys..."
mkdir -p keys
echo "✅ Carpeta creada"
echo ""

# 2. Instrucción manual
echo "📥 PASO MANUAL:"
echo "1. Ir a: https://console.firebase.google.com/"
echo "2. Seleccionar proyecto: Superjf1234"
echo "3. Configuración → Cuentas de servicio"
echo "4. 'Generar nueva clave privada'"
echo "5. Guardar como: keys/superjf1234-service-account.json"
echo ""
read -p "Presiona ENTER cuando hayas descargado el archivo..."
echo ""

# 3. Verificar archivo
if [ -f "keys/superjf1234-service-account.json" ]; then
  echo "✅ Archivo de cuenta de servicio encontrado"
else
  echo "❌ No se encontró keys/superjf1234-service-account.json"
  echo "Por favor descárgalo y vuelve a ejecutar este script"
  exit 1
fi
echo ""

# 4. Cargar variables de entorno
echo "🔐 Cargando variables de entorno..."
export $(grep -v '^#' .env.firebase | xargs)
echo "✅ Variables cargadas"
echo ""

# 5. Verificar conexión Firebase Admin
echo "🔍 Verificando conexión con Firebase Admin..."
npm run firebase:check
echo ""

# 6. Instrucciones para reglas Firestore
echo "🛡️  CONFIGURAR REGLAS DE FIRESTORE:"
echo "1. Ir a: https://console.firebase.google.com/"
echo "2. Firestore Database → Reglas"
echo "3. Copiar las reglas de: GUIA_CONFIGURACION_FIREBASE_BLAZE.md (paso 3)"
echo "4. Publicar"
echo ""
read -p "Presiona ENTER cuando hayas publicado las reglas..."
echo ""

# 7. Reiniciar servidor
echo "🔄 Reinicia el servidor de desarrollo:"
echo "  1. Ctrl+C en la terminal donde corre 'npm run dev'"
echo "  2. Ejecutar: npm run dev"
echo "  3. Abrir: http://localhost:9002"
echo ""

# 8. Siguiente paso
echo "✅ Configuración completa"
echo ""
echo "📊 PRÓXIMOS PASOS:"
echo "1. Reiniciar servidor dev"
echo "2. Limpiar caché del navegador (F12 → Application → Clear site data)"
echo "3. Preparar CSV de prueba (100-500 registros)"
echo "4. Ejecutar: npm run import:grades -- --file=./datos/test.csv --year=2025 --dry"
echo "5. Si todo OK, ejecutar sin --dry para importación real"
echo ""
echo "📖 Ver guía completa: GUIA_CONFIGURACION_FIREBASE_BLAZE.md"
