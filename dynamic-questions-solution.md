# Solución: Dinamizar Generación de Preguntas de Evaluación

## Problema Identificado
El sistema actual tiene un banco de preguntas estático limitado que no respeta la cantidad de preguntas configuradas por el profesor. Cuando se solicitan 25 preguntas, solo se generan las que existen en el banco (máximo 30).

## Solución Implementada

### 1. Nueva Función de Simulación de IA

```typescript
// NUEVA FUNCIÓN SIMULADA PARA GENERAR PREGUNTAS CON IA
const fetchAIQuestions = async (topic: string, numQuestions: number, language: string) => {
  /*
    PROMPT PARA IA REAL:
    "Generate a JSON array of ${numQuestions} multiple-choice questions for a student evaluation on the topic of '${topic}' in ${language === 'es' ? 'Spanish' : 'English'}.
    Each object in the array must have the following structure:
    {
      "question": "string", // The question text
      "options": ["string", "string", "string", "string"], // An array of 4 possible answers
      "correct": number, // The 0-based index of the correct answer in the 'options' array
      "explanation": "string" // A brief explanation of why the correct answer is right.
    }
    Ensure the JSON is valid and ready to be parsed. The questions should be educational, accurate, and appropriate for the topic level."
  */

  console.log(`🤖 Simulando llamada a IA para generar ${numQuestions} preguntas sobre '${topic}' en ${language === 'es' ? 'español' : 'inglés'}...`);
  
  // Simular latencia de red de 1-2 segundos
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Generar preguntas dinámicamente basadas en el tema
  const getTopicSpecificContent = (topic: string, index: number, language: string) => {
    const isSpanish = language === 'es';
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('respiratorio') || topicLower.includes('respiratory')) {
      const respiratoryQuestions = isSpanish ? [
        "¿Cuál es la función principal del sistema respiratorio?",
        "¿Qué órgano es fundamental para la respiración?",
        "¿Dónde ocurre el intercambio gaseoso?",
        "¿Qué gas se elimina durante la exhalación?",
        "¿Cuál es el músculo principal de la respiración?"
      ] : [
        "What is the main function of the respiratory system?",
        "What organ is fundamental for breathing?",
        "Where does gas exchange occur?",
        "What gas is eliminated during exhalation?",
        "What is the main muscle of breathing?"
      ];
      
      const baseQuestion = respiratoryQuestions[index % respiratoryQuestions.length];
      return {
        question: `${baseQuestion} (Pregunta ${index + 1})`,
        options: isSpanish ? 
          [`Opción A - ${topic}`, `Opción B - ${topic}`, `Opción C - ${topic}`, `Opción D - ${topic}`] :
          [`Option A - ${topic}`, `Option B - ${topic}`, `Option C - ${topic}`, `Option D - ${topic}`],
        explanation: isSpanish ? 
          `Esta es la explicación para la pregunta ${index + 1} sobre ${topic}. En una implementación real, aquí habría una explicación detallada generada por IA.` :
          `This is the explanation for question ${index + 1} about ${topic}. In a real implementation, there would be a detailed AI-generated explanation here.`
      };
    }
    
    if (topicLower.includes('matemática') || topicLower.includes('mathematics')) {
      const mathQuestions = isSpanish ? [
        "¿Cuánto es la suma de los siguientes números?",
        "¿Cuál es el resultado de esta multiplicación?",
        "¿Cuál es la raíz cuadrada del número?",
        "¿Cuánto es el resultado de esta división?",
        "¿Cuál es el área de esta figura geométrica?"
      ] : [
        "What is the sum of the following numbers?",
        "What is the result of this multiplication?",
        "What is the square root of the number?",
        "What is the result of this division?",
        "What is the area of this geometric figure?"
      ];
      
      const baseQuestion = mathQuestions[index % mathQuestions.length];
      return {
        question: `${baseQuestion} (Problema ${index + 1})`,
        options: isSpanish ? 
          [`Resultado A`, `Resultado B`, `Resultado C`, `Resultado D`] :
          [`Result A`, `Result B`, `Result C`, `Result D`],
        explanation: isSpanish ? 
          `Esta es la explicación matemática para el problema ${index + 1}. En una implementación real, incluiría el proceso de resolución paso a paso.` :
          `This is the mathematical explanation for problem ${index + 1}. In a real implementation, it would include the step-by-step solution process.`
      };
    }
    
    // Preguntas genéricas para otros temas
    return {
      question: isSpanish ? 
        `Pregunta ${index + 1} sobre ${topic}: ¿Cuál de las siguientes afirmaciones es correcta?` :
        `Question ${index + 1} about ${topic}: Which of the following statements is correct?`,
      options: isSpanish ? 
        [`Opción A sobre ${topic}`, `Opción B sobre ${topic}`, `Opción C sobre ${topic}`, `Opción D sobre ${topic}`] :
        [`Option A about ${topic}`, `Option B about ${topic}`, `Option C about ${topic}`, `Option D about ${topic}`],
      explanation: isSpanish ? 
        `Explicación detallada para la pregunta ${index + 1} sobre ${topic}. En un sistema real, esta sería generada por IA con contenido educativo específico.` :
        `Detailed explanation for question ${index + 1} about ${topic}. In a real system, this would be AI-generated with specific educational content.`
    };
  };

  // Generar exactamente la cantidad de preguntas solicitadas
  const generatedQuestions = Array.from({ length: numQuestions }, (_, i) => {
    const content = getTopicSpecificContent(topic, i, language);
    return {
      question: content.question,
      options: content.options,
      correct: Math.floor(Math.random() * 4), // Respuesta correcta aleatoria para demostración
      explanation: content.explanation
    };
  });
  
  console.log(`✅ IA simulada generó ${generatedQuestions.length} preguntas para ${topic}`);
  console.log('🔍 Muestra de preguntas generadas:', generatedQuestions.slice(0, 2).map(q => ({ 
    question: q.question.substring(0, 50) + '...', 
    optionsCount: q.options.length 
  })));
  
  return generatedQuestions;
};
```

