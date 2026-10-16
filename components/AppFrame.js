'use client';

import { useRouter } from 'next/navigation';
import { ORG_NAME } from '@/lib/config';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ThemeToggle';

const navBtn = { background: 'transparent', border: 0, padding: 0, cursor: 'pointer', color: 'inherit', fontSize: 13 };

// The signed-in frame shared by every staff and representative screen: sticky header,
// strapline, content column and footer. meLabel and isRep come from the session (M4).
export function AppFrame({ meLabel = '', isRep = false, onSignOut, children }) {
  const router = useRouter();
  const signOut = onSignOut || (() => router.push('/login'));
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15 }}>
      <div style={{ position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 20 }}>
        <div style={{ maxWidth: 1760, margin: '0 auto', padding: '0 clamp(16px,4vw,44px)' }}>
          <div style={{ padding: '15px 0 11px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 34px', borderBottom: '3px solid var(--color-text)' }}>
            <Wordmark size="sm" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginLeft: 'auto', alignItems: 'center', justifyContent: 'flex-end', fontSize: 13 }}>
              {!isRep ? (
                <>
                  <button type="button" onClick={() => router.push('/cases')} className="hv-color-accent" style={navBtn}>Cases</button>
                  <button type="button" onClick={() => router.push('/users')} className="hv-color-accent" style={navBtn}>Users</button>
                </>
              ) : null}
              <span style={{ color: 'var(--color-neutral-600)', fontSize: 12 }}>{meLabel}</span>
              <ThemeToggle />
              <button type="button" onClick={signOut} style={{ ...navBtn, color: 'var(--color-accent)' }}>Sign out</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 28px', padding: '6px 0 7px', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', borderBottom: '2px solid var(--brand-yellow)' }}>
            <span>Onboarding and periodic review</span>
            <span>Strictly confidential</span>
            <span style={{ marginLeft: 'auto' }}>All activity is recorded in the audit trail</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1760, margin: '0 auto', padding: 'clamp(24px,4vw,44px) clamp(16px,4vw,44px) 96px' }}>
        {children}
        <div style={{ marginTop: 72, borderTop: '2px solid var(--brand-yellow)', paddingTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{ORG_NAME} — Due Diligence Portal · Strictly confidential</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 5 }}>Access is restricted to authorised staff of Denham and Grey and all activity is recorded.</div>
        </div>
      </div>
    </div>
  );
}
