# Configuración de Múltiples Sesiones Persistentes para Pruebas

Este proyecto está configurado para ejecutar múltiples instancias persistentes del servidor de desarrollo en diferentes puertos, permitiendo realizar pruebas con varias sesiones simultáneas que **no se caen al refrescar**.

## 🚀 Scripts Disponibles

### Scripts de Gestión Principal

- `manage-sessions.sh` - **Script principal** para gestionar todas las sesiones
- `start-persistent-sessions.sh` - Inicia sesiones persistentes con screen
- `stop-all-sessions.sh` - Detiene todas las sesiones activas
- `check-sessions.sh` - Verifica el estado de las sesiones

### Scripts de NPM (para uso manual)

```json
"dev": "next dev --turbopack -p 9002",
"dev:port": "next dev --turbopack -p",
"dev:9003": "next dev --turbopack -p 9003",
"dev:9004": "next dev --turbopack -p 9004",
"dev:9005": "next dev --turbopack -p 9005"
```

## 🛠️ Uso Recomendado

### Gestión Completa (Recomendado)

```bash
# Ver ayuda
./manage-sessions.sh

# Iniciar 3 sesiones persistentes
./manage-sessions.sh start 3

# Ver estado de todas las sesiones
./manage-sessions.sh status

# Monitorear y auto-reiniciar sesiones caídas
./manage-sessions.sh monitor 3

# Reiniciar todas las sesiones
./manage-sessions.sh restart 3

# Detener todas las sesiones
./manage-sessions.sh stop

# Ver logs de una sesión específica
./manage-sessions.sh logs 0
```

### Uso Directo de Scripts

```bash
# Iniciar 3 sesiones persistentes
./start-persistent-sessions.sh 3

# Verificar estado
./check-sessions.sh

# Detener todas
./stop-all-sessions.sh
```

## 🌐 URLs de Acceso

Una vez iniciadas las sesiones persistentes, podrás acceder a:

- **Sesión 0:** http://localhost:9002
- **Sesión 1:** http://localhost:9003  
- **Sesión 2:** http://localhost:9004
- **Sesión 3:** http://localhost:9005
- **Sesión N:** http://localhost:900(N+2)

## 🔧 Comandos de Screen Útiles

```bash
# Ver todas las sesiones activas
screen -ls

# Conectar a una sesión específica
screen -r nextjs-session-0

# Desconectar de una sesión (mantenerla corriendo)
# Presionar: Ctrl + A, luego D

# Terminar una sesión específica
screen -S nextjs-session-0 -X quit
```

## ✨ Características Principales

### ✅ Sesiones Persistentes
- Las sesiones **NO se caen** al refrescar el navegador
- Utilizan `screen` para mantener procesos en segundo plano
- Supervivencia a desconexiones de red

### 🔄 Auto-Reinicio
- Modo monitor que reinicia automáticamente sesiones caídas
- Verificación cada 10 segundos
- Recuperación automática de errores

### 📊 Monitoreo Completo
- Estado en tiempo real de todas las sesiones
- Verificación de puertos activos
- Logs detallados de cada sesión

## 🎯 Casos de Uso

### Pruebas de Usuario Múltiple
- Abrir diferentes navegadores/pestañas incógnito
- Simular usuarios simultáneos
- Probar funcionalidades colaborativas
- **Las sesiones permanecen activas al refrescar**

### Pruebas de Rendimiento
- Evaluar carga del servidor
- Verificar comportamiento bajo estrés
- Monitorear recursos del sistema
- Sesiones estables para pruebas largas

### Desarrollo Paralelo
- Trabajar en diferentes funcionalidades
- Comparar versiones del código
- Debugear problemas específicos
- Sesiones independientes y persistentes

## ⚠️ Solución a Problemas Comunes

### Problema: Las sesiones se caen al refrescar
✅ **Solucionado:** Usar `./manage-sessions.sh start` en lugar de scripts normales

### Problema: Puertos ocupados
```bash
# Limpiar todos los puertos
./stop-all-sessions.sh

# Reiniciar limpio
./manage-sessions.sh restart 3
```

### Problema: Una sesión específica no responde
```bash
# Ver estado detallado
./check-sessions.sh

# Reiniciar todas
./manage-sessions.sh restart

# O conectar a la sesión problemática
screen -r nextjs-session-0
```

## 📋 Notas Importantes

- ✅ Cada sesión es completamente independiente y persistente
- ✅ Los cambios de código se reflejan en todas las sesiones
- ✅ El hot-reload funciona independientemente en cada sesión
- ✅ Las sesiones sobreviven a refrescos del navegador
- ✅ Auto-reinicio disponible con modo monitor
- ⚠️ Asegúrate de tener suficientes recursos del sistema
- 💡 Usa `./manage-sessions.sh monitor` para sesiones críticas
