// Shared by the server routes and the browser.
// Accounts are Supabase Auth users with an internal email the user never sees (plan §3.4).
export const EMAIL_DOMAIN = 'users.dd-portal.invalid';
export const emailFor = (username) => `${String(username).trim().toLowerCase()}@${EMAIL_DOMAIN}`;

// Decision P1: Supabase Auth requires at least 6 characters (the prototype allowed 4).
export const MIN_PASSCODE = 6;
export const MIN_PASSCODE_MESSAGE = 'Use at least six characters.';

// 30 minutes without activity signs the user out (IT notes 3.1).
export const IDLE_LIMIT_MS = 30 * 60 * 1000;
