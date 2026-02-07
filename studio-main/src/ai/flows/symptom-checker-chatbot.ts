// SymptomCheckerChatbot flow (CUSTOM NLP BRAIN)
'use server';

import { z } from 'genkit';
import { processUserQuery } from '@/lib/custom-nlp-engine';
import { type AyurGenixRecord } from '@/lib/ayurgenix-retriever';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'debug-server.log');
function logDebug(msg: string) {
  try { fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { }
}

const SymptomCheckerChatbotInputSchema = z.object({
  symptoms: z.string(),
  language: z.string().optional(),
});
export type SymptomCheckerChatbotInput = z.infer<typeof SymptomCheckerChatbotInputSchema>;

const SymptomCheckerChatbotOutputSchema = z.object({
  guidance: z.string(),
});
export type SymptomCheckerChatbotOutput = z.infer<typeof SymptomCheckerChatbotOutputSchema>;

export async function symptomCheckerChatbot(input: SymptomCheckerChatbotInput): Promise<SymptomCheckerChatbotOutput> {
  const query = input.symptoms;

  // 1. Process Query through our Self-Made Brain
  logDebug(`Received query: ${query}`);
  let result;
  try {
    result = await processUserQuery(query);
    logDebug(`NLP Result for "${query}": Intent="${result.bestMatch?.intent}" Score=${result.bestMatch?.score} RemediesCount=${result.remedies.length}`);
  } catch (error) {
    logDebug(`NLP Error: ${error}`);
    console.error("NLP Engine Error:", error);
    return { guidance: "My brain is currently offline (Model file missing). Please run the training script." };
  }

  const { bestMatch, remedies } = result;

  // 2. No Remedies Found
  if (remedies.length === 0) {
    return {
      guidance: `I analyzed your symptoms "${query}" but my training data doesn't contain a match. \n\nI am a specialized Ayurvedic model - try describing your condition using standard medical terms.`
    };
  }

  // 3. Format Response
  let responseHeader = "";
  if (bestMatch && bestMatch.intent !== 'None') {
    const confidence = Math.round(bestMatch.score * 100);
    responseHeader = `> **Analysis:** I am ${confidence}% confident you are asking about **${bestMatch.intent}**.\n\n`;
  } else {
    responseHeader = `> **Analysis:** I couldn't pinpoint a specific disease intent, but I found these relevant records based on keywords:\n\n`;
  }

  return {
    guidance: formatResponse(responseHeader, remedies, query)
  };
}

function formatResponse(header: string, records: AyurGenixRecord[], userQuery: string): string {
  let response = `# AyurGenix AI Recommendation\n\n`;
  response += header;

  records.slice(0, 3).forEach((record, index) => {
    response += `### ${index + 1}. ${record.Disease}\n`;
    response += `*${record['Hindi Name'] || 'Traditional'} Name*\n\n`;

    response += `**Matched Symptoms:** ${record.Symptoms}\n\n`;

    if (record['Ayurvedic Herbs']) {
      response += `**🌿 Herbs:** ${record['Ayurvedic Herbs']}\n\n`;
    }

    if (record['Diet and Lifestyle Recommendations']) {
      response += `**🧘 Lifestyle:** ${record['Diet and Lifestyle Recommendations']}\n\n`;
    }

    if (record.Formulation) {
      response += `**💊 Formulation:** ${record.Formulation}\n\n`;
    }

    response += `---\n`;
  });

  response += `\n*Disclaimer: I am a custom AI model trained on specialized Ayurvedic data. Consult a human doctor for medical advice.*`;

  return response;
}
