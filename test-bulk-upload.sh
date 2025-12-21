#!/bin/bash

# Script para probar el endpoint de carga masiva
# Uso: ./test-bulk-upload.sh [archivo.csv]

CSV_FILE="${1:-calificaciones_test.csv}"

echo "🧪 Probando endpoint /api/firebase/bulk-upload-grades"
echo "📁 Archivo: $CSV_FILE"
echo ""

if [ ! -f "$CSV_FILE" ]; then
    echo "⚠️  El archivo $CSV_FILE no existe"
    echo "📝 Creando archivo de prueba..."
    
    cat > calificaciones_test.csv << 'EOF'
nombre,rut,curso,seccion,asignatura,fecha,tipo,nota
Juan Pérez,12345678-9,1A,A,Matemáticas,2025-10-01,evaluacion,85
María González,98765432-1,1A,A,Matemáticas,2025-10-01,evaluacion,92
EOF
    
    CSV_FILE="calificaciones_test.csv"
    echo "✅ Archivo de prueba creado: $CSV_FILE"
    echo ""
fi

echo "📤 Enviando archivo al servidor..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  http://localhost:9002/api/firebase/bulk-upload-grades \
  -F "file=@$CSV_FILE" \
  -F "year=2025" \
  -F "jobId=test-$(date +%s)")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📊 Código HTTP: $HTTP_CODE"
echo ""
echo "📦 Respuesta del servidor:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Test exitoso!"
else
    echo "❌ Test falló con código $HTTP_CODE"
fi
