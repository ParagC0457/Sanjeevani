
'use client';

import { useState } from 'react';
import { runPrescriptionParser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Bot, Loader, ScanLine } from 'lucide-react';
import { type Medication } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

type AddMedicationDialogProps = {
  onAddMedication: (medication: Medication) => void;
  triggerButton?: React.ReactNode;
};

const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

export default function AddMedicationDialog({ onAddMedication, triggerButton }: AddMedicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [mealInstruction, setMealInstruction] = useState<'Before Meal' | 'After Meal' | 'With Meal' | undefined>();
  const [notes, setNotes] = useState('');
  const [medicationImage, setMedicationImage] = useState<File | null>(null);
  const [totalDoses, setTotalDoses] = useState('');

  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setDosage('');
    setFrequency('');
    setSelectedTimes([]);
    setMealInstruction(undefined);
    setNotes('');
    setMedicationImage(null);
    setPrescriptionFile(null);
    setTotalDoses('');
    setIsParsing(false);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !frequency) {
      toast({
        variant: 'destructive',
        description: 'Please fill out medication name, dosage, and frequency.',
      });
      return;
    }

    const processSubmit = (imageDataUri?: string) => {
        const newMedication: Medication = {
            id: crypto.randomUUID(),
            name,
            dosage,
            frequency,
            times: selectedTimes,
            status: 'Active',
            mealInstruction,
            notes,
            medicationImageUrl: imageDataUri,
            totalDoses: totalDoses ? parseInt(totalDoses, 10) : undefined,
            dosesTaken: totalDoses ? 0 : undefined,
        };
        onAddMedication(newMedication);
        toast({
            title: 'Medication Added',
            description: `${name} has been added to your list.`,
        });
        resetForm();
        setOpen(false);
    }
    
    if (medicationImage) {
        const reader = new FileReader();
        reader.readAsDataURL(medicationImage);
        reader.onload = () => {
            processSubmit(reader.result as string);
        };
        reader.onerror = () => {
            toast({
                variant: 'destructive',
                title: 'Image Read Error',
                description: 'Could not read the medication image file.',
            });
            processSubmit(undefined); // Submit without image
        };
    } else {
        processSubmit(undefined);
    }
  };

  const handlePrescriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPrescriptionFile(e.target.files[0]);
    }
  };

  const handleMedicationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setMedicationImage(e.target.files[0]);
    }
  };


  const handleParsePrescription = async () => {
    if (!prescriptionFile) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.readAsDataURL(prescriptionFile);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      const result = await runPrescriptionParser(dataUri);
      
      if (result.error || !result.data || result.data.medications.length === 0) {
        toast({
          variant: 'destructive',
          title: 'AI Parsing Failed',
          description: result.error || 'No medication details could be extracted. Please enter manually.',
        });
      } else {
        // For simplicity, we'll take the first medication found.
        const med = result.data.medications[0];
        setName(med.name);
        setDosage(med.dosage);
        setFrequency(med.frequency);
        setNotes(med.notes || '');

        if (med.mealInstruction) {
            const instruction = med.mealInstruction.toLowerCase();
            if (instruction.includes('before')) setMealInstruction('Before Meal');
            else if (instruction.includes('after')) setMealInstruction('After Meal');
            else if (instruction.includes('with')) setMealInstruction('With Meal');
        }

        toast({
          title: 'Prescription Parsed',
          description: 'Please review and confirm the extracted details.',
        });
      }
      setIsParsing(false);
    };
     reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the selected file.',
      });
      setIsParsing(false);
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Medication
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>
            Fill in the details below or upload a prescription to have AI assist you.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
            <div className="space-y-4">
                <div className="space-y-2 rounded-lg border bg-secondary/50 p-4">
                    <Label htmlFor="prescription-upload" className="flex items-center gap-2 font-semibold">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Prescription Scanner
                    </Label>
                    <div className="flex gap-2 items-center">
                        <Input id="prescription-upload" type="file" accept="image/*,.pdf" onChange={handlePrescriptionFileChange} className="flex-1"/>
                        <Button onClick={handleParsePrescription} disabled={!prescriptionFile || isParsing} size="sm" variant="secondary">
                            {isParsing ? <Loader className="animate-spin" /> : <ScanLine className="h-4 w-4"/>}
                            <span className="ml-2">Scan</span>
                        </Button>
                    </div>
                    {prescriptionFile && <p className="text-xs text-muted-foreground">Selected: {prescriptionFile.name}</p>}
                </div>

                <form id="medication-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Medication Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input id="dosage" placeholder="e.g., 10mg, 1 tablet" value={dosage} onChange={e => setDosage(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input id="frequency" placeholder="e.g., Once a day" value={frequency} onChange={e => setFrequency(e.target.value)} required />
                    </div>
                  </div>

                   <div className="space-y-2">
                        <Label htmlFor="total-doses">Total Doses (optional)</Label>
                        <Input id="total-doses" type="number" placeholder="e.g., 30" value={totalDoses} onChange={e => setTotalDoses(e.target.value)} />
                    </div>

                   <div className="space-y-2">
                    <Label>Take At (optional)</Label>
                    <div className="flex flex-wrap gap-4">
                      {timeSlots.map(time => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox
                            id={`time-${time}`}
                            checked={selectedTimes.includes(time)}
                            onCheckedChange={() => handleTimeChange(time)}
                          />
                          <Label htmlFor={`time-${time}`} className="font-normal">{time}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                   <div className="space-y-2">
                        <Label>Meal Instructions</Label>
                        <RadioGroup 
                            value={mealInstruction} 
                            onValueChange={(value) => setMealInstruction(value as any)} 
                            className="flex space-x-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Before Meal" id="meal-before" />
                                <Label htmlFor="meal-before">Before Meal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="After Meal" id="meal-after" />
                                <Label htmlFor="meal-after">After Meal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="With Meal" id="meal-with" />
                                <Label htmlFor="meal-with">With Meal</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea id="notes" placeholder="e.g., Do not operate heavy machinery..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="med-photo">Medication Photo (optional)</Label>
                        <Input id="med-photo" type="file" accept="image/*" onChange={handleMedicationImageChange} />
                        {medicationImage && <p className="text-xs text-muted-foreground">Selected: {medicationImage.name}</p>}
                    </div>
                </form>
            </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="medication-form">Save Medication</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
