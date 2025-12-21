#!/bin/bash

# Script de verificación de configuración Firebase para carga masiva de calificaciones

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🔥 VERIFICACIÓN DE CONFIGURACIÓN FIREBASE                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar variable
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ] || [ "$var_value" == "TU_"* ]; then
        echo -e "${RED}❌${NC} $var_name: ${RED}NO CONFIGURADA${NC}"
        return 1
    else
        # Mostrar solo los primeros 20 caracteres para seguridad
        local preview="${var_value:0:20}"
        if [ ${#var_value} -gt 20 ]; then
            preview="${preview}..."
        fi
        echo -e "${GREEN}✅${NC} $var_name: ${GREEN}OK${NC} ($preview)"
        return 0
    fi
}

# Cargar variables de entorno desde .env.local si existe
if [ -f ".env.local" ]; then
    echo -e "${BLUE}📄 Cargando .env.local...${NC}"
    export $(grep -v '^#' .env.local | xargs)
    echo ""
else
    echo -e "${RED}❌ No se encontró archivo .env.local${NC}"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  VARIABLES PÚBLICAS (Cliente)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

client_ok=0
total_client=6

check_var "NEXT_PUBLIC_USE_FIREBASE" && ((client_ok++))
check_var "NEXT_PUBLIC_FIREBASE_API_KEY" && ((client_ok++))
check_var "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" && ((client_ok++))
check_var "NEXT_PUBLIC_FIREBASE_PROJECT_ID" && ((client_ok++))
check_var "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" && ((client_ok++))
check_var "NEXT_PUBLIC_FIREBASE_APP_ID" && ((client_ok++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  VARIABLES DE SERVIDOR (Admin SDK)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Buscar archivo de credenciales Admin SDK
admin_file=$(find . -maxdepth 1 -name "*firebase-adminsdk*.json" -o -name "*service-account*.json" 2>/dev/null | head -1)

if [ -n "$admin_file" ]; then
    echo -e "${GREEN}✅${NC} Archivo de credenciales Admin SDK encontrado: ${GREEN}$admin_file${NC}"
    admin_ok=1
elif [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo -e "${GREEN}✅${NC} GOOGLE_APPLICATION_CREDENTIALS: ${GREEN}$GOOGLE_APPLICATION_CREDENTIALS${NC}"
        admin_ok=1
    else
        echo -e "${RED}❌${NC} GOOGLE_APPLICATION_CREDENTIALS apunta a archivo inexistente"
        admin_ok=0
    fi
else
    echo -e "${RED}❌${NC} No se encontró archivo de credenciales Admin SDK"
    echo -e "${YELLOW}💡 Descarga el archivo desde:${NC}"
    echo -e "   ${BLUE}https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk${NC}"
    admin_ok=0
fi

check_var "FIREBASE_PROJECT_ID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $client_ok -eq $total_client ] && [ $admin_ok -eq 1 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ CONFIGURACIÓN COMPLETA                               ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🎉 Firebase está correctamente configurado${NC}"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Reinicia el servidor de desarrollo si está corriendo"
    echo "   2. Ve a: ${BLUE}Admin → Configuración${NC}"
    echo "   3. Sección: ${BLUE}Carga Masiva: Calificaciones${NC}"
    echo "   4. Sube tu archivo CSV con las calificaciones"
    echo ""
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ CONFIGURACIÓN INCOMPLETA                             ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Faltan configurar algunas variables${NC}"
    echo ""
    echo "📋 Para completar la configuración:"
    echo ""
    echo "1️⃣  Variables de Cliente (Web App):"
    echo "   • Ve a: ${BLUE}https://console.firebase.google.com/project/superjf1234-e9cbc/settings/general${NC}"
    echo "   • Busca la sección: ${BLUE}Your apps${NC}"
    echo "   • Si no tienes una app web, haz clic en ${BLUE}</>${NC} (Add app → Web)"
    echo "   • Copia las credenciales a ${BLUE}.env.local${NC}"
    echo ""
    echo "2️⃣  Credenciales Admin SDK (Servidor):"
    echo "   • Ve a: ${BLUE}https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk${NC}"
    echo "   • Haz clic en: ${BLUE}Generate new private key${NC}"
    echo "   • Descarga el archivo JSON"
    echo "   • Guárdalo en la raíz del proyecto (junto a package.json)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
