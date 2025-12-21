const fs = require('fs');

// Estudiantes 1ro Básico A (45 estudiantes)
const estudiantesBasicoA = [
  { nombre: "Sofía González González", rut: "10000000-8" },
  { nombre: "Matías González Díaz", rut: "10000001-6" },
  { nombre: "Valentina González Contreras", rut: "10000002-4" },
  { nombre: "Benjamín González Sepúlveda", rut: "10000003-2" },
  { nombre: "Martina González López", rut: "10000004-0" },
  { nombre: "Lucas González Torres", rut: "10000005-9" },
  { nombre: "Isidora González Espinoza", rut: "10000006-7" },
  { nombre: "Agustín González Vega", rut: "10000007-5" },
  { nombre: "Emilia González Gutiérrez", rut: "10000008-3" },
  { nombre: "Tomás González Ramírez", rut: "10000009-1" },
  { nombre: "Amanda González Cortés", rut: "10000010-5" },
  { nombre: "Diego González Figueroa", rut: "10000011-3" },
  { nombre: "Catalina González Jara", rut: "10000012-1" },
  { nombre: "Santiago González Campos", rut: "10000013-k" },
  { nombre: "Josefa González Alarcón", rut: "10000014-8" },
  { nombre: "Nicolás González González", rut: "10000015-6" },
  { nombre: "Florencia González Díaz", rut: "10000016-4" },
  { nombre: "Gabriel González Contreras", rut: "10000017-2" },
  { nombre: "Trinidad González Sepúlveda", rut: "10000018-0" },
  { nombre: "Maximiliano González López", rut: "10000019-9" },
  { nombre: "Antonia González Torres", rut: "10000020-2" },
  { nombre: "Joaquín González Espinoza", rut: "10000021-0" },
  { nombre: "Constanza González Vega", rut: "10000022-9" },
  { nombre: "Felipe González Gutiérrez", rut: "10000023-7" },
  { nombre: "María José González Ramírez", rut: "10000024-5" },
  { nombre: "Sebastián González Cortés", rut: "10000025-3" },
  { nombre: "Fernanda González Figueroa", rut: "10000026-1" },
  { nombre: "Vicente González Jara", rut: "10000027-k" },
  { nombre: "Javiera González Campos", rut: "10000028-8" },
  { nombre: "Cristóbal González Alarcón", rut: "10000029-6" },
  { nombre: "Maite González González", rut: "10000030-k" },
  { nombre: "Andrés González Díaz", rut: "10000031-8" },
  { nombre: "Ignacia González Contreras", rut: "10000032-6" },
  { nombre: "Manuel González Sepúlveda", rut: "10000033-4" },
  { nombre: "Renata González López", rut: "10000034-2" },
  { nombre: "Mateo González Torres", rut: "10000035-0" },
  { nombre: "Francisca González Espinoza", rut: "10000036-9" },
  { nombre: "Ángel González Vega", rut: "10000037-7" },
  { nombre: "Victoria González Gutiérrez", rut: "10000038-5" },
  { nombre: "Eduardo González Ramírez", rut: "10000039-3" },
  { nombre: "Carolina González Cortés", rut: "10000040-7" },
  { nombre: "Alberto González Figueroa", rut: "10000041-5" },
  { nombre: "Daniela González Jara", rut: "10000042-3" },
  { nombre: "Roberto González Campos", rut: "10000043-1" },
  { nombre: "Gabriela González Alarcón", rut: "10000044-k" }
];

