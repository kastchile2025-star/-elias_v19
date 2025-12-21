#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de profesores con asignaciones según reglas del sistema
- Cada profesor máximo 2 asignaturas
- Profesores de básica solo en básica
- Profesores de media solo en media
- Todas las asignaturas cubiertas
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

def generar_profesores_y_asignaciones():
    """Genera profesores respetando las reglas: max 2 asignaturas, separación básica/media"""
    
    # Nombres de profesores chilenos
    nombres = [
        'Roberto', 'Patricia', 'Carlos', 'Andrea', 'Miguel',
        'Lorena', 'Sergio', 'Mónica', 'Francisco', 'Claudia',
        'Fernando', 'Gloria', 'Héctor', 'Isabel', 'Juan',
        'María', 'Pedro', 'Carmen', 'Luis', 'Rosa'
    ]
    
    apellidos = [
        'Díaz', 'González', 'Muñoz', 'Soto', 'Vargas',
        'Campos', 'Herrera', 'Ramírez', 'Reyes', 'Flores',
        'Lagos', 'Pinto', 'Moreno', 'Rojas', 'Silva',
        'Torres', 'Pérez', 'Vega', 'Castro', 'Núñez'
    ]
    
    # Asignaturas de Educación Básica (4 asignaturas)
    asignaturas_basica = ['CNT', 'HIS', 'LEN', 'MAT']
    
    # Asignaturas de Educación Media (8 asignaturas)
    asignaturas_media = ['BIO', 'FIS', 'QUI', 'HIS', 'LEN', 'MAT', 'FIL', 'EDC']
    
    # Cursos
    cursos_basica = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
    ]
    
    cursos_media = ['1ro Medio', '2do Medio', '3ro Medio', '4to Medio']
    
    secciones = ['A', 'B']
    
    profesores = []
    asignaciones = []
    username_usado = set()
    
    def crear_username(nombre, apellido):
        """Crea un username único"""
        base = f"{nombre[0].lower()}.{apellido.lower()}"
        if base not in username_usado:
            username_usado.add(base)
            return base
        
        # Si ya existe, agregar número
        contador = 2
        while f"{base}{contador}" in username_usado:
            contador += 1
        username = f"{base}{contador}"
        username_usado.add(username)
        return username
    
    # PROFESORES DE EDUCACIÓN BÁSICA
    # Necesitamos cubrir 4 asignaturas: CNT, HIS, LEN, MAT
    # Con regla de máximo 2 asignaturas por profesor, necesitamos 2 profesores
    
    # Profesor 1 Básica: CNT, HIS
    nombre1 = random.choice(nombres)
    apellido1 = random.choice(apellidos)
    username1 = crear_username(nombre1, apellido1)
    
    profesor1 = {
        'role': 'teacher',
        'name': f"{nombre1} {apellido1} {random.choice(apellidos)}",
        'rut': generar_rut(),
        'email': f"{username1}@colegio.cl",
        'username': username1,
        'password': '1234',
        'course': '',
        'section': '',
        'subjects': 'CNT,HIS'
    }
    profesores.append(profesor1)
    
    # Crear asignaciones para profesor1 (CNT, HIS en todos los cursos de básica)
    for curso in cursos_basica:
        for seccion in secciones:
            for asignatura in ['CNT', 'HIS']:
                asignaciones.append({
                    'role': 'teacher',
                    'name': profesor1['name'],
                    'rut': profesor1['rut'],
                    'email': profesor1['email'],
                    'username': profesor1['username'],
                    'password': '1234',
                    'course': curso,
                    'section': seccion,
                    'subjects': asignatura
                })
    
    # Profesor 2 Básica: LEN, MAT
    nombre2 = random.choice([n for n in nombres if n != nombre1])
    apellido2 = random.choice([a for a in apellidos if a != apellido1])
    username2 = crear_username(nombre2, apellido2)
    
    profesor2 = {
        'role': 'teacher',
        'name': f"{nombre2} {apellido2} {random.choice([a for a in apellidos if a not in [apellido1, apellido2]])}",
        'rut': generar_rut(),
        'email': f"{username2}@colegio.cl",
        'username': username2,
        'password': '1234',
        'course': '',
        'section': '',
        'subjects': 'LEN,MAT'
    }
    profesores.append(profesor2)
    
    # Crear asignaciones para profesor2 (LEN, MAT en todos los cursos de básica)
    for curso in cursos_basica:
        for seccion in secciones:
            for asignatura in ['LEN', 'MAT']:
                asignaciones.append({
                    'role': 'teacher',
                    'name': profesor2['name'],
                    'rut': profesor2['rut'],
                    'email': profesor2['email'],
                    'username': profesor2['username'],
                    'password': '1234',
                    'course': curso,
                    'section': seccion,
                    'subjects': asignatura
                })
    
    # PROFESORES DE EDUCACIÓN MEDIA
    # Necesitamos cubrir 8 asignaturas: BIO, FIS, QUI, HIS, LEN, MAT, FIL, EDC
    # Con regla de máximo 2 asignaturas por profesor, necesitamos 4 profesores
    
    profesores_media_config = [
        ['BIO', 'FIS'],
        ['QUI', 'HIS'],
        ['LEN', 'MAT'],
        ['FIL', 'EDC']
    ]
    
    for asigs in profesores_media_config:
        nombre = random.choice([n for n in nombres if n not in [nombre1, nombre2]])
        apellido = random.choice([a for a in apellidos if a not in [apellido1, apellido2]])
        username = crear_username(nombre, apellido)
        
        profesor = {
            'role': 'teacher',
            'name': f"{nombre} {apellido} {random.choice(apellidos)}",
            'rut': generar_rut(),
            'email': f"{username}@colegio.cl",
            'username': username,
            'password': '1234',
            'course': '',
            'section': '',
            'subjects': ','.join(asigs)
        }
        profesores.append(profesor)
        
        # Crear asignaciones para este profesor de media
        for curso in cursos_media:
            for seccion in secciones:
                for asignatura in asigs:
                    asignaciones.append({
                        'role': 'teacher',
                        'name': profesor['name'],
                        'rut': profesor['rut'],
                        'email': profesor['email'],
                        'username': profesor['username'],
                        'password': '1234',
                        'course': curso,
                        'section': seccion,
                        'subjects': asignatura
                    })
    
    return profesores, asignaciones

