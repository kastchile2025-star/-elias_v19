#!/bin/bash

# Script para ver el estado de todas las sesiones
echo "📊 Estado de las sesiones de desarrollo"
echo "======================================"

# Mostrar sesiones de screen
echo ""
echo "🖥️  Sesiones de Screen:"
screen -ls | grep -E "(nextjs-session|There are screens on|No Sockets found)" || echo "   No hay sesiones de screen activas"

# Mostrar procesos de Next.js
echo ""
echo "⚡ Procesos de Next.js:"
NEXTJS_PROCESSES=$(ps aux | grep -E "next.*dev|npm.*dev" | grep -v grep)
if [ -z "$NEXTJS_PROCESSES" ]; then
    echo "   No hay procesos de Next.js ejecutándose"
else
    echo "$NEXTJS_PROCESSES"
fi

# Verificar puertos
echo ""
echo "🔌 Estado de puertos:"
for port in {9002..9010}; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -ti:$port 2>/dev/null)
        echo "   ✅ Puerto $port: ACTIVO (PID: $PID)"
        echo "      🌐 URL: http://localhost:$port"
    else
        echo "   ❌ Puerto $port: LIBRE"
    fi
done

echo ""
echo "🛠️  Comandos útiles:"
echo "   • Iniciar sesiones: ./start-persistent-sessions.sh [número]"
echo "   • Detener todas: ./stop-all-sessions.sh"
echo "   • Ver una sesión: screen -r nextjs-session-0"
echo "   • Salir de sesión: Ctrl+A, D"
