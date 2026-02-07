
import { NlpManager } from 'node-nlp';
import path from 'path';

const MODEL_PATH = path.join(process.cwd(), 'src', 'data', 'model.nlp');

async function test() {
    const manager = new NlpManager({ languages: ['en'], forceNER: true });

    try {
        await manager.load(MODEL_PATH);
        console.log("Model loaded successfully.");
    } catch (e) {
        console.error("Failed to load model:", e);
        return;
    }

    const query = 'I feel dizzy and have high blood pressure';
    console.log(`Testing query: "${query}"`);

    const response = await manager.process('en', query);
    console.log("Top Intent:", response.intent);
    console.log("Score:", response.score);
    console.log("Top 3 Classifications:");
    response.classifications.slice(0, 3).forEach((c: any) => {
        console.log(`  - ${c.intent}: ${c.score}`);
    });
}

test().catch(console.error);
