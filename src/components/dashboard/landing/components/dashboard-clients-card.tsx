import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export async function DashboardClientsCard() {
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

  // Get recent clients (limited to 5)
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('accountant_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get total client count
  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('accountant_id', profile.id);

  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
          <span className={'text-xl font-medium'}>Clients ({count || 0})</span>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/clients'}>View all</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6 @container'}>
        {clients && clients.length > 0 ? (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-muted-foreground">{client.email}</div>
                </div>
                <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-900">
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">You don't have any clients yet.</p>
            <Button asChild={true} size="sm" variant="default">
              <Link href="/clients/add">Add Your First Client</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
