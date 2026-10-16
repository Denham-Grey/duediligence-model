import { Cormorant_Garamond } from 'next/font/google';
import '@/styles/broadsheet.css';
import '@/styles/portal.css';

// Self-hosted at build time by next/font: the browser never contacts Google (IT notes item 7).
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const metadata = {
  title: 'Due Diligence Portal — Denham + Grey',
  description: 'Onboarding and periodic review of partner financial institutions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body>{children}</body>
    </html>
  );
}
