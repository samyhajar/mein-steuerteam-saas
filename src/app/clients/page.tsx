'use client';

import { AccountantSidebar } from '@/components/dashboard/layout/accountant-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Accountant Portal</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`md:block ${isMobileMenuOpen ? 'block' : 'hidden'} z-20`}>
        <AccountantSidebar />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-8 mt-12 md:mt-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Clients</h1>
            <Link href="/clients/new">
              <Button>Add New Client</Button>
            </Link>
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
        </div>
      </main>
    </div>
  );
}
