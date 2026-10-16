'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ENFORCE_JUSTIFICATION, ORG_NAME, REPORTING_YEAR, SHOW_GUIDANCE } from '@/lib/config';
import { Component as PortalApp } from './PortalApp';

// Hands the address and router to the portal (a class component) together with the settings
// that were the prototype's editor properties.
export function PortalShell() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <PortalApp
      pathname={pathname}
      router={router}
      orgName={ORG_NAME}
      reportingYear={REPORTING_YEAR}
      showGuidance={SHOW_GUIDANCE}
      enforceJustification={ENFORCE_JUSTIFICATION}
    />
  );
}
