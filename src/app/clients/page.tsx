'use client';

import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      const supabase = createClient();

      const { data, error } = await supabase.from('clients').select('*').order('name');

      if (error) {
        setError(`Error loading clients: ${error.message}`);
        setLoading(false);
        return;
      }

      setClients(data || []);
      setLoading(false);
    }

    fetchClients();
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <div className="flex items-center justify-between">
        <DashboardPageHeader pageTitle="Clients" />
        <Button asChild>
          <Link href="/clients/add">Add New Client</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading clients...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && clients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No clients found. Add your first client to get started.</p>
              <Button className="mt-4" asChild>
                <Link href="/clients/add">Add New Client</Link>
              </Button>
            </div>
          )}

          {clients.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Phone</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b">
                      <td className="py-3 px-4">{client.name}</td>
                      <td className="py-3 px-4 capitalize">{client.client_type}</td>
                      <td className="py-3 px-4">{client.email || '—'}</td>
                      <td className="py-3 px-4">{client.phone || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clients/${client.id}`}>View</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clients/${client.id}/edit`}>Edit</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
