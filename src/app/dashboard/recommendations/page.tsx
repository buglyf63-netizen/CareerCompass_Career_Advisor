
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Star, BarChart, FileText, Sparkles, UserCheck } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { EvaluatePsychometricTestOutput } from '@/ai/schemas/psychometric-test-schemas';
import { ResumeResults } from '@/components/ui/resume-results';
import ReactMarkdown from 'react-markdown';

export default function RecommendationsPage() {
  const { recommendations, psychometricResults } = useAppContext();
  const [view, setView] = useState<'initial' | 'results'>('initial');

  useEffect(() => {
    if (recommendations || psychometricResults) {
      setView('results');
    } else {
        setView('initial');
    }
  }, [recommendations, psychometricResults]);

  const InitialState = () => (
    <div className="flex items-center justify-center h-[60vh] text-center">
      <Card className="max-w-lg glass-card">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Get Your Personalized Recommendations</CardTitle>
          <CardDescription>
            Your AI-generated recommendations will appear here. Start by either uploading your resume or taking our psychometric test.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/dashboard/resume">
              Upload Resume
            </Link>
          </Button>
          <Button size="lg" asChild variant="secondary">
            <Link href="/dashboard/assessment">
              Take Psychometric Test
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const PsychometricResults = ({ data }: { data: EvaluatePsychometricTestOutput }) => (
     <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary"><UserCheck className="mr-2 h-4 w-4"/>Psychometric Report</TabsTrigger>
          <TabsTrigger value="careers"><BarChart className="mr-2 h-4 w-4"/>Career Advisory</TabsTrigger>
          <TabsTrigger value="advice"><Sparkles className="mr-2 h-4 w-4"/>Expert Advice</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="font-headline">Your Psychometric Report</CardTitle>
                    <CardDescription>A detailed analysis of your personality, aptitude, and interests.</CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{data.psychometricSummaryReport}</ReactMarkdown>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="careers">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="font-headline">AI Career Advisory</CardTitle>
                    <CardDescription>Actionable advice on your career path, workplace culture, and skill development.</CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                   <ReactMarkdown>{data.careerAdvisory}</ReactMarkdown>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="advice">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="font-headline">A Word From Your AI Mentor</CardTitle>
                    <CardDescription>Warm, human-like advice to guide you on your journey.</CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                   <ReactMarkdown>{data.expertAdvice}</ReactMarkdown>
                </CardContent>
            </Card>
        </TabsContent>
     </Tabs>
  );

  const ResultsState = () => (
    <div className="space-y-8">
      {psychometricResults && (
        <section>
          <h2 className="text-2xl font-headline font-bold mb-4 flex items-center"><BrainCircuit className="mr-3 h-6 w-6 text-primary"/> Psychometric Test Results</h2>
          <PsychometricResults data={psychometricResults} />
        </section>
      )}

      {recommendations && (
        <section>
           <h2 className="text-2xl font-headline font-bold mb-4 flex items-center"><FileText className="mr-3 h-6 w-6 text-primary"/> Resume Analysis</h2>
          <ResumeResults data={recommendations} />
        </section>
      )}
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'results':
        if (!psychometricResults && !recommendations) {
            return <InitialState />;
        }
        return <ResultsState />;
      case 'initial':
      default:
        return <InitialState />;
    }
  }

  return renderContent();
}
