
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Globe, Briefcase, Target, BarChart2, Lightbulb, Users, Bot } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';

const actionItems = [
  {
    icon: FileText,
    title: 'Analyze Your Resume',
    description: 'Upload your resume for an instant AI-powered analysis of your skills and experience.',
    link: '/dashboard/resume',
    cta: 'Upload Resume',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    icon: BarChart2,
    title: 'Take the Psychometric Test',
    description: 'Discover your mindset, aptitude, and interests for tailor-made career advice.',
    link: '/dashboard/assessment',
    cta: 'Start Test',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Lightbulb,
    title: 'View Recommendations',
    description: 'Explore your personalized career suggestions, skill gaps, and learning roadmaps.',
    link: '/dashboard/recommendations',
    cta: 'View Recommendations',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    icon: Target,
    title: 'Progress Tracker',
    description: 'Track your skills and career milestones with interactive checklists and gamified badges.',
    link: '/dashboard/progress',
    cta: 'Track Progress',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: Bot,
    title: 'TechMitra AI',
    description: 'Chat with your AI mentor for technical skills, learning paths, and career growth.',
    link: '/dashboard/tech-mitra',
    cta: 'Chat Now',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Briefcase,
    title: 'Job Listings',
    description: 'Find curated job opportunities that match your unique profile and career goals.',
    link: '/dashboard/jobs',
    cta: 'Find Jobs',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Globe,
    title: 'Explore Abroad',
    description: 'Get tailored advice on colleges and jobs in other countries with our dedicated AI advisor.',
    link: '/dashboard/abroad',
    cta: 'Explore Options',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with peers, mentors, and industry experts in our vibrant community.',
    link: '/dashboard/community',
    cta: 'Join Community',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
];

export default function DashboardPage() {
  const { userProfile } = useAppContext();

  return (
    <div className="container mx-auto p-0">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">Hello, {userProfile?.name?.split(' ')[0] || 'User'}!</h1>
        <p className="text-muted-foreground">Your career journey starts here. Choose an action below to get started.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actionItems.map((item, index) => (
          <Card key={index} className="flex flex-col shadow-subtle hover:shadow-lifted transition-all group rounded-2xl">
            <CardContent className="p-6 flex-grow">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105", item.iconBg)}>
                  <item.icon className={cn("w-6 h-6", item.iconColor)} />
              </div>
              <h3 className="mt-4 text-lg font-bold font-headline text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild className="w-full rounded-full accent-gradient text-white font-semibold transition-all hover:opacity-90">
                <Link href={item.link}>
                  {item.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
