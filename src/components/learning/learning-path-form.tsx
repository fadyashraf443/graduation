'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalizedLearningPaths } from '@/ai/flows/personalized-learning-paths';
import type { LearningPath } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrainCircuit, Check, ClipboardCopy, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { type User } from "firebase/auth";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const formSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  skillLevel: z.string().min(1, 'Skill level is required'),
  careerGoals: z.string().min(1, 'Career goals are required'),
});

export function LearningPathForm({ currentUser }: { currentUser: User | null }) {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: '', skillLevel: '', careerGoals: '' },
  });

  // Load from Firebase on mount
  useEffect(() => {
    if (currentUser) {
      const pathRef = ref(db, `learning/${currentUser.uid}/learningPath`);
      const unsubscribe = onValue(pathRef, (snapshot) => {
        if (snapshot.exists()) {
          setLearningPath(snapshot.val());
        } else {
          setLearningPath(null);
        }
      });
      return () => unsubscribe();
    } else {
        setLearningPath(null);
    }
  }, [currentUser]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to generate a learning path.' });
        return;
    }
    setIsLoading(true);
    setLearningPath(null);
    try {
      const result = await personalizedLearningPaths(values);
      const pathRef = ref(db, `learning/${currentUser.uid}/learningPath`);
      await set(pathRef, result);
      setLearningPath(result);
    } catch (error) {
      console.error("Failed to generate learning path:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate learning path. Check console for details.' });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <>
      <Card className="mb-8 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="font-headline">Generate Your Learning Path</CardTitle>
          <CardDescription>Fill out the details below to get a personalized plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Penetration Tester" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="careerGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Goals</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Become a Security Architect" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !currentUser}>
                {isLoading ? 'Generating...' : 'Generate Path'}
                <BrainCircuit className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
         <Card className="bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-full" />
              </div>
            </CardContent>
        </Card>
      )}

      {learningPath && (
        <Card className="bg-card/60 backdrop-blur-xl animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">Your Personalized Learning Path</CardTitle>
            <CardDescription>
              Here is the AI-curated path to help you achieve your goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 flex justify-between items-center">
                Learning Path Summary
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(learningPath.learningPath)}>
                    <ClipboardCopy className="h-4 w-4" />
                </Button>
              </h4>
              <p className="text-sm bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">{learningPath.learningPath}</p>
            </div>
            
            {learningPath.roadmap && (
              <div>
                  <h4 className="font-semibold mb-4">Detailed Roadmap</h4>
                  <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                      {learningPath.roadmap.map((step, index) => (
                          <AccordionItem value={`item-${index}`} key={index}>
                              <AccordionTrigger>
                                  <div className="flex items-center gap-3 text-left">
                                      <span className="text-primary font-bold">Step {index + 1}:</span>
                                      <span className="font-semibold">{step.stepTitle}</span>
                                  </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-8 space-y-4">
                                  <p className="text-muted-foreground">{step.stepDescription}</p>
                                  <div>
                                      <h5 className="font-semibold mb-2">Recommended Courses/Certs:</h5>
                                      <ul className="space-y-2">
                                      {step.courses.map((course, cIndex) => (
                                          <li key={cIndex} className="flex items-start gap-2 text-sm">
                                              <GraduationCap className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                              <span>{course}</span>
                                          </li>
                                      ))}
                                      </ul>
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </Accordion>
              </div>
            )}

            {learningPath.contentRecommendations && learningPath.contentRecommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Supplementary Content</h4>
                <ul className="space-y-2">
                  {learningPath.contentRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                      <Check className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
