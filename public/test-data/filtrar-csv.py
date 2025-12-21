#!/usr/bin/env python3
"""
Script para filtrar el archivo users-consolidated-2025.csv
Mantiene solo profesores con asignaturas válidas según el nivel educativo
"""

import csv

# Asignaturas permitidas por nivel
ASIGNATURAS_BASICA = {'CNT', 'HIS', 'LEN', 'MAT'}
ASIGNATURAS_MEDIA = {'BIO', 'FIS', 'QUI', 'HIS', 'LEN', 'MAT', 'FIL', 'EDC'}

# Cursos por nivel
CURSOS_BASICA = {'1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
                 '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'}
CURSOS_MEDIA = {'1ro Medio', '2do Medio', '3ro Medio', '4to Medio'}

def filtrar_csv():
    input_file = 'users-consolidated-2025.csv'
    output_file = 'users-consolidated-2025-CORREGIDO.csv'
    
    registros_mantenidos = 0
    registros_eliminados = 0
    estudiantes = 0
    profesores_basica = 0
    profesores_media = 0
    
    print("🔧 FILTRANDO ARCHIVO CSV...")
    print("=" * 60)
    
    with open(input_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.DictReader(infile)
        writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
        writer.writeheader()
        
        for row in reader:
            role = row['role']
            course = row['course']
            subject = row['subjects']
            
            # Mantener todos los estudiantes
            if role == 'student':
                writer.writerow(row)
                registros_mantenidos += 1
                estudiantes += 1
                continue
            
            # Filtrar profesores según nivel y asignatura
            if role == 'teacher':
                # Básica: solo CNT, HIS, LEN, MAT
                if course in CURSOS_BASICA:
                    if subject in ASIGNATURAS_BASICA:
                        writer.writerow(row)
                        registros_mantenidos += 1
                        profesores_basica += 1
                    else:
                        registros_eliminados += 1
                        print(f"❌ Eliminado: {row['name']} - {course} - {subject}")
                
                # Media: BIO, FIS, QUI, HIS, LEN, MAT, FIL, EDC
                elif course in CURSOS_MEDIA:
                    if subject in ASIGNATURAS_MEDIA:
                        writer.writerow(row)
                        registros_mantenidos += 1
                        profesores_media += 1
                    else:
                        registros_eliminados += 1
                        print(f"❌ Eliminado: {row['name']} - {course} - {subject}")
    
    print("\n" + "=" * 60)
    print("✅ FILTRADO COMPLETADO")
    print("=" * 60)
    print(f"📊 Estudiantes: {estudiantes}")
    print(f"👨‍🏫 Profesores Básica: {profesores_basica}")
    print(f"👨‍🏫 Profesores Media: {profesores_media}")
    print(f"✅ Registros mantenidos: {registros_mantenidos}")
    print(f"❌ Registros eliminados: {registros_eliminados}")
    print(f"\n📄 Archivo generado: {output_file}")
    print("=" * 60)

if __name__ == '__main__':
    filtrar_csv()
