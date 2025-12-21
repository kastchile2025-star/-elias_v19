#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de profesores con MÁXIMO 4 CLASES
Cada clase = 1 curso + 1 sección + 1 asignatura
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

def generar_nombres():
    """Genera nombres aleatorios chilenos"""
    nombres = [
        'Roberto', 'Patricia', 'Carlos', 'Andrea', 'Miguel',
        'Lorena', 'Sergio', 'Mónica', 'Francisco', 'Claudia',
        'Fernando', 'Gloria', 'Héctor', 'Isabel', 'Juan',
        'María', 'Pedro', 'Carmen', 'Luis', 'Rosa',
        'Diego', 'Elena', 'Rodrigo', 'Valentina', 'Javier',
        'Carolina', 'Marcelo', 'Paulina', 'Andrés', 'Daniela',
        'Raúl', 'Sofía', 'Alejandro', 'Beatriz', 'Tomás'
    ]
    
    apellidos = [
        'Díaz', 'González', 'Muñoz', 'Soto', 'Vargas',
        'Campos', 'Herrera', 'Ramírez', 'Reyes', 'Flores',
        'Lagos', 'Pinto', 'Moreno', 'Rojas', 'Silva',
        'Torres', 'Pérez', 'Vega', 'Castro', 'Núñez',
        'Medina', 'Jiménez', 'Contreras', 'Ortiz', 'Gutiérrez',
        'Navarro', 'Fuentes', 'Espinoza', 'Sandoval', 'Bravo'
    ]
    
    nombre = random.choice(nombres)
    apellido1 = random.choice(apellidos)
    apellido2 = random.choice([a for a in apellidos if a != apellido1])
    
    return f"{nombre} {apellido1} {apellido2}", f"{nombre[0].lower()}.{apellido1.lower()}"

