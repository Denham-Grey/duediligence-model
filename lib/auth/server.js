import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const PROFILE_COLUMNS = 'id, username, name, role, institution_id, active, locked, failed_attempts, must_change, theme';
export const ROLES = ['analyst', 'lead', 'admin', 'rep'];

export const json = (body, status = 200) => Response.json(body, { status });

// The signed-in user as the portal holds it (the prototype's `me`).
export function toMe(p) {
  return { id: p.id, name: p.name, role: p.role, username: p.username, institutionId: p.role === 'rep' ? p.institution_id : null };
}

// The prototype's user record, minus the passcode, for the Users screen.
export function toUser(p) {
  return {
    id: p.id, name: p.name, username: p.username, role: p.role, active: p.active,
    institutionId: p.institution_id, failed: p.failed_attempts, locked: p.locked, mustChange: p.must_change,
  };
}

export const isActive = (p) => !!p && p.active && !p.locked;

// The caller's session (from the cookies) and profile.
export async function getCaller() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await createAdminClient().from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle();
  return { supabase, user, profile };
}

// Admin-only routes: 401 signed out, 404 for representatives (do not confirm the route exists,
// IT notes 3.2), 403 for other staff.
export async function requireAdmin() {
  const caller = await getCaller();
  const p = caller.profile;
  if (!caller.user || !isActive(p)) return { error: json({ error: 'Your session has ended. Sign in again.' }, 401) };
  if (p.role === 'rep') return { error: json({ error: 'Not found.' }, 404) };
  if (p.role !== 'admin') return { error: json({ error: 'Account administration is restricted to administrators.' }, 403) };
  return { ...caller, admin: createAdminClient() };
}
