
'use client';

import { useState } from 'react';
import { runReportSummary } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Loader, Save } from 'lucide-react';
import type { Document } from '@/lib/types';

type ReportSummarizerProps = {
  onDocumentAdded: (document: Document) => void;
};

export default function ReportSummarizer({ onDocumentAdded }: ReportSummarizerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setSummary(''); // Reset summary
      setIsSaved(false); // Reset saved state
    }
  };

  const handleSummarize = async () => {
    if (!file) {
      toast({ variant: 'destructive', description: 'Please select a file first.' });
      return;
    }
    if (!documentType) {
      toast({ variant: 'destructive', description: 'Please select a document type.' });
      return;
    }
    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!acceptedTypes.includes(file.type)) {
       toast({ variant: 'destructive', description: 'Please upload a valid PDF, JPG, or PNG file.' });
       return;
    }

    setIsLoading(true);
    setSummary('');
    setIsSaved(false);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      const result = await runReportSummary(dataUri);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Summarization Failed',
          description: result.error,
        });
      } else if (result.summary) {
        setSummary(result.summary);
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the selected file.',
      });
      setIsLoading(false);
    };
  };

  const handleSaveDocument = () => {
    if (!file || !documentType) return;
    
    const newDoc: Document = {
      id: crypto.randomUUID(),
      name: file.name,
      type: documentType,
      date: new Date().toISOString().split('T')[0], // Get YYYY-MM-DD
    };
    onDocumentAdded(newDoc);
    setIsSaved(true);
    toast({
        title: 'Document Saved',
        description: `${file.name} has been added to your documents.`,
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Explain My Report</CardTitle>
        <CardDescription>Upload a medical report (PDF, JPG, PNG) to get a simplified summary.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-upload">Upload Document</Label>
          <Input id="report-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
          {file && <p className="mt-2 text-sm text-muted-foreground">Selected: {file.name}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select onValueChange={(value) => { setDocumentType(value); setIsSaved(false); }} value={documentType}>
                <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Lab Report">Lab Report</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        {summary && (
          <Card className="bg-secondary">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
               <div className="p-2 rounded-full bg-accent text-accent-foreground">
                 <Bot size={18} />
               </div>
               <div className="flex-1">
                <CardTitle className="text-base">AI Summary</CardTitle>
                <CardDescription>Here is a simplified explanation of your report.</CardDescription>
               </div>
               <Button onClick={handleSaveDocument} disabled={isSaved} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  {isSaved ? 'Saved' : 'Save Document'}
               </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{summary}</p>
            </CardContent>
          </Card>
        )}
         {isLoading && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                <span>Analyzing report...</span>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSummarize} disabled={!file || !documentType || isLoading} className="w-full">
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
          Summarize
        </Button>
      </CardFooter>
    </Card>
  );
}
