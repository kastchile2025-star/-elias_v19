#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de asignaciones de profesores para todas las asignaturas
Compatible con carga masiva Excel de SmartStudent v16
"""

import csv
import random

def generar_rut():
    """Genera un RUT chileno válido con dígito verificador"""
    base = random.randint(10000000, 25999999)
    
    # Calcular dígito verificador usando módulo 11
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
    
    # Formatear con puntos y guión
    rut_str = f"{base:,}".replace(',', '.')
    return f"{rut_str}-{dv_str}"

def generar_asignaciones():
    """Genera todas las asignaciones profesor-curso-sección-asignatura"""
    
    # Definir profesores por asignatura
    profesores = {
        'CNT': {
            'nombre': 'Carlos Muñoz Silva',
            'username': 'c.munoz',
            'email': 'carlos.munoz@smartstudent.cl',
            'rut': generar_rut()
        },
        'HIS': {
            'nombre': 'Andrea Soto Torres', 
            'username': 'a.soto',
            'email': 'andrea.soto@smartstudent.cl',
            'rut': generar_rut()
        },
        'LEN': {
            'nombre': 'Patricia González Vega',
            'username': 'p.gonzalez',
            'email': 'patricia.gonzalez@smartstudent.cl',
            'rut': generar_rut()
        },
        'MAT': {
            'nombre': 'Roberto Díaz Pérez',
            'username': 'r.diaz',
            'email': 'roberto.diaz@smartstudent.cl',
            'rut': generar_rut()
        },
        'BIO': {
            'nombre': 'Fernando Lagos Medina',
            'username': 'f.lagos',
            'email': 'fernando.lagos@smartstudent.cl',
            'rut': generar_rut()
        },
        'FIS': {
            'nombre': 'Gloria Pinto Vidal',
            'username': 'g.pinto',
            'email': 'gloria.pinto@smartstudent.cl',
            'rut': generar_rut()
        },
        'QUI': {
            'nombre': 'Héctor Moreno Ortiz',
            'username': 'h.moreno',
            'email': 'hector.moreno@smartstudent.cl',
            'rut': generar_rut()
        },
        'FIL': {
            'nombre': 'Isabel Rojas Contreras',
            'username': 'i.rojas',
            'email': 'isabel.rojas@smartstudent.cl',
            'rut': generar_rut()
        },
        'EDC': {
            'nombre': 'Miguel Vargas Rojas',
            'username': 'm.vargas',
            'email': 'miguel.vargas@smartstudent.cl',
            'rut': generar_rut()
        }
    }
    
    # Cursos de Educación Básica (4 asignaturas)
    cursos_basica = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
    ]
    
    asignaturas_basica = ['CNT', 'HIS', 'LEN', 'MAT']
    
    # Cursos de Educación Media (8 asignaturas)
    cursos_media = ['1ro Medio', '2do Medio', '3ro Medio', '4to Medio']
    
    asignaturas_media = ['BIO', 'FIS', 'QUI', 'HIS', 'LEN', 'MAT', 'FIL', 'EDC']
    
    # Secciones
    secciones = ['A', 'B']
    
    asignaciones = []
    
    # Generar asignaciones para Educación Básica
    for curso in cursos_basica:
        for seccion in secciones:
            for asignatura in asignaturas_basica:
                profesor = profesores[asignatura]
                asignaciones.append({
                    'teacherUsername': profesor['username'],
                    'teacherEmail': profesor['email'],
                    'course': curso,
                    'section': seccion,
                    'subjects': asignatura
                })
    
    # Generar asignaciones para Educación Media
    for curso in cursos_media:
        for seccion in secciones:
            for asignatura in asignaturas_media:
                profesor = profesores[asignatura]
                asignaciones.append({
                    'teacherUsername': profesor['username'],
                    'teacherEmail': profesor['email'],
                    'course': curso,
                    'section': seccion,
                    'subjects': asignatura
                })
    
    return asignaciones, profesores

def guardar_csv_asignaciones(asignaciones, nombre_archivo):
    """Guarda las asignaciones en formato CSV para carga masiva"""
    with open(nombre_archivo, 'w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=[
            'teacherUsername',
            'teacherEmail', 
            'course',
            'section',
            'subjects'
        ])
        
        writer.writeheader()
        writer.writerows(asignaciones)

def guardar_csv_profesores(profesores, nombre_archivo):
    """Guarda los profesores en formato CSV para crear usuarios"""
    registros = []
    
    for codigo, datos in profesores.items():
        registros.append({
            'role': 'profesor',
            'name': datos['nombre'],
            'rut': datos['rut'],
            'email': datos['email'],
            'username': datos['username'],
            'password': '1234',
            'course': '',  # Vacío para profesores
            'section': '',  # Vacío para profesores
            'subjects': ''  # Se asigna después con el CSV de asignaciones
        })
    
    with open(nombre_archivo, 'w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=[
            'role', 'name', 'rut', 'email', 'username', 'password',
            'course', 'section', 'subjects'
        ])
        
        writer.writeheader()
        writer.writerows(registros)

def main():
    print("🎓 GENERADOR DE ASIGNACIONES DE PROFESORES")
    print("=" * 60)
    
    # Generar asignaciones
    asignaciones, profesores = generar_asignaciones()
    
    # Guardar CSV de asignaciones
    nombre_asignaciones = 'asignaciones_profesores.csv'
    guardar_csv_asignaciones(asignaciones, nombre_asignaciones)
    
    # Guardar CSV de profesores (para crear usuarios si no existen)
    nombre_profesores = 'profesores_nuevos.csv'
    guardar_csv_profesores(profesores, nombre_profesores)
    
    # Estadísticas
    print(f"\n✅ ARCHIVOS GENERADOS:\n")
    print(f"   📄 {nombre_asignaciones}")
    print(f"      └─ {len(asignaciones)} asignaciones")
    print(f"\n   📄 {nombre_profesores}")
    print(f"      └─ {len(profesores)} profesores\n")
    
    print("📊 DESGLOSE DE ASIGNACIONES:\n")
    
    # Contar por curso
    basica_count = sum(1 for a in asignaciones if 'Básico' in a['course'])
    media_count = sum(1 for a in asignaciones if 'Medio' in a['course'])
    
    print(f"   Educación Básica:")
    print(f"      • 8 cursos × 2 secciones × 4 asignaturas = {basica_count}")
    print(f"\n   Educación Media:")
    print(f"      • 4 cursos × 2 secciones × 8 asignaturas = {media_count}")
    print(f"\n   TOTAL: {len(asignaciones)} asignaciones\n")
    
    print("👨‍🏫 PROFESORES CREADOS:\n")
    for codigo, datos in sorted(profesores.items()):
        print(f"   {codigo} - {datos['nombre']}")
        print(f"      └─ Usuario: {datos['username']} / Contraseña: 1234\n")
    
    print("📋 INSTRUCCIONES DE USO:\n")
    print("   1️⃣  CREAR PROFESORES (si no existen):")
    print("       Admin → Configuración → Carga Masiva Excel")
    print(f"       └─ Cargar: {nombre_profesores}\n")
    print("   2️⃣  ASIGNAR PROFESORES A ASIGNATURAS:")
    print("       Admin → Configuración → Carga Masiva Asignaciones Profesores")
    print(f"       └─ Cargar: {nombre_asignaciones}\n")
    print("   3️⃣  VERIFICAR:")
    print("       Admin → Gestión de Usuarios → Asignaciones")
    print("       └─ Todas las asignaturas deben tener profesor asignado\n")
    
    print("✨ ¡Generación completada exitosamente!")

if __name__ == '__main__':
    main()