// Estudiantes 1ro Medio B (45 estudiantes)
const estudiantesMedioB = [
  { nombre: "Sofía Flores González", rut: "10000765-7" },
  { nombre: "Matías Flores Díaz", rut: "10000766-5" },
  { nombre: "Valentina Flores Contreras", rut: "10000767-3" },
  { nombre: "Benjamín Flores Sepúlveda", rut: "10000768-1" },
  { nombre: "Martina Flores López", rut: "10000769-k" },
  { nombre: "Lucas Flores Torres", rut: "10000770-3" },
  { nombre: "Isidora Flores Espinoza", rut: "10000771-1" },
  { nombre: "Agustín Flores Vega", rut: "10000772-k" },
  { nombre: "Emilia Flores Gutiérrez", rut: "10000773-8" },
  { nombre: "Tomás Flores Ramírez", rut: "10000774-6" },
  { nombre: "Amanda Flores Cortés", rut: "10000775-4" },
  { nombre: "Diego Flores Figueroa", rut: "10000776-2" },
  { nombre: "Catalina Flores Jara", rut: "10000777-0" },
  { nombre: "Santiago Flores Campos", rut: "10000778-9" },
  { nombre: "Josefa Flores Alarcón", rut: "10000779-7" },
  { nombre: "Nicolás Flores González", rut: "10000780-0" },
  { nombre: "Florencia Flores Díaz", rut: "10000781-9" },
  { nombre: "Gabriel Flores Contreras", rut: "10000782-7" },
  { nombre: "Trinidad Flores Sepúlveda", rut: "10000783-5" },
  { nombre: "Maximiliano Flores López", rut: "10000784-3" },
  { nombre: "Antonia Flores Torres", rut: "10000785-1" },
  { nombre: "Joaquín Flores Espinoza", rut: "10000786-k" },
  { nombre: "Constanza Flores Vega", rut: "10000787-8" },
  { nombre: "Felipe Flores Gutiérrez", rut: "10000788-6" },
  { nombre: "María José Flores Ramírez", rut: "10000789-4" },
  { nombre: "Sebastián Flores Cortés", rut: "10000790-8" },
  { nombre: "Fernanda Flores Figueroa", rut: "10000791-6" },
  { nombre: "Vicente Flores Jara", rut: "10000792-4" },
  { nombre: "Javiera Flores Campos", rut: "10000793-2" },
  { nombre: "Cristóbal Flores Alarcón", rut: "10000794-0" },
  { nombre: "Maite Flores González", rut: "10000795-9" },
  { nombre: "Andrés Flores Díaz", rut: "10000796-7" },
  { nombre: "Ignacia Flores Contreras", rut: "10000797-5" },
  { nombre: "Manuel Flores Sepúlveda", rut: "10000798-3" },
  { nombre: "Renata Flores López", rut: "10000799-1" },
  { nombre: "Mateo Flores Torres", rut: "10000800-9" },
  { nombre: "Francisca Flores Espinoza", rut: "10000801-7" },
  { nombre: "Ángel Flores Vega", rut: "10000802-5" },
  { nombre: "Victoria Flores Gutiérrez", rut: "10000803-3" },
  { nombre: "Eduardo Flores Ramírez", rut: "10000804-1" },
  { nombre: "Carolina Flores Cortés", rut: "10000805-k" },
  { nombre: "Alberto Flores Figueroa", rut: "10000806-8" },
  { nombre: "Daniela Flores Jara", rut: "10000807-6" },
  { nombre: "Roberto Flores Campos", rut: "10000808-4" },
  { nombre: "Gabriela Flores Alarcón", rut: "10000809-2" }
];

// Asignaturas para 1ro Básico
const asignaturasBasico = [
  { codigo: "MAT", nombre: "Matemáticas" },
  { codigo: "LEN", nombre: "Lenguaje y Comunicación" },
  { codigo: "HIS", nombre: "Historia y Geografía" },
  { codigo: "CNT", nombre: "Ciencias Naturales" }
];

// Asignaturas para 1ro Medio
const asignaturasMedio = [
  { codigo: "MAT", nombre: "Matemáticas" },
  { codigo: "LEN", nombre: "Lenguaje y Comunicación" },
  { codigo: "HIS", nombre: "Historia y Geografía" },
  { codigo: "BIO", nombre: "Biología" },
  { codigo: "FIS", nombre: "Física" },
  { codigo: "QUI", nombre: "Química" },
  { codigo: "FIL", nombre: "Filosofía" },
  { codigo: "EDC", nombre: "Educación Ciudadana" }
];

