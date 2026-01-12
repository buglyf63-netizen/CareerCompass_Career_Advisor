
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Download, Loader2, GitMerge, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { GeneratePersonalizedCareerPathsOutput } from '@/ai/flows/generate-personalized-career-paths';
import { generateRoadmapFlowchart } from '@/ai/flows/generate-roadmap-flowchart';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { useTheme } from 'next-themes';


const Flowchart = ({ chart }: { chart: string }) => {
    const { theme } = useTheme();

    useEffect(() => {
        if (chart) {
             import('mermaid').then((mermaid) => {
                try {
                    const getCssVar = (name: string) => `hsl(${getComputedStyle(document.body).getPropertyValue(name).trim()})`;

                    const lightThemeVariables = {
                        background: getCssVar('--card'),
                        primaryColor: getCssVar('--background'),
                        primaryTextColor: getCssVar('--foreground'),
                        primaryBorderColor: getCssVar('--primary'),
                        lineColor: getCssVar('--primary'),
                        textColor: getCssVar('--foreground'),
                        fontSize: '14px',
                    };

                    const darkThemeVariables = {
                        background: getCssVar('--card'),
                        primaryColor: getCssVar('--background'),
                        primaryTextColor: '#111827',
                        primaryBorderColor: getCssVar('--primary'),
                        lineColor: getCssVar('--primary'),
                        textColor: getCssVar('--foreground'),
                        fontSize: '14px',
                    };

                    mermaid.default.initialize({
                        startOnLoad: false,
                        theme: theme === 'dark' ? 'dark' : 'base',
                        themeVariables: theme === 'dark' ? darkThemeVariables : lightThemeVariables,
                    });
                     const mermaidElement = document.querySelector('.mermaid');
                    if (mermaidElement) {
                         mermaid.default.run({
                            nodes: [mermaidElement],
                        });
                    }
                } catch (e) {
                    console.error("Mermaid rendering error:", e);
                }
            });
        }
    }, [chart, theme]);

    return chart ? <div className="mermaid flex justify-center p-4">{chart}</div> : null;
};


