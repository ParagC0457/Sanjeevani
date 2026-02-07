
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

const CSV_PATH = path.join(process.cwd(), 'src', 'data', 'AyurGenixAI_Dataset.csv');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'AyurGenixAI_Dataset_Cleaned.csv');

interface Record {
    Disease: string;
    [key: string]: any;
}

const seenDiseases = new Set<string>();
const uniqueRecords: Record[] = [];

fs.createReadStream(CSV_PATH)
    .pipe(csvParser())
    .on('data', (row: Record) => {
        // Normalize disease name: trim and lower case for check, but keep original
        const normalizedName = row.Disease.trim().toLowerCase();

        if (!seenDiseases.has(normalizedName)) {
            seenDiseases.add(normalizedName);
            uniqueRecords.push(row);
        }
    })
    .on('end', async () => {
        console.log(`Original count: (unknown - stream based)`);
        console.log(`Unique records found: ${uniqueRecords.length}`);

        if (uniqueRecords.length > 0) {
            const csvWriter = createObjectCsvWriter({
                path: CSV_PATH, // OVERWRITE original
                header: Object.keys(uniqueRecords[0]).map(id => ({ id, title: id }))
            });

            await csvWriter.writeRecords(uniqueRecords);
            console.log('CSV successfully deduplicated and overwritten.');
        } else {
            console.log('No records found to write.');
        }
    });
