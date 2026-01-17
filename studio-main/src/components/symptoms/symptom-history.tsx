import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type Symptom } from '@/lib/types';
import { Thermometer } from 'lucide-react';


type SymptomHistoryProps = {
    symptoms: Symptom[];
}

const severityColors: { [key: string]: 'secondary' | 'default' | 'destructive' } = {
  Mild: 'secondary',
  Moderate: 'default',
  Severe: 'destructive',
};

export default function SymptomHistory({ symptoms }: SymptomHistoryProps) {
  // Sort symptoms by date, most recent first
  const sortedSymptoms = [...symptoms].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptom Log</CardTitle>
        <CardDescription>A record of your previously logged symptoms.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedSymptoms.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symptom</TableHead>
                <TableHead>Severity</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedSymptoms.map((entry) => (
                <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="font-medium">{entry.description}</TableCell>
                    <TableCell>
                    <Badge variant={severityColors[entry.severity] || 'default'}>{entry.severity}</Badge>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <Thermometer className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No Symptoms Logged</h3>
                <p className="text-sm">Use the form to log a new symptom.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
