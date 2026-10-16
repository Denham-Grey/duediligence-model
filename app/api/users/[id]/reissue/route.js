import { randomInt } from 'node:crypto';
import { json, requireAdmin } from '@/lib/auth/server';

// "Reissue passcode" / "Unlock and reissue" (admin only): a random code, shown once to the admin,
// unlocks the account, clears the failed attempts and forces a change at the next sign-in.
// Six digits instead of the prototype's four (decision P1).
export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;
  const { id } = await params;

  const { data: p } = await admin.from('profiles').select('id').eq('id', id).maybeSingle();
  if (!p) return json({ error: 'Not found.' }, 404);

  const code = String(randomInt(100000, 1000000));
  const { error } = await admin.auth.admin.updateUserById(id, { password: code });
  if (error) return json({ error: 'The passcode could not be reissued.' }, 500);
  await admin.from('profiles').update({ locked: false, failed_attempts: 0, must_change: true }).eq('id', id);
  return json({ code });
}
