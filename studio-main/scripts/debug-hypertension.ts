
import { retrieveAyurvedicRemedies } from '../src/lib/ayurgenix-retriever';

async function verify() {
    const query = "Hypertension";
    console.log(`Checking retrieval for: "${query}"`);

    // Check Case Insensitivity
    const results = await retrieveAyurvedicRemedies(query);
    console.log(`Found ${results.length} results.`);

    if (results.length > 0) {
        console.log("Top result:", results[0].Disease);
    } else {
        console.log("FAILED to find Hypertension.");
    }

    // Check lowercase just in case
    const lowerResults = await retrieveAyurvedicRemedies("hypertension");
    console.log(`Lowercase 'hypertension' found: ${lowerResults.length}`);
}

verify().catch(console.error);
