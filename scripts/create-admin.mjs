// Creates the first administrator (replaces the prototype's fixed seed account — IT notes
// item 8, decision P6). The account must change its passcode at first sign-in.
//
// Usage:  npm run create:admin
//   .env.local: FIRST_ADMIN_PASSWORD (≥ 6 characters, required)
//               FIRST_ADMIN_USERNAME (default "admin"), FIRST_ADMIN_NAME (default "Administrator")
// Refuses if the username is already taken. The password is never printed.
import { createClient } from '@supabase/supabase-js';
import { emailFor, MIN_PASSCODE } from '../lib/auth/constants.js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const password = process.env.FIRST_ADMIN_PASSWORD || '';
const username = (process.env.FIRST_ADMIN_USERNAME || 'admin').trim().toLowerCase();
const name = (process.env.FIRST_ADMIN_NAME || 'Administrator').trim();
if (!URL || !SECRET) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY.'); process.exit(2); }
if (password.length < MIN_PASSCODE) { console.error(`Set FIRST_ADMIN_PASSWORD (at least ${MIN_PASSCODE} characters) in .env.local.`); process.exit(2); }

const db = createClient(URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: taken } = await db.from('profiles').select('id').eq('username', username).maybeSingle();
if (taken) { console.error(`The username "${username}" already exists. Nothing was changed.`); process.exit(1); }

const { data, error } = await db.auth.admin.createUser({ email: emailFor(username), password, email_confirm: true });
if (error) { console.error('Could not create the auth user:', error.message); process.exit(1); }
const { error: profErr } = await db.from('profiles').insert({ id: data.user.id, username, name, role: 'admin', must_change: true });
if (profErr) {
  await db.auth.admin.deleteUser(data.user.id);
  console.error('Could not create the profile:', profErr.message);
  process.exit(1);
}
console.log(`Created administrator "${username}" (${name}). Sign in with FIRST_ADMIN_PASSWORD; a new passcode is required at first sign-in.`);
