#!/bin/bash

# Script para iniciar múltiples sesiones persistentes de desarrollo usando screen
# Uso: ./start-persistent-sessions.sh [número_de_sesiones]

# Número de sesiones (por defecto 3)
NUM_SESSIONS=${1:-3}

echo "🚀 Iniciando $NUM_SESSIONS sesiones persistentes de desarrollo..."

# Instalar screen si no está disponible
if ! command -v screen &> /dev/null; then
    echo "📦 Instalando screen..."
    sudo apt-get update && sudo apt-get install -y screen
fi

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para terminar sesiones existentes
cleanup_sessions() {
    echo "🧹 Limpiando sesiones anteriores..."
    for i in $(seq 0 $((NUM_SESSIONS-1))); do
        PORT=$((9002 + i))
        SESSION_NAME="nextjs-session-$i"
        
        # Terminar sesión de screen si existe
        screen -S "$SESSION_NAME" -X quit 2>/dev/null || true
        
        # Terminar proceso en el puerto si existe
        PID=$(lsof -ti:$PORT 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo "🔄 Terminando proceso en puerto $PORT (PID: $PID)"
            kill -9 $PID 2>/dev/null || true
        fi
    done
    sleep 2
}

# Limpiar sesiones anteriores
cleanup_sessions

# Crear las sesiones
echo "📱 Creando sesiones de desarrollo..."
for i in $(seq 0 $((NUM_SESSIONS-1))); do
    PORT=$((9002 + i))
    SESSION_NAME="nextjs-session-$i"
    
    echo "   🔗 Sesión $i: http://localhost:$PORT (screen: $SESSION_NAME)"
    
    # Crear nueva sesión de screen en segundo plano
    screen -dmS "$SESSION_NAME" bash -c "
        cd /workspaces/superjf_v11
        echo 'Iniciando servidor en puerto $PORT...'
        npm run dev -- --port $PORT
    "
done

echo ""
echo "✅ Todas las sesiones han sido iniciadas!"
echo ""
echo "📋 URLs disponibles:"
for i in $(seq 0 $((NUM_SESSIONS-1))); do
    PORT=$((9002 + i))
    echo "   • Sesión $i: http://localhost:$PORT"
done

echo ""
echo "🛠️  Comandos útiles:"
echo "   • Ver sesiones activas: screen -ls"
echo "   • Conectar a sesión 0: screen -r nextjs-session-0"
echo "   • Desconectar sesión: Ctrl+A, D"
echo "   • Terminar sesión: screen -S nextjs-session-0 -X quit"
echo "   • Terminar todas: ./stop-all-sessions.sh"
echo ""
echo "⏱️  Esperando 5 segundos para que los servidores inicien..."
sleep 5

echo "🔍 Estado de los servidores:"
for i in $(seq 0 $((NUM_SESSIONS-1))); do
    PORT=$((9002 + i))
    if check_port $PORT; then
        echo "   ✅ Puerto $PORT: ACTIVO"
    else
        echo "   ❌ Puerto $PORT: INACTIVO"
    fi
done
