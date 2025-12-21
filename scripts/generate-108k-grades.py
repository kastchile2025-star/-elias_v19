#!/usr/bin/env python3
"""
Script para generar CSV de 108,000 calificaciones a partir del CSV existente.
Toma el CSV actual (107,710 registros) y genera 290 registros adicionales
modificando levemente las fechas para llegar a 108,000 total.
"""

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

def main():
    # Rutas
    input_csv = Path('/workspaces/superjf_v17/public/test-data/grades-consolidated-2025-SIN-DUPS.csv')
    output_csv = Path('/workspaces/superjf_v17/public/test-data/grades-consolidated-2025-108K.csv')
    
    TARGET_RECORDS = 108000
    
    print(f"📂 Leyendo CSV: {input_csv}")
    
    # Leer todas las filas
    rows = []
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        for row in reader:
            rows.append(row)
    
    current_count = len(rows)
    needed = TARGET_RECORDS - current_count
    
    print(f"📊 Registros actuales: {current_count:,}")
    print(f"🎯 Meta: {TARGET_RECORDS:,}")
    print(f"➕ Registros a generar: {needed:,}")
    
    if needed <= 0:
        print(f"✅ Ya tienes {current_count:,} registros (suficientes)")
        return
    
    # Generar registros adicionales
    print(f"\n⚙️  Generando {needed:,} registros adicionales...")
    
    additional_rows = []
    for i in range(needed):
        # Seleccionar fila aleatoria como base
        base_row = random.choice(rows).copy()
        
        # Modificar la fecha para hacerla única
        try:
            # Intentar parsear fecha con hora
            if ' ' in base_row['Fecha']:
                original_date = datetime.strptime(base_row['Fecha'], '%Y-%m-%d %H:%M:%S')
            else:
                original_date = datetime.strptime(base_row['Fecha'], '%Y-%m-%d')
            
            # Añadir tiempo aleatorio (entre 1-3600 segundos)
            new_date = original_date + timedelta(seconds=random.randint(1, 3600))
            base_row['Fecha'] = new_date.strftime('%Y-%m-%d %H:%M:%S')
            
            # Variar ligeramente la nota (+/- 1-3 puntos)
            try:
                original_score = float(base_row['Nota'])
                variation = random.randint(-3, 3)
                new_score = max(0, min(100, original_score + variation))
                base_row['Nota'] = str(int(new_score))
            except:
                pass  # Mantener nota original si hay error
            
        except ValueError:
            # Si hay error parseando fecha, mantener original pero añadir timestamp
            base_row['Fecha'] = f"{base_row['Fecha']} 00:00:{i % 60:02d}"
        
        additional_rows.append(base_row)
        
        if (i + 1) % 100 == 0:
            print(f"   Generados: {i+1:,}/{needed:,}")
    
    # Combinar registros
    all_rows = rows + additional_rows
    
    print(f"\n📝 Total de registros: {len(all_rows):,}")
    
    # Mezclar para distribuir los nuevos registros
    random.shuffle(all_rows)
    
    # Escribir nuevo CSV
    print(f"\n💾 Escribiendo CSV: {output_csv}")
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(all_rows)
    
    print(f"\n✅ ¡Completado!")
    print(f"   📂 Archivo generado: {output_csv}")
    print(f"   📊 Registros totales: {len(all_rows):,}")
    print(f"   ➕ Registros originales: {current_count:,}")
    print(f"   🆕 Registros generados: {len(additional_rows):,}")
    print(f"\n💡 Ahora puedes usar este archivo en la carga masiva")
    print(f"   Firebase debería guardar los {TARGET_RECORDS:,} registros correctamente")

if __name__ == '__main__':
    random.seed(42)  # Seed para reproducibilidad
    main()
