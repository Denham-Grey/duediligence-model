import { createAdminClient } from '@/lib/supabase/admin';
import { MIN_PASSCODE, MIN_PASSCODE_MESSAGE } from '@/lib/auth/constants';
import { getCaller, isActive, json, toMe } from '@/lib/auth/server';

// The forced passcode change (Application Guide §4.2), for the signed-in user. Same rules and
// messages as the prototype, with the six-character minimum (decision P1).
export async function POST(request) {
  const { supabase, user, profile } = await getCaller();
  if (!user || !isActive(profile)) return json({ error: 'Your session has ended. Sign in again.' }, 401);

  const body = await request.json().catch(() => ({}));
  const a = String(body.passcode || '').trim();
  const b = String(body.confirm || '').trim();
  if (a.length < MIN_PASSCODE) return json({ error: MIN_PASSCODE_MESSAGE }, 400);
  if (a !== b) return json({ error: 'The two entries do not match.' }, 400);

  const { error } = await supabase.auth.updateUser({ password: a });
  if (error) {
    if (error.code === 'same_password') return json({ error: 'Choose a passcode different from the one you were issued.' }, 400);
    if (error.code === 'weak_password') return json({ error: MIN_PASSCODE_MESSAGE }, 400);
    return json({ error: 'The passcode could not be changed. Try again.' }, 500);
  }
  await createAdminClient().from('profiles').update({ must_change: false }).eq('id', user.id);
  return json({ me: toMe(profile), theme: profile.theme });
}
