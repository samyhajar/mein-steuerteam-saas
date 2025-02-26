import { createClient } from '@/utils/supabase/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the current URL path
  const path = request.nextUrl.pathname;

  // If no session and trying to access protected routes, redirect to login
  if (!session && (path.startsWith('/dashboard') || path.startsWith('/clients') || path.startsWith('/client'))) {
    const redirectUrl = new URL('/auth/sign-in', request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in but on auth page, redirect to appropriate dashboard
  if (session && (path.startsWith('/auth/') || path === '/')) {
    const role = session.user.user_metadata?.role;

    // Redirect based on role
    if (role === 'client') {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    } else {
      // Default to accountant dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If client trying to access accountant pages or vice versa
  if (session) {
    const role = session.user.user_metadata?.role;

    if (role === 'client' && (path.startsWith('/dashboard') || path.startsWith('/clients'))) {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }

    if (role !== 'client' && path.startsWith('/client/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
