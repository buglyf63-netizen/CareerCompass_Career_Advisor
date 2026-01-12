
'use client';

import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { FcGoogle } from 'react-icons/fc';
import { useAppContext } from '@/context/app-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { doesUserExist } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAppContext();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });


  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userExists = await doesUserExist(result.user.uid);

      if (userExists) {
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        router.push('/dashboard');
      } else {
        router.push('/signup');
      }
    } catch (error: any) {
      console.error('Error signing in with Google: ', error);
      toast({
        title: 'Sign-In Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };
  
  const handleEmailPasswordSignIn = async (data: LoginFormValues) => {
    setIsSigningIn(true);
    try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        router.push('/dashboard');
    } catch (error: any) {
        console.error('Error signing in with email: ', error);
        toast({
            title: 'Sign-In Failed',
            description: 'Invalid email or password. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSigningIn(false);
    }
  }


  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen dark dark-gradient-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="dark flex items-center justify-center min-h-screen dark-gradient-background p-4">
      <div className="w-full max-w-md mx-auto rounded-2xl p-8 glass-card">
        <div className="flex justify-center mb-6">
           <Link href="/"><Logo /></Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-headline">Login</h1>
        </div>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailPasswordSignIn)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <Input type="email" placeholder="Email" {...field} className="h-12 text-base bg-white/5" />
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <Input type="password" placeholder="Password" {...field} className="h-12 text-base bg-white/5" />
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="w-full text-lg py-6 accent-gradient rounded-full" disabled={isSigningIn}>
                    {isSigningIn && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Login
                </Button>
            </form>
        </Form>

         <div className="mt-4 text-right">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Forgot Password?
            </Link>
        </div>

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
          className="w-full text-lg py-6 rounded-full bg-white/10"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-5 w-5" />
          )}
          Continue with Google
        </Button>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="underline text-primary hover:text-primary/80 font-semibold">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
