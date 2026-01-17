
import HealthFeed from '@/components/dashboard/health-feed';
import SymptomChecker from '@/components/dashboard/symptom-checker';
import TodaysMedications from '@/components/dashboard/todays-medications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <HealthFeed />
        </div>
        <div className="lg:col-span-1">
          <TodaysMedications />
        </div>
      </div>
      <div className="mx-auto w-full">
        <Card id="symptom-checker">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">Amrita – Your Personal Healthcare Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <SymptomChecker />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
