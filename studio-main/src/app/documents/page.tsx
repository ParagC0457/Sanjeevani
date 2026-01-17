
'use client';

import { useState, useEffect } from 'react';
import ReportSummarizer from '@/components/documents/report-summarizer';
import DocumentList from '@/components/documents/document-list';
import type { Document } from '@/lib/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem('userDocuments');
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error('Failed to load documents from localStorage', error);
    }
  }, []);

  const addDocument = (newDocument: Document) => {
    try {
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      localStorage.setItem('userDocuments', JSON.stringify(updatedDocuments));
    } catch (error) {
      console.error('Failed to save document to localStorage', error);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Document Center</h1>
        <p className="mt-2 text-muted-foreground">
          Upload, manage, and understand your medical documents.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ReportSummarizer onDocumentAdded={addDocument} />
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
