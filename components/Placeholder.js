// Temporary page body used by the M1 route skeleton; each one is replaced by its screen in M2.
export function Placeholder({ kicker, title, note }) {
  return (
    <div>
      <div style={{ width: 64, height: 4, background: 'var(--brand-yellow)', marginBottom: 14 }}></div>
      {kicker ? <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{kicker}</div> : null}
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 34, letterSpacing: '-0.012em', lineHeight: 1.04, marginTop: 6 }}>{title}</div>
      <p style={{ margin: '8px 0 0', color: 'var(--color-neutral-700)', maxWidth: '80ch' }}>{note || 'This screen is ported in milestone M2.'}</p>
    </div>
  );
}
