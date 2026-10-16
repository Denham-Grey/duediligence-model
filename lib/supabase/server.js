import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Server client acting as the signed-in user, so Row Level Security applies.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      // SameSite=Lax always, Secure in production (IT notes 3.1). HttpOnly is not possible: the
      // browser-side Supabase client reads the session from these cookies (@supabase/ssr design).
      cookieOptions: { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only; the proxy refreshes the session.
          }
        },
      },
    },
  );
}
