
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { differenceInYears, format, isValid, parse } from 'date-fns';

const PROFILE_STORAGE_KEY = 'userProfile';

export default function ProfilePage() {
  const { toast } = useToast();
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [gender, setGender] = useState('');
  const [dobString, setDobString] = useState(''); // YYYY-MM-DD
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const data = JSON.parse(storedProfile);
        setName(data.name || 'Jane Doe');
        setEmail(data.email || 'jane.doe@example.com');
        setPhone(data.phone || '+1 (555) 123-4567');
        setGender(data.gender || '');
        if (data.dob) {
            const dob = new Date(data.dob);
            if (isValid(dob)) {
                setDobString(format(dob, 'yyyy-MM-dd'));
            }
        }
      }
    } catch (error) {
      console.error('Failed to load profile from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (dobString) {
        const birthDate = parse(dobString, 'yyyy-MM-dd', new Date());
        if (isValid(birthDate)) {
            setAge(differenceInYears(new Date(), birthDate));
        } else {
            setAge(null);
        }
    } else {
        setAge(null);
    }
  }, [dobString]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let dob;
      if (dobString) {
          const birthDate = parse(dobString, 'yyyy-MM-dd', new Date());
          if (isValid(birthDate)) {
              dob = birthDate.toISOString();
          }
      }
      const profileData = { name, email, phone, gender, dob };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      toast({
        title: 'Profile Saved',
        description: 'Your personal information has been updated.',
      });
    } catch (error) {
      console.error('Failed to save profile to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your information.',
      });
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Your Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal account details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal details. This information helps in providing tailored health advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input 
                        id="dob" 
                        type="date" 
                        value={dobString} 
                        onChange={e => setDobString(e.target.value)} 
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" value={age !== null ? age : 'N/A'} readOnly disabled />
                </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
