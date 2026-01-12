
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Bot, FileText, BarChart2, GitMerge, Target, Briefcase } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAppContext } from '@/context/app-context';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const features = [
    {
        icon: FileText,
        title: "AI Resume Analysis",
        description: "Upload your resume and get instant, in-depth analysis of your skills, experience, and career trajectory.",
        iconBg: "bg-teal-500/10",
        iconColor: "text-teal-400"
    },
    {
        icon: BarChart2,
        title: "Psychometric Testing",
        description: "Discover your unique personality traits, aptitudes, and work style to find the perfect career fit.",
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-400"
    },
    {
        icon: GitMerge,
        title: "Personalized Roadmaps",
        description: "Receive AI-generated, step-by-step learning roadmaps to bridge skill gaps and reach your goals.",
        iconBg: "bg-sky-500/10",
        iconColor: "text-sky-400"
    },
    {
        icon: Target,
        title: "Progress Tracking",
        description: "Gamify your career growth by tracking completed milestones and earning achievement badges.",
        iconBg: "bg-rose-500/10",
        iconColor: "text-rose-400"
    },
    {
        icon: Bot,
        title: "TechMitra AI Mentor",
        description: "Chat with your personal AI mentor for technical guidance and career advice, anytime.",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400"
    },
    {
        icon: Briefcase,
        title: "Curated Job Listings",
        description: "Find job opportunities that are perfectly matched to your unique skills and aspirations.",
        iconBg: "bg-indigo-500/10",
        iconColor: "text-indigo-400"
    }
];


export default function Home() {
  const { user, loading } = useAppContext();

  const AuthButtons = () => {
    if (loading) return null;
    if (user) {
      return (
        <Button asChild size="lg" className="rounded-full accent-gradient text-base text-white">
          <Link href="/dashboard">Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" /></Link>
        </Button>
      );
    }
    return (
      <div className="flex items-center gap-4">
        <Button asChild size="lg" className="rounded-full secondary-gradient text-base text-white">
            <Link href="/login">Login</Link>
        </Button>
        <Button asChild size="lg" className="rounded-full accent-gradient text-base text-white">
          <Link href="/signup">
            Sign Up
          </Link>
        </Button>
      </div>
    );
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-screen dark dark-gradient-background text-foreground">
      <header className="px-4 lg:px-6 h-20 flex items-center bg-transparent fixed top-0 w-full z-50">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Logo />
        </Link>
        <nav className="ml-auto">
          <AuthButtons />
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <motion.section 
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.2 }}
          className="w-full h-screen flex flex-col items-center justify-center text-center relative"
        >
          <motion.div variants={fadeIn} className="relative z-10 px-4 md:px-6">
             <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                <span className="accent-text-gradient">CareerCompass</span>.ai
             </h1>
             <motion.p variants={fadeIn} className="mx-auto max-w-[700px] text-muted-foreground md:text-xl my-6">
                AI-guided career planning and skill roadmaps.
             </motion.p>
             <motion.div variants={fadeIn}>
                <Button size="lg" asChild className="rounded-full text-lg px-10 py-7 accent-gradient text-white">
                  <Link href="/signup" prefetch={false}>
                      Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
             </motion.div>
          </motion.div>
          <a href="#features" className="absolute bottom-10 flex flex-col items-center gap-2 text-muted-foreground transition-transform hover:translate-y-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="text-sm">Scroll to Explore</span>
                <ChevronDown className="w-6 h-6 mx-auto" />
            </motion.div>
          </a>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Navigate Your Career with Intelligence</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Our platform provides a suite of AI-powered tools to help you discover your path and build the skills to get there.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="glass-card h-full flex flex-col p-6">
                                <div className="flex items-center gap-4">
                                     <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", feature.iconBg)}>
                                        <feature.icon className={cn("w-6 h-6", feature.iconColor)} />
                                    </div>
                                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground flex-grow">{feature.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
