
'use server';

/**
 * @fileOverview Provides a flow for estimating medical costs at government hospitals.
 *
 * - estimateCost - A function that takes hospital and procedure details and returns a cost estimate.
 * - CostEstimatorInput - The input type for the estimateCost function.
 * - CostEstimatorOutput - The return type for the estimateCost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CostEstimatorInputSchema = z.object({
  hospital: z.string().describe('The name of the government hospital.'),
  procedure: z.string().describe('A description of the medical procedure or service required.'),
});
export type CostEstimatorInput = z.infer<typeof CostEstimatorInputSchema>;

const CostEstimatorOutputSchema = z.object({
  estimate: z.string().describe('A markdown-formatted string providing a cost estimate and explanation.'),
});
export type CostEstimatorOutput = z.infer<typeof CostEstimatorOutputSchema>;

export async function estimateCost(
  input: CostEstimatorInput
): Promise<CostEstimatorOutput> {
  return costEstimatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costEstimatorPrompt',
  input: {schema: CostEstimatorInputSchema},
  output: {schema: CostEstimatorOutputSchema},
  prompt: `You are Amrita, a helpful AI healthcare assistant. Your goal is to provide an estimated cost for a medical procedure at a specific government hospital in India.

Start your response with: "I am Amrita, and I am here to help."

Based on the user's request, provide a helpful, conversational, and informative cost estimate.

Hospital: {{{hospital}}}
Procedure/Service: {{{procedure}}}

Your response should:
1.  Acknowledge the user's query.
2.  Provide a cost range (e.g., ₹5,000 - ₹15,000) for the specified procedure at that type of government hospital. Since you don't have real-time data, base this on general knowledge of government hospital pricing in India (which is highly subsidized and low-cost).
3.  Break down the potential costs if possible (e.g., consultation fees, diagnostic tests, room charges, procedure cost).
4.  Explain what factors might influence the final cost (e.g., complexity of the case, required stay duration, specific tests needed).
5.  Emphazise that this is an *estimate* and the final cost can only be confirmed by the hospital.
6.  Advise the user to contact the hospital directly for accurate pricing and to inquire about any government health schemes they might be eligible for (like Ayushman Bharat).

Format the entire response as a single markdown string.
`,
});

const costEstimatorFlow = ai.defineFlow(
  {
    name: 'costEstimatorFlow',
    inputSchema: CostEstimatorInputSchema,
    outputSchema: CostEstimatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
