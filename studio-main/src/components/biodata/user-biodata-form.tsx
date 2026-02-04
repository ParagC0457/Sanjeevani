
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';
import { type Biodata } from '@/lib/types';
import { differenceInYears, isValid, parse } from 'date-fns';

const BIODATA_STORAGE_KEY = 'userBiodata';
const PROFILE_STORAGE_KEY = 'userProfile';

export default function UserBiodataForm() {
    const { toast } = useToast();
    
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bloodPressure, setBloodPressure] = useState('');
    const [bloodSugar, setBloodSugar] = useState('');
    const [conditions, setConditions] = useState('');

    // State for profile data to be displayed read-only
    const [age, setAge] = useState<number | null>(null);
    const [gender, setGender] = useState('');

    useEffect(() => {
        // Load Biodata
        try {
            const storedData = localStorage.getItem(BIODATA_STORAGE_KEY);
            if (storedData) {
                const data: Biodata = JSON.parse(storedData);
                setHeight(data.height || '');
                setWeight(data.weight || '');
                setBloodPressure(data.bloodPressure || '');
                setBloodSugar(data.bloodSugar || '');
                setConditions(data.conditions || '');
            }
        } catch (error) {
            console.error('Failed to load biodata from localStorage', error);
        }

        // Load Profile data for display
        try {
            const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
            if (storedProfile) {
                const data = JSON.parse(storedProfile);
                setGender(data.gender || '');
                if (data.dob) {
                    const birthDate = new Date(data.dob);
                    if (isValid(birthDate)) {
                        setAge(differenceInYears(new Date(), birthDate));
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load profile data for biodata form', error);
        }
    }, []);
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const biodata: Biodata = {
                height,
                weight,
                bloodPressure,
                bloodSugar,
                conditions,
            };
            localStorage.setItem(BIODATA_STORAGE_KEY, JSON.stringify(biodata));
            toast({
                title: 'Biodata Saved',
                description: 'Your health information has been updated.',
            });
        } catch (error) {
            console.error('Failed to save biodata to localStorage', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not save your information.',
            });
        }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" value={age !== null ? age : 'N/A'} readOnly disabled />
        </div>
         <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input id="gender" value={gender || 'N/A'} readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input id="height" type="number" placeholder="e.g., 175" value={height} onChange={e => setHeight(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" type="number" placeholder="e.g., 70" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood-pressure">Blood Pressure (Systolic/Diastolic)</Label>
          <Input id="blood-pressure" placeholder="e.g., 120/80" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood-sugar">Blood Sugar (mg/dL)</Label>
          <Input id="blood-sugar" type="number" placeholder="e.g., 90" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} />
        </div>
         <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="conditions">Existing Conditions</Label>
          <Textarea id="conditions" placeholder="e.g., Asthma, Type 2 Diabetes" value={conditions} onChange={e => setConditions(e.target.value)} />
        </div>
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
