'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/middleware';
import { createClient as supabaseClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createClientRecord(formData: {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  clientType: string;
  accountantId: string;
  password?: string;
}) {
  try {
    const supabase = await supabaseClient();
    let clientUserId = null;

    // If email and password are provided, create the auth user first
    if (formData.email && formData.password) {
      try {
        // Create a service role client for admin operations
        const adminClient = createAdminClient();

        // Create the auth user first
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            role: 'client',
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        });

        if (authError) {
          console.error('Error creating user account:', authError);
          return {
            success: false,
            error: `Failed to create user account: ${authError.message}`,
          };
        }

        // Store the user ID for later use
        if (authUser.user) {
          clientUserId = authUser.user.id;
          console.log('User account created successfully');
        }
      } catch (userError) {
        console.error('Error creating user account:', userError);
        return {
          success: false,
          error: 'Failed to create user account',
        };
      }
    }

    // Insert the client with the user_id if available
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        accountant_id: formData.accountantId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: formData.companyName || `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        client_type: formData.clientType,
        user_id: clientUserId, // Use the stored user ID
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/clients');
    return { success: true, client };
  } catch (err) {
    console.error('Error creating client:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
