
import { retrieveAyurvedicRemedies } from '../src/lib/ayurgenix-retriever';

async function testFuzzy() {
    const query = "I feel dizzy and have high blood pressure";
    console.log(`Testing Fuzzy Retrieval for: "${query}"`);

    const results = await retrieveAyurvedicRemedies(query);

    console.log(`Found ${results.length} results.`);
    results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.Disease} (Score based match)`);
    });

    if (results.some(r => r.Disease.includes("Hypertension") || r.Disease.includes("Blood Pressure"))) {
        console.log("SUCCESS: Found Hypertension/BP related result.");
    } else {
        console.log("FAILURE: Did not find relevant result.");
    }
}

testFuzzy().catch(console.error);
