
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, Trash2, Edit, BellOff, Info, Plus, Minus } from 'lucide-react';
import { type Medication } from '@/lib/types';
import AddMedicationDialog from './add-medication-dialog';
import EditMedicationDialog from './edit-medication-dialog';
import Image from 'next/image';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type MedicationListProps = {
  medications: Medication[];
  onMedicationUpdate: (medications: Medication[]) => void;
};

export default function MedicationList({ medications, onMedicationUpdate }: MedicationListProps) {
  
  const addMedication = (newMed: Medication) => {
    const updatedMeds = [...medications, newMed];
    onMedicationUpdate(updatedMeds);
  };

  const updateMedication = (updatedMed: Medication) => {
    const updatedMeds = medications.map(med => (med.id === updatedMed.id ? updatedMed : med));
    onMedicationUpdate(updatedMeds);
  };

  const deleteMedication = (id: string) => {
    const updatedMeds = medications.filter(med => med.id !== id);
    onMedicationUpdate(updatedMeds);
  };

  const handleDoseChange = (id: string, change: 1 | -1) => {
    const updatedMeds = medications.map(med => {
      if (med.id === id && med.dosesTaken !== undefined) {
        const newDosesTaken = med.dosesTaken + change;
        if (newDosesTaken >= 0 && (med.totalDoses === undefined || newDosesTaken <= med.totalDoses)) {
          return { ...med, dosesTaken: newDosesTaken };
        }
      }
      return med;
    });
    onMedicationUpdate(updatedMeds);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Medications</CardTitle>
          <CardDescription>
            A list of your current medications and upcoming vaccines.
          </CardDescription>
        </div>
        <AddMedicationDialog onAddMedication={addMedication} />
      </CardHeader>
      <CardContent>
        {medications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Doses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map(med => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {med.medicationImageUrl ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary">
                              <Image src={med.medicationImageUrl} alt={med.name} fill className="object-cover" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{med.name}</DialogTitle>
                            </DialogHeader>
                            <div className="relative aspect-square w-full">
                                <Image src={med.medicationImageUrl} alt={med.name} fill className="object-contain rounded-md" />
                            </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                        <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    <span>{med.name}</span>
                    {(med.notes || med.mealInstruction) && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    {med.mealInstruction && <p><strong>Instruction:</strong> {med.mealInstruction}</p>}
                                    {med.notes && <p><strong>Notes:</strong> {med.notes}</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>{med.dosage}</TableCell>
                  <TableCell>
                    {med.totalDoses !== undefined && med.dosesTaken !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleDoseChange(med.id, -1)} disabled={med.dosesTaken <= 0}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{med.dosesTaken} / {med.totalDoses}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleDoseChange(med.id, 1)} disabled={med.dosesTaken >= med.totalDoses}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={med.status === 'Active' ? 'default' : 'secondary'}>
                      {med.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <EditMedicationDialog medication={med} onUpdateMedication={updateMedication}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </EditMedicationDialog>
                     <Button variant="ghost" size="icon" onClick={() => deleteMedication(med.id)}>
                       <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <BellOff className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No Medications Added</h3>
            <p className="text-sm">Click "Add Medication" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
