
import { retrieveAyurvedicRemedies } from '../src/lib/ayurgenix-retriever';
import path from 'path';

// Mock process.cwd to ensure correct path resolution if run from root
const originalCwd = process.cwd();
console.log(`Current CWD: ${originalCwd}`);

async function main() {
    console.log("Testing AyurGenix Retriever...");

    const queries = ["Headache", "Diabetes", "Knee pain"];

    for (const query of queries) {
        console.log(`\n--- Searching for: "${query}" ---`);
        try {
            const results = await retrieveAyurvedicRemedies(query);
            if (results.length === 0) {
                console.log("No results found.");
            } else {
                results.forEach((r, i) => {
                    console.log(`${i + 1}. ${r.Disease} (${r['Hindi Name']})`);
                    console.log(`   Herbs: ${r['Ayurvedic Herbs']}`);
                    console.log(`   Formulation: ${r.Formulation}`);
                });
            }
        } catch (error) {
            console.error(`Error searching for ${query}:`, error);
        }
    }
}

main().catch(console.error);
