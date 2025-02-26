'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface FormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  companyName?: string;
}

export async function signup(data: FormData) {
  const supabase = await createClient();

  // First, sign up the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        // Add user metadata to be displayed in the Auth UI
        display_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        company: data.companyName,
      },
    },
  });

  if (authError) {
    return { error: true, errorMessage: authError.message };
  }

  // If signup was successful and we have a user ID, update their phone number
  if (authData?.user) {
    try {
      // Get the service role key - make sure it's defined
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is not defined');
        return { error: true, errorMessage: 'Server configuration error' };
      }

      // Create a supabase client with the service role to bypass RLS
      const supabaseAdmin = await createClient(process.env.SUPABASE_SERVICE_ROLE_KEY);

      // Update the phone number in auth.users table
      if (data.phoneNumber) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
          phone: data.phoneNumber,
        });

        if (updateError) {
          console.error('Phone update error:', updateError);
        }
      }

      // Store the profile information in your custom table
      const { error: profileError } = await supabaseAdmin.from('accountant_profiles').insert({
        user_id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        company_name: data.companyName,
      });

      if (profileError) {
        console.error('Profile insertion error:', profileError);
        return { error: true, errorMessage: profileError.message };
      }
    } catch (err) {
      console.error('Error during profile creation:', err);
      return { error: true, errorMessage: 'Failed to create profile' };
    }
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
