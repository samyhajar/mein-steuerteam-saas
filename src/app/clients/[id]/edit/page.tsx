'use client';

import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import { AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const clientId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Client form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clientType, setClientType] = useState('monthly');

  useEffect(() => {
    async function fetchClient() {
      const supabase = createClient();

      const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single();

      if (error) {
        setError(`Error loading client: ${error.message}`);
        setIsLoadingClient(false);
        return;
      }

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setCompanyName(data.name !== `${data.first_name} ${data.last_name}` ? data.name : '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setClientType(data.client_type || 'monthly');
      }

      setIsLoadingClient(false);
    }

    fetchClient();
  }, [clientId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!firstName || !lastName) {
      setError('First name and last name are required');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('clients')
        .update({
          first_name: firstName,
          last_name: lastName,
          name: companyName || `${firstName} ${lastName}`,
          email,
          phone,
          client_type: clientType,
        })
        .eq('id', clientId);

      if (error) {
        setError(`Error updating client: ${error.message}`);
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Client Updated',
        description: `${firstName} ${lastName} has been updated successfully.`,
      });

      // Redirect to client detail page
      router.push(`/clients/${clientId}`);
    } catch (err) {
      setError('An error occurred while updating the client');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteClient() {
    if (deleteConfirmation !== 'delete') {
      return;
    }

    setIsDeleting(true);

    try {
      const supabase = createClient();

      // First, find any auth user linked to this client through client_users
      const { data: clientUser } = await supabase
        .from('client_users')
        .select('user_id')
        .eq('client_id', clientId)
        .maybeSingle();

      // Delete the client_users record if it exists
      if (clientUser) {
        await supabase.from('client_users').delete().eq('client_id', clientId);
      }

      // Delete any documents associated with the client
      await supabase.from('documents').delete().eq('client_id', clientId);

      // Delete the client record
      const { error } = await supabase.from('clients').delete().eq('id', clientId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Client Deleted',
        description: `${firstName} ${lastName} has been deleted successfully.`,
      });

      // Redirect to clients list
      router.push('/clients');
      router.refresh();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to delete client: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  if (isLoadingClient) return <div className="p-4">Loading client...</div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle="Edit Client" />

      <div className="container max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name (if applicable)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter client email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter client phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-type">Client Type *</Label>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger id="client-type">
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 justify-between">
                <Button type="button" variant="destructive" onClick={() => setShowCustomModal(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Client
                </Button>

                <div className="flex gap-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/clients/${clientId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-destructive mr-2" />
              <h3 className="text-lg font-bold">Are you absolutely sure?</h3>
            </div>
            <p className="mb-4">
              This action cannot be undone. This will permanently delete the client{' '}
              <strong>
                {firstName} {lastName}
              </strong>{' '}
              and all associated data.
            </p>
            <div className="mb-6">
              <label className="block mb-2">
                Type <strong>delete</strong> to confirm:
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type 'delete' to confirm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCustomModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClient}
                disabled={deleteConfirmation !== 'delete' || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Client'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
