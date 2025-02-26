'use client';

import ClientSidebar from '@/components/dashboard/layout/client-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [accountantData, setAccountantData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: client } = await supabase.from('clients').select('*').eq('user_id', user.id).single();

      console.log('Client data structure:', Object.keys(client || {}));
      console.log('Client data values:', client);

      if (client) {
        setClientData(client);

        // Get accountant details if needed
        if (client.accountant_id) {
          const { data: accountant } = await supabase
            .from('accountant_profiles')
            .select('*')
            .eq('id', client.accountant_id)
            .single();

          console.log('Accountant data retrieved:', accountant);
          setAccountantData(accountant);
        }
      }

      setIsLoading(false);
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Format the client type for display
  const clientTypeDisplay = () => {
    if (!clientData?.client_type) return '-';

    const type = clientData.client_type.toLowerCase();
    if (type === 'monthly') return 'Monthly';
    if (type === 'quarterly') return 'Quarterly';
    if (type === 'yearly') return 'Yearly';
    return clientData.client_type;
  };

  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-bold mb-6">Welcome, {clientData?.first_name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <p className="text-sm text-muted-foreground">Name:</p>
                <p>
                  {clientData?.first_name || ''} {clientData?.last_name || ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <p className="text-sm text-muted-foreground">Email:</p>
                <p>{clientData?.email || ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <p className="text-sm text-muted-foreground">Phone:</p>
                <p>{clientData?.phone || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <p className="text-sm text-muted-foreground">Company:</p>
                <p>{clientData?.name || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <p className="text-sm text-muted-foreground">Client Type:</p>
                <p>{clientTypeDisplay()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  • Go to{' '}
                  <a href="/client/documents" className="text-blue-600 hover:underline">
                    Documents
                  </a>{' '}
                  to upload your files
                </p>
                <p>
                  • Check your{' '}
                  <a href="/client/settings" className="text-blue-600 hover:underline">
                    Settings
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Your Accountant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {accountantData ? (
                <>
                  <div className="grid grid-cols-2 gap-1">
                    <p className="text-sm text-muted-foreground">Name:</p>
                    <p>
                      {accountantData.first_name || ''} {accountantData.last_name || ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <p className="text-sm text-muted-foreground">Email:</p>
                    <p>{accountantData.email || ''}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <p className="text-sm text-muted-foreground">Phone:</p>
                    <p>{accountantData.phone || '-'}</p>
                  </div>
                </>
              ) : (
                <p>-</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-slate-800 text-white rounded overflow-auto max-h-96">
          <h2 className="text-xl font-bold mb-4">Debug Data</h2>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(clientData, null, 2)}</pre>
        </div>
      </main>
    </div>
  );
}
