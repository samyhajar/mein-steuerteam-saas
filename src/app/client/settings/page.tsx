'use client';

import ClientSidebar from '@/components/dashboard/layout/client-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function ClientSettingsPage() {
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
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" defaultValue={clientData?.first_name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" defaultValue={clientData?.last_name} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={clientData?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue={clientData?.phone} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="document-notifications">Document Updates</Label>
                <Switch id="document-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="payment-notifications">Payment Reminders</Label>
                <Switch id="payment-notifications" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
