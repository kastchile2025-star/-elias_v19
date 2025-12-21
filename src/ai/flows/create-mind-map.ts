/**
 * @fileOverview Generates a mind map image from a central theme and book content.
 * This involves two steps:
 * 1. Generating a structured representation of the mind map (nodes and sub-nodes).
 * 2. Rendering this structured data as a mind map image, allowing for horizontal or vertical orientation.
 *
 * - createMindMap - A function that generates a mind map image.
 * - CreateMindMapInput - The input type for the createMindMap function.
 * - CreateMindMapOutput - The return type for the createMindMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input for the entire flow
const CreateMindMapInputSchema = z.object({
  centralTheme: z.string().describe('The central theme of the mind map.'),
  bookTitle: z.string().describe('The title of the book to provide context for the mind map content.'),
  language: z.enum(['es', 'en']).describe('The language for the node labels (e.g., "es" for Spanish, "en" for English).'),
  isHorizontal: z.boolean().optional().describe('Whether the mind map should be rendered horizontally. Defaults to vertical.')
});
export type CreateMindMapInput = z.infer<typeof CreateMindMapInputSchema>;

// Output for the entire flow
const CreateMindMapOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated mind map image as a data URI.'),
});
export type CreateMindMapOutput = z.infer<typeof CreateMindMapOutputSchema>;


// Schema for the structured mind map data
const MindMapNodeSchema: z.ZodType<any> = z.object({
  label: z.string().describe('The text label for this node.'),
  children: z.array(z.lazy(() => MindMapNodeSchema)).optional().describe('Optional child nodes, forming sub-topics.'),
});
export type MindMapNode = z.infer<typeof MindMapNodeSchema>;

const MindMapStructureSchema = z.object({
  centralThemeLabel: z.string().describe('The label for the central theme, confirmed or refined by the AI.'),
  mainBranches: z.array(MindMapNodeSchema).describe('An array of main ideas branching from the central theme. Aim for 3-5 main branches for clarity. Each main branch can have 2-3 sub-topics.'),
});
export type MindMapStructure = z.infer<typeof MindMapStructureSchema>;

// Schema for rendering the image (combines structure with orientation preference)
const RenderImageInputSchema = MindMapStructureSchema.extend({
  isHorizontal: z.boolean().optional(),
});
export type RenderImageInput = z.infer<typeof RenderImageInputSchema>;


// Prompt to generate the mind map's textual structure
const generateMindMapStructurePrompt = ai.definePrompt({
  name: 'generateMindMapStructurePrompt',
  // Input uses CreateMindMapInputSchema to get language, theme, book
  input: { schema: CreateMindMapInputSchema }, 
  output: { schema: MindMapStructureSchema }, 
  prompt: `You are an expert in instructional design and content organization.
Based on the book titled "{{bookTitle}}", generate a hierarchical structure for a conceptual map.
The central theme is: "{{centralTheme}}".
The language for all node labels must be: {{language}}.

Your task is to:
1.  Confirm or slightly refine the central theme label if necessary for clarity, ensuring it's concise.
2.  Identify 3 to 5 main concepts or topics directly related to this central theme, as found in the book. These will be the main branches.
3.  For each main branch, identify 2 to 3 key sub-topics or supporting details from the book. These sub-topics form a connected hierarchy under their parent main branch.
4.  Ensure all labels (central theme, main branches, sub-topics) are concise, clear, and in the specified language ({{language}}).
5.  Structure the output according to the MindMapStructureSchema. All generated nodes must be part of this connected hierarchy.

Example of desired output structure (conceptual):
{
  "centralThemeLabel": "Photosynthesis (FOTOSÍNTESIS)",
  "mainBranches": [
    { "label": "Inputs (Entradas)", "children": [{ "label": "Light (Luz)" }, { "label": "Water (Agua)" }, { "label": "CO2" }] },
    { "label": "Process (Proceso)", "children": [{ "label": "Light Reactions (Reacciones Luminosas)" }, { "label": "Calvin Cycle (Ciclo de Calvin)" }] },
    { "label": "Outputs (Salidas)", "children": [{ "label": "Glucose (Glucosa)" }, { "label": "Oxygen (Oxígeno)" }] }
  ]
}
Focus on accuracy and relevance to the book content. Ensure a clear hierarchical structure suitable for a conceptual map where all nodes are interconnected.
`,
});

// This internal prompt definition is used to render the structured data into a string for the image model.
const renderMindMapImageHandlebarsPrompt = ai.definePrompt({
  name: 'renderMindMapImageHandlebarsPrompt',
  input: { schema: RenderImageInputSchema }, // Uses the combined schema
  prompt: `You are an expert at creating clear, visually appealing, and informative conceptual map IMAGES in a diagrammatic style.
Generate a conceptual map IMAGE based on the EXACT structure, text, and styling cues provided below.
Do NOT generate text output, only the IMAGE. The image should be a clean, diagrammatic conceptual map. Avoid artistic or overly stylized renderings. The background should be simple and not interfere with text legibility.

The absolute MOST IMPORTANT requirement is that ALL TEXT in EVERY NODE must be perfectly clear, easily readable, and large enough to be distinguished. Use a simple, legible sans-serif font. Ensure good contrast between the text and its node background. Each text label you are given MUST be rendered as a distinct, clearly readable text element within its own node in the image.

The textual content for each node is GIVEN to you below. You MUST use this exact text.

Central Theme (Main Node): "{{centralThemeLabel}}"

Main Ideas branching from the Central Theme:
{{#each mainBranches}}
- Main Idea Node: "{{label}}"
  {{#if children.length}}
  Sub-topics/concepts branching from "{{label}}":
    {{#each children}}
    - Sub-topic Node: "{{this.label}}"
      {{#if this.children.length}}
      Further sub-topics for "{{this.label}}":
        {{#each this.children}}
        - Sub-sub-topic Node: "{{this.label}}"
        {{/each}}
      {{/if}}
    {{/each}}
  {{/if}}
{{/each}}

Strict Requirements for the IMAGE:
1.  **RENDER PROVIDED TEXT EXACTLY AND CLEARLY**: This is the most critical instruction. The textual content for every node is GIVEN to you in the structure above (e.g., "{{centralThemeLabel}}", "{{label}}", "{{this.label}}"). You MUST render this text precisely as it is written, inside its respective node. The text must be:
    *   PERFECTLY LEGIBLE.
    *   LARGE ENOUGH to be easily read without zooming.
    *   Use a SIMPLE, SANS-SERIF FONT.
    *   Have EXCELLENT CONTRAST against the node's background.
    *   DO NOT ABBREVIATE, CHANGE, OMIT, OR ADD ANY TEXT to the labels provided.
    *   If you cannot render text clearly and accurately for every single node given, the image is a failure.

{{#if isHorizontal}}
2.  **CLEAR HIERARCHY AND NODE STYLES (HORIZONTAL Layout)**:
    *   **Layout**: The map MUST follow a **left-to-right horizontal structure**. The central theme ("{{centralThemeLabel}}") must be the most prominent node, positioned on the **far left**. Main ideas (labels from \`mainBranches\`) must clearly branch horizontally to the right from it. Sub-topics (labels from \`children\` of main ideas) must clearly branch horizontally to the right from their respective parent main idea nodes, reflecting the provided hierarchy. Use clear visual connectors (lines or simple arrows). DO NOT write text on the connector lines themselves; they should be purely visual.
    *   **Node Shapes**: For horizontal maps, **ALL nodes (Central Theme, Main Ideas, Sub-topics, and any further levels) MUST be RECTANGLES**.
{{else}}
2.  **CLEAR HIERARCHY AND NODE STYLES (Vertical/Default Layout)**:
    *   **Layout**: The map MUST follow a **top-down hierarchical structure**. The central theme ("{{centralThemeLabel}}") must be the most prominent node, positioned at the **top**. Main ideas (labels from \`mainBranches\`) must clearly branch downwards or outwards from it. Sub-topics (labels from \`children\` of main ideas) must clearly branch from their respective parent main idea nodes, reflecting the provided hierarchy. Use clear visual connectors (lines or simple arrows). DO NOT write text on the connector lines themselves; they should be purely visual.
    *   **Node Shapes**:
        *   The Central Theme node containing "{{centralThemeLabel}}" must be a **rectangle**.
        *   Nodes representing Main Ideas (the direct children of the central theme, i.e., items in \`mainBranches\`) must be **rectangles**.
        *   Nodes representing Sub-topics (children of Main Ideas) must be **circles**.
        *   If there are further levels of sub-topics (children of children), they should also be **circles**.
{{/if}}

3.  **PROFESSIONAL APPEARANCE**: The map should be visually organized, uncluttered, and professional. Use distinct shapes as specified. A simple, consistent color scheme (e.g., light-colored nodes like pale yellow or light blue with dark text, or a scheme that ensures high contrast and readability) is preferred. Text legibility, correct shapes, accurate content, and faithful representation of the provided hierarchy are more important than complex aesthetics.
4.  **ABSOLUTE STRUCTURAL FIDELITY AND NO HALLUCINATIONS**:
    *   You are GIVEN a precise textual structure. Your ONLY task is to visually represent THIS EXACT STRUCTURE.
    *   **DO NOT ADD ANY NODES, TEXT, or SHAPES** that are not explicitly defined by the input structure.
    *   **EVERY NODE MUST BE CONNECTED**: Every Main Idea node MUST be visually connected to the Central Theme. Every Sub-topic node MUST be visually connected to its parent Main Idea. If there are sub-sub-topics, they MUST be connected to their parent sub-topic.
    *   **NO DISCONNECTED OR FLOATING NODES ARE ALLOWED**, except for the Central Theme node *before* its first branches.
    *   All visual connections (lines/arrows) in the image MUST accurately reflect the parent-child relationships defined in the provided textual hierarchy.
    *   The final image must be a direct, faithful, and complete visual translation of the provided data structure.

If any text is distorted, unreadable, or omitted, or if any text is added that was not in the provided structure, or if the node shapes are incorrect (based on the {{#if isHorizontal}}horizontal{{else}}vertical{{/if}} layout requirement), or if the connections do not accurately represent the provided hierarchy (e.g., a node is disconnected), the image is considered a failure. Prioritize text clarity, faithfulness to the provided content and structure, and correct node styling above all other considerations.
`,
});


export async function createMindMap(input: CreateMindMapInput): Promise<CreateMindMapOutput> {
  console.log('🧠 createMindMap - HÍBRIDO: IA para contenido + SVG para imagen');
  console.log('📋 Input recibido:', {
    centralTheme: input.centralTheme,
    bookTitle: input.bookTitle,
    language: input.language,
    isHorizontal: input.isHorizontal
  });
  
  try {
    // PASO 1: Usar IA para generar contenido intelectual (nodos y subnodos)
    console.log('🤖 Generando contenido con IA...');
    const structureResponse = await generateMindMapStructurePrompt(input);
    const aiGeneratedStructure = structureResponse.output;

    if (!aiGeneratedStructure) {
      throw new Error('Failed to generate mind map structure with AI.');
    }

    console.log('📊 Estructura generada por IA:', aiGeneratedStructure);
    
    // PASO 2: Usar SVG manual para generar imagen ultra-clara
    console.log('🎨 Generando SVG mejorado...');
    const enhancedSvg = generateEnhancedSvg(aiGeneratedStructure, input.isHorizontal);
    console.log('🎨 SVG mejorado generado exitosamente - Longitud:', enhancedSvg.length);
    
    // Convertir a Data URI
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(enhancedSvg).toString('base64')}`;
    
    console.log('✅ Mapa mental híbrido generado exitosamente');
    return { imageDataUri: dataUri };
    
  } catch (error) {
    console.error('❌ Error en generación híbrida, usando fallback:', error);
    
    // Fallback con estructura inteligente basada en tema
    const fallbackStructure = generateMockMindMapStructure(input);
    const fallbackSvg = generateEnhancedSvg(fallbackStructure, input.isHorizontal);
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`;
    
    return { imageDataUri: dataUri };
  }
}

const createMindMapFlow = ai.defineFlow(
  {
    name: 'createMindMapFlow',
    inputSchema: CreateMindMapInputSchema,
    outputSchema: CreateMindMapOutputSchema,
  },
  async (input: CreateMindMapInput): Promise<CreateMindMapOutput> => {
    // Step 1: Generate the structured mind map data
    // Pass the full input, as generateMindMapStructurePrompt expects centralTheme, bookTitle, and language
    const structureResponse = await generateMindMapStructurePrompt(input); 
    const mindMapStructure = structureResponse.output;

    if (!mindMapStructure) {
      throw new Error('Failed to generate mind map structure.');
    }

    // Step 2: Render the structured data as an image
    // Prepare the input for the image rendering prompt
    const renderImageInput: RenderImageInput = {
      ...mindMapStructure,
      isHorizontal: input.isHorizontal, // Pass the isHorizontal flag
    };

    const renderOutput = await renderMindMapImageHandlebarsPrompt.render(renderImageInput);
    const actualPromptText = renderOutput.messages?.[0]?.content?.[0]?.text;

    if (!actualPromptText) {
      throw new Error('Failed to render the image generation prompt text from RenderResponse.');
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: actualPromptText, 
      config: {
        responseModalities: ['TEXT', 'IMAGE'], 
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or no image was returned by the model.');
    }
    return { imageDataUri: media.url };
  }
);

// Helper functions for mock mode
function generateMockMindMapStructure(input: CreateMindMapInput): MindMapStructure {
  const centralTheme = input.centralTheme.toLowerCase();
  const language = input.language;
  
  // Define topic-specific branches based on common educational themes
  const topicMappings: Record<string, {centralLabel: string, branches: Array<{label: string, children: string[]}>}> = {
    'sistema respiratorio': {
      centralLabel: language === 'es' ? 'Sistema Respiratorio' : 'Respiratory System',
      branches: [
        {
          label: language === 'es' ? 'Órganos Principales' : 'Main Organs',
          children: language === 'es' ? ['Pulmones', 'Tráquea', 'Bronquios'] : ['Lungs', 'Trachea', 'Bronchi']
        },
        {
          label: language === 'es' ? 'Proceso de Respiración' : 'Breathing Process',
          children: language === 'es' ? ['Inspiración', 'Espiración', 'Intercambio de Gases'] : ['Inspiration', 'Expiration', 'Gas Exchange']
        },
        {
          label: language === 'es' ? 'Funciones' : 'Functions',
          children: language === 'es' ? ['Oxigenación', 'Eliminación CO2', 'Regulación pH'] : ['Oxygenation', 'CO2 Removal', 'pH Regulation']
        },
        {
          label: language === 'es' ? 'Enfermedades Comunes' : 'Common Diseases',
          children: language === 'es' ? ['Asma', 'Neumonía', 'Bronquitis'] : ['Asthma', 'Pneumonia', 'Bronchitis']
        }
      ]
    },
    'aparato respiratorio': {
      centralLabel: language === 'es' ? 'Aparato Respiratorio' : 'Respiratory System',
      branches: [
        {
          label: language === 'es' ? 'Órganos Principales' : 'Main Organs',
          children: language === 'es' ? ['Pulmones', 'Tráquea', 'Bronquios'] : ['Lungs', 'Trachea', 'Bronchi']
        },
        {
          label: language === 'es' ? 'Proceso de Respiración' : 'Breathing Process',
          children: language === 'es' ? ['Inspiración', 'Espiración', 'Intercambio de Gases'] : ['Inspiration', 'Expiration', 'Gas Exchange']
        },
        {
          label: language === 'es' ? 'Funciones' : 'Functions',
          children: language === 'es' ? ['Oxigenación', 'Eliminación CO2', 'Regulación pH'] : ['Oxygenation', 'CO2 Removal', 'pH Regulation']
        },
        {
          label: language === 'es' ? 'Enfermedades Comunes' : 'Common Diseases',
          children: language === 'es' ? ['Asma', 'Neumonía', 'Bronquitis'] : ['Asthma', 'Pneumonia', 'Bronchitis']
        }
      ]
    },
    'respiración': {
      centralLabel: language === 'es' ? 'Respiración' : 'Respiration',
      branches: [
        {
          label: language === 'es' ? 'Tipos de Respiración' : 'Types of Respiration',
          children: language === 'es' ? ['Respiración Pulmonar', 'Respiración Celular', 'Respiración Externa'] : ['Pulmonary Respiration', 'Cellular Respiration', 'External Respiration']
        },
        {
          label: language === 'es' ? 'Mecánica Respiratoria' : 'Respiratory Mechanics',
          children: language === 'es' ? ['Inspiración', 'Espiración', 'Ventilación'] : ['Inspiration', 'Expiration', 'Ventilation']
        },
        {
          label: language === 'es' ? 'Transporte de Gases' : 'Gas Transport',
          children: language === 'es' ? ['Hemoglobina', 'Difusión', 'Perfusión'] : ['Hemoglobin', 'Diffusion', 'Perfusion']
        }
      ]
    },
    'fotosíntesis': {
      centralLabel: language === 'es' ? 'Fotosíntesis' : 'Photosynthesis',
      branches: [
        {
          label: language === 'es' ? 'Reactivos' : 'Reactants',
          children: language === 'es' ? ['Dióxido de Carbono', 'Agua', 'Luz Solar'] : ['Carbon Dioxide', 'Water', 'Sunlight']
        },
        {
          label: language === 'es' ? 'Productos' : 'Products',
          children: language === 'es' ? ['Glucosa', 'Oxígeno'] : ['Glucose', 'Oxygen']
        },
        {
          label: language === 'es' ? 'Fases' : 'Phases',
          children: language === 'es' ? ['Fase Luminosa', 'Fase Oscura', 'Ciclo de Calvin'] : ['Light Phase', 'Dark Phase', 'Calvin Cycle']
        },
        {
          label: language === 'es' ? 'Ubicación' : 'Location',
          children: language === 'es' ? ['Cloroplastos', 'Hojas', 'Células Vegetales'] : ['Chloroplasts', 'Leaves', 'Plant Cells']
        }
      ]
    },
    'célula': {
      centralLabel: language === 'es' ? 'La Célula' : 'The Cell',
      branches: [
        {
          label: language === 'es' ? 'Tipos Celulares' : 'Cell Types',
          children: language === 'es' ? ['Célula Procariota', 'Célula Eucariota'] : ['Prokaryotic Cell', 'Eukaryotic Cell']
        },
        {
          label: language === 'es' ? 'Organelos' : 'Organelles',
          children: language === 'es' ? ['Núcleo', 'Mitocondrias', 'Ribosomas'] : ['Nucleus', 'Mitochondria', 'Ribosomes']
        },
        {
          label: language === 'es' ? 'Funciones' : 'Functions',
          children: language === 'es' ? ['Reproducción', 'Metabolismo', 'Homeostasis'] : ['Reproduction', 'Metabolism', 'Homeostasis']
        }
      ]
    },
    'plantas': {
      centralLabel: language === 'es' ? 'Las Plantas' : 'Plants',
      branches: [
        {
          label: language === 'es' ? 'Tipos de Plantas' : 'Plant Types',
          children: language === 'es' ? ['Angiospermas', 'Gimnospermas', 'Helechos'] : ['Angiosperms', 'Gymnosperms', 'Ferns']
        },
        {
          label: language === 'es' ? 'Partes de la Planta' : 'Plant Parts',
          children: language === 'es' ? ['Raíz', 'Tallo', 'Hojas'] : ['Root', 'Stem', 'Leaves']
        },
        {
          label: language === 'es' ? 'Funciones' : 'Functions',
          children: language === 'es' ? ['Fotosíntesis', 'Respiración', 'Reproducción'] : ['Photosynthesis', 'Respiration', 'Reproduction']
        }
      ]
    },
    'agua': {
      centralLabel: language === 'es' ? 'El Agua' : 'Water',
      branches: [
        {
          label: language === 'es' ? 'Estados del Agua' : 'Water States',
          children: language === 'es' ? ['Líquido', 'Sólido', 'Gaseoso'] : ['Liquid', 'Solid', 'Gas']
        },
        {
          label: language === 'es' ? 'Ciclo del Agua' : 'Water Cycle',
          children: language === 'es' ? ['Evaporación', 'Condensación', 'Precipitación'] : ['Evaporation', 'Condensation', 'Precipitation']
        },
        {
          label: language === 'es' ? 'Importancia' : 'Importance',
          children: language === 'es' ? ['Vida', 'Ecosistemas', 'Agricultura'] : ['Life', 'Ecosystems', 'Agriculture']
        }
      ]
    },
    'ecosistema': {
      centralLabel: language === 'es' ? 'Ecosistema' : 'Ecosystem',
      branches: [
        {
          label: language === 'es' ? 'Componentes Vivos' : 'Living Components',
          children: language === 'es' ? ['Productores', 'Consumidores', 'Descomponedores'] : ['Producers', 'Consumers', 'Decomposers']
        },
        {
          label: language === 'es' ? 'Componentes No Vivos' : 'Non-Living Components',
          children: language === 'es' ? ['Agua', 'Suelo', 'Clima'] : ['Water', 'Soil', 'Climate']
        },
        {
          label: language === 'es' ? 'Interacciones' : 'Interactions',
          children: language === 'es' ? ['Cadenas Alimentarias', 'Simbiosis', 'Competencia'] : ['Food Chains', 'Symbiosis', 'Competition']
        }
      ]
    }
  };
  
  // Find matching topic or create generic structure
  let structure = topicMappings[centralTheme];
  
  if (!structure) {
    // Check for partial matches
    for (const [key, value] of Object.entries(topicMappings)) {
      if (centralTheme.includes(key) || key.includes(centralTheme)) {
        structure = value;
        break;
      }
    }
  }
  
  if (!structure) {
    // Generic fallback structure
    structure = {
      centralLabel: input.centralTheme,
      branches: [
        {
          label: language === 'es' ? 'Concepto Principal' : 'Main Concept',
          children: language === 'es' ? ['Definición', 'Características'] : ['Definition', 'Characteristics']
        },
        {
          label: language === 'es' ? 'Componentes' : 'Components',
          children: language === 'es' ? ['Elemento 1', 'Elemento 2'] : ['Element 1', 'Element 2']
        },
        {
          label: language === 'es' ? 'Aplicaciones' : 'Applications',
          children: language === 'es' ? ['Uso Práctico', 'Importancia'] : ['Practical Use', 'Importance']
        }
      ]
    };
  }
  
  return {
    centralThemeLabel: structure.centralLabel.toUpperCase(),
    mainBranches: structure.branches.map(branch => ({
      label: branch.label,
      children: branch.children.map(child => ({ label: child }))
    }))
  };
}

function generateMockSvg(structure: MindMapStructure, isHorizontal?: boolean): string {
  // GENERACIÓN SVG ULTRA-LIMPIA - MÁXIMA CLARIDAD Y LEGIBILIDAD - AGRANDADO
  const width = isHorizontal ? 1400 : 1000; // Agrandado de 900 a 1000
  const height = isHorizontal ? 900 : 1200;  // Agrandado de 800 a 1200
  const centerX = isHorizontal ? 200 : width / 2;
  const centerY = height / 2;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 ${width} ${height}" style="background: #fafafa;">
    <defs>
      <filter id="cleanShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.15)"/>
      </filter>
      <style>
        .node-text { 
          font-family: 'Segoe UI', 'Arial', sans-serif; 
          text-anchor: middle; 
          dominant-baseline: middle; 
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .central-text { fill: #ffffff; font-size: 18px; font-weight: 700; }
        .branch-text { fill: #ffffff; font-size: 14px; font-weight: 600; }
        .sub-text { fill: #ffffff; font-size: 12px; font-weight: 500; }
        .connection-line { 
          stroke: #8b9dc3; 
          stroke-width: 3; 
          stroke-linecap: round;
          opacity: 0.7;
        }
      </style>
    </defs>`;

  if (isHorizontal) {
    // DISEÑO HORIZONTAL ULTRA-CLARO
    
    // Configuración de dimensiones
    const centralWidth = 180;
    const centralHeight = 80;
    const centralX = centerX;
    const centralY = centerY;
    const branches = structure.mainBranches;
    const availableHeight = height - 180;
    const branchSpacing = availableHeight / (branches.length + 1);
    
    // PASO 1: DIBUJAR TODAS LAS LÍNEAS PRIMERO (AL FONDO)
    branches.forEach((branch, branchIdx) => {
      const branchY = 90 + (branchIdx + 1) * branchSpacing;
      const branchX = centralX + 300;
      const branchWidth = 150;
      
      // Línea de conexión central a rama
      svg += `<line x1="${centralX + centralWidth/2}" y1="${centralY}" 
        x2="${branchX - branchWidth/2}" y2="${branchY}" class="connection-line"/>`;
      
      // Líneas de conexión de rama a subnodos
      if (branch.children && branch.children.length > 0) {
        const subStartX = branchX + 180;
        const subSpacing = Math.min(140, (width - subStartX - 100) / branch.children.length);
        
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subX = subStartX + (childIdx * subSpacing);
          const subY = branchY;
          const subRadius = 55; // Agrandado de 38 a 55 para consistencia
          
          // Línea de conexión rama a subnodo
          svg += `<line x1="${branchX + branchWidth/2}" y1="${branchY}" 
            x2="${subX - subRadius - 2}" y2="${subY}" class="connection-line"/>`; // Ajustado para subnodos más grandes
        });
      }
    });
    
    // PASO 2: DIBUJAR NODO CENTRAL
    // Fondo blanco para el nodo central
    svg += `<rect x="${centralX - centralWidth/2 - 2}" y="${centralY - centralHeight/2 - 2}" 
      width="${centralWidth + 4}" height="${centralHeight + 4}" rx="15" 
      fill="#ffffff" stroke="#e1e8ed" stroke-width="2"/>`;
    
    // Nodo central principal
    svg += `<rect x="${centralX - centralWidth/2}" y="${centralY - centralHeight/2}" 
      width="${centralWidth}" height="${centralHeight}" rx="12" 
      fill="#2563eb" stroke="#1e40af" stroke-width="3" filter="url(#cleanShadow)"/>`;
    
    // Texto central - múltiples líneas si es necesario
    const centralLines = cleanTextWrap(structure.centralThemeLabel, 16);
    const lineHeight = 20;
    const startY = centralY - ((centralLines.length - 1) * lineHeight / 2);
    
    centralLines.forEach((line, idx) => {
      svg += `<text x="${centralX}" y="${startY + (idx * lineHeight)}" class="node-text central-text">${line}</text>`;
    });
    
    // PASO 3: DIBUJAR RAMAS Y SUBNODOS
    branches.forEach((branch, branchIdx) => {
      const branchY = 90 + (branchIdx + 1) * branchSpacing;
      const branchX = centralX + 300;
      const branchWidth = 150;
      const branchHeight = 60;
      
      // Fondo blanco para nodo rama
      svg += `<rect x="${branchX - branchWidth/2 - 2}" y="${branchY - branchHeight/2 - 2}" 
        width="${branchWidth + 4}" height="${branchHeight + 4}" rx="12" 
        fill="#ffffff" stroke="#e1e8ed" stroke-width="2"/>`;
      
      // Nodo rama principal
      svg += `<rect x="${branchX - branchWidth/2}" y="${branchY - branchHeight/2}" 
        width="${branchWidth}" height="${branchHeight}" rx="10" 
        fill="#059669" stroke="#047857" stroke-width="3" filter="url(#cleanShadow)"/>`;
      
      // Texto de rama - múltiples líneas
      const branchLines = cleanTextWrap(branch.label, 18);
      const branchStartY = branchY - ((branchLines.length - 1) * 16 / 2);
      
      branchLines.forEach((line, lineIdx) => {
        svg += `<text x="${branchX}" y="${branchStartY + (lineIdx * 16)}" class="node-text branch-text">${line}</text>`;
      });
      
      // Subnodos con espaciado perfecto
      if (branch.children && branch.children.length > 0) {
        const subStartX = branchX + 180;
        const subSpacing = Math.min(160, (width - subStartX - 100) / branch.children.length); // Más espaciado
        
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subX = subStartX + (childIdx * subSpacing);
          const subY = branchY;
          const subRadius = 55; // Agrandado de 45 a 55 para mejor formato de texto
          
          // Fondo blanco para subnodo
          svg += `<circle cx="${subX}" cy="${subY}" r="${subRadius + 2}" 
            fill="#ffffff" stroke="#e1e8ed" stroke-width="2"/>`;
          
          // Subnodo principal
          svg += `<circle cx="${subX}" cy="${subY}" r="${subRadius}" 
            fill="#dc2626" stroke="#b91c1c" stroke-width="3" filter="url(#cleanShadow)"/>`;
          
          // Texto del subnodo - perfectamente centrado en el círculo
          const subLines = cleanTextWrap(child.label, 14); // Más caracteres por línea
          const lineHeight = 14;
          const totalTextHeight = (subLines.length - 1) * lineHeight;
          const subStartY = subY - (totalTextHeight / 2);
          
          subLines.forEach((line, lineIdx) => {
            const yPosition = subStartY + (lineIdx * lineHeight);
            svg += `<text x="${subX}" y="${yPosition}" class="node-text sub-text" 
              text-anchor="middle" dominant-baseline="middle" 
              style="font-size: 14px;">${line}</text>`; // Texto perfectamente centrado
          });
        });
      }
    });
    
  } else {
    // DISEÑO VERTICAL - JERARQUÍA TOP-DOWN SIMPLE - AGRANDADO
    const centerX = width / 2;
    const centerY = height * 0.15; // Nodo central más arriba para dar más espacio
    const branches = structure.mainBranches;
    
    // 1. Líneas de conexión (más ligeras y siempre por debajo)
    branches.forEach((branch, idx) => {
      const branchY = centerY + 200; // Más espacio entre central y ramas
      const branchX = (width / (branches.length + 1)) * (idx + 1);
      
      // Línea desde la parte inferior del nodo central
      svg += `<line x1="${centerX}" y1="${centerY + 50}" 
        x2="${branchX}" y2="${branchY - 30}" 
        stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>`;
      
      if (branch.children && branch.children.length > 0) {
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subY = branchY + 140 + (childIdx * 90); // Más espacio entre subnodos
          // Línea desde la parte inferior del nodo rama
          svg += `<line x1="${branchX}" y1="${branchY + 30}" 
            x2="${branchX}" y2="${subY - 30}" 
            stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>`;
        });
      }
    });
    
    // 2. Nodo central (agrandado)
    svg += `<circle cx="${centerX}" cy="${centerY}" r="50" 
      fill="#4f46e5" stroke="none"/>`;
    
    const centralLines = wrapText(structure.centralThemeLabel, 14);
    const centralStartY = centerY - ((centralLines.length - 1) * 16 / 2);
    
    centralLines.forEach((line, idx) => {
      svg += `<text x="${centerX}" y="${centralStartY + (idx * 16)}" 
        font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="middle">${line}</text>`;
    });
    
    // 3. Ramas y subnodos (agrandados)
    branches.forEach((branch, idx) => {
      const branchY = centerY + 200; // Más espacio
      const branchX = (width / (branches.length + 1)) * (idx + 1);
      
      // Nodo rama (agrandado)
      svg += `<rect x="${branchX - 80}" y="${branchY - 30}" 
        width="160" height="60" rx="12" 
        fill="#059669" stroke="none"/>`;
      
      const branchLines = wrapText(branch.label, 18);
      const branchStartY = branchY - ((branchLines.length - 1) * 14 / 2);
      
      branchLines.forEach((line, lineIdx) => {
        svg += `<text x="${branchX}" y="${branchStartY + (lineIdx * 14)}" 
          font-family="Arial, sans-serif" font-size="14" font-weight="600" 
          fill="white" text-anchor="middle" dominant-baseline="middle">${line}</text>`;
      });
      
      // Subnodos (agrandados para mejor formato de texto)
      if (branch.children && branch.children.length > 0) {
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subY = branchY + 140 + (childIdx * 90); // Más espacio
          
          svg += `<circle cx="${branchX}" cy="${subY}" r="50" 
            fill="#ef4444" stroke="none"/>`; // Agrandado de 45 a 50
          
          const subLines = wrapText(child.label, 14); // Más caracteres para subnodos más grandes
          const lineHeight = 14;
          const totalTextHeight = (subLines.length - 1) * lineHeight;
          const subStartY = subY - (totalTextHeight / 2);
          
          subLines.forEach((line, lineIdx) => {
            const yPosition = subStartY + (lineIdx * lineHeight);
            svg += `<text x="${branchX}" y="${yPosition}" 
              font-family="Arial, sans-serif" font-size="14" font-weight="500" 
              fill="white" text-anchor="middle" dominant-baseline="middle">${line}</text>`; // Texto perfectamente centrado
          });
        });
      }
    });
  }
  
  svg += '</svg>';
  return svg;
}

// Función de envoltura de texto ultra-inteligente inspirada en D3.js
function intelligentTextWrap(text: string, maxChars: number): string[] {
  if (!text || text.length <= maxChars) return [text || ''];
  
  // Algoritmo de wrapping optimizado
  const words = text.split(' ');
  if (words.length === 1) {
    // Manejo inteligente de palabras largas
    if (text.length > maxChars * 1.5) {
      const midPoint = Math.ceil(text.length / 2);
      return [text.substring(0, midPoint), text.substring(midPoint)];
    }
    return [text];
  }
  
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Palabra muy larga - dividir inteligentemente
        if (word.length > maxChars) {
          lines.push(word.substring(0, maxChars));
          currentLine = word.substring(maxChars);
        } else {
          currentLine = word;
        }
      }
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  // Máximo 2 líneas para mantener diseño limpio
  return lines.slice(0, 2);
}

// Función de envoltura de texto ultra-simple para compatibilidad
function ultraSimpleWrap(text: string, maxChars: number): string[] {
  if (!text || text.length <= maxChars) return [text || ''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Si una palabra es muy larga, córtala de forma simple
        lines.push(word.substring(0, maxChars));
        currentLine = word.length > maxChars ? word.substring(maxChars) : '';
      }
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  // Máximo 2 líneas para mantener el diseño ultra-simple
  return lines.slice(0, 2);
}

// Función de envoltura de texto simple y limpia (mantenida para compatibilidad)
function cleanTextWrap(text: string, maxChars: number): string[] {
  if (!text || text.length <= maxChars) return [text || ''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Si una palabra es muy larga, córtala
        lines.push(word.substring(0, maxChars));
        currentLine = word.length > maxChars ? word.substring(maxChars) : '';
      }
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  // Máximo 2 líneas para mantener legibilidad
  return lines.slice(0, 2);
}

// Función de utilidad mantenida para compatibilidad
function wrapText(text: string, maxLength: number): string[] {
  return cleanTextWrap(text, maxLength);
}

// ============================================================================
// FUNCIONES MEJORADAS PARA GENERACIÓN SVG ULTRA-PROFESIONAL
// ============================================================================

/**
 * Genera un SVG con diseño ultra-profesional inspirado en D3.js
 */
