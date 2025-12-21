#!/usr/bin/env python3
"""
Script para eliminar duplicados del CSV de calificaciones y generar versión única.
Este script:
1. Lee el CSV actual
2. Detecta registros duplicados (mismo RUT + Curso + Asignatura + Tipo + Fecha)
3. Para duplicados: añade microsegundos a la fecha para hacerlos únicos
4. Genera nuevo CSV sin duplicados que Firebase pueda cargar completamente
"""

import csv
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

def main():
    # Rutas
    input_csv = Path('/workspaces/superjf_v17/public/test-data/grades-consolidated-2025-COMPLETO.csv')
    output_csv = Path('/workspaces/superjf_v17/public/test-data/grades-consolidated-2025-UNICO.csv')
    
    if not input_csv.exists():
        print(f"❌ Error: No se encuentra el archivo {input_csv}")
        sys.exit(1)
    
    print(f"📂 Leyendo CSV: {input_csv}")
    
    # Leer todas las filas
    rows = []
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        for row in reader:
            rows.append(row)
    
    print(f"📊 Filas leídas: {len(rows):,}")
    
    # Detectar duplicados: clave = (RUT, Curso, Asignatura, Tipo, Fecha)
    duplicates_map = defaultdict(list)
    for idx, row in enumerate(rows):
        key = (
            row['RUT'].strip(),
            row['Curso'].strip(),
            row['Asignatura'].strip(),
            row['Tipo'].strip().lower(),
            row['Fecha'].strip()
        )
        duplicates_map[key].append((idx, row))
    
    # Contar duplicados
    duplicate_keys = {k: indices for k, indices in duplicates_map.items() if len(indices) > 1}
    
    print(f"\n🔍 Análisis de duplicados:")
    print(f"   - Total de claves únicas: {len(duplicates_map):,}")
    print(f"   - Claves con duplicados: {len(duplicate_keys):,}")
    print(f"   - Total de registros duplicados: {sum(len(v) - 1 for v in duplicate_keys.values()):,}")
    
    if duplicate_keys:
        print(f"\n📋 Ejemplos de duplicados (primeros 10):")
        for i, (key, indices) in enumerate(list(duplicate_keys.items())[:10]):
            rut, curso, asignatura, tipo, fecha = key
            print(f"   {i+1}. RUT={rut}, Curso={curso}, Asignatura={asignatura}, Tipo={tipo}, Fecha={fecha}")
            print(f"      → {len(indices)} registros iguales")
    
    # Estrategia: Para cada grupo de duplicados, ajustar la HORA de la fecha
    # para hacerlos únicos en Firebase
    print(f"\n⚙️  Procesando duplicados...")
    
    processed_rows = []
    duplicates_fixed = 0
    
    for key, indices in duplicates_map.items():
        if len(indices) == 1:
            # No es duplicado, mantener original
            _, row = indices[0]
            processed_rows.append(row)
        else:
            # Es duplicado: añadir segundos incrementales para diferenciar
            for seq_num, (idx, row) in enumerate(indices):
                new_row = row.copy()
                
                if seq_num > 0:  # El primero mantiene fecha original
                    # Parsear fecha original (YYYY-MM-DD)
                    try:
                        original_date = datetime.strptime(row['Fecha'], '%Y-%m-%d')
                        # Añadir segundos incrementales
                        new_date = original_date + timedelta(seconds=seq_num)
                        # Formatear con hora:minuto:segundo para diferenciación
                        new_row['Fecha'] = new_date.strftime('%Y-%m-%d %H:%M:%S')
                        duplicates_fixed += 1
                    except ValueError:
                        # Si hay error, mantener original
                        pass
                
                processed_rows.append(new_row)
    
    print(f"✅ Duplicados procesados: {duplicates_fixed:,}")
    print(f"📝 Total de filas en nuevo CSV: {len(processed_rows):,}")
    
    # Escribir nuevo CSV
    print(f"\n💾 Escribiendo CSV limpio: {output_csv}")
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(processed_rows)
    
    print(f"\n✅ ¡Completado!")
    print(f"   📂 Archivo generado: {output_csv}")
    print(f"   📊 Registros totales: {len(processed_rows):,}")
    print(f"   🔧 Duplicados corregidos: {duplicates_fixed:,}")
    print(f"\n💡 Ahora puedes usar este archivo en la carga masiva de Firebase")

if __name__ == '__main__':
    main()
