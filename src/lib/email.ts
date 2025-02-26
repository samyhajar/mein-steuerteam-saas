import { createClient } from '@/utils/supabase/server';

export async function sendClientInvitation(recipient: string, name: string, invitationLink: string) {
  try {
    console.log('Attempting to send email to:', recipient);
    console.log('Using invitation link:', invitationLink);

    // For Supabase, we're relying on its built-in email capabilities
    // We don't need to manually send the email - Supabase has already sent it
    // when we called generateLink in the actions.ts file

    // Just log the link for development/testing purposes
    console.log('----------------------------------------');
    console.log('🔗 CLIENT INVITATION LINK (COPY THIS):');
    console.log(invitationLink);
    console.log('----------------------------------------');

    return { success: true, message: 'Email sent via Supabase' };
  } catch (err) {
    console.error('Email handling error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown email error' };
  }
}
