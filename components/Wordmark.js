// DENHAM + GREY wordmark at the three sizes the prototype uses.
const SIZES = {
  // sign-in screen
  lg: { word: 30, box: 27, plus: 21, gap: 12, tracking: '0.01em', sub: 11, subTop: 11 },
  // passcode-change screen
  md: { word: 21, box: 20, plus: 16, gap: 9, tracking: '0.02em', sub: 8, subTop: 8 },
  // app header
  sm: { word: 16, box: 16, plus: 13, gap: 7, tracking: '0.02em', sub: 8, subTop: 4 },
};

const LETTERS = ['D', 'u', 'e', ' ', 'D', 'i', 'l', 'i', 'g', 'e', 'n', 'c', 'e'];

export function Wordmark({ size = 'sm' }) {
  const s = SIZES[size];
  const word = { fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: s.word, letterSpacing: s.tracking, lineHeight: 1 };
  const mark = (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      <span style={word}>DENHAM</span>
      <span style={{ width: s.box, height: s.box, background: 'var(--brand-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: s.plus, lineHeight: 1, color: 'var(--on-yellow)' }}>+</span>
      <span style={word}>GREY</span>
    </div>
  );
  if (size === 'sm') {
    return (
      <div>
        {mark}
        <div style={{ fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', marginTop: 4 }}>Due Diligence</div>
      </div>
    );
  }
  return (
    <>
      {mark}
      <div style={{ marginTop: s.subTop, display: 'flex', justifyContent: 'space-between', fontSize: s.sub, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>
        {LETTERS.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </>
  );
}
