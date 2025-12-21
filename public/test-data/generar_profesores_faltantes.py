#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de profesores COMPLEMENTARIO
Cubre todas las asignaturas que quedaron sin profesor
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

def generar_profesores_faltantes():
    """Genera solo los profesores que faltan según el análisis del sistema"""
    
    # PROFESORES QUE YA EXISTEN (no los duplicamos):
    # - Fernando Lagos Medina (BIO)
    # - Gloria Pinto Vidal (FIS)
    # - Héctor Moreno Ortiz (QUI)
    # - Patricia González Vega (LEN en Media)
    # - Roberto Díaz Pérez (MAT en Media)
    # - Isabel Rojas Contreras (FIL en 3ro y 4to Medio)
    
    # ASIGNATURAS SIN PROFESOR:
    # BÁSICA (TODAS): CNT, HIS, LEN, MAT en 1ro-8vo Básico
    # MEDIA: HIS, FIL (1ro y 2do), EDC (todos)
    
    cursos_basica = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
    ]
    
    cursos_media = ['1ro Medio', '2do Medio', '3ro Medio', '4to Medio']
    
    secciones = ['A', 'B']
    
    asignaciones = []
    
    # PROFESOR 1: Educación Básica - CNT, HIS
    # Cubre: Ciencias Naturales e Historia en TODA la básica
    profesor1 = {
        'nombre': 'Carlos Muñoz Silva',
        'username': 'c.munoz',
        'email': 'carlos.munoz@colegio.cl',
        'rut': generar_rut(),
        'asignaturas': ['CNT', 'HIS']
    }
    
    for curso in cursos_basica:
        for seccion in secciones:
            for asignatura in ['CNT', 'HIS']:
                asignaciones.append({
                    'role': 'teacher',
                    'name': profesor1['nombre'],
                    'rut': profesor1['rut'],
                    'email': profesor1['email'],
                    'username': profesor1['username'],
                    'password': '1234',
                    'course': curso,
                    'section': seccion,
                    'subjects': asignatura
                })
    
    # PROFESOR 2: Educación Básica - LEN, MAT
    # Cubre: Lenguaje y Matemáticas en TODA la básica
    profesor2 = {
        'nombre': 'Andrea Soto Torres',
        'username': 'a.soto',
        'email': 'andrea.soto@colegio.cl',
        'rut': generar_rut(),
        'asignaturas': ['LEN', 'MAT']
    }
    
    for curso in cursos_basica:
        for seccion in secciones:
            for asignatura in ['LEN', 'MAT']:
                asignaciones.append({
                    'role': 'teacher',
                    'name': profesor2['nombre'],
                    'rut': profesor2['rut'],
                    'email': profesor2['email'],
                    'username': profesor2['username'],
                    'password': '1234',
                    'course': curso,
                    'section': seccion,
                    'subjects': asignatura
                })
    
    # PROFESOR 3: Educación Media - HIS, EDC
    # Cubre: Historia y Educación Ciudadana en TODA la media
    profesor3 = {
        'nombre': 'Miguel Vargas Rojas',
        'username': 'm.vargas',
        'email': 'miguel.vargas@colegio.cl',
        'rut': generar_rut(),
        'asignaturas': ['HIS', 'EDC']
    }
    
    for curso in cursos_media:
        for seccion in secciones:
            for asignatura in ['HIS', 'EDC']:
                asignaciones.append({
                    'role': 'teacher',
                    'name': profesor3['nombre'],
                    'rut': profesor3['rut'],
                    'email': profesor3['email'],
                    'username': profesor3['username'],
                    'password': '1234',
                    'course': curso,
                    'section': seccion,
                    'subjects': asignatura
                })
    
    # PROFESOR 4: Educación Media - FIL (solo 1ro y 2do Medio que falta)
    # Isabel Rojas Contreras ya está en 3ro y 4to Medio, pero necesitamos alguien para 1ro y 2do
    # Como solo es 1 asignatura para 2 cursos, podemos hacer que este profesor también tenga otra
    # Pero según reglas, ya tenemos cobertura. Solo necesitamos extender FIL a 1ro y 2do
    
    # Usamos a Isabel Rojas para 1ro y 2do también (ella puede tener FIL en todos los medios)
    profesor4 = {
        'nombre': 'Isabel Rojas Contreras',
        'username': 'i.rojas',
        'email': 'isabel.rojas@colegio.cl',
        'rut': '18.123.456-7',  # Usamos el mismo RUT que ya existe
        'asignaturas': ['FIL']
    }
    
    for curso in ['1ro Medio', '2do Medio']:  # Solo los que faltan
        for seccion in secciones:
            asignaciones.append({
                'role': 'teacher',
                'name': profesor4['nombre'],
                'rut': profesor4['rut'],
                'email': profesor4['email'],
                'username': profesor4['username'],
                'password': '1234',
                'course': curso,
                'section': seccion,
                'subjects': 'FIL'
            })
    
    return asignaciones

