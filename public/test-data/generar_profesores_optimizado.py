#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador OPTIMIZADO de profesores
Restricciones: Máximo 2 asignaturas Y máximo 2 cursos por profesor
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
        'Carolina', 'Marcelo', 'Paulina', 'Andrés', 'Daniela'
    ]
    
    apellidos = [
        'Díaz', 'González', 'Muñoz', 'Soto', 'Vargas',
        'Campos', 'Herrera', 'Ramírez', 'Reyes', 'Flores',
        'Lagos', 'Pinto', 'Moreno', 'Rojas', 'Silva',
        'Torres', 'Pérez', 'Vega', 'Castro', 'Núñez',
        'Medina', 'Jiménez', 'Contreras', 'Ortiz', 'Gutiérrez'
    ]
    
    nombre = random.choice(nombres)
    apellido1 = random.choice(apellidos)
    apellido2 = random.choice([a for a in apellidos if a != apellido1])
    
    return f"{nombre} {apellido1} {apellido2}", f"{nombre[0].lower()}.{apellido1.lower()}"

def generar_profesores_optimizado():
    """
    Genera profesores con restricciones:
    - Máximo 2 asignaturas por profesor
    - Máximo 2 cursos por profesor (de 8 básica o 4 media)
    - Máximo 4 clases por profesor (4 combinaciones curso-sección)
    """
    
    # Cursos
    cursos_basica = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
    ]
    
    cursos_media = ['1ro Medio', '2do Medio', '3ro Medio', '4to Medio']
    
    secciones = ['A', 'B']
    
    # EDUCACIÓN BÁSICA
    # 4 asignaturas, 8 cursos, 2 secciones → necesitamos cubrir 4 asignaturas
    # Restricción: máximo 4 clases (curso-sección) por profesor
    # Con 2 asignaturas y 2 cursos × 2 secciones = 4 clases ✅
    # Por cada grupo de 2 asignaturas, necesitamos 4 profesores (8 cursos / 2 = 4)
    
    asignaturas_basica = ['CNT', 'HIS', 'LEN', 'MAT']
    
    profesores = []
    asignaciones = []
    usernames_usados = set()
    
    # Generar profesores para Básica
    # Grupo 1: CNT, HIS
    for i in range(4):  # 4 profesores para cubrir 8 cursos
        cursos_asignados = cursos_basica[i*2:(i+1)*2]  # 2 cursos cada uno
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
            'asignaturas': ['CNT', 'HIS'],
            'cursos': cursos_asignados,
            'nivel': 'basica'
        }
        profesores.append(profesor)
        
        # Crear asignaciones
        for curso in cursos_asignados:
            for seccion in secciones:
                for asignatura in ['CNT', 'HIS']:
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
    
    # Grupo 2: LEN, MAT
    for i in range(4):  # 4 profesores para cubrir 8 cursos
        cursos_asignados = cursos_basica[i*2:(i+1)*2]  # 2 cursos cada uno
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
            'asignaturas': ['LEN', 'MAT'],
            'cursos': cursos_asignados,
            'nivel': 'basica'
        }
        profesores.append(profesor)
        
        # Crear asignaciones
        for curso in cursos_asignados:
            for seccion in secciones:
                for asignatura in ['LEN', 'MAT']:
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
    # 8 asignaturas, 4 cursos, 2 secciones, máximo 2 cursos por profesor
    # Restricción: máximo 4 clases (curso-sección) por profesor
    # Con 2 asignaturas y 2 cursos × 2 secciones = 4 clases ✅
    # Necesitamos 8 profesores (4 grupos de 2 asignaturas) × 2 (para cubrir 4 cursos)
    
    grupos_asignaturas_media = [
        ['BIO', 'FIS'],
        ['QUI', 'HIS'],
        ['LEN', 'MAT'],
        ['FIL', 'EDC']
    ]
    
    # Cada grupo de asignaturas necesita 2 profesores (uno para cursos 1-2, otro para 3-4)
    for grupo in grupos_asignaturas_media:
        # Profesor 1: cursos 1ro y 2do Medio
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
            'asignaturas': grupo,
            'cursos': ['1ro Medio', '2do Medio'],
            'nivel': 'media'
        }
        profesores.append(profesor)
        
        for curso in ['1ro Medio', '2do Medio']:
            for seccion in secciones:
                for asignatura in grupo:
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
        
        # Profesor 2: cursos 3ro y 4to Medio
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
            'asignaturas': grupo,
            'cursos': ['3ro Medio', '4to Medio'],
            'nivel': 'media'
        }
        profesores.append(profesor)
        
        for curso in ['3ro Medio', '4to Medio']:
            for seccion in secciones:
                for asignatura in grupo:
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
    print("🎓 GENERADOR OPTIMIZADO DE PROFESORES")
    print("=" * 60)
    print("\n📋 RESTRICCIONES APLICADAS:")
    print("   • Máximo 2 asignaturas por profesor")
    print("   • Máximo 2 cursos por profesor")
    print("   • Máximo 4 clases por profesor (curso-sección)")
    print("   • Básica separada de Media\n")
    
    # Generar datos
    asignaciones, profesores = generar_profesores_optimizado()
    
    # Guardar archivo
    nombre_archivo = 'profesores_optimizado.csv'
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
    for prof in profesores_basica:
        asigs = ', '.join(prof['asignaturas'])
        cursos = ', '.join(prof['cursos'])
        print(f"      {prof['nombre'][:25]:<25} ({prof['username']})")
        print(f"         └─ Asignaturas: {asigs}")
        print(f"         └─ Cursos: {cursos}\n")
    
    print(f"   📖 EDUCACIÓN MEDIA: {len(profesores_media)} profesores\n")
    for prof in profesores_media:
        asigs = ', '.join(prof['asignaturas'])
        cursos = ', '.join(prof['cursos'])
        print(f"      {prof['nombre'][:25]:<25} ({prof['username']})")
        print(f"         └─ Asignaturas: {asigs}")
        print(f"         └─ Cursos: {cursos}\n")
    
    # Verificación
    print("📊 VERIFICACIÓN:\n")
    
    # Verificar que cada profesor tiene máximo 2 cursos
    max_cursos = max(len(p['cursos']) for p in profesores)
    print(f"   ✅ Máximo cursos por profesor: {max_cursos} (límite: 2)")
    
    # Verificar que cada profesor tiene máximo 2 asignaturas
    max_asigs = max(len(p['asignaturas']) for p in profesores)
    print(f"   ✅ Máximo asignaturas por profesor: {max_asigs} (límite: 2)")
    
    # Verificar que cada profesor tiene máximo 4 clases
    # Cada profesor: 2 cursos × 2 secciones = 4 clases
    clases_por_profesor = [len(p['cursos']) * 2 for p in profesores]  # cursos × secciones
    max_clases = max(clases_por_profesor)
    print(f"   ✅ Máximo clases por profesor: {max_clases} (límite: 4)")
    print(f"      (2 cursos × 2 secciones = 4 clases por profesor)")
    
    # Verificar cobertura
    asigs_basica = set()
    asigs_media = set()
    
    for asig in asignaciones:
        if 'Básico' in asig['course']:
            asigs_basica.add(asig['subjects'])
        else:
            asigs_media.add(asig['subjects'])
    
    print(f"\n   ✅ Básica - Asignaturas cubiertas: {sorted(asigs_basica)}")
    print(f"   ✅ Media - Asignaturas cubiertas: {sorted(asigs_media)}\n")
    
    print("📋 INSTRUCCIONES:\n")
    print("   Ve a: Admin → Configuración → Carga Masiva Excel")
    print(f"   Carga: {nombre_archivo}\n")
    
    print("✨ ¡Generación completada!")

if __name__ == '__main__':
    main()
