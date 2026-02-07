import { config } from 'dotenv';
import fs from 'fs';

config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        fs.writeFileSync('models.log', "No GOOGLE_API_KEY found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const text = await response.text();
            fs.writeFileSync('models.log', `Error: ${response.status} ${response.statusText}\n${text}`);
            return;
        }

        const data = await response.json();
        let output = "Available Models:\n";
        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    output += `${m.name}\n`;
                }
            });
        } else {
            output += "No models returned.";
        }
        fs.writeFileSync('models.log', output);
        console.log("Written to models.log");

    } catch (error: any) {
        fs.writeFileSync('models.log', `Network error: ${error.message}`);
    }
}

listModels();
