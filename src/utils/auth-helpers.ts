import { createClient } from '@/utils/supabase/server';

export async function getUserRole() {
  const supabase = await createClient();

  // Use getUser instead of getSession for improved security
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check user metadata for role
  const role = user.user_metadata?.role;

  // If no role in metadata, check database tables
  if (!role) {
    // Check if user is an accountant
    const { data: accountant } = await supabase
      .from('accountant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (accountant) {
      return 'accountant';
    }

    // Check if user is a client
    const { data: client } = await supabase.from('client_users').select('client_id').eq('user_id', user.id).single();

    if (client) {
      return 'client';
    }

    // Default to accountant for existing users without metadata
    return 'accountant';
  }

  return role;
}
