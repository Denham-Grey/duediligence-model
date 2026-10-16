import { getCaller, isActive, json, toMe } from '@/lib/auth/server';

// The current session, so a reload keeps the user signed in (replaces the prototype's saved session).
export async function GET() {
  const { user, profile } = await getCaller();
  if (!user || !isActive(profile)) return json({ me: null });
  return json({ me: toMe(profile), mustChange: !!profile.must_change, theme: profile.theme });
}

// The user's own theme (decision P4). RLS allows a user to change only their own theme.
export async function PATCH(request) {
  const { supabase, user, profile } = await getCaller();
  if (!user || !isActive(profile)) return json({ error: 'Your session has ended. Sign in again.' }, 401);
  const { theme } = await request.json().catch(() => ({}));
  if (theme !== 'light' && theme !== 'dark') return json({ error: 'Unknown theme.' }, 400);
  const { error } = await supabase.from('profiles').update({ theme }).eq('id', user.id);
  if (error) return json({ error: 'The theme could not be saved.' }, 500);
  return json({ ok: true });
}
