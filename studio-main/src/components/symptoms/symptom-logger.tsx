
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import { type Symptom } from '@/lib/types';

type SymptomLoggerProps = {
  onAddSymptom: (symptom: Omit<Symptom, 'id' | 'date'>) => boolean;
};

export default function SymptomLogger({ onAddSymptom }: SymptomLoggerProps) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        description: 'Please describe your symptom.',
      });
      return;
    }

    const success = onAddSymptom({ description, severity });

    if (success) {
      toast({
        title: 'Symptom Logged',
        description: 'Your new symptom has been saved to your history.',
      });
      // Clear the form
      setDescription('');
      setSeverity('Mild');
    } else {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the symptom. Please try again.',
      });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Log a New Symptom</CardTitle>
          <CardDescription>Record how you're feeling right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symptom-description">Describe your symptom(s)</Label>
            <Textarea
              id="symptom-description"
              placeholder="e.g., Sharp pain in my lower back"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <RadioGroup 
              value={severity} 
              onValueChange={(value) => setSeverity(value as any)} 
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Mild" id="sev-mild" />
                <Label htmlFor="sev-mild">Mild</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Moderate" id="sev-moderate" />
                <Label htmlFor="sev-moderate">Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Severe" id="sev-severe" />
                <Label htmlFor="sev-severe">Severe</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Log Symptom
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