def guardar_csv(datos, nombre_archivo):
    """Guarda los datos en formato CSV"""
    if len(datos) == 0:
        return
    
    with open(nombre_archivo, 'w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=datos[0].keys())
        writer.writeheader()
        writer.writerows(datos)

def main():
    print("🎓 GENERADOR DE PROFESORES Y ASIGNACIONES")
    print("=" * 60)
    print("\n📋 REGLAS APLICADAS:")
    print("   • Máximo 2 asignaturas por profesor")
    print("   • Profesores de básica solo en básica")
    print("   • Profesores de media solo en media")
    print("   • Todas las asignaturas cubiertas")
    print("   • Campo 'role' = 'teacher' en todas las filas\n")
    
    # Generar datos
    profesores, asignaciones = generar_profesores_y_asignaciones()
    
    # Guardar archivos
    nombre_archivo = 'profesores_asignaciones_completo.csv'
    guardar_csv(asignaciones, nombre_archivo)
    
    # Estadísticas
    print(f"\n✅ ARCHIVO GENERADO:\n")
    print(f"   📄 {nombre_archivo}")
    print(f"      └─ {len(asignaciones)} registros (asignaciones)\n")
    
    # Análisis de profesores
    profesores_unicos = {}
    for asig in asignaciones:
        username = asig['username']
        if username not in profesores_unicos:
            profesores_unicos[username] = {
                'nombre': asig['name'],
                'asignaturas': set(),
                'nivel': set()
            }
        profesores_unicos[username]['asignaturas'].add(asig['subjects'])
        
        if 'Básico' in asig['course']:
            profesores_unicos[username]['nivel'].add('Básica')
        else:
            profesores_unicos[username]['nivel'].add('Media')
    
    print(f"👨‍🏫 PROFESORES CREADOS: {len(profesores_unicos)}\n")
    
    # Profesores de Básica
    print("   📚 EDUCACIÓN BÁSICA (2 profesores):\n")
    for username, info in sorted(profesores_unicos.items()):
        if 'Básica' in info['nivel']:
            asigs_str = ', '.join(sorted(info['asignaturas']))
            print(f"      {info['nombre']}")
            print(f"      └─ Usuario: {username} / Contraseña: 1234")
            print(f"      └─ Asignaturas: {asigs_str}\n")
    
    # Profesores de Media
    print("   📖 EDUCACIÓN MEDIA (4 profesores):\n")
    for username, info in sorted(profesores_unicos.items()):
        if 'Media' in info['nivel']:
            asigs_str = ', '.join(sorted(info['asignaturas']))
            print(f"      {info['nombre']}")
            print(f"      └─ Usuario: {username} / Contraseña: 1234")
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
    print("✅ VERIFICACIÓN DE COBERTURA:\n")
    
    asignaturas_basica = {'CNT', 'HIS', 'LEN', 'MAT'}
    asignaturas_media = {'BIO', 'FIS', 'QUI', 'HIS', 'LEN', 'MAT', 'FIL', 'EDC'}
    
    asigs_cubiertas_basica = set()
    asigs_cubiertas_media = set()
    
    for asig in asignaciones:
        if 'Básico' in asig['course']:
            asigs_cubiertas_basica.add(asig['subjects'])
        else:
            asigs_cubiertas_media.add(asig['subjects'])
    
    print(f"   Básica - Requeridas: {sorted(asignaturas_basica)}")
    print(f"   Básica - Cubiertas:  {sorted(asigs_cubiertas_basica)}")
    print(f"   {'✅ TODAS CUBIERTAS' if asignaturas_basica == asigs_cubiertas_basica else '❌ FALTAN ASIGNATURAS'}\n")
    
    print(f"   Media - Requeridas: {sorted(asignaturas_media)}")
    print(f"   Media - Cubiertas:  {sorted(asigs_cubiertas_media)}")
    print(f"   {'✅ TODAS CUBIERTAS' if asignaturas_media == asigs_cubiertas_media else '❌ FALTAN ASIGNATURAS'}\n")
    
    print("📋 INSTRUCCIONES DE USO:\n")
    print("   Ve a: Admin → Configuración → Carga Masiva Excel")
    print(f"   Carga el archivo: {nombre_archivo}")
    print("   ✅ Se crearán 6 profesores con sus asignaciones\n")
    
    print("✨ ¡Generación completada exitosamente!")

if __name__ == '__main__':
    main()
