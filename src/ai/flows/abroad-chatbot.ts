
'use server';
/**
 * @fileOverview A chatbot flow for providing advice on studying or working abroad.
 *
 * - abroadChat - A function that takes a chat history and user message and returns a response.
 */

import {ai} from '@/ai/genkit';
import {type GenerateRequest} from 'genkit';
import {AbroadChatInputSchema, AbroadChatOutputSchema, type AbroadChatInput, type AbroadChatOutput } from '@/ai/schemas/abroad-chatbot-schemas';
import { searchWebForAbroadInfo } from '@/ai/tools/abroad-tools';

export async function abroadChat(input: AbroadChatInput): Promise<AbroadChatOutput> {
    return await abroadChatbotFlow(input);
}

const promptInstructions = `You are an expert AI assistant for advising users on studying or working abroad. Your goal is to be interactive and collect information before providing recommendations. You have access to the user's resume and assessment summary if they have provided it.

**User Context:**
- Resume Summary: {{{resumeSummary}}}
- Assessment Summary: {{{assessmentSummary}}}

Follow these steps:
1. Greet the user. If they have a resume or assessment data, acknowledge it and ask if they'd like advice based on their profile for 'college' or a 'job' abroad. If no data exists, ask if they are looking for advice on 'college' or a 'job'.
2. If they have a profile, you can skip asking for skills and interests directly, but confirm their target country. If they don't have a profile, ask for their skills and interests, then their target country.
3. ONLY after you have their goal (college/job) and target country (and skills, if needed), provide 3-5 specific and relevant college or company recommendations.
4. Use the user's profile to tailor the recommendations. For example, if their resume shows a software background, suggest tech companies or computer science programs.
5. Use the 'searchWebForAbroadInfo' tool to get the most current information on universities, companies, application links, and program details.

Continue the conversation based on the user's last message.`;


const abroadChatbotPrompt = ai.definePrompt({
    name: 'abroadChatbotPrompt',
    tools: [searchWebForAbroadInfo],
    input: {schema: AbroadChatInputSchema},
    output: {schema: AbroadChatOutputSchema},
    prompt: ``, // This is dynamically built in the flow
});

const abroadChatbotFlow = ai.defineFlow(
    {
        name: 'abroadChatbotFlow',
        inputSchema: AbroadChatInputSchema,
        outputSchema: AbroadChatOutputSchema,
    },
    async (input) => {
        // Build a proper chat history object for the model
        const history: GenerateRequest['history'] = [];
        const historyLines = input.history.split('\n');

        historyLines.forEach(line => {
            if (line.startsWith('User: ')) {
                history.push({role: 'user', content: [{text: line.substring(6)}]});
            } else if (line.startsWith('AI: ')) {
                history.push({role: 'model', content: [{text: line.substring(4)}]});
            }
        });
        
        const {output} = await ai.generate({
            model: 'googleai/gemini-1.5-flash-latest',
            tools: [searchWebForAbroadInfo],
            system: promptInstructions.replace('{{{resumeSummary}}}', input.resumeSummary || 'Not provided').replace('{{{assessmentSummary}}}', input.assessmentSummary || 'Not provided'),
            history: history,
            prompt: input.message,
            output: {
                schema: AbroadChatOutputSchema,
            }
        });

        if (!output) {
            throw new Error('The AI model did not produce any output.');
        }
        return output;
    }
);
