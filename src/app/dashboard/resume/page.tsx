
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileEdit } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { analyzeResumeAction } from '@/app/actions/resume';
import { ResumeResults } from '@/components/ui/resume-results';


export default function ResumePage() {
  const { toast } = useToast();
  const { recommendations, setRecommendations, setAssessmentData, assessmentData } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
       if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF document.",
          variant: "destructive",
        });
        setFile(null);
        // Clear the input value so the user can select the same file again if they want
        event.target.value = ''; 
        return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
        toast({
            title: "No file selected",
            description: "Please select a PDF file to analyze.",
            variant: "destructive"
        });
        return;
    }

    setIsAnalyzing(true);
    toast({
        title: "Analyzing Resume",
        description: "Your resume is being processed by our AI. This may take a moment."
    });

    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await analyzeResumeAction(formData);

        if (result.error) {
            toast({
                title: "Analysis Failed",
                description: result.error,
                variant: "destructive"
            });
            setIsAnalyzing(false);
            return;
        }

        if (result.assessmentInput && result.recommendations) {
          // Preserve the userType when setting new assessment data
          const currentData = assessmentData || { userType: '' };
          await setAssessmentData({ ...currentData, ...result.assessmentInput });
          await setRecommendations(result.recommendations);

          toast({
              title: "Analysis Complete!",
              description: "Your personalized recommendations are ready."
          });

        } else {
            throw new Error("Failed to get results from analysis.");
        }

    } catch (error: any) {
        console.error("Error analyzing resume: ", error);
        toast({
            title: "Analysis Failed",
            description: error.message || "There was an error processing your resume. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsAnalyzing(false);
    }
  }
  
  const handleAnalyzeNew = async () => {
      await setRecommendations(null);
      // Only clear resume-specific data, keep userType
      if (assessmentData) {
        const { resumeText, skills, interests, ...rest } = assessmentData;
        await setAssessmentData({
            ...rest,
            resumeText: '',
            skills: '',
            interests: '',
        });
      }
      setFile(null);
  }

  if (recommendations) {
    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAnalyzeNew} variant="outline">
                    <FileEdit className="mr-2 h-4 w-4" />
                    Analyze New Resume
                </Button>
            </div>
            <ResumeResults data={recommendations} onRegenerate={handleAnalyze} />
        </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Upload Your Resume</CardTitle>
          <CardDescription>
            Upload your resume in PDF format. Our AI will analyze it to provide personalized career recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg border-muted-foreground/30 hover:border-primary/50 transition-colors">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {file ? `File: ${file.name}` : 'Drag & drop your resume here'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
            <Button variant="outline" className="mt-4" asChild>
                <label htmlFor="resume-upload" className="cursor-pointer">
                    Browse Files
                </label>
            </Button>
            <Input id="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" disabled={isAnalyzing} />
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleAnalyze} disabled={!file || isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
