
require('dotenv').config();

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env");
    process.exit(1);
}

async function listModels() {
    console.log("Fetching available models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            return;
        }

        console.log("\n--- Models supporting generateContent ---");
        const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        generateModels.forEach(m => {
            console.log(`Model: ${m.name}`);
            console.log(`DisplayName: ${m.displayName}`);
            console.log(`Version: ${m.version}`);
            console.log("-----------------------------------------");
        });

    } catch (e) {
        console.error("Network or execution error:", e);
    }
}

listModels();