def generar_profesores_4_clases():
    """
    Genera profesores con restricción de MÁXIMO 4 CLASES
    Cada clase = 1 combinación de curso-sección-asignatura
    
    Estrategia: Cada profesor enseña 1 asignatura en 4 clases (2 cursos × 2 secciones)
    """
    
    # Cursos
    cursos_basica = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
    ]
    
    cursos_media = ['1ro Medio', '2do Medio', '3ro Medio', '4to Medio']
    
    secciones = ['A', 'B']
    
    # Asignaturas
    asignaturas_basica = ['CNT', 'HIS', 'LEN', 'MAT']
    asignaturas_media = ['BIO', 'FIS', 'QUI', 'HIS', 'LEN', 'MAT', 'FIL', 'EDC']
    
    profesores = []
    asignaciones = []
    usernames_usados = set()
    
    # EDUCACIÓN BÁSICA
    # 4 asignaturas × 8 cursos = 32 combinaciones asignatura-curso
    # Cada profesor: 1 asignatura en 2 cursos (4 clases: 2 cursos × 2 secciones)
    # Necesitamos: 32 / 2 = 16 profesores para Básica
    
    for asignatura in asignaturas_basica:
        # Cada asignatura necesita 4 profesores (8 cursos / 2 cursos por profesor)
        for i in range(4):
            cursos_asignados = cursos_basica[i*2:(i+1)*2]  # 2 cursos consecutivos
            
            nombre_completo, username_base = generar_nombres()
            
            # Asegurar username único
            username = username_base
            contador = 2
            while username in usernames_usados:
                username = f"{username_base}{contador}"
                contador += 1
            usernames_usados.add(username)
            
            profesor = {
                'nombre': nombre_completo,
                'username': username,
                'email': f"{username}@colegio.cl",
                'rut': generar_rut(),
                'asignatura': asignatura,
                'cursos': cursos_asignados,
                'nivel': 'basica',
                'clases': 4  # 2 cursos × 2 secciones = 4 clases
            }
            profesores.append(profesor)
            
            # Crear asignaciones: 1 asignatura, 2 cursos, 2 secciones = 4 clases
            for curso in cursos_asignados:
                for seccion in secciones:
                    asignaciones.append({
                        'role': 'teacher',
                        'name': profesor['nombre'],
                        'rut': profesor['rut'],
                        'email': profesor['email'],
                        'username': profesor['username'],
                        'password': '1234',
                        'course': curso,
                        'section': seccion,
                        'subjects': asignatura
                    })
    
    # EDUCACIÓN MEDIA
    # 8 asignaturas × 4 cursos = 32 combinaciones asignatura-curso
    # Cada profesor: 1 asignatura en 2 cursos (4 clases: 2 cursos × 2 secciones)
    # Necesitamos: 32 / 2 = 16 profesores para Media
    
    for asignatura in asignaturas_media:
        # Cada asignatura necesita 2 profesores (4 cursos / 2 cursos por profesor)
        for i in range(2):
            cursos_asignados = cursos_media[i*2:(i+1)*2]  # 2 cursos consecutivos
            
            nombre_completo, username_base = generar_nombres()
            
            username = username_base
            contador = 2
            while username in usernames_usados:
                username = f"{username_base}{contador}"
                contador += 1
            usernames_usados.add(username)
            
            profesor = {
                'nombre': nombre_completo,
                'username': username,
                'email': f"{username}@colegio.cl",
                'rut': generar_rut(),
                'asignatura': asignatura,
                'cursos': cursos_asignados,
                'nivel': 'media',
                'clases': 4  # 2 cursos × 2 secciones = 4 clases
            }
            profesores.append(profesor)
            
            # Crear asignaciones: 1 asignatura, 2 cursos, 2 secciones = 4 clases
            for curso in cursos_asignados:
                for seccion in secciones:
                    asignaciones.append({
                        'role': 'teacher',
                        'name': profesor['nombre'],
                        'rut': profesor['rut'],
                        'email': profesor['email'],
                        'username': profesor['username'],
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
    print("🎓 GENERADOR DE PROFESORES - MÁXIMO 4 CLASES")
    print("=" * 60)
    print("\n📋 RESTRICCIÓN:")
    print("   • Máximo 4 CLASES por profesor")
    print("   • Cada clase = 1 curso + 1 sección + 1 asignatura")
    print("   • Cada profesor: 1 asignatura en 2 cursos × 2 secciones\n")
    
    # Generar datos
    asignaciones, profesores = generar_profesores_4_clases()
    
    # Guardar archivo
    nombre_archivo = 'profesores_4_clases.csv'
    guardar_csv(asignaciones, nombre_archivo)
    
    # Estadísticas
    print(f"✅ ARCHIVO GENERADO:\n")
    print(f"   📄 {nombre_archivo}")
    print(f"      └─ {len(asignaciones)} asignaciones")
    print(f"      └─ {len(profesores)} profesores\n")
    
    # Separar por nivel
    profesores_basica = [p for p in profesores if p['nivel'] == 'basica']
    profesores_media = [p for p in profesores if p['nivel'] == 'media']
    
    print(f"👨‍🏫 TOTAL PROFESORES: {len(profesores)}\n")
    
    print(f"   📚 EDUCACIÓN BÁSICA: {len(profesores_basica)} profesores\n")
    
    # Agrupar por asignatura
    asignaturas_basica = {}
    for prof in profesores_basica:
        asig = prof['asignatura']
        if asig not in asignaturas_basica:
            asignaturas_basica[asig] = []
        asignaturas_basica[asig].append(prof)
    
    for asig, profs in sorted(asignaturas_basica.items()):
        print(f"      {asig}:")
        for prof in profs:
            cursos = ', '.join(prof['cursos'])
            print(f"         • {prof['nombre'][:25]:<25} ({prof['username']}) → {cursos}")
        print()
    
    print(f"   📖 EDUCACIÓN MEDIA: {len(profesores_media)} profesores\n")
    
    # Agrupar por asignatura
    asignaturas_media = {}
    for prof in profesores_media:
        asig = prof['asignatura']
        if asig not in asignaturas_media:
            asignaturas_media[asig] = []
        asignaturas_media[asig].append(prof)
    
    for asig, profs in sorted(asignaturas_media.items()):
        print(f"      {asig}:")
        for prof in profs:
            cursos = ', '.join(prof['cursos'])
            print(f"         • {prof['nombre'][:25]:<25} ({prof['username']}) → {cursos}")
        print()
    
    # Verificación
    print("📊 VERIFICACIÓN:\n")
    
    # Verificar que cada profesor tiene exactamente 4 clases
    clases_por_profesor = [p['clases'] for p in profesores]
    max_clases = max(clases_por_profesor)
    min_clases = min(clases_por_profesor)
    
    print(f"   ✅ Clases por profesor: {min_clases} - {max_clases} (límite: 4)")
    print(f"      Todos los profesores: 4 clases (2 cursos × 2 secciones)")
    
    # Verificar cobertura
    asigs_basica_cubiertas = set(p['asignatura'] for p in profesores_basica)
    asigs_media_cubiertas = set(p['asignatura'] for p in profesores_media)
    
    print(f"\n   ✅ Básica - Asignaturas cubiertas: {sorted(asigs_basica_cubiertas)}")
    print(f"   ✅ Media - Asignaturas cubiertas: {sorted(asigs_media_cubiertas)}\n")
    
    print("📋 INSTRUCCIONES:\n")
    print("   Ve a: Admin → Configuración → Carga Masiva Excel")
    print(f"   Carga: {nombre_archivo}\n")
    
    print("✨ ¡Generación completada!")

if __name__ == '__main__':
    main()
