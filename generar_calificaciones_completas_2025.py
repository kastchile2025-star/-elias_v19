#!/usr/bin/env python3
"""
Generador de Calificaciones Completas 2025
Crea un archivo CSV con 10 actividades evaluativas por asignatura para cada estudiante
- 1080 estudiantes (45 por sección × 2 secciones × 12 cursos)
- Distribución: 1ro Básico a 4to Medio
- Fechas: Marzo a Diciembre 2025 (ambos semestres)
"""

import csv
import random
from datetime import datetime, timedelta

# ============================================
# CONFIGURACIÓN
# ============================================

# Cursos del sistema
CURSOS_BASICA = [
    '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
    '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
]

CURSOS_MEDIA = [
    '1ro Medio', '2do Medio', '3ro Medio', '4to Medio'
]

SECCIONES = ['A', 'B']
ESTUDIANTES_POR_SECCION = 45

# Asignaturas por nivel (según constants.ts)
ASIGNATURAS_BASICA = [
    'Matemáticas',
    'Lenguaje y Comunicación',
    'Ciencias Naturales',
    'Historia, Geografía y Ciencias Sociales'
]

ASIGNATURAS_MEDIA = [
    'Matemáticas',
    'Lenguaje y Comunicación',
    'Biología',
    'Física',
    'Química',
    'Historia, Geografía y Ciencias Sociales',
    'Filosofía',
    'Educación Ciudadana'
]

# Profesores por asignatura
PROFESORES = {
    'Matemáticas': ['Roberto Díaz Fuentes', 'María López García', 'Pedro Rodríguez Silva'],
    'Lenguaje y Comunicación': ['Paula González Martínez', 'Carmen López Valenzuela', 'Juan García Torres', 'Sofía Martínez Vega'],
    'Ciencias Naturales': ['Claudia Muñoz Ramírez', 'Valentina Torres Díaz', 'Diego Morales Soto', 'Catalina Reyes Guzmán'],
    'Historia, Geografía y Ciencias Sociales': ['Andrea Soto Parra', 'Gabriela Sánchez Rojas', 'Roberto Fernández Castro', 'Carlos Herrera Núñez'],
    'Biología': ['Francisco Lagos Bravo', 'Valentina Torres Díaz', 'Diego Morales Soto'],
    'Física': ['Gabriela Pinto Moreno', 'Pedro Rodríguez Silva', 'Roberto Díaz Fuentes'],
    'Química': ['Hugo Moreno Vega', 'Claudia Muñoz Ramírez', 'Catalina Reyes Guzmán'],
    'Filosofía': ['Isabel Rojas Contreras', 'Andrea Soto Parra', 'Carlos Herrera Núñez'],
    'Educación Ciudadana': ['Miguel Vargas Rojas', 'Andrea Soto Parra', 'Gabriela Sánchez Rojas']
}

# Tipos de evaluación
TIPOS_EVALUACION = ['tarea', 'prueba', 'evaluacion']

# Rango de fechas por semestre
SEMESTRE_1_INICIO = datetime(2025, 3, 1)
SEMESTRE_1_FIN = datetime(2025, 6, 30)
SEMESTRE_2_INICIO = datetime(2025, 7, 1)
SEMESTRE_2_FIN = datetime(2025, 12, 31)

# ============================================
# GENERADORES DE DATOS
# ============================================

