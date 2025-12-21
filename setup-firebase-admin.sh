#!/bin/bash
# Script helper para configurar Firebase Admin SDK
# Uso: ./setup-firebase-admin.sh /ruta/al/service-account.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local"

if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar la ruta al archivo JSON del service account"
  echo ""
  echo "Uso:"
  echo "  ./setup-firebase-admin.sh /ruta/al/service-account.json"
  echo ""
  echo "Obtén el archivo desde:"
  echo "  Firebase Console → Project Settings → Service accounts → Generate new private key"
  exit 1
fi

JSON_FILE="$1"

if [ ! -f "$JSON_FILE" ]; then
  echo "❌ Error: No se encuentra el archivo: $JSON_FILE"
  exit 1
fi

echo "📋 Leyendo service account JSON..."
PROJECT_ID=$(jq -r '.project_id' "$JSON_FILE")

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
  echo "❌ Error: No se pudo extraer project_id del JSON"
  exit 1
fi

echo "✅ Project ID detectado: $PROJECT_ID"

# Escapar JSON para .env (reemplazar \n con \\n y remover saltos de línea reales)
JSON_ESCAPED=$(jq -c . "$JSON_FILE" | sed 's/"/\\"/g')

echo ""
echo "📝 Agregando/actualizando variables en $ENV_FILE..."

# Crear .env.local si no existe
touch "$ENV_FILE"

# Función para agregar o actualizar variable
update_env_var() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    # Actualizar existente (compatible con sed en Linux y macOS)
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE" && rm -f "${ENV_FILE}.bak"
    echo "  ✓ Actualizado: $key"
  else
    # Agregar nuevo
    echo "${key}=${value}" >> "$ENV_FILE"
    echo "  ✓ Agregado: $key"
  fi
}

update_env_var "FIREBASE_PROJECT_ID" "$PROJECT_ID"
update_env_var "FIREBASE_SERVICE_ACCOUNT_JSON" "'$JSON_ESCAPED'"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📌 Próximos pasos:"
echo "  1. Reinicia el servidor de desarrollo:"
echo "     pkill -f 'next dev' && npm run dev"
echo ""
echo "  2. Verifica la configuración:"
echo "     curl http://localhost:9002/api/firebase/admin-diagnostics | jq '.'"
echo ""
echo "  3. Debes ver: initialized: true, error: null"
echo ""
echo "  4. Prueba la carga masiva desde Admin → Configuración → Calificaciones"
echo ""
echo "⚠️  IMPORTANTE: NO commitees .env.local al repositorio"
echo "    Ya está en .gitignore, pero verifica antes de hacer git push"
