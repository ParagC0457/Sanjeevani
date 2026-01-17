'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

export default function UserProfileForm() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically handle form submission to a backend.
        // For this demo, we'll just show a success toast.
        toast({
            title: 'Profile Saved',
            description: 'Your health information has been updated.',
        });
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" placeholder="e.g., 35" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input id="height" type="number" placeholder="e.g., 175" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" type="number" placeholder="e.g., 70" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="blood-pressure">Blood Pressure (Systolic/Diastolic)</Label>
          <Input id="blood-pressure" placeholder="e.g., 120/80" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood-sugar">Blood Sugar (mg/dL)</Label>
          <Input id="blood-sugar" type="number" placeholder="e.g., 90" />
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="conditions">Existing Conditions</Label>
          <Textarea id="conditions" placeholder="e.g., Asthma, Type 2 Diabetes" />
        </div>

      <div className="flex justify-end">
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
