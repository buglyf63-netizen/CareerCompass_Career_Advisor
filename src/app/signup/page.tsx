
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { FcGoogle } from 'react-icons/fc';
import { useAppContext } from '@/context/app-context';
import { addOrUpdateUser, getUserProfile } from '@/lib/firestore';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  role: z.enum(['student', 'professional', 'other'], { required_error: 'Please select your role.' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, refreshUserProfile } = useAppContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        toast({ title: 'Welcome Back!', description: 'You already have an account. Redirecting...' });
        await refreshUserProfile();
        router.push('/dashboard');
      } else {
        const userToSave = {
          userId: firebaseUser.uid,
          name: firebaseUser.displayName || 'New User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          role: 'student' as 'student' | 'professional' | 'other', // Default role
        };
        await addOrUpdateUser(userToSave);
        await refreshUserProfile();
        toast({ title: 'Account Created!', description: "Welcome! We're redirecting you." });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      toast({ title: 'Sign-Up Failed', description: 'Could not sign up with Google. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const firebaseUser = userCredential.user;

        const userToSave = {
            userId: firebaseUser.uid,
            name: data.name,
            email: data.email,
            photoURL: '', // No photo URL for email signup initially
            role: data.role as 'student' | 'professional' | 'other',
        };

        await addOrUpdateUser(userToSave);
        await refreshUserProfile();

        toast({ title: 'Account Created Successfully!', description: 'Welcome to CareerCompass.ai!' });
        router.push('/dashboard');

    } catch (error: any) {
        console.error('Email Sign-Up error:', error);
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already registered. Please login instead.';
        }
        toast({ title: 'Sign-Up Failed', description, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  if (loading || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center dark dark-gradient-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="dark flex min-h-screen items-center justify-center dark-gradient-background p-4">
      <div className="w-full max-w-md mx-auto rounded-2xl p-8 glass-card">
        <div className="flex justify-center mb-6">
           <Link href="/"><Logo /></Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><Input placeholder="Full Name" {...field} className="h-12 text-base bg-white/5" /><FormMessage/></FormItem> )} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><Input type="email" placeholder="Email" {...field} className="h-12 text-base bg-white/5" /><FormMessage/></FormItem> )} />
            <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><Input type="password" placeholder="Password" {...field} className="h-12 text-base bg-white/5" /><FormMessage/></FormItem> )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => ( <FormItem><Input type="password" placeholder="Confirm Password" {...field} className="h-12 text-base bg-white/5" /><FormMessage/></FormItem> )} />
            <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="h-12 text-base bg-white/5">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>

            <Button type="submit" className="w-full text-lg py-6 accent-gradient rounded-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleGoogleSignUp}
          className="w-full text-lg py-6 rounded-full bg-white/10"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline text-primary hover:text-primary/80 font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