function generateEnhancedSvg(structure: MindMapStructure, isHorizontal?: boolean): string {
  // DISEÑO ULTRA-PROFESIONAL - CANVAS OPTIMIZADO
  const width = isHorizontal ? 1400 : 1000;
  const height = isHorizontal ? 800 : 1200;
  
  // Paleta de colores profesional inspirada en D3.js Tableau10
  const colorScheme = [
    '#4e79a7', // Central - azul profundo
    '#f28e2c', // Rama 1 - naranja
    '#e15759', // Rama 2 - rojo coral
    '#76b7b2', // Rama 3 - verde azulado
    '#59a14f', // Rama 4 - verde
    '#edc949', // Rama 5 - amarillo
    '#af7aa1', // Rama 6 - púrpura
    '#ff9d9a', // Subnodos - rosa claro
    '#9c755f', // Extra - marrón
    '#bab0ab'  // Extra - gris
  ];
  
  const colors = {
    background: '#ffffff',
    text: '#ffffff',
    line: '#999999',
    accent: '#f8f9fa',
    shadow: 'rgba(0,0,0,0.1)'
  };
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 ${width} ${height}" style="background: ${colors.background};">
    
    <defs>
      <filter id="professionalShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="${colors.shadow}" flood-opacity="0.3"/>
      </filter>
      <style>
        .professional-text { 
          font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif; 
          text-anchor: middle; 
          dominant-baseline: middle; 
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .central-text { fill: ${colors.text}; font-size: 20px; font-weight: 700; }
        .branch-text { fill: ${colors.text}; font-size: 15px; font-weight: 600; }
        .sub-text { fill: ${colors.text}; font-size: 13px; font-weight: 500; }
        .connection-line { 
          stroke: ${colors.line}; 
          stroke-width: 2.5; 
          stroke-linecap: round;
          opacity: 0.8;
        }
      </style>
    </defs>`;

  if (isHorizontal) {
    // DISEÑO HORIZONTAL PROFESIONAL - INSPIRADO EN D3.js
    const centerX = 180;
    const centerY = height / 2;
    const centralW = 180;
    const centralH = 80;
    const branches = structure.mainBranches;
    
    // Algoritmo de posicionamiento mejorado - evita colisiones
    const branchSpacing = Math.max(120, (height - 120) / branches.length);
    const branchStartY = centerY - ((branches.length - 1) * branchSpacing / 2);
    
    // PASO 1: Líneas de conexión profesionales
    branches.forEach((branch, idx) => {
      const branchY: number = branchStartY + (idx * branchSpacing);
      const branchX = centerX + 300;
      const branchColor = colorScheme[idx + 1] || colorScheme[1];
      
      // Línea central → rama con mejor estilo
      svg += `<line x1="${centerX + centralW/2}" y1="${centerY}" 
        x2="${branchX - 80}" y2="${branchY}" class="connection-line" 
        stroke="${colors.line}" stroke-width="3"/>`;
      
      // Líneas rama → subnodos con espaciado inteligente
      if (branch.children && branch.children.length > 0) {
        const subStartX = branchX + 220;
        const subSpacing = Math.max(130, 400 / branch.children.length); // Espaciado adaptativo
        
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subX = subStartX + (childIdx * subSpacing);
          const subRadius = 50; // Tamaño óptimo
          
          svg += `<line x1="${branchX + 80}" y1="${branchY}" 
            x2="${subX - subRadius}" y2="${branchY}" class="connection-line" 
            stroke="${colors.line}" stroke-width="2"/>`;
        });
      }
    });
    
    // PASO 2: Nodo central profesional
    svg += `<rect x="${centerX - centralW/2}" y="${centerY - centralH/2}" 
      width="${centralW}" height="${centralH}" rx="20" 
      fill="${colorScheme[0]}" stroke="none" filter="url(#professionalShadow)"/>`;
    
    const centralLines = intelligentTextWrap(structure.centralThemeLabel, 16);
    const centralStartY = centerY - ((centralLines.length - 1) * 20 / 2);
    centralLines.forEach((line: string, idx: number) => {
      svg += `<text x="${centerX}" y="${centralStartY + (idx * 20)}" class="professional-text central-text">${line}</text>`;
    });
    
    // PASO 3: Ramas y subnodos con colores diferenciados
    branches.forEach((branch, idx) => {
      const branchY: number = branchStartY + (idx * branchSpacing);
      const branchX = centerX + 300;
      const branchW = 160;
      const branchH = 60;
      const branchColor = colorScheme[idx + 1] || colorScheme[1];
      
      // Nodo rama con color único
      svg += `<rect x="${branchX - branchW/2}" y="${branchY - branchH/2}" 
        width="${branchW}" height="${branchH}" rx="15" 
        fill="${branchColor}" stroke="none" filter="url(#professionalShadow)"/>`;
      
      const branchLines = intelligentTextWrap(branch.label, 18);
      const branchTextStartY: number = branchY - ((branchLines.length - 1) * 16 / 2);
      branchLines.forEach((line: string, lineIdx: number) => {
        svg += `<text x="${branchX}" y="${branchTextStartY + (lineIdx * 16)}" class="professional-text branch-text">${line}</text>`;
      });
      
      // Subnodos optimizados
      if (branch.children && branch.children.length > 0) {
        const subStartX = branchX + 220;
        const subSpacing = Math.max(130, 400 / branch.children.length);
        const subColor = colorScheme[7]; // Color consistente para subnodos
        
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subX = subStartX + (childIdx * subSpacing);
          const subRadius = 50;
          
          svg += `<circle cx="${subX}" cy="${branchY}" r="${subRadius}" 
            fill="${subColor}" stroke="none" filter="url(#professionalShadow)"/>`;
          
          const subLines = intelligentTextWrap(child.label, 12);
          const lineHeight = 14;
          const totalTextHeight = (subLines.length - 1) * lineHeight;
          const subTextStartY: number = branchY - (totalTextHeight / 2);
          subLines.forEach((line: string, lineIdx: number) => {
            const yPosition = subTextStartY + (lineIdx * lineHeight);
            svg += `<text x="${subX}" y="${yPosition}" class="professional-text sub-text" 
              text-anchor="middle" dominant-baseline="middle">${line}</text>`;
          });
        });
      }
    });
    
  } else {
    // DISEÑO VERTICAL PROFESIONAL - INSPIRADO EN D3.js
    const centerX = width / 2;
    const startY = 120;
    const centralR = 85; // Agrandado
    const branches = structure.mainBranches;
    
    // PASO 1: ALGORITMO DE POSICIONAMIENTO INTELIGENTE
    const branchY = startY + 250; // Más espacio
    const totalBranchWidth = Math.min(width - 120, branches.length * 200); // Más ancho
    const branchStartX = centerX - (totalBranchWidth / 2);
    const branchSpacing = totalBranchWidth / branches.length;
    
    // Líneas de conexión profesionales
    branches.forEach((branch, idx) => {
      const branchX = branchStartX + (idx + 0.5) * branchSpacing;
      const branchColor = colorScheme[idx + 1] || colorScheme[1];
      
      // Línea central → rama (desde la parte inferior del central)
      svg += `<line x1="${centerX}" y1="${startY + centralR}" 
        x2="${branchX}" y2="${branchY - 35}" class="connection-line" 
        stroke="${colors.line}" stroke-width="3"/>`;
      
      // Líneas rama → subnodos
      if (branch.children && branch.children.length > 0) {
        const subStartY = branchY + 140;
        const subSpacing = 100; // Espaciado optimizado
        
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subY = subStartY + (childIdx * subSpacing);
          const subR = 50; // Agrandado de 40 a 50 para mejor formato de texto
          
          svg += `<line x1="${branchX}" y1="${branchY + 35}" 
            x2="${branchX}" y2="${subY - subR}" class="connection-line" 
            stroke="${colors.line}" stroke-width="2"/>`;
        });
      }
    });
    
    // PASO 2: NODO CENTRAL PROFESIONAL
    svg += `<circle cx="${centerX}" cy="${startY}" r="${centralR}" 
      fill="${colorScheme[0]}" stroke="none" filter="url(#professionalShadow)"/>`;
    
    const centralLines = intelligentTextWrap(structure.centralThemeLabel, 16);
    const centralTextY = startY - ((centralLines.length - 1) * 22 / 2);
    centralLines.forEach((line: string, idx: number) => {
      svg += `<text x="${centerX}" y="${centralTextY + (idx * 22)}" class="professional-text central-text" 
        style="font-size: 22px;">${line}</text>`;
    });
    
    // PASO 3: RAMAS PRINCIPALES CON COLORES ÚNICOS
    branches.forEach((branch, idx) => {
      const branchX = branchStartX + (idx + 0.5) * branchSpacing;
      const branchW = 170; // Agrandado
      const branchH = 70;  // Agrandado
      const branchColor = colorScheme[idx + 1] || colorScheme[1];
      
      // Nodo rama profesional
      svg += `<rect x="${branchX - branchW/2}" y="${branchY - branchH/2}" 
        width="${branchW}" height="${branchH}" rx="18" 
        fill="${branchColor}" stroke="none" filter="url(#professionalShadow)"/>`;
      
      const branchLines = intelligentTextWrap(branch.label, 18);
      const branchTextY = branchY - ((branchLines.length - 1) * 18 / 2);
      branchLines.forEach((line: string, lineIdx: number) => {
        svg += `<text x="${branchX}" y="${branchTextY + (lineIdx * 18)}" class="professional-text branch-text" 
          style="font-size: 16px;">${line}</text>`;
      });
      
      // PASO 4: SUBNODOS OPTIMIZADOS
      if (branch.children && branch.children.length > 0) {
        const subStartY = branchY + 140;
        const subSpacing = 100;
        const subColor = colorScheme[7]; // Color consistente para subnodos
        
        branch.children.forEach((child: MindMapNode, childIdx: number) => {
          const subY = subStartY + (childIdx * subSpacing);
          const subR = 50; // Agrandado de 40 a 50 para mejor texto
          
          // Subnodo profesional
          svg += `<circle cx="${branchX}" cy="${subY}" r="${subR}" 
            fill="${subColor}" stroke="none" filter="url(#professionalShadow)"/>`;
          
          const subLines = intelligentTextWrap(child.label, 12); // Más caracteres por línea
          const lineHeight = 14;
          const totalTextHeight = (subLines.length - 1) * lineHeight;
          const subTextY = subY - (totalTextHeight / 2);
          subLines.forEach((line: string, lineIdx: number) => {
            const yPosition = subTextY + (lineIdx * lineHeight);
            svg += `<text x="${branchX}" y="${yPosition}" class="professional-text sub-text" 
              text-anchor="middle" dominant-baseline="middle" style="font-size: 14px;">${line}</text>`; // Texto perfectamente centrado
          });
        });
      }
    });
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * Función mejorada de envoltura de texto con algoritmo más inteligente
 */
function smartTextWrap(text: string, maxChars: number): string[] {
  if (!text || text.length <= maxChars) return [text || ''];
  
  // Primero intentar cortar por palabras
  const words = text.split(' ');
  if (words.length === 1) {
    // Si es una sola palabra muy larga, cortarla inteligentemente
    if (text.length > maxChars * 2) {
      return [text.substring(0, maxChars), text.substring(maxChars, maxChars * 2)];
    }
    return [text];
  }
  
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Si una palabra es muy larga, cortarla inteligentemente
        if (word.length > maxChars) {
          lines.push(word.substring(0, maxChars));
          currentLine = word.substring(maxChars);
        } else {
          currentLine = word;
        }
      }
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  // Máximo 3 líneas para el nuevo diseño mejorado
  return lines.slice(0, 3);
}

// Función de utilidad para compatibilidad con el diseño anterior
function enhancedTextWrap(text: string, maxChars: number): string[] {
  return smartTextWrap(text, maxChars);
}