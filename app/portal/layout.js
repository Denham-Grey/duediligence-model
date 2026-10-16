import { AppFrame } from '@/components/AppFrame';

// Partner Institution Representative screens: no Cases/Users links.
export default function PortalLayout({ children }) {
  return <AppFrame isRep>{children}</AppFrame>;
}
