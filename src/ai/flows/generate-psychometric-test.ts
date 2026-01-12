
'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a personalized psychometric test
 * for a user based on their segment (e.g., student, professional).
 *
 * - generatePsychometricTest - A function that takes a user segment and returns a 20-question test.
 * - GeneratePsychometricTestInput - The input type for the generatePsychometricTest function.
 * - GeneratePsychometricTestOutput - The return type for the generatePsychometricTest function.
 */

import {ai} from '@/ai/genkit';
import { GeneratePsychometricTestInputSchema, GeneratePsychometricTestOutputSchema, type GeneratePsychometricTestInput, type GeneratePsychometricTestOutput } from '@/ai/schemas/psychometric-test-schemas';

export async function generatePsychometricTest(input: GeneratePsychometricTestInput): Promise<GeneratePsychometricTestOutput> {
  return generateTestFlow(input);
}

const generateTestPrompt = ai.definePrompt({
  name: 'generateTestPrompt',
  input: {schema: GeneratePsychometricTestInputSchema},
  output: {schema: GeneratePsychometricTestOutputSchema},
  prompt: `You are a Career & Skills Psychometric Assistant. Your job is to create a personalized 20-question psychometric test based on the user's persona. The test should be culturally relevant for India.

**User Persona: {{{userType}}}**

{{#if kidDetails}}
**Persona: Kid (8-13 years)**
- **Goal:** Discover natural inclinations, hobbies, and talents.
- **Test Focus:**
    - **Aptitude:** Simple puzzles, memory challenges, shape recognition, pattern completion.
    - **Personality:** Playful choices (e.g., "Do you prefer playing in a team or alone?").
    - **Interests:** Image-based or simple questions about hobbies (music, coding, art, sports, reading).
- **Question Style:** Fun, simple language. Use emojis where appropriate.
{{/if}}

{{#if schoolStudentDetails}}
**Persona: School Student (14-18 years)**
- **Grade:** {{schoolStudentDetails.grade}}
- **Goal:** Help decide academic streams (Science, Commerce, Arts) and potential career clusters.
- **Test Focus:**
    - **Aptitude:** Logical reasoning, basic math, verbal skills, abstract reasoning.
    - **Personality:** Curiosity, discipline, teamwork, creativity.
    - **Interests:** Subject preferences (Math vs. History), dream career questions.
- **Question Style:** Motivational and practical.
{{/if}}

{{#if collegeStudentDetails}}
**Persona: College Student (18-24 years)**
- **Field of Study:** {{collegeStudentDetails.fieldOfStudy}}
- **Goal:** Choose internships, jobs, or higher education paths.
- **Test Focus:**
    - **Aptitude:** Problem-solving, analytical ability, abstract thinking.
    - **Personality:** Collaboration vs. independence, risk appetite.
    - **Interests:** Domains like Tech, Business, Research, Arts, Public Service.
- **Question Style:** Balanced professional and advisory tone. For college students, include questions about their interest and passion for their field, not just technical knowledge checks. For example: "How passionate are you about your current course?"
{{/if}}

{{#if professionalDetails}}
**Persona: Working Professional (25+ years)**
- **Years of Experience:** {{professionalDetails.experience}}
- **Current Role:** {{professionalDetails.role}}
- **Industry:** {{professionalDetails.industry}}
- **Goal:** Career growth, transitions, or upskilling.
- **Test Focus:**
    - **Aptitude:** Scenario-based reasoning, decision-making, problem-solving.
    - **Personality:** Work values (stability vs. innovation), leadership potential.
    - **Interests:** Exploring new domains (e.g., tech, management, entrepreneurship).
- **Question Style:** Formal and strategic.
{{/if}}

**Instructions for Test Generation:**
- Generate exactly 20 questions relevant to the user's persona and details.
- Use a mix of question types:
    1.  **Multiple-Choice:** Provide options in the 'options' array.
    2.  **Scale-Based:** Leave 'options' empty and include "On a scale of 1 to 5" in the question text.
    3.  **Open-Ended:** Leave 'options' empty and ask a question requiring a written response. Do NOT include "On a scale..." for these.
- **Include questions related to hobbies and sports preferences for all personas.** Ask about playing vs. following, team vs. individual sports, etc.
`,
});

const generateTestFlow = ai.defineFlow(
  {
    name: 'generateTestFlow',
    inputSchema: GeneratePsychometricTestInputSchema,
    outputSchema: GeneratePsychometricTestOutputSchema,
  },
  async input => {
    const {output} = await generateTestPrompt(input);
    return output!;
  }
);
