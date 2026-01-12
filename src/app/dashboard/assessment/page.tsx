
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { generatePsychometricTest, type GeneratePsychometricTestOutput } from '@/ai/flows/generate-psychometric-test';
import { evaluatePsychometricTest } from '@/ai/flows/evaluate-psychometric-test';
import type { GeneratePsychometricTestInput } from '@/ai/schemas/psychometric-test-schemas';
import { cn } from '@/lib/utils';

type UserType = 'kid' | 'school-student' | 'college-student' | 'professional';

const degreeOptions = {
    "Science Degrees": [
        "B.Sc. / M.Sc. Physics (Astrophysics, Nuclear, Quantum, Biophysics)",
        "B.Sc. / M.Sc. Chemistry (Organic, Inorganic, Physical, Analytical, Biochemistry)",
        "B.Sc. / M.Sc. Biology (Microbiology, Genetics, Zoology, Botany, Biotechnology, Marine Biology)",
        "B.Sc. / M.Sc. Environmental Science (Climatology, Soil Science, Sustainability)",
        "B.Sc. / M.Sc. Mathematics (Pure, Applied, Statistics, Actuarial Science)",
        "B.Sc. / M.Sc. Computer Science (AI/ML, Cybersecurity, Data Science, HCI, Cloud)",
    ],
    "Engineering Degrees": [
        "Mechanical Engineering (Robotics, Mechatronics, Aerospace, Automotive)",
        "Civil Engineering (Structural, Transportation, Geotechnical, Environmental)",
        "Electrical Engineering (Power Systems, Control Systems, Renewable Energy)",
        "Electronics & Communication (ECE) (VLSI, Telecom, Signal Processing, IoT)",
        "Chemical Engineering (Petroleum, Process, Food Tech, Polymer)",
        "Computer / Software Engineering (Cloud, Cybersecurity, Game Dev, AI/ML)",
        "Biomedical Engineering",
        "Industrial & Production Engineering",
        "Materials Science & Metallurgy Engineering",
        "Marine Engineering / Naval Architecture",
    ],
    "Medical & Health Degrees": [
        "MBBS / MD (Doctor of Medicine)",
        "BDS / MDS (Dentistry)",
        "B.Sc. / M.Sc. Nursing",
        "B.Pharm / M.Pharm (Pharmacy)",
        "BPT / MPT (Physiotherapy)",
        "B.V.Sc / M.V.Sc (Veterinary Science)",
        "B.Sc. / M.Sc. Nutrition & Dietetics",
        "B.Sc. Biomedical Science / Biotechnology",
        "Master of Public Health (MPH)",
    ],
    "Business & Management Degrees": [
        "BBA / MBA (Marketing, Finance, HR, Operations, International Business)",
        "B.Com / M.Com (Accounting, Taxation, Banking, Auditing)",
        "B.Sc. / M.Sc. Economics / Applied Economics",
        "BHM / MHM (Hospitality & Hotel Management)",
        "BBA / MBA in Tourism Management",
        "MBA in Supply Chain / Logistics / Retail Management",
        "MBA in Agribusiness",
    ],
    "Social Science Degrees": [
        "B.A. / M.A. Psychology (Clinical, Counseling, Industrial-Organizational)",
        "B.A. / M.A. Sociology",
        "B.A. / M.A. Political Science (International Relations, Public Policy)",
        "B.A. / M.A. Anthropology / Archaeology",
        "B.A. / M.A. Criminology",
        "B.Ed / M.Ed (Education)",
        "B.A. / M.A. Social Work (BSW/MSW)",
    ],
    "Arts, Humanities & Language Degrees": [
        "B.A. / M.A. History",
        "B.A. / M.A. Philosophy",
        "B.A. / M.A. Literature (English, Comparative, World)",
        "B.A. / M.A. Linguistics",
        "B.A. / M.A. Cultural Studies / Religious Studies",
        "BFA / MFA (Fine Arts - Painting, Sculpture, Photography)",
        "BPA / MPA (Performing Arts - Dance, Theatre, Music, Film)",
        "B.A. / M.A. in Languages (Spanish, French, German, etc.)",
    ],
    "Law & Governance Degrees": [
        "LLB / LLM (Law - Civil, Criminal, International, Corporate)",
        "B.A. / M.A. Public Administration",
        "B.A. / M.A. International Relations",
    ],
    "Creative, Media & Design Degrees": [
        "B.Des / M.Des (Fashion, Interior, Product, UI/UX Design)",
        "B.Arch / M.Arch (Architecture)",
        "B.A. / M.A. Media & Communication Studies",
        "B.A. / M.A. Journalism & Mass Communication",
        "B.Sc. / M.Sc. Film & Animation / Game Design",
        "B.A. / M.A. Digital Marketing",
    ],
    "Interdisciplinary / Emerging Degrees": [
        "B.Sc. / M.Sc. Data Science & AI",
        "B.Sc. / M.Sc. Cognitive Science",
        "B.Sc. / M.Sc. Neuroscience",
        "B.Sc. Urban Planning / Geographic Information Systems (GIS)",
        "B.A. / M.A. Gender Studies",
        "B.Sc. / M.Sc. Sports Science / Kinesiology",
    ],
};

