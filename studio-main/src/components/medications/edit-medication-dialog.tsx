
'use client';

import { useState, useEffect } from 'react';
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
import { type Medication } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

type EditMedicationDialogProps = {
  medication: Medication;
  onUpdateMedication: (medication: Medication) => void;
  children: React.ReactNode;
};

const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

export default function EditMedicationDialog({ medication, onUpdateMedication, children }: EditMedicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [mealInstruction, setMealInstruction] = useState<'Before Meal' | 'After Meal' | 'With Meal' | undefined>();
  const [notes, setNotes] = useState('');
  const [medicationImage, setMedicationImage] = useState<File | null>(null);
  const [medicationImageUrl, setMedicationImageUrl] = useState<string | undefined>();
  const [totalDoses, setTotalDoses] = useState('');
  const [dosesTaken, setDosesTaken] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage);
      setFrequency(medication.frequency);
      setSelectedTimes(medication.times);
      setMealInstruction(medication.mealInstruction);
      setNotes(medication.notes || '');
      setMedicationImageUrl(medication.medicationImageUrl);
      setTotalDoses(medication.totalDoses?.toString() || '');
      setDosesTaken(medication.dosesTaken?.toString() || '');
    }
  }, [medication]);

  const handleTimeChange = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleMedicationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setMedicationImage(e.target.files[0]);
    }
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

    const processSubmit = (newImageDataUri?: string) => {
        const updatedMedication: Medication = {
            ...medication,
            name,
            dosage,
            frequency,
            times: selectedTimes,
            mealInstruction,
            notes,
            medicationImageUrl: newImageDataUri === null ? undefined : (newImageDataUri || medicationImageUrl),
            totalDoses: totalDoses ? parseInt(totalDoses, 10) : undefined,
            dosesTaken: dosesTaken ? parseInt(dosesTaken, 10) : 0,
        };
        onUpdateMedication(updatedMedication);
        toast({
            title: 'Medication Updated',
            description: `${name} has been updated.`,
        });
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
                description: 'Could not read the new medication image file.',
            });
             processSubmit(); // Submit without changing image
        };
    } else {
        processSubmit();
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Medication</DialogTitle>
          <DialogDescription>
            Update the details for your medication.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
            <form id="edit-medication-form" onSubmit={handleSubmit} className="space-y-4 py-4">
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

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="total-doses">Total Doses</Label>
                      <Input id="total-doses" type="number" placeholder="e.g., 30" value={totalDoses} onChange={e => setTotalDoses(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="doses-taken">Doses Taken</Label>
                      <Input id="doses-taken" type="number" placeholder="e.g., 10" value={dosesTaken} onChange={e => setDosesTaken(e.target.value)} />
                  </div>
              </div>


               <div className="space-y-2">
                <Label>Take At (optional)</Label>
                <div className="flex flex-wrap gap-4">
                  {timeSlots.map(time => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-time-${time}`}
                        checked={selectedTimes.includes(time)}
                        onCheckedChange={() => handleTimeChange(time)}
                      />
                      <Label htmlFor={`edit-time-${time}`} className="font-normal">{time}</Label>
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
                            <RadioGroupItem value="Before Meal" id="edit-meal-before" />
                            <Label htmlFor="edit-meal-before">Before Meal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="After Meal" id="edit-meal-after" />
                            <Label htmlFor="edit-meal-after">After Meal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="With Meal" id="edit-meal-with" />
                            <Label htmlFor="edit-meal-with">With Meal</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea id="notes" placeholder="e.g., Do not operate heavy machinery..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="med-photo">Change Medication Photo (optional)</Label>
                    <Input id="med-photo" type="file" accept="image/*" onChange={handleMedicationImageChange} />
                    {medicationImage ? <p className="text-xs text-muted-foreground">New: {medicationImage.name}</p> : (medicationImageUrl && <p className="text-xs text-muted-foreground">Current image is saved.</p>)}
                </div>
            </form>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="edit-medication-form">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
