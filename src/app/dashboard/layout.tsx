
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  Briefcase,
  FileText,
  Home,
  Lightbulb,
  PanelLeft,
  Globe,
  Target,
  User,
  Users,
  Bell,
  LogOut,
  Bot,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { AppProvider, useAppContext } from '@/context/app-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FloatingChatbot } from '@/components/ui/floating-chatbot';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/resume', label: 'Resume', icon: FileText },
  { href: '/dashboard/assessment', label: 'Psychometric Test', icon: BarChart2 },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Lightbulb },
  { href: '/dashboard/progress', label: 'Progress Tracker', icon: Target },
  { href: '/dashboard/tech-mitra', label: 'TechMitra AI', icon: Bot },
  { href: '/dashboard/jobs', label: 'Job Listings', icon: Briefcase },
  { href: '/dashboard/abroad', label: 'Abroad', icon: Globe },
  { href: '/dashboard/community', label: 'Community', icon: Users },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading, recommendations, psychometricResults, assessmentData } = useAppContext();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading || !user) {
    return (
       <div className="flex min-h-screen w-full flex-col bg-background">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Skeleton className="h-8 w-8 rounded-full sm:hidden" />
            <div className="ml-auto flex items-center gap-4 md:grow-0">
               <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-0">
             <Skeleton className="w-full h-[80vh] rounded-2xl" />
          </main>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex">
        <nav className="flex flex-col gap-2 text-base font-medium p-4">
        <Link
            href="/dashboard"
            className="group flex h-12 shrink-0 items-center justify-start gap-2 rounded-full text-lg font-semibold md:text-base mb-4"
        >
            <Logo />
        </Link>
        {navItems.map((item) => {
            const isActive = (item.href === '/dashboard' && pathname === item.href) || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground',
                    isActive && 'bg-muted text-foreground'
                )}
                >
                    <div className={cn("absolute left-0 h-6 w-1 rounded-r-full transition-all", isActive ? "accent-gradient" : "bg-transparent")}></div>
                <item.icon className="h-5 w-5 text-secondary" />
                {item.label}
                </Link>
            );
            })}
        </nav>
    </aside>
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-[56px] items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-card">
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                href="/dashboard"
                className="group flex h-10 shrink-0 items-center justify-start gap-2 rounded-full text-lg font-semibold md:text-base mb-4"
                >
                <Logo />
                </Link>
                {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                        pathname.startsWith(item.href) && "text-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5 text-secondary" />
                    {item.label}
                </Link>
                ))}
            </nav>
            </SheetContent>
        </Sheet>
        <h1 className="text-xl font-semibold hidden md:block text-foreground">Welcome back, {userProfile?.name?.split(' ')[0] || 'User'}!</h1>
        <div className="relative ml-auto flex items-center gap-2 md:grow-0">
            <ThemeToggle />
            <Button size="icon" variant="ghost" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="overflow-hidden rounded-full"
                >
                    <Avatar>
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {children}
        </main>
        {user && (
            <FloatingChatbot context={{
                careerPaths: recommendations?.careerPaths?.join(', ') || 'Not available',
                skillGaps: recommendations?.skillGaps?.join(', ') || (psychometricResults?.careerAdvisory) || 'Not available',
                learningRoadmap: recommendations?.learningRoadmap || 'Not available',
                resumeSummary: assessmentData?.resumeText ? 'Available' : 'Not provided',
                assessmentSummary: psychometricResults ? 'Available' : 'Not provided'
            }} />
        )}
    </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </ThemeProvider>
    </AppProvider>
  )
}
