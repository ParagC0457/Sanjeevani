// SymptomCheckerChatbot flow
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { retrieveMedicines } from '@/lib/medicine-retriever';

const SymptomCheckerChatbotInputSchema = z.object({
  symptoms: z
    .string()
    .describe(
      'The user query or symptoms description.'
    ),
  language: z.string().optional().describe('The language for the chatbot response.'),
});
export type SymptomCheckerChatbotInput = z.infer<typeof SymptomCheckerChatbotInputSchema>;

const SymptomCheckerChatbotOutputSchema = z.object({
  guidance: z.string().describe('The guidance for the user based on the symptoms. This should be a markdown-formatted string.'),
});
export type SymptomCheckerChatbotOutput = z.infer<typeof SymptomCheckerChatbotOutputSchema>;

export async function symptomCheckerChatbot(input: SymptomCheckerChatbotInput): Promise<SymptomCheckerChatbotOutput> {
  return symptomCheckerChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomCheckerChatbotPrompt',
  input: {
    schema: SymptomCheckerChatbotInputSchema.extend({
      context: z.string().optional(),
    })
  },
  output: { schema: SymptomCheckerChatbotOutputSchema },
  prompt: `You are Amrita, a specialized Medicine Assistant.
  
  CRITICAL RULES:
  1. You can ONLY answer questions about medicines, their uses, dosages, side effects, and prices found in the provided CONTEXT.
  2. If the user asks about symptoms, try to map them to medicines you know about in the CONTEXT.
  3. If the user asks about anything unrelated to medicines (e.g., general knowledge, politics, sports, coding), you MUST politely refuse. Say: "I am Amrita, a specialized Medicine Assistant. I can only help you with information regarding medicines."
  4. Use the provided CONTEXT as your primary source of truth.
  5. Your response should be formatted using Markdown.
  6. Your response MUST be in the following language: {{{language}}}. If no language is specified, respond in English.

  CONTEXT (Retrieved Medicines):
  {{context}}

  User Query: {{{symptoms}}}
  `,
});

const translationPrompt = ai.definePrompt({
  name: 'translationPrompt',
  input: { schema: z.object({ query: z.string() }) },
  output: { schema: z.object({ translatedQuery: z.string() }) },
  prompt: `You are a helpful translator for a medical assistant.
  Translate the user's query into English medical terminology suitable for database search.
  
  - If the user uses colloquial terms (e.g., "matha betha"), translate to the medical equivalent ("headache").
  - If the input is already valid English or a medicine name (e.g., "Dolo 650"), return it as is.
  - Keep the translation concise (keywords are better than full sentences).
  
  User Query: {{query}}
  `,
});

const symptomCheckerChatbotFlow = ai.defineFlow(
  {
    name: 'symptomCheckerChatbotFlow',
    inputSchema: SymptomCheckerChatbotInputSchema,
    outputSchema: SymptomCheckerChatbotOutputSchema,
  },
  async input => {
    let searchTerms = input.symptoms;

    // Translation Step: Convert colloquial/foreign input to English keywords for RAG
    try {
      const { output } = await translationPrompt({ query: input.symptoms });
      if (output && output.translatedQuery) {
        searchTerms = output.translatedQuery;
      }
    } catch (e) {
      console.error("Translation failed, proceeding with original query:", e);
    }

    let medicines;
    try {
      // RAG Step: Retrieve relevant medicines using the TRANSLATED terms
      medicines = await retrieveMedicines(searchTerms);
    } catch (e: any) {
      throw new Error(`Retrieval logic failed: ${e.message}`);
    }

    // Strict Check: If RAG fails, return specific error
    if (medicines.length === 0) {
      // Return specific guidance with debug info in development
      return {
        guidance: `RAG failed: lack of information. \n\n(Debug: Searched for "${searchTerms}" derived from "${input.symptoms}")`
      };
    }

    const context = JSON.stringify(medicines, null, 2);

    const promptInput = {
      ...input,
      context
    };

    try {
      const { output } = await prompt(promptInput);
      if (!output) throw new Error("AI returned null output.");
      return output;
    } catch (e: any) {
      throw new Error(`AI Model call failed: ${e.message}`);
    }
  }
);
