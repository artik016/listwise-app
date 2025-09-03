// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting task assignees based on task type.
 * It exports the `suggestAssignee` function, the `SuggestAssigneeInput` type, and the `SuggestAssigneeOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAssigneeInputSchema = z.object({
  taskType: z.string().describe('The type of task to be assigned (e.g., cleaning, repair, shopping).'),
  availableAssignees: z.array(z.string()).describe('An array of available assignees for the task.'),
});
export type SuggestAssigneeInput = z.infer<typeof SuggestAssigneeInputSchema>;

const SuggestAssigneeOutputSchema = z.object({
  suggestedAssignee: z.string().describe('The suggested assignee for the task based on the task type.'),
  confidence: z.number().describe('A number between 0 and 1 indicating the confidence level of the suggestion.'),
});
export type SuggestAssigneeOutput = z.infer<typeof SuggestAssigneeOutputSchema>;

export async function suggestAssignee(input: SuggestAssigneeInput): Promise<SuggestAssigneeOutput> {
  return suggestAssigneeFlow(input);
}

const suggestAssigneePrompt = ai.definePrompt({
  name: 'suggestAssigneePrompt',
  input: {schema: SuggestAssigneeInputSchema},
  output: {schema: SuggestAssigneeOutputSchema},
  prompt: `Based on the task type, suggest the most appropriate assignee from the available assignees.

Task Type: {{{taskType}}}
Available Assignees: {{#each availableAssignees}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Consider the task type and the skills or roles typically associated with each assignee. Return the suggested assignee and a confidence level (0 to 1) indicating how confident you are in the suggestion.

Output in JSON format:
{
  "suggestedAssignee": "suggested assignee",
    "confidence": confidence level
}
`,
});

const suggestAssigneeFlow = ai.defineFlow(
  {
    name: 'suggestAssigneeFlow',
    inputSchema: SuggestAssigneeInputSchema,
    outputSchema: SuggestAssigneeOutputSchema,
  },
  async input => {
    const {output} = await suggestAssigneePrompt(input);
    return output!;
  }
);
