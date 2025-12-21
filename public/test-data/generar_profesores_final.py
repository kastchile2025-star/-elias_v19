#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador ÚNICO de profesores - Archivo definitivo
Cubre TODAS las asignaturas del sistema en un solo archivo
"""

import csv
import random

def generar_rut():
    """Genera un RUT chileno válido con dígito verificador"""
    base = random.randint(10000000, 25999999)
    
    suma = 0
    multiplicador = 2
    
    for digito in str(base)[::-1]:
        suma += int(digito) * multiplicador
        multiplicador += 1
        if multiplicador > 7:
            multiplicador = 2
    
    resto = suma % 11
    dv = 11 - resto
    
    if dv == 11:
        dv_str = '0'
    elif dv == 10:
        dv_str = 'K'
    else:
        dv_str = str(dv)
    
    rut_str = f"{base:,}".replace(',', '.')
    return f"{rut_str}-{dv_str}"

def generar_todos_los_profesores():
    """Genera TODOS los profesores y asignaciones en un solo archivo"""
    
    # Definir profesores
    profesores = {
        # EDUCACIÓN BÁSICA (2 profesores para 4 asignaturas)
        'basica_1': {
            'nombre': 'Carlos Muñoz Silva',
            'username': 'c.munoz',
            'email': 'carlos.munoz@colegio.cl',
            'rut': generar_rut(),
            'asignaturas': ['CNT', 'HIS'],
            'nivel': 'basica'
        },
        'basica_2': {
            'nombre': 'Andrea Soto Torres',
            'username': 'a.soto',
            'email': 'andrea.soto@colegio.cl',
            'rut': generar_rut(),
            'asignaturas': ['LEN', 'MAT'],
            'nivel': 'basica'
        },
        
        # EDUCACIÓN MEDIA (4 profesores para 8 asignaturas)
        'media_1': {
            'nombre': 'Fernando Lagos Medina',
            'username': 'f.lagos',
            'email': 'fernando.lagos@colegio.cl',
            'rut': generar_rut(),
            'asignaturas': ['BIO', 'FIS'],
            'nivel': 'media'
        },
        'media_2': {
            'nombre': 'Gloria Pinto Vidal',
            'username': 'g.pinto',
            'email': 'gloria.pinto@colegio.cl',
            'rut': generar_rut(),
            'asignaturas': ['QUI', 'HIS'],
            'nivel': 'media'
        },
        'media_3': {
            'nombre': 'Patricia González Vega',
            'username': 'p.gonzalez',
            'email': 'patricia.gonzalez@colegio.cl',
            'rut': generar_rut(),
            'asignaturas': ['LEN', 'MAT'],
            'nivel': 'media'
        },
        'media_4': {
            'nombre': 'Isabel Rojas Contreras',
            'username': 'i.rojas',
            'email': 'isabel.rojas@colegio.cl',
            'rut': generar_rut(),
            'asignaturas': ['FIL', 'EDC'],
            'nivel': 'media'
        }
    }
    
    # Cursos
    cursos_basica = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
    ]
    
    cursos_media = ['1ro Medio', '2do Medio', '3ro Medio', '4to Medio']
    
    secciones = ['A', 'B']
    
    asignaciones = []
    
    # Generar asignaciones para EDUCACIÓN BÁSICA
    for prof_key, prof_data in profesores.items():
        if prof_data['nivel'] == 'basica':
            for curso in cursos_basica:
                for seccion in secciones:
                    for asignatura in prof_data['asignaturas']:
                        asignaciones.append({
                            'role': 'teacher',
                            'name': prof_data['nombre'],
                            'rut': prof_data['rut'],
                            'email': prof_data['email'],
                            'username': prof_data['username'],
                            'password': '1234',
                            'course': curso,
                            'section': seccion,
                            'subjects': asignatura
                        })
    
    # Generar asignaciones para EDUCACIÓN MEDIA
    for prof_key, prof_data in profesores.items():
        if prof_data['nivel'] == 'media':
            for curso in cursos_media:
                for seccion in secciones:
                    for asignatura in prof_data['asignaturas']:
                        asignaciones.append({
                            'role': 'teacher',
                            'name': prof_data['nombre'],
                            'rut': prof_data['rut'],
                            'email': prof_data['email'],
                            'username': prof_data['username'],
                            'password': '1234',
                            'course': curso,
                            'section': seccion,
                            'subjects': asignatura
                        })
    
    return asignaciones, profesores

def guardar_csv(datos, nombre_archivo):
    """Guarda los datos en formato CSV"""
    if len(datos) == 0:
        return
    
    with open(nombre_archivo, 'w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=datos[0].keys())
        writer.writeheader()
        writer.writerows(datos)

def main():
    print("🎓 GENERADOR ÚNICO DE PROFESORES - ARCHIVO DEFINITIVO")
    print("=" * 60)
    
    # Generar datos
    asignaciones, profesores = generar_todos_los_profesores()
    
    # Guardar archivo
    nombre_archivo = 'profesores_completo_final.csv'
    guardar_csv(asignaciones, nombre_archivo)
    
    # Estadísticas
    print(f"\n✅ ARCHIVO ÚNICO GENERADO:\n")
    print(f"   📄 {nombre_archivo}")
    print(f"      └─ {len(asignaciones)} asignaciones\n")
    
    # Contar profesores únicos
    profesores_basica = [p for p in profesores.values() if p['nivel'] == 'basica']
    profesores_media = [p for p in profesores.values() if p['nivel'] == 'media']
    
    print(f"👨‍🏫 PROFESORES INCLUIDOS: {len(profesores)} total\n")
    
    print("   📚 EDUCACIÓN BÁSICA (2 profesores):\n")
    for prof in profesores_basica:
        asigs_str = ', '.join(prof['asignaturas'])
        print(f"      {prof['nombre']}")
        print(f"      └─ Usuario: {prof['username']} / Contraseña: 1234")
        print(f"      └─ Asignaturas: {asigs_str}\n")
    
    print("   📖 EDUCACIÓN MEDIA (4 profesores):\n")
    for prof in profesores_media:
        asigs_str = ', '.join(prof['asignaturas'])
        print(f"      {prof['nombre']}")
        print(f"      └─ Usuario: {prof['username']} / Contraseña: 1234")
        print(f"      └─ Asignaturas: {asigs_str}\n")
    
    # Desglose de asignaciones
    print("📊 DESGLOSE DE ASIGNACIONES:\n")
    
    basica_count = sum(1 for a in asignaciones if 'Básico' in a['course'])
    media_count = sum(1 for a in asignaciones if 'Medio' in a['course'])
    
    print(f"   Educación Básica:")
    print(f"      • 8 cursos × 2 secciones × 4 asignaturas = {basica_count}")
    print(f"\n   Educación Media:")
    print(f"      • 4 cursos × 2 secciones × 8 asignaturas = {media_count}")
    print(f"\n   TOTAL: {len(asignaciones)} asignaciones\n")
    
    # Verificación de cobertura
    print("✅ COBERTURA COMPLETA:\n")
    
    asignaturas_basica = set()
    asignaturas_media = set()
    
    for asig in asignaciones:
        if 'Básico' in asig['course']:
            asignaturas_basica.add(asig['subjects'])
        else:
            asignaturas_media.add(asig['subjects'])
    
    print(f"   Básica: {sorted(asignaturas_basica)}")
    print(f"   Media: {sorted(asignaturas_media)}\n")
    
    print("📋 INSTRUCCIONES DE USO:\n")
    print("   1️⃣  Ve a: Admin → Configuración → Carga Masiva Excel")
    print(f"   2️⃣  Carga: {nombre_archivo}")
    print("   3️⃣  Espera: '6 usuarios creados, 128 asignaciones'\n")
    
    print("🎯 CARACTERÍSTICAS DEL ARCHIVO:\n")
    print("   ✅ UN SOLO archivo (no necesitas cargar nada más)")
    print("   ✅ Cubre TODAS las asignaturas del sistema")
    print("   ✅ Máximo 2 asignaturas por profesor")
    print("   ✅ Básica separada de Media")
    print("   ✅ Incluye role, course, section, subjects\n")
    
    print("✨ ¡Generación completada exitosamente!")

if __name__ == '__main__':
    main()
