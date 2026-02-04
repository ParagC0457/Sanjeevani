
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShieldCheck, Heart, Scale, TrendingUp, AlertTriangle, Newspaper } from 'lucide-react';

// Mock data, to be replaced with real data later
const recommendedVaccines = [
  { name: 'Influenza (Flu)', details: 'Recommended annually for all ages.' },
  { name: 'Tetanus, Diphtheria, Pertussis (Tdap)', details: 'Booster recommended every 10 years.' },
  { name: 'COVID-19', details: 'Stay up-to-date with the latest booster recommendations.' },
];

const governmentAlerts = [
    {
        id: 1,
        title: 'Seasonal Flu Advisory Issued',
        date: '2023-10-15',
        summary: 'Health officials advise all citizens, especially the elderly and children, to get the annual flu vaccine as peak season approaches.',
    },
    {
        id: 2,
        title: 'New Guidelines for Drinking Water Safety',
        date: '2023-10-10',
        summary: 'The national health agency has released new guidelines for ensuring drinking water is safe from common contaminants. Public advisories are being sent to all districts.',
    }
];

export default function HealthHubPage() {
  const [biodata, setBiodata] = useState({
    age: null,
    gender: 'N/A',
    height: 'N/A',
    weight: 'N/A',
  });

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('userProfile');
      const storedBiodata = localStorage.getItem('userBiodata');

      let age = null;
      let gender = 'N/A';
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        gender = profile.gender || 'N/A';
        if (profile.dob) {
          const birthDate = new Date(profile.dob);
          age = new Date().getFullYear() - birthDate.getFullYear();
        }
      }

      let height = 'N/A';
      let weight = 'N/A';
      if (storedBiodata) {
        const data = JSON.parse(storedBiodata);
        height = data.height ? `${data.height} cm` : 'N/A';
        weight = data.weight ? `${data.weight} kg` : 'N/A';
      }

      setBiodata({ age, gender, height, weight });
    } catch (error) {
      console.error('Failed to load user data from localStorage', error);
    }
  }, []);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Health Alerts</h1>
        <p className="mt-2 text-muted-foreground">
          Stay informed with personalized health alerts and news.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Biodata Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <User /> Your Health Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground"><Heart className="h-4 w-4"/> Age</div>
              <div className="font-semibold">{biodata.age ?? 'N/A'}</div>
            </div>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4"/> Gender</div>
              <div className="font-semibold">{biodata.gender}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4"/> Height</div>
              <div className="font-semibold">{biodata.height}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground"><Scale className="h-4 w-4"/> Weight</div>
              <div className="font-semibold">{biodata.weight}</div>
            </div>
          </CardContent>
        </Card>

        {/* Vaccine Recommendations Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ShieldCheck /> Recommended Vaccines
            </CardTitle>
            <CardDescription>Based on general guidelines. Consult your doctor for personalized advice.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recommendedVaccines.map((vaccine, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-full mt-1">
                         <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">{vaccine.name}</p>
                        <p className="text-sm text-muted-foreground">{vaccine.details}</p>
                    </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Government Alerts Section */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Newspaper /> Health News & Alerts
            </CardTitle>
            <CardDescription>Latest health announcements from government sources.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {governmentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/50">
                    <div className="p-2 bg-destructive/10 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Posted on: {alert.date}</p>
                        <p className="text-sm">{alert.summary}</p>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>

    </div>
  );
}
