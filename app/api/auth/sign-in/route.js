import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { emailFor } from '@/lib/auth/constants';
import { PROFILE_COLUMNS, json, toMe } from '@/lib/auth/server';

// Sign-in with the prototype's rules, in its order (Application Guide §4.1): unknown or disabled
// → invalid; locked → locked; wrong passcode → count, lock at the third; representative without
// an institution → refused; success → counter reset, forced change if required.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || '').trim().toLowerCase();
  const passcode = String(body.passcode || '');
  const admin = createAdminClient();

  const { data: p } = username
    ? await admin.from('profiles').select(PROFILE_COLUMNS).eq('username', username).eq('active', true).maybeSingle()
    : { data: null };
  if (!p) return json({ error: 'Invalid username or passcode.' }, 401);
  if (p.locked) return json({ error: 'Account locked. Contact an administrator to have a passcode reissued.' }, 423);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: emailFor(username), password: passcode });
  if (error) {
    if (error.code !== 'invalid_credentials') {
      // Rate limiting or an outage is not a wrong passcode: do not count it.
      return json({ error: 'Sign-in is unavailable at the moment. Try again shortly.' }, 503);
    }
    const failed = (p.failed_attempts || 0) + 1;
    const left = 3 - failed;
    await admin.from('profiles').update({ failed_attempts: failed, locked: left <= 0 }).eq('id', p.id);
    if (left <= 0) {
      return json({ error: 'Account locked after three failed attempts. Contact an administrator to have a passcode reissued.' }, 423);
    }
    return json({ error: `Invalid username or passcode. ${left} attempt${left === 1 ? '' : 's'} remaining before the account locks.` }, 401);
  }

  if (p.role === 'rep') {
    const { data: inst } = p.institution_id
      ? await admin.from('cases').select('id').eq('id', p.institution_id).maybeSingle()
      : { data: null };
    if (!inst) {
      await supabase.auth.signOut();
      return json({ error: 'This account is not linked to an institution. Contact an administrator.' }, 403);
    }
  }

  if (p.failed_attempts) await admin.from('profiles').update({ failed_attempts: 0 }).eq('id', p.id);
  return json({ me: toMe(p), mustChange: !!p.must_change, theme: p.theme });
}
