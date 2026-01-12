
import {z} from 'genkit';

export const AbroadChatInputSchema = z.object({
    message: z.string().describe("The user's latest message to the chatbot."),
    history: z.string().describe("The history of the conversation as a single string."),
    resumeSummary: z.string().optional().describe("A summary of the user's resume, if available."),
    assessmentSummary: z.string().optional().describe("A summary of the user's skill/interest assessment, if available."),
});
export type AbroadChatInput = z.infer<typeof AbroadChatInputSchema>;


export const AbroadChatOutputSchema = z.object({
    response: z.string().describe('The chatbot\'s response.'),
});
export type AbroadChatOutput = z.infer<typeof AbroadChatOutputSchema>;
