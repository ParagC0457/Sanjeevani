
'use server';

/**
 * @fileOverview Provides a web search tool for Genkit flows.
 *
 * - webSearch - A Genkit tool that uses a specialized search model to find information on the web.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Searches the web for the given query and returns the most relevant results.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.string().describe('The search results in a string format.'),
  },
  async input => {
    const {text} = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest-search',
      prompt: input.query,
    });
    return text;
  }
);
