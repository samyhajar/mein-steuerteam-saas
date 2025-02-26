'use client';

import ClientSidebar from '@/components/dashboard/layout/client-sidebar';
import { DocumentUploadArea } from '@/components/document-upload-area';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function ClientDocumentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    async function fetchClientData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: clientUser } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .single();

      if (clientUser) {
        const { data: client } = await supabase.from('clients').select('*').eq('id', clientUser.client_id).single();
        setClientData(client);
      }

      setIsLoading(false);
    }

    fetchClientData();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-bold mb-6">Document Upload</h1>
        <p className="mb-6">Upload your documents for review by your accountant.</p>

        <div className="grid grid-cols-1 gap-8">
          <DocumentUploadArea title="Einzahlungen" description="Upload payment receipts and deposit documents" />

          <DocumentUploadArea title="Ausgaben" description="Upload expense receipts and invoices" />

          <DocumentUploadArea title="Bank Reports" description="Upload bank statements and reports" />

          <DocumentUploadArea title="Sonstiges" description="Upload any other relevant documents" />
        </div>
      </main>
    </div>
  );
}
