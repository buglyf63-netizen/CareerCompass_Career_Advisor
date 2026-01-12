
'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/context/app-context";
import { Loader2, Upload, Award, Target, BarChart2, Briefcase } from 'lucide-react';
import { Badge as BadgeType, Milestone } from '@/ai/schemas/progress-tracker-schemas';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfilePage() {
  const { userProfile, loading, psychometricResults, remoteCompletedMilestones, careerData } = useAppContext();
  const router = useRouter();

  const getInitials = (nameStr: string | undefined) => {
    if (!nameStr) return '?';
    return nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const earnedBadgesByRole = useMemo(() => {
    if (!careerData) return {};
    
    const badgesByRole: { [role: string]: BadgeType[] } = {};

    Object.values(careerData).forEach(group => {
        Object.entries(group).forEach(([roleName, roleData]) => {
            roleData.milestones.forEach((milestone: Milestone) => {
                if (remoteCompletedMilestones.includes(milestone.task)) {
                    if (!badgesByRole[roleName]) {
                        badgesByRole[roleName] = [];
                    }
                    if (!badgesByRole[roleName].some(b => b.name === milestone.badge.name)) {
                        badgesByRole[roleName].push(milestone.badge);
                    }
                }
            });
        });
    });
    return badgesByRole;
  }, [careerData, remoteCompletedMilestones]);

  const pathsWithBadges = Object.keys(earnedBadgesByRole);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    if (pathsWithBadges.length > 0 && !selectedPath) {
        setSelectedPath(pathsWithBadges[0]);
    } else if (pathsWithBadges.length === 0) {
        setSelectedPath(null);
    }
  }, [pathsWithBadges, selectedPath]);


  const { pathProgress, pathBadgesCount } = useMemo(() => {
    if (!selectedPath || !careerData) return { pathProgress: 0, pathBadgesCount: 0 };

    let totalWeight = 0;
    let completedWeight = 0;

    for (const group of Object.values(careerData)) {
      if (group[selectedPath]) {
        const roleData = group[selectedPath];
        roleData.milestones.forEach((milestone: Milestone) => {
          totalWeight += milestone.progressWeight;
          if (remoteCompletedMilestones.includes(milestone.task)) {
            completedWeight += milestone.progressWeight;
          }
        });
        break; 
      }
    }
    
    const progress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    const badgesCount = earnedBadgesByRole[selectedPath]?.length || 0;

    return { pathProgress: progress, pathBadgesCount: badgesCount };

  }, [selectedPath, careerData, remoteCompletedMilestones, earnedBadgesByRole]);

  const totalUnlockedBadges = Object.values(earnedBadgesByRole).reduce((sum, badges) => sum + badges.length, 0);

  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-0">
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-8">
                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <Avatar className="h-24 w-24 border-2 border-primary">
                            <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                            <AvatarFallback className="text-3xl">{getInitials(userProfile.name)}</AvatarFallback>
                            </Avatar>
                            <Button size="icon" variant="outline" className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-background">
                                <Upload className="h-4 w-4"/>
                                <span className="sr-only">Upload Picture</span>
                            </Button>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold font-headline">{userProfile.name}</h1>
                            <p className="text-muted-foreground">{userProfile.email}</p>
                            <p className="text-sm text-primary font-medium capitalize mt-1">{userProfile.role || 'Not set'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pathsWithBadges.length > 0 && (
                            <Select onValueChange={setSelectedPath} value={selectedPath || undefined}>
                                <SelectTrigger><SelectValue placeholder="Select a path..." /></SelectTrigger>
                                <SelectContent>
                                    {pathsWithBadges.map(path => (
                                        <SelectItem key={path} value={path}>{path}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                         <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="h-4 w-4" />
                                <p>Career Progress</p>
                            </div>
                            <p className="font-bold">{pathProgress}%</p>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-2 text-muted-foreground">
                                <Award className="h-4 w-4" />
                                <p>Badges Earned</p>
                            </div>
                            <p className="font-bold">{pathBadgesCount}</p>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BarChart2 className="h-4 w-4" />
                                <p>Tests Completed</p>
                            </div>
                            <p className="font-bold">{psychometricResults ? 1 : 0}</p>
                        </div>
                         <div className="flex justify-between items-center text_sm">
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                <p>Jobs Applied</p>
                            </div>
                            <p className="font-bold">0</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Right Column */}
             <div className="lg:col-span-2 space-y-8">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="font-headline">Badges & Achievements</CardTitle>
                        <CardDescription>Your earned career milestones and accomplishments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {totalUnlockedBadges > 0 ? (
                            <TooltipProvider>
                                <div className="space-y-6">
                                    {Object.entries(earnedBadgesByRole).map(([roleName, badges]) => (
                                        <div key={roleName}>
                                            <h3 className="text-lg font-semibold font-headline mb-3">{roleName} Path</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {badges.map((badge) => (
                                                    <Tooltip key={badge.name}>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex flex-col items-center justify-center p-4 rounded-lg border text-center space-y-2 transition-all border-primary/20 bg-primary/10">
                                                                <div className="text-4xl">{badge.icon}</div>
                                                                <p className="text-xs font-semibold">{badge.name}</p>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{badge.name}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TooltipProvider>
                        ) : (
                            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                                <Award className="mx-auto h-12 w-12" />
                                <h3 className="mt-4 text-lg font-semibold">No Badges Unlocked Yet</h3>
                                <p className="mt-2 text-sm">Head over to the Progress Tracker to start completing milestones and earning badges!</p>
                                <Button variant="secondary" className="mt-4" asChild>
                                    <a href="/dashboard/progress">Go to Progress Tracker</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
             </div>
        </div>
    </div>
  );
}
