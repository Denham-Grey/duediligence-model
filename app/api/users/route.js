import { emailFor, MIN_PASSCODE } from '@/lib/auth/constants';
import { PROFILE_COLUMNS, ROLES, getCaller, isActive, json, requireAdmin, toUser } from '@/lib/auth/server';

// The accounts list (Users screen). Row Level Security decides what the caller sees: staff see
// every account, a representative only their own.
export async function GET() {
  const { supabase, user, profile } = await getCaller();
  if (!user || !isActive(profile)) return json({ error: 'Your session has ended. Sign in again.' }, 401);
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).order('created_at');
  if (error) return json({ error: 'The accounts could not be loaded.' }, 500);
  return json({ users: data.map(toUser) });
}

// Add user (admin only): as the prototype's addUser — name, username (stored lowercase), role,
// institution for representatives, a temporary passcode, and a forced change at first sign-in.
export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const username = String(body.username || '').trim().toLowerCase();
  const role = String(body.role || '');
  const passcode = String(body.passcode || '');
  const institutionId = role === 'rep' ? Number(body.institutionId) || null : null;

  if (!name || !username) return json({ error: 'Name and username are required.' }, 400);
  if (!/^[a-z0-9._-]+$/.test(username)) return json({ error: 'Use letters, numbers, dots, dashes or underscores in the username.' }, 400);
  if (!ROLES.includes(role)) return json({ error: 'Unknown role.' }, 400);
  if (role === 'rep' && !institutionId) return json({ error: 'Select the institution this representative belongs to.' }, 400);
  if (passcode.trim().length < MIN_PASSCODE) return json({ error: 'The temporary passcode must be at least six characters.' }, 400);

  const { data: taken } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
  if (taken) return json({ error: `The username "${username}" is already in use.` }, 409);
  if (institutionId) {
    const { data: inst } = await admin.from('cases').select('id').eq('id', institutionId).maybeSingle();
    if (!inst) return json({ error: 'That institution is not in the database.' }, 400);
  }

  const { data: created, error: authErr } = await admin.auth.admin.createUser({ email: emailFor(username), password: passcode, email_confirm: true });
  if (authErr) {
    return json({ error: authErr.code === 'email_exists' ? `The username "${username}" is already in use.` : 'The account could not be created.' }, authErr.code === 'email_exists' ? 409 : 500);
  }
  const { data: p, error: profErr } = await admin.from('profiles')
    .insert({ id: created.user.id, username, name, role, institution_id: institutionId, active: true, locked: false, failed_attempts: 0, must_change: true })
    .select(PROFILE_COLUMNS).single();
  if (profErr) {
    await admin.auth.admin.deleteUser(created.user.id); // no half-created accounts
    return json({ error: 'The account could not be created.' }, 500);
  }
  return json({ user: toUser(p) }, 201);
}
