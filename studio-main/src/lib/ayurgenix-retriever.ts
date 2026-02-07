
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Define the shape of our CSV data
export interface AyurGenixRecord {
    Disease: string;
    'Hindi Name': string;
    'Marathi Name': string;
    Symptoms: string;
    'Diagnosis & Tests': string;
    'Symptom Severity': string;
    'Duration of Treatment': string;
    'Medical History': string;
    'Current Medications': string;
    'Risk Factors': string;
    'Environmental Factors': string;
    'Sleep Patterns': string;
    'Stress Levels': string;
    'Physical Activity Levels': string;
    'Family History': string;
    'Dietary Habits': string;
    'Allergies (Food/Env)': string;
    'Seasonal Variation': string;
    'Age Group': string;
    Gender: string;
    'Occupation and Lifestyle': string;
    'Cultural Preferences': string;
    'Herbal/Alternative Remedies': string;
    'Ayurvedic Herbs': string;
    Formulation: string;
    Doshas: string;
    'Constitution/Prakriti': string;
    'Diet and Lifestyle Recommendations': string;
    'Yoga & Physical Therapy': string;
    'Medical Intervention': string;
    Prevention: string;
    Prognosis: string;
    Complications: string;
    'Patient Recommendations': string;
}

const CSV_PATH = path.join(process.cwd(), 'src', 'data', 'AyurGenixAI_Dataset.csv');

let cachedData: AyurGenixRecord[] | null = null;

export async function loadAyurvedicData(): Promise<AyurGenixRecord[]> {
    if (cachedData) return cachedData;

    const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');

    return new Promise((resolve, reject) => {
        Papa.parse<AyurGenixRecord>(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                cachedData = results.data;
                resolve(results.data);
            },
            error: (error: any) => {
                reject(error);
            }
        });
    });
}

export async function retrieveAyurvedicRemedies(query: string, limit: number = 3): Promise<AyurGenixRecord[]> {
    const data = await loadAyurvedicData();
    const lowerQuery = query.toLowerCase();
    const tokens = lowerQuery.split(/\s+/).filter(t => t.length > 2 && !['and', 'the', 'have', 'for', 'with'].includes(t));

    // Simple keyword matching for now
    // Score based on occurrence in Symptoms, Disease name, and Hindi/Marathi names
    const scoredResults = data.map(record => {
        let score = 0;

        // 1. Exact Full Phrase Match (Highest Priority)
        if (record.Disease && record.Disease.toLowerCase().includes(lowerQuery)) score += 100;
        if (record.Symptoms && record.Symptoms.toLowerCase().includes(lowerQuery)) score += 50;

        // 2. Token/Keyword Match (Accumulative)
        tokens.forEach(token => {
            if (record.Disease && record.Disease.toLowerCase().includes(token)) score += 20;
            if (record.Symptoms && record.Symptoms.toLowerCase().includes(token)) score += 10; // "dizzy" found in symptoms
            if (record['Hindi Name'] && record['Hindi Name'].includes(token)) score += 15;
            if (record['Marathi Name'] && record['Marathi Name'].includes(token)) score += 15;
        });

        // Contextual matches
        const searchableFields = [
            record['Diagnosis & Tests'],
            record['Risk Factors'],
            record['Medical History']
        ];

        searchableFields.forEach(field => {
            if (field && tokens.some(t => field.toLowerCase().includes(t))) score += 5;
        });

        return { record, score };
    });

    // Filter out zero scores, sort, and DEDUPLICATE
    const uniqueDiseases = new Set<string>();
    const validResults: AyurGenixRecord[] = [];

    const sorted = scoredResults
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    for (const item of sorted) {
        if (!uniqueDiseases.has(item.record.Disease)) {
            uniqueDiseases.add(item.record.Disease);
            validResults.push(item.record);
        }
    }

    return validResults.slice(0, limit);
}
