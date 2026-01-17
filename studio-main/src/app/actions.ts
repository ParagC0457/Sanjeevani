
'use server';

import { symptomCheckerChatbot } from '@/ai/flows/symptom-checker-chatbot';
import { medicalReportSummary } from '@/ai/flows/medical-report-summary';
import { parsePrescription } from '@/ai/flows/prescription-parser';
import { compareMedicines } from '@/ai/flows/medicine-comparator';
import type { PrescriptionOutput } from '@/ai/flows/prescription-parser';
import { estimateCost, type CostEstimatorInput } from '@/ai/flows/cost-estimator';
import type { MedicineComparatorInput, MedicineComparatorOutput } from '@/ai/flows/medicine-comparator';

export async function runSymptomChecker(symptoms: string, language: string) {
  try {
    const result = await symptomCheckerChatbot({ symptoms, language });
    return { guidance: result.guidance };
  } catch (error: any) {
    console.error('Error in runSymptomChecker:', error);
    const errorMessage = error.message || 'An unexpected error occurred.';
    return { error: `Symptom Checker Error: ${errorMessage}` };
  }
}

export async function runReportSummary(reportDataUri: string) {
  try {
    const result = await medicalReportSummary({ reportDataUri });
    return { summary: result.summary };
  } catch (error: any) {
    console.error('Error in runReportSummary:', error);
    // Pass a more specific error message to the client
    const errorMessage = error.message || 'An unknown error occurred during summarization.';
    return { error: `Summarization failed: ${errorMessage}` };
  }
}

export async function runPrescriptionParser(prescriptionDataUri: string): Promise<{ data?: PrescriptionOutput, error?: string }> {
  try {
    const result = await parsePrescription({ prescriptionDataUri });
    return { data: result };
  } catch (error: any) {
    console.error('Error in runPrescriptionParser:', error);
    const errorMessage = error.message || 'An unknown error occurred during parsing.';
    return { error: `Prescription parsing failed: ${errorMessage}` };
  }
}

export async function runMedicineComparator(input: MedicineComparatorInput): Promise<{ data?: MedicineComparatorOutput, error?: string, success: boolean }> {
  try {
    const result = await compareMedicines(input);
    return { data: result, success: true };
  } catch (error: any) {
    console.error('Error in runMedicineComparator:', error);
    if (error.message?.includes("503") || error.message?.includes("overloaded")) {
      return { success: false, error: "The AI service is currently overloaded. Please try again shortly." };
    }
    const errorMessage = error.message || 'An unexpected error occurred while comparing medicines.';
    return { success: false, error: `Comparison failed: ${errorMessage}` };
  }
}

export async function runCostEstimator(input: CostEstimatorInput) {
  try {
    const result = await estimateCost(input);
    return { estimate: result.estimate };
  } catch (error) {
    console.error('Error in runCostEstimator:', error);
    return { error: 'An unexpected error occurred while estimating the cost. Please try again.' };
  }
}
