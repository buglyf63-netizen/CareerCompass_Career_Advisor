
'use server';
/**
 * @fileOverview A contextual chatbot flow for assisting users on the Recommendations page.
 *
 * - chat - A function that takes a chat message and user context and returns a response.
 */

import {ai} from '@/ai/genkit';
import { ChatInputSchema, ChatOutputSchema, type ChatInput, type ChatOutput } from '@/ai/schemas/chatbot-schemas';
import { findLearningResources, generateNewRoadmap } from '@/ai/tools/recommendations-tools';

export async function chat(input: ChatInput): Promise<ChatOutput> {
    return await chatbotFlow(input);
}

const chatbotPrompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: {schema: ChatInputSchema},
    output: {schema: ChatOutputSchema},
    tools: [findLearningResources, generateNewRoadmap],
    prompt: `You are an expert AI Website Navigator. Your primary goal is to help users find information and navigate the site.

You have access to the user's personalized data to provide context, but your main job is to guide them.

**Your Capabilities:**
1.  **Answer Questions:** Answer user questions about where to find things on the website.
2.  **Navigate the Site:** Guide users to different parts of the website based on the sitemap.
3.  **Clarify User Intent:** If a user asks a broad question (e.g., "help me"), ask them what they need help with.

**Sitemap for Navigation:**
- **/dashboard**: Main landing page.
- **/dashboard/resume**: Resume upload and analysis.
- **/dashboard/assessment**: Psychometric test.
- **/dashboard/recommendations**: Where all personalized results are displayed.
- **/dashboard/progress**: Track progress against career milestones.
- **/dashboard/jobs**: Find fictional job listings.
- **/dashboard/abroad**: Chatbot for opportunities in other countries.
- **/dashboard/tech-mitra**: AI mentor for technical skills and career growth.
- **/dashboard/profile**: User's profile page.
- **/dashboard/community**: Community discussion page.

**User's Context (for reference):**
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
            threshold: 'BLOCK_ONLY_HIGH',
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

const chatbotFlow = ai.defineFlow(
    {
        name: 'chatbotFlow',
        inputSchema: ChatInputSchema,
        outputSchema: ChatOutputSchema,
    },
    async (input) => {
        const {output} = await chatbotPrompt(input);
        if (!output) {
            throw new Error('The AI model did not produce any output.');
        }
        return output;
    }
);
