
export type Document = {
  id: string;
  name: string;
  type: string;
  date: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  status: 'Active' | 'Inactive' | 'Upcoming';
  mealInstruction?: 'Before Meal' | 'After Meal' | 'With Meal';
  notes?: string;
  medicationImageUrl?: string; // Should be a data URI
  totalDoses?: number;
  dosesTaken?: number;
}

export type Symptom = {
  id: string;
  date: string;
  description: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
};

export type Biodata = {
  dob?: string;
  height?: string;
  weight?: string;
  bloodPressure?: string;
  bloodSugar?: string;
  conditions?: string;
};
