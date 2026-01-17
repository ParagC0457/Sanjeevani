
import { config } from 'dotenv';
config();

import '@/ai/flows/symptom-checker-chatbot.ts';
import '@/ai/flows/medical-report-summary.ts';
import '@/ai/flows/prescription-parser.ts';
import '@/ai/flows/medicine-comparator.ts';
import '@/ai/flows/cost-estimator.ts';
import '@/ai/tools/web-search.ts';
