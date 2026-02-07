
import { NlpManager } from 'node-nlp';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Path to your CSV
const CSV_PATH = path.join(process.cwd(), 'src', 'data', 'AyurGenixAI_Dataset.csv');
const MODEL_PATH = path.join(process.cwd(), 'src', 'data', 'model.nlp');

async function trainModel() {
    console.log("Reading CSV Data...");

    if (!fs.existsSync(CSV_PATH)) {
        console.error(`CSV not found at: ${CSV_PATH}`);
        return;
    }

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const parsed = Papa.parse<{ Symptoms: string, Disease: string }>(csvContent, {
        header: true,
        skipEmptyLines: true
    });

    const manager = new NlpManager({ languages: ['en'], forceNER: true });

    console.log(`Training on ${parsed.data.length} records...`);

    // Feed data to the Neural Network
    parsed.data.forEach((row, index) => {
        if (row.Symptoms && row.Disease) {
            // Intent = Disease Name (e.g., "Diabetes")
            // Utterance = Symptoms (e.g., "High blood sugar, frequent urination")

            // We split compound symptoms to give the model more variations
            const symptoms = row.Symptoms.split(',').map(s => s.trim());
            const intent = row.Disease.replace(/\s+/g, '_'); // Normalize intent

            symptoms.forEach(symptom => {
                if (symptom.length > 2) {
                    manager.addDocument('en', symptom, intent);
                }
            });

            // Also add the Disease name itself as an utteranc, so if they type "Diabetes" it works
            manager.addDocument('en', row.Disease, intent);
        }
    });

    console.log("Training started (this might take a moment)...");
    await manager.train();

    console.log("Saving model...");
    manager.save(MODEL_PATH);
    console.log(`Model saved to ${MODEL_PATH}`);
}

trainModel().catch(console.error);
