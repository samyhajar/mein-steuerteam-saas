'use client';

import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClient() {
      const supabase = createClient();

      const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single();

      if (error) {
        setError(`Error loading client: ${error.message}`);
        setLoading(false);
        return;
      }

      setClient(data);
      setLoading(false);
    }

    fetchClient();
  }, [clientId]);

  if (loading) return <div className="p-4">Loading client details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!client) return <div className="p-4">Client not found</div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={`Client: ${client.name}`} />

      <div className="container max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client Details</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/clients">Back to Clients</Link>
              </Button>
              <Button asChild>
                <Link href={`/clients/${clientId}/edit`}>Edit Client</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{client.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 capitalize">{client.client_type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{client.email || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{client.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Add more sections as needed, like documents, etc. */}
            <div className="mt-8">
              <h3 className="text-lg font-medium">Documents</h3>
              <p className="text-gray-500 mt-2">No documents uploaded yet.</p>
              <Button className="mt-4" variant="outline">
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
