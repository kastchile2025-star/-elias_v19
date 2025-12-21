'use server';

import { createMindMap as createMindMapFlow } from '@/ai/flows/create-mind-map';

export interface MindMapInput {
  centralTheme: string;
  bookTitle: string;
  language: 'es' | 'en';
  isHorizontal?: boolean;
}

export interface MindMapOutput {
  imageDataUri: string;
}

export async function createMindMapAction(input: MindMapInput): Promise<MindMapOutput> {
  try {
    console.log('🧠 Server Action createMindMapAction called with:', input);
    
    const result = await createMindMapFlow(input);
    
    console.log('✅ Mind map generated successfully');
    return result;
    
  } catch (error) {
    console.error('❌ Error in createMindMapAction:', error);
    throw new Error(`Failed to generate mind map: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
