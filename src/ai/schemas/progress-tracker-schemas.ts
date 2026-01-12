/**
 * @fileOverview Schemas for the AI Career Progress Tracker.
 *
 * - CareerDataSchema: The schema for the entire career data structure.
 * - JobRoleSchema: The schema for a single job role, including milestones.
 */

import { z } from 'genkit';

const BadgeSchema = z.object({
  name: z.string().describe('The name of the badge earned.'),
  icon: z.string().describe('A single emoji representing the badge.'),
});

const MilestoneSchema = z.object({
  task: z.string().describe('A clear, actionable task for the user to complete.'),
  badge: BadgeSchema.describe('The badge awarded for completing the milestone.'),
  progressWeight: z.number().min(1).max(100).describe('The weight of the milestone for progress calculation.'),
});

export const JobRoleSchema = z.object({
  role: z.string().describe('The name of the job role.'),
  milestones: z.array(MilestoneSchema).describe('A list of milestones to achieve for this role.'),
});

export const CareerDataSchema = z.record(
    z.string(), // The group name (e.g., "Education")
    z.record(
        z.string(), // The job role name (e.g., "Teacher")
        z.object({
            milestones: z.array(MilestoneSchema).describe('A list of milestones to achieve for this role.')
        })
    ).describe('A map of job roles within the group.')
).describe('A map of career groups, each containing multiple job roles.');


export type Badge = z.infer<typeof BadgeSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type JobRole = z.infer<typeof JobRoleSchema>;
export type CareerData = z.infer<typeof CareerDataSchema>;
