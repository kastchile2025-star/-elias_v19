#!/bin/bash

# Script de gestión avanzada de sesiones con auto-reinicio
# Uso: ./manage-sessions.sh [start|stop|restart|status|monitor] [número_sesiones]

COMMAND=${1:-status}
NUM_SESSIONS=${2:-3}

case $COMMAND in
    "start")
        echo "🚀 Iniciando sesiones persistentes..."
        ./start-persistent-sessions.sh $NUM_SESSIONS
        ;;
    
    "stop")
        echo "🛑 Deteniendo todas las sesiones..."
        ./stop-all-sessions.sh
        ;;
    
    "restart")
        echo "🔄 Reiniciando todas las sesiones..."
        ./stop-all-sessions.sh
        sleep 3
        ./start-persistent-sessions.sh $NUM_SESSIONS
        ;;
    
    "status")
        ./check-sessions.sh
        ;;
    
    "monitor")
        echo "👀 Iniciando monitoreo de sesiones (Ctrl+C para salir)..."
        echo "   Verificando cada 10 segundos si las sesiones están activas..."
        echo ""
        
        while true; do
            clear
            echo "🕐 $(date '+%H:%M:%S') - Monitoreo de Sesiones"
            echo "=========================================="
            
            ACTIVE_COUNT=0
            for i in $(seq 0 $((NUM_SESSIONS-1))); do
                PORT=$((9002 + i))
                if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                    echo "   ✅ Sesión $i (Puerto $PORT): ACTIVA"
                    ACTIVE_COUNT=$((ACTIVE_COUNT + 1))
                else
                    echo "   ❌ Sesión $i (Puerto $PORT): INACTIVA - REINICIANDO..."
                    screen -dmS "nextjs-session-$i" bash -c "
                        cd /workspaces/superjf_v11
                        npm run dev -- --port $PORT
                    "
                fi
            done
            
            echo ""
            echo "📊 Sesiones activas: $ACTIVE_COUNT/$NUM_SESSIONS"
            echo "⏱️  Próxima verificación en 10 segundos..."
            
            sleep 10
        done
        ;;
    
    "logs")
        SESSION_ID=${2:-0}
        echo "📜 Mostrando logs de la sesión $SESSION_ID..."
        screen -r "nextjs-session-$SESSION_ID"
        ;;
    
    *)
        echo "❓ Uso: $0 [start|stop|restart|status|monitor|logs] [número_sesiones|session_id]"
        echo ""
        echo "Comandos disponibles:"
        echo "   start [N]    - Iniciar N sesiones (por defecto 3)"
        echo "   stop         - Detener todas las sesiones"
        echo "   restart [N]  - Reiniciar todas las sesiones"
        echo "   status       - Ver estado actual"
        echo "   monitor [N]  - Monitorear y auto-reiniciar sesiones"
        echo "   logs [ID]    - Ver logs de una sesión específica"
        echo ""
        echo "Ejemplos:"
        echo "   $0 start 5       # Iniciar 5 sesiones"
        echo "   $0 monitor 3     # Monitorear 3 sesiones"
        echo "   $0 logs 0        # Ver logs de la sesión 0"
        ;;
esac
