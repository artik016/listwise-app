// Use server directive.
'use server';

/**
 * @fileOverview Provides intelligent due date reminders based on historical task completion patterns.
 *
 * - `getDueDateReminder` -  A function that returns a reminder message if a task is likely to be past due.
 * - `DueDateReminderInput` - The input type for the `getDueDateReminder` function.
 * - `DueDateReminderOutput` - The return type for the `getDueDateReminder` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DueDateReminderInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task.'),
  assignee: z.string().describe('The person assigned to the task.'),
  dueDate: z.string().describe('The due date of the task (ISO format).'),
  historicalCompletionTimes: z
    .array(z.number())
    .describe(
      'An array of historical task completion times (in days) for similar tasks.'
    ),
});
export type DueDateReminderInput = z.infer<typeof DueDateReminderInputSchema>;

const DueDateReminderOutputSchema = z.object({
  reminderMessage: z
    .string()
    .describe(
      'A reminder message for the assignee, or an empty string if no reminder is needed.'
    ),
});
export type DueDateReminderOutput = z.infer<typeof DueDateReminderOutputSchema>;

export async function getDueDateReminder(
  input: DueDateReminderInput
): Promise<DueDateReminderOutput> {
  return dueDateReminderFlow(input);
}

const dueDateReminderPrompt = ai.definePrompt({
  name: 'dueDateReminderPrompt',
  input: {schema: DueDateReminderInputSchema},
  output: {schema: DueDateReminderOutputSchema},
  prompt: `You are a helpful assistant that reminds assignees of tasks that are likely to be past due based on historical task completion patterns.

  Task Description: {{{taskDescription}}}
  Assignee: {{{assignee}}}
  Due Date: {{{dueDate}}}
  Historical Completion Times (days): {{{historicalCompletionTimes}}}

  Analyze the historical completion times and the due date. If the task is likely to be past due, generate a reminder message to the assignee. Be polite and encouraging.

  If the task is not likely to be past due, return an empty string for the reminderMessage.
  `,
});

const dueDateReminderFlow = ai.defineFlow(
  {
    name: 'dueDateReminderFlow',
    inputSchema: DueDateReminderInputSchema,
    outputSchema: DueDateReminderOutputSchema,
  },
  async input => {
    const {output} = await dueDateReminderPrompt(input);
    return output!;
  }
);
