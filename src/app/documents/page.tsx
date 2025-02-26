'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DocumentsRedirector() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUserRole() {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in, redirect to login
        redirect('/login');
        return;
      }

      // Check if user is an accountant
      const { data: accountant } = await supabase
        .from('accountant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (accountant) {
        // User is an accountant
        redirect('/accountant/documents');
        return;
      }

      // Check if user is a client
      const { data: client } = await supabase.from('clients').select('id').eq('user_id', user.id).single();

      if (client) {
        // User is a client
        redirect('/client/documents');
        return;
      }

      // If we get here, user doesn't have a valid role
      redirect('/dashboard');
    }

    checkUserRole();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Skeleton className="h-8 w-64 mb-6 mx-auto" />
        <p>Redirecting to your document page...</p>
      </div>
    </div>
  );
}
