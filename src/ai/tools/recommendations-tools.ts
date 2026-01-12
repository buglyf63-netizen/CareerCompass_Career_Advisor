
'use server';
/**
 * @fileOverview This file defines tools for the recommendations AI assistant.
 *
 * - findLearningResources - A tool to find external learning resources.
 * - generateNewRoadmap - A tool to generate a new learning roadmap for the user.
 */

import { ai } from '@/ai/genkit';
import { generatePersonalizedLearningRoadmap } from '@/ai/flows/generate-personalized-learning-roadmaps';
import { z } from 'genkit';

export const findLearningResources = ai.defineTool(
  {
    name: 'findLearningResources',
    description: 'Finds learning resources like articles, videos, or courses for a given topic.',
    inputSchema: z.object({
      topic: z.string().describe('The topic to search for resources on.'),
    }),
    outputSchema: z.object({
      resources: z.array(z.object({
        title: z.string().describe('The title of the resource.'),
        url: z.string().url().describe('The URL of the resource.'),
        type: z.enum(['Article', 'Video', 'Course', 'Tool']).describe('The type of the resource.'),
      })),
    }),
  },
  async (input) => {
    const searchPrompt = `Find 3-5 high-quality, relevant learning resources (articles, YouTube videos, online courses, or tools) for the following topic: "${input.topic}". Prioritize resources that are relevant to an audience in India. Provide the title, a valid URL, and the type for each.`;

    const llmResponse = await ai.generate({
      prompt: searchPrompt,
      model: 'googleai/gemini-1.5-flash',
      output: {
        schema: z.object({
          resources: z.array(z.object({
            title: z.string(),
            url: z.string().url(),
            type: z.enum(['Article', 'Video', 'Course', 'Tool']),
          })),
        }),
      },
    });

    const output = llmResponse.output;
    return output || { resources: [] };
  }
);


export const generateNewRoadmap = ai.defineTool(
    {
        name: 'generateNewRoadmap',
        description: 'Generates a new or alternative personalized learning roadmap based on the user\'s career goals and skill gaps.',
        inputSchema: z.object({
            careerPath: z.string().describe('The desired career path for the new roadmap.'),
            skillGaps: z.string().describe('The skill gaps to address in the new roadmap.'),
            resumeSummary: z.string().optional().describe('A summary of the user\'s resume, if available.'),
            assessmentSummary: z.string().optional().describe('A summary of the user\'s skill/interest assessment, if available.'),
        }),
        outputSchema: z.object({
            newRoadmap: z.string().describe('The newly generated personalized learning roadmap in markdown format.'),
        }),
    },
    async (input) => {
        const result = await generatePersonalizedLearningRoadmap(input);
        return { newRoadmap: result.roadmap };
    }
);
