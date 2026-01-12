
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a visual flowchart from a textual learning roadmap.
 *
 * - generateRoadmapFlowchart - A function that takes a text roadmap and returns a Mermaid flowchart.
 * - GenerateRoadmapFlowchartInput - The input type for the function.
 * - GenerateRoadmapFlowchartOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoadmapFlowchartInputSchema = z.object({
  roadmap: z.string().describe('The textual learning roadmap in Markdown format.'),
});
export type GenerateRoadmapFlowchartInput = z.infer<typeof GenerateRoadmapFlowchartInputSchema>;

const GenerateRoadmapFlowchartOutputSchema = z.object({
  flowchart: z.string().describe('A Mermaid syntax flowchart representing the learning roadmap.'),
});
export type GenerateRoadmapFlowchartOutput = z.infer<typeof GenerateRoadmapFlowchartOutputSchema>;


export async function generateRoadmapFlowchart(input: GenerateRoadmapFlowchartInput): Promise<GenerateRoadmapFlowchartOutput> {
  return generateRoadmapFlowchartFlow(input);
}

const flowchartPrompt = ai.definePrompt({
  name: 'roadmapFlowchartPrompt',
  input: {schema: GenerateRoadmapFlowchartInputSchema},
  output: {schema: GenerateRoadmapFlowchartOutputSchema},
  prompt: `You are a visual AI designer. You have been given a detailed learning roadmap in Markdown format. Your task is to convert this roadmap into a clear, professional flowchart using Mermaid syntax.

- Represent each roadmap step as a node.
- Use arrows to show the sequence between steps.
- Keep the flowchart clean, top-down, and easy to read.
- Use concise text in each node.
- Add styling to the nodes to match the theme: a light indigo fill (#E8EAF6) and a deep indigo border (#3F51B5).
- Style the final node (e.g., "Ready for Job Applications") with a vibrant orange fill (#FF9800) to indicate completion.

Here is an example of the Mermaid flowchart format:
graph TD
    A["Step 1: Foundation"] --> B["Step 2: Core Skills"]
    B --> C["Step 3: Project"]
    C --> D["Step 4: Specialization"]
    D --> E["Ready for Job Applications"]

    style A fill:#E8EAF6,stroke:#3F51B5,stroke-width:2px
    style B fill:#E8EAF6,stroke:#3F51B5,stroke-width:2px
    style C fill:#E8EAF6,stroke:#3F51B5,stroke-width:2px
    style D fill:#E8EAF6,stroke:#3F51B5,stroke-width:2px
    style E fill:#FF9800,stroke:#3F51B5,stroke-width:2px

Textual Roadmap to Convert:
{{{roadmap}}}

Respond in JSON format. The 'flowchart' field must contain only the Mermaid syntax.
`,
});

const generateRoadmapFlowchartFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlowchartFlow',
    inputSchema: GenerateRoadmapFlowchartInputSchema,
    outputSchema: GenerateRoadmapFlowchartOutputSchema,
  },
  async input => {
    const {output} = await flowchartPrompt(input);
    return output!;
  }
);