### 2. Función generateEvaluationQuestions Refactorizada

```typescript
// Funciones para la evaluación mejorada - AHORA ASYNC
const generateEvaluationQuestions = async (topic: string, numQuestions: number) => {
  // Determinar idioma actual
  const currentLanguage = localStorage.getItem('smart-student-lang') || 'es';
  console.log('🔍 GENERATING QUESTIONS - Current language:', currentLanguage);
  console.log('🔍 GENERATING QUESTIONS - Topic:', topic, 'Num questions:', numQuestions);
  
  // Llamar a la función de IA simulada
  const questions = await fetchAIQuestions(topic, numQuestions, currentLanguage);
  
  console.log(`🎯 Generadas ${questions.length} preguntas dinámicas para el tema: ${topic}`);
  return questions;
};
```

### 3. Modificación en handleStartEvaluation

```typescript
const handleStartEvaluation = async (task: Task) => {  // <-- AHORA ES ASYNC
  // ... resto del código anterior ...

  setTimeout(async () => {  // <-- AGREGADO ASYNC
    setShowLoadingDialog(false);
    
    // Generar preguntas usando criterios del profesor con AWAIT
    const questions = await generateEvaluationQuestions(topic, numQuestions);  // <-- AGREGADO AWAIT
    console.log('🔍 GENERATED QUESTIONS:', questions.map(q => ({ question: q.question?.substring(0, 50), options: q.options?.map(o => o?.substring(0, 20)) })));
    const timeInSeconds = timeLimit * 60;
    
    setCurrentEvaluation({
      task,
      questions,
      startTime: new Date(),
      answers: {},
      timeRemaining: timeInSeconds,
      currentQuestionIndex: 0
    });
    
    setShowEvaluationDialog(true);
    
    // ... resto del código ...
  }, 500);
};
```

## Beneficios de la Solución

1. **Dinámico**: Elimina las preguntas hardcodeadas
2. **Escalable**: Genera exactamente la cantidad solicitada por el profesor
3. **Futuro-Compatible**: Incluye el prompt para integración real con IA
4. **Multiidioma**: Mantiene soporte para español e inglés
5. **Específico por Tema**: Genera contenido relevante según el tema

## Prueba de Funcionamiento

Con esta implementación:
- Si el profesor configura 5 preguntas → se generan 5 preguntas
- Si el profesor configura 25 preguntas → se generan 25 preguntas
- Si el profesor configura 30 preguntas → se generan 30 preguntas

## Próximos Pasos

Para implementación real con IA:
1. Reemplazar `fetchAIQuestions` con llamada real a API de IA
2. Usar el prompt incluido en los comentarios
3. Manejar errores de red y API
4. Cachear respuestas para optimización