export const ResumeResults = ({ data, onRegenerate }: { data: GeneratePersonalizedCareerPathsOutput, onRegenerate?: () => void }) => {
  const { assessmentData } = useAppContext();
  const [flowchart, setFlowchart] = useState<string | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  
  const handleDownloadPdf = (content: string, filename: string, title: string) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    checkPageBreak(10);
    doc.text(title, margin, y);
    y += 15;
    
    const lines = content.split('\n');

    lines.forEach(line => {
      line = line.trim();

      if (line.startsWith('### ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        const text = line.replace('### ', '');
        const splitText = doc.splitTextToSize(text, maxLineWidth);
        checkPageBreak(splitText.length * 7 + 6);
        y += 8;
        doc.text(splitText, margin, y);
        y += splitText.length * 7;
      } else if (line.startsWith('**Step')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        const text = line.replace(/\*\*/g, '');
        const splitText = doc.splitTextToSize(text, maxLineWidth);
        checkPageBreak(splitText.length * 6 + 5);
        y += 6;
        doc.text(splitText, margin, y);
        y += splitText.length * 6;
      } else if (line.startsWith('*Description*:') || line.startsWith('*Duration*:') || line.startsWith('*Resources*:')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          const text = line.replace(/\*/g, '');
          const splitText = doc.splitTextToSize(text, maxLineWidth);
          checkPageBreak(splitText.length * 5 + 4);
          y+= 4;
          doc.text(splitText, margin, y);
          y += splitText.length * 5;
      } else if (line.startsWith('- ')) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const text = line.replace('- ', '');
        const splitText = doc.splitTextToSize(text, maxLineWidth - 5);
        checkPageBreak(splitText.length * 5 + 4);
        doc.text(`•`, margin, y);
        doc.text(splitText, margin + 5, y);
        y += splitText.length * 5;
      } else if (line) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(line, maxLineWidth);
        checkPageBreak(splitText.length * 5);
        doc.text(splitText, margin, y);
        y += splitText.length * 5;
      }
    });
    
    doc.save(filename);
  };

  const handleDownloadSkillsPdf = () => {
    if (!data.skillGaps) return;
    const skillsText = `Identified Skill Gaps:\n\n- ${data.skillGaps.join('\n- ')}`;
    handleDownloadPdf(skillsText, 'skill-gaps.pdf', 'Skill Gaps');
  }
  
  const handleDownloadRoadmapPdf = () => {
    if (!data.learningRoadmap) return;
    handleDownloadPdf(data.learningRoadmap, 'learning-roadmap.pdf', 'Personalized Learning Roadmap');
  };

  const handleGenerateFlowchart = async () => {
    if (!data.learningRoadmap) return;
    setIsGeneratingChart(true);
    setFlowchart(null);
    try {
        const result = await generateRoadmapFlowchart({ roadmap: data.learningRoadmap });
        setFlowchart(result.flowchart);
    } catch(e) {
        console.error("Could not generate flowchart", e);
    } finally {
        setIsGeneratingChart(false);
    }
  }


  return (
    <>
      <Tabs defaultValue="careers" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary">
          <TabsTrigger value="careers">Recommended Careers</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
        </TabsList>
        <TabsContent value="careers">
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="font-headline">Top Career Paths for You</CardTitle>
                    <CardDescription>Based on your resume, here are some career paths where you could excel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.careerPaths && data.careerPaths.map((career, index) => (
                        <Card key={index} className="bg-background/50"><CardHeader><CardTitle className="text-lg font-headline">{career}</CardTitle></CardHeader></Card>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="gaps">
             <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="font-headline">Identified Skill Gaps</CardTitle>
                    <CardDescription>To succeed in these careers, focus on developing these skills.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        {data.skillGaps && data.skillGaps.map((gap, index) => <li key={index} className="bg-background/50 p-3 rounded-md">{gap}</li>)}
                    </ul>
                </CardContent>
                 <CardFooter>
                    <Button onClick={handleDownloadSkillsPdf} variant="secondary">
                        <Download className="mr-2 h-4 w-4" />
                        Download Skill Gaps
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="roadmap">
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="font-headline">Your Personalized Learning Roadmap</CardTitle>
                    <CardDescription>Follow these steps to acquire the skills for your target role.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                        <ReactMarkdown>{data.learningRoadmap}</ReactMarkdown>
                    </div>

                    <div className="mt-8">
                        {isGeneratingChart && (
                            <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                <p>Generating your visual roadmap...</p>
                            </div>
                        )}
                        {flowchart && (
                             <div>
                                <h3 className="text-xl font-headline font-semibold mb-4">Visual Roadmap</h3>
                                <div className="border-2 border-dashed rounded-lg bg-card/50">
                                    <Flowchart chart={flowchart} />
                                </div>
                             </div>
                        )}
                    </div>
                </CardContent>
                 <CardFooter className="gap-2 border-t pt-6">
                    <Button onClick={handleDownloadRoadmapPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Roadmap
                    </Button>
                    <Button onClick={handleGenerateFlowchart} variant="secondary" disabled={isGeneratingChart}>
                        {isGeneratingChart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitMerge className="mr-2 h-4 w-4" />}
                        {isGeneratingChart ? 'Generating...' : 'Create Visual Roadmap'}
                    </Button>
                     {onRegenerate && (
                        <Button variant="outline" onClick={onRegenerate}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                        </Button>
                     )}
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="jobs">
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="font-headline">Find Relevant Jobs</CardTitle>
                    <CardDescription>View curated job listings based on your recommended career paths.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Ready to find jobs that match your new skills? Go to the Jobs tab!</p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/jobs">
                                Find Jobs Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};
