'use server';

/**
 * @fileOverview Provides a flow for summarizing medical reports using a chatbot.
 *
 * - medicalReportSummary - A function that takes medical report data and returns a summary.
 * - MedicalReportSummaryInput - The input type for the medicalReportSummary function.
 * - MedicalReportSummaryOutput - The return type for the medicalReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'fs/promises';

const MedicalReportSummaryInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      'The medical report as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type MedicalReportSummaryInput = z.infer<typeof MedicalReportSummaryInputSchema>;

const MedicalReportSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the medical report.'),
});
export type MedicalReportSummaryOutput = z.infer<typeof MedicalReportSummaryOutputSchema>;

export async function medicalReportSummary(
  input: MedicalReportSummaryInput
): Promise<MedicalReportSummaryOutput> {
  return medicalReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicalReportSummaryPrompt',
  input: {schema: MedicalReportSummaryInputSchema},
  output: {schema: MedicalReportSummaryOutputSchema},
  prompt: `You are a medical expert with a talent for explaining complex medical topics in simple, clear language. Your task is to summarize the following medical report for a patient who has little to no medical knowledge.

Please perform OCR if necessary, analyze any images or text, and provide a summary that meets these criteria:
- Use simple, everyday words.
- Avoid all medical jargon. If a technical term is unavoidable, explain it immediately in a very simple way.
- Focus on the key findings and what they mean for the patient's health.
- The tone should be helpful, clear, and reassuring.

Here is the report:

Report: {{media url=reportDataUri}}`,
});

const medicalReportSummaryFlow = ai.defineFlow(
  {
    name: 'medicalReportSummaryFlow',
    inputSchema: MedicalReportSummaryInputSchema,
    outputSchema: MedicalReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
