
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Medication } from '@/lib/types';
import { Pill, Sun, Sunrise, Sunset, Moon, BellOff } from 'lucide-react';
import { format } from 'date-fns';

const timeIcons = {
  Morning: <Sun className="h-5 w-5 text-yellow-500" />,
  Afternoon: <Sunrise className="h-5 w-5 text-orange-500" />,
  Evening: <Sunset className="h-5 w-5 text-purple-500" />,
  Night: <Moon className="h-5 w-5 text-blue-500" />,
};

export default function TodaysMedications() {
  const [todaysMeds, setTodaysMeds] = useState<Medication[]>([]);

  const loadMedications = useCallback(() => {
    try {
      const storedMeds = localStorage.getItem('userMedications');
      if (storedMeds) {
        const allMeds: Medication[] = JSON.parse(storedMeds);
        const activeMeds = allMeds.filter(med => med.status === 'Active');
        setTodaysMeds(activeMeds);
      } else {
        setTodaysMeds([]);
      }
    } catch (error) {
      console.error('Failed to load medications from localStorage', error);
      setTodaysMeds([]);
    }
  }, []);


  useEffect(() => {
    loadMedications();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userMedications') {
        loadMedications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadMedications]);

  const getMedsByTime = (time: 'Morning' | 'Afternoon' | 'Evening' | 'Night') => {
    return todaysMeds.filter(med => med.times.includes(time));
  };

  const timeSlots: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[] = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const hasMeds = todaysMeds.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Today's Medications</CardTitle>
        <CardDescription>{format(new Date(), 'EEEE, MMMM d')}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasMeds ? (
          <div className="space-y-6">
            {timeSlots.map(time => {
              const meds = getMedsByTime(time);
              if (meds.length === 0) return null;
              return (
                <div key={time} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {timeIcons[time]}
                    <h4 className="font-semibold">{time}</h4>
                  </div>
                  <ul className="space-y-2 pl-7">
                    {meds.map(med => (
                      <li key={med.id} className="flex items-start gap-2 text-sm">
                         <Pill className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-secondary-foreground">{med.name}</p>
                          <p className="text-muted-foreground">{med.dosage} - {med.frequency}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <BellOff className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No Active Medications</h3>
            <p className="text-sm">Add your medications to see your schedule here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
