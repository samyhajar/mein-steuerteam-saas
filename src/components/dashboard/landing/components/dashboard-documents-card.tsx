import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export async function DashboardDocumentsCard() {
  const supabase = await createClient();

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // Get the user's profile
  const { data: profile } = await supabase
    .from('accountant_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!profile) {
    return null;
  }

  // First, get the client IDs
  const { data: clients } = await supabase.from('clients').select('id').eq('accountant_id', profile.id);

  // Extract the IDs into an array
  const clientIds = clients ? clients.map((client) => client.id) : [];

  // Get total document count for all clients
  let count = 0;
  if (clientIds.length > 0) {
    const { count: docCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('client_id', clientIds);

    count = docCount || 0;
  }

  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
          <span className={'text-xl font-medium'}>Documents ({count})</span>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/documents'}>Manage Documents</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6 @container'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/40 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-1">Einzahlungen</h3>
            <p className="text-sm text-muted-foreground">Manage client deposits</p>
          </div>
          <div className="bg-background/40 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-1">Ausgaben</h3>
            <p className="text-sm text-muted-foreground">Track expenditures</p>
          </div>
          <div className="bg-background/40 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-1">Bank Reports</h3>
            <p className="text-sm text-muted-foreground">Bank statements & reports</p>
          </div>
          <div className="bg-background/40 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-1">Sonstiges</h3>
            <p className="text-sm text-muted-foreground">Miscellaneous documents</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
