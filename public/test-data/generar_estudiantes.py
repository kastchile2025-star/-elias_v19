#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Estudiantes para Sistema Educativo Completo
Crea 45 estudiantes por sección para todos los cursos (1ro Básico a 4to Medio)
Total: 1,080 estudiantes (12 cursos × 2 secciones × 45 estudiantes)
"""

import csv

# Listas de nombres y apellidos chilenos comunes
NOMBRES = [
    "Sofía", "Matías", "Valentina", "Sebastián", "Isabella", "Benjamín",
    "Catalina", "Lucas", "Emilia", "Tomás", "Martina", "Agustín",
    "Antonia", "Felipe", "Josefa", "Vicente", "Amanda", "Nicolás",
    "Florencia", "Maximiliano", "Isidora", "Joaquín", "Renata", "Ignacio",
    "Colomba", "Gabriel", "Maite", "Samuel", "Trinidad", "Cristóbal",
    "Constanza", "Andrés", "Julieta", "Alonso", "Esperanza", "Martín",
    "Magdalena", "Eduardo", "Agustina", "Pedro", "Daniela", "Rodrigo",
    "Laura", "Gonzalo", "Francisca", "Bruno", "Camila", "Esteban",
    "Monserrat", "Damián", "Carolina", "Franco", "Elisa", "Gaspar",
    "Helena", "Ian", "Javiera", "Kevin", "Lorena", "Manuel",
    "Natalia", "Óscar", "Paula", "Quentin", "Rocío", "Santiago",
    "Tamara", "Ulises", "Valentina", "Walter", "Ximena", "Yolanda",
    "Zoe", "Amalia", "Boris", "Carla", "Daniel", "Elena",
    "Fabián", "Gisela", "Hugo", "Inés", "Julio", "Karina",
    "Leonardo", "Mariana", "Nicolás", "Olivia", "Pablo", "Rafaela"
]

APELLIDOS = [
    "González", "Rodríguez", "Pérez", "López", "Martínez", "Sánchez",
    "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz",
    "Hernández", "Muñoz", "Álvarez", "Romero", "Gutiérrez", "Castro",
    "Vargas", "Ramos", "Jiménez", "Morales", "Ortiz", "Silva",
    "Rojas", "Mendoza", "Núñez", "Vega", "Contreras", "Reyes",
    "Ruiz", "Soto", "Herrera", "Medina", "Aguilar", "Campos",
    "Parra", "Bravo", "Guerrero", "Fuentes", "Sepúlveda", "Tapia",
    "Vidal", "Valdés", "Salinas", "Cortés", "Figueroa", "Espinoza",
    "Carrasco", "Navarro", "Araya", "Jara", "Urrutia", "Pizarro"
]

# Definición de cursos
CURSOS = [
    "1ro Básico", "2do Básico", "3ro Básico", "4to Básico",
    "5to Básico", "6to Básico", "7mo Básico", "8vo Básico",
    "1ro Medio", "2do Medio", "3ro Medio", "4to Medio"
]

SECCIONES = ["A", "B"]
ESTUDIANTES_POR_SECCION = 45

def generar_rut(numero):
    """Genera un RUT válido con dígito verificador"""
    # Usar números base 11.xxx.xxx
    base = 11000000 + numero
    
    # Calcular dígito verificador
    multiplicadores = [2, 3, 4, 5, 6, 7]
    suma = 0
    rut_str = str(base)
    
    for i, digito in enumerate(reversed(rut_str)):
        suma += int(digito) * multiplicadores[i % 6]
    
    resto = suma % 11
    dv = 11 - resto
    
    if dv == 11:
        dv_str = "0"
    elif dv == 10:
        dv_str = "K"
    else:
        dv_str = str(dv)
    
    # Formatear RUT: 11.xxx.xxx-dv
    rut_formateado = f"{base:,}".replace(",", ".")
    return f"{rut_formateado}-{dv_str}"

def generar_estudiantes():
    """Genera la lista completa de estudiantes"""
    estudiantes = []
    contador = 1
    
    for curso_idx, curso in enumerate(CURSOS):
        for seccion in SECCIONES:
            for est_num in range(1, ESTUDIANTES_POR_SECCION + 1):
                # Alternar nombres para variedad
                nombre_idx = (contador - 1) % len(NOMBRES)
                apellido1_idx = (contador - 1) % len(APELLIDOS)
                apellido2_idx = ((contador - 1) + 13) % len(APELLIDOS)
                
                nombre_completo = f"{NOMBRES[nombre_idx]} {APELLIDOS[apellido1_idx]} {APELLIDOS[apellido2_idx]}"
                rut = generar_rut(contador)
                
                # Email basado en nombre y número
                email_base = NOMBRES[nombre_idx].lower().replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
                apellido_limpio = APELLIDOS[apellido1_idx].lower().replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
                email = f"{email_base}.{apellido_limpio}{contador:04d}@colegio.cl"
                
                # Generar username: primera letra del nombre + apellido + últimos 4 dígitos del RUT
                rut_numeros = rut.replace('.', '').replace('-', '')[:-1]  # Quitar dígito verificador
                ultimos_4 = rut_numeros[-4:]
                username = f"{email_base[0]}.{apellido_limpio}{ultimos_4}"
                
                estudiante = {
                    "role": "student",
                    "name": nombre_completo,
                    "rut": rut,
                    "email": email,
                    "username": username,
                    "password": "1234",
                    "course": curso,
                    "section": seccion,
                    "subjects": ""  # Vacío = todas las asignaturas
                }
                
                estudiantes.append(estudiante)
                contador += 1
    
    return estudiantes

def guardar_csv(estudiantes, nombre_archivo):
    """Guarda los estudiantes en un archivo CSV"""
    with open(nombre_archivo, 'w', newline='', encoding='utf-8') as archivo:
        campos = ["role", "name", "rut", "email", "username", "password", "course", "section", "subjects"]
        writer = csv.DictWriter(archivo, fieldnames=campos)
        
        writer.writeheader()
        writer.writerows(estudiantes)

def generar_resumen(estudiantes):
    """Genera un resumen de los estudiantes generados"""
    resumen = {}
    for est in estudiantes:
        clave = f"{est['course']} - {est['section']}"
        resumen[clave] = resumen.get(clave, 0) + 1
    
    print("\n" + "="*60)
    print("📊 RESUMEN DE ESTUDIANTES GENERADOS")
    print("="*60)
    
    for curso in CURSOS:
        print(f"\n{curso}:")
        for seccion in SECCIONES:
            clave = f"{curso} - {seccion}"
            count = resumen.get(clave, 0)
            print(f"  Sección {seccion}: {count} estudiantes")
    
    print(f"\n{'='*60}")
    print(f"TOTAL: {len(estudiantes)} estudiantes")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    print("🚀 Generando estudiantes para sistema completo...")
    
    estudiantes = generar_estudiantes()
    nombre_archivo = "estudiantes_sistema_completo.csv"
    
    guardar_csv(estudiantes, nombre_archivo)
    generar_resumen(estudiantes)
    
    print(f"✅ Archivo generado: {nombre_archivo}")
    print(f"📍 Total de estudiantes: {len(estudiantes)}")
    print(f"🎓 Cursos: {len(CURSOS)} (1ro Básico a 4to Medio)")
    print(f"📚 Secciones por curso: 2 (A y B)")
    print(f"👥 Estudiantes por sección: {ESTUDIANTES_POR_SECCION}")
