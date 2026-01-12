
'use server';
/**
 * @fileOverview This file defines tools for the abroad chatbot AI assistant.
 *
 * - searchWebForAbroadInfo - A tool to find real-time information about studying or working abroad.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const searchWebForAbroadInfo = ai.defineTool(
  {
    name: 'searchWebForAbroadInfo',
    description: 'Searches the web for real-time information about universities, courses, companies, jobs, and visa requirements for studying or working abroad.',
    inputSchema: z.object({
      query: z.string().describe('A detailed search query.'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string().describe('The title of the search result.'),
        url: z.string().url().describe('The URL of the resource.'),
        snippet: z.string().describe('A brief snippet of the content.'),
      })).describe('An array of 3-5 relevant search results.'),
    }),
  },
  async (input) => {
    console.log(`Performing web search for: ${input.query}`);
    
    const searchPrompt = `You are a web search engine. Find 3-5 relevant and up-to-date resources for the following query: "${input.query}". The user is likely from India, so prioritize results that are relevant to them. For each result, provide a realistic title, a valid URL, and a concise snippet. The results should be real, existing universities, companies, or official resources.`;

    const llmResponse = await ai.generate({
      prompt: searchPrompt,
      model: 'googleai/gemini-1.5-flash-latest',
      output: {
        schema: z.object({
          results: z.array(z.object({
            title: z.string(),
            url: z.string().url(),
            snippet: z.string(),
          })),
        }),
      },
    });
    
    const output = llmResponse.output;
    return output || { results: [] };
  }
);
