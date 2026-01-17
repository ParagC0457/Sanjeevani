'use server';

/**
 * @fileOverview A flow for parsing medical prescriptions to extract medication details.
 *
 * - parsePrescription - A function that takes a prescription image and returns structured data.
 * - PrescriptionInput - The input type for the parsePrescription function.
 * - PrescriptionOutput - The return type for the parsePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrescriptionInputSchema = z.object({
  prescriptionDataUri: z
    .string()
    .describe(
      "An image of a medical prescription as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PrescriptionInput = z.infer<typeof PrescriptionInputSchema>;

const MedicationSchema = z.object({
    name: z.string().describe('The name of the medication.'),
    dosage: z.string().describe('The dosage, e.g., "10mg", "1 tablet".'),
    frequency: z.string().describe('How often the medication should be taken, e.g., "Once a day", "Twice a day with meals".'),
    mealInstruction: z.string().optional().describe('Instructions regarding meals, e.g., "Before Meal", "After Meal", "With Meal".'),
    notes: z.string().optional().describe('Any other additional notes or instructions for the medication.'),
});

const PrescriptionOutputSchema = z.object({
  medications: z.array(MedicationSchema).describe('An array of medications found in the prescription.'),
});
export type PrescriptionOutput = z.infer<typeof PrescriptionOutputSchema>;


export async function parsePrescription(
  input: PrescriptionInput
): Promise<PrescriptionOutput> {
  return prescriptionParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prescriptionParserPrompt',
  input: {schema: PrescriptionInputSchema},
  output: {schema: PrescriptionOutputSchema},
  prompt: `You are an expert at reading and interpreting medical prescriptions. Your task is to analyze the provided image of a prescription and extract the details for each medication listed.

Please identify the following for each medication:
- Medication Name
- Dosage (e.g., "500mg", "1 tablet")
- Frequency (e.g., "Once daily", "Twice a day after meals", "As needed for pain")
- Meal Instruction (e.g., "Before Meal", "After Meal", "With Meal", "On an empty stomach"). If not specified, leave it out.
- Additional Notes (any other important instructions or warnings). If not specified, leave it out.

Return the extracted information in the specified JSON format. If the prescription is unclear or illegible, do your best to interpret it or note the ambiguity.

Here is the prescription:

Prescription Image: {{media url=prescriptionDataUri}}`,
});

const prescriptionParserFlow = ai.defineFlow(
  {
    name: 'prescriptionParserFlow',
    inputSchema: PrescriptionInputSchema,
    outputSchema: PrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
