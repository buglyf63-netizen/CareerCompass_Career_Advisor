'use server';
/**
 * @fileOverview This file defines a Genkit flow for finding relevant job listings based on a career path.
 *
 * - findRelevantJobs - A function that takes a career path and returns a list of job listings.
 * - FindRelevantJobsInput - The input type for the findRelevantJobs function.
 * - FindRelevantJobsOutput - The return type for the findRelevantJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindRelevantJobsInputSchema = z.object({
  careerPath: z.string().describe('The career path to find jobs for.'),
});
export type FindRelevantJobsInput = z.infer<typeof FindRelevantJobsInputSchema>;

const JobListingSchema = z.object({
    title: z.string().describe('The job title.'),
    company: z.string().describe('The company name.'),
    location: z.string().describe('The job location (e.g., "Bangalore, India", "Remote").'),
    url: z.string().url().describe('A URL to a fictional job application page.'),
});

const FindRelevantJobsOutputSchema = z.object({
  jobListings: z.array(JobListingSchema).describe('An array of 3-5 relevant fictional job listings.'),
});
export type FindRelevantJobsOutput = z.infer<typeof FindRelevantJobsOutputSchema>;


export async function findRelevantJobs(input: FindRelevantJobsInput): Promise<FindRelevantJobsOutput> {
  return findRelevantJobsFlow(input);
}

const findJobsPrompt = ai.definePrompt({
  name: 'findJobsPrompt',
  input: {schema: FindRelevantJobsInputSchema},
  output: {schema: FindRelevantJobsOutputSchema},
  prompt: `You are a helpful career assistant for users in India. A user wants to see relevant job listings for a recommended career path.

  Generate a list of 3-5 fictional, but realistic, job listings based on the provided career path. Job locations should be major cities in India (e.g., Bangalore, Pune, Hyderabad, Mumbai, Remote).

  For each job, provide a title, a fictional company name, a location, and a fictional URL to an application page.

  Career Path: {{{careerPath}}}
`,
});

const findRelevantJobsFlow = ai.defineFlow(
  {
    name: 'findRelevantJobsFlow',
    inputSchema: FindRelevantJobsInputSchema,
    outputSchema: FindRelevantJobsOutputSchema,
  },
  async input => {
    const {output} = await findJobsPrompt(input);
    return output!;
  }
);