def generar_nombre_estudiante(num_estudiante):
    """Genera nombre único para estudiante"""
    nombres = ['Sofía', 'Mateo', 'Valentina', 'Sebastián', 'Isabella', 'Benjamín', 
               'Martina', 'Lucas', 'Emilia', 'Joaquín', 'Catalina', 'Diego',
               'Antonella', 'Nicolás', 'Florencia', 'Gabriel', 'Renata', 'Tomás',
               'Amanda', 'Samuel', 'Javiera', 'Felipe', 'Isidora', 'Agustín',
               'Constanza', 'Maximiliano', 'Trinidad', 'Vicente', 'Josefa', 'Cristóbal',
               'Maite', 'Dante', 'Antonia', 'Ignacio', 'Emma', 'Matías',
               'Colomba', 'Martín', 'Julieta', 'Santiago', 'Magdalena', 'Franco',
               'Amparo', 'Leonardo', 'Rafaela']
    
    apellidos = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'García',
                 'Sánchez', 'Pérez', 'Ramírez', 'Torres', 'Flores', 'Rivera',
                 'Gómez', 'Díaz', 'Reyes', 'Muñoz', 'Rojas', 'Morales',
                 'Contreras', 'Silva', 'Castro', 'Vargas', 'Gutiérrez', 'Herrera']
    
    idx_nombre = num_estudiante % len(nombres)
    idx_apellido1 = (num_estudiante // len(nombres)) % len(apellidos)
    idx_apellido2 = (num_estudiante // (len(nombres) * len(apellidos))) % len(apellidos)
    
    return f"{nombres[idx_nombre]} {apellidos[idx_apellido1]} {apellidos[idx_apellido2]}"

def generar_rut(num_estudiante):
    """Genera RUT único para estudiante"""
    base = 10000000 + num_estudiante
    # Calcular dígito verificador
    rut_str = str(base)
    suma = 0
    multiplo = 2
    for d in reversed(rut_str):
        suma += int(d) * multiplo
        multiplo += 1
        if multiplo > 7:
            multiplo = 2
    resto = suma % 11
    dv = 11 - resto
    if dv == 11:
        dv_str = '0'
    elif dv == 10:
        dv_str = 'K'
    else:
        dv_str = str(dv)
    
    return f"{base}-{dv_str}"

def generar_fecha_aleatoria(inicio, fin, fechas_usadas=None):
    """
    Genera fecha aleatoria entre inicio y fin
    Si se proporciona fechas_usadas, evita duplicados
    """
    if fechas_usadas is None:
        delta = fin - inicio
        dias_random = random.randint(0, delta.days)
        return inicio + timedelta(days=dias_random)
    
    # Intentar hasta 100 veces encontrar una fecha única
    for _ in range(100):
        delta = fin - inicio
        dias_random = random.randint(0, delta.days)
        fecha = inicio + timedelta(days=dias_random)
        fecha_str = fecha.strftime('%Y-%m-%d')
        
        if fecha_str not in fechas_usadas:
            fechas_usadas.add(fecha_str)
            return fecha
    
    # Si no se encuentra única, incrementar secuencialmente
    fecha = inicio
    while True:
        fecha_str = fecha.strftime('%Y-%m-%d')
        if fecha_str not in fechas_usadas:
            fechas_usadas.add(fecha_str)
            return fecha
        fecha += timedelta(days=1)

def generar_nota():
    """Genera nota entre 60 y 100 (sistema chileno simulado)"""
    return random.randint(60, 100)

def generar_actividades_para_asignatura(estudiante_nombre, estudiante_rut, curso, seccion, asignatura):
    """
    Genera 10 actividades evaluativas para una asignatura específica
    5 en primer semestre (marzo-junio) y 5 en segundo semestre (julio-diciembre)
    Cada actividad tiene fecha y tipo únicos para este estudiante-asignatura
    """
    actividades = []
    profesor_lista = PROFESORES.get(asignatura, ['Profesor General'])
    
    # Rastrear fechas usadas para esta combinación estudiante-asignatura-tipo
    fechas_usadas_sem1 = set()
    fechas_usadas_sem2 = set()
    
    # 5 actividades primer semestre
    for i in range(5):
        actividad = {
            'Nombre': estudiante_nombre,
            'RUT': estudiante_rut,
            'Curso': curso,
            'Sección': seccion,
            'Asignatura': asignatura,
            'Profesor': random.choice(profesor_lista),
            'Fecha': generar_fecha_aleatoria(SEMESTRE_1_INICIO, SEMESTRE_1_FIN, fechas_usadas_sem1).strftime('%Y-%m-%d'),
            'Tipo': random.choice(TIPOS_EVALUACION),
            'Nota': generar_nota()
        }
        actividades.append(actividad)
    
    # 5 actividades segundo semestre
    for i in range(5):
        actividad = {
            'Nombre': estudiante_nombre,
            'RUT': estudiante_rut,
            'Curso': curso,
            'Sección': seccion,
            'Asignatura': asignatura,
            'Profesor': random.choice(profesor_lista),
            'Fecha': generar_fecha_aleatoria(SEMESTRE_2_INICIO, SEMESTRE_2_FIN, fechas_usadas_sem2).strftime('%Y-%m-%d'),
            'Tipo': random.choice(TIPOS_EVALUACION),
            'Nota': generar_nota()
        }
        actividades.append(actividad)
    
    return actividades

# ============================================
# GENERACIÓN PRINCIPAL
# ============================================

def generar_csv_completo():
    """Genera el archivo CSV completo con todas las calificaciones"""
    
    archivo_salida = 'public/test-data/grades-consolidated-2025-COMPLETO.csv'
    
    print("🚀 GENERADOR DE CALIFICACIONES 2025")
    print("=" * 60)
    print(f"\n📊 CONFIGURACIÓN:")
    print(f"   • Cursos Básica: {len(CURSOS_BASICA)} (1ro a 8vo)")
    print(f"   • Cursos Media: {len(CURSOS_MEDIA)} (1ro a 4to)")
    print(f"   • Secciones por curso: {len(SECCIONES)} (A, B)")
    print(f"   • Estudiantes por sección: {ESTUDIANTES_POR_SECCION}")
    print(f"   • Total estudiantes: {(len(CURSOS_BASICA) + len(CURSOS_MEDIA)) * len(SECCIONES) * ESTUDIANTES_POR_SECCION}")
    print(f"   • Asignaturas Básica: {len(ASIGNATURAS_BASICA)}")
    print(f"   • Asignaturas Media: {len(ASIGNATURAS_MEDIA)}")
    print(f"   • Actividades por asignatura: 10 (5 por semestre)")
    
    # Calcular total de registros
    total_basica = len(CURSOS_BASICA) * len(SECCIONES) * ESTUDIANTES_POR_SECCION * len(ASIGNATURAS_BASICA) * 10
    total_media = len(CURSOS_MEDIA) * len(SECCIONES) * ESTUDIANTES_POR_SECCION * len(ASIGNATURAS_MEDIA) * 10
    total_registros = total_basica + total_media
    
    print(f"\n📝 REGISTROS A GENERAR:")
    print(f"   • Educación Básica: {total_basica:,}")
    print(f"   • Educación Media: {total_media:,}")
    print(f"   • TOTAL: {total_registros:,}")
    
    print(f"\n⏳ Generando archivo: {archivo_salida}")
    print("   Esto puede tomar unos minutos...\n")
    
    with open(archivo_salida, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Nombre', 'RUT', 'Curso', 'Sección', 'Asignatura', 'Profesor', 'Fecha', 'Tipo', 'Nota']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        
        num_estudiante_global = 0
        registros_escritos = 0
        
        # Procesar todos los cursos
        todos_cursos = CURSOS_BASICA + CURSOS_MEDIA
        
        for curso in todos_cursos:
            es_basica = curso in CURSOS_BASICA
            asignaturas = ASIGNATURAS_BASICA if es_basica else ASIGNATURAS_MEDIA
            
            print(f"📚 Procesando {curso}...")
            
            for seccion in SECCIONES:
                print(f"   └─ Sección {seccion}: ", end='', flush=True)
                
                for i in range(ESTUDIANTES_POR_SECCION):
                    num_estudiante_global += 1
                    nombre = generar_nombre_estudiante(num_estudiante_global)
                    rut = generar_rut(num_estudiante_global)
                    
                    # Generar actividades para todas las asignaturas del estudiante
                    for asignatura in asignaturas:
                        actividades = generar_actividades_para_asignatura(
                            nombre, rut, curso, seccion, asignatura
                        )
                        
                        for actividad in actividades:
                            writer.writerow(actividad)
                            registros_escritos += 1
                    
                    # Progreso
                    if (i + 1) % 15 == 0:
                        print(f"{i + 1} estudiantes...", end=' ', flush=True)
                
                print("✅")
        
        print(f"\n✅ GENERACIÓN COMPLETADA")
        print("=" * 60)
        print(f"📁 Archivo: {archivo_salida}")
        print(f"📊 Estudiantes generados: {num_estudiante_global}")
        print(f"📝 Registros escritos: {registros_escritos:,}")
        print(f"✨ Promedio por estudiante: {registros_escritos // num_estudiante_global} evaluaciones")
        
        # Verificación
        print(f"\n🔍 VERIFICACIÓN:")
        registros_esperados = total_registros
        if registros_escritos == registros_esperados:
            print(f"   ✅ Cantidad correcta: {registros_escritos:,} registros")
        else:
            print(f"   ⚠️  Diferencia detectada:")
            print(f"      Esperados: {registros_esperados:,}")
            print(f"      Escritos: {registros_escritos:,}")

# ============================================
# EJECUCIÓN
# ============================================

if __name__ == '__main__':
    random.seed(42)  # Para reproducibilidad
    generar_csv_completo()
