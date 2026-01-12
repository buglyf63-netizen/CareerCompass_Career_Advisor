
'use server';

import { generatePersonalizedCareerPaths } from '@/ai/flows/generate-personalized-career-paths';
import pdf from 'pdf-parse';

function looksLikeResume(text: string): boolean {
    const resumeKeywords = [
        'education',
        'experience',
        'work experience',
        'skills',
        'projects',
        'certifications',
        'summary',
        'objective',
        'contact',
        'linkedin',
        'github',
        'university',
        'college'
    ];
    
    const lowerCaseText = text.toLowerCase();
    let score = 0;
    
    // Check for keywords
    for (const keyword of resumeKeywords) {
        if (lowerCaseText.includes(keyword)) {
            score++;
        }
    }

    // Check for email
    if (/\S+@\S+\.\S+/.test(lowerCaseText)) {
        score++;
    }

    // Check for phone number-like patterns
    if (/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(lowerCaseText)) {
        score++;
    }
    
    // If we find at least 3 indicators, it's likely a resume.
    return score >= 3;
}


export async function analyzeResumeAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided.' };
    }

    if (file.type !== 'application/pdf') {
        return { error: '⚠️ The uploaded file does not appear to be a valid resume. Please upload a PDF document containing your resume.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pdfData = await pdf(buffer);
    const resumeText = pdfData.text;

    if (!resumeText) {
      return { error: 'Could not extract text from the PDF.' };
    }
    
    if (!looksLikeResume(resumeText)) {
        return { error: '⚠️ The uploaded file does not seem to be a resume. Please ensure it is a PDF document containing your resume.' };
    }


    const assessmentInput = {
      resumeText,
      skills: '', // AI will infer from resume
      interests: '', // AI will infer from resume
    };

    const recommendations = await generatePersonalizedCareerPaths(assessmentInput);

    return { assessmentInput, recommendations };

  } catch (error: any) {
    console.error('Error in analyzeResumeAction:', error);
    return { error: error.message || 'An unexpected error occurred during resume analysis.' };
  }
}
