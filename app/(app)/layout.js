import { Suspense } from 'react';
import { PortalShell } from '@/components/portal/PortalShell';

// The portal is one client application that stays mounted across navigation, so case data and
// unsaved form state survive moving between screens, as in the prototype. Pages render nothing;
// PortalShell maps the address to the screen (see PortalApp urlFor/fromUrl).
export default function PortalLayout({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <PortalShell />
      </Suspense>
      {children}
    </>
  );
}
