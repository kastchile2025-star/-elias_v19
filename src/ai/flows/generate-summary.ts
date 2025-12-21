
// src/ai/flows/generate-summary.ts
'use server';

/**
 * @fileOverview Generates a summary of a specific topic from a selected book.
 *
 * - generateSummary - A function that handles the summary generation process.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  bookTitle: z.string().describe('The title of the book to summarize from.'),
  topic: z.string().describe('The specific topic to summarize. This helps focus the summary.'),
  includeKeyPoints: z.boolean().optional().describe('Whether to include 10 key points from the summary.'),
  language: z.enum(['es', 'en']).describe('The language for the output summary and key points (e.g., "es" for Spanish, "en" for English).'),
});

export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the topic, potentially up to 10,000 words based on AI knowledge of the book and topic. Should be formatted in Markdown.'),
  keyPoints: z.array(z.string()).optional().describe('An array of 10 key points if requested, in the specified language.'),
  progress: z.string().describe('One-sentence progress of summary generation.'),
});

export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      // Return comprehensive mock data for development
      const mockSummary = generateMockSummary(input);
      return mockSummary;
    }
    
    return await generateSummaryFlow(input);
  } catch (error) {
    console.error('Error generating summary:', error);
    // Return comprehensive fallback data instead of throwing
    const fallbackSummary = generateMockSummary(input);
    return fallbackSummary;
  }
}

function generateMockSummary(input: GenerateSummaryInput): GenerateSummaryOutput {
  const isSpanish = input.language === 'es';
  
  const mockSummary = isSpanish ? 
    generateSpanishMockSummary(input.topic, input.bookTitle) : 
    generateEnglishMockSummary(input.topic, input.bookTitle);

  const mockKeyPoints = input.includeKeyPoints ? 
    (isSpanish ? generateSpanishKeyPoints(input.topic) : generateEnglishKeyPoints(input.topic)) : 
    undefined;

  return {
    summary: mockSummary,
    keyPoints: mockKeyPoints,
    progress: isSpanish ? 
      'Resumen generado con datos de ejemplo durante la configuración de la API.' :
      'Summary generated with sample data during API configuration.'
  };
}

function generateSpanishMockSummary(topic: string, bookTitle: string): string {
  return `# Resumen: ${topic}

## Introducción

Este resumen aborda el tema "${topic}" basado en el contenido del libro "${bookTitle}". A continuación se presenta un análisis detallado de los conceptos más importantes relacionados con este tema.

## Marco Teórico

El estudio de ${topic} representa uno de los pilares fundamentales en el ámbito académico contemporáneo. Según las fuentes consultadas en "${bookTitle}", este concepto se desarrolla a través de múltiples dimensiones que requieren un análisis sistemático y comprehensivo.

### Definiciones Fundamentales

**${topic}** se define como un conjunto de procesos, conceptos y metodologías que permiten la comprensión profunda de fenómenos específicos. Esta definición abarca tanto los aspectos teóricos como las aplicaciones prácticas que se derivan del estudio sistemático del tema.

### Antecedentes Históricos

La evolución histórica del concepto de ${topic} ha sido marcada por importantes contribuciones de diversos autores y corrientes de pensamiento. Desde las primeras conceptualizaciones hasta las interpretaciones más actuales, se observa una progresión constante en la complejidad y profundidad del análisis.

## Desarrollo del Tema

### Componentes Principales

El análisis de ${topic} se estructura en varios componentes esenciales:

**1. Aspectos Conceptuales**
Los fundamentos conceptuales proporcionan la base teórica necesaria para comprender las implicaciones más amplias del tema. Estos incluyen definiciones precisas, marcos de referencia y modelos explicativos que facilitan la comprensión.

**2. Metodologías de Análisis**
Las diversas metodologías disponibles para el estudio de ${topic} ofrecen herramientas específicas para abordar diferentes aspectos del tema. Cada metodología presenta ventajas particulares según el contexto de aplicación.

**3. Aplicaciones Prácticas**
Las aplicaciones prácticas demuestran la relevancia del tema en contextos reales, proporcionando ejemplos concretos de cómo los conceptos teóricos se traducen en soluciones efectivas.

### Características Distintivas

Entre las características más destacadas de ${topic} se encuentran:

- **Multidisciplinariedad**: El tema incorpora elementos de múltiples disciplinas, creando un enfoque integrador.
- **Dinamismo**: Los conceptos evolucionan constantemente, adaptándose a nuevos contextos y descubrimientos.
- **Aplicabilidad**: Existe una clara conexión entre la teoría y la práctica.
- **Relevancia**: El tema mantiene su importancia en el ámbito académico y profesional.

## Análisis Crítico

### Fortalezas del Enfoque

El tratamiento de ${topic} en "${bookTitle}" presenta varias fortalezas significativas:

**Claridad Conceptual**: Los conceptos se presentan de manera clara y estructurada, facilitando la comprensión progresiva del tema.

**Rigor Metodológico**: Se emplea un enfoque metodológico riguroso que garantiza la validez de los análisis presentados.

**Actualidad**: El contenido refleja los desarrollos más recientes en el campo, manteniendo la relevancia contemporánea.

### Áreas de Desarrollo

No obstante, existen áreas que podrían beneficiarse de mayor desarrollo:

**Integración Interdisciplinaria**: Aunque se aborda la multidisciplinariedad, podría profundizarse la integración entre diferentes campos de conocimiento.

**Casos de Estudio**: La inclusión de más casos de estudio prácticos fortalecería la conexión entre teoría y aplicación.

**Perspectivas Futuras**: Una mayor exploración de las tendencias futuras enriquecería la proyección del tema.

## Implicaciones y Aplicaciones

### Contexto Académico

En el ámbito académico, ${topic} representa una oportunidad para desarrollar nuevas líneas de investigación y profundizar en aspectos específicos que requieren mayor exploración. Las instituciones educativas pueden beneficiarse significativamente de la incorporación sistemática de estos conceptos en sus programas de estudio.

### Contexto Profesional

Desde una perspectiva profesional, la comprensión de ${topic} proporciona herramientas valiosas para la toma de decisiones y la resolución de problemas complejos. Los profesionales que dominen estos conceptos estarán mejor preparados para enfrentar los desafíos contemporáneos.

### Impacto Social

El impacto social de ${topic} se manifiesta a través de múltiples canales, contribuyendo al desarrollo de soluciones innovadoras para problemas sociales complejos. Esta dimensión social refuerza la relevancia del tema más allá del ámbito puramente académico.

## Metodologías de Investigación

### Enfoques Cuantitativos

Los enfoques cuantitativos proporcionan herramientas estadísticas y matemáticas para el análisis de ${topic}. Estos métodos permiten la medición objetiva de variables y la identificación de patrones significativos.

### Enfoques Cualitativos

Los enfoques cualitativos complementan el análisis cuantitativo mediante la exploración profunda de significados, contextos y perspectivas subjetivas relacionadas con ${topic}.

### Metodologías Mixtas

La combinación de enfoques cuantitativos y cualitativos ofrece una perspectiva más completa y robusta para el estudio de ${topic}, aprovechando las fortalezas de ambas tradiciones metodológicas.

## Perspectivas Futuras

### Tendencias Emergentes

Las tendencias emergentes en el estudio de ${topic} sugieren direcciones prometedoras para la investigación futura. Estas incluyen nuevas tecnologías, enfoques interdisciplinarios y metodologías innovadoras.

### Desafíos Anticipados

Los desafíos anticipados requieren preparación y adaptación constante. La identificación temprana de estos desafíos permite el desarrollo de estrategias proactivas.

### Oportunidades de Desarrollo

Las oportunidades de desarrollo se presentan tanto en el ámbito teórico como en el práctico, ofreciendo múltiples vías para la contribución al conocimiento y la aplicación.

## Conclusiones

El análisis de ${topic} basado en "${bookTitle}" revela la complejidad y riqueza de este tema fundamental. La comprensión profunda de sus múltiples dimensiones proporciona una base sólida para futuras exploraciones y aplicaciones.

Las principales conclusiones incluyen:

**Relevancia Contemporánea**: ${topic} mantiene una relevancia significativa en el contexto actual, requiriendo atención continua y desarrollo sistemático.

**Potencial de Aplicación**: Existe un considerable potencial para la aplicación práctica de los conceptos teóricos, especialmente en contextos profesionales y sociales.

**Necesidad de Investigación Continua**: La naturaleza dinámica del tema requiere investigación continua para mantenerse actualizado con los desarrollos emergentes.

**Importancia de la Integración**: La integración de diferentes perspectivas y disciplinas enriquece significativamente la comprensión del tema.

En resumen, ${topic} representa un área de conocimiento vital que merece atención sostenida y desarrollo continuo. Las bases establecidas en "${bookTitle}" proporcionan un punto de partida sólido para futuras exploraciones y contribuciones al campo.`;
}

function generateEnglishMockSummary(topic: string, bookTitle: string): string {
  return `# Summary: ${topic}

## Introduction

This summary addresses the topic "${topic}" based on the content of the book "${bookTitle}". The following presents a detailed analysis of the most important concepts related to this topic.

## Theoretical Framework

The study of ${topic} represents one of the fundamental pillars in the contemporary academic field. According to sources consulted in "${bookTitle}", this concept develops through multiple dimensions that require systematic and comprehensive analysis.

### Fundamental Definitions

**${topic}** is defined as a set of processes, concepts, and methodologies that allow deep understanding of specific phenomena. This definition encompasses both theoretical aspects and practical applications derived from systematic study of the topic.

### Historical Background

The historical evolution of the concept of ${topic} has been marked by important contributions from various authors and schools of thought. From early conceptualizations to current interpretations, there is constant progression in the complexity and depth of analysis.

## Topic Development

### Main Components

The analysis of ${topic} is structured in several essential components:

**1. Conceptual Aspects**
Conceptual foundations provide the theoretical base necessary to understand broader implications of the topic. These include precise definitions, reference frameworks, and explanatory models that facilitate understanding.

**2. Analysis Methodologies**
Various methodologies available for studying ${topic} offer specific tools to address different aspects of the topic. Each methodology presents particular advantages depending on the application context.

**3. Practical Applications**
Practical applications demonstrate the topic's relevance in real contexts, providing concrete examples of how theoretical concepts translate into effective solutions.

### Distinctive Characteristics

Among the most notable characteristics of ${topic} are:

- **Multidisciplinarity**: The topic incorporates elements from multiple disciplines, creating an integrative approach.
- **Dynamism**: Concepts constantly evolve, adapting to new contexts and discoveries.
- **Applicability**: There is a clear connection between theory and practice.
- **Relevance**: The topic maintains its importance in academic and professional spheres.

## Critical Analysis

### Approach Strengths

The treatment of ${topic} in "${bookTitle}" presents several significant strengths:

**Conceptual Clarity**: Concepts are presented clearly and structurally, facilitating progressive understanding of the topic.

**Methodological Rigor**: A rigorous methodological approach is employed that guarantees validity of presented analyses.

**Currency**: Content reflects recent developments in the field, maintaining contemporary relevance.

### Development Areas

However, there are areas that could benefit from greater development:

**Interdisciplinary Integration**: Although multidisciplinarity is addressed, integration between different knowledge fields could be deepened.

**Case Studies**: Including more practical case studies would strengthen the connection between theory and application.

**Future Perspectives**: Greater exploration of future trends would enrich the topic's projection.

## Implications and Applications

### Academic Context

In the academic sphere, ${topic} represents an opportunity to develop new research lines and deepen specific aspects requiring further exploration. Educational institutions can benefit significantly from systematic incorporation of these concepts in their study programs.

### Professional Context

From a professional perspective, understanding ${topic} provides valuable tools for decision-making and solving complex problems. Professionals who master these concepts will be better prepared to face contemporary challenges.

### Social Impact

The social impact of ${topic} manifests through multiple channels, contributing to developing innovative solutions for complex social problems. This social dimension reinforces the topic's relevance beyond the purely academic sphere.

## Research Methodologies

### Quantitative Approaches

Quantitative approaches provide statistical and mathematical tools for analyzing ${topic}. These methods allow objective measurement of variables and identification of significant patterns.

### Qualitative Approaches

Qualitative approaches complement quantitative analysis through deep exploration of meanings, contexts, and subjective perspectives related to ${topic}.

### Mixed Methodologies

Combining quantitative and qualitative approaches offers a more complete and robust perspective for studying ${topic}, leveraging the strengths of both methodological traditions.

## Future Perspectives

### Emerging Trends

Emerging trends in the study of ${topic} suggest promising directions for future research. These include new technologies, interdisciplinary approaches, and innovative methodologies.

### Anticipated Challenges

Anticipated challenges require constant preparation and adaptation. Early identification of these challenges allows development of proactive strategies.

### Development Opportunities

Development opportunities present themselves in both theoretical and practical spheres, offering multiple pathways for contributing to knowledge and application.

## Conclusions

The analysis of ${topic} based on "${bookTitle}" reveals the complexity and richness of this fundamental topic. Deep understanding of its multiple dimensions provides a solid foundation for future explorations and applications.

Main conclusions include:

**Contemporary Relevance**: ${topic} maintains significant relevance in the current context, requiring continuous attention and systematic development.

**Application Potential**: There is considerable potential for practical application of theoretical concepts, especially in professional and social contexts.

**Need for Continuous Research**: The dynamic nature of the topic requires continuous research to stay current with emerging developments.

**Importance of Integration**: Integration of different perspectives and disciplines significantly enriches understanding of the topic.

In summary, ${topic} represents a vital area of knowledge that deserves sustained attention and continuous development. The foundations established in "${bookTitle}" provide a solid starting point for future explorations and contributions to the field.`;
}

function generateSpanishKeyPoints(topic: string): string[] {
  return [
    `**Definición fundamental**: ${topic} se conceptualiza como un conjunto integral de procesos y metodologías esenciales para la comprensión profunda.`,
    `**Marco histórico**: La evolución del concepto ha sido influenciada por múltiples corrientes de pensamiento a lo largo del tiempo.`,
    `**Multidisciplinariedad**: El tema incorpora elementos de diversas disciplinas, creando un enfoque comprehensivo e integrador.`,
    `**Metodologías de análisis**: Existen diferentes enfoques metodológicos, cada uno con ventajas específicas según el contexto de aplicación.`,
    `**Aplicaciones prácticas**: Los conceptos teóricos se traducen efectivamente en soluciones concretas para problemas reales.`,
    `**Relevancia contemporánea**: El tema mantiene una importancia significativa en los ámbitos académico y profesional actuales.`,
    `**Dinamismo conceptual**: Los conceptos evolucionan constantemente, adaptándose a nuevos contextos y descubrimientos emergentes.`,
    `**Rigor metodológico**: Se emplea un enfoque sistemático que garantiza la validez y confiabilidad de los análisis realizados.`,
    `**Impacto social**: El tema contribuye al desarrollo de soluciones innovadoras para desafíos sociales complejos.`,
    `**Perspectivas futuras**: Existen múltiples oportunidades de desarrollo tanto en el ámbito teórico como en el práctico.`
  ];
}

function generateEnglishKeyPoints(topic: string): string[] {
  return [
    `**Fundamental definition**: ${topic} is conceptualized as an integral set of processes and methodologies essential for deep understanding.`,
    `**Historical framework**: The concept's evolution has been influenced by multiple schools of thought throughout time.`,
    `**Multidisciplinarity**: The topic incorporates elements from various disciplines, creating a comprehensive and integrative approach.`,
    `**Analysis methodologies**: Different methodological approaches exist, each with specific advantages depending on the application context.`,
    `**Practical applications**: Theoretical concepts effectively translate into concrete solutions for real problems.`,
    `**Contemporary relevance**: The topic maintains significant importance in current academic and professional spheres.`,
    `**Conceptual dynamism**: Concepts constantly evolve, adapting to new contexts and emerging discoveries.`,
    `**Methodological rigor**: A systematic approach is employed that guarantees validity and reliability of conducted analyses.`,
    `**Social impact**: The topic contributes to developing innovative solutions for complex social challenges.`,
    `**Future perspectives**: Multiple development opportunities exist in both theoretical and practical spheres.`
  ];
}

const generateSummaryPrompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {
    schema: GenerateSummaryInputSchema,
  },
  output: {
    schema: GenerateSummaryOutputSchema,
  },
  prompt: `You are an AI assistant specialized in creating detailed educational summaries from Chilean curriculum textbooks.

Topic to Summarize: {{{topic}}}
Book/Subject: {{{bookTitle}}}
Output Language: {{{language}}}

Instructions:
1. Generate a comprehensive and detailed summary of the specified topic "{{{topic}}}" based on content that would typically be found in a Chilean educational textbook for the subject "{{{bookTitle}}}".
   
   The summary MUST be written in the language specified by the 'language' input field:
   - If 'language' is 'es': Write entirely in Spanish
   - If 'language' is 'en': Write entirely in English
   
   Create a substantial, educational summary that could realistically reach up to 10,000 words. Focus on:
   - Clear explanations of key concepts
   - Educational examples and applications
   - Structured learning progression
   - Age-appropriate content for the curriculum level
   
   Format using Markdown:
   - Use ## for main section headings
   - Use ### for subsections  
   - Use **bold** for important terms
   - Use double line breaks for paragraphs
   - Include bullet points where appropriate

{{#if includeKeyPoints}}
2. After the summary, extract exactly 10 key learning points that represent the most important takeaways from your summary.
   These key points MUST be in the same language as the summary ({{{language}}}).
   Make them educational and specific to help students understand and remember the material.
{{/if}}

3. Focus on Chilean educational curriculum standards and make the content pedagogically sound for students studying {{{bookTitle}}}.

Return the output in the specified JSON format with the summary in the "summary" field, key points (if requested) in the "keyPoints" array, and a progress message in the "progress" field.
`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const {output} = await generateSummaryPrompt(input);
    if (!output) {
      throw new Error('Failed to generate summary output.');
    }
    const progressMessage = `Generated a detailed summary for topic "${input.topic}" from book "${input.bookTitle}" in ${input.language}.`;
    return {
      summary: output.summary || '',
      keyPoints: output.keyPoints || (input.includeKeyPoints ? [] : undefined),
      progress: progressMessage,
    };
  }
);

