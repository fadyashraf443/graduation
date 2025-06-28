'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generatePredictiveReport } from '@/ai/flows/predictive-report-generation';
import type { PredictiveReport } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, Check, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  kpis: z.string().min(1, 'KPIs are required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  reportType: z.string().min(1, 'Report type is required'),
  additionalContext: z.string().optional(),
});

const REPORT_STORAGE_KEY = 'predictive-report-state';

export function ReportGenerator() {
  const [report, setReport] = useState<PredictiveReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { kpis: '', timeframe: 'Last Quarter', reportType: '', additionalContext: '' },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage
  useEffect(() => {
    if (isClient) {
      try {
        const savedReport = localStorage.getItem(REPORT_STORAGE_KEY);
        if (savedReport && savedReport !== 'null') {
          setReport(JSON.parse(savedReport));
        }
      } catch (error) {
        console.error("Failed to load report from localStorage", error);
      }
    }
  }, [isClient]);

  // Save to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
    }
  }, [report, isClient]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
        const kpiArray = values.kpis.split(',').map(kpi => kpi.trim());
        const result = await generatePredictiveReport({ ...values, kpis: kpiArray });
        setReport(result);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report.' });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="font-headline">Generate Predictive Report</CardTitle>
          <CardDescription>Configure the parameters for your AI-generated report.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a report type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Threat Detection">Threat Detection</SelectItem>
                        <SelectItem value="Vulnerability Assessment">Vulnerability Assessment</SelectItem>
                        <SelectItem value="Team Performance">Team Performance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kpis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Performance Indicators (KPIs)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mean Time to Detect, Vulnerabilities Patched" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a timeframe" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                        <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                        <SelectItem value="Last Quarter">Last Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="additionalContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any specific requirements or focus areas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Generating...' : 'Generate Report'} <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {isLoading && (
            <Card className="bg-card/60 backdrop-blur-xl">
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-6 w-1/3" />
                    <div className="space-y-2"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-5/6" /></div>
                </CardContent>
            </Card>
        )}
        {report && (
            <Card className="bg-card/60 backdrop-blur-xl animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><FileText /> {report.reportTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Executive Summary</h3>
                        <p className="text-sm p-3 bg-muted/50 rounded-lg">{report.executiveSummary}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Key Findings</h3>
                        <ul className="space-y-2 text-sm">
                            {report.keyFindings.map((finding, i) => <li key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md"><Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /><span>{finding}</span></li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Recommendations</h3>
                        <ul className="space-y-2 text-sm">
                            {report.recommendations.map((rec, i) => <li key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md"><Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /><span>{rec}</span></li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Conclusion</h3>
                        <p className="text-sm p-3 bg-muted/50 rounded-lg">{report.conclusion}</p>
                    </div>
                </CardContent>
            </Card>
        )}
        {!report && !isLoading && (
            <Card className="bg-card/60 backdrop-blur-xl h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground p-8">
                    <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="font-headline text-lg">Your generated report will appear here.</h3>
                    <p>Fill out the form to get started.</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}
