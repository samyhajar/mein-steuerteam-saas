'use client';

import { createClientRecord } from '@/app/clients/actions';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clientType, setClientType] = useState('monthly');
  const [password, setPassword] = useState('');

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

      // Get the current user's session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Get the accountant profile
      const { data: profile } = await supabase
        .from('accountant_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        setError('User profile not found');
        setIsLoading(false);
        return;
      }

      // Create the client using the server action
      const result = await createClientRecord({
        firstName,
        lastName,
        companyName,
        email,
        phone,
        clientType,
        accountantId: profile.id,
        password,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create client');
        setIsLoading(false);
        return;
      }

      if (result.warning) {
        toast({
          title: 'Client Created with Warning',
          description: result.warning,
          variant: 'destructive',
        });
      } else if (result.invitationSent) {
        toast({
          title: 'Client Created',
          description: `${firstName} ${lastName} has been invited to set up their account.`,
        });
      } else {
        toast({
          title: 'Client Created',
          description: `${firstName} ${lastName} has been added successfully.`,
        });
      }

      // Redirect to clients list
      router.push('/clients');
      router.refresh();
    } catch (err) {
      setError('An error occurred while creating the client');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Add New Client'} />

      <div className="container max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
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
                <Select defaultValue="monthly" value={clientType} onValueChange={setClientType}>
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

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="password">Password for Client</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password for client"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This password will be set for the client's account. They can change it later.
                </p>
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" type="button" asChild>
                  <Link href="/clients">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
