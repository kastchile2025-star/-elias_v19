// Script para diagnosticar el problema en el endpoint de la API
// Este script simula exactamente lo que envía handleRepeatEvaluation al servidor

console.log('🔧 DIAGNÓSTICO DEL ENDPOINT API - generate-dynamic-evaluation');

// Simular el payload exacto que se envía
const testPayload = {
  bookTitle: "Anatomía",
  topic: "SISTEMA RESPIRATORIO", 
  language: "en",  // ← ESTE ES EL PROBLEMA
  pdfContent: "",
  questionCount: 15,
  timeLimit: 120
};

console.log('📤 Payload que se envía al endpoint:', JSON.stringify(testPayload, null, 2));

// Función para probar el endpoint
async function testEndpoint() {
  try {
    console.log('🚀 Enviando request a /api/generate-dynamic-evaluation...');
    
    const response = await fetch('/api/generate-dynamic-evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Response received successfully');
    console.log('📊 Response structure:', {
      hasData: !!data.data,
      hasQuestions: !!data.data?.questions,
      questionCount: data.data?.questions?.length,
      evaluationTitle: data.data?.evaluationTitle
    });
    
    // Verificar el idioma de las preguntas
    if (data.data?.questions?.length > 0) {
      const firstQuestion = data.data.questions[0];
      const questionText = firstQuestion.question;
      
      console.log('🔍 ANÁLISIS DEL IDIOMA DE LA PRIMERA PREGUNTA:');
      console.log('📝 Texto de la pregunta:', questionText);
      
      // Detectar idioma basado en palabras clave
      const spanishKeywords = ['cuál', 'cuáles', 'qué', 'por qué', 'cómo', 'dónde', 'cuándo', 'función', 'principal', 'siguiente', 'correcta', 'respuesta'];
      const englishKeywords = ['what', 'which', 'how', 'where', 'when', 'why', 'function', 'main', 'following', 'correct', 'answer'];
      
      const lowerQuestion = questionText.toLowerCase();
      const hasSpanishWords = spanishKeywords.some(word => lowerQuestion.includes(word));
      const hasEnglishWords = englishKeywords.some(word => lowerQuestion.includes(word));
      
      console.log('🔍 Detección de idioma automática:');
      console.log('  - Palabras en español encontradas:', hasSpanishWords);
      console.log('  - Palabras en inglés encontradas:', hasEnglishWords);
      console.log('  - Idioma detectado:', hasSpanishWords && !hasEnglishWords ? 'ESPAÑOL' : hasEnglishWords && !hasSpanishWords ? 'INGLÉS' : 'INDETERMINADO');
      
      // Verificar opciones de respuesta
      if (firstQuestion.options) {
        console.log('📝 Opciones de respuesta:');
        firstQuestion.options.forEach((option, index) => {
          console.log(`  ${String.fromCharCode(65 + index)}. ${option}`);
        });
      }
      
      // RESULTADO FINAL
      if (hasSpanishWords && !hasEnglishWords) {
        console.log('❌ PROBLEMA CONFIRMADO: API devolvió contenido en ESPAÑOL a pesar de language="en"');
      } else if (hasEnglishWords && !hasSpanishWords) {
        console.log('✅ FUNCIONANDO CORRECTAMENTE: API devolvió contenido en INGLÉS como se esperaba');
      } else {
        console.log('⚠️ RESULTADO AMBIGUO: No se puede determinar el idioma claramente');
      }
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Error en el test del endpoint:', error);
    return null;
  }
}

// Función para probar con diferentes payloads
async function runComprehensiveTest() {
  console.log('🧪 INICIANDO PRUEBAS COMPRENSIVAS...\n');
  
  // Test 1: Con language: "en"
  console.log('🧪 TEST 1: language="en"');
  testPayload.language = "en";
  const result1 = await testEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Con language: "es"
  console.log('🧪 TEST 2: language="es"');
  testPayload.language = "es";
  const result2 = await testEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Comparación
  console.log('📊 COMPARACIÓN DE RESULTADOS:');
  if (result1 && result2) {
    const q1 = result1.data?.questions?.[0]?.question || '';
    const q2 = result2.data?.questions?.[0]?.question || '';
    
    console.log('🇺🇸 Question with language="en":', q1.substring(0, 100) + '...');
    console.log('🇪🇸 Question with language="es":', q2.substring(0, 100) + '...');
    
    if (q1 === q2) {
      console.log('❌ PROBLEMA CRÍTICO: Ambas requests devolvieron el mismo contenido!');
    } else {
      console.log('✅ Las requests devolvieron contenido diferente (esperado)');
    }
  }
}

// Exportar funciones para uso manual
window.testApiEndpoint = testEndpoint;
window.runComprehensiveApiTest = runComprehensiveTest;

console.log('🎯 Funciones disponibles:');
console.log('- testApiEndpoint(): Probar el endpoint una vez');
console.log('- runComprehensiveApiTest(): Probar con inglés y español');
console.log('\nEjecuta cualquiera de estas funciones en la consola para diagnosticar el problema.');
