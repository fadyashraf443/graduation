// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for curating personalized learning paths for cybersecurity professionals.
 *
 * The flow takes into account the user's role, skill level, and career goals to recommend relevant learning content and a course roadmap.
 *
 * @interface PersonalizedLearningPathsInput - Defines the input schema for the personalized learning paths flow.
 * @interface PersonalizedLearningPathsOutput - Defines the output schema for the personalized learning paths flow.
 * @function personalizedLearningPaths - The main function to trigger the personalized learning paths flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedLearningPathsInputSchema = z.object({
  role: z
    .string()
    .describe("The user's role in cybersecurity (e.g., 'Security Analyst', 'Penetration Tester', 'Security Engineer')."),
  skillLevel: z
    .string()
    .describe("The user's current skill level (e.g., 'Beginner', 'Intermediate', 'Advanced')."),
  careerGoals: z
    .string()
    .describe("The user's career goals in cybersecurity (e.g., 'Become a Security Architect', 'Specialize in Threat Intelligence')."),
});

export type PersonalizedLearningPathsInput = z.infer<
  typeof PersonalizedLearningPathsInputSchema
>;

const PersonalizedLearningPathsOutputSchema = z.object({
  learningPath: z
    .string()
    .describe("A high-level summary of the curated learning path tailored to the user's role, skill level, and career goals."),
  roadmap: z.array(z.object({
    stepTitle: z.string().describe("The title for this step in the learning roadmap (e.g., 'Step 1: Foundational Networking')."),
    stepDescription: z.string().describe("A brief description of what this step covers and why it's important."),
    courses: z.array(z.string()).describe("A list of specific, actionable course recommendations for this step (e.g., 'CompTIA Network+', 'Introduction to TCP/IP').")
  })).describe("A detailed, step-by-step roadmap of learning modules or topics."),
  contentRecommendations: z
    .array(z.string())
    .describe('A list of supplementary content (e.g., articles, videos, tools to practice with) that align with the overall learning path.'),
});

export type PersonalizedLearningPathsOutput = z.infer<
  typeof PersonalizedLearningPathsOutputSchema
>;

export async function personalizedLearningPaths(
  input: PersonalizedLearningPathsInput
): Promise<PersonalizedLearningPathsOutput> {
  return personalizedLearningPathsFlow(input);
}

const personalizedLearningPathsPrompt = ai.definePrompt({
  name: 'personalizedLearningPathsPrompt',
  input: {schema: PersonalizedLearningPathsInputSchema},
  output: {schema: PersonalizedLearningPathsOutputSchema},
  prompt: `You are an AI expert in cybersecurity training and development. Your task is to create a comprehensive, personalized learning plan for a cybersecurity professional.

The user will provide their current role, skill level, and career aspirations. Based on this, you will generate:
1.  A high-level summary of the learning path.
2.  A detailed, step-by-step roadmap with clear modules. Each step in the roadmap should have a title, a description of the topics covered, and a list of specific, recommended courses or certifications.
3.  A list of supplementary learning resources like articles, videos, or hands-on labs.

User details:
Role: {{{role}}}
Skill Level: {{{skillLevel}}}
Career Goals: {{{careerGoals}}}

Please provide the output in a valid JSON format that adheres to the following structure:
- "learningPath": A string summarizing the overall strategy.
- "roadmap": An array of objects. Each object must have:
    - "stepTitle": A string for the module title.
    - "stepDescription": A string describing the module's content.
    - "courses": An array of strings with specific course or certification names.
- "contentRecommendations": A JSON array of strings for supplementary content.`,
});

const personalizedLearningPathsFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathsFlow',
    inputSchema: PersonalizedLearningPathsInputSchema,
    outputSchema: PersonalizedLearningPathsOutputSchema,
  },
  async input => {
    const {output} = await personalizedLearningPathsPrompt(input);
    return output!;
  }
);