const industries = ["IT", "Finance", "Healthcare", "Education", "Manufacturing", "Marketing", "Consulting", "Government", "Other"] as const;

// Schemas for dynamic detail forms
const kidSchema = z.object({
    grade: z.string({ required_error: 'Please select a grade.' }).min(1, 'Grade is required.'),
});
const schoolStudentSchema = z.object({
    grade: z.string({ required_error: 'Please select a grade.'}).min(1, 'Grade is required.'),
});
const collegeStudentSchema = z.object({
    fieldOfStudy: z.string({ required_error: 'Please select your field of study.'}).min(1, 'Field of study is required.'),
});
const professionalSchema = z.object({
    experienceValue: z.coerce.number().min(0, 'Experience must be a positive number.'),
    experienceUnit: z.enum(['Months', 'Years']),
    role: z.string().min(1, 'Current role is required.'),
    industry: z.enum(industries, { required_error: 'Please select an industry.'}),
});

const paragraphSchema = z.object({
    paragraphResponse: z.string()
      .transform(val => val.trim())
      .refine(val => val.split(/\s+/).length >= 50, { message: 'Please write at least 50 words.' })
      .refine(val => val.split(/\s+/).length <= 300, { message: 'Please keep it under 300 words.' })
});


// Step 1: User Type Selection
const UserTypeSelection = ({ onSelect }: { onSelect: (userType: UserType) => void }) => {
  const formSchema = z.object({
    userType: z.enum(['kid', 'school-student', 'college-student', 'professional'], {
      required_error: 'You need to select an option.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });
  const selectedUserType = form.watch('userType');
  const userTypes = [
    { value: 'kid', label: 'Kid (Ages 8-13)' },
    { value: 'school-student', label: 'School Student (Ages 14-18)' },
    { value: 'college-student', label: 'College Student' },
    { value: 'professional', label: 'Professional' }
  ] as const;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Psychometric Test</CardTitle>
        <CardDescription>First, let’s understand who you are to tailor the test for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSelect(data.userType as UserType))} className="space-y-6">
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Which of these best describes you?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userTypes.map((type) => (
                           <FormItem key={type.value}>
                                <FormControl>
                                    <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                                </FormControl>
                                <FormLabel
                                    htmlFor={type.value}
                                    className={cn(
                                        "flex items-center justify-between w-full p-4 rounded-xl border-2 border-transparent transition-all cursor-pointer",
                                        "bg-card/60 hover:bg-card",
                                        selectedUserType === type.value && "border-primary ring-2 ring-primary/50"
                                    )}
                                >
                                    <span className="font-medium capitalize">{type.label}</span>
                                    {selectedUserType === type.value && <Check className="h-5 w-5 text-primary" />}
                                </FormLabel>
                           </FormItem>
                        ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end"><Button type="submit" className="accent-gradient rounded-lg">Next</Button></div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Step 2: Detailed Information
const DetailsForm = ({ userType, onDetailsSubmit }: { userType: UserType, onDetailsSubmit: (details: any) => void }) => {
    let schema: z.ZodObject<any>, title: string, description: string;
    
    switch(userType) {
        case 'kid':
            schema = kidSchema;
            title = "About You";
            description = "Please tell us your grade.";
            break;
        case 'school-student':
            schema = schoolStudentSchema;
            title = "About You";
            description = "Please provide your grade.";
            break;
        case 'college-student':
            schema = collegeStudentSchema;
            title = "Your Studies";
            description = "Tell us about what you study.";
            break;
        case 'professional':
            schema = professionalSchema;
            title = "Your Career";
            description = "Tell us about your professional background.";
            break;
    }

    const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: (() => {
        switch (userType) {
          case 'kid':
            return { grade: '' };
          case 'school-student':
            return { grade: '' };
          case 'college-student':
            return { fieldOfStudy: '' };
          case 'professional':
            return { experienceValue: '', experienceUnit: 'Years', role: '', industry: undefined };
          default:
            return {};
        }
      })(),
    });

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onDetailsSubmit)} className="space-y-6">
                        {userType === 'kid' && (
                             <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grade</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your grade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 8 }, (_, i) => `Grade ${i + 1}`).map(grade => (
                                                    <SelectItem key={grade} value={grade}>
                                                        {grade}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {userType === 'school-student' && (
                            <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grade / Class</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your grade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 4 }, (_, i) => `Grade ${i + 9}`).map(grade => (
                                                    <SelectItem key={grade} value={grade}>
                                                        {grade}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {userType === 'college-student' && (
                            <FormField
                                control={form.control} name="fieldOfStudy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field of Study</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your field of study" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(degreeOptions).map(([group, options]) => (
                                                    <SelectGroup key={group}>
                                                        <FormLabel className="px-2 py-1.5 text-sm font-semibold">{group}</FormLabel>
                                                        {options.map(option => (
                                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {userType === 'professional' && (
                             <>
                                <FormItem>
                                  <FormLabel>Years of Experience</FormLabel>
                                  <div className="flex gap-2">
                                      <FormField
                                          control={form.control} name="experienceValue"
                                          render={({ field }) => (
                                              <FormItem className="w-1/2">
                                                  <FormControl><Input type="number" placeholder="e.g., 5" {...field} /></FormControl>
                                                  <FormMessage />
                                              </FormItem>
                                          )}
                                      />
                                      <FormField
                                          control={form.control} name="experienceUnit"
                                          render={({ field }) => (
                                              <FormItem className="w-1/2">
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                      <FormControl>
                                                          <SelectTrigger>
                                                              <SelectValue placeholder="Unit" />
                                                          </SelectTrigger>
                                                      </FormControl>
                                                      <SelectContent>
                                                          <SelectItem value="Years">Years</SelectItem>
                                                          <SelectItem value="Months">Months</SelectItem>
                                                      </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                              </FormItem>
                                          )}
                                      />
                                  </div>
                                </FormItem>
                                <FormField
                                    control={form.control} name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Role</FormLabel>
                                            <FormControl><Input placeholder="e.g., Software Engineer" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Industry</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your industry" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {industries.map(industry => (
                                                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                        <div className="flex justify-end"><Button type="submit" className="accent-gradient rounded-lg">Start Test</Button></div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

// Step 3: The Main Test
const PsychometricTest = ({ test, onSubmit }: { test: GeneratePsychometricTestOutput, onSubmit: (answers: { question: string; answer: string }[]) => void }) => {
    const formSchema = z.object({
        answers: z.array(
            z.object({
                question: z.string(),
                answer: z.string().min(1, { message: 'Please provide an answer.' })
            })
        ).length(test.questions.length)
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            answers: test.questions.map(q => ({ question: q.question, answer: '' }))
        }
    });

    const { toast } = useToast();
    const selectedAnswers = form.watch('answers');

    function renderQuestionInput(q: any, field: any, index: number) {
        const selectedValue = selectedAnswers?.[index]?.answer;

        if (q.options && q.options.length > 0) {
            // Multiple Choice
            return (
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3 mt-2">
                    {q.options.map((option: string, i: number) => (
                         <FormItem key={i}>
                             <FormControl>
                                 <RadioGroupItem value={option} id={`q-${index}-option-${i}`} className="sr-only" />
                             </FormControl>
                             <FormLabel htmlFor={`q-${index}-option-${i}`} className={cn(
                                 "flex items-center justify-between w-full p-4 rounded-lg border-2 border-transparent transition-all cursor-pointer",
                                 "bg-card/50 hover:bg-card text-foreground",
                                 selectedValue === option && "border-primary ring-1 ring-primary/50"
                             )}>
                                 <span>{option}</span>
                                 {selectedValue === option && <Check className="h-5 w-5 text-primary" />}
                             </FormLabel>
                        </FormItem>
                    ))}
                </RadioGroup>
            );
        } else if (q.question.toLowerCase().includes('scale of 1 to 5')) {
            // Scale question
            return (
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2 mt-4 justify-center">
                    {[1, 2, 3, 4, 5].map(value => (
                        <FormItem key={value} className="flex flex-col items-center space-y-2">
                            <FormControl>
                                 <RadioGroupItem value={String(value)} id={`q-${index}-scale-${value}`} className="sr-only"/>
                            </FormControl>
                            <FormLabel htmlFor={`q-${index}-scale-${value}`} className={cn(
                                "flex items-center justify-center h-12 w-12 rounded-full border-2 border-transparent transition-all cursor-pointer",
                                "bg-card/50 hover:bg-card text-lg font-semibold",
                                selectedValue === String(value) && "border-primary ring-2 ring-primary/50"
                            )}>
                                {value}
                            </FormLabel>
                        </FormItem>
                    ))}
                </RadioGroup>
            );
        } else {
            // Descriptive text question
            return <Textarea {...field} rows={4} className="mt-2 bg-transparent" />;
        }
    }


    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="font-headline text-xl">Your Personalized Test</CardTitle>
                <CardDescription>Answer the following questions honestly to get the most accurate recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => onSubmit(data.answers), () => toast({ title: 'Incomplete Test', description: 'Please answer all questions.', variant: 'destructive' }))} className="space-y-8">
                        {test.questions.map((q, index) => (
                             <FormField
                                key={index}
                                control={form.control}
                                name={`answers.${index}.answer`}
                                render={({ field }) => (
                                    <FormItem className="p-4 border rounded-xl glass-card">
                                        <FormLabel className="text-base font-semibold">{index + 1}. {q.question}</FormLabel>
                                        <FormControl>
                                           {renderQuestionInput(q, field, index)}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                         <div className="flex justify-end"><Button type="submit" className="accent-gradient rounded-lg">Next Step</Button></div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

// Step 4: Paragraph Response
const ParagraphResponse = ({ onSubmit }: { onSubmit: (data: z.infer<typeof paragraphSchema>) => void }) => {
    const form = useForm<z.infer<typeof paragraphSchema>>({ resolver: zodResolver(paragraphSchema), defaultValues: { paragraphResponse: '' } });

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="font-headline text-xl">Final Step: Tell Us More</CardTitle>
                <CardDescription>In 50-300 words, please tell us about your interests, likes, motivations, and goals. This will help us refine your recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="paragraphResponse"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl><Textarea {...field} rows={6} className="bg-transparent" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="flex justify-end"><Button type="submit" className="accent-gradient rounded-lg">Submit & Get Recommendations</Button></div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};


// Main Page Component
export default function PsychometricTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setPsychometricResults } = useAppContext();
  
  const [step, setStep] = useState<'selecting' | 'details' | 'generating' | 'testing' | 'paragraph' | 'evaluating'>('selecting');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [test, setTest] = useState<GeneratePsychometricTestOutput | null>(null);
  const [testPayload, setTestPayload] = useState<Partial<GeneratePsychometricTestInput>>({});
  const [testAnswers, setTestAnswers] = useState<{ question: string; answer: string }[]>([]);

  const handleUserTypeSelect = (selectedUserType: UserType) => {
    setUserType(selectedUserType);
    setTestPayload({ userType: selectedUserType });
    setStep('details');
  };

  const handleDetailsSubmit = async (details: any) => {
    let finalDetails = details;
    if (userType === 'professional') {
        finalDetails = {
            experience: `${details.experienceValue} ${details.experienceUnit}`,
            role: details.role,
            industry: details.industry,
        };
    }

    const detailKey = `${userType?.replace(/-/g, '')}Details`;
    const fullPayload = { ...testPayload, [detailKey]: finalDetails };

    setTestPayload(fullPayload);
    setStep('generating');
    try {
      const generatedTest = await generatePsychometricTest(fullPayload as GeneratePsychometricTestInput);
      setTest(generatedTest);
      setStep('testing');
    } catch (error: any) {
        toast({ title: 'Error', description: `Failed to generate test: ${error.message}`, variant: 'destructive' });
        setStep('details'); // Go back to details form on error
    }
  };

  const handleTestSubmit = (answers: { question: string; answer: string }[]) => {
    setTestAnswers(answers);
    setStep('paragraph');
  };
  
  const handleParagraphSubmit = async (data: z.infer<typeof paragraphSchema>) => {
    if (!userType) return;
    setStep('evaluating');
    try {
        const evaluationPayload = {
            ...testPayload,
            testAnswers: testAnswers,
            paragraphResponse: data.paragraphResponse
        };
        const evaluation = await evaluatePsychometricTest(evaluationPayload as any);
        await setPsychometricResults(evaluation);
        toast({ title: 'Evaluation Complete!', description: 'Your personalized recommendations are ready.' });
        router.push('/dashboard/recommendations');
    } catch (error: any) {
        toast({ title: 'Error', description: `Failed to evaluate test: ${error.message}`, variant: 'destructive' });
        setStep('paragraph'); // Go back to paragraph on error
    }
  }
  
  const LoadingState = ({ title, description }: { title: string, description: string }) => (
     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h2 className="mt-4 text-2xl font-semibold font-headline">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );

  switch(step) {
    case 'selecting':
      return <UserTypeSelection onSelect={handleUserTypeSelect} />;
    case 'details':
        return userType ? <DetailsForm userType={userType} onDetailsSubmit={handleDetailsSubmit} /> : <div />;
    case 'generating':
      return <LoadingState title="Generating Your Test..." description="Our AI is creating a personalized psychometric test just for you." />;
    case 'testing':
      return test ? <PsychometricTest test={test} onSubmit={handleTestSubmit} /> : <div />;
    case 'paragraph':
        return <ParagraphResponse onSubmit={handleParagraphSubmit} />;
    case 'evaluating':
      return <LoadingState title="Evaluating Your Answers..." description="Our AI is analyzing your results to build your recommendations." />;
    default:
        return <UserTypeSelection onSelect={handleUserTypeSelect} />;
  }
}

    

    

    