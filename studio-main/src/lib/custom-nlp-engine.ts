
import { NlpManager } from 'node-nlp';
import path from 'path';
import fs from 'fs';
import { retrieveAyurvedicRemedies } from '@/lib/ayurgenix-retriever';

const MODEL_PATH = path.join(process.cwd(), 'src', 'data', 'model.nlp');

let manager: NlpManager | null = null;
let isModelLoading = false;

async function getManager() {
    if (manager) return manager;

    // Singleton pattern to load model only once
    if (!fs.existsSync(MODEL_PATH)) {
        throw new Error("Custom NLP Model not found. Please train it first.");
    }

    const nlp = new NlpManager({ languages: ['en'], forceNER: true });
    await nlp.load(MODEL_PATH);
    manager = nlp;
    return manager;
}

export type NlpPrediction = {
    intent: string;
    score: number;
    answer?: string;
};

export async function processUserQuery(query: string): Promise<{
    bestMatch: NlpPrediction | null,
    remedies: any[]
}> {
    const nlp = await getManager();
    const response = await nlp.process('en', query);

    console.log(`[CustomNLP] Input: "${query}" -> Intent: "${response.intent}" (Score: ${response.score})`);

    // Threshold: If confidence is too low, we might not want to trust it blindly
    // But since we have specific intents, even low score might be the best guess.
    // We'll trust scores > 0.5 or if it's the only intent.

    if (response.intent && response.intent !== 'None') {
        // Intent IS the Disease Name in our training logic
        const diseaseName = response.intent.replace(/_/g, ' ');
        const remedies = await retrieveAyurvedicRemedies(diseaseName); // Search by predicted disease

        return {
            bestMatch: {
                intent: diseaseName,
                score: response.score
            },
            remedies
        };
    }

    // Fallback: If NLP fails, try direct keyword search
    const fallbackRemedies = await retrieveAyurvedicRemedies(query);
    return {
        bestMatch: null,
        remedies: fallbackRemedies
    };
}
