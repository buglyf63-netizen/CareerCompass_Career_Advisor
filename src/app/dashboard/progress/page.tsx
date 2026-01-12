
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Rocket, Award } from 'lucide-react';
import type { Milestone, Badge as BadgeType, CareerData, JobRole } from '@/ai/schemas/progress-tracker-schemas';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/app-context';


export default function ProgressTrackerPage() {
  const { careerData, loading, completedMilestones, toggleMilestone, remoteCompletedMilestones, saveProgress } = useAppContext();
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleRoleChange = (roleName: string) => {
    if (!careerData) return;
    
    for (const group in careerData) {
        if (careerData[group][roleName]) {
            const roleData = careerData[group][roleName];
            setSelectedRole({
                role: roleName,
                milestones: roleData.milestones
            });
            return;
        }
    }
  };
  
  const hasUnsavedChanges = useMemo(() => {
    if (completedMilestones.length !== remoteCompletedMilestones.length) return true;
    const remoteSet = new Set(remoteCompletedMilestones);
    return !completedMilestones.every(task => remoteSet.has(task));
  }, [completedMilestones, remoteCompletedMilestones]);

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
        await saveProgress();
        toast({
            title: 'Progress Saved!',
            description: 'Your milestones have been updated.',
        });
    } catch(e: any) {
        toast({
            title: 'Error Saving Progress',
            description: e.message || 'An unexpected error occurred.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  }

  const { totalProgress, unlockedBadges } = useMemo(() => {
    if (!selectedRole) return { totalProgress: 0, unlockedBadges: [] };
    
    const completedWeight = selectedRole.milestones.reduce((sum, milestone) => {
      return completedMilestones.includes(milestone.task) ? sum + milestone.progressWeight : sum;
    }, 0);
    
    const totalWeight = selectedRole.milestones.reduce((sum, milestone) => sum + milestone.progressWeight, 0) || 100;

    const unlockedBadges = selectedRole.milestones
      .filter(m => completedMilestones.includes(m.task))
      .map(m => m.badge);

    return { totalProgress: (completedWeight / totalWeight) * 100, unlockedBadges };
  }, [selectedRole, completedMilestones]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="mt-4 text-2xl font-semibold font-headline">Loading Career Roadmaps...</h2>
        <p className="mt-2 text-muted-foreground">Just a moment...</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      {/* Left Column: Selections */}
      <div className="md:col-span-1 space-y-8 sticky top-6">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Select Your Path</CardTitle>
                <CardDescription>Choose a role to start your journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Job Role</label>
                    <Select onValueChange={handleRoleChange}>
                        <SelectTrigger><SelectValue placeholder="Select a job role..." /></SelectTrigger>
                        <SelectContent>
                           {careerData && Object.entries(careerData).map(([groupName, roles]) => (
                               <SelectGroup key={groupName}>
                                   <h3 className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{groupName}</h3>
                                   {Object.keys(roles).map(roleName => (
                                       <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem>
                                   ))}
                               </SelectGroup>
                           ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">More job roles coming soon!</p>
            </CardFooter>
          </Card>
          
          {selectedRole && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Award /> Badges Unlocked</CardTitle>
                </CardHeader>
                 <CardContent>
                    {unlockedBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {unlockedBadges.map((badge: BadgeType, index: number) => (
                                <Badge key={index} className="text-base py-1 px-3 rounded-lg shadow-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                                    <span className="mr-2 text-lg">{badge.icon}</span> {badge.name}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Complete milestones to unlock badges!</p>
                    )}
                 </CardContent>
             </Card>
          )}
      </div>

      {/* Right Column: Milestones and Progress */}
      <div className="md:col-span-2">
        {!selectedRole ? (
            <Card className="flex flex-col items-center justify-center text-center h-[60vh]">
                <CardHeader>
                    <Rocket className="h-16 w-16 text-primary mx-auto" />
                    <CardTitle className="font-headline mt-4">Your Adventure Awaits</CardTitle>
                    <CardDescription>Select a job role on the left to see your personalized milestones and begin your journey to success.</CardDescription>
                </CardHeader>
            </Card>
        ) : (
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <CardTitle className="font-headline text-2xl">{selectedRole.role} Roadmap</CardTitle>
                            <CardDescription>Check off the milestones you've completed to track your progress.</CardDescription>
                        </div>
                        {hasUnsavedChanges && (
                            <Button onClick={handleSaveProgress} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isSaving ? 'Saving...' : 'Save Progress'}
                            </Button>
                        )}
                    </div>
                     <div className="pt-4">
                        <Progress value={totalProgress} className="h-4" />
                        <p className="text-right text-sm font-bold text-primary mt-2">{Math.round(totalProgress)}% Complete</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Separator />
                    <h3 className="text-lg font-semibold pt-2">Milestones</h3>
                    {selectedRole.milestones.map(milestone => (
                        <div key={milestone.task} className="flex items-center space-x-4 p-3 rounded-lg border has-[:checked]:bg-primary/10">
                            <Checkbox 
                                id={milestone.task} 
                                checked={completedMilestones.includes(milestone.task)}
                                onCheckedChange={() => toggleMilestone(milestone.task)}
                            />
                             <label htmlFor={milestone.task} className="flex-1 cursor-pointer">
                                <p className="font-medium">{milestone.task}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <span className="text-lg">{milestone.badge.icon}</span>{milestone.badge.name}
                                </p>
                            </label>
                        </div>
                    ))}
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">This roadmap provides a structured path. Actual job readiness may require additional learning.</p>
                </CardFooter>
             </Card>
        )}
      </div>
    </div>
  );
}