def guardar_csv(datos, nombre_archivo):
    """Guarda los datos en formato CSV"""
    if len(datos) == 0:
        return
    
    with open(nombre_archivo, 'w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=datos[0].keys())
        writer.writeheader()
        writer.writerows(datos)

def main():
    print("🎓 GENERADOR DE PROFESORES FALTANTES")
    print("=" * 60)
    print("\n📋 ANÁLISIS DEL SISTEMA:")
    print("   ✅ Ya existen en Media: BIO, FIS, QUI, LEN, MAT, FIL (3ro-4to)")
    print("   ❌ Faltan en Básica: CNT, HIS, LEN, MAT (TODOS los cursos)")
    print("   ❌ Faltan en Media: HIS, EDC (todos), FIL (1ro-2do)")
    print()
    
    # Generar asignaciones
    asignaciones = generar_profesores_faltantes()
    
    # Guardar archivo
    nombre_archivo = 'profesores_faltantes.csv'
    guardar_csv(asignaciones, nombre_archivo)
    
    # Estadísticas
    print(f"✅ ARCHIVO GENERADO:\n")
    print(f"   📄 {nombre_archivo}")
    print(f"      └─ {len(asignaciones)} asignaciones\n")
    
    # Análisis de profesores
    profesores_unicos = {}
    for asig in asignaciones:
        username = asig['username']
        if username not in profesores_unicos:
            profesores_unicos[username] = {
                'nombre': asig['name'],
                'asignaturas': set(),
                'nivel': set(),
                'cursos': set()
            }
        profesores_unicos[username]['asignaturas'].add(asig['subjects'])
        profesores_unicos[username]['cursos'].add(asig['course'])
        
        if 'Básico' in asig['course']:
            profesores_unicos[username]['nivel'].add('Básica')
        else:
            profesores_unicos[username]['nivel'].add('Media')
    
    print(f"👨‍🏫 PROFESORES A CREAR/ACTUALIZAR: {len(profesores_unicos)}\n")
    
    # Profesores de Básica
    print("   📚 EDUCACIÓN BÁSICA (2 profesores nuevos):\n")
    for username, info in sorted(profesores_unicos.items()):
        if 'Básica' in info['nivel']:
            asigs_str = ', '.join(sorted(info['asignaturas']))
            print(f"      {info['nombre']}")
            print(f"      └─ Usuario: {username} / Contraseña: 1234")
            print(f"      └─ Asignaturas: {asigs_str}")
            print(f"      └─ Cubre: {len(info['cursos'])} cursos de Básica\n")
    
    # Profesores de Media
    print("   📖 EDUCACIÓN MEDIA (2 profesores nuevos/actualizados):\n")
    for username, info in sorted(profesores_unicos.items()):
        if 'Media' in info['nivel']:
            asigs_str = ', '.join(sorted(info['asignaturas']))
            cursos_str = ', '.join(sorted(info['cursos']))
            print(f"      {info['nombre']}")
            print(f"      └─ Usuario: {username} / Contraseña: 1234")
            print(f"      └─ Asignaturas: {asigs_str}")
            print(f"      └─ Cursos: {cursos_str}\n")
    
    # Desglose de asignaciones
    print("📊 DESGLOSE DE ASIGNACIONES:\n")
    
    basica_count = sum(1 for a in asignaciones if 'Básico' in a['course'])
    media_count = sum(1 for a in asignaciones if 'Medio' in a['course'])
    
    print(f"   Educación Básica:")
    print(f"      • 8 cursos × 2 secciones × 4 asignaturas = {basica_count}")
    print(f"\n   Educación Media:")
    print(f"      • HIS: 4 cursos × 2 secciones = 8")
    print(f"      • EDC: 4 cursos × 2 secciones = 8")
    print(f"      • FIL: 2 cursos × 2 secciones = 4")
    print(f"      • Total Media = {media_count}")
    print(f"\n   TOTAL: {len(asignaciones)} asignaciones\n")
    
    print("✅ RESULTADO ESPERADO DESPUÉS DE LA CARGA:\n")
    print("   Educación Básica:")
    print("      ✅ CNT (Ciencias Naturales) → Carlos Muñoz Silva")
    print("      ✅ HIS (Historia) → Carlos Muñoz Silva")
    print("      ✅ LEN (Lenguaje) → Andrea Soto Torres")
    print("      ✅ MAT (Matemáticas) → Andrea Soto Torres")
    print()
    print("   Educación Media:")
    print("      ✅ BIO (Biología) → Fernando Lagos Medina [YA EXISTE]")
    print("      ✅ FIS (Física) → Gloria Pinto Vidal [YA EXISTE]")
    print("      ✅ QUI (Química) → Héctor Moreno Ortiz [YA EXISTE]")
    print("      ✅ HIS (Historia) → Miguel Vargas Rojas [NUEVO]")
    print("      ✅ LEN (Lenguaje) → Patricia González Vega [YA EXISTE]")
    print("      ✅ MAT (Matemáticas) → Roberto Díaz Pérez [YA EXISTE]")
    print("      ✅ FIL (Filosofía) → Isabel Rojas Contreras [ACTUALIZADO: ahora todos los medios]")
    print("      ✅ EDC (Ed. Ciudadana) → Miguel Vargas Rojas [NUEVO]")
    print()
    
    print("📋 INSTRUCCIONES DE USO:\n")
    print("   Ve a: Admin → Configuración → Carga Masiva Excel")
    print(f"   Carga el archivo: {nombre_archivo}")
    print("   ✅ Se crearán 3 profesores nuevos + actualizará 1 existente\n")
    
    print("✨ ¡Generación completada exitosamente!")
    print("\n⚠️  IMPORTANTE: Este archivo complementa los profesores existentes.")
    print("   No elimina ni reemplaza las asignaciones actuales.")

if __name__ == '__main__':
    main()