// Temas por asignatura (1ro Básico)
const temasBasico = {
  MAT: [
    "Números del 1 al 20", "Suma hasta 10", "Resta hasta 10", "Comparación de cantidades",
    "Secuencias numéricas", "Figuras geométricas", "Medición de longitudes", "Patrones y series",
    "Problemas de suma", "Problemas de resta", "Números hasta 50", "Decenas y unidades",
    "Suma con reserva", "Gráficos simples", "Fracciones básicas", "Suma hasta 20",
    "Resta hasta 20", "El reloj y la hora", "Monedas y billetes", "Repaso general"
  ],
  LEN: [
    "Vocales y consonantes", "Lectura de sílabas", "Escritura de palabras", "Comprensión lectora básica",
    "Textos narrativos cortos", "Escritura de oraciones", "Uso de mayúsculas", "El punto y la coma",
    "Cuentos tradicionales", "Poemas infantiles", "Descripción de objetos", "Secuencia de eventos",
    "Palabras frecuentes", "Dictado de palabras", "Lectura en voz alta", "Escritura creativa",
    "Vocabulario nuevo", "Sinónimos simples", "Textos informativos", "Repaso general"
  ],
  HIS: [
    "Mi familia", "Mi casa y barrio", "La escuela", "Días de la semana",
    "Meses del año", "Estaciones del año", "Símbolos patrios", "Tradiciones chilenas",
    "Pueblos originarios", "Ubicación espacial", "El plano del barrio", "Trabajos y oficios",
    "Medios de transporte", "Medios de comunicación", "Normas de convivencia", "Derechos del niño",
    "Fiestas nacionales", "Paisajes de Chile", "El campo y la ciudad", "Repaso general"
  ],
  CNT: [
    "Seres vivos", "Las plantas", "Los animales", "El cuerpo humano",
    "Los cinco sentidos", "Alimentación saludable", "El agua", "El aire",
    "El sol y la luna", "Día y noche", "Estados de la materia", "Materiales y objetos",
    "Animales domésticos", "Animales salvajes", "Ciclo de vida", "El medio ambiente",
    "Cuidado de la naturaleza", "Las estaciones", "Cambios en la naturaleza", "Repaso general"
  ]
};

// Temas por asignatura (1ro Medio)
const temasMedio = {
  MAT: [
    "Números enteros", "Operaciones combinadas", "Potencias y raíces", "Proporcionalidad directa",
    "Porcentajes", "Ecuaciones lineales", "Sistemas de ecuaciones", "Funciones lineales",
    "Geometría analítica", "Perímetro y área", "Teorema de Pitágoras", "Volúmenes",
    "Estadística descriptiva", "Probabilidades", "Razones trigonométricas", "Algebra básica",
    "Factorización", "Inecuaciones", "Gráficos de funciones", "Repaso general"
  ],
  LEN: [
    "Comprensión lectora", "Análisis de textos", "Géneros literarios", "Narrativa",
    "Lírica y poesía", "Drama y teatro", "Textos argumentativos", "Textos expositivos",
    "Ortografía avanzada", "Gramática", "Vocabulario contextual", "Redacción de ensayos",
    "Análisis sintáctico", "Figuras literarias", "Novela chilena", "Poesía latinoamericana",
    "Comunicación oral", "Debates", "Investigación bibliográfica", "Repaso general"
  ],
  HIS: [
    "Civilizaciones antiguas", "Grecia clásica", "Roma antigua", "Edad Media",
    "Renacimiento", "Descubrimiento de América", "Conquista de Chile", "Colonia en Chile",
    "Independencia de Chile", "República", "Guerra del Pacífico", "Siglo XX en Chile",
    "Geografía de Chile", "Regiones naturales", "Demografía", "Economía nacional",
    "Derechos humanos", "Ciudadanía", "Globalización", "Repaso general"
  ],
  BIO: [
    "Célula y organelos", "Tejidos", "Sistemas del cuerpo", "Sistema digestivo",
    "Sistema circulatorio", "Sistema respiratorio", "Sistema nervioso", "Sistema endocrino",
    "Genética básica", "ADN y cromosomas", "Herencia", "Evolución",
    "Ecosistemas", "Cadenas alimenticias", "Biodiversidad", "Conservación",
    "Microorganismos", "Enfermedades", "Salud y prevención", "Repaso general"
  ],
  FIS: [
    "Magnitudes y unidades", "Vectores", "Cinemática", "Velocidad y aceleración",
    "Movimiento rectilíneo", "Caída libre", "Leyes de Newton", "Fuerza y masa",
    "Trabajo y energía", "Energía cinética", "Energía potencial", "Conservación de energía",
    "Ondas mecánicas", "Sonido", "Luz", "Óptica básica",
    "Electricidad", "Circuitos", "Magnetismo", "Repaso general"
  ],
  QUI: [
    "Materia y propiedades", "Estados de la materia", "Estructura atómica", "Tabla periódica",
    "Enlaces químicos", "Nomenclatura", "Reacciones químicas", "Balanceo de ecuaciones",
    "Estequiometría", "Soluciones", "Concentración", "Ácidos y bases",
    "pH", "Gases", "Leyes de los gases", "Química orgánica básica",
    "Hidrocarburos", "Grupos funcionales", "Polímeros", "Repaso general"
  ],
  FIL: [
    "Introducción a la filosofía", "Sócrates", "Platón", "Aristóteles",
    "Lógica formal", "Argumentación", "Ética", "Moral",
    "Valores", "Libertad", "Justicia", "Verdad",
    "Conocimiento", "Ciencia y filosofía", "Metafísica", "Existencialismo",
    "Filosofía política", "Derechos", "Felicidad", "Repaso general"
  ],
  EDC: [
    "Ciudadanía", "Democracia", "Constitución", "Derechos fundamentales",
    "Deberes ciudadanos", "Participación", "Votación", "Partidos políticos",
    "Poderes del Estado", "Gobierno local", "Gobierno regional", "Estado de derecho",
    "Justicia", "Tribunales", "Igualdad", "Discriminación",
    "Diversidad", "Inclusión", "Medioambiente", "Repaso general"
  ]
};

