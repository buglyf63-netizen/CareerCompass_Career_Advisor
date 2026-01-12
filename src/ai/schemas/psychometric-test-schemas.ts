
import { z } from 'zod';

const KidDetailsSchema = z.object({
    grade: z.string().describe("The user's current grade in school (e.g., 5th)."),
});

const SchoolStudentDetailsSchema = z.object({
    grade: z.string().describe("The user's current grade in school."),
});

const CollegeStudentDetailsSchema = z.object({
    fieldOfStudy: z.string().describe("The user's field of study or major."),
});

const ProfessionalDetailsSchema = z.object({
    experience: z.string().describe("The user's years of professional experience."),
    role: z.string().describe("The user's current or most recent job role."),
    industry: z.string().describe("The industry the user works in."),
});


// Schema for generating the test
export const GeneratePsychometricTestInputSchema = z.object({
  userType: z.enum(['kid', 'school-student', 'college-student', 'professional']).describe('The user segment.'),
  kidDetails: KidDetailsSchema.optional(),
  schoolStudentDetails: SchoolStudentDetailsSchema.optional(),
  collegeStudentDetails: CollegeStudentDetailsSchema.optional(),
  professionalDetails: ProfessionalDetailsSchema.optional(),
});
export type GeneratePsychometricTestInput = z.infer<typeof GeneratePsychometricTestInputSchema>;

export const TestQuestionSchema = z.object({
    question: z.string().describe('The question text.'),
    options: z.array(z.string()).optional().describe('An array of options for multiple-choice questions.'),
});

export const GeneratePsychometricTestOutputSchema = z.object({
  questions: z.array(TestQuestionSchema).describe('An array of 20 psychometric test questions.'),
});
export type GeneratePsychometricTestOutput = z.infer<typeof GeneratePsychometricTestOutputSchema>;


// Schema for evaluating the test
export const TestAnswerSchema = z.object({
    question: z.string().describe("The question that was answered."),
    answer: z.string().describe("The user's answer to the question."),
});

export const EvaluatePsychometricTestInputSchema = z.object({
    userType: z.enum(['kid', 'school-student', 'college-student', 'professional']).describe('The user segment.'),
    testAnswers: z.array(TestAnswerSchema).describe("The user's answers to the psychometric test."),
    paragraphResponse: z.string().describe("A 100-150 word paragraph about the user's interests, motivations, and goals."),
    kidDetails: KidDetailsSchema.optional(),
    schoolStudentDetails: SchoolStudentDetailsSchema.optional(),
    collegeStudentDetails: CollegeStudentDetailsSchema.optional(),
    professionalDetails: ProfessionalDetailsSchema.optional(),
});
export type EvaluatePsychometricTestInput = z.infer<typeof EvaluatePsychometricTestInputSchema>;


export const EvaluatePsychometricTestOutputSchema = z.object({
    psychometricSummaryReport: z.string().describe("A detailed, empathetic psychologist-style report covering personality, aptitude, interests, values, and EQ. Formatted as a single Markdown string."),
    careerAdvisory: z.string().describe("Extensive career advice covering pathways, culture fit, skill gaps, trends, and challenges. Formatted as a single Markdown string."),
    expertAdvice: z.string().describe("A warm, conversational, human-like section from a career coach, using relatable metaphors and actionable guidance. Formatted as a single Markdown string."),
});
export type EvaluatePsychometricTestOutput = z.infer<typeof EvaluatePsychometricTestOutputSchema>;

    