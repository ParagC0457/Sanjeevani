
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Bot, IndianRupee, Loader } from 'lucide-react';
import { runCostEstimator } from '@/app/actions';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

const hospitals = {
  Kolkata: [
    "SSKM Hospital (IPGME&R)",
    "Calcutta Medical College and Hospital",
    "R. G. Kar Medical College and Hospital",
    "Nil Ratan Sircar Medical College and Hospital",
    "Calcutta National Medical College and Hospital",
  ],
  Bhubaneswar: [
    "AIIMS Bhubaneswar",
    "SCB Medical College and Hospital, Cuttack (serving Bhubaneswar)",
    "Capital Hospital, Bhubaneswar",
  ],
};

export default function CostEstimatorPage() {
  const [hospital, setHospital] = useState('');
  const [procedure, setProcedure] = useState('');
  const [estimate, setEstimate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !procedure.trim()) {
      toast({
        variant: 'destructive',
        description: 'Please select a hospital and describe the medical service.',
      });
      return;
    }

    setIsLoading(true);
    setEstimate('');
    const result = await runCostEstimator({ hospital, procedure });
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.estimate) {
      setEstimate(result.estimate);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Estimated Medical Expenditure</h1>
        <p className="mt-2 text-muted-foreground">
          Get an AI-powered cost estimate for services at government hospitals.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Cost Estimator</CardTitle>
            <CardDescription>
              Select a hospital and describe the service you need. Amrita, your AI assistant, will provide an estimate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="hospital-select" className="text-sm font-medium">Hospital</label>
                <Select value={hospital} onValueChange={setHospital}>
                  <SelectTrigger id="hospital-select">
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Kolkata</SelectLabel>
                      {hospitals.Kolkata.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Bhubaneswar</SelectLabel>
                      {hospitals.Bhubaneswar.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="procedure-desc" className="text-sm font-medium">Medical Procedure/Service</label>
                <Textarea
                  id="procedure-desc"
                  placeholder="e.g., General check-up, MRI scan for knee, appendicitis surgery..."
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={isLoading || !hospital || !procedure.trim()} className="w-full">
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <IndianRupee className="mr-2 h-4 w-4" />}
                Get Estimate
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    Amrita
                </CardTitle>
                 <CardDescription>Your AI Healthcare Assistant</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                 {isLoading ? (
                    <div className="flex flex-col items-center text-muted-foreground">
                        <Loader className="h-8 w-8 animate-spin mb-4" />
                        <p>Calculating estimate...</p>
                    </div>
                 ) : estimate ? (
                    <ScrollArea className="h-[250px] w-full pr-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{estimate}</ReactMarkdown>
                        </div>
                    </ScrollArea>
                 ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <p className="mb-2">I am Amrita, and I am here to help.</p>
                        <p className="text-xs">Your estimated cost will appear here.</p>
                    </div>
                 )}
            </CardContent>
             <CardContent className="pt-0">
                 <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                        <strong>Disclaimer:</strong> This is an AI-generated estimate based on available data and is intended for informational purposes only. It is not a quote or guarantee of final cost. Actual prices may vary. This information is not a substitute for professional medical or financial advice. Always consult with the hospital and your healthcare provider for precise cost information.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
