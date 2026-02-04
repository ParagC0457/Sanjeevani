
'use server';

/**
 * @fileOverview Provides a flow for comparing medicines and finding alternatives.
 *
 * - compareMedicines - A function that takes one or two medicine names and returns a comparison or a list of alternatives.
 * - MedicineComparatorInput - The input type for the compareMedicines function.
 * - MedicineComparatorOutput - The return type for the compareMedicines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {retryWithBackoff} from '@/lib/retry';
import {webSearch} from '@/ai/tools/web-search';

const MedicineComparatorInputSchema = z.object({
  mode: z.enum(['compare', 'alternative']),
  medicineA: z.string().describe('The name of the first medicine.'),
  medicineB: z.string().optional().describe('The name of the second medicine (for comparison mode).'),
});
export type MedicineComparatorInput = z.infer<typeof MedicineComparatorInputSchema>;

const ComparisonResultSchema = z.object({
  similarity: z.number().min(0).max(100).describe('The similarity percentage (0-100) based on active ingredients and dosage equivalence.'),
  explanation: z.string().describe('A one-sentence explanation of the similarity or difference.'),
  recommendation: z.enum(['Recommended ✅', 'Good', 'Fair', 'Not Recommended ❌']).describe('A recommendation flag based on similarity.'),
});

const AlternativeResultSchema = z.object({
  name: z.string().describe('The name of the alternative medicine.'),
  composition: z.string().describe('The composition details of the alternative medicine.'),
  similarity: z.number().min(0).max(100).describe('The similarity percentage to the original medicine.'),
  recommendation: z.enum(['Recommended ✅', 'Good', 'Fair', 'Not Recommended ❌']).describe('A recommendation level.'),
  sourceUrl: z.string().url().optional().describe('The URL of the source where the information was found. This is mandatory.'),
});

const MedicineComparatorOutputSchema = z.object({
  comparison: ComparisonResultSchema.optional(),
  alternatives: z.array(AlternativeResultSchema).optional(),
});
export type MedicineComparatorOutput = z.infer<typeof MedicineComparatorOutputSchema>;

export async function compareMedicines(
  input: MedicineComparatorInput
): Promise<MedicineComparatorOutput> {
  return retryWithBackoff(() => medicineComparatorFlow(input));
}

const prompt = ai.definePrompt({
  name: 'medicineComparatorPrompt',
  input: {schema: MedicineComparatorInputSchema},
  output: {schema: MedicineComparatorOutputSchema},
  tools: [webSearch],
  prompt: `You are a precise medical information retriever focused on the Indian subcontinent. You must ONLY use reliable sources like India's official pharmaceutical registry (CDSCO), or reputable medical sites with an Indian presence (like Apollo Pharmacy, 1mg, PharmEasy). You can use Wikipedia for composition information but must verify availability in India.

**CRITICAL RULES:**
1.  **NEVER INVENT**: You must never invent medicine names, compositions, or sources. If you cannot find a verifiable source, do not provide the information.
2.  **MANDATORY WEB SEARCH**: You MUST use the 'webSearch' tool to find accurate data for the user's query. Do not rely on your internal knowledge.
3.  **SOURCE URL IS MANDATORY**: Every single alternative you provide MUST have a valid 'sourceUrl'. If you cannot find a source URL, do not include the alternative.
4.  **NO MATCHES**: If, after a thorough web search, you cannot find any reliable alternatives available in India with sources, you MUST return an empty array for the 'alternatives' field. Giving no answer is better than giving a wrong answer.

{{#if medicineB}}
# Task: Compare Two Medicines
Compare the following two medicines strictly by their composition and strength.
- Medicine A: {{{medicineA}}}
- Medicine B: {{{medicineB}}}

## Rules for Output:
1.  **Similarity Score**: Calculate and return a similarity percentage (0-100%) based on active ingredients and dosage equivalence.
2.  **Explanation**: Provide a one-sentence explanation of the similarity or difference.
3.  **Recommendation**: Return a recommendation flag based on the following similarity score:
    - "Recommended ✅" if similarity is 90% or higher.
    - "Good" if similarity is between 80% and 89%.
    - "Fair" if similarity is between 75% and 79%.
    - "Not Recommended ❌" if similarity is below 75%.
4.  **Format**: Return the result in the 'comparison' field of the JSON output.
{{else}}
# Task: Find Alternative Medicines available in India
The user wants to find alternatives available in India for the medicine: "{{{medicineA}}}".

## Sourcing and Verification Protocol (MANDATORY):
1.  Use the 'webSearch' tool to search for "{{{medicineA}}}" to understand its composition.
2.  Use the 'webSearch' tool again with queries like "alternative to {{{medicineA}}} in India" or "medicines with same composition as {{{medicineA}}} in India".
3.  Analyze the search results, prioritizing Indian sources like CDSCO, Apollo Pharmacy, 1mg, etc.
4.  For each potential alternative, verify its details from a reliable source.

## Rules for Output:
For each verified alternative you find (provide at least five if they exist), you must provide:
- **name**: The real, verified name of the alternative (use the most common Google-searchable label in India). This key MUST be 'name'.
- **composition**: The accurate composition details.
- **similarity**: % similarity to the original medicine (0–100%).
- **recommendation**: The recommendation level ("Recommended ✅", "Good", "Fair", or "Not Recommended ❌") based on the similarity rules defined in the comparison task.
- **sourceUrl**: The exact URL of the webpage where you found the information. This is **MANDATORY**.

Return the results in the 'alternatives' field of the JSON output. If no valid alternatives are found, return an empty 'alternatives' array.
{{/if}}
`,
});

const medicineComparatorFlow = ai.defineFlow(
  {
    name: 'medicineComparatorFlow',
    inputSchema: MedicineComparatorInputSchema,
    outputSchema: MedicineComparatorOutputSchema,
  },
  async input => {
    // To make the prompt logic work, we ensure medicineB is only passed for 'compare' mode.
    const promptInput =
      input.mode === 'compare' ? input : {mode: input.mode, medicineA: input.medicineA};
    const {output} = await prompt(promptInput);
    return output!;
  }
);
