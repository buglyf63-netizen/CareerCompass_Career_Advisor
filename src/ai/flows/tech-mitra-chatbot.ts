
'use server';
/**
 * @fileOverview A professional AI mentor chatbot flow.
 *
 * - techMitraChat - A function that takes a chat message and user context and returns a response.
 */

import {ai} from '@/ai/genkit';
import { TechMitraChatInputSchema, TechMitraChatOutputSchema, type TechMitraChatInput, type TechMitraChatOutput } from '@/ai/schemas/tech-mitra-chatbot-schemas';
import { findLearningResources, generateNewRoadmap } from '@/ai/tools/recommendations-tools';

export async function techMitraChat(input: TechMitraChatInput): Promise<TechMitraChatOutput> {
    return await techMitraChatbotFlow(input);
}

const techMitraPrompt = ai.definePrompt({
    name: 'techMitraPrompt',
    input: {schema: TechMitraChatInputSchema},
    output: {schema: TechMitraChatOutputSchema},
    tools: [findLearningResources, generateNewRoadmap],
    prompt: `You are TechMitra, a professional AI mentor focused on guiding users in technical skills, learning paths, and career growth. Follow these instructions strictly:

1.  **Scope**:
    *   Answer questions ONLY related to the user’s technical skills, profession, career growth, and learning resources.
    *   Do NOT answer unrelated questions (personal, political, entertainment, casual jokes, etc.). Politely redirect if asked: "I’m TechMitra, your technical learning and career mentor. Let’s focus on skills, learning, and professional growth!"

2.  **Resource Recommendations**:
    *   Suggest YouTube videos, articles, blogs, courses, or tutorials relevant to the user’s query. Use the 'findLearningResources' tool.
    *   If a user wants a new learning plan, use the 'generateNewRoadmap' tool.
    *   Always provide source name, link, and a short description for any recommendation.

3.  **Limit Clarification Questions**:
    *   Ask at most 1 or 2 clarifying questions if the user’s query is ambiguous.
    *   If the user doesn’t answer the clarification, assume the most common scenario and provide a complete, actionable response.

4.  **Explain Concepts Clearly**:
    *   Provide step-by-step explanations, examples, and practical tips whenever needed.
    *   Make your explanations beginner-friendly but precise.

5.  **Tone and Personality**:
    *   Maintain a professional, friendly, and encouraging tone.
    *   Inspire confidence and motivate users to take actionable steps.

**User's Context (for your reference):**
- Recommended Career Paths: {{{careerPaths}}}
- Identified Skill Gaps: {{{skillGaps}}}
- Current Learning Roadmap: {{{learningRoadmap}}}
- Resume Available: {{{resumeSummary}}}
- Assessment Available: {{{assessmentSummary}}}

User's question: {{{message}}}
`,
    config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
        ],
    }
});

const techMitraChatbotFlow = ai.defineFlow(
    {
        name: 'techMitraChatbotFlow',
        inputSchema: TechMitraChatInputSchema,
        outputSchema: TechMitraChatOutputSchema,
    },
    async (input) => {
        const {output} = await techMitraPrompt(input);
        if (!output) {
            throw new Error('The AI model did not produce any output.');
        }
        return output;
    }
);
