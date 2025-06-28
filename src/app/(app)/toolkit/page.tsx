'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateSecurityTool, type SecurityToolGeneratorOutput } from '@/ai/flows/security-tool-generator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, AlertTriangle, Clipboard, Check } from 'lucide-react';

const formSchema = z.object({
  toolType: z.string().min(1, 'Please select a tool type.'),
  prompt: z.string().min(10, 'Please provide a more detailed prompt.'),
});

export default function AiToolkitPage() {
  const [result, setResult] = useState<SecurityToolGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { toolType: '', prompt: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateSecurityTool({
        ...values,
        toolType: values.toolType as any,
      });
      setResult(response);
    } catch (error) {
      console.error('Failed to generate tool:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI could not fulfill this request. It might have been blocked by safety filters. Please try rephrasing your prompt.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.generatedContent);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <FlaskConical /> AI Security Toolkit
        </h1>
        <p className="text-muted-foreground">
          Generate scripts and content for authorized security assessments.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Generator</CardTitle>
            <CardDescription>
              Select a tool type and provide a detailed prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>For Educational Use Only</AlertTitle>
              <AlertDescription>
                This tool generates content for security research and authorized
                testing. Misuse is strictly prohibited.
              </AlertDescription>
            </Alert>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="toolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tool Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tool type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Phishing Email">
                            Phishing Email
                          </SelectItem>
                          <SelectItem value="PowerShell Payload">
                            PowerShell Payload
                          </SelectItem>
                           <SelectItem value="Python Ransomware Sample">
                            Python Ransomware Sample (for testing)
                          </SelectItem>
                          <SelectItem value="Pentest Script">
                            Pentest Script (e.g., Python, Bash)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., A PowerShell script to enumerate local user accounts and running processes."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Generating...' : 'Generate'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading && (
            <Card className="bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          )}
          {result && (
            <Card className="bg-card/60 backdrop-blur-xl animate-in fade-in-50">
              <CardHeader>
                <CardTitle>Generated Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted/50 rounded-lg">
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="font-code">{result.generatedContent}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                    </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <h3 className="font-semibold">Explanation</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
              </CardFooter>
            </Card>
          )}
          {!result && !isLoading && (
            <Card className="bg-card/60 backdrop-blur-xl h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground p-8">
                <FlaskConical className="mx-auto h-12 w-12 mb-4" />
                <h3 className="font-headline text-lg">
                  Your generated content will appear here.
                </h3>
                <p>Fill out the form to get started.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
