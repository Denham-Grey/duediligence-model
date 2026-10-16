import { AppFrame } from '@/components/AppFrame';

// Staff screens. From M4 the signed-in user (name, role) is read here inside a Suspense
// boundary, as Cache Components requires for session reads.
export default function StaffLayout({ children }) {
  return <AppFrame>{children}</AppFrame>;
}
