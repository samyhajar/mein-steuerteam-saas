'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createClientAccess(clientId: string, email: string, password: string) {
  try {
    const supabase = await createClient();

    // Create a new user in auth.users
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !user) {
      return { success: false, error: authError?.message || 'Failed to create user' };
    }

    // Create the client_users entry to link the client to the user
    const { error: clientUserError } = await supabase.from('client_users').insert({
      user_id: user.id,
      client_id: clientId,
    });

    if (clientUserError) {
      return { success: false, error: clientUserError.message };
    }

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Server error occurred' };
  }
}
