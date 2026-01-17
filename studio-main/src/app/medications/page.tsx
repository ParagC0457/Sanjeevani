'use client';

import { useState, useEffect } from 'react';
import MedicationList from '@/components/medications/medication-list';
import { type Medication } from '@/lib/types';

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    try {
      const storedMeds = localStorage.getItem('userMedications');
      if (storedMeds) {
        setMedications(JSON.parse(storedMeds));
      }
    } catch (error) {
      console.error('Failed to load medications from localStorage', error);
    }
  }, []);

  const handleMedicationUpdate = (updatedMedications: Medication[]) => {
    try {
      setMedications(updatedMedications);
      localStorage.setItem('userMedications', JSON.stringify(updatedMedications));
    } catch (error) {
      console.error('Failed to save medications to localStorage', error);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Medication Reminders</h1>
        <p className="mt-2 text-muted-foreground">
          Stay on top of your medication and vaccination schedule.
        </p>
      </div>
      <MedicationList
        medications={medications}
        onMedicationUpdate={handleMedicationUpdate}
      />
    </div>
  );
}
