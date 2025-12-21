# 🔥 Guía para Múltiples Sesiones de Desarrollo

Esta configuración te permite ejecutar múltiples instancias de tu aplicación Next.js simultáneamente para realizar pruebas exhaustivas.

## 🚀 Métodos de Inicio

### 1. Script Automático (Recomendado)
```bash
# Iniciar 3 sesiones por defecto
./start-multiple-sessions.sh

# Iniciar número específico de sesiones
./start-multiple-sessions.sh 5
```

### 2. Script Individual
```bash
# Iniciar sesión específica
./start-session.sh 1    # Puerto 9002
./start-session.sh 2    # Puerto 9003
./start-session.sh 3    # Puerto 9004
```

### 3. Comandos NPM Directos
```bash
# Terminal 1
npm run dev:session1   # Puerto 9002

# Terminal 2  
npm run dev:session2   # Puerto 9003

# Terminal 3
npm run dev:session3   # Puerto 9004

# Terminal 4
npm run dev:session4   # Puerto 9005

# Terminal 5
npm run dev:session5   # Puerto 9006
```

## 🌐 URLs de Acceso

| Sesión | Puerto | URL |
|--------|--------|-----|
| 1 | 9002 | http://localhost:9002 |
| 2 | 9003 | http://localhost:9003 |
| 3 | 9004 | http://localhost:9004 |
| 4 | 9005 | http://localhost:9005 |
| 5 | 9006 | http://localhost:9006 |

## 🧪 Casos de Uso para Pruebas

### 1. **Pruebas de Usuario Múltiple**
- Simula diferentes usuarios accediendo simultáneamente
- Cada sesión mantiene su propio estado de aplicación
- Ideal para probar funcionalidades colaborativas

### 2. **Pruebas de Rendimiento**
- Observa el comportamiento bajo carga múltiple
- Monitorea el uso de memoria y CPU
- Detecta posibles cuellos de botella

### 3. **Pruebas de Sincronización**
- Verifica que los datos se sincronizan correctamente
- Prueba notificaciones en tiempo real
- Valida la consistencia de datos

### 4. **Pruebas Cross-Browser**
- Chrome en puerto 9002
- Firefox en puerto 9003
- Safari en puerto 9004
- Edge en puerto 9005

### 5. **Pruebas de Roles**
- Admin en sesión 1
- Profesor en sesión 2
- Estudiante en sesión 3
- Invitado en sesión 4

## 📊 Monitoreo y Logs

### Logs Individuales
Cada sesión genera su propio archivo de log:
- `session_1_log.txt`
- `session_2_log.txt`
- `session_3_log.txt`
- etc.

### Verificar Estado de Sesiones
```bash
# Ver procesos activos
ps aux | grep "next dev"

# Ver puertos ocupados
netstat -tulpn | grep :900

# Ver logs en tiempo real
tail -f session_1_log.txt
```

## 🛠️ Herramientas Adicionales

### Comando para Verificar Puertos
```bash
# Verificar qué puertos están en uso
lsof -i :9002-9006
```

### Comando para Cerrar Sesiones Específicas
```bash
# Cerrar proceso en puerto específico
kill $(lsof -t -i:9003)
```

### Monitoreo de Recursos
```bash
# Ver uso de CPU y memoria
top -p $(pgrep -f "next dev")
```

## 🔧 Configuración Avanzada

### Agregar Más Sesiones
1. Edita `package.json` y agrega más scripts:
```json
"dev:session6": "next dev --turbopack -p 9007",
"dev:session7": "next dev --turbopack -p 9008",
```

2. Actualiza los scripts si es necesario.

### Variables de Entorno por Sesión
Puedes crear archivos `.env.session1`, `.env.session2`, etc., para configuraciones específicas por sesión.

## 💡 Tips y Mejores Prácticas

1. **Cierra sesiones no utilizadas** para liberar recursos
2. **Monitorea el uso de memoria** especialmente con 4+ sesiones
3. **Usa diferentes navegadores** para simular usuarios reales
4. **Documenta los escenarios de prueba** para reproducibilidad
5. **Considera usar herramientas como Postman** para pruebas de API simultáneas

## 🐛 Solución de Problemas

### Puerto Ya en Uso
```bash
# Encontrar y cerrar proceso
lsof -i :9002
kill -9 <PID>
```

### Memoria Insuficiente
```bash
# Monitorear uso de memoria
free -h
# Considerar reducir el número de sesiones activas
```

### Logs No Se Generan
- Verifica permisos de escritura en el directorio
- Asegúrate de que los scripts sean ejecutables

---

*Creado para facilitar las pruebas de desarrollo con múltiples sesiones simultáneas* 🚀
