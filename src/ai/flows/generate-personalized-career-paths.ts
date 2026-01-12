
// src/ai/flows/generate-personalized-career-paths.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized career paths based on user's resume, skills, and interests.
 *
 * - generatePersonalizedCareerPaths - A function that takes user data as input and returns personalized career path recommendations.
 * - GeneratePersonalizedCareerPathsInput - The input type for the generatePersonalizedCareerPaths function.
 * - GeneratePersonalizedCareerPathsOutput - The return type for the generatePersonalizedCareerPaths function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedCareerPathsInputSchema = z.object({
  resumeText: z.string().describe('The text content of the user resume.'),
  skills: z.string().describe('A comma separated list of skills.'),
  interests: z.string().describe('A comma separated list of career interests.'),
});
export type GeneratePersonalizedCareerPathsInput = z.infer<typeof GeneratePersonalizedCareerPathsInputSchema>;

const GeneratePersonalizedCareerPathsOutputSchema = z.object({
  careerPaths: z.array(z.string()).describe('An array of personalized career path recommendations.'),
  skillGaps: z.array(z.string()).describe('An array of skills the user needs to develop for the recommended career paths.'),
  learningRoadmap: z.string().describe('A personalized learning roadmap in a specific text format.'),
});
export type GeneratePersonalizedCareerPathsOutput = z.infer<typeof GeneratePersonalizedCareerPathsOutputSchema>;


export async function generatePersonalizedCareerPaths(input: GeneratePersonalizedCareerPathsInput): Promise<GeneratePersonalizedCareerPathsOutput> {
  return generatePersonalizedCareerPathsFlow(input);
}

const careerPathPrompt = ai.definePrompt({
  name: 'careerPathPrompt',
  input: {schema: GeneratePersonalizedCareerPathsInputSchema},
  output: {schema: GeneratePersonalizedCareerPathsOutputSchema},
  prompt: `You are a career advisor. A user has provided their resume, skills, and interests.

Based on this, suggest 3-5 personalized career paths, identify skill gaps, and create a learning roadmap.

The learning roadmap must be in a well-formatted Markdown format.

Here is the format for the learning roadmap:
---
### User Profile
- **Current Skills**: [User's provided skills]
- **Target Careers**: [Generated career paths]
- **Skill Gaps**: [Generated skill gaps]
- **Roadmap Version**: Original

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

User Data:
Resume text: {{{resumeText}}}
Skills: {{{skills}}}
Interests: {{{interests}}}

Respond in JSON format. The 'learningRoadmap' field must contain the roadmap in the specified Markdown format.
`,
});

const generatePersonalizedCareerPathsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedCareerPathsFlow',
    inputSchema: GeneratePersonalizedCareerPathsInputSchema,
    outputSchema: GeneratePersonalizedCareerPathsOutputSchema,
  },
  async input => {
    const {output} = await careerPathPrompt(input);
    return output!;
  }
);
