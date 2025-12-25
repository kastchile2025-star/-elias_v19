// PDF Content Generator - Shared module for extracting educational content
// This module provides topic-specific educational content from curriculum books

export interface BookInfo {
  course: string;
  subject: string;
  title: string;
}

// Generate topic-specific educational content based on subject, topic, and course
export function generateTopicContent(subject: string, topic: string, course: string): string {
  const topicNormalized = topic.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const subjectNormalized = subject.toLowerCase();
  
  // Ciencias Naturales topics
  if (subjectNormalized.includes('ciencias naturales') || subjectNormalized.includes('biología') || subjectNormalized.includes('biologia')) {
    const content = generateCienciasNaturalesContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Matemáticas topics
  if (subjectNormalized.includes('matemáticas') || subjectNormalized.includes('matematicas') || subjectNormalized.includes('matemática')) {
    const content = generateMatematicasContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Historia topics
  if (subjectNormalized.includes('historia') || subjectNormalized.includes('sociales') || subjectNormalized.includes('geografía')) {
    const content = generateHistoriaContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Lenguaje topics
  if (subjectNormalized.includes('lenguaje') || subjectNormalized.includes('comunicación') || subjectNormalized.includes('comunicacion')) {
    const content = generateLenguajeContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Fallback - generate generic educational content
  return generateGenericContent(topic, subject, course);
}

function generateCienciasNaturalesContent(topicNormalized: string, topic: string, course: string): string | null {
  // Sistema Respiratorio
  if (topicNormalized.includes('sistema respiratorio') || topicNormalized.includes('respiratorio') || topicNormalized.includes('respiracion')) {
    return `
SISTEMA RESPIRATORIO - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: EL SISTEMA RESPIRATORIO HUMANO

1. INTRODUCCIÓN AL SISTEMA RESPIRATORIO
El sistema respiratorio es el conjunto de órganos que permite el intercambio de gases entre nuestro cuerpo y el ambiente. Su función principal es incorporar oxígeno (O₂) al organismo y eliminar dióxido de carbono (CO₂), un producto de desecho del metabolismo celular.

2. ÓRGANOS DEL SISTEMA RESPIRATORIO

2.1 Vías Respiratorias Superiores:

FOSAS NASALES
- Son las cavidades de entrada del aire al sistema respiratorio
- Están revestidas por mucosa nasal con cilios y moco
- Funciones: filtrar partículas, calentar y humedecer el aire
- Los vellos nasales atrapan partículas grandes

FARINGE
- Conducto muscular compartido con el sistema digestivo
- Mide aproximadamente 13 cm de longitud
- Conecta las fosas nasales con la laringe
- Contiene las amígdalas que ayudan a combatir infecciones

LARINGE
- Órgano cartilaginoso que contiene las cuerdas vocales
- Permite la producción de la voz (fonación)
- La epiglotis cierra la laringe durante la deglución para evitar que los alimentos entren a las vías respiratorias

2.2 Vías Respiratorias Inferiores:

TRÁQUEA
- Tubo de aproximadamente 12 cm de largo y 2 cm de diámetro
- Formada por anillos cartilaginosos en forma de "C"
- Revestida internamente por células ciliadas que mueven el moco hacia arriba

BRONQUIOS
- La tráquea se divide en dos bronquios principales (derecho e izquierdo)
- Cada bronquio entra a un pulmón
- Se ramifican sucesivamente en bronquios secundarios y terciarios

BRONQUIOLOS
- Son ramificaciones más pequeñas de los bronquios
- Carecen de cartílago en sus paredes
- Terminan en los sacos alveolares

ALVÉOLOS PULMONARES
- Pequeñas bolsas de aire donde ocurre el intercambio gaseoso
- Cada pulmón contiene aproximadamente 300 millones de alvéolos
- Están rodeados por una red de capilares sanguíneos
- Sus paredes son muy delgadas (0.2 micras) para facilitar la difusión de gases

PULMONES
- Son los órganos principales del sistema respiratorio
- El pulmón derecho tiene 3 lóbulos, el izquierdo tiene 2
- Están protegidos por la caja torácica
- Cubiertos por una membrana llamada pleura

DIAFRAGMA
- Músculo en forma de cúpula ubicado debajo de los pulmones
- Principal músculo de la respiración
- Al contraerse, desciende y permite la entrada de aire

3. EL PROCESO DE RESPIRACIÓN

3.1 Mecánica Respiratoria:

INSPIRACIÓN (Inhalación)
- El diafragma se contrae y desciende
- Los músculos intercostales elevan las costillas
- La cavidad torácica aumenta de volumen
- Los pulmones se expanden
- El aire entra por diferencia de presión

ESPIRACIÓN (Exhalación)
- El diafragma se relaja y asciende
- Los músculos intercostales se relajan
- La cavidad torácica disminuye de volumen
- Los pulmones se comprimen
- El aire sale al exterior

3.2 Frecuencia Respiratoria:
- Adulto en reposo: 12-20 respiraciones por minuto
- Niños: 20-30 respiraciones por minuto
- Durante el ejercicio la frecuencia aumenta

4. INTERCAMBIO GASEOSO

4.1 En los Alvéolos Pulmonares (Respiración Externa):
- El oxígeno pasa del aire alveolar a la sangre de los capilares
- El dióxido de carbono pasa de la sangre al aire alveolar
- Este proceso ocurre por difusión simple
- Depende de las diferencias de presión parcial de los gases

4.2 En los Tejidos (Respiración Interna):
- El oxígeno pasa de la sangre a las células
- El dióxido de carbono pasa de las células a la sangre
- Las células usan el oxígeno para la respiración celular

5. CUIDADOS DEL SISTEMA RESPIRATORIO

5.1 Hábitos Saludables:
- Respirar por la nariz para filtrar y calentar el aire
- Evitar ambientes con aire contaminado
- No fumar ni exponerse al humo del tabaco
- Realizar ejercicio físico regularmente
- Mantener una buena postura para facilitar la respiración

5.2 Prevención de Enfermedades:
- Lavarse las manos frecuentemente
- Cubrirse al toser o estornudar
- Ventilar los espacios cerrados
- Evitar cambios bruscos de temperatura
- Vacunarse según el calendario de vacunación

6. ENFERMEDADES DEL SISTEMA RESPIRATORIO

ENFERMEDADES COMUNES:
- Resfriado común: Infección viral leve de las vías superiores
- Gripe: Infección viral más severa con fiebre y malestar general
- Bronquitis: Inflamación de los bronquios
- Neumonía: Infección de los pulmones
- Asma: Inflamación crónica con dificultad para respirar

FACTORES DE RIESGO:
- Tabaquismo (causa principal de enfermedades respiratorias graves)
- Contaminación del aire
- Exposición a sustancias tóxicas
- Falta de actividad física
- Sistema inmune debilitado

7. ACTIVIDADES DE APRENDIZAJE

EXPERIMENTO: La Capacidad Pulmonar
Materiales: Botella grande, manguera, recipiente con agua
Procedimiento: Medir el volumen de aire que puedes exhalar

REFLEXIÓN:
¿Por qué es importante cuidar nuestro sistema respiratorio?
¿Cómo afecta la contaminación a nuestra salud respiratoria?
¿Qué podemos hacer para mantener sanos nuestros pulmones?
`;
  }
  
  // Célula
  if (topicNormalized.includes('celula') || topicNormalized.includes('celular') || topicNormalized.includes('célula')) {
    return `
LA CÉLULA - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: LA CÉLULA - UNIDAD BÁSICA DE LA VIDA

1. INTRODUCCIÓN
La célula es la unidad estructural y funcional de todos los seres vivos. Es la estructura más pequeña capaz de realizar todas las funciones vitales: nutrición, relación y reproducción.

2. TEORÍA CELULAR

La teoría celular, establecida en el siglo XIX, postula que:
1. Todos los seres vivos están formados por células
2. La célula es la unidad funcional de los seres vivos
3. Toda célula proviene de otra célula preexistente

Científicos importantes:
- Robert Hooke (1665): Observó por primera vez las células en el corcho
- Anton van Leeuwenhoek: Observó microorganismos
- Matthias Schleiden y Theodor Schwann: Formularon la teoría celular
- Rudolf Virchow: Estableció que toda célula proviene de otra célula

3. TIPOS DE CÉLULAS

3.1 CÉLULAS PROCARIOTAS
- No poseen núcleo definido (el material genético está libre en el citoplasma)
- Son más pequeñas y simples
- No tienen organelos membranosos
- Ejemplos: bacterias y arqueas

3.2 CÉLULAS EUCARIOTAS
- Poseen núcleo definido con envoltura nuclear
- Son más grandes y complejas
- Tienen organelos membranosos especializados
- Ejemplos: células animales, vegetales, de hongos y protistas

4. PARTES DE LA CÉLULA EUCARIOTA

4.1 MEMBRANA CELULAR (Membrana Plasmática)
- Estructura: Bicapa de fosfolípidos con proteínas
- Función: Controla el paso de sustancias hacia dentro y fuera de la célula
- Es selectivamente permeable
- Participa en la comunicación celular

4.2 CITOPLASMA
- Medio gelatinoso entre la membrana y el núcleo
- Compuesto principalmente por agua, sales y moléculas orgánicas
- Contiene el citoesqueleto que da forma a la célula
- Alberga los organelos celulares

4.3 NÚCLEO
- Centro de control de la célula
- Contiene el material genético (ADN)
- Está rodeado por la envoltura nuclear
- Contiene el nucléolo donde se forman los ribosomas

4.4 ORGANELOS CELULARES

MITOCONDRIAS
- Función: Producen energía (ATP) mediante la respiración celular
- Llamadas "las centrales energéticas de la célula"
- Tienen su propio ADN

RIBOSOMAS
- Función: Síntesis de proteínas
- Pueden estar libres en el citoplasma o adheridos al retículo endoplasmático
- Formados por ARN ribosomal y proteínas

RETÍCULO ENDOPLASMÁTICO
- RE Rugoso: Con ribosomas, sintetiza proteínas
- RE Liso: Sin ribosomas, sintetiza lípidos y desintoxica

APARATO DE GOLGI
- Función: Modifica, empaqueta y distribuye proteínas y lípidos
- Forma vesículas para transporte

LISOSOMAS
- Función: Digestión intracelular
- Contienen enzimas digestivas
- Eliminan desechos y estructuras dañadas

5. ORGANELOS EXCLUSIVOS DE CÉLULAS VEGETALES

PARED CELULAR
- Estructura rígida exterior a la membrana
- Compuesta principalmente de celulosa
- Función: Protección y soporte estructural

CLOROPLASTOS
- Función: Realizan la fotosíntesis
- Contienen clorofila (pigmento verde)
- Producen glucosa usando luz solar

VACUOLA CENTRAL
- Gran vacuola que ocupa la mayor parte de la célula
- Función: Almacena agua, nutrientes, pigmentos y desechos
- Mantiene la presión de turgencia

6. FUNCIONES CELULARES

NUTRICIÓN
- Obtención de nutrientes del medio
- Transformación en energía y materiales para la célula

RELACIÓN
- Respuesta a estímulos del ambiente
- Comunicación con otras células

REPRODUCCIÓN
- División celular para crear nuevas células
- Mitosis (células somáticas)
- Meiosis (células reproductivas)

7. DIFERENCIAS ENTRE CÉLULA ANIMAL Y VEGETAL

CÉLULA ANIMAL:
- No tiene pared celular
- No tiene cloroplastos
- Tiene centriolos
- Vacuolas pequeñas y múltiples
- Forma irregular

CÉLULA VEGETAL:
- Tiene pared celular de celulosa
- Tiene cloroplastos para fotosíntesis
- No tiene centriolos
- Una gran vacuola central
- Forma regular (generalmente rectangular)
`;
  }
  
  // Fotosíntesis
  if (topicNormalized.includes('fotosintesis') || topicNormalized.includes('fotosíntesis')) {
    return `
LA FOTOSÍNTESIS - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: LA FOTOSÍNTESIS - EL PROCESO QUE SOSTIENE LA VIDA

1. DEFINICIÓN
La fotosíntesis es el proceso mediante el cual las plantas, algas y algunas bacterias transforman la energía luminosa del sol en energía química almacenada en forma de glucosa.

2. ECUACIÓN DE LA FOTOSÍNTESIS

6CO₂ + 6H₂O + Luz solar → C₆H₁₂O₆ + 6O₂

Dióxido de carbono + Agua + Energía luminosa → Glucosa + Oxígeno

3. ESTRUCTURAS INVOLUCRADAS

CLOROPLASTOS
- Organelos donde ocurre la fotosíntesis
- Contienen tilacoides (membranas internas) y estroma
- Poseen su propio ADN

CLOROFILA
- Pigmento verde que captura la luz
- Ubicada en los tilacoides
- Absorbe luz roja y azul, refleja verde

ESTOMAS
- Poros en las hojas
- Permiten entrada de CO₂ y salida de O₂
- Regulan la pérdida de agua

4. FASES DE LA FOTOSÍNTESIS

FASE LUMINOSA (Reacciones Dependientes de la Luz)
- Ocurre en los tilacoides
- Requiere luz solar directa
- Proceso:
  1. La clorofila absorbe energía luminosa
  2. El agua se descompone (fotólisis): 2H₂O → 4H⁺ + 4e⁻ + O₂
  3. Se libera oxígeno como subproducto
  4. Se produce ATP y NADPH (moléculas energéticas)

FASE OSCURA (Ciclo de Calvin)
- Ocurre en el estroma del cloroplasto
- No requiere luz directa (pero usa productos de la fase luminosa)
- Proceso:
  1. Fijación del CO₂ (se incorpora carbono)
  2. Reducción usando ATP y NADPH
  3. Síntesis de glucosa (C₆H₁₂O₆)
  4. Regeneración de la molécula receptora

5. FACTORES QUE AFECTAN LA FOTOSÍNTESIS

INTENSIDAD LUMINOSA
- Mayor luz = mayor fotosíntesis (hasta un punto de saturación)
- Muy poca luz reduce significativamente el proceso

CONCENTRACIÓN DE CO₂
- Mayor CO₂ = mayor fotosíntesis (hasta cierto límite)
- Es el factor limitante más común

TEMPERATURA
- Temperatura óptima: 25-35°C para la mayoría de plantas
- Temperaturas extremas reducen la eficiencia

DISPONIBILIDAD DE AGUA
- El agua es reactivo esencial
- La falta de agua cierra los estomas y reduce la fotosíntesis

6. IMPORTANCIA DE LA FOTOSÍNTESIS

PARA LA VIDA EN LA TIERRA:
- Produce el oxígeno que respiramos
- Es la base de las cadenas alimenticias
- Regula el CO₂ atmosférico (efecto invernadero)
- Produce toda la materia orgánica del planeta

PARA EL ECOSISTEMA:
- Las plantas son productores primarios
- Transforman energía solar en energía química
- Sostienen a todos los demás organismos

7. RELACIÓN CON LA RESPIRACIÓN CELULAR

La fotosíntesis y la respiración celular son procesos complementarios:

FOTOSÍNTESIS:
- Consume CO₂ y H₂O
- Libera O₂
- Almacena energía en glucosa
- Ocurre en cloroplastos
- Requiere luz

RESPIRACIÓN CELULAR:
- Consume O₂ y glucosa
- Libera CO₂ y H₂O
- Libera energía (ATP)
- Ocurre en mitocondrias
- No requiere luz
`;
  }
  
  // Sistema digestivo
  if (topicNormalized.includes('sistema digestivo') || topicNormalized.includes('digestivo') || topicNormalized.includes('digestion')) {
    return `
SISTEMA DIGESTIVO - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: EL SISTEMA DIGESTIVO

1. FUNCIÓN DEL SISTEMA DIGESTIVO
El sistema digestivo transforma los alimentos en nutrientes que pueden ser absorbidos y utilizados por las células del cuerpo.

2. ÓRGANOS DEL TUBO DIGESTIVO

BOCA
- Inicia la digestión mecánica (masticación) y química (saliva)
- Contiene dientes, lengua y glándulas salivales
- La saliva contiene amilasa que digiere almidones

FARINGE
- Conecta la boca con el esófago
- Participa en la deglución

ESÓFAGO
- Tubo muscular de aproximadamente 25 cm
- Transporta el bolo alimenticio al estómago
- Movimientos peristálticos impulsan el alimento

ESTÓMAGO
- Órgano en forma de bolsa
- Digiere proteínas con ácido clorhídrico y pepsina
- El quimo es el resultado de la digestión estomacal

INTESTINO DELGADO
- Mide aproximadamente 6-7 metros
- Tres partes: duodeno, yeyuno e íleon
- Ocurre la mayor absorción de nutrientes
- Vellosidades intestinales aumentan la superficie de absorción

INTESTINO GRUESO
- Mide aproximadamente 1.5 metros
- Absorbe agua y sales minerales
- Forma y almacena las heces fecales
- Contiene bacterias beneficiosas (flora intestinal)

3. GLÁNDULAS ANEXAS

GLÁNDULAS SALIVALES
- Producen saliva con enzimas digestivas
- Humedecen el alimento

HÍGADO
- Produce bilis para emulsionar grasas
- Almacena glucosa como glucógeno
- Desintoxica la sangre

PÁNCREAS
- Produce jugo pancreático con enzimas digestivas
- Produce insulina y glucagón (hormonas)

VESÍCULA BILIAR
- Almacena y concentra la bilis
- Libera bilis al duodeno durante la digestión

4. PROCESOS DIGESTIVOS

DIGESTIÓN MECÁNICA
- Fragmentación física del alimento
- Incluye masticación y movimientos peristálticos

DIGESTIÓN QUÍMICA
- Enzimas descomponen moléculas complejas
- Amilasa: digiere almidones
- Proteasas: digieren proteínas
- Lipasas: digieren grasas

ABSORCIÓN
- Paso de nutrientes al torrente sanguíneo
- Ocurre principalmente en el intestino delgado

ELIMINACIÓN
- Expulsión de materiales no digeridos
- Formación de heces fecales

5. CUIDADOS DEL SISTEMA DIGESTIVO

- Masticar bien los alimentos
- Comer despacio y en horarios regulares
- Consumir fibra (frutas, verduras, cereales integrales)
- Beber suficiente agua
- Evitar comidas muy grasas o picantes
- Realizar actividad física
`;
  }
  
  return null;
}

function generateMatematicasContent(topicNormalized: string, topic: string, course: string): string | null {
  // Fracciones
  if (topicNormalized.includes('fraccion') || topicNormalized.includes('fracciones')) {
    return `
LAS FRACCIONES - Contenido del Libro de Matemáticas ${course}

CAPÍTULO: FRACCIONES - CONCEPTOS Y OPERACIONES

1. ¿QUÉ ES UNA FRACCIÓN?
Una fracción representa una o más partes iguales de una unidad dividida en partes iguales.

2. COMPONENTES DE UNA FRACCIÓN
- NUMERADOR: Número superior, indica cuántas partes se toman
- DENOMINADOR: Número inferior, indica en cuántas partes se divide el todo
- LÍNEA DE FRACCIÓN: Separa el numerador del denominador

Ejemplo: En 3/4, el 3 es el numerador y el 4 es el denominador

3. TIPOS DE FRACCIONES

FRACCIONES PROPIAS
- El numerador es MENOR que el denominador
- Representan menos de una unidad
- Ejemplos: 1/2, 3/4, 5/8

FRACCIONES IMPROPIAS
- El numerador es MAYOR O IGUAL al denominador
- Representan una unidad o más
- Ejemplos: 5/3, 7/2, 9/4

NÚMEROS MIXTOS
- Combinan un número entero y una fracción propia
- Ejemplos: 2 1/3, 3 1/4, 5 2/5

FRACCIONES EQUIVALENTES
- Representan la misma cantidad pero con diferentes números
- Ejemplos: 1/2 = 2/4 = 3/6 = 4/8

4. OPERACIONES CON FRACCIONES

SUMA Y RESTA CON IGUAL DENOMINADOR
- Se suman o restan los numeradores
- El denominador se mantiene igual
- Ejemplo: 2/5 + 1/5 = 3/5

SUMA Y RESTA CON DIFERENTE DENOMINADOR
1. Encontrar el mínimo común múltiplo (MCM) de los denominadores
2. Convertir las fracciones a fracciones equivalentes
3. Sumar o restar los numeradores
- Ejemplo: 1/2 + 1/3 = 3/6 + 2/6 = 5/6

MULTIPLICACIÓN DE FRACCIONES
- Se multiplican los numeradores entre sí
- Se multiplican los denominadores entre sí
- Se simplifica si es posible
- Ejemplo: 2/3 × 3/4 = 6/12 = 1/2

DIVISIÓN DE FRACCIONES
- Se multiplica por el recíproco (fracción invertida)
- Ejemplo: (2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6

5. SIMPLIFICACIÓN DE FRACCIONES
- Dividir numerador y denominador por su MCD
- Una fracción está simplificada cuando no se puede reducir más
- Ejemplo: 6/8 = 3/4 (dividiendo ambos por 2)

6. FRACCIONES Y DECIMALES
- Para convertir fracción a decimal: dividir numerador ÷ denominador
- Ejemplo: 1/4 = 0.25
- Ejemplo: 3/4 = 0.75

7. PROBLEMAS CON FRACCIONES
Las fracciones se usan para resolver problemas de la vida cotidiana:
- Repartir cantidades en partes iguales
- Calcular porciones de recetas
- Medir distancias y longitudes
- Trabajar con probabilidades
`;
  }
  
  // Ecuaciones
  if (topicNormalized.includes('ecuacion') || topicNormalized.includes('ecuaciones')) {
    return `
ECUACIONES - Contenido del Libro de Matemáticas ${course}

CAPÍTULO: ECUACIONES - FUNDAMENTOS Y RESOLUCIÓN

1. ¿QUÉ ES UNA ECUACIÓN?
Una ecuación es una igualdad matemática que contiene una o más incógnitas (valores desconocidos que debemos encontrar).

2. ELEMENTOS DE UNA ECUACIÓN
- MIEMBROS: Las expresiones a cada lado del signo igual
- TÉRMINOS: Cada sumando de la ecuación
- INCÓGNITA: La variable desconocida (generalmente x, y, z)
- COEFICIENTES: Números que multiplican a las variables
- TÉRMINO INDEPENDIENTE: Número sin variable

Ejemplo: 2x + 3 = 7
- Primer miembro: 2x + 3
- Segundo miembro: 7
- Incógnita: x
- Coeficiente: 2
- Términos independientes: 3 y 7

3. TIPOS DE ECUACIONES

ECUACIONES DE PRIMER GRADO (Lineales)
- La incógnita está elevada a la potencia 1
- Forma general: ax + b = 0
- Ejemplo: 2x + 5 = 11

ECUACIONES DE SEGUNDO GRADO (Cuadráticas)
- La incógnita está elevada a la potencia 2
- Forma general: ax² + bx + c = 0
- Ejemplo: x² - 5x + 6 = 0

4. PROPIEDADES DE LAS ECUACIONES

PROPIEDAD UNIFORME DE LA SUMA
- Se puede sumar o restar el mismo número a ambos miembros
- La igualdad se mantiene
- Ejemplo: Si x + 5 = 8, entonces x + 5 - 5 = 8 - 5, así x = 3

PROPIEDAD UNIFORME DEL PRODUCTO
- Se puede multiplicar o dividir ambos miembros por el mismo número (≠0)
- La igualdad se mantiene
- Ejemplo: Si 3x = 12, entonces 3x/3 = 12/3, así x = 4

5. PASOS PARA RESOLVER ECUACIONES DE PRIMER GRADO

1. Eliminar paréntesis (usar propiedad distributiva)
2. Reducir términos semejantes
3. Transponer términos con variable a un lado
4. Transponer términos independientes al otro lado
5. Reducir términos semejantes
6. Despejar la variable

EJEMPLO RESUELTO:
3x + 5 = 2x + 12
3x - 2x = 12 - 5
x = 7

6. VERIFICACIÓN
Siempre sustituir el valor encontrado en la ecuación original:
3(7) + 5 = 2(7) + 12
21 + 5 = 14 + 12
26 = 26 ✓

7. PROBLEMAS DE APLICACIÓN
Las ecuaciones se usan para resolver problemas de:
- Cálculo de edades
- Distribución de cantidades
- Problemas de movimiento
- Situaciones de la vida cotidiana
`;
  }
  
  // Geometría
  if (topicNormalized.includes('geometria') || topicNormalized.includes('figuras geometricas') || topicNormalized.includes('poligono')) {
    return `
GEOMETRÍA - Contenido del Libro de Matemáticas ${course}

CAPÍTULO: FIGURAS GEOMÉTRICAS

1. ELEMENTOS BÁSICOS DE GEOMETRÍA

PUNTO
- Es la unidad más pequeña de la geometría
- No tiene dimensiones
- Se representa con una letra mayúscula

RECTA
- Sucesión infinita de puntos en una dirección
- No tiene principio ni fin
- Se nombra con letras minúsculas

SEGMENTO
- Porción de recta limitada por dos puntos
- Tiene principio y fin
- Se puede medir

ÁNGULO
- Región formada por dos semirrectas con origen común
- Se mide en grados (°)
- Tipos: agudo (<90°), recto (90°), obtuso (>90°), llano (180°)

2. POLÍGONOS

DEFINICIÓN
- Figura plana cerrada formada por segmentos
- Tiene lados, vértices y ángulos

CLASIFICACIÓN POR NÚMERO DE LADOS:
- Triángulo: 3 lados
- Cuadrilátero: 4 lados
- Pentágono: 5 lados
- Hexágono: 6 lados
- Heptágono: 7 lados
- Octágono: 8 lados

3. TRIÁNGULOS

SEGÚN SUS LADOS:
- Equilátero: 3 lados iguales
- Isósceles: 2 lados iguales
- Escaleno: 3 lados diferentes

SEGÚN SUS ÁNGULOS:
- Acutángulo: 3 ángulos agudos
- Rectángulo: 1 ángulo recto
- Obtusángulo: 1 ángulo obtuso

PROPIEDADES:
- Suma de ángulos interiores = 180°
- Área = (base × altura) / 2

4. CUADRILÁTEROS

PARALELOGRAMOS:
- Cuadrado: 4 lados iguales, 4 ángulos rectos
- Rectángulo: lados opuestos iguales, 4 ángulos rectos
- Rombo: 4 lados iguales, ángulos opuestos iguales
- Romboide: lados opuestos iguales

TRAPECIO:
- Solo 2 lados paralelos

5. PERÍMETRO Y ÁREA

PERÍMETRO: Suma de todos los lados

ÁREA DE FIGURAS:
- Cuadrado: lado²
- Rectángulo: base × altura
- Triángulo: (base × altura) / 2
- Círculo: π × radio²
`;
  }
  
  return null;
}

function generateHistoriaContent(topicNormalized: string, topic: string, course: string): string | null {
  // Independencia de Chile
  if (topicNormalized.includes('independencia') || topicNormalized.includes('emancipacion')) {
    return `
LA INDEPENDENCIA DE CHILE - Contenido del Libro de Historia ${course}

CAPÍTULO: EL PROCESO DE INDEPENDENCIA

1. ANTECEDENTES DE LA INDEPENDENCIA

CAUSAS EXTERNAS:
- Independencia de Estados Unidos (1776)
- Revolución Francesa (1789)
- Invasión napoleónica a España (1808)
- Ideas de la Ilustración (libertad, igualdad, soberanía popular)

CAUSAS INTERNAS:
- Descontento criollo por discriminación en cargos públicos
- Restricciones comerciales impuestas por España
- Deseo de participación política
- Conciencia de identidad americana

2. ETAPAS DE LA INDEPENDENCIA

PATRIA VIEJA (1810-1814)
- 18 de septiembre de 1810: Primera Junta Nacional de Gobierno
- Primer Congreso Nacional (1811)
- Gobierno de José Miguel Carrera
- Primeras reformas: libertad de comercio, libertad de prensa
- Desastre de Rancagua (octubre 1814): Derrota patriota

RECONQUISTA ESPAÑOLA (1814-1817)
- Restauración del dominio español
- Gobierno represivo de Mariano Osorio y Casimiro Marcó del Pont
- Tribunales de Vindicación
- Patriotas exiliados a Argentina
- Resistencia guerrillera (Manuel Rodríguez)

PATRIA NUEVA (1817-1823)
- Cruce de los Andes por el Ejército Libertador
- Batalla de Chacabuco (12 febrero 1817): Victoria patriota
- Bernardo O'Higgins asume como Director Supremo
- Proclamación de la Independencia (12 febrero 1818)
- Batalla de Maipú (5 abril 1818): Victoria decisiva
- Gobierno de O'Higgins hasta 1823

3. PERSONAJES IMPORTANTES

BERNARDO O'HIGGINS (1778-1842)
- "Padre de la Patria"
- Director Supremo de Chile
- Organizó el Ejército patriota
- Proclamó la Independencia

JOSÉ DE SAN MARTÍN (1778-1850)
- Libertador de Argentina, Chile y Perú
- Organizó el Ejército de los Andes
- Estratega del cruce de los Andes

JOSÉ MIGUEL CARRERA (1785-1821)
- Líder de la Patria Vieja
- Impulsó reformas liberales
- Creó los primeros símbolos patrios

MANUEL RODRÍGUEZ (1785-1818)
- Guerrillero patriota
- Símbolo de resistencia durante la Reconquista
- "El guerrillero"

4. OBRAS DEL GOBIERNO DE O'HIGGINS
- Abolición de títulos de nobleza
- Creación del Cementerio General
- Fundación de escuelas
- Apertura del Instituto Nacional
- Organización de la Armada de Chile
- Abolición de las corridas de toros

5. SÍMBOLOS PATRIOS
- Bandera nacional (actual desde 1817)
- Escudo nacional
- Himno nacional
- Escarapela
`;
  }
  
  // Pueblos originarios
  if (topicNormalized.includes('pueblos originarios') || topicNormalized.includes('indigenas') || topicNormalized.includes('mapuche')) {
    return `
PUEBLOS ORIGINARIOS DE CHILE - Contenido del Libro de Historia ${course}

CAPÍTULO: LOS PUEBLOS ORIGINARIOS

1. INTRODUCCIÓN
Chile fue habitado por diversos pueblos originarios antes de la llegada de los españoles. Cada pueblo desarrolló su propia cultura, adaptándose al medio ambiente donde vivía.

2. PUEBLOS DEL NORTE

AYMARAS
- Ubicación: Altiplano (regiones de Arica y Parinacota, Tarapacá)
- Actividades: Agricultura en terrazas, ganadería de llamas y alpacas
- Características: Cultivo de papa, quinoa y maíz
- Organización: Ayllus (comunidades familiares)

ATACAMEÑOS (Lickanantay)
- Ubicación: Desierto de Atacama, oasis
- Actividades: Agricultura de oasis, comercio, metalurgia
- Características: Sistemas de riego, cultivo en terrazas
- Importante centro: San Pedro de Atacama

CHANGOS
- Ubicación: Costa del norte de Chile
- Actividades: Pesca, caza de lobos marinos
- Características: Balsas de cuero de lobo marino inflado

DIAGUITAS
- Ubicación: Valles transversales (Copiapó, Huasco, Elqui)
- Actividades: Agricultura, ganadería, metalurgia
- Características: Cerámica decorada, influencia incaica

3. PUEBLOS DE LA ZONA CENTRAL Y SUR

MAPUCHES
- Ubicación: Desde el río Aconcagua hasta Chiloé
- Organización social: Lof (comunidad), rewe (agrupación de lof)
- Autoridades: Lonko (jefe), machi (sanador/a espiritual)
- Actividades: Agricultura, ganadería, recolección
- Lengua: Mapudungún
- Religión: Creencia en Ngenechen (dios creador)
- Vivienda: Ruka
- Resistencia a la conquista española

4. PUEBLOS DEL SUR Y ZONA AUSTRAL

HUILLICHES
- Ubicación: Sur del río Toltén hasta Chiloé
- Características: Parte del pueblo mapuche, adaptados al clima lluvioso
- Actividades: Agricultura, pesca, recolección de mariscos

CHONOS
- Ubicación: Archipiélago de los Chonos
- Actividades: Pesca, caza de lobos marinos
- Características: Nómades del mar

KAWÉSQAR (Alacalufes)
- Ubicación: Canales patagónicos
- Actividades: Pesca, caza, recolección
- Características: Nómades canoeros, adaptados al frío extremo

SELK'NAM (Onas)
- Ubicación: Tierra del Fuego
- Actividades: Caza de guanacos
- Características: Nómades terrestres, ceremonias de iniciación

YAGANES (Yámanas)
- Ubicación: Extremo sur, Cabo de Hornos
- Actividades: Pesca, caza marina
- Características: El pueblo más austral del mundo

5. LEGADO DE LOS PUEBLOS ORIGINARIOS
- Lenguas y toponimia (nombres de lugares)
- Alimentos: papa, maíz, quinoa, porotos
- Textiles y artesanías
- Conocimientos medicinales
- Tradiciones y ceremonias
- Cosmovisión y relación con la naturaleza
`;
  }
  
  return null;
}

function generateLenguajeContent(topicNormalized: string, topic: string, course: string): string | null {
  // Sustantivos
  if (topicNormalized.includes('sustantivo') || topicNormalized.includes('sustantivos')) {
    return `
EL SUSTANTIVO - Contenido del Libro de Lenguaje ${course}

CAPÍTULO: LAS CLASES DE PALABRAS - EL SUSTANTIVO

1. DEFINICIÓN
El sustantivo es la palabra que sirve para nombrar personas, animales, cosas, lugares, sentimientos o ideas.

2. CLASIFICACIÓN DE SUSTANTIVOS

POR SU SIGNIFICADO:

SUSTANTIVOS COMUNES
- Nombran de forma general
- Se escriben con minúscula
- Ejemplos: perro, ciudad, libro, mesa

SUSTANTIVOS PROPIOS
- Nombran de forma específica y única
- Se escriben con mayúscula inicial
- Ejemplos: Pedro, Chile, Andes, Amazonas

POR SU EXTENSIÓN:

SUSTANTIVOS INDIVIDUALES
- Nombran un solo elemento
- Ejemplos: árbol, abeja, soldado, estrella

SUSTANTIVOS COLECTIVOS
- Nombran un conjunto de elementos
- Ejemplos: bosque (conjunto de árboles), enjambre (conjunto de abejas)

POR SU NATURALEZA:

SUSTANTIVOS CONCRETOS
- Se perciben con los sentidos
- Ejemplos: mesa, flor, música, perfume

SUSTANTIVOS ABSTRACTOS
- No se perciben con los sentidos
- Expresan ideas, sentimientos o cualidades
- Ejemplos: amor, libertad, justicia, belleza

3. GÉNERO DE LOS SUSTANTIVOS

MASCULINO:
- Generalmente terminan en -o
- Usan artículos: el, un, los, unos
- Ejemplos: el niño, el perro, el libro

FEMENINO:
- Generalmente terminan en -a
- Usan artículos: la, una, las, unas
- Ejemplos: la niña, la perra, la casa

EXCEPCIONES IMPORTANTES:
- Masculinos en -a: el día, el mapa, el planeta, el problema
- Femeninos en -o: la mano, la radio, la foto
- Sustantivos invariables: el/la estudiante, el/la artista

4. NÚMERO DE LOS SUSTANTIVOS

SINGULAR: Indica uno solo
- Ejemplos: gato, flor, lápiz

PLURAL: Indica más de uno
- Ejemplos: gatos, flores, lápices

FORMACIÓN DEL PLURAL:
- Palabras terminadas en vocal: +s (casa → casas)
- Palabras terminadas en consonante: +es (pared → paredes)
- Palabras terminadas en -z: cambia a -ces (lápiz → lápices)
- Palabras terminadas en -s (agudas): +es (autobús → autobuses)
- Palabras terminadas en -s (no agudas): no cambian (el lunes → los lunes)

5. FUNCIÓN EN LA ORACIÓN

El sustantivo puede ser:
- SUJETO de la oración: "El perro ladra"
- COMPLEMENTO del verbo: "Compré un libro"
- COMPLEMENTO de otro sustantivo: "La casa de Pedro"

6. ACOMPAÑANTES DEL SUSTANTIVO
- Artículos: el, la, los, las, un, una, unos, unas
- Adjetivos: grande, pequeño, rojo, hermoso
- Determinantes: este, ese, aquel, mi, tu, su
`;
  }
  
  // Verbos
  if (topicNormalized.includes('verbo') || topicNormalized.includes('verbos')) {
    return `
EL VERBO - Contenido del Libro de Lenguaje ${course}

CAPÍTULO: LAS CLASES DE PALABRAS - EL VERBO

1. DEFINICIÓN
El verbo es la palabra que expresa acción, estado o proceso. Es el núcleo del predicado y la palabra más importante de la oración.

2. ACCIDENTES DEL VERBO

PERSONA:
- Primera persona: quien habla (yo, nosotros)
- Segunda persona: a quien se habla (tú, ustedes, vosotros)
- Tercera persona: de quien se habla (él, ella, ellos, ellas)

NÚMERO:
- Singular: una persona (yo canto, tú cantas, él canta)
- Plural: varias personas (nosotros cantamos, ellos cantan)

TIEMPO:
- Presente: acción actual (yo camino)
- Pasado/Pretérito: acción ya realizada (yo caminé)
- Futuro: acción por realizarse (yo caminaré)

MODO:
- Indicativo: expresa hechos reales
- Subjuntivo: expresa deseos, dudas, posibilidades
- Imperativo: expresa órdenes o mandatos

3. CONJUGACIONES VERBALES

PRIMERA CONJUGACIÓN: Verbos terminados en -AR
- Infinitivo: amar, cantar, caminar, saltar
- Modelo: AMAR
  - Presente: amo, amas, ama, amamos, aman
  - Pretérito: amé, amaste, amó, amamos, amaron
  - Futuro: amaré, amarás, amará, amaremos, amarán

SEGUNDA CONJUGACIÓN: Verbos terminados en -ER
- Infinitivo: comer, beber, correr, temer
- Modelo: COMER
  - Presente: como, comes, come, comemos, comen
  - Pretérito: comí, comiste, comió, comimos, comieron
  - Futuro: comeré, comerás, comerá, comeremos, comerán

TERCERA CONJUGACIÓN: Verbos terminados en -IR
- Infinitivo: vivir, partir, escribir, subir
- Modelo: VIVIR
  - Presente: vivo, vives, vive, vivimos, viven
  - Pretérito: viví, viviste, vivió, vivimos, vivieron
  - Futuro: viviré, vivirás, vivirá, viviremos, vivirán

4. TIEMPOS SIMPLES Y COMPUESTOS

TIEMPOS SIMPLES (una sola palabra):
- Presente: canto
- Pretérito imperfecto: cantaba
- Pretérito perfecto simple: canté
- Futuro: cantaré
- Condicional: cantaría

TIEMPOS COMPUESTOS (verbo haber + participio):
- Pretérito perfecto compuesto: he cantado
- Pretérito pluscuamperfecto: había cantado
- Futuro perfecto: habré cantado
- Condicional perfecto: habría cantado

5. VERBOS REGULARES E IRREGULARES

VERBOS REGULARES:
- Siguen el modelo de su conjugación
- Mantienen su raíz sin cambios
- Ejemplos: amar, comer, vivir

VERBOS IRREGULARES:
- Cambian su raíz o sus desinencias
- No siguen completamente el modelo
- Ejemplos: ser, ir, tener, hacer, decir, poder

6. FORMAS NO PERSONALES DEL VERBO

INFINITIVO: Forma básica (termina en -ar, -er, -ir)
- Ejemplo: cantar, comer, vivir

GERUNDIO: Expresa acción en desarrollo
- Termina en -ando (1ª conj.) o -iendo (2ª y 3ª conj.)
- Ejemplo: cantando, comiendo, viviendo

PARTICIPIO: Forma que puede funcionar como adjetivo
- Termina en -ado (1ª conj.) o -ido (2ª y 3ª conj.)
- Ejemplo: cantado, comido, vivido
`;
  }
  
  // Comprensión lectora
  if (topicNormalized.includes('comprension lectora') || topicNormalized.includes('lectura')) {
    return `
COMPRENSIÓN LECTORA - Contenido del Libro de Lenguaje ${course}

CAPÍTULO: ESTRATEGIAS DE COMPRENSIÓN LECTORA

1. ¿QUÉ ES LA COMPRENSIÓN LECTORA?
Es la capacidad de entender lo que se lee, interpretando el significado de las palabras, las ideas del autor y el mensaje del texto.

2. NIVELES DE COMPRENSIÓN

NIVEL LITERAL
- Identificar información explícita en el texto
- Reconocer personajes, lugares, hechos
- Responder: ¿Qué? ¿Quién? ¿Dónde? ¿Cuándo?

NIVEL INFERENCIAL
- Deducir información no explícita
- Interpretar significados implícitos
- Relacionar ideas y sacar conclusiones

NIVEL CRÍTICO
- Evaluar el contenido del texto
- Formar opiniones propias
- Distinguir hechos de opiniones

3. ESTRATEGIAS ANTES DE LEER

ACTIVAR CONOCIMIENTOS PREVIOS
- ¿Qué sé sobre este tema?
- ¿Qué he leído antes sobre esto?

FORMULAR PREDICCIONES
- ¿De qué tratará el texto según el título?
- ¿Qué información espero encontrar?

ESTABLECER UN PROPÓSITO
- ¿Para qué voy a leer este texto?
- ¿Qué quiero aprender?

4. ESTRATEGIAS DURANTE LA LECTURA

SUBRAYAR IDEAS IMPORTANTES
- Identificar ideas principales
- Marcar palabras clave

HACER PREGUNTAS
- ¿Qué significa esta palabra?
- ¿Por qué sucede esto?

VISUALIZAR
- Crear imágenes mentales
- Imaginar la escena descrita

RELEER CUANDO SEA NECESARIO
- Volver a leer partes confusas
- Aclarar significados

5. ESTRATEGIAS DESPUÉS DE LEER

RESUMIR
- Expresar las ideas principales con tus palabras
- Organizar la información

EVALUAR
- ¿Entendí el texto?
- ¿Logré mi propósito de lectura?

RELACIONAR
- Conectar con experiencias personales
- Relacionar con otros textos

6. TIPOS DE TEXTOS

TEXTOS NARRATIVOS
- Cuentan una historia
- Tienen personajes, lugar, tiempo y acontecimientos
- Ejemplos: cuentos, novelas, fábulas

TEXTOS INFORMATIVOS
- Entregan información sobre un tema
- Organización clara de ideas
- Ejemplos: artículos, enciclopedias, noticias

TEXTOS ARGUMENTATIVOS
- Presentan opiniones y las defienden
- Incluyen argumentos y evidencias
- Ejemplos: ensayos, cartas al editor

TEXTOS INSTRUCTIVOS
- Indican cómo hacer algo
- Tienen pasos ordenados
- Ejemplos: recetas, manuales, instrucciones
`;
  }
  
  return null;
}

function generateGenericContent(topic: string, subject: string, course: string): string {
  return `
CONTENIDO EDUCATIVO: ${topic.toUpperCase()}
Libro: ${subject} - ${course}

UNIDAD DE APRENDIZAJE

1. INTRODUCCIÓN AL TEMA
${topic} es un contenido fundamental del currículo de ${subject} para ${course}. Su estudio permite desarrollar competencias específicas establecidas en los objetivos de aprendizaje.

2. OBJETIVOS DE APRENDIZAJE
Al finalizar esta unidad, los estudiantes serán capaces de:
- Comprender los conceptos básicos relacionados con ${topic}
- Identificar los elementos principales del tema
- Aplicar los conocimientos en situaciones prácticas
- Relacionar el tema con otros contenidos de ${subject}
- Desarrollar habilidades de pensamiento crítico

3. CONCEPTOS FUNDAMENTALES

3.1 Definición
${topic} se define como un conjunto de conocimientos y habilidades que permiten comprender aspectos importantes de ${subject}.

3.2 Características principales
- El tema presenta componentes esenciales que deben ser identificados
- Existe una estructura organizada de conceptos
- Se relaciona con otros temas del currículo
- Tiene aplicaciones en la vida cotidiana

3.3 Elementos clave
- Componente teórico: fundamentos conceptuales
- Componente práctico: aplicaciones y ejemplos
- Componente de evaluación: criterios de logro

4. DESARROLLO DEL CONTENIDO

4.1 Marco teórico
El estudio de ${topic} requiere una comprensión progresiva de sus componentes. Los estudiantes deben ser capaces de identificar, analizar y aplicar estos conocimientos.

4.2 Aspectos importantes
- Primera dimensión: conceptos básicos y definiciones
- Segunda dimensión: relaciones y conexiones
- Tercera dimensión: aplicaciones prácticas

4.3 Ejemplos y casos
Los ejemplos permiten ilustrar los conceptos de manera concreta, facilitando la comprensión y la transferencia del aprendizaje.

5. METODOLOGÍA DE ESTUDIO

5.1 Pasos para el aprendizaje
1. Lectura comprensiva del material
2. Identificación de ideas principales
3. Elaboración de resúmenes y esquemas
4. Aplicación en ejercicios prácticos
5. Autoevaluación del aprendizaje

5.2 Recursos de apoyo
- Textos escolares y material complementario
- Recursos digitales y multimedia
- Actividades grupales y colaborativas

6. ACTIVIDADES SUGERIDAS

ACTIVIDAD 1: Exploración inicial
- Investigar sobre ${topic}
- Compartir conocimientos previos

ACTIVIDAD 2: Análisis de casos
- Estudiar ejemplos concretos
- Identificar patrones y características

ACTIVIDAD 3: Aplicación práctica
- Resolver problemas relacionados
- Crear productos o presentaciones

7. EVALUACIÓN DEL APRENDIZAJE

Criterios de evaluación:
- Comprensión de conceptos fundamentales
- Capacidad de análisis y síntesis
- Aplicación práctica de conocimientos
- Trabajo colaborativo y participación

8. CONEXIONES CON OTROS CONTENIDOS

${topic} se relaciona con otros temas de ${subject} y con otras asignaturas del currículo, permitiendo una comprensión integrada del conocimiento.

9. IMPORTANCIA DEL TEMA

El dominio de ${topic} permite a los estudiantes:
- Avanzar en su comprensión de ${subject}
- Desarrollar habilidades de pensamiento crítico
- Aplicar conocimientos en situaciones reales
- Prepararse para contenidos más avanzados

10. SÍNTESIS

En resumen, ${topic} representa un contenido esencial que contribuye al desarrollo integral de los estudiantes de ${course} en el área de ${subject}.
`;
}
