import { Placeholder } from '@/components/Placeholder';
import { Wordmark } from '@/components/Wordmark';

export default function ChangePasscodePage() {
  return (
    <div style={{ minHeight: '100vh', padding: '56px 7vw 88px', maxWidth: 1180, background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15 }}>
      <div style={{ display: 'inline-block', marginBottom: 64 }}><Wordmark size="md" /></div>
      <Placeholder kicker="Passcode change required" title="Set a new passcode" />
    </div>
  );
}
