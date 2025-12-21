#!/bin/bash

# Script para detener todas las sesiones de desarrollo
echo "🛑 Deteniendo todas las sesiones de desarrollo..."

# Obtener todas las sesiones de nextjs
SESSIONS=$(screen -ls | grep "nextjs-session" | awk '{print $1}' | sed 's/\..*//')

if [ -z "$SESSIONS" ]; then
    echo "ℹ️  No se encontraron sesiones activas de nextjs"
else
    echo "🔍 Sesiones encontradas:"
    for session in $SESSIONS; do
        echo "   • $session"
        screen -S "$session" -X quit 2>/dev/null || true
    done
fi

# Terminar procesos en puertos 9002-9010
echo "🔄 Verificando procesos en puertos 9002-9010..."
for port in {9002..9010}; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "   🔄 Terminando proceso en puerto $port (PID: $PID)"
        kill -9 $PID 2>/dev/null || true
    fi
done

echo "✅ Todas las sesiones han sido detenidas"
echo "🔍 Sesiones de screen restantes:"
screen -ls
