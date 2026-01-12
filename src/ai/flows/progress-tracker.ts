
'use server';
/**
 * @fileOverview This file defines the Genkit flow for generating the career data for the Progress Tracker.
 *
 * - generateCareerData: A function that returns a structured list of job roles, specializations, and milestones.
 */

import careerData from '@/lib/progress-data.json';
import { JobRole, CareerData } from '@/ai/schemas/progress-tracker-schemas';

// Manually cast the imported JSON to our interface
const typedCareerData: CareerData = careerData as any;

export async function generateCareerData(): Promise<CareerData> {
  // This function is now deprecated as career data is loaded directly into the context.
  // It is kept for potential future use or can be removed if not needed.
  return typedCareerData;
}
