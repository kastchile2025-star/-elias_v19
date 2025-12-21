#!/bin/bash

# Script para iniciar múltiples sesiones de desarrollo para pruebas
# Uso: ./start-multiple-sessions.sh [número_de_sesiones]

# Número de sesiones (por defecto 3)
SESSIONS=${1:-3}
BASE_PORT=9002

echo "🚀 Iniciando $SESSIONS sesiones de desarrollo simultáneas..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Array para almacenar los PIDs de los procesos
declare -a PIDS=()

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Cerrando todas las sesiones..."
    for pid in "${PIDS[@]}"; do
        kill $pid 2>/dev/null
    done
    echo "✅ Todas las sesiones han sido cerradas."
    exit 0
}

# Configurar trap para limpieza al salir
trap cleanup SIGINT SIGTERM EXIT

# Iniciar cada sesión
for i in $(seq 1 $SESSIONS); do
    PORT=$((BASE_PORT + i - 1))
    
    echo "🌐 Sesión $i: Iniciando en puerto $PORT"
    echo "   URL: http://localhost:$PORT"
    
    # Iniciar el servidor en background
    npm run dev:session$i > "session_${i}_log.txt" 2>&1 &
    
    # Guardar el PID
    PIDS+=($!)
    
    # Esperar un poco antes de iniciar la siguiente sesión
    sleep 2
done

echo ""
echo "✅ Todas las sesiones están iniciando..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Resumen de sesiones:"
for i in $(seq 1 $SESSIONS); do
    PORT=$((BASE_PORT + i - 1))
    echo "   Sesión $i: http://localhost:$PORT (Log: session_${i}_log.txt)"
done
echo ""
echo "💡 Tips para pruebas:"
echo "   • Cada sesión tiene su propio estado de aplicación"
echo "   • Puedes abrir múltiples navegadores/pestañas"
echo "   • Los logs se guardan en session_X_log.txt"
echo "   • Presiona Ctrl+C para cerrar todas las sesiones"
echo ""
echo "⏳ Esperando... (Ctrl+C para salir)"

# Esperar indefinidamente hasta que el usuario presione Ctrl+C
while true; do
    sleep 1
done
