
'use server';
/**
 * @fileOverview Generates a personalized learning roadmap for a user based on their career path and skill gaps.
 *
 * - generatePersonalizedLearningRoadmap - A function that generates a personalized learning roadmap.
 * - GeneratePersonalizedLearningRoadmapInput - The input type for the generatePersonalizedLearningRoadmap function.
 * - GeneratePersonalizedLearningRoadmapOutput - The return type for the generatePersonalizedLearningRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedLearningRoadmapInputSchema = z.object({
  careerPath: z.string().describe('The recommended career path for the user.'),
  skillGaps: z.string().describe('The identified skill gaps for the user to reach the career path.'),
  resumeSummary: z.string().optional().describe('A summary of the user\u0027s resume, if available.'),
  assessmentSummary: z.string().optional().describe('A summary of the user\u0027s skill/interest assessment, if available.'),
});
export type GeneratePersonalizedLearningRoadmapInput = z.infer<typeof GeneratePersonalizedLearningRoadmapInputSchema>;

const GeneratePersonalizedLearningRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('A personalized learning roadmap in a specific text format, including courses, projects, and resources.'),
});
export type GeneratePersonalizedLearningRoadmapOutput = z.infer<typeof GeneratePersonalizedLearningRoadmapOutputSchema>;

export async function generatePersonalizedLearningRoadmap(input: GeneratePersonalizedLearningRoadmapInput): Promise<GeneratePersonalizedLearningRoadmapOutput> {
  return generatePersonalizedLearningRoadmapFlow(input);
}

const generatePersonalizedLearningRoadmapPrompt = ai.definePrompt({
  name: 'generatePersonalizedLearningRoadmapPrompt',
  input: {schema: GeneratePersonalizedLearningRoadmapInputSchema},
  output: {schema: GeneratePersonalizedLearningRoadmapOutputSchema},
  prompt: `You are an AI career advisor creating a personalized learning roadmap for a user in India.

Based on the user's desired career path, skill gaps, and existing profile, generate a comprehensive learning roadmap. The roadmap must be in a well-formatted Markdown format. Prioritize courses and resources from India-based platforms or those that are highly relevant to the Indian job market.

Here is the format for the text roadmap:
---
### User Profile
- **Current Skills**: [Infer from assessment summary or leave blank if not provided]
- **Target Careers**: [The user's desired career path]
- **Skill Gaps**: [The user's provided skill gaps]
- **Roadmap Version**: Alternative

### Learning Path

**Step 1: [Step Title]**
*Description*: [Brief description of the step]
*Duration*: [Estimated time, e.g., 2 weeks]
*Resources*:
  - **YouTube**: "[Video Title]" – [URL]
  - **Course**: "[Course Title]" – [URL]

**Step 2: [Step Title]**
...

### Notes / Recommendations
- [Actionable recommendation 1]
- [Actionable recommendation 2]
---

User's Data:
Desired Career Path: {{{careerPath}}}
Skill Gaps: {{{skillGaps}}}

{{#if resumeSummary}}
Resume Summary: {{{resumeSummary}}}
{{/if}}

{{#if assessmentSummary}}
Assessment Summary: {{{assessmentSummary}}}
{{/if}}

Your entire output must be in JSON format. The 'roadmap' field must contain the roadmap in Markdown.
  `,
});

const generatePersonalizedLearningRoadmapFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedLearningRoadmapFlow',
    inputSchema: GeneratePersonalizedLearningRoadmapInputSchema,
    outputSchema: GeneratePersonalizedLearningRoadmapOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedLearningRoadmapPrompt(input);
    return output!;
  }
);
