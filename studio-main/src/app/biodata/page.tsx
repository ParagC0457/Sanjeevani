
'use client';

import { useState, useEffect } from 'react';
import UserBiodataForm from '@/components/biodata/user-biodata-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SymptomLogger from '@/components/symptoms/symptom-logger';
import SymptomHistory from '@/components/symptoms/symptom-history';
import { type Symptom } from '@/lib/types';

export default function HealthTrackingPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  useEffect(() => {
    try {
      const storedSymptoms = localStorage.getItem('userSymptoms');
      if (storedSymptoms) {
        setSymptoms(JSON.parse(storedSymptoms));
      }
    } catch (error) {
      console.error('Failed to load symptoms from localStorage', error);
    }
  }, []);

  const addSymptom = (newSymptom: Omit<Symptom, 'id' | 'date'>) => {
    try {
      const symptomWithId: Symptom = {
        ...newSymptom,
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };
      const updatedSymptoms = [...symptoms, symptomWithId];
      setSymptoms(updatedSymptoms);
      localStorage.setItem('userSymptoms', JSON.stringify(updatedSymptoms));
      return true;
    } catch (error) {
      console.error('Failed to save symptom to localStorage', error);
      return false;
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Health Tracking</h1>
        <p className="mt-2 text-muted-foreground">
          Keep your health information and symptoms up-to-date.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Health Biodata</CardTitle>
          <CardDescription>
            This information helps provide tailored health advice. It is stored securely and is never shared.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserBiodataForm />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SymptomLogger onAddSymptom={addSymptom} />
        </div>
        <div className="lg:col-span-2">
          <SymptomHistory symptoms={symptoms} />
        </div>
      </div>
    </div>
  );
}
