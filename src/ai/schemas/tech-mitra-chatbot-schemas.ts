
import {z} from 'genkit';

// This is an alias for the main chat input schema, but helps to keep concerns separate.
export const TechMitraChatInputSchema = z.object({
    message: z.string().describe("The user's message to the chatbot."),
    persona: z.enum(['navigator', 'tech-mitra']).describe('The selected AI personality for the chatbot.'),
    careerPaths: z.string().describe("The recommended career paths for the user."),
    skillGaps: z.string().describe("The user's identified skill gaps."),
    learningRoadmap: z.string().describe("The user's personalized learning roadmap."),
    resumeSummary: z.string().optional().describe("A summary of the user's resume, if available."),
    assessmentSummary: z.string().optional().describe("A summary of the user's skill/interest assessment, if available."),
});
export type TechMitraChatInput = z.infer<typeof TechMitraChatInputSchema>;


export const TechMitraChatOutputSchema = z.object({
    response: z.string().describe('The chatbot\'s response.'),
});
export type TechMitraChatOutput = z.infer<typeof TechMitraChatOutputSchema>;
