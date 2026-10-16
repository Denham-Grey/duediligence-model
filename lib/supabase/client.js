'use client';

import { createBrowserClient } from '@supabase/ssr';

// Browser client. The session lives in cookies (set by @supabase/ssr), never in localStorage.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
