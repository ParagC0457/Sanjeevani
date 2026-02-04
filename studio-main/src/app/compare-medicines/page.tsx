
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { runMedicineComparator } from '@/app/actions';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Loader, Pill, Repeat, Search, ChevronsRight, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import type { MedicineComparatorOutput } from '@/ai/flows/medicine-comparator';
import SimilarityChart from '@/components/medications/similarity-chart';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Mode = 'compare' | 'alternative';

export default function CompareMedicinesPage() {
  const [medicineA, setMedicineA] = useState('');
  const [medicineB, setMedicineB] = useState('');
  const [alternativeMedicine, setAlternativeMedicine] = useState('');
  
  const [result, setResult] = useState<MedicineComparatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (mode: Mode) => {
    const isCompare = mode === 'compare';
    const medicineToProcess = isCompare ? medicineA : alternativeMedicine;

    if (!medicineToProcess.trim() || (isCompare && !medicineB.trim()) || isLoading) return;

    setIsLoading(true);
    setActiveMode(mode);
    setResult(null);
    setServiceError(null);
    
    const response = await runMedicineComparator({
      mode,
      medicineA: medicineToProcess,
      medicineB: isCompare ? medicineB : undefined,
    });
    
    setIsLoading(false);

    if (!response.success) {
      setServiceError(response.error ?? "An unexpected error occurred.");
    } else if (response.data) {
      setResult(response.data);
    }
  };
  
  const getRecommendationBadgeVariant = (recommendation: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
      if (recommendation.includes('✅')) return 'default';
      if (recommendation.includes('Good')) return 'secondary';
      if (recommendation.includes('Fair')) return 'outline';
      return 'destructive';
  }

  const getSourceText = (mode: Mode | null) => {
    if (mode === 'alternative') {
        return "Alternatives are primarily sourced from CDSCO — Central Drugs Standard Control Organization (India), the national regulatory body for pharmaceuticals. This ensures that suggestions are based on approved drug lists. When information is not available, our AI may consult other reliable online sources.";
    }
    return "Information is AI-generated. For reference only. ";
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Compare & Find Medicines</h1>
        <p className="mt-2 text-muted-foreground">
          Compare medicines by composition or find alternatives if one is unavailable.
        </p>
      </div>
      
       {serviceError && (
          <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4 !text-yellow-500" />
            <AlertTitle>Service Temporarily Unavailable</AlertTitle>
            <AlertDescription>
              {serviceError}
            </AlertDescription>
          </Alert>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ChevronsRight /> Compare Two Medicines</CardTitle>
            <CardDescription>Enter two medicine names to see how similar they are based on their active ingredients.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('compare'); }} className="space-y-4">
              <Input
                placeholder="Enter Medicine A"
                value={medicineA}
                onChange={(e) => setMedicineA(e.target.value)}
                disabled={isLoading}
              />
              <Input
                placeholder="Enter Medicine B"
                value={medicineB}
                onChange={(e) => setMedicineB(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !medicineA.trim() || !medicineB.trim()} className="w-full">
                {isLoading && activeMode === 'compare' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Repeat className="mr-2 h-4 w-4" />}
                Compare
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="relative flex items-center justify-center my-4 md:hidden">
            <Separator className="w-full" />
            <span className="absolute px-4 font-semibold text-muted-foreground bg-background">OR</span>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search /> Find an Alternative</CardTitle>
            <CardDescription>Enter one medicine name to find the closest available alternatives from approved drug lists.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('alternative'); }} className="space-y-4">
               <Input
                placeholder="Enter Medicine Name"
                value={alternativeMedicine}
                onChange={(e) => setAlternativeMedicine(e.target.value)}
                disabled={isLoading}
              />
               <div className="h-10"></div>
               <Button type="submit" disabled={isLoading || !alternativeMedicine.trim()} className="w-full">
                {isLoading && activeMode === 'alternative' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Find Alternatives
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>


      {isLoading && (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader className="mr-2 h-5 w-5 animate-spin" />
          <span>Analyzing...</span>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              AI-Generated Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMode === 'compare' && result.comparison && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48">
                  <SimilarityChart 
                    similarity={result.comparison.similarity}
                    recommendation={result.comparison.recommendation}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold">Comparison Result for {medicineA} & {medicineB}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Recommendation:</span>
                     <Badge variant={getRecommendationBadgeVariant(result.comparison.recommendation)}>
                        {result.comparison.recommendation}
                    </Badge>
                  </div>
                  <p><span className="font-semibold">Explanation:</span> {result.comparison.explanation}</p>
                  <p className="text-sm text-muted-foreground">{getSourceText(activeMode)}</p>
                </div>
              </div>
            )}
            
            {activeMode === 'alternative' && result.alternatives && result.alternatives.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Alternatives for {alternativeMedicine}</h3>
                    {result.alternatives.map((alt, index) => (
                        <Card key={index} className="bg-secondary/50">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-32 h-32 flex-shrink-0">
                                      <SimilarityChart 
                                        similarity={alt.similarity}
                                        recommendation={alt.recommendation}
                                      />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="text-lg font-bold">{alt.name}</h4>
                                        <p className="text-sm"><span className="font-semibold">Composition:</span> {alt.composition}</p>
                                        <Badge variant={getRecommendationBadgeVariant(alt.recommendation)}>
                                            {alt.recommendation}
                                        </Badge>
                                        {alt.sourceUrl && (
                                            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                                                <LinkIcon className="h-4 w-4" />
                                                <span>Sourced from: </span>
                                                <Link href={alt.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 truncate">
                                                    {new URL(alt.sourceUrl).hostname}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                     <p className="text-sm text-muted-foreground pt-4">{getSourceText(activeMode)}</p>
                </div>
            )}
             {activeMode === 'alternative' && (!result.alternatives || result.alternatives.length === 0) && (
                 <p className="text-center text-muted-foreground">No reliable alternative found for {alternativeMedicine}. Please consult a healthcare professional.</p>
             )}

            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> This information is AI-generated and based on publicly available CDSCO data. It is intended for general wellbeing support only. Do not use it as a substitute for professional medical advice. Always consult a licensed doctor in case of emergencies or treatment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
