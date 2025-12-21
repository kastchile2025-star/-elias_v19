import csv
import random

# Datos base
estudiantes = [
    {"nombre": "Sofía González González", "rut": "10000000-8"},
    {"nombre": "Matías González Díaz", "rut": "10000001-6"},
    {"nombre": "Valentina González Contreras", "rut": "10000002-4"},
    {"nombre": "Benjamín González Sepúlveda", "rut": "10000003-2"},
    {"nombre": "Martina González López", "rut": "10000004-0"},
    {"nombre": "Lucas González Torres", "rut": "10000005-9"},
    {"nombre": "Isidora González Espinoza", "rut": "10000006-7"},
    {"nombre": "Agustín González Vega", "rut": "10000007-5"},
    {"nombre": "Emilia González Gutiérrez", "rut": "10000008-3"},
    {"nombre": "Tomás González Ramírez", "rut": "10000009-1"},
    {"nombre": "Amanda González Cortés", "rut": "10000010-5"},
    {"nombre": "Diego González Figueroa", "rut": "10000011-3"},
    {"nombre": "Catalina González Jara", "rut": "10000012-1"}
]

asignaturas = [
    {"nombre": "Matemáticas", "profesores": ["María López García", "Pedro Rodríguez Silva", "Ana González Muñoz"]},
    {"nombre": "Lenguaje y Comunicación", "profesores": ["Carmen López Valenzuela", "Juan García Torres", "Sofía Martínez Vega"]},
    {"nombre": "Historia, Geografía y Ciencias Sociales", "profesores": ["Roberto Fernández Castro", "Gabriela Sánchez Rojas", "Carlos Herrera Núñez"]},
    {"nombre": "Ciencias Naturales", "profesores": ["Valentina Torres Díaz", "Diego Morales Soto", "Catalina Reyes Guzmán"]},
    {"nombre": "Educación Física", "profesores": ["Sebastián Silva Morales", "Antonia Castro Campos", "Francisco Vargas Jiménez"]},
    {"nombre": "Artes Visuales", "profesores": ["Isidora Flores Paredes", "Josefa Ruiz Sepúlveda", "Manuel Romero Cortés"]},
    {"nombre": "Música", "profesores": ["Vicente Tapia Iglesias", "Nicolás Valenzuela Cruz", "Francisca Medina Aros"]},
    {"nombre": "Inglés", "profesores": ["Joaquín Araya Peña", "Maximiliano Espinoza Molina", "Renata Contreras Vera"]},
    {"nombre": "Tecnología", "profesores": ["Gabriel Vergara Pacheco", "Trinidad Santana Ibarra", "Samuel Jara Bustos"]},
    {"nombre": "Orientación", "profesores": ["Andrés Poblete Oyarzún", "Cristóbal Cortés Sandoval", "Constanza Riquelme Carvajal"]}
]

tipos_evaluacion = ["tarea", "prueba", "evaluacion"]

# Fechas distribuidas en el año 2025
# Primer semestre: Marzo a Junio (5 actividades)
fechas_sem1 = [
    "2025-03-10", "2025-03-25",  # Marzo
    "2025-04-08", "2025-04-22",  # Abril
    "2025-05-06", "2025-05-20",  # Mayo
    "2025-06-03", "2025-06-17"   # Junio
]

# Segundo semestre: Julio a Diciembre (5 actividades)
fechas_sem2 = [
    "2025-07-08", "2025-07-22",  # Julio
    "2025-08-05", "2025-08-19",  # Agosto
    "2025-09-02", "2025-09-16",  # Septiembre
    "2025-09-30",                # Septiembre
    "2025-10-14", "2025-10-28",  # Octubre
    "2025-11-11", "2025-11-25",  # Noviembre
    "2025-12-09", "2025-12-23"   # Diciembre
]

# Generar el archivo CSV
output_file = '/workspaces/superjf_v17/public/test-data/grades-consolidated-2025-COMPLETO.csv'

with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['Nombre', 'RUT', 'Curso', 'Sección', 'Asignatura', 'Profesor', 'Fecha', 'Tipo', 'Nota']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    
    # Para cada estudiante
    for estudiante in estudiantes:
        # Para cada asignatura
        for asignatura in asignaturas:
            # Seleccionar fechas (10 en total: 5 de cada semestre)
            fechas_sel_sem1 = random.sample(fechas_sem1, 5)
            fechas_sel_sem2 = random.sample(fechas_sem2, 5)
            
            todas_fechas = sorted(fechas_sel_sem1 + fechas_sel_sem2)
            
            # Generar 10 actividades evaluativas
            for i, fecha in enumerate(todas_fechas):
                # Seleccionar tipo de evaluación (distribuido)
                tipo = tipos_evaluacion[i % 3]
                
                # Seleccionar profesor de la asignatura (rotar)
                profesor = asignatura["profesores"][i % len(asignatura["profesores"])]
                
                # Generar nota aleatoria entre 60 y 100
                nota = random.randint(60, 100)
                
                # Escribir fila
                writer.writerow({
                    'Nombre': estudiante['nombre'],
                    'RUT': estudiante['rut'],
                    'Curso': '1ro Básico',
                    'Sección': 'A',
                    'Asignatura': asignatura['nombre'],
                    'Profesor': profesor,
                    'Fecha': fecha,
                    'Tipo': tipo,
                    'Nota': nota
                })

print(f"Archivo CSV generado exitosamente: {output_file}")
print(f"Total de registros: {len(estudiantes) * len(asignaturas) * 10}")
print(f"Estudiantes: {len(estudiantes)}")
print(f"Asignaturas por estudiante: {len(asignaturas)}")
print(f"Actividades por asignatura: 10 (5 por semestre)")
