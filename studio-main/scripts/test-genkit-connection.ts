
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config } from 'dotenv';
import fs from 'fs';

config();

async function main() {
    console.log("Initializing Genkit...");

    const ai = genkit({
        plugins: [googleAI()],
        model: 'googleai/gemini-2.5-flash',
    });

    console.log("Testing generation with gemini-2.5-flash...");

    try {
        const { text } = await ai.generate('Hello, are you working?');
        console.log("Success! Response:");
        console.log(text);
        fs.writeFileSync('connection_test.log', `SUCCESS: ${text}`);
    } catch (error: any) {
        console.error("Error during generation:");
        console.error(error);
        fs.writeFileSync('connection_test.log', `FAILURE: ${error.message}`);

        if (error.message?.includes('404')) {
            console.log("\nPossible causes for 404:");
            console.log("- API Key is missing or invalid.");
            console.log("- Model is not available in your region.");
            console.log("- Project is not linked to your API key.");
        }
    }
}

main().catch((err) => {
    console.error(err);
    fs.writeFileSync('connection_test.log', `CRITICAL_FAILURE: ${err.message}`);
});
