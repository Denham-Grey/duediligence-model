import { Placeholder } from '@/components/Placeholder';
import { Wordmark } from '@/components/Wordmark';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '56px 7vw 88px', maxWidth: 1180, background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15 }}>
      <div style={{ marginBottom: 60 }}>
        <div style={{ display: 'inline-block' }}>
          <Wordmark size="lg" />
        </div>
        <div style={{ display: 'flex', marginTop: 14 }}><ThemeToggle /></div>
      </div>
      <Placeholder kicker="Sign in" title="Authorised personnel" note="The sign-in form is ported in M2 and connected to Supabase Auth in M4." />
    </div>
  );
}