// Tipos de evaluación
const tipos = ["prueba", "tarea", "evaluacion"];

// Fechas del 1er semestre (Marzo - Junio)
const fechasS1 = [
  "2025-03-10", "2025-03-17", "2025-03-24", "2025-04-07", "2025-04-14",
  "2025-04-28", "2025-05-05", "2025-05-19", "2025-06-02", "2025-06-16"
];

// Fechas del 2do semestre (Julio - Noviembre)
const fechasS2 = [
  "2025-07-14", "2025-07-28", "2025-08-11", "2025-08-25", "2025-09-08",
  "2025-09-22", "2025-10-06", "2025-10-20", "2025-11-03", "2025-11-17"
];

// Generar nota aleatoria entre min y max
function randomNota(min = 40, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generar registros
let registros = [];
const header = "nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema";
registros.push(header);

// 1ro Básico A
estudiantesBasicoA.forEach(est => {
  asignaturasBasico.forEach(asig => {
    const temas = temasBasico[asig.codigo];
    // 10 actividades S1
    for (let i = 0; i < 10; i++) {
      const tipo = tipos[i % 3];
      const fecha = fechasS1[i];
      const nota = randomNota(45, 100);
      const tema = temas[i];
      registros.push(est.nombre + "," + est.rut + ",1ro Básico,A," + asig.nombre + "," + tipo + "," + fecha + "," + nota + "," + tema);
    }
    // 10 actividades S2
    for (let i = 0; i < 10; i++) {
      const tipo = tipos[i % 3];
      const fecha = fechasS2[i];
      const nota = randomNota(45, 100);
      const tema = temas[10 + i];
      registros.push(est.nombre + "," + est.rut + ",1ro Básico,A," + asig.nombre + "," + tipo + "," + fecha + "," + nota + "," + tema);
    }
  });
});

// 1ro Medio B
estudiantesMedioB.forEach(est => {
  asignaturasMedio.forEach(asig => {
    const temas = temasMedio[asig.codigo];
    // 10 actividades S1
    for (let i = 0; i < 10; i++) {
      const tipo = tipos[i % 3];
      const fecha = fechasS1[i];
      const nota = randomNota(40, 100);
      const tema = temas[i];
      registros.push(est.nombre + "," + est.rut + ",1ro Medio,B," + asig.nombre + "," + tipo + "," + fecha + "," + nota + "," + tema);
    }
    // 10 actividades S2
    for (let i = 0; i < 10; i++) {
      const tipo = tipos[i % 3];
      const fecha = fechasS2[i];
      const nota = randomNota(40, 100);
      const tema = temas[10 + i];
      registros.push(est.nombre + "," + est.rut + ",1ro Medio,B," + asig.nombre + "," + tipo + "," + fecha + "," + nota + "," + tema);
    }
  });
});

// Escribir archivo
const contenido = registros.join('\n');
fs.writeFileSync('calificaciones-1ro-basico-A-1ro-medio-B-2025.csv', contenido);

console.log('✅ Archivo generado: calificaciones-1ro-basico-A-1ro-medio-B-2025.csv');
console.log('📊 Total registros: ' + (registros.length - 1));
console.log('   - 1ro Básico A: ' + (45 * 4 * 20) + ' registros (45 estudiantes × 4 asignaturas × 20 actividades)');
console.log('   - 1ro Medio B: ' + (45 * 8 * 20) + ' registros (45 estudiantes × 8 asignaturas × 20 actividades)');
