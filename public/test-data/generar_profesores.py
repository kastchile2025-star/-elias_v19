#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Profesores para Sistema Educativo Completo
Crea profesores para todas las asignaturas y los asigna a todos los cursos y secciones
"""

import csv

# Definición de profesores por asignatura
PROFESORES = [
    {
        "name": "Roberto Díaz Pérez",
        "rut": "15.000.001-6",
        "email": "roberto.diaz@colegio.cl",
        "username": "r.diaz",
        "subject": "MAT",
        "subject_name": "Matemáticas"
    },
    {
        "name": "Patricia González Vega",
        "rut": "15.000.002-4",
        "email": "patricia.gonzalez@colegio.cl",
        "username": "p.gonzalez",
        "subject": "LEN",
        "subject_name": "Lenguaje y Comunicación"
    },
    {
        "name": "Carlos Muñoz Silva",
        "rut": "15.000.003-2",
        "email": "carlos.munoz@colegio.cl",
        "username": "c.munoz",
        "subject": "CNT",
        "subject_name": "Ciencias Naturales"
    },
    {
        "name": "Andrea Soto Torres",
        "rut": "15.000.004-0",
        "email": "andrea.soto@colegio.cl",
        "username": "a.soto",
        "subject": "HIST",
        "subject_name": "Historia, Geografía y Ciencias Sociales"
    },
    {
        "name": "Miguel Vargas Rojas",
        "rut": "15.000.005-9",
        "email": "miguel.vargas@colegio.cl",
        "username": "m.vargas",
        "subject": "ING",
        "subject_name": "Inglés"
    },
    {
        "name": "Lorena Campos Morales",
        "rut": "15.000.006-7",
        "email": "lorena.campos@colegio.cl",
        "username": "l.campos",
        "subject": "EFI",
        "subject_name": "Educación Física y Salud"
    },
    {
        "name": "Sergio Herrera Castro",
        "rut": "15.000.007-5",
        "email": "sergio.herrera@colegio.cl",
        "username": "s.herrera",
        "subject": "MUS",
        "subject_name": "Música"
    },
    {
        "name": "Mónica Ramírez Núñez",
        "rut": "15.000.008-3",
        "email": "monica.ramirez@colegio.cl",
        "username": "m.ramirez",
        "subject": "ART",
        "subject_name": "Artes Visuales"
    },
    {
        "name": "Francisco Reyes Jiménez",
        "rut": "15.000.009-1",
        "email": "francisco.reyes@colegio.cl",
        "username": "f.reyes",
        "subject": "TEC",
        "subject_name": "Tecnología"
    },
    {
        "name": "Claudia Flores Paredes",
        "rut": "15.000.010-5",
        "email": "claudia.flores@colegio.cl",
        "username": "c.flores",
        "subject": "REL",
        "subject_name": "Religión"
    }
]

# Profesores adicionales para Enseñanza Media (asignaturas especializadas)
PROFESORES_MEDIA = [
    {
        "name": "Fernando Lagos Medina",
        "rut": "15.000.011-3",
        "email": "fernando.lagos@colegio.cl",
        "username": "f.lagos",
        "subject": "BIO",
        "subject_name": "Biología",
        "cursos": ["1ro Medio", "2do Medio", "3ro Medio", "4to Medio"]
    },
    {
        "name": "Gloria Pinto Vidal",
        "rut": "15.000.012-1",
        "email": "gloria.pinto@colegio.cl",
        "username": "g.pinto",
        "subject": "FIS",
        "subject_name": "Física",
        "cursos": ["1ro Medio", "2do Medio", "3ro Medio", "4to Medio"]
    },
    {
        "name": "Héctor Moreno Ortiz",
        "rut": "15.000.013-K",
        "email": "hector.moreno@colegio.cl",
        "username": "h.moreno",
        "subject": "QUI",
        "subject_name": "Química",
        "cursos": ["1ro Medio", "2do Medio", "3ro Medio", "4to Medio"]
    },
    {
        "name": "Isabel Rojas Contreras",
        "rut": "15.000.014-8",
        "email": "isabel.rojas@colegio.cl",
        "username": "i.rojas",
        "subject": "FIL",
        "subject_name": "Filosofía",
        "cursos": ["3ro Medio", "4to Medio"]
    }
]

# Definición de cursos
CURSOS_BASICA = [
    "1ro Básico", "2do Básico", "3ro Básico", "4to Básico",
    "5to Básico", "6to Básico", "7mo Básico", "8vo Básico"
]

CURSOS_MEDIA = [
    "1ro Medio", "2do Medio", "3ro Medio", "4to Medio"
]

TODOS_CURSOS = CURSOS_BASICA + CURSOS_MEDIA
SECCIONES = ["A", "B"]

def generar_asignaciones_profesores():
    """Genera todas las asignaciones de profesores"""
    asignaciones = []
    
    # Profesores que enseñan en TODOS los cursos (Básica y Media)
    for profesor in PROFESORES:
        for curso in TODOS_CURSOS:
            for seccion in SECCIONES:
                asignacion = {
                    "role": "teacher",
                    "name": profesor["name"],
                    "rut": profesor["rut"],
                    "email": profesor["email"],
                    "username": profesor["username"],
                    "password": "1234",
                    "course": curso,
                    "section": seccion,
                    "subjects": profesor["subject"]
                }
                asignaciones.append(asignacion)
    
    # Profesores especializados de Media
    for profesor in PROFESORES_MEDIA:
        cursos_asignados = profesor.get("cursos", CURSOS_MEDIA)
        for curso in cursos_asignados:
            for seccion in SECCIONES:
                asignacion = {
                    "role": "teacher",
                    "name": profesor["name"],
                    "rut": profesor["rut"],
                    "email": profesor["email"],
                    "username": profesor["username"],
                    "password": "1234",
                    "course": curso,
                    "section": seccion,
                    "subjects": profesor["subject"]
                }
                asignaciones.append(asignacion)
    
    return asignaciones

def guardar_csv(asignaciones, nombre_archivo):
    """Guarda las asignaciones en un archivo CSV"""
    with open(nombre_archivo, 'w', newline='', encoding='utf-8') as archivo:
        campos = ["role", "name", "rut", "email", "username", "password", "course", "section", "subjects"]
        writer = csv.DictWriter(archivo, fieldnames=campos)
        
        writer.writeheader()
        writer.writerows(asignaciones)

def generar_resumen(asignaciones):
    """Genera un resumen de las asignaciones"""
    profesores_unicos = set()
    asignaciones_por_profesor = {}
    
    for asig in asignaciones:
        profesores_unicos.add(asig["username"])
        if asig["username"] not in asignaciones_por_profesor:
            asignaciones_por_profesor[asig["username"]] = {
                "name": asig["name"],
                "subject": asig["subjects"],
                "count": 0
            }
        asignaciones_por_profesor[asig["username"]]["count"] += 1
    
    print("\n" + "="*70)
    print("👨‍🏫 RESUMEN DE PROFESORES Y ASIGNACIONES")
    print("="*70)
    
    print(f"\nTotal de profesores: {len(profesores_unicos)}")
    print(f"Total de asignaciones: {len(asignaciones)}\n")
    
    print("Detalle por profesor:")
    print("-" * 70)
    
    for username in sorted(asignaciones_por_profesor.keys()):
        info = asignaciones_por_profesor[username]
        print(f"  {info['name']:<30} | {info['subject']:<6} | {info['count']:>3} asignaciones")
    
    print("="*70)
    
    # Resumen por tipo de cursos
    asig_basica = sum(1 for a in asignaciones if a["course"] in CURSOS_BASICA)
    asig_media = sum(1 for a in asignaciones if a["course"] in CURSOS_MEDIA)
    
    print(f"\nAsignaciones en Enseñanza Básica: {asig_basica}")
    print(f"Asignaciones en Enseñanza Media: {asig_media}")
    print(f"\nCursos cubiertos: {len(TODOS_CURSOS)}")
    print(f"Secciones por curso: {len(SECCIONES)}")
    print("="*70 + "\n")

if __name__ == "__main__":
    print("🚀 Generando asignaciones de profesores para sistema completo...")
    
    asignaciones = generar_asignaciones_profesores()
    nombre_archivo = "profesores_sistema_completo.csv"
    
    guardar_csv(asignaciones, nombre_archivo)
    generar_resumen(asignaciones)
    
    print(f"✅ Archivo generado: {nombre_archivo}")
    print(f"📊 Profesores únicos: {len(PROFESORES) + len(PROFESORES_MEDIA)}")
    print(f"📚 Total de asignaciones: {len(asignaciones)}")
