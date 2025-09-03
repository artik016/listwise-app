// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for breaking down a larger task into smaller subtasks.
 * It exports the `breakdownTask` function, the `BreakdownTaskInput` type, and the `BreakdownTaskOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreakdownTaskInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task to be broken down.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

const BreakdownTaskOutputSchema = z.object({
    subtasks: z.array(z.string()).describe('An array of suggested subtask titles.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;

export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const breakdownTaskPrompt = ai.definePrompt({
  name: 'breakdownTaskPrompt',
  input: {schema: BreakdownTaskInputSchema},
  output: {schema: BreakdownTaskOutputSchema},
  prompt: `You are an expert project manager. A user wants to break down a task into smaller, actionable subtasks.
Based on the task title provided, generate a list of 3-5 concise subtasks.

Task Title: {{{taskTitle}}}

Return the subtasks as a JSON object with a "subtasks" array.
`,
});

const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async input => {
    const {output} = await breakdownTaskPrompt(input);
    return output!;
  }
);
