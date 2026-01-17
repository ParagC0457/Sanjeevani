
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Inbox } from 'lucide-react';
import type { Document } from '@/lib/types';

type DocumentListProps = {
  documents: Document[];
};

export default function DocumentList({ documents }: DocumentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Documents</CardTitle>
        <CardDescription>A list of your recently uploaded medical documents.</CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {doc.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </TableCell>
                  <TableCell>{doc.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <Inbox className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No Documents Yet</h3>
            <p className="text-sm">Upload a document to see it here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
