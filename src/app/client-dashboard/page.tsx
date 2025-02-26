import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ClientDashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/client-login');
  }

  // Get the client user profile
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('*, clients(*)')
    .eq('user_id', session.user.id)
    .single();

  if (!clientUser) {
    return <div>Profile not found</div>;
  }

  // Get client's documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', clientUser.client_id)
    .order('created_at', { ascending: false });

  // Count documents by category
  const documentCounts = {
    einzahlungen: 0,
    ausgaben: 0,
    bank_reports: 0,
    sonstiges: 0,
  };

  documents?.forEach((doc) => {
    if (doc.category in documentCounts) {
      documentCounts[doc.category as keyof typeof documentCounts]++;
    }
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {clientUser.clients?.name}</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/client-dashboard/documents/einzahlungen" className="block p-4 bg-background/40 rounded-md">
                <h3 className="text-lg font-medium mb-1">Einzahlungen</h3>
                <p className="text-sm text-muted-foreground">
                  {documentCounts.einzahlungen} document{documentCounts.einzahlungen !== 1 ? 's' : ''}
                </p>
              </Link>
              <Link href="/client-dashboard/documents/ausgaben" className="block p-4 bg-background/40 rounded-md">
                <h3 className="text-lg font-medium mb-1">Ausgaben</h3>
                <p className="text-sm text-muted-foreground">
                  {documentCounts.ausgaben} document{documentCounts.ausgaben !== 1 ? 's' : ''}
                </p>
              </Link>
              <Link href="/client-dashboard/documents/bank_reports" className="block p-4 bg-background/40 rounded-md">
                <h3 className="text-lg font-medium mb-1">Bank Reports</h3>
                <p className="text-sm text-muted-foreground">
                  {documentCounts.bank_reports} document{documentCounts.bank_reports !== 1 ? 's' : ''}
                </p>
              </Link>
              <Link href="/client-dashboard/documents/sonstiges" className="block p-4 bg-background/40 rounded-md">
                <h3 className="text-lg font-medium mb-1">Sonstiges</h3>
                <p className="text-sm text-muted-foreground">
                  {documentCounts.sonstiges} document{documentCounts.sonstiges !== 1 ? 's' : ''}
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Account Type</dt>
                <dd className="font-medium capitalize">{clientUser.clients?.client_type || 'Monthly'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="font-medium">{session.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="font-medium">{clientUser.clients?.phone || 'Not provided'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
