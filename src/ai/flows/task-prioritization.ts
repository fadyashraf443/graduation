'use server';

/**
 * @fileOverview An AI agent for prioritizing tasks on a Kanban board based on real-time threat intelligence and team capacity.
 *
 * - prioritizeTasks - A function that handles the task prioritization process.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.string().describe('The unique identifier of the task.'),
        title: z.string().describe('The title of the task.'),
        description: z.string().describe('A detailed description of the task.'),
        priority: z.string().optional().describe('The current priority of the task (e.g., High, Medium, Low).'),
      })
    )
    .describe('A list of tasks to prioritize.'),
  threatIntelligence: z.string().describe('Real-time threat intelligence data.'),
  teamCapacity: z.string().describe('Information about the team capacity, including roles and availability.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the task.'),
      priority: z.string().describe('The new priority of the task (e.g., High, Medium, Low, Critical).'),
      reason: z.string().describe('The reason for the assigned priority based on threat intelligence and team capacity.'),
    })
  ).describe('A list of tasks with updated priorities and reasons.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI-powered task prioritization expert for cybersecurity teams. Based on real-time threat intelligence and team capacity, you will re-prioritize tasks on the Kanban board.

  The current tasks are:
  {{#each tasks}}
  - ID: {{this.id}}
    Title: {{this.title}}
    Description: {{this.description}}
    Priority: {{this.priority}}
  {{/each}}

  Threat Intelligence:
  {{threatIntelligence}}

  Team Capacity:
  {{teamCapacity}}

  Based on the threat intelligence and team capacity, re-prioritize the tasks. Provide a clear reason for each priority assignment. The available priorities are: Critical, High, Medium, Low.

  Ensure that the output is a JSON array where each element contains the task ID, the new priority, and the reason for the priority assignment. Remember to respond using JSON format.

  Prioritized Tasks:`, 
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
