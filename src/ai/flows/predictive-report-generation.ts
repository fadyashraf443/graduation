// src/ai/flows/predictive-report-generation.ts
'use server';

/**
 * @fileOverview Generates custom reports with predictive insights using AI.
 *
 * - generatePredictiveReport - A function that generates a custom report with predictive insights.
 * - PredictiveReportInput - The input type for the generatePredictiveReport function.
 * - PredictiveReportOutput - The return type for the generatePredictiveReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveReportInputSchema = z.object({
  kpis: z
    .array(z.string())
    .describe('Key performance indicators to include in the report.'),
  timeframe: z.string().describe('The timeframe for the report (e.g., last week, last month, last quarter).'),
  reportType: z
    .string()
    .describe('The type of report to generate (e.g., threat detection, vulnerability assessment).'),
  additionalContext: z.string().optional().describe('Any additional context or specific requirements for the report.'),
});
export type PredictiveReportInput = z.infer<typeof PredictiveReportInputSchema>;

const PredictiveReportOutputSchema = z.object({
  reportTitle: z.string().describe('The title of the generated report.'),
  executiveSummary: z.string().describe('A brief summary of the report findings and predictive insights.'),
  keyFindings: z.array(z.string()).describe('Key findings and predictive insights based on the KPIs.'),
  recommendations: z
    .array(z.string())
    .describe('Recommendations for improving performance based on the predictive insights.'),
  conclusion: z.string().describe('A concluding statement summarizing the report and its implications.'),
});
export type PredictiveReportOutput = z.infer<typeof PredictiveReportOutputSchema>;

export async function generatePredictiveReport(input: PredictiveReportInput): Promise<PredictiveReportOutput> {
  return predictiveReportGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveReportPrompt',
  input: {schema: PredictiveReportInputSchema},
  output: {schema: PredictiveReportOutputSchema},
  prompt: `You are an AI-powered security analyst specializing in generating custom reports with predictive insights.

  Based on the provided key performance indicators (KPIs), timeframe, report type, and additional context, generate a comprehensive report with the following sections:

  1.  Report Title: A concise and descriptive title for the report.
  2.  Executive Summary: A brief overview of the report's key findings and predictive insights.
  3.  Key Findings: A detailed analysis of the KPIs, including predictive insights and trends.
  4.  Recommendations: Actionable recommendations for improving performance based on the predictive insights.
  5.  Conclusion: A concluding statement summarizing the report and its implications.

  KPIs: {{{kpis}}}
  Timeframe: {{{timeframe}}}
  Report Type: {{{reportType}}}
  Additional Context: {{{additionalContext}}}
  `,
});

const predictiveReportGenerationFlow = ai.defineFlow(
  {
    name: 'predictiveReportGenerationFlow',
    inputSchema: PredictiveReportInputSchema,
    outputSchema: PredictiveReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
