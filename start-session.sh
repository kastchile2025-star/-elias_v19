#!/bin/bash

# Script simple para iniciar sesiones específicas
# Uso: ./start-session.sh [número_sesión]

SESSION=${1:-1}
BASE_PORT=9002
PORT=$((BASE_PORT + SESSION - 1))

echo "🚀 Iniciando sesión $SESSION en puerto $PORT"
echo "🌐 URL: http://localhost:$PORT"
echo "📝 Log: session_${SESSION}_log.txt"
echo ""
echo "💡 Para detener: Ctrl+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ejecutar el comando correspondiente
case $SESSION in
    1)
        npm run dev:session1
        ;;
    2)
        npm run dev:session2
        ;;
    3)
        npm run dev:session3
        ;;
    4)
        npm run dev:session4
        ;;
    5)
        npm run dev:session5
        ;;
    *)
        echo "❌ Error: Sesión $SESSION no configurada"
        echo "   Sesiones disponibles: 1-5"
        exit 1
        ;;
esac
