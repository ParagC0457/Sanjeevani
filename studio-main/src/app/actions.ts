
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

// Health News Fetching
import { fetchMedicalNews, fallbackArticles, getCategoryImage, type NewsArticle } from '@/lib/news-scraper';

export async function getHealthNews(): Promise<{ articles: NewsArticle[], error?: string }> {
  try {
    const rawArticles = await fetchMedicalNews();

    // We strictly have 8 unique local images. 
    // To ensure NO repeats, we limit to 8 articles max.
    const limitedArticles = rawArticles.slice(0, 8);

    const allImages = [
      '/images/health/diabetes.png',
      '/images/health/heart.png',
      '/images/health/mental-health.png',
      '/images/health/flu.png',
      '/images/health/nutrition.png',
      '/images/health/sleep.png',
      '/images/health/fitness.png',
      '/images/health/medical-default.png'
    ];

    // Track which images have been assigned to effectively use the "pool"
    const usedImages = new Set<string>();
    const processedArticles = limitedArticles.map(article => ({ ...article, imageUrl: '' }));

    // Pass 1: Try to match keywords to specific images
    processedArticles.forEach(article => {
      const title = article.title.toLowerCase();
      const cat = article.category.toLowerCase();

      let match = '';
      if ((title.includes('diabetes') || title.includes('sugar')) && !usedImages.has('/images/health/diabetes.png')) match = '/images/health/diabetes.png';
      else if ((title.includes('heart') || title.includes('cardio')) && !usedImages.has('/images/health/heart.png')) match = '/images/health/heart.png';
      else if ((title.includes('mental') || title.includes('stress')) && !usedImages.has('/images/health/mental-health.png')) match = '/images/health/mental-health.png';
      else if ((title.includes('flu') || title.includes('virus')) && !usedImages.has('/images/health/flu.png')) match = '/images/health/flu.png';
      else if ((title.includes('food') || title.includes('diet')) && !usedImages.has('/images/health/nutrition.png')) match = '/images/health/nutrition.png';
      else if ((title.includes('sleep') || title.includes('rest')) && !usedImages.has('/images/health/sleep.png')) match = '/images/health/sleep.png';
      else if ((title.includes('fitness') || title.includes('gym')) && !usedImages.has('/images/health/fitness.png')) match = '/images/health/fitness.png';

      if (match) {
        article.imageUrl = match;
        usedImages.add(match);
      }
    });

    // Pass 2: Fill in the blanks with remaining unused images
    const unusedImages = allImages.filter(img => !usedImages.has(img));
    processedArticles.forEach(article => {
      if (!article.imageUrl && unusedImages.length > 0) {
        const nextImage = unusedImages.shift();
        if (nextImage) {
          article.imageUrl = nextImage;
          usedImages.add(nextImage);
        }
      }
    });

    // If we somehow still have articles without images (unlikely if counts match), 
    // filter them out to strictly obey "no defaults/repeats" rule.
    const finalArticles = processedArticles.filter(a => a.imageUrl);

    return { articles: finalArticles as NewsArticle[] };
  } catch (error: any) {
    console.error('Error fetching health news:', error);
    return {
      articles: fallbackArticles,
      error: 'Using cached health articles. Live news temporarily unavailable.'
    };
  }
}

// User Authentication Actions
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function registerUser(data: any) {
  try {
    const { email, password, firstName, lastName } = data;

    if (!email || !password || !firstName || !lastName) {
      return { error: "Missing required fields." };
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: "User already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const name = `${firstName} ${lastName}`;

    await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
    });

    return { success: true, message: "Account created successfully! Please login." };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong during registration." };
  }
}

