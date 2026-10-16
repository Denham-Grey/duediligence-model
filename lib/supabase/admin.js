import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Service-role client for the few server routes that must bypass RLS: sign-in with lockout,
// creating users and reissuing passcodes. Never import this from client code.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
